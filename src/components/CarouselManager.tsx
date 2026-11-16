"use client";

import { useEffect, useState } from "react";
import { supabase, uploadLojaMedia } from "@/lib/supabase";
import { Plus, Trash2, Edit, Upload, Palette } from "lucide-react";

export type BannerThemeKey =
  | "black"
  | "white"
  | "pink"
  | "green"
  | "purple"
  | "blue";

export const BANNER_THEMES: Record<
  BannerThemeKey,
  {
    name: string;
    swatch: string;
    containerBg: string;
    gradientOverlay: string;
    titleColor: string;
    subtitleColor: string;
    badgeClass: string;
    primaryBtn: string;
    secondaryBtn: string;
    hoverShadow: string;
    dotActive: string;
  }
> = {
  black: {
    name: "Preto",
    swatch: "bg-zinc-950 border-zinc-700",
    containerBg: "bg-[#111114]",
    gradientOverlay: "from-black/90 via-black/55 to-transparent",
    titleColor: "text-white",
    subtitleColor: "text-gray-200",
    badgeClass: "bg-coral text-white",
    primaryBtn: "bg-coral text-white hover:bg-coral/90",
    secondaryBtn:
      "bg-white/15 text-white border-white/25 hover:bg-white/25",
    hoverShadow: "hover:shadow-[0_24px_55px_rgba(255,107,107,0.25)]",
    dotActive: "bg-coral",
  },
  white: {
    name: "Branco",
    swatch: "bg-white border-gray-300",
    containerBg: "bg-white",
    gradientOverlay: "from-white/95 via-white/75 to-transparent",
    titleColor: "text-zinc-950",
    subtitleColor: "text-zinc-700",
    badgeClass: "bg-zinc-900 text-white",
    primaryBtn: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondaryBtn:
      "bg-black/10 text-zinc-900 border-black/15 hover:bg-black/15",
    hoverShadow: "hover:shadow-[0_24px_55px_rgba(0,0,0,0.18)]",
    dotActive: "bg-zinc-900",
  },
  pink: {
    name: "Rosa",
    swatch: "bg-pink-500 border-pink-300",
    containerBg: "bg-pink-950",
    gradientOverlay: "from-pink-950/90 via-pink-900/55 to-transparent",
    titleColor: "text-white",
    subtitleColor: "text-pink-100",
    badgeClass: "bg-pink-500 text-white",
    primaryBtn: "bg-pink-500 text-white hover:bg-pink-400",
    secondaryBtn:
      "bg-white/15 text-white border-pink-200/30 hover:bg-white/25",
    hoverShadow: "hover:shadow-[0_24px_55px_rgba(236,72,153,0.35)]",
    dotActive: "bg-pink-400",
  },
  green: {
    name: "Verde",
    swatch: "bg-emerald-500 border-emerald-300",
    containerBg: "bg-emerald-950",
    gradientOverlay: "from-emerald-950/90 via-emerald-900/55 to-transparent",
    titleColor: "text-white",
    subtitleColor: "text-emerald-100",
    badgeClass: "bg-emerald-500 text-white",
    primaryBtn: "bg-emerald-500 text-white hover:bg-emerald-400",
    secondaryBtn:
      "bg-white/15 text-white border-emerald-200/30 hover:bg-white/25",
    hoverShadow: "hover:shadow-[0_24px_55px_rgba(16,185,129,0.35)]",
    dotActive: "bg-emerald-400",
  },
  purple: {
    name: "Roxo",
    swatch: "bg-purple-600 border-purple-300",
    containerBg: "bg-purple-950",
    gradientOverlay: "from-purple-950/90 via-purple-900/55 to-transparent",
    titleColor: "text-white",
    subtitleColor: "text-purple-100",
    badgeClass: "bg-purple-500 text-white",
    primaryBtn: "bg-purple-500 text-white hover:bg-purple-400",
    secondaryBtn:
      "bg-white/15 text-white border-purple-200/30 hover:bg-white/25",
    hoverShadow: "hover:shadow-[0_24px_55px_rgba(168,85,247,0.35)]",
    dotActive: "bg-purple-400",
  },
  blue: {
    name: "Azul",
    swatch: "bg-blue-600 border-blue-300",
    containerBg: "bg-slate-950",
    gradientOverlay: "from-blue-950/90 via-blue-900/55 to-transparent",
    titleColor: "text-white",
    subtitleColor: "text-blue-100",
    badgeClass: "bg-blue-500 text-white",
    primaryBtn: "bg-blue-500 text-white hover:bg-blue-400",
    secondaryBtn:
      "bg-white/15 text-white border-blue-200/30 hover:bg-white/25",
    hoverShadow: "hover:shadow-[0_24px_55px_rgba(59,130,246,0.35)]",
    dotActive: "bg-blue-400",
  },
};

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  image: string;
  order: number;
  theme?: BannerThemeKey;
};

