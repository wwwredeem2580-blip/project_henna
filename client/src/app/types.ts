export interface Design {
  id: string;
  title: string;
  category: string;
  images: string[];
  description: string;
  price: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  qrCode: string;
  instruction?: string;
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
  variantImages?: Record<string, string>;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  phone: string;
  location: string;
  locationType: 'artist_location' | 'user_location';
  eventType: string;
  people: string;
  info: string;
  time: string;
  endTime?: string;
  status: BookingStatus;
  designId?: string;
  designs?: { personIndex: number; designId: string }[];
  extraFee?: number;
  prepaymentAmount?: number;
  paymentMethodId?: string;
  transactionId?: string;
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface AvailabilitySettings {
  availableDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // e.g. "12:30"
  endTime: string; // e.g. "22:00"
  travelFee: number;
  prepaymentAmount: number;
  paymentMethods: PaymentMethod[];
  blockedSlots: BlockedSlot[];
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
export interface Story {
  id: string;
  title: string;
  thumbnail: string;
  type: "image" | "video";
  contentUrl: string;
  link?: string;
  linkText?: string;
}
