import { MenuItem } from './menu-item';

export enum OrderStatus {
  Pending = 'pending',
  InPreparation = 'in-preparation',
  Ready = 'ready',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  childItems?: OrderChildItem[]; // Child menu items, e.g. toppings for pizzas
}

export interface OrderChildItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string; // ISO date string
  items: OrderItem[];
  estimatedCompletionAt: string; // ISO date string for estimated completion time
  totalPrice: number;
  status: OrderStatus;
}
