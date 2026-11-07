
import type { Product } from "./products";

const fallbackNumber = "5599999999999";

export function buildWhatsAppLink(product: Product) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || fallbackNumber;
  const message = `Olá, gostaria de comprar o ${product.name} ${product.storage} que vi no site.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
