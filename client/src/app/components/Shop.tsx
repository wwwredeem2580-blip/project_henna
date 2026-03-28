"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Plus } from "lucide-react";
import { Product } from "../types";

interface ShopProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartCount: number;
  onViewCart: () => void;
}

export function Shop({ products, onProductClick, onAddToCart, cartCount, onViewCart }: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section className="px-6 lg:px-12 py-12 lg:py-24 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 lg:mb-20 space-y-6 md:space-y-0">
        <div>
          <h2 className="text-4xl lg:text-5xl font-serif mb-4">The Boutique</h2>
          <p className="text-ink-muted uppercase tracking-widest text-xs">Premium products for your beauty rituals</p>
        </div>
        <div 
          onClick={onViewCart}
          className="flex items-center space-x-2 text-ink-muted hover:text-ink cursor-pointer transition-colors self-start md:self-auto"
        >
          <ShoppingCart size={18} />
          <span className="text-[10px] uppercase tracking-widest font-semibold">Cart ({cartCount})</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-12">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 rounded-full border ${
              activeCategory === category 
                ? "bg-ink text-bg border-ink" 
                : "bg-transparent text-ink border-ink/10 hover:border-ink/30"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 lg:gap-y-16">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-ink/5">
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="absolute bottom-6 right-6 w-12 h-12 bg-bg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-sm hover:bg-ink hover:text-bg"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-ink-muted">{product.brand}</p>
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-serif">{product.name}</h3>
                <span className="text-sm font-medium">Tk {product.price.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
