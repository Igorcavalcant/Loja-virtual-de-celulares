import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseUrl =
  rawUrl && !rawUrl.startsWith("http")
    ? `https://${rawUrl}.supabase.co`
    : rawUrl;

const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Faz upload de um arquivo para o bucket público 'loja-midias'
 * e retorna a URL pública pronta para salvar no banco.
 */
export async function uploadLojaMedia(
  file: File,
  folder: "products" | "banners"
): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase não está configurado no .env.local");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${folder}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("loja-midias")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("loja-midias")
    .getPublicUrl(filePath);

  return data.publicUrl;
}