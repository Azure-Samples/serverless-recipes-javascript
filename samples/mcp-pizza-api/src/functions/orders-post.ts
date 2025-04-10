import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DbService } from '../data/db-service';
import { OrderStatus, type OrderItem, type OrderChildItem } from '../data/order';
import { MenuCategory } from '../data/menu-item';

interface CreateOrderRequest {
  items: {
    menuItemId: string;
    quantity: number;
    childItems?: {
      menuItemId: string;
      quantity: number;
    }[];
  }[];
}

app.http('orders-post', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'orders',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    try {
      const dbService = DbService.getInstance();
      const requestBody = await request.json() as CreateOrderRequest;

      if (!requestBody.items || !Array.isArray(requestBody.items) || requestBody.items.length === 0) {
        return {
          status: 400,
          jsonBody: { error: 'Order must contain at least one item' }
        };
      }

      // Convert request items to order items
      const orderItems: OrderItem[] = [];
      let totalPrice = 0;

      for (const item of requestBody.items) {
        const menuItem = dbService.getMenuItem(item.menuItemId);
        if (!menuItem) {
          return {
            status: 400,
            jsonBody: { error: `Menu item with ID ${item.menuItemId} not found` }
          };
        }

        let itemPrice = menuItem.price * item.quantity;
        const childItems: OrderChildItem[] = [];

        // Process child items (toppings)
        if (item.childItems && item.childItems.length > 0) {
          // Only pizza items can have toppings as child items
          if (menuItem.category !== MenuCategory.Pizza) {
            return {
              status: 400,
              jsonBody: {
                error: `Child items (toppings) can only be added to pizza items. Item ${menuItem.name} is not a pizza.`
              }
            };
          }

          for (const childItem of item.childItems) {
            const childMenuItem = dbService.getMenuItem(childItem.menuItemId);

            if (!childMenuItem) {
              return {
                status: 400,
                jsonBody: { error: `Child menu item with ID ${childItem.menuItemId} not found` }
              };
            }

            // Validate that the child item is a topping
            if (childMenuItem.category !== MenuCategory.Topping) {
              return {
                status: 400,
                jsonBody: {
                  error: `Child item ${childMenuItem.name} must be a topping, not ${childMenuItem.category}`
                }
              };
            }

            // Add child item price to the total price
            const childItemPrice = childMenuItem.price * childItem.quantity;
            itemPrice += childItemPrice * item.quantity;

            // Add to child items list
            childItems.push({
              menuItem: childMenuItem,
              quantity: childItem.quantity
            });
          }
        }

        totalPrice += itemPrice;
        orderItems.push({
          menuItem,
          quantity: item.quantity,
          childItems: childItems.length > 0 ? childItems : undefined
        });
      }

      // Calculate estimated completion time (30 minutes from now)
      const now = new Date();
      const estimatedCompletionAt = new Date(now.getTime() + 30 * 60000); // 30 minutes in milliseconds

      // Create the order
      const order = dbService.createOrder({
        createdAt: now.toISOString(),
        items: orderItems,
        estimatedCompletionAt: estimatedCompletionAt.toISOString(),
        totalPrice,
        status: OrderStatus.Pending
      });

      return {
        status: 201,
        jsonBody: order
      };
    } catch (error) {
      context.error('Error creating order:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});
