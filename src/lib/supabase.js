import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n" +
    "Running in demo mode with local storage."
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/* ─── Local Storage Fallback (demo mode) ─── */
const LS_PREFIX = "fc_emerald_";

export const storage = {
  async get(key) {
    if (supabase) {
      const { data, error } = await supabase.from("club_data").select("value").eq("key", key).single();
      if (error) return null;
      return data?.value;
    }
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  },
  async set(key, value) {
    if (supabase) {
      const { error } = await supabase.from("club_data").upsert({ key, value }, { onConflict: "key" });
      return !error;
    }
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
    return true;
  },
  async delete(key) {
    if (supabase) {
      await supabase.from("club_data").delete().eq("key", key);
    } else {
      localStorage.removeItem(LS_PREFIX + key);
    }
  },
};
