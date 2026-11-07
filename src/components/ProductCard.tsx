import Link from "next/link";
import { Cpu, HardDrive, ShieldCheck } from "lucide-react";

import { formatPrice, type Product } from "@/lib/products";
import { BuyButton } from "./BuyButton";


export function ProductCard({ product }: { product: Product }) {

  return (

    <article className="overflow-hidden rounded-md border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">


      <Link href={`/produto/${product.id}`} className="block">

        <div className="aspect-[4/3] overflow-hidden bg-white">

          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />

        </div>

      </Link>




      <div className="p-5">


        <div className="mb-3 flex items-center justify-between gap-3">


          <span className="rounded-md bg-moss/10 px-2.5 py-1 text-xs font-black text-moss">

            {product.state || "Novo"}

          </span>



          <span className="text-xs font-bold text-ink/50">

            {product.color || "Sem cor"}

          </span>


        </div>





        <Link href={`/produto/${product.id}`}>

          <h3 className="text-xl font-black text-ink">

            {product.name}

          </h3>

        </Link>




        <p className="mt-1 text-sm font-semibold text-ink/55">

          {product.storage}

        </p>





        <div className="mt-4 text-2xl font-black text-ink">

          {formatPrice(product.price)}

        </div>







        <div className="mt-4 grid gap-2 text-sm text-ink/65">


          <div className="flex items-center gap-2">

            <HardDrive size={16} className="text-moss" />

            {product.storage} de armazenamento

          </div>





          <div className="flex items-center gap-2">

            <Cpu size={16} className="text-moss" />

            {product.specs?.[0] || "5G"}

          </div>





          <div className="flex items-center gap-2">

            <ShieldCheck size={16} className="text-moss" />

            {product.warranty || "Garantia de 1 ano"}

          </div>



        </div>







        <div className="mt-5 grid grid-cols-2 gap-3">


          <Link
            href={`/produto/${product.id}`}
            className="inline-flex h-12 items-center justify-center rounded-md border border-black/10 text-sm font-black text-ink transition hover:bg-cloud"
          >

            Ver detalhes

          </Link>





          <BuyButton 
            product={product} 
            label="Comprar" 
            full 
          />


        </div>



      </div>


    </article>

  );

}