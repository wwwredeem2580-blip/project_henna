"use client";

import { Suspense } from "react";
import { Shop } from "../components/Shop";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <Shop />
    </Suspense>
  );
}