function ThemeSelector({
  value,
  onChange,
}: {
  value: BannerThemeKey;
  onChange: (theme: BannerThemeKey) => void;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-600">
        <Palette size={14} className="text-coral" />
        Tema de Fundo e Contraste das Letras
      </label>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(BANNER_THEMES) as BannerThemeKey[]).map((key) => {
          const item = BANNER_THEMES[key];
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                selected
                  ? "border-coral bg-coral/10 text-ink ring-2 ring-coral/30"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full border shadow-xs ${item.swatch}`}
              />
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CarouselManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newOrder, setNewOrder] = useState(1);
  const [newTheme, setNewTheme] = useState<BannerThemeKey>("black");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

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
      console.error("Erro ao carregar banners:", error);
    }
  }

  useEffect(() => {
    loadSlides();
  }, []);

  async function handleCreateSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!newFile) {
      alert("Por favor, selecione uma imagem ou GIF!");
      return;
    }

    if (!supabase) {
      alert(
        "Supabase não conectado! Confira o .env.local e reinicie o servidor (npm run dev)."
      );
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadLojaMedia(newFile, "banners");

      const { error } = await supabase.from("carousel_slides").insert({
        title: newTitle,
        subtitle: newSubtitle,
        label: newLabel,
        order: Number(newOrder),
        theme: newTheme,
        image: imageUrl,
      });

      if (error) throw error;

      setNewTitle("");
      setNewSubtitle("");
      setNewLabel("");
      setNewTheme("black");
      setNewFile(null);
      setNewOrder(slides.length + 1);

      alert("Novo banner adicionado com sucesso!");
      loadSlides();
    } catch (error: any) {
      console.error("Erro ao salvar banner:", error);
      alert(`Falha ao salvar banner: ${error?.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  }

  async function removeSlide(id: string) {
    if (!supabase) return;
    const confirmDelete = window.confirm("Deseja apagar esse banner?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("carousel_slides")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("Banner removido!");
      loadSlides();
    } catch (error: any) {
      console.error("Erro ao apagar:", error);
      alert(`Erro ao apagar: ${error?.message || "Erro desconhecido"}`);
    }
  }

  async function saveEdit() {
    if (!editing || !supabase) return;

    setLoading(true);
    try {
      let finalImageUrl = editing.image;

      if (editFile) {
        finalImageUrl = await uploadLojaMedia(editFile, "banners");
      }

      const { error } = await supabase
        .from("carousel_slides")
        .update({
          title: editing.title,
          subtitle: editing.subtitle,
          label: editing.label,
          order: Number(editing.order),
          theme: editing.theme || "black",
          image: finalImageUrl,
        })
        .eq("id", editing.id);

      if (error) throw error;

      setEditing(null);
      setEditFile(null);
      alert("Banner atualizado!");
      loadSlides();
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      alert(
        `Falha ao atualizar o banner: ${error?.message || "Erro desconhecido"}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-lg bg-white p-6 shadow-md border border-gray-100">
      <h2 className="mb-6 text-2xl font-black text-ink">Gerenciar carrossel</h2>

      <form
        onSubmit={handleCreateSlide}
        className="mb-10 rounded-md bg-cloud p-5 border border-black/5"
      >
        <h3 className="mb-4 text-lg font-bold text-ink flex items-center gap-2">
          <Plus size={20} className="text-coral" /> Cadastrar Novo Banner / GIF
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              Título
            </label>
            <input
              className="w-full rounded border border-gray-300 bg-white p-2.5 text-sm"
              placeholder="Ex: Oferta do Dia"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              Subtítulo
            </label>
            <input
              className="w-full rounded border border-gray-300 bg-white p-2.5 text-sm"
              placeholder="Ex: Preços de cair o queixo!"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              Tag / Selo (opcional)
            </label>
            <input
              className="w-full rounded border border-gray-300 bg-white p-2.5 text-sm"
              placeholder="Ex: M&B Celulares"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              Ordem de Exibição
            </label>
            <input
              type="number"
              className="w-full rounded border border-gray-300 bg-white p-2.5 text-sm"
              value={newOrder}
              onChange={(e) => setNewOrder(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-4">
          <ThemeSelector value={newTheme} onChange={setNewTheme} />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold text-gray-600">
            Imagem ou GIF (Alta Definição)
          </label>
          <input
            type="file"
            accept="image/*,.gif"
            onChange={(e) => setNewFile(e.target.files?.[0] || null)}
            className="w-full rounded border border-gray-300 bg-white p-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-coral px-6 py-2.5 font-bold text-white hover:bg-coral/90 transition"
        >
          <Upload size={18} />
          {loading ? "Enviando..." : "Adicionar Banner"}
        </button>
      </form>

      <div className="grid gap-6 md:grid-cols-3">
        {slides.map((slide) => {
          const themeInfo = BANNER_THEMES[slide.theme || "black"];
          return (
            <div
              key={slide.id}
              className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-xs transition hover:shadow-md"
            >
              <div
                className={`relative h-40 ${themeInfo.containerBg} flex items-center justify-center p-2`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-contain"
                />
                <span className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                  <span
                    className={`h-2.5 w-2.5 rounded-full border ${themeInfo.swatch}`}
                  />
                  {themeInfo.name}
                </span>
              </div>

              <div className="p-4">
                {slide.label && (
                  <span className="inline-block rounded bg-coral/10 px-2 py-0.5 text-xs font-bold text-coral mb-1">
                    {slide.label}
                  </span>
                )}

                <h3 className="font-black text-ink text-lg leading-tight">
                  {slide.title || "Sem título"}
                </h3>

                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {slide.subtitle || "Sem subtítulo"}
                </p>

                <div className="mt-3 text-xs font-bold text-gray-400">
                  Ordem: <span className="text-ink">{slide.order}</span>
                </div>

                <div className="mt-4 flex gap-2 border-t pt-3 border-gray-100">
                  <button
                    onClick={() => {
                      setEditing({ ...slide, theme: slide.theme || "black" });
                      setEditFile(null);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded bg-ink px-3 py-2 text-xs font-bold text-white hover:bg-black transition"
                  >
                    <Edit size={14} />
                    Editar
                  </button>

                  <button
                    onClick={() => removeSlide(slide.id)}
                    className="flex items-center justify-center gap-1.5 rounded bg-red-500/10 text-red-600 px-3 py-2 text-xs font-bold hover:bg-red-500 hover:text-white transition"
                  >
                    <Trash2 size={14} />
                    Apagar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-5 text-xl font-black text-ink">Editar Banner</h2>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Título
              </label>
              <input
                className="w-full rounded border p-2 text-sm"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Subtítulo
              </label>
              <input
                className="w-full rounded border p-2 text-sm"
                value={editing.subtitle}
                onChange={(e) =>
                  setEditing({ ...editing, subtitle: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Tag / Selo
              </label>
              <input
                className="w-full rounded border p-2 text-sm"
                value={editing.label}
                onChange={(e) =>
                  setEditing({ ...editing, label: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <ThemeSelector
                value={editing.theme || "black"}
                onChange={(theme) => setEditing({ ...editing, theme })}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Ordem
              </label>
              <input
                type="number"
                className="w-full rounded border p-2 text-sm"
                value={editing.order}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    order: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Substituir Imagem / GIF (Opcional)
              </label>
              <input
                type="file"
                accept="image/*,.gif"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                className="w-full rounded border bg-cloud p-2 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditing(null)}
                className="w-1/2 rounded border border-gray-300 p-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={saveEdit}
                disabled={loading}
                className="w-1/2 rounded bg-coral p-2 text-sm font-bold text-white hover:bg-coral/90"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}