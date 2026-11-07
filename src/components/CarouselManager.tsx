"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Plus, Trash2, Edit, Upload, Image as ImageIcon } from "lucide-react";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  image: string;
  order: number;
};

export default function CarouselManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para Criar Novo Banner
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newOrder, setNewOrder] = useState(1);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  async function loadSlides() {
    try {
      const snapshot = await getDocs(collection(db, "carouselSlides"));
      const list = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Slide[];

      setSlides(list.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
    }
  }

  useEffect(() => {
    loadSlides();
  }, []);

  // Upload DIRETO para o Firebase Storage (Sem compressão = Mantém GIFs e qualidade HD)
  async function uploadFileDirect(file: File): Promise<string> {
    const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  }

  // ADICIONAR NOVO BANNER
  async function handleCreateSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!newFile) {
      alert("Por favor, selecione uma imagem ou GIF!");
      return;
    }

    setLoading(true);
    try {
      // Faz o upload do arquivo mantendo 100% da qualidade/GIF
      const imageUrl = await uploadFileDirect(newFile);

      await addDoc(collection(db, "carouselSlides"), {
        title: newTitle,
        subtitle: newSubtitle,
        label: newLabel,
        order: Number(newOrder),
        image: imageUrl,
      });

      // Limpa os campos
      setNewTitle("");
      setNewSubtitle("");
      setNewLabel("");
      setNewFile(null);
      setNewOrder(slides.length + 1);

      alert("Novo banner adicionado com sucesso!");
      loadSlides();
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      alert("Falha ao salvar banner.");
    } finally {
      setLoading(false);
    }
  }

  // DELETAR BANNER
  async function removeSlide(id: string) {
    const confirmDelete = window.confirm("Deseja apagar esse banner?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "carouselSlides", id));
      alert("Banner removido!");
      loadSlides();
    } catch (error) {
      console.error("Erro ao apagar:", error);
    }
  }

  // SALVAR EDIÇÃO
  async function saveEdit() {
    if (!editing) return;

    setLoading(true);
    try {
      let finalImageUrl = editing.image;

      // Se o usuário selecionou uma nova imagem no modal de edição
      if (editFile) {
        finalImageUrl = await uploadFileDirect(editFile);
      }

      await updateDoc(doc(db, "carouselSlides", editing.id), {
        title: editing.title,
        subtitle: editing.subtitle,
        label: editing.label,
        order: Number(editing.order),
        image: finalImageUrl,
      });

      setEditing(null);
      setEditFile(null);
      alert("Banner atualizado!");
      loadSlides();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Falha ao atualizar o banner.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-lg bg-white p-6 shadow-md border border-gray-100">
      <h2 className="mb-6 text-2xl font-black text-ink">Gerenciar carrossel</h2>

      {/* FORMULÁRIO DE NOVO BANNER */}
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
              className="w-full rounded border border-gray-300 p-2.5 text-sm"
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
              className="w-full rounded border border-gray-300 p-2.5 text-sm"
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
              className="w-full rounded border border-gray-300 p-2.5 text-sm"
              placeholder="Ex: Lojinha da Brubss"
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
              className="w-full rounded border border-gray-300 p-2.5 text-sm"
              value={newOrder}
              onChange={(e) => setNewOrder(Number(e.target.value))}
            />
          </div>
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

      {/* LISTA DE BANNERS CADASTRADOS */}
      <div className="grid gap-6 md:grid-cols-3">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-xs transition hover:shadow-md"
          >
            <div className="relative h-40 bg-black/90 flex items-center justify-center p-2">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-contain"
              />
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
                    setEditing(slide);
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
        ))}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
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