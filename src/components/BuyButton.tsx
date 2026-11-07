"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Product } from "@/lib/products";

export function BuyButton({
  product,
  label = "Comprar agora",
  full = false
}: {
  product: Product;
  label?: string;
  full?: boolean;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  function handleBuy() {
    if (!user) {
      router.push(`/login?next=/produto/${product.id}&buy=${product.id}`);
      return;
    }

    window.open(buildWhatsAppLink(product), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-md bg-coral px-5 text-sm font-black text-white transition hover:bg-[#d94f42] disabled:cursor-wait disabled:opacity-70 ${
        full ? "w-full" : ""
      }`}
    >
      <ShoppingBag size={18} />
      {label}
    </button>
  );
}
