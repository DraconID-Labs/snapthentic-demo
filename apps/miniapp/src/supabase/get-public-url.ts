import { env } from "~/env";
import { supabase } from "./upload";

export function getPublicUrl(path: string) {
  const { data } = supabase.storage
    .from(env.SUPABASE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
