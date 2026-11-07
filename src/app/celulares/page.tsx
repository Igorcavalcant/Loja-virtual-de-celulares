"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";

export default function PhonesPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);


  // Busca somente produtos cadastrados no painel ADM
  useEffect(() => {

    async function loadProducts(){

      const snapshot = await getDocs(
        collection(db,"products")
      );

      const list = snapshot.docs.map((doc)=>({
        id:doc.id,
        ...doc.data()
      })) as Product[];

      setProducts(list);
      setLoading(false);

    }

    loadProducts();

  },[]);



  if(loading){
    return (
      <div className="p-10 text-center">
        Carregando celulares...
      </div>
    );
  }



  return (
    <section className="bg-cloud py-14">

      <div className="container-pad">

        <div className="mb-8">
          <p className="mb-2 text-sm font-black uppercase text-coral">
            Celulares
          </p>

          <h1 className="text-4xl font-black text-ink">
            Catálogo da loja
          </h1>

        </div>


        {products.length === 0 ? (

          <div className="rounded-md bg-white p-10 text-center">
            Nenhum celular cadastrado ainda.
          </div>

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {products.map(product=>(
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        )}


      </div>

    </section>
  );
}