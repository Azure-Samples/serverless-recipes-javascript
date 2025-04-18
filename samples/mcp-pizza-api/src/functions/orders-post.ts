import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DbService } from '../db-service';
import { OrderStatus, type OrderItem } from '../order';

interface CreateOrderRequest {
  userId: string;
  items: {
    pizzaId: string;
    quantity: number;
    extraToppingIds?: string[];
  }[];
}

app.http('orders-post', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'orders',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    context.log('Processing order creation request...');
    
    try {
      const dataService = await DbService.getInstance();
      const requestBody = await request.json() as CreateOrderRequest;
      context.log('Request body:', requestBody);

      // Validate userId is provided
      if (!requestBody.userId) {
        return {
          status: 400,
          jsonBody: { error: 'userId is required' }
        };
      }

      if (!requestBody.items || !Array.isArray(requestBody.items) || requestBody.items.length === 0) {
        return {
          status: 400,
          jsonBody: { error: 'Order must contain at least one pizza' }
        };
      }

      // Convert request items to order items
      const orderItems: OrderItem[] = [];
      let totalPrice = 0;

      for (const item of requestBody.items) {
        const pizza = await dataService.getPizza(item.pizzaId);
        if (!pizza) {
          return {
            status: 400,
            jsonBody: { error: `Pizza with ID ${item.pizzaId} not found` }
          };
        }

        // Validate and calculate price for extra toppings
        let extraToppingsPrice = 0;
        if (item.extraToppingIds && item.extraToppingIds.length > 0) {
          for (const toppingId of item.extraToppingIds) {
            const topping = await dataService.getTopping(toppingId);
            if (!topping) {
              return {
                status: 400,
                jsonBody: { error: `Topping with ID ${toppingId} not found` }
              };
            }
            extraToppingsPrice += topping.price;
          }
        }

        const itemPrice = (pizza.price + extraToppingsPrice) * item.quantity;
        totalPrice += itemPrice;
        
        orderItems.push({
          pizzaId: item.pizzaId,
          quantity: item.quantity,
          extraToppingIds: item.extraToppingIds
        });
      }

      // Calculate estimated completion time (30 minutes from now)
      const now = new Date();
      const estimatedCompletionAt = new Date(now.getTime() + 30 * 60000); // 30 minutes in milliseconds

      // Create the order
      const order = await dataService.createOrder({
        userId: requestBody.userId,
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
