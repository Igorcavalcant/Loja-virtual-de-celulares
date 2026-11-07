"use client";
import Link from "next/link";
import { LogIn, Menu, Smartphone, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/", label: "Início" },
  { href: "/celulares", label: "Celulares" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-cloud/95 backdrop-blur">
      <nav className="container-pad flex h-20 items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-xl font-black text-ink">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-moss text-white">
            <Smartphone size={24} strokeWidth={2.4} />
          </span>
          M&B CELULARES
        </Link>

        {/* Links de navegação — desktop */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-ink/70 transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ==========================================================
            MENU DO USUÁRIO — DESKTOP
            Três estados: não logado | cliente | administrador
        ========================================================== */}
        <div className="hidden items-center gap-3 md:flex">

          {/* Aguarda o Firebase carregar antes de renderizar */}
          {!loading && (
            <>
              {/* Não logado */}
              {!user && (
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-moss"
                >
                  <LogIn size={18} />
                  Entrar
                </Link>
              )}

              {/* Cliente comum */}
              {user && !isAdmin && (
                <Link
                  href="/perfil"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-moss"
                >
                  <UserRound size={18} />
                  Minha Conta
                </Link>
              )}

              {/* Administrador */}
              {user && isAdmin && (
                <div className="flex gap-2">
                  <Link
                    href="/administradores"
                    className="inline-flex h-11 items-center rounded-md bg-coral px-4 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    Painel ADM
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center rounded-md border border-black/10 bg-white px-4 text-sm font-bold text-ink transition hover:bg-cloud"
                  >
                    Ver Loja
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Botão hambúrguer — mobile */}
        <button
          className="grid h-11 w-11 place-items-center rounded-md border border-black/10 bg-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* ==========================================================
          MENU MOBILE
      ========================================================== */}
      {open && (
        <div className="border-t border-black/10 bg-white md:hidden">
          <div className="container-pad flex flex-col gap-1 py-4">

            {/* Links de navegação */}
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-3 font-semibold text-ink/75"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* ==========================================================
                MENU DO USUÁRIO — MOBILE
                Mesma lógica de três estados
            ========================================================== */}
            {!loading && (
              <>
                {/* Não logado */}
                {!user && (
                  <Link
                    href="/login"
                    className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-bold text-white"
                    onClick={() => setOpen(false)}
                  >
                    <LogIn size={18} />
                    Entrar
                  </Link>
                )}

                {/* Cliente comum */}
                {user && !isAdmin && (
                  <Link
                    href="/perfil"
                    className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-bold text-white"
                    onClick={() => setOpen(false)}
                  >
                    <UserRound size={18} />
                    Minha Conta
                  </Link>
                )}

                {/* Administrador */}
                {user && isAdmin && (
                  <>
                    <Link
                      href="/administradores"
                      className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-coral px-4 font-bold text-white"
                      onClick={() => setOpen(false)}
                    >
                      Painel ADM
                    </Link>
                    <Link
                      href="/"
                      className="mt-2 inline-flex h-11 items-center justify-center rounded-md border border-black/10 bg-white px-4 font-bold text-ink"
                      onClick={() => setOpen(false)}
                    >
                      Ver Loja
                    </Link>
                  </>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
