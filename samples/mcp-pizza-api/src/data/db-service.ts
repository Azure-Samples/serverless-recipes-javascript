import { MenuCategory, MenuItem } from './menu-item';
import { Order, OrderStatus } from './order';
import menuItemsData from './menu-items.json';

// Mock database service for our pizza API
export class DbService {
  private static instance: DbService;
  private menuItems: MenuItem[] = [];
  private orders: Order[] = [];

  private constructor() {
    this.initializeMenuItems();
  }

  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  // Menu Items methods
  public getMenuItems(): MenuItem[] {
    return [...this.menuItems];
  }

  public getPizzaItems(): MenuItem[] {
    return this.menuItems.filter(item => item.category === MenuCategory.Pizza);
  }

  public getToppingItems(): MenuItem[] {
    return this.menuItems.filter(item => item.category === MenuCategory.Topping);
  }

  public getMenuItem(id: string): MenuItem | undefined {
    return this.menuItems.find(item => item.id === id);
  }

  // Orders methods
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrder(id: string): Order | undefined {
    return this.orders.find(order => order.id === id);
  }

  public createOrder(order: Omit<Order, 'id'>): Order {
    const id = Date.now().toString(); // Simple ID generation
    const newOrder: Order = {
      ...order,
      id
    };

    this.orders.push(newOrder);
    return newOrder;
  }

  public cancelOrder(id: string): Order | undefined {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return undefined;
    }

    const order = this.orders[orderIndex];
    if (order.status !== OrderStatus.Pending) {
      return undefined;
    }

    const updatedOrder = { ...order, status: OrderStatus.Cancelled };
    this.orders[orderIndex] = updatedOrder;
    return updatedOrder;
  }

  // Initialize mock data from JSON file
  private initializeMenuItems(): void {
    // Convert JSON data to strongly typed MenuItem objects
    this.menuItems = menuItemsData.map(item => ({
      ...item,
      category: item.category as MenuCategory
    }));
  }
}
