"use client";

import { useEffect, useState } from "react";
import { supabase, uploadLojaMedia } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { Product } from "@/lib/products";
import { Edit, Trash2, X } from "lucide-react";

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estados dos campos de texto
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStorage, setEditStorage] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editState, setEditState] = useState("");
  const [editWarranty, setEditWarranty] = useState("");
  const [editStock, setEditStock] = useState("");

  // Novas especificações
  const [editProcessor, setEditProcessor] = useState("");
  const [editPerformance, setEditPerformance] = useState("");
  const [editCamera, setEditCamera] = useState("");
  const [editScreen, setEditScreen] = useState("");
  const [editBattery, setEditBattery] = useState("");

  // Estados para as 4 Fotos
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const [saving, setSaving] = useState(false);

  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  async function loadProducts() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      return;
    }

    setProducts((data as Product[]) || []);
  }

  useEffect(() => {
    loadProducts();

    const client = supabase;
    if (!client) return;

    // Escuta mudanças na tabela products em tempo real
    const channel = client
      .channel("products-admin-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setEditName(product.name || "");
    setEditPrice(String(product.price || ""));
    setEditStorage(product.storage || "");
    setEditColor(product.color || "");
    setEditState(product.state || "Novo");
    setEditWarranty(product.warranty || "1 ano");
    setEditStock(String(product.stock ?? 10));

    setEditProcessor(product.processor || "");
    setEditPerformance(product.performance || "");
    setEditCamera(product.camera || "");
    setEditScreen(product.screen || "");
    setEditBattery(product.battery || "");

    const imgs =
      product.images && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];
    setExistingImages(imgs);
    setNewImageFiles([null, null, null, null]);
  }

  function handleFileChange(index: number, file: File | null) {
    const updatedFiles = [...newImageFiles];
    updatedFiles[index] = file;
    setNewImageFiles(updatedFiles);
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct || !supabase) return;

    setSaving(true);

    try {
      const finalImages = [...existingImages];

      // Fazer upload das novas fotos selecionadas
      for (let i = 0; i < 4; i++) {
        const file = newImageFiles[i];
        if (file) {
          const compressed = await imageCompression(file, compressionOptions);
          const url = await uploadLojaMedia(compressed, "products");
          finalImages[i] = url;
        }
      }

      const validImages = finalImages.filter((img) => Boolean(img));
      const mainImage = validImages[0] || editingProduct.image || "";

      const { error } = await supabase
        .from("products")
        .update({
          name: editName,
          price: Number(editPrice),
          storage: editStorage,
          color: editColor,
          state: editState,
          warranty: editWarranty,
          stock: Number(editStock),
          processor: editProcessor,
          performance: editPerformance,
          camera: editCamera,
          screen: editScreen,
          battery: editBattery,
          image: mainImage,
          images: validImages,
        })
        .eq("id", editingProduct.id);

      if (error) {
        throw error;
      }

      alert("Produto atualizado com sucesso!");
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o produto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!supabase) return;
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        loadProducts();
      } catch (error) {
        console.error(error);
        alert("Erro ao excluir produto.");
      }
    }
  }

  return (
    <div className="rounded-md bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black mb-4">Produtos Cadastrados</h2>

      {/* Lista de Produtos */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((item) => (
          <div
            key={item.id}
            className="border p-4 rounded-lg flex flex-col justify-between"
          >
            <div>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-32 object-contain mb-2 rounded"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 mb-2 rounded flex items-center justify-center text-xs text-gray-400">
                  Sem foto
                </div>
              )}
              <h3 className="font-bold text-sm">{item.name}</h3>
              <p className="text-xs text-gray-500">
                R$ {item.price} | {item.storage}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => openEditModal(item)}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-xs p-2 rounded transition"
              >
                <Edit className="w-3 h-3" /> Editar
              </button>
              <button
                onClick={() => handleDeleteProduct(item.id)}
                className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black mb-4">Editar celular</h3>

            <form onSubmit={handleUpdateProduct} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600">
                  Nome do produto
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">
                  Armazenamento
                </label>
                <input
                  type="text"
                  value={editStorage}
                  onChange={(e) => setEditStorage(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Cor</label>
                <input
                  type="text"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Estado</label>
                <input
                  type="text"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">
                  Garantia
                </label>
                <input
                  type="text"
                  value={editWarranty}
                  onChange={(e) => setEditWarranty(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">
                  Estoque
                </label>
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              {/* Especificações Técnicas */}
              <div>
                <label className="text-xs font-bold text-gray-600">
                  Processador
                </label>
                <input
                  type="text"
                  value={editProcessor}
                  placeholder="ex: Snapdragon 8 Gen 2"
                  onChange={(e) => setEditProcessor(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">
                  Desempenho
                </label>
                <input
                  type="text"
                  value={editPerformance}
                  placeholder="ex: Rápido e fluído"
                  onChange={(e) => setEditPerformance(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Câmera</label>
                <input
                  type="text"
                  value={editCamera}
                  placeholder="ex: 50MP + 8MP"
                  onChange={(e) => setEditCamera(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Tela</label>
                <input
                  type="text"
                  value={editScreen}
                  placeholder="ex: AMOLED 120Hz"
                  onChange={(e) => setEditScreen(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">
                  Bateria
                </label>
                <input
                  type="text"
                  value={editBattery}
                  placeholder="ex: 5000mAh"
                  onChange={(e) => setEditBattery(e.target.value)}
                  className="border p-2 rounded text-sm w-full mt-1"
                />
              </div>

              {/* Seção das 4 Imagens */}
              <div className="border rounded-md p-4 bg-gray-50 mt-2">
                <h4 className="font-bold text-sm mb-3">
                  Imagens do produto (Até 4 fotos)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const previewUrl = newImageFiles[idx]
                      ? URL.createObjectURL(newImageFiles[idx]!)
                      : existingImages[idx];

                    return (
                      <div
                        key={idx}
                        className="border bg-white p-2 rounded flex flex-col gap-2"
                      >
                        <span className="text-xs font-semibold text-gray-500">
                          {idx === 0 ? "Foto Principal" : `Foto ${idx + 1}`}
                        </span>

                        <div className="h-28 w-full border rounded flex items-center justify-center bg-gray-50 overflow-hidden">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={`Foto ${idx + 1}`}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">
                              Sem imagem
                            </span>
                          )}
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(idx, e.target.files?.[0] || null)
                          }
                          className="text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-coral text-white font-bold p-3 rounded-md hover:opacity-90 disabled:opacity-50 transition mt-4 w-full"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}