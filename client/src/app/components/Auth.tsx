"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, Lock, User } from "lucide-react";
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
      <div className="w-full max-w-md space-y-8 lg:space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl lg:text-5xl font-semibold">{mode === "login" ? "Welcome Back" : "Join Ria's Henna"}</h2>
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

          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-4 p-4 border border-ink/5 rounded-full hover:bg-ink/5 transition-all group">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-ink/70 group-hover:text-ink transition-colors">Continue with Google</span>
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
      </div>
    </section>
  );
}