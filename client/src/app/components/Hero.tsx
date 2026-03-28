"use client";

import { motion } from "motion/react";
import { ArrowRight, Leaf, Clock, MapPin, Star } from "lucide-react";
import { Section } from "./Sidebar";

const TESTIMONIALS = [
  {
    name: "Sarah Ahmed",
    event: "Bridal Mehendi",
    text: "Ria is an absolute artist. The stain was the darkest I've ever seen, and her intricate designs left all my wedding guests speechless. She was so patient and professional!",
  },
  {
    name: "Aisha Khan",
    event: "Eid Celebration",
    text: "I booked Ria for an Eid party and she was phenomenal. The organic henna smells amazing and you can tell she mixes it fresh. Highly recommended for any event.",
  },
  {
    name: "Fatima Rahman",
    event: "Party Mehendi",
    text: "I've bought her organic cones from the website multiple times now. The consistency is perfect for my own practice, and it never clogs. The best boutique henna out there.",
  },
  {
    name: "Nadia M.",
    event: "Bridal Mehendi",
    text: "Ria listened to exactly what I wanted and merged traditional motifs with modern elements seamlessly. My bridal henna was a true masterpiece and the color developed so deeply.",
  }
];

function TestimonialCard({ name, event, text }: { name: string, event: string, text: string }) {
  return (
    <div className="p-8 md:p-10 border border-ink/10 rounded-sm bg-bg hover:border-ink/30 transition-colors duration-500">
      <div className="flex space-x-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="fill-ink text-ink" />
        ))}
      </div>
      <p className="text-lg md:text-xl font-serif leading-relaxed mb-8">"{text}"</p>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-ink">{name}</p>
        <p className="text-[10px] text-ink-muted uppercase tracking-[0.2em] mt-1">{event}</p>
      </div>
    </div>
  );
}

interface HeroProps {
  onNavigate: (section: Section) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <div className="bg-bg text-ink">
      
      {/* 1. Main Hero / Motto */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-24 relative overflow-hidden">
        <div className="max-w-5xl z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-ink-muted mb-6">Ria’s Henna Artistry</p>
            <h2 className="text-5xl md:text-8xl font-serif leading-[1.1] tracking-tight">
              Pure henna. <br />
              <span className="italic ml-8 md:ml-24">Genuine artistry.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-lg md:text-xl text-ink-muted font-light leading-relaxed">
              We specialize in custom drawn, bespoke designs using our signature chemical-free henna paste—handcrafted for your most cherished moments.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-6"
          >
            <button 
              onClick={() => onNavigate("booking")}
              className="flex items-center justify-center space-x-3 bg-ink text-bg px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-ink/90 transition-colors"
            >
              <span>Book a Session</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => onNavigate("shop")}
              className="flex items-center justify-center space-x-3 bg-transparent border border-ink/20 text-ink px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-semibold hover:border-ink hover:bg-ink/5 transition-colors"
            >
              <span>Shop Boutique</span>
            </button>
          </motion.div>
        </div>

