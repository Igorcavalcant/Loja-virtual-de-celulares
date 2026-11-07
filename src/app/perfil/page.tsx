"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, PackageCheck, Phone, UserRound, Settings } from "lucide-react"; // Adicionei o ícone Settings
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading, isAdmin } = useAuth(); // Importando o isAdmin aqui

  if (!loading && !user) {
    router.push("/login?next=/perfil");
  }

  const name = user?.displayName || "Cliente M&B CELULARES";
  const email = user?.email || "cliente@email.com";

  return (
    <section className="bg-cloud py-14">
      <div className="container-pad">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-black uppercase text-coral">
              Área do cliente
            </p>
            <h1 className="text-4xl font-black text-ink">Olá, {name}</h1>
          </div>
          
          {/* Grupo de botões na direita */}
          <div className="flex gap-3">
            {/* O BOTÃO SECRETO DO ADM APARECE AQUI SE FOR O DONO DA LOJA */}
            {isAdmin && (
              <Link
                href="/administradores"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-black text-white transition hover:bg-opacity-90 shadow-sm"
              >
                <Settings size={16} />
                Painel do Dono
              </Link>
            )}

            <button
              onClick={() => void logout().then(() => router.push("/"))}
              className="inline-flex h-11 items-center justify-center rounded-md border border-black/10 bg-white px-4 text-sm font-black text-ink transition hover:bg-ink hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-md border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-md bg-moss text-white">
              <UserRound size={24} />
            </div>
            <h2 className="text-2xl font-black text-ink">Dados do cliente</h2>
            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-xs font-black uppercase text-ink/45">Email</p>
                <p className="mt-1 font-bold text-ink">{email}</p>
              </div>
              <div className="flex items-start gap-3 rounded-md bg-cloud p-4">
                <Phone size={19} className="mt-0.5 text-moss" />
                <div>
                  <p className="text-xs font-black uppercase text-ink/45">Telefone</p>
                  <p className="mt-1 font-bold text-ink">Cadastrar no atendimento</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md bg-cloud p-4">
                <MapPin size={19} className="mt-0.5 text-moss" />
                <div>
                  <p className="text-xs font-black uppercase text-ink/45">Endereço</p>
                  <p className="mt-1 font-bold text-ink">Informar pelo WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-md bg-coral text-white">
              <PackageCheck size={24} />
            </div>
            <h2 className="text-2xl font-black text-ink">Histórico de pedidos</h2>
            <div className="mt-5 rounded-md border border-dashed border-black/20 bg-cloud p-6 text-center">
              <p className="font-bold text-ink/65">
                Quando o cliente finalizar uma compra, o pedido pode aparecer aqui.
              </p>
              <Link
                href="/celulares"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-black text-white transition hover:bg-moss"
              >
                Ver celulares
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}