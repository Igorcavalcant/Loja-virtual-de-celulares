"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BadgeCheck,
  CreditCard,
  ShieldCheck,
  Truck
} from "lucide-react";

import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";


const benefits = [
  {
    icon: ShieldCheck,
    title: "Compra segura",
    text: "Aparelhos conferidos, garantia informada e atendimento transparente."
  },
  {
    icon: Truck,
    title: "Entrega rápida",
    text: "Pedido confirmado pelo WhatsApp e entrega combinada com praticidade."
  },
  {
    icon: CreditCard,
    title: "Até 12x",
    text: "Facilitamos a compra com opções de parcelamento para cada cliente."
  }
];


export default function Home() {

  // Produtos vindos do Firebase
  const [products, setProducts] = useState<Product[]>([]);


  // Busca os produtos cadastrados pelo ADM
  useEffect(() => {

    async function loadProducts() {

      try {

        const snapshot = await getDocs(
          collection(db, "products")
        );


        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];


        // Mostra apenas os 4 primeiros na Home
        setProducts(list.slice(0, 4));


      } catch (error) {

        console.error(
          "Erro ao carregar produtos:",
          error
        );

      }

    }


    loadProducts();

  }, []);



  return (
    <>

      {/* CARROSSEL PRINCIPAL */}
      <HeroCarousel />



      {/* BENEFÍCIOS */}
      <section className="bg-cloud py-14">

        <div className="container-pad grid gap-4 md:grid-cols-3">

          {benefits.map((benefit) => {

            const Icon = benefit.icon;


            return (

              <div
                key={benefit.title}
                className="rounded-md border border-black/10 bg-white p-5"
              >

                <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-moss text-white">

                  <Icon size={22} />

                </div>


                <h2 className="text-lg font-black text-ink">

                  {benefit.title}

                </h2>


                <p className="mt-2 text-sm leading-6 text-ink/60">

                  {benefit.text}

                </p>


              </div>

            );

          })}

        </div>

      </section>




      {/* CELULARES EM DESTAQUE */}
      <section
        id="celulares"
        className="bg-white py-16"
      >

        <div className="container-pad">


          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">


            <div>

              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-coral">

                <BadgeCheck size={17} />

                Catálogo

              </p>


              <h2 className="text-3xl font-black text-ink sm:text-4xl">

                Celulares em destaque

              </h2>


            </div>



            <Link

              href="/celulares"

              className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-5 text-sm font-black text-white transition hover:bg-moss"

            >

              Ver todos

            </Link>


          </div>




          {

            products.length === 0 ? (

              <div className="rounded-md bg-cloud p-8 text-center font-bold text-ink/60">

                Nenhum celular cadastrado ainda.

              </div>


            ) : (


              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">


                {products.map((product) => (

                  <ProductCard

                    key={product.id}

                    product={product}

                  />

                ))}


              </div>


            )

          }



        </div>


      </section>






      {/* SOBRE A LOJA */}
      <section
        id="sobre"
        className="bg-cloud py-16"
      >

        <div className="container-pad grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">


          <div>


            <p className="mb-2 text-sm font-black uppercase text-coral">

              Sobre a loja

            </p>



            <h2 className="text-3xl font-black leading-tight text-ink sm:text-4xl">

              Uma loja simples, bonita e feita para vender pelo WhatsApp.

            </h2>



            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/65">

              A M&B CELULARES reúne aparelhos selecionados, mostra as informações
              essenciais para o cliente decidir e leva a conversa direto para a
              vendedora. Menos etapas, mais confiança e atendimento humano.

            </p>


          </div>





          <div className="grid gap-4 sm:grid-cols-2">


            {[

              "Novos e seminovos",

              "Garantia informada",

              "Fotos e detalhes",

              "Pedido via WhatsApp"

            ].map((item) => (


              <div

                key={item}

                className="rounded-md border border-black/10 bg-white p-5"

              >


                <div className="mb-3 grid h-9 w-9 place-items-center rounded-md bg-gold/20 text-gold">

                  <BadgeCheck size={19} />

                </div>


                <p className="font-black text-ink">

                  {item}

                </p>


              </div>


            ))}


          </div>


        </div>


      </section>


    </>
  );

}