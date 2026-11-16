// Tipo padrão dos produtos cadastrados no Supabase
export type Product = {
  id: string;
  name: string;
  storage: string;
  price: number;

  // Aceita Novo, Seminovo, Vitrine, Usado...
  state?: string;
  warranty?: string;
  highlight?: string;
  specs?: string[];
  color?: string;

  image: string; // Imagem principal
  images?: string[]; // Array com até 4 imagens (Principal + Secundárias)
  stock?: number;
  created_at?: string;
  createdAt?: any;

  // Especificações técnicas adicionais:
  processor?: string;
  performance?: string;
  camera?: string;
  screen?: string;
  battery?: string;
};

// Formata preço para Real brasileiro
export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}