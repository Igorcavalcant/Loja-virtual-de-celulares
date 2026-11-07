"use client";

import { ChevronLeft, ChevronRight, ShoppingCart, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Slide = {
  id: string;
  title?: string;
  subtitle?: string;
  label?: string;
  image: string;
  order: number;
};

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [active, setActive] = useState(0);

  async function loadSlides() {
    try {
      const q = query(
        collection(db, "carouselSlides"),
        orderBy("order", "asc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Slide[];

      setSlides(data);
    } catch (error) {
      console.error("Erro ao carregar slides:", error);
    }
  }

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) return null;

  const slide = slides[active];

  function move(direction: number) {
    setActive(
      (value) => (value + direction + slides.length) % slides.length
    );
  }

  const hasTextContent = Boolean(slide.title || slide.subtitle);

  return (
    <div className="container-pad my-6">
      <section className="relative h-[50vh] min-h-[350px] max-h-[520px] w-full overflow-hidden rounded-2xl bg-black text-white shadow-xl border border-gray-800">
        {/* 1. IMAGEM OU GIF */}
        {slides.map((item, index) => {
          const isActive = index === active;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={item.image}
                alt={item.title || "Banner Hero"}
                className="h-full w-full object-cover object-center select-none"
              />
            </div>
          );
        })}

        {/* 2. SOMBRA SE HOUVER TEXTO CADASTRADO */}
        {hasTextContent && (
          <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-black/70 via-black/30 to-transparent w-full md:w-1/2" />
        )}

        {/* Sombra sutil no rodapé */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* 3. CONTEÚDO DE TEXTO */}
        {hasTextContent && (
          <div className="container-pad relative z-30 flex h-full items-end pb-10 md:items-center md:pb-0 pointer-events-none">
            <div className="max-w-xl pointer-events-auto">
              {slide.label && (
                <span className="mb-2 inline-block rounded-md bg-coral px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  {slide.label}
                </span>
              )}

              {slide.title && (
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl drop-shadow-md leading-none">
                  {slide.title}
                </h1>
              )}

              {slide.subtitle && (
                <p className="mt-3 max-w-lg text-xs sm:text-sm md:text-base leading-relaxed text-gray-100 drop-shadow">
                  {slide.subtitle}
                </p>
              )}

              <div className="mt-5 flex items-center gap-3">
                <a
                  href="/celulares"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-coral px-5 text-sm font-bold text-white hover:bg-coral/90 transition shadow-lg"
                >
                  <ShoppingCart size={18} />
                  Ver Celulares
                </a>

                <a
                  href="#sobre"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-black/40 px-5 text-sm font-bold text-white hover:bg-black/60 transition backdrop-blur-md border border-white/20"
                >
                  <Info size={18} />
                  Mais Informações
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 4. SETAS DE NAVEGAÇÃO LATERAIS */}
        <button
          onClick={() => move(-1)}
          className="absolute left-4 top-1/2 z-40 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white hover:bg-coral transition backdrop-blur-md border border-white/20 shadow-lg"
          aria-label="Slide anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => move(1)}
          className="absolute right-4 top-1/2 z-40 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white hover:bg-coral transition backdrop-blur-md border border-white/20 shadow-lg"
          aria-label="Próximo slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* 5. INDICADORES INFERIORES */}
        <div className="absolute bottom-4 right-6 z-40 flex gap-2">
          {slides.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActive(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === active
                  ? "w-8 bg-coral"
                  : "w-3 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir para o slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}