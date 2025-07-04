import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

export async function uploadToSupabase(file: Buffer, path: string) {
  const { data, error } = await supabase.storage
    .from(env.SUPABASE_BUCKET)
    .upload(path, file, {
      contentType: "image/jpeg",
    });

  if (error) {
    console.error(error);
    console.dir(error, { depth: null });
    throw error;
  }

  return data;
}
