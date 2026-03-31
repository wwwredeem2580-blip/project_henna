"use client";

import { use } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function FrozenRoute({ children }: { children: React.ReactNode }) {
  // Use 'use' instead of 'useContext' for compatibility in some Next.js environments
  // but LayoutRouterContext is usually fine with useContext.
  const context = use(LayoutRouterContext as any);
  
  return (
    <LayoutRouterContext.Provider value={context as any}>
      {children}
    </LayoutRouterContext.Provider>
  );
}
