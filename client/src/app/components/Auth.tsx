"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, Lock, User, Instagram, Facebook } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useRouter } from "next/navigation";

interface AuthProps {
  mode: "login" | "register";
}

export function Auth({ mode }: AuthProps) {
  const { setIsLoggedIn } = useStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    router.push("/");
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 lg:px-12 py-12 lg:py-24 bg-bg">
      <motion.div 
        key={mode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 lg:space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-4xl lg:text-5xl font-serif">{mode === "login" ? "Welcome Back" : "Join RongMahal"}</h2>
          <p className="text-ink-muted uppercase tracking-widest text-[10px]">
            {mode === "login" ? "Enter your details to continue" : "Create an account for a premium experience"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {mode === "register" && (
            <div className="space-y-2 relative">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Full Name</label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                <input 
                  required 
                  type="text" 
                  className="w-full bg-transparent border-b border-ink/10 py-3 pl-8 focus:border-ink outline-none transition-colors" 
                  placeholder="Your Name"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 relative">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Email Address</label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted">
                <Mail size={16} />
              </span>
              <input 
                required 
                type="email" 
                className="w-full bg-transparent border-b border-ink/10 py-3 pl-8 focus:border-ink outline-none transition-colors" 
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Password</label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted">
                <Lock size={16} />
              </span>
              <input 
                required 
                type="password" 
                className="w-full bg-transparent border-b border-ink/10 py-3 pl-8 focus:border-ink outline-none transition-colors" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-ink text-bg py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-ink/90 transition-all flex items-center justify-center space-x-3 group"
          >
            <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-bg px-4 text-ink-muted">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <button className="p-4 border border-ink/5 rounded-full hover:bg-ink/5 transition-colors">
              <Instagram size={20} className="text-ink" />
            </button>
            <button className="p-4 border border-ink/5 rounded-full hover:bg-ink/5 transition-colors">
              <Facebook size={20} className="text-ink" />
            </button>
          </div>

          <p className="text-xs text-ink-muted">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => router.push(mode === "login" ? "/register" : "/login")}
              className="text-ink font-semibold border-b border-ink pb-0.5 ml-1"
            >
              {mode === "login" ? "Register now" : "Sign in here"}
            </button>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
