export interface Design {
  id: string;
  title: string;
  category: string;
  images: string[];
  description: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  sizes?: string[];
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export type BookingStatus = "pending" | "accepted" | "rejected" | "completed";

export interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  phone: string;
  location: string;
  eventType: string;
  people: string;
  info: string;
  status: BookingStatus;
  designId?: string;
  createdAt: string;
}

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}
