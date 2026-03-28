"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar, Section } from "./components/Sidebar";
import { Hero } from "./components/Hero";
import { DesignGallery } from "./components/DesignGallery";
import { BookingForm } from "./components/BookingForm";
import { Shop } from "./components/Shop";
import { ProductDetails } from "./components/ProductDetails";
import { CartPage } from "./components/CartPage";
import { Auth } from "./components/Auth";
import { Admin } from "./components/Admin";
import { Design, Product, CartItem, Booking, Order, BookingStatus, OrderStatus, AvailabilitySettings } from "./types";

const INITIAL_DESIGNS: Design[] = [
  { id: "1", title: "Royal Mughal", category: "Traditional", images: ["https://images.unsplash.com/photo-1590548784585-643d2b9f2925?q=80&w=800&auto=format&fit=crop"], description: "Intricate patterns inspired by Mughal architecture, featuring detailed peacocks and floral motifs." },
  { id: "2", title: "Modern Minimal", category: "Contemporary", images: ["https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?q=80&w=800&auto=format&fit=crop"], description: "Clean lines and geometric shapes for the modern bride who appreciates subtle elegance." },
  { id: "3", title: "Floral Bloom", category: "Nature", images: ["https://images.unsplash.com/photo-1589111469659-4927ed092717?q=80&w=800&auto=format&fit=crop"], description: "Delicate floral motifs flowing gracefully across the hands, symbolizing growth and beauty." },
  { id: "4", title: "Arabic Fusion", category: "Fusion", images: ["https://images.unsplash.com/photo-1560712375-b30a73cff730?q=80&w=800&auto=format&fit=crop"], description: "Bold Arabic strokes mixed with traditional Indian fillers for a striking, high-contrast look." },
  { id: "5", title: "Bridal Full", category: "Traditional", images: ["https://images.unsplash.com/photo-1617391654484-2894196c2cc9?q=80&w=800&auto=format&fit=crop"], description: "Extensive coverage from fingertips to elbows, telling a complete story of love and tradition." },
  { id: "6", title: "Mandala Soul", category: "Spiritual", images: ["https://images.unsplash.com/photo-1542451313-a129117d0682?q=80&w=800&auto=format&fit=crop"], description: "Centric mandala designs representing harmony and the infinite cycle of life." },
];

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: "p1", 
    name: "Organic Henna Cone", 
    brand: "Ria’s Henna Artistry", 
    price: 120, 
    images: [
      "/images/Henna_100g.png",
      "/images/Henna_200g.png",
      "/images/Henna_500g.png"
    ], 
    category: "Henna Cone",
    description: "Our signature organic henna cone is crafted with the finest Rajasthani henna powder, essential oils, and lemon juice. It provides a rich, deep stain that lasts for weeks. Perfect for intricate bridal designs.",
    sizes: ["100g", "200g", "1kg"],
    stock: 150
  },
  { 
    id: "p2", 
    name: "Henna Oil (30ml)", 
    brand: "Pure Essence", 
    price: 180, 
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
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop"
    ], 
    category: "Hair Mask",
    description: "A nourishing blend of amla, reetha, and shikakai. This herbal hair mask strengthens the roots, prevents hair fall, and adds a natural shine to your tresses.",
    stock: 42
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [designs, setDesigns] = useState<Design[]>(INITIAL_DESIGNS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>({
    availableDays: [0, 5, 6], // Sun, Fri, Sat
    startTime: "12:30",
    endTime: "22:00"
  });

  // Smooth scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  const handleDesignSelect = (design: Design) => {
    setSelectedDesign(design);
    setActiveSection("booking");
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setActiveSection("product-details");
  };

  const handleAddToCart = (product: Product, selectedSize?: string) => {
    const sizeToUse = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && item.selectedSize === sizeToUse
      );
      if (existingItem) {
        return prevCart.map(item => 
          (item.id === product.id && item.selectedSize === sizeToUse) 
            ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, selectedSize: sizeToUse }];
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

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setActiveSection("home");
  };

  // Admin Handlers
  const handleAddDesign = (design: Design) => setDesigns([...designs, design]);
  const handleDeleteDesign = (id: string) => setDesigns(designs.filter(d => d.id !== id));
  
  const handleAddProduct = (product: Product) => setProducts([...products, product]);
  const handleUpdateProduct = (product: Product) => setProducts(products.map(p => p.id === product.id ? product : p));
  const handleDeleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleUpdateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-bg selection:bg-ink selection:text-bg">
      {/* Centered 1080px wrapper */}
      <div className="max-w-[1440px] mx-auto min-h-screen flex relative">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          cartCount={cartCount}
        />
        
        <main className="flex-1 min-h-screen relative overflow-hidden pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection === "product-details" ? `details-${selectedProduct?.id}` : activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            {activeSection === "home" && <Hero />}
            {activeSection === "designs" && (
              <DesignGallery designs={designs} onSelect={handleDesignSelect} />
            )}
            {activeSection === "booking" && (
              <BookingForm 
                selectedDesign={selectedDesign} 
                onClearDesign={() => setSelectedDesign(null)} 
                onAddBooking={(b) => setBookings([...bookings, b])}
                bookings={bookings}
                availabilitySettings={availabilitySettings}
              />
            )}
            {activeSection === "shop" && (
              <Shop 
                products={products}
                onProductClick={handleProductClick} 
                onAddToCart={handleAddToCart}
                cartCount={cartCount}
                onViewCart={() => setActiveSection("cart")}
              />
            )}
            {activeSection === "product-details" && selectedProduct && (
              <ProductDetails 
                product={selectedProduct} 
                onBack={() => setActiveSection("shop")}
                onAddToCart={handleAddToCart}
              />
            )}
            {activeSection === "cart" && (
              <CartPage 
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
                onCheckout={() => {
                  const newOrder: Order = {
                    id: `ORD-${Date.now()}`,
                    items: [...cart],
                    total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
                    status: "pending",
                    createdAt: new Date().toISOString(),
                    customerName: "Guest User", // In a real app, this would come from auth
                    customerEmail: "guest@example.com"
                  };
                  setOrders([...orders, newOrder]);
                  setCart([]);
                  alert("Order placed successfully!");
                  setActiveSection("home");
                }}
                onContinueShopping={() => setActiveSection("shop")}
              />
            )}
            {(activeSection === "login" || activeSection === "register") && (
              <Auth 
                mode={activeSection as "login" | "register"}
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setActiveSection("register")}
                onSwitchToLogin={() => setActiveSection("login")}
              />
            )}
            {activeSection === "admin" && (
              <Admin 
                designs={designs}
                products={products}
                bookings={bookings}
                orders={orders}
                availabilitySettings={availabilitySettings}
                onUpdateAvailability={setAvailabilitySettings}
                onAddDesign={handleAddDesign}
                onUpdateDesign={(d) => setDesigns(designs.map(old => old.id === d.id ? d : old))}
                onDeleteDesign={handleDeleteDesign}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Decorative background elements */}
        <div className="fixed top-0 right-0 w-1/3 h-screen pointer-events-none opacity-[0.02] z-0">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </main>
      </div>
    </div>
  );
}
