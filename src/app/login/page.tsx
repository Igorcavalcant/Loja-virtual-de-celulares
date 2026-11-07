"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Product } from "@/lib/products";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    user,
    loginWithEmail,
    loginWithGoogle,
    isDemoMode,
    isAdmin,
    loading
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const next = searchParams.get("next") || "/perfil";
  const buy = searchParams.get("buy");


  // Redirecionamento automático após login
  useEffect(() => {

    if (!loading && user) {

      if (isAdmin) {
        router.push("/administradores");
      } else {
        router.push(next);
      }

    }

  }, [user, isAdmin, loading, next, router]);



  async function finishLogin(action: () => Promise<void>) {

    setBusy(true);
    setError("");

    try {

      await action();


      // Caso tenha vindo de um botão "Comprar"
      // busca o produto diretamente no Firebase
      if (buy) {

        const productRef = doc(
          db,
          "products",
          buy
        );


        const productSnap = await getDoc(productRef);



       if (productSnap.exists()) {
  const product: Product = {
    id: productSnap.id,
    ...(productSnap.data() as Omit<Product, "id">),
  };

  window.open(
    buildWhatsAppLink(product),
    "_blank",
    "noopener,noreferrer"
  );
}

      }


    } catch {

      setError(
        "Não foi possível entrar agora. Confira os dados e tente novamente."
      );

      setBusy(false);

    }

  }



  if (loading || (user && isAdmin)) {

    return (
      <div className="grid h-screen place-items-center bg-cloud font-bold text-ink">
        Identificando administrador...
      </div>
    );

  }



  return (

    <section className="bg-cloud py-14">

      <div className="container-pad grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">


        <div>

          <p className="mb-2 text-sm font-black uppercase text-coral">
            Login Obrigatório
          </p>


          <h1 className="text-4xl font-black leading-tight text-ink sm:text-5xl">
            Faça login para continuar sua compra.
          </h1>


          <p className="mt-5 max-w-xl text-base leading-8 text-ink/65">
            Depois de entrar, o pedido abre no WhatsApp com a mensagem do celular escolhido já pronta.
          </p>


          {isDemoMode && (

            <div className="mt-6 rounded-md border border-gold/40 bg-gold/15 p-4 text-sm font-semibold leading-6 text-[#6a4d0f]">

              Firebase ainda não configurado. O login está em modo demonstração para você testar o fluxo completo.

            </div>

          )}

        </div>




        <div className="rounded-md border border-black/10 bg-white p-6 shadow-soft">


          <div className="mb-6 grid h-12 w-12 place-items-center rounded-md bg-moss text-white">

            <LogIn size={24}/>

          </div>



          <form
            className="grid gap-4"
            onSubmit={(event)=>{

              event.preventDefault();

              void finishLogin(
                () => loginWithEmail(email,password)
              );

            }}
          >


            <label className="grid gap-2 text-sm font-black text-ink">

              Email

              <input
                type="email"
                value={email}
                onChange={(event)=>setEmail(event.target.value)}
                placeholder="cliente@email.com"
                required
                className="h-12 rounded-md border border-black/10 bg-cloud px-4 text-base font-semibold outline-none ring-moss/20 transition focus:ring-4"
              />

            </label>



            <label className="grid gap-2 text-sm font-black text-ink">

              Senha

              <input
                type="password"
                value={password}
                onChange={(event)=>setPassword(event.target.value)}
                placeholder="Digite sua senha"
                required
                minLength={6}
                className="h-12 rounded-md border border-black/10 bg-cloud px-4 text-base font-semibold outline-none ring-moss/20 transition focus:ring-4"
              />

            </label>




            {error && (

              <p className="rounded-md bg-coral/10 p-3 text-sm font-bold text-coral">

                {error}

              </p>

            )}






            <button
              disabled={busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-black text-white transition hover:bg-moss disabled:cursor-wait disabled:opacity-70"
            >

              <Mail size={18}/>

              Entrar com email

            </button>



          </form>




          <div className="my-5 h-px bg-black/10"/>




          <button
            onClick={() => void finishLogin(loginWithGoogle)}
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 text-sm font-black text-ink transition hover:bg-cloud disabled:cursor-wait disabled:opacity-70"
          >

            <Sparkles size={18} className="text-coral"/>

            Entrar com Google

          </button>



        </div>


      </div>


    </section>

  );

}



export default function LoginPage(){

  return (

    <Suspense>

      <LoginContent/>

    </Suspense>

  );

}