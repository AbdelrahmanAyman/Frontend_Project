export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'delivery';
  photo?: string;
}

export interface MenuItemSize {
  label: string;
  price: number;
}

export interface MenuItemTopping {
  name: string;
  price: number;
}

export interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable?: boolean;
  size?: string;
  ingredients?: string[];
  sizes?: MenuItemSize[];
  toppings?: MenuItemTopping[];
}

export interface OrderItem {
  name: string;
  size: string;
  toppings?: string[];
  qty: number;
  price: number;
}

export interface Order {
  _id: string;
  status: 'confirmed' | 'preparing' | 'baking' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  total: number;
  eta?: string;
  step?: number;
  address?: string;
  payment?: string;
  items: OrderItem[];
  user?: { _id: string; name: string; email: string };
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  activeOrders: number;
}

export interface AuthResponse {
  token: string;
  data?: { user: User };
  user?: User;
}