"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  HardDrive,
  ShieldCheck,
  Cpu,
  Zap,
  Monitor,
  Battery,
  Tag,
  X,
  Maximize2,
} from "lucide-react";

import { BuyButton } from "@/components/BuyButton";
import { formatPrice, type Product } from "@/lib/products";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// ==========================================================
// BUSCA PRODUTO NO FIREBASE PELO ID
// ==========================================================
async function getProductById(id: string): Promise<Product | null> {
  try {
    const productRef = doc(db, "products", id);
    const snapshot = await getDoc(productRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Product;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

// ==========================================================
// PÁGINA DE DETALHES DO PRODUTO
// ==========================================================
export default function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // No Next.js 14, acessamos o params diretamente!
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const prod = await getProductById(id);
      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.image || (prod.images && prod.images[0]) || "");
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Carregando detalhes do produto...
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  // Galeria de imagens tratada
  const productGallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  // Especificações dinâmicas
  const specItems = [
    product.storage
      ? { icon: HardDrive, label: `${product.storage} de armazenamento` }
      : null,
    product.state
      ? { icon: Tag, label: `Estado: ${product.state}` }
      : null,
    product.warranty
      ? { icon: ShieldCheck, label: `Garantia: ${product.warranty}` }
      : null,
    product.processor
      ? { icon: Cpu, label: `Processador: ${product.processor}` }
      : null,
    product.performance
      ? { icon: Zap, label: `Desempenho: ${product.performance}` }
      : null,
    product.camera
      ? { icon: Camera, label: `Câmera: ${product.camera}` }
      : null,
    product.screen
      ? { icon: Monitor, label: `Tela: ${product.screen}` }
      : null,
    product.battery
      ? { icon: Battery, label: `Bateria: ${product.battery}` }
      : null,
  ].filter((item): item is { icon: any; label: string } => Boolean(item));

  return (
    <section className="bg-cloud py-12 min-h-screen">
      <div className="container-pad">
        {/* Botão voltar */}
        <Link
          href="/celulares"
          className="mb-6 inline-flex items-center gap-2 text-sm font-black text-ink/65 transition hover:text-ink"
        >
          <ArrowLeft size={18} />
          Voltar para celulares
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          {/* IMAGEM E GALERIA */}
          <div className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
            {/* Foto Destaque (Com clique para abrir tela cheia) */}
            <div
              onClick={() => setIsFullScreen(true)}
              className="relative aspect-[4/3] bg-white flex items-center justify-center p-4 cursor-zoom-in group"
            >
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                <Maximize2 size={16} />
              </div>
            </div>

            {/* Miniaturas das Fotos */}
            {productGallery.length > 1 && (
              <div className="grid gap-3 p-4 sm:grid-cols-4">
                {productGallery.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`overflow-hidden rounded-md bg-cloud border h-20 flex items-center justify-center p-1 transition ${
                      (selectedImage || product.image) === imgUrl
                        ? "border-coral ring-2 ring-coral/20"
                        : "border-black/10 hover:border-black/30"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} foto ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES DO PRODUTO */}
          <div className="rounded-md border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              {product.state && (
                <span className="rounded-md bg-moss/10 px-3 py-1.5 text-xs font-black text-moss">
                  {product.state}
                </span>
              )}

              {product.warranty && (
                <span className="rounded-md bg-gold/20 px-3 py-1.5 text-xs font-black text-[#7a5a12]">
                  {product.warranty}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black leading-tight text-ink">
              {product.name}
            </h1>

            <p className="mt-2 text-lg font-bold text-ink/55">
              {product.storage} {product.color ? `- ${product.color}` : ""}
            </p>

            <div className="mt-6 text-4xl font-black text-ink">
              {formatPrice(product.price)}
            </div>

            {product.highlight && (
              <p className="mt-4 leading-7 text-ink/65">
                {product.highlight}
              </p>
            )}

            {/* LISTA DE ESPECIFICAÇÕES DINÂMICAS */}
            <div className="mt-7 grid gap-3">
              {specItems.map((spec, index) => {
                const Icon = spec.icon || BadgeCheck;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-md border border-black/10 bg-cloud p-3"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-moss shadow-xs">
                      <Icon size={19} />
                    </span>

                    <span className="font-bold text-ink/75">{spec.label}</span>
                  </div>
                );
              })}
            </div>

            {/* BOTÃO DE COMPRA */}
            <div className="mt-7">
              <BuyButton product={product} full />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TELA CHEIA (LIGHTBOX) */}
      {isFullScreen && (
        <div
          onClick={() => setIsFullScreen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 transition"
          >
            <X size={28} />
          </button>

          <img
            src={selectedImage || product.image}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        </div>
      )}
    </section>
  );
}