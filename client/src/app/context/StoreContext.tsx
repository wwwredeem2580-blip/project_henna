"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Design, Product, CartItem, Booking, Order, BookingStatus, OrderStatus, AvailabilitySettings } from '../types';

const INITIAL_DESIGNS: Design[] = [
  { id: "2", title: "Flower Bouquet Design", category: "Contemporary", images: ["/images/mehendi_design_002.png"], description: "Clean lines and geometric shapes for the modern bride who appreciates subtle elegance.", price: 120 },
  { id: "1", title: "Dynamic Mosque with Sunrise Design", category: "Traditional", images: ["/images/mehendi_design_001.png"], description: "Intricate patterns inspired by Mughal architecture, featuring detailed peacocks and floral motifs.", price: 150 },
  { id: "3", title: "Arabic Style Design", category: "Fusion", images: ["/images/mehendi_design_003.png"], description: "Bold Arabic strokes mixed with traditional Indian fillers for a striking, high-contrast look.", price: 200 },
];

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: "p1", 
    name: "Organic Henna Cone", 
    brand: "Ria’s Henna Artistry", 
    price: 120, 
    originalPrice: 150,
    images: [
      "/images/Henna_Cone.png",
      "/images/Henna_200gV2.png",
      "/images/Henna_1000gV2.png"
    ], 
    category: "Henna Cone",
    description: "Our signature organic henna cone is crafted with the finest Rajasthani henna powder, essential oils, and lemon juice. It provides a rich, deep stain that lasts for weeks. Perfect for intricate bridal designs.",
    sizes: [
      { size: "100g", price: 120 },
      { size: "200g", price: 230 },
      { size: "1kg", price: 950 }
    ],
    variantImages: {
      "100g": "/images/Henna_Cone.png",
      "200g": "/images/Henna_Cone.png",
      "1kg": "/images/Henna_Cone.png"
    },
    stock: 150
  },
  { 
    id: "p2", 
    name: "Henna Oil (30ml)", 
    brand: "Pure Essence", 
    price: 180, 
    originalPrice: 200,
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop"
    ], 
    category: "Henna Oil",
    description: "Infused with eucalyptus and tea tree oils, this henna oil helps darken the stain and keeps the skin hydrated. Apply before and after mehendi application for the best results.",
    stock: 85
  },
  { 
    id: "p3", 
    name: "Herbal Hair Mask", 
    brand: "Naturals", 
    price: 240, 
    images: [
      "/images/Henna_100gV2.png",
      "/images/Henna_200gV2.png",
    ],
    sizes: [
      { size: "100g", price: 240 },
      { size: "200g", price: 450 }
    ],
    variantImages: {
      "100g": "/images/Henna_100gV2.png",
      "200g": "/images/Henna_200gV2.png",
    },
    category: "Hair Mask",
    description: "A nourishing blend of amla, reetha, and shikakai. This herbal hair mask strengthens the roots, prevents hair fall, and adds a natural shine to your tresses.",
    stock: 42
  },
];

interface StoreContextType {
  designs: Design[];
  products: Product[];
  bookings: Booking[];
  orders: Order[];
  cart: CartItem[];
  isLoggedIn: boolean;
  availabilitySettings: AvailabilitySettings;
  cartCount: number;
  selectedDesign: Design | null;
  
  setDesigns: React.Dispatch<React.SetStateAction<Design[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setAvailabilitySettings: React.Dispatch<React.SetStateAction<AvailabilitySettings>>;
  setSelectedDesign: React.Dispatch<React.SetStateAction<Design | null>>;
  
  handleAddToCart: (product: Product, selectedSize?: string) => void;
  handleUpdateQuantity: (id: string, delta: number, selectedSize?: string) => void;
  handleRemoveFromCart: (id: string, selectedSize?: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [designs, setDesigns] = useState<Design[]>(INITIAL_DESIGNS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>({
    availableDays: [0, 5, 6], // Sun, Fri, Sat
    startTime: "12:30",
    endTime: "22:00",
    travelFee: 500,
    prepaymentAmount: 500,
    paymentMethods: [
      { id: "1", name: "bKash", qrCode: "/images/bkash_qr_placeholder.png", instruction: "Send money to our bKash merchant account." },
      { id: "2", name: "Nagad", qrCode: "/images/bkash_qr_placeholder.png", instruction: "Send money to our Nagad personal account." },
      { id: "3", name: "Rocket", qrCode: "/images/bkash_qr_placeholder.png", instruction: "Send money to our Rocket personal account." }
    ],
    blockedSlots: [],
    tourItems: [
      { id: "1", title: "Free Delivery", subtitle: "Boishakhi Special Offer", category: "Offer", description: "এই বৈশাখী অফারে সারাদেশে ডেলিভারি চার্জ ফ্রি。", image: "/images/boishakhi_offer.png", order: 1 },
      { id: "2", title: "Grand Bridal Legacy", subtitle: "Traditional Wedding Artistry", category: "Weddings", description: "Experience the timeless beauty of traditional bridal henna, crafted with precision and passion.", image: "/tour/wedding.png", order: 2 },
      { id: "3", title: "Boishakhi Street Fest", subtitle: "A Celebration of Colors", category: "Festivals", description: "Vibrant and energetic designs inspired by the spirit of Boishakh celebrations.", image: "/tour/fest.png", order: 3 },
      { id: "4", title: "Corporate Elegance", subtitle: "Minimalist Professional Sessions", category: "Corporate", description: "Sophisticated and clean patterns perfect for professional environments and events.", image: "/tour/corporate.png", order: 4 },
      { id: "5", title: "Ria’s Personal Journey", subtitle: "A Muse to Henna Art", category: "Legacy", description: "A peek into the artistic evolution of Ria’s Henna Artistry over a decade.", image: "/tour/legacy.png", order: 5 },
    ],
    productCategories: [
      { id: "cat1", name: "Henna Cone", image: "/images/Henna_Cone.png" },
      { id: "cat2", name: "Henna Powder", image: "/images/Henna_100g.png" },
      { id: "cat3", name: "Henna Oil", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop" },
      { id: "cat4", name: "Hair Mask", image: "/images/Henna_100gV2.png" }
    ],
    designCategories: [
      { id: "dcat1", name: "Traditional", image: "/images/mehendi_design_001.png" },
      { id: "dcat2", name: "Contemporary", image: "/images/mehendi_design_002.png" },
      { id: "dcat3", name: "Fusion", image: "/images/mehendi_design_003.png" }
    ]
  });

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (product: Product, selectedSize?: string) => {
    const sizeObj = product.sizes?.find(s => s.size === selectedSize) || 
                   (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
    
    const sizeName = sizeObj ? sizeObj.size : undefined;
    const priceToUse = sizeObj ? sizeObj.price : product.price;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && item.selectedSize === sizeName
      );
      if (existingItem) {
        return prevCart.map(item => 
          (item.id === product.id && item.selectedSize === sizeName) 
            ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, price: priceToUse, quantity: 1, selectedSize: sizeName }];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number, selectedSize?: string) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id && item.selectedSize === selectedSize) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const handleRemoveFromCart = (id: string, selectedSize?: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
  };

  return (
    <StoreContext.Provider value={{
      designs, products, bookings, orders, cart, isLoggedIn, availabilitySettings, cartCount, selectedDesign,
      setDesigns, setProducts, setBookings, setOrders, setCart, setIsLoggedIn, setAvailabilitySettings, setSelectedDesign,
      handleAddToCart, handleUpdateQuantity, handleRemoveFromCart
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
