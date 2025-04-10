export enum MenuCategory {
  Pizza = 'pizza',
  Drink = 'drink',
  Side = 'side',
  Topping = 'topping'
}

export interface MenuItem {
  id: string;
  category: MenuCategory;
  name: string;
  description: string;
  price: number;
}
