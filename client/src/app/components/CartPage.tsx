"use client";

import { motion } from "motion/react";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useRouter } from "next/navigation";

export function CartPage() {
  const { cart, handleUpdateQuantity, handleRemoveFromCart, setOrders, orders, setCart } = useStore();
  const router = useRouter();

  const subtotal = cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total: subtotal,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      customerName: "Guest User",
      customerEmail: "guest@example.com"
    };
    setOrders([...orders, newOrder]);
    setCart([]);
    alert("Order placed successfully!");
    router.push("/");
  };

  if (cart.length === 0) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-6 lg:px-12 space-y-8">
        <div className="w-20 lg:w-24 h-20 lg:h-24 bg-ink/5 rounded-full flex items-center justify-center">
          <ShoppingBag size={28} className="text-ink-muted" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl lg:text-4xl font-serif">Your cart is empty</h2>
          <p className="text-sm text-ink-muted">Looks like you haven't added anything yet.</p>
        </div>
        <button 
          onClick={() => router.push("/")}
          className="bg-ink text-bg px-8 lg:px-12 py-5 lg:py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-ink/90 transition-colors"
        >
          Start Shopping
        </button>
      </section>
    );
  }

  return (
    <section className="px-6 lg:px-12 py-12 lg:py-24 min-h-screen max-w-6xl">
      <div className="mb-12 lg:mb-20">
        <h2 className="text-4xl lg:text-5xl font-serif mb-4">Shopping Cart</h2>
        <p className="text-ink-muted uppercase tracking-widest text-xs">Review your selection before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-12">
          {cart.map((item, idx) => (
            <motion.div 
              key={`${item.id}-${item.selectedSize || idx}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-start space-x-8 pb-12 border-b border-ink/5 group"
            >
              <div className="w-32 aspect-[3/4] bg-ink/5 overflow-hidden rounded-sm">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">{item.brand}</p>
                    <h3 className="text-xl font-serif">{item.name}</h3>
                    {item.selectedSize && <p className="text-sm text-ink-muted mt-1">Size: {item.selectedSize}</p>}
                  </div>
                  <button 
                    onClick={() => handleRemoveFromCart(item.id, item.selectedSize)}
                    className="p-2 text-ink-muted hover:text-ink transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center border border-ink/10 rounded-full px-4 py-2 space-x-6">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, -1, item.selectedSize)}
                      className="text-ink-muted hover:text-ink transition-colors"
                    >
                      <  Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, 1, item.selectedSize)}
                      className="text-ink-muted hover:text-ink transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-medium">Tk {item.price.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-8">
          <div className="p-10 border border-ink/5 bg-white/50 backdrop-blur-sm rounded-sm space-y-8">
            <h3 className="text-xl font-serif">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Subtotal</span>
                <span>Tk {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Shipping</span>
                <span className="text-[10px] uppercase tracking-widest">Calculated at next step</span>
              </div>
              <div className="pt-6 border-t border-ink/5 flex justify-between items-baseline">
                <span className="text-lg font-serif">Total</span>
                <span className="text-2xl font-medium">Tk {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-ink text-bg py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-ink/90 transition-colors flex items-center justify-center space-x-3 group"
            >
              <span>Checkout</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => router.push("/")}
              className="w-full text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          <div className="p-10 border border-ink/5 bg-white/50 backdrop-blur-sm rounded-sm space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">Secure Payment</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Your security is our priority. We use industry-standard encryption to protect your data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
