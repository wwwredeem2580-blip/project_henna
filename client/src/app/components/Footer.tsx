"use client";

import { motion } from "motion/react";
import { Truck, RotateCcw, ShieldCheck, Headset, Instagram, Facebook, Mail } from "lucide-react";
import Link from "next/link";

const SERVICE_ITEMS = [
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free delivery on all orders above ৳ 390 with 2-3 day shipping"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free return policy for all products"
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    description: "Ethically sourced materials and expert craftsmanship"
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description: "Our customer service team is always ready to assist you"
  }
];

export function Footer() {
  return (
    <footer className="bg-bg border-t border-ink/5 pt-20 pb-12 lg:pb-16">
      {/* Service Quality Section */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICE_ITEMS.map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center space-y-5 p-8 rounded-2xl bg-ink/[0.03] border border-ink/5 hover:bg-ink/[0.05] transition-colors duration-500"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-bg border border-ink/10 shadow-sm text-ink">
                <item.icon size={28} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-ink">{item.title}</h4>
                <p className="text-xs text-ink/70 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-12 border-t border-ink/5 space-y-12 lg:space-y-0">
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/logo/logo.png" alt="Ria's Henna Artistry" className="w-8 h-8 object-contain mix-blend-multiply" />
              <span className="text-lg font-semibold tracking-tight">Ria's Henna Artistry</span>
            </Link>
            <p className="max-w-xs text-md text-ink/80 leading-relaxed">
              Artistry in every stroke. Dedicated to providing the finest organic henna experience for your most cherished moments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-8">
            <div className="space-y-4">
              <h5 className="text-xs uppercase tracking-widest font-bold">Shop</h5>
              <div className="flex flex-col space-y-2">
                <Link href="/" className="text-xs uppercase tracking-widest text-ink/80 hover:text-ink transition-colors">All Products</Link>
                <Link href="/designs" className="text-xs uppercase tracking-widest text-ink/80 hover:text-ink transition-colors">Henna Designs</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-xs uppercase tracking-widest font-bold">Company</h5>
              <div className="flex flex-col space-y-2">
                <Link href="/about-us" className="text-xs uppercase tracking-widest text-ink/80 hover:text-ink transition-colors">About Us</Link>
                <Link href="/contact-us" className="text-xs uppercase tracking-widest text-ink/80 hover:text-ink transition-colors">Contact</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-xs uppercase tracking-widest font-bold">Connect</h5>
              <div className="flex space-x-4">
                <Instagram size={18} className="text-ink/80 hover:text-ink cursor-pointer transition-colors" />
                <Facebook size={18} className="text-ink/80 hover:text-ink cursor-pointer transition-colors" />
                <Mail size={18} className="text-ink/80 hover:text-ink cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-20 pt-8 border-t border-ink/5 space-y-4 md:space-y-0 text-xs text-ink/60 uppercase tracking-widest">
          <p>© 2026 Ria's Henna Artistry. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
