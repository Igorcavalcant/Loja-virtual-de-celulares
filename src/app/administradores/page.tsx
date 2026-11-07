"use client";

import CarouselManager from "@/components/CarouselManager";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import ProductManager from "@/components/ProductManager";

import { db, storage } from "@/lib/firebase";

import {
  collection,
  addDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import {
  LogOut,
} from "lucide-react";

import imageCompression from "browser-image-compression";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();

  // Estados de Produto
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStorage, setProdStorage] = useState("");
  const [prodState, setProdState] = useState("Novo");
  const [prodWarranty, setProdWarranty] = useState("1 ano");
  const [prodColor, setProdColor] = useState("");
  const [prodStock, setProdStock] = useState("10");
  const [prodImage, setProdImage] = useState<File | null>(null);

  // Especificações técnicas adicionais
  const [prodProcessor, setProdProcessor] = useState("");
  const [prodPerformance, setProdPerformance] = useState("");
  const [prodCamera, setProdCamera] = useState("");
  const [prodScreen, setProdScreen] = useState("");
  const [prodBattery, setProdBattery] = useState("");

  const [loadingProd, setLoadingProd] = useState(false);
  const [prodProgress, setProdProgress] = useState<number | null>(null);

  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  // Envio de Produto
  async function handleSaveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (!prodName || !prodPrice) {
      alert("Preencha ao menos o nome e o preço do produto.");
      return;
    }

    setLoadingProd(true);
    setProdProgress(0);

    try {
      let imageUrl = "";

      if (prodImage) {
        const compressedFile = await imageCompression(prodImage, compressionOptions);
        const storageRef = ref(storage, `products/${Date.now()}_${prodImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        imageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setProdProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

      await addDoc(collection(db, "products"), {
        name: prodName,
        price: Number(prodPrice),
        storage: prodStorage,
        state: prodState,
        warranty: prodWarranty,
        color: prodColor,
        stock: Number(prodStock),
        processor: prodProcessor,
        performance: prodPerformance,
        camera: prodCamera,
        screen: prodScreen,
        battery: prodBattery,
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
        createdAt: new Date(),
      });

      alert("Produto cadastrado com sucesso!");

      setProdName("");
      setProdPrice("");
      setProdStorage("");
      setProdColor("");
      setProdStock("10");
      setProdProcessor("");
      setProdPerformance("");
      setProdCamera("");
      setProdScreen("");
      setProdBattery("");
      setProdImage(null);

      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar produto.");
    } finally {
      setLoadingProd(false);
      setProdProgress(null);
    }
  }

  // Verificações de acesso e estado de carregamento
  if (loading) {
    return (
      <section className="bg-cloud py-14">
        <div className="container-pad text-center">
          Carregando painel...
        </div>
      </section>
    );
  }

  if (!user) {
    router.push("/login?next=/administradores");
    return null;
  }

  if (user && !isAdmin) {
    return (
      <section className="bg-cloud py-14">
        <div className="container-pad rounded-md bg-white p-6">
          <h1 className="text-3xl font-black">Acesso negado</h1>
          <p>Essa área é só para o dono da loja.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cloud py-14">
      <div className="container-pad">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-ink">
            Controle da loja
          </h1>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>

        {/* APENAS O FORMULÁRIO DE PRODUTO NO TOPO */}
        <div className="max-w-2xl mb-10">
          <div className="rounded-md bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black mb-4">Novo Produto</h2>
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nome do produto"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="number"
                placeholder="Preço (R$)"
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Armazenamento (ex: 128GB)"
                value={prodStorage}
                onChange={(e) => setProdStorage(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Cor"
                value={prodColor}
                onChange={(e) => setProdColor(e.target.value)}
                className="border p-2 rounded text-sm"
              />

              {/* Especificações técnicas adicionais */}
              <input
                type="text"
                placeholder="Processador (ex: Snapdragon 8 Gen 2)"
                value={prodProcessor}
                onChange={(e) => setProdProcessor(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Desempenho (ex: Excelente para jogos)"
                value={prodPerformance}
                onChange={(e) => setProdPerformance(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Câmera (ex: 48MP com estabilização)"
                value={prodCamera}
                onChange={(e) => setProdCamera(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Tela (ex: OLED 120Hz)"
                value={prodScreen}
                onChange={(e) => setProdScreen(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Bateria (ex: 5000mAh)"
                value={prodBattery}
                onChange={(e) => setProdBattery(e.target.value)}
                className="border p-2 rounded text-sm"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProdImage(e.target.files?.[0] || null)}
                className="border p-2 rounded text-sm"
              />
              <button
                disabled={loadingProd}
                className="bg-coral text-white p-2 rounded font-medium disabled:opacity-50 hover:bg-coral/90 transition"
              >
                {loadingProd
                  ? `Enviando... ${prodProgress ?? 0}%`
                  : "Cadastrar Produto"}
              </button>
            </form>
          </div>
        </div>

        {/* GERENCIADORES */}
        <div className="flex flex-col gap-8">
          <ProductManager />
          <CarouselManager />
        </div>
      </div>
    </section>
  );
}