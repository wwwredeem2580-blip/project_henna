"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Product } from "../types";
import { useStore } from "../context/StoreContext";
import { useRouter, useSearchParams } from "next/navigation";

export function Shop() {
  const { products, handleAddToCart, cartCount, availabilitySettings } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Get images for each category
  const getCategoryImages = (categoryName: string): string[] => {
    if (categoryName === "All") {
      return (availabilitySettings.productCategories || []).slice(0, 3).map(c => c.image);
    }
    const cat = availabilitySettings.productCategories?.find(c => c.name === categoryName);
    if (cat?.image) return [cat.image];
    
    // Find a product from this category to use its image as fallback
    const productInCategory = products.find(p => p.category === categoryName);
    return productInCategory?.images ? [productInCategory.images[0]] : ["/images/Henna_Cone.png"];
  };

  const handleAddToCartClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    handleAddToCart(product);
    setToastMessage(`Added ${product.name} to cart`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOrderNowClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    handleAddToCart(product);
    router.push("/cart");
  };

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-12 lg:py-24 min-h-screen w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 lg:mb-20 space-y-6 md:space-y-0">
        <div>
          <h2 className="text-4xl lg:text-5xl font-normal mb-4">Our Products</h2>
          <p className="text-ink-muted uppercase tracking-widest text-xs">Premium products for your beauty rituals</p>
        </div>
      </div>

      {/* Category Filter with Images */}
      <div className="flex flex-wrap gap-4 mb-12">
        {categories.map(category => {
          const images = getCategoryImages(category);
          const hasMultipleImages = images.length > 1;
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 min-w-[80px] ${
                activeCategory === category 
                  ? "bg-ink text-bg border-ink" 
                  : "bg-transparent text-ink border-ink/10 hover:border-ink/30"
              }`}
            >
              <div className="relative w-14 h-14 flex-shrink-0">
                {hasMultipleImages ? (
                  // Stacked images effect
                  <>
                    {images.slice(0, 3).map((img, idx) => (
                      <div
                        key={idx}
                        className="absolute w-10 h-10 rounded-md overflow-hidden border border-ink/10 shadow-sm bg-bg"
                        style={{
                          left: `${idx * 6}px`,
                          top: `${idx * 4}px`,
                          zIndex: idx,
                          transform: `rotate(${(idx - 1) * 6}deg)`,
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`${category} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  // Single image
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-ink/10 shadow-sm">
                    <img 
                      src={images[0]} 
                      alt={category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-center leading-tight">
                {category}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer flex flex-col h-full"
            onClick={() => router.push(`/product/${product.id}`)}
          >
            <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-ink/5 flex-shrink-0">
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1 flex flex-col flex-1">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-muted">{product.brand}</p>
              <h3 className="text-[15px] sm:text-[16px] font-medium line-clamp-2 leading-tight mb-2">{product.name}</h3>
              {product.secondaryName ? (
                <h4 className="text-[14px] sm:text-[15px] font-medium text-ink/90 line-clamp-1 leading-tight">{product.secondaryName}</h4>
              ) : (
                <div className="h-4" />
              )}
              <div className="flex items-baseline space-x-2 pt-1">
                <p className="text-base font-bold text-ink">
                  Tk {product.price.toLocaleString()}
                </p>
                {product.originalPrice && (
                  <p className="text-xs text-ink/60 line-through font-medium italic">Tk {product.originalPrice.toLocaleString()}</p>
                )}
              </div>
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[8px] uppercase tracking-tighter text-ink font-bold">Sizes:</span>
                  {product.sizes.map(s => (
                    <span key={s.size} className="text-[8px] bg-ink/5 border border-ink/20 px-1 rounded-sm uppercase tracking-tighter text-ink font-medium">{s.size}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-4 mt-auto">
                <button 
                  onClick={(e) => handleAddToCartClick(e, product)}
                  className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-ink/20 rounded-md hover:bg-ink hover:text-bg hover:border-ink transition-all duration-300"
                  title="Add to Cart"
                >
                  <ShoppingCart size={16} />
                </button>
                <button 
                  onClick={(e) => handleOrderNowClick(e, product)}
                  className="flex-1 whitespace-nowrap flex items-center justify-center gap-1.5 py-1.5 px-2 bg-cta text-white rounded-md text-[9px] md:text-[10px] uppercase tracking-wider font-semibold hover:bg-cta-hover transition-all duration-300 shadow-sm"
                >
                  <span>Order Now</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-[100] bg-ink text-bg px-6 py-4 rounded-full text-xs uppercase tracking-widest font-semibold shadow-2xl flex items-center space-x-3 whitespace-nowrap"
          >
            <ShoppingCart size={14} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}