"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useRouter } from "next/navigation";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { handleAddToCart } = useStore();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (product.variantImages && product.variantImages[size]) {
      const idx = product.images.indexOf(product.variantImages[size]);
      if (idx !== -1) setCurrentImageIndex(idx);
    } else if (product.sizes) {
      const index = product.sizes.indexOf(size);
      if (index !== -1 && index < product.images.length) {
        setCurrentImageIndex(index);
      }
    }
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-bg">
      {/* Left Content */}
      <div className="flex-1 px-6 lg:px-12 py-12 lg:py-32 flex flex-col justify-center max-w-2xl order-2 lg:order-1">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center space-x-2 text-ink-muted hover:text-ink transition-colors mb-8 lg:mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-widest">Back to Shop</span>
        </button>

        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-ink-muted">{product.category}</p>
            <h2 className="text-4xl lg:text-5xl font-semibold leading-tight">{product.name}</h2>
            <p className="text-xl font-medium mt-4">Tk {product.price.toLocaleString()}</p>
          </div>

          {product.sizes && (
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-ink-muted">Select Size</p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`px-6 py-2 text-[10px] uppercase tracking-widest transition-all duration-300 border ${
                      selectedSize === size 
                        ? "bg-ink text-bg border-ink" 
                        : "bg-transparent text-ink border-ink/10 hover:border-ink/30"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-4 max-w-xs">
            <button 
              onClick={() => handleAddToCart(product, selectedSize)}
              className="w-full border border-ink py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-bg transition-all duration-300"
            >
              Add to Cart
            </button>
          </div>

          <div className="space-y-4 pt-8 border-t border-ink/5">
            <p className="text-lg text-ink leading-relaxed">
              {product.description}
            </p>
            <div className="flex flex-col space-y-2 pt-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-sm font-medium uppercase tracking-widest">
                  Availability: {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                </span>
              </div>
              <span className="text-xs uppercase tracking-widest text-ink-muted">Brand: {product.brand}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Gallery */}
      <div className="flex-1 relative h-[60vh] lg:h-screen bg-ink/5 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={product.images[currentImageIndex]} 
            alt={`${product.name} ${currentImageIndex + 1}`} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {product.images.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={prevImage}
                className="w-12 h-12 bg-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-ink hover:bg-ink hover:text-bg transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextImage}
                className="w-12 h-12 bg-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-ink hover:bg-ink hover:text-bg transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-3">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex ? "bg-ink w-6" : "bg-ink/20"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