        {/* Decorative subtle background image for Hero */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[-10%] md:right-[-5%] w-[60%] lg:w-[40%] opacity-20 pointer-events-none hidden sm:block">
          <img 
            src="/images/mehendi_design_002.png" 
            alt="" 
            className="w-full h-auto object-contain mix-blend-multiply" 
          />
        </div>
      </section>

      {/* 2. Why Choose Us (Factual, no fluff) */}
      <section className="px-6 lg:px-12 py-24 lg:py-32 bg-ink/5">
        <div className="mb-16 lg:mb-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-muted font-bold mb-4">Values</p>
          <h3 className="text-3xl lg:text-5xl font-serif">Why Choose Us</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full border border-ink/20 flex items-center justify-center bg-bg shadow-sm">
              <Leaf size={20} className="text-ink" />
            </div>
            <h4 className="text-xl font-serif">100% Organic & Chemical-Free</h4>
            <p className="text-sm text-ink-muted leading-relaxed font-light">
              We strictly use pure Rajasthani henna powder, essential oils, sugar, and water. Absolutely zero synthetic dyes, preservatives, or harmful additives—meaning it's perfectly safe for all skin types.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full border border-ink/20 flex items-center justify-center bg-bg shadow-sm">
              <Clock size={20} className="text-ink" />
            </div>
            <h4 className="text-xl font-serif">Proven Stain Quality</h4>
            <p className="text-sm text-ink-muted leading-relaxed font-light">
              Through a meticulous mixing and resting process, we guarantee a rich, deep color that develops beautifully over 48 hours and is proven to last for weeks without fading prematurely.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full border border-ink/20 flex items-center justify-center bg-bg shadow-sm">
              <MapPin size={20} className="text-ink" />
            </div>
            <h4 className="text-xl font-serif">Reliable & Professional</h4>
            <p className="text-sm text-ink-muted leading-relaxed font-light">
              Transparent upfront pricing, immediate availability calendar, and guaranteed punctuality for your events. From intimate appointments to broad bridal sessions, we manage your time with absolute respect.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Services Preview */}
      <section className="px-6 lg:px-12 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative aspect-[4/5] bg-ink/5 rounded-sm overflow-hidden hidden sm:block order-2 lg:order-1">
            <img 
              src="/images/mehendi_design_001.png" 
              alt="Bridal Mehendi Service" 
              className="w-full h-full object-cover mix-blend-multiply transition-transform duration-1000 hover:scale-105"
            />
          </div>
          <div className="space-y-10 order-1 lg:order-2">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted font-bold">Services</p>
              <h3 className="text-3xl lg:text-5xl font-serif">Bridal & Event Artistry</h3>
              <p className="text-lg text-ink-muted font-light leading-relaxed">
                Whether you're looking for traditional full-arm bridal masterpieces, contemporary geometric styles for a party, or elegant minimalist designs for Eid, we craft a bespoke henna experience entirely centered around your vision.
              </p>
            </div>
            <button 
              onClick={() => onNavigate("booking")}
              className="inline-flex items-center space-x-3 text-[10px] uppercase tracking-[0.3em] font-semibold border-b border-ink pb-2 hover:opacity-70 transition-opacity"
            >
              <span>View Availability & Pre-book</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Testimonials (Masonry Grid) */}
      <section className="px-6 lg:px-12 py-24 lg:py-32 bg-ink/5">
        <div className="text-center mb-16 lg:mb-24">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-muted font-bold mb-4">Client Love</p>
          <h3 className="text-3xl lg:text-5xl font-serif">Stories of Celebration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Column 1 */}
          <div className="space-y-8">
            {TESTIMONIALS.slice(0, 2).map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
          {/* Column 2 (Staggered) */}
          <div className="space-y-8 md:mt-16">
            {TESTIMONIALS.slice(2, 4).map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Products Preview */}
      <section className="px-6 lg:px-12 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-10">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted font-bold">Boutique</p>
              <h3 className="text-3xl lg:text-5xl font-serif">Our Handcrafted Cones</h3>
              <p className="text-lg text-ink-muted font-light leading-relaxed">
                We sell the exact same premium organic henna cones that we use on our clients. By producing everything fresh in small studio batches, we ensure unmatched consistency, intense stains, and a silky smooth application every time.
              </p>
            </div>
            <button 
              onClick={() => onNavigate("shop")}
              className="inline-flex items-center space-x-3 text-[10px] uppercase tracking-[0.3em] font-semibold border-b border-ink pb-2 hover:opacity-70 transition-opacity"
            >
              <span>Shop All Products</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="relative aspect-square lg:aspect-[4/3] hidden sm:block">
            {/* Displaying product showcase cleanly */}
            <div className="absolute inset-0 flex items-center justify-center bg-bg/50 backdrop-blur-sm border border-ink/10 shadow-sm rounded-sm p-8 group overflow-hidden">
               <img 
                 src="/images/Henna_100g.png" 
                 alt="Organic Henna Cone Showcase"
                 className="w-2/3 h-auto object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-md" 
               />
               <div className="absolute bottom-6 left-6 text-left">
                 <p className="text-xs uppercase tracking-widest text-ink font-semibold">Organic Cone</p>
                 <p className="text-[10px] uppercase tracking-widest text-ink-muted">100g • Tk 120</p>
               </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
