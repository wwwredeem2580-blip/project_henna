"use client";

import { motion } from "motion/react";
import { useStore } from "./context/StoreContext";
import { useRouter } from "next/navigation";
import { HeroBanner } from "./components/HeroBanner";
import { Stories } from "./components/Stories";
import { ShoppingCart, ArrowRight, Calendar, Image as ImageIcon } from "lucide-react";
import { Product, Design } from "./types";

export default function LandingPage() {
  const { products, designs, handleAddToCart, cartCount } = useStore();
  const router = useRouter();

  // Featured sections data
  const bestSellers = products.slice(0, 5);
  const featuredDesigns = designs.slice(0, 5);
  const categories = Array.from(new Set(products.map(p => p.category)));

  const handleAddToCartClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    handleAddToCart(product);
  };

  return (
    <div className="w-full">
      <HeroBanner />
      
      {/* Best Selling Products */}
      <section className="px-6 lg:px-12 py-10 lg:py-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 space-y-4 md:space-y-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted mb-3">Popular Choice</p>
            <h2 className="text-4xl lg:text-5xl font-normal">Best Selling</h2>
          </div>
          <button 
            onClick={() => router.push("/shop")} 
            className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-semibold border-b border-ink pb-1 hover:opacity-70 transition-opacity self-start"
          >
            <span>View All Products</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 lg:-mx-12 lg:px-12 scroll-smooth">
          {bestSellers.map((product, index) => (
            <div key={product.id} className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px] flex-shrink-0">
              <ProductCard product={product} index={index} onAdd={handleAddToCartClick} />
            </div>
          ))}
        </div>
      </section>

      {/* Designs You'd Love */}
      <section className="px-6 lg:px-12 py-10 lg:py-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 space-y-4 md:space-y-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted mb-3">Curated Styles</p>
            <h2 className="text-4xl lg:text-5xl font-normal">Designs you'd love</h2>
          </div>
          <button 
            onClick={() => router.push("/designs")} 
            className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-semibold border-b border-ink pb-1 hover:opacity-70 transition-opacity self-start"
          >
            <span>Browse All Designs</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 lg:-mx-12 lg:px-12 scroll-smooth">
          {featuredDesigns.map((design, index) => (
            <div key={design.id} className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px] flex-shrink-0">
              <DesignCard design={design} index={index} />
            </div>
          ))}
        </div>
      </section>

      {/* Explore Collections */}
      <section className="px-6 lg:px-12 py-24 bg-ink/[0.02]">
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted mb-3">Categories</p>
          <h2 className="text-4xl lg:text-5xl font-normal">Explore our Collections</h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {categories.map((category, idx) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => router.push(`/shop?category=${encodeURIComponent(category)}`)}
              className="px-8 py-4 bg-bg border border-ink/5 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-ink hover:text-bg hover:border-ink transition-all duration-500 shadow-sm"
            >
              {category}
            </motion.button>
          ))}
        </div>
      </section>


      {/* Legacy Section */}
      <section className="px-6 lg:px-12 py-24 bg-ink/[0.02]">
          <div className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted mb-3">Atmosphere</p>
            <h2 className="text-4xl lg:text-5xl font-normal">Our Legacy</h2>
            <p className="text-sm text-ink-muted mt-4 max-w-xl">
              Artistry in every stroke. Discover the stories and traditions behind our handcrafted henna art.
            </p>
          </div>
          <Stories />
      </section>
    </div>
  );
}

function ProductCard({ product, index, onAdd }: { product: Product, index: number, onAdd: (e: React.MouseEvent, p: Product) => void }) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer flex flex-col h-full"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-ink/5 rounded-sm flex-shrink-0">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={(e) => onAdd(e, product)}
            className="w-full py-3 bg-bg text-ink text-[10px] uppercase tracking-widest font-bold shadow-xl flex items-center justify-center space-x-2 hover:bg-ink hover:text-bg transition-colors"
          >
            <ShoppingCart size={14} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      <div className="space-y-1 flex flex-col flex-1">
        <p className="text-[9px] uppercase tracking-widest text-ink-muted">{product.brand}</p>
        <h3 className="text-[14px] sm:text-[16px] font-medium line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</h3>
        {product.secondaryName ? (
          <h4 className="text-[14px] mt-2 font-medium text-ink/70 line-clamp-1 leading-tight">{product.secondaryName}</h4>
        ) : (
          <div className="" />
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
          <div className="flex flex-wrap gap-2 pt-2">
            {product.sizes.map(s => (
              <span key={s.size} className="text-[10px] sm:text-[11px] border border-ink/20 px-1 rounded-sm uppercase tracking-tighter text-ink font-medium">{s.size}</span>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-4 mt-auto">
          <button 
            onClick={(e) => onAdd(e, product)}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-ink/20 rounded-md hover:bg-ink hover:text-bg hover:border-ink transition-all duration-300"
            title="Add to Cart"
          >
            <ShoppingCart size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAdd(e, product);
              router.push("/cart");
            }}
            className="flex-1 whitespace-nowrap flex items-center justify-center gap-1.5 py-1.5 px-2 bg-cta text-white rounded-md text-[9px] md:text-[10px] uppercase tracking-wider font-semibold hover:bg-cta-hover transition-all duration-300 shadow-sm"
          >
            <span>Order Now</span>
            <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DesignCard({ design, index }: { design: Design, index: number }) {
  const router = useRouter();
  const { setSelectedDesign } = useStore();

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDesign(design);
    router.push("/booking");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer flex flex-col h-full"
      onClick={() => router.push("/designs")}
    >
      <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-ink/5 rounded-sm">
        <img 
          src={design.images[0]} 
          alt={design.title} 
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={handleBookNow}
            className="w-full py-3 bg-bg text-ink text-[10px] uppercase tracking-widest font-bold shadow-xl flex items-center justify-center space-x-2 hover:bg-ink hover:text-bg transition-colors"
          >
            <Calendar size={14} />
            <span>Book Now</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 space-y-1">
        <p className="text-[9px] uppercase tracking-widest text-ink-muted">{design.category}</p>
        <h3 className="text-[14px] font-medium line-clamp-2 leading-tight flex-1">{design.title}</h3>
        <p className="text-base font-bold text-ink pt-1">
          Tk {design.price.toLocaleString()}
        </p>
        <div className="mt-auto pt-2">
          <button 
            onClick={handleBookNow}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-cta text-white rounded-md text-[10px] uppercase tracking-wider font-semibold hover:bg-cta-hover transition-all duration-300"
          >
            <Calendar size={12} />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
