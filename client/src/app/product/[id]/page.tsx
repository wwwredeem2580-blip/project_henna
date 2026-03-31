"use client";

import { useStore } from "../../context/StoreContext";
import { ProductDetails } from "../../components/ProductDetails";
import { useParams, useRouter } from "next/navigation";

export default function ProductPage() {
  const { products } = useStore();
  const params = useParams();
  const router = useRouter();
  
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif mb-4">Product Not Found</h2>
        <button 
          onClick={() => router.push("/")}
          className="bg-ink text-bg px-8 py-4 text-[10px] uppercase tracking-widest"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return <ProductDetails product={product} />;
}
