"use client";

import { ShoppingCart, Info, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BANNER_THEMES, type BannerThemeKey } from "./CarouselManager";

type Slide = {
  id: string;
  title?: string;
  subtitle?: string;
  label?: string;
  image: string;
  order: number;
  theme?: BannerThemeKey;
};

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  async function loadSlides() {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("carousel_slides")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      setSlides((data as Slide[]) || []);
    } catch (error) {
      console.error("Erro ao carregar slides:", error);
    }
  }

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const interval = setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const slide = slides[active];
  const theme = BANNER_THEMES[slide.theme || "black"] || BANNER_THEMES.black;
  const hasTextContent = Boolean(slide.title || slide.subtitle);

  function move(direction: number) {
    setActive((value) => (value + direction + slides.length) % slides.length);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (slides.length <= 1) return;
    dragStartX.current = e.clientX;
    isDragging.current = true;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || dragStartX.current === null) return;

    const diff = e.clientX - dragStartX.current;
    const threshold = 40;

    if (diff <= -threshold) {
      move(1);
    } else if (diff >= threshold) {
      move(-1);
    } else if (Math.abs(diff) < 15 && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 2) {
        move(-1);
      } else {
        move(1);
      }
    }

    dragStartX.current = null;
    isDragging.current = false;
  }

  function handlePointerCancel() {
    dragStartX.current = null;
    isDragging.current = false;
  }

  return (
    <div className="container-pad my-6">
      <section
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          handlePointerCancel();
        }}
        className={`group relative w-full overflow-hidden rounded-2xl ${theme.containerBg} shadow-[0_14px_35px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1 ${theme.hoverShadow}`}
      >
        {/* Reflexo luminoso sutil ao passar o mouse */}
        <div className="pointer-events-none absolute inset-0 z-30 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />

        {/* PALCO PRINCIPAL */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="relative aspect-[2.85/1] w-full overflow-hidden select-none touch-pan-y cursor-pointer"
        >
          {slides.map((item, index) => {
            const isActive = index === active;

            return (
              <div
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  isActive
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title || "Banner em destaque"}
                  draggable={false}
                  className="h-full w-full object-fill select-none transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                />
              </div>
            );
          })}

          {/* Badge flutuante no topo esquerdo (quando não há título/subtítulo) */}
          {slide.label && !hasTextContent && (
            <div
              className={`pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg ${theme.badgeClass}`}
            >
              <Sparkles size={12} />
              {slide.label}
            </div>
          )}

          {/* CONTEÚDO DE TEXTO COM CONTRASTE DO TEMA ESCOLHIDO */}
          {hasTextContent && (
            <>
              <div
                className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-r ${theme.gradientOverlay} w-full md:w-2/3 transition-all duration-500`}
              />
              <div className="relative z-30 flex h-full items-center px-6 sm:px-12 md:px-16 pointer-events-none">
                <div className="max-w-lg pointer-events-auto">
                  {slide.label && (
                    <span
                      className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-md ${theme.badgeClass}`}
                    >
                      <Sparkles size={12} />
                      {slide.label}
                    </span>
                  )}

                  {slide.title && (
                    <h1
                      className={`text-lg sm:text-3xl lg:text-5xl font-black tracking-tight leading-tight transition-colors duration-300 ${theme.titleColor}`}
                    >
                      {slide.title}
                    </h1>
                  )}

                  {slide.subtitle && (
                    <p
                      className={`mt-1.5 max-w-md text-xs sm:text-sm md:text-base line-clamp-2 font-medium transition-colors duration-300 ${theme.subtitleColor}`}
                    >
                      {slide.subtitle}
                    </p>
                  )}

                  <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2.5">
                    <a
                      href="/celulares"
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                      className={`inline-flex h-8 sm:h-10 items-center gap-2 rounded-lg px-3.5 sm:px-5 text-xs sm:text-sm font-black transition shadow-lg ${theme.primaryBtn}`}
                    >
                      <ShoppingCart size={15} />
                      Ver Celulares
                    </a>

                    <a
                      href="#sobre"
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                      className={`inline-flex h-8 sm:h-10 items-center gap-2 rounded-lg border px-3.5 sm:px-5 text-xs sm:text-sm font-bold transition backdrop-blur-md ${theme.secondaryBtn}`}
                    >
                      <Info size={15} />
                      Saiba Mais
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* BOTÃO VER OFERTAS NO CANTO INFERIOR DIREITO */}
          {!hasTextContent && (
            <a
              href="/celulares"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              className={`absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-30 inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-black shadow-lg transition duration-300 group-hover:scale-105 ${theme.primaryBtn}`}
            >
              <ShoppingCart size={14} />
              Ver ofertas
            </a>
          )}

          {/* PONTINHOS DISCRETOS NO CANTO INFERIOR ESQUERDO */}
          {slides.length > 1 && (
            <div className="absolute bottom-2.5 left-3 sm:bottom-4 sm:left-5 z-30 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 backdrop-blur-md">
              {slides.map((item, index) => {
                const isCurrent = index === active;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={() => setActive(index)}
                    aria-label={`Ir para o banner ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? `w-6 ${theme.dotActive}`
                        : "w-2 bg-white/60 hover:bg-white"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}