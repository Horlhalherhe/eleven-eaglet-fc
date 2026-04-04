import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isDemo = !supabase;

/* ─── Player Functions ─── */
export const db = {
  // Players
  async getPlayers(approvedOnly = true) {
    if (!supabase) return [];
    const query = supabase.from("players").select("*").order("name");
    if (approvedOnly) query.eq("approved", true);
    const { data } = await query;
    return data || [];
  },

  async getPendingPlayers() {
    if (!supabase) return [];
    const { data } = await supabase.from("players").select("*").eq("approved", false).order("created_at", { ascending: false });
    return data || [];
  },

  async addPlayer(player) {
    if (!supabase) return null;
    const { data, error } = await supabase.from("players").insert(player).select().single();
    if (error) throw error;
    return data;
  },

  async updatePlayer(id, updates) {
    if (!supabase) return null;
    const { data } = await supabase.from("players").update(updates).eq("id", id).select().single();
    return data;
  },

  async deletePlayer(id) {
    if (!supabase) return;
    await supabase.from("players").delete().eq("id", id);
  },

  async approvePlayer(id) {
    return db.updatePlayer(id, { approved: true });
  },

  // Photo upload
  async uploadPhoto(file) {
    if (!supabase) return null;
    const ext = file.name.split(".").pop();
    const name = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("photos").upload(name, file);
    if (error) throw error;
    const { data } = supabase.storage.from("photos").getPublicUrl(name);
    return data.publicUrl;
  },

  // Matches
  async getMatches() {
    if (!supabase) return [];
    const { data } = await supabase.from("matches").select("*").order("date", { ascending: true });
    return data || [];
  },

  async addMatch(match) {
    if (!supabase) return null;
    const { data } = await supabase.from("matches").insert(match).select().single();
    return data;
  },

  async updateMatch(id, updates) {
    if (!supabase) return null;
    const { data } = await supabase.from("matches").update(updates).eq("id", id).select().single();
    return data;
  },

  // Feed
  async getFeed() {
    if (!supabase) return [];
    const { data } = await supabase.from("feed").select("*").order("created_at", { ascending: false });
    return data || [];
  },

  async addFeedPost(post) {
    if (!supabase) return null;
    const { data } = await supabase.from("feed").insert(post).select().single();
    return data;
  },

  // Settings
  async getSettings() {
    if (!supabase) return null;
    const { data } = await supabase.from("club_settings").select("*").eq("key", "main").single();
    return data?.value || null;
  },

  async saveSettings(settings) {
    if (!supabase) return;
    await supabase.from("club_settings").upsert({ key: "main", value: settings }, { onConflict: "key" });
  },

  // Admins
  async isAdmin(email) {
    if (!supabase) return true; // demo mode = everyone is admin
    const { data } = await supabase.from("admins").select("*").eq("email", email.toLowerCase()).single();
    return !!data;
  },

  async getAdmins() {
    if (!supabase) return [];
    const { data } = await supabase.from("admins").select("*").order("created_at");
    return data || [];
  },

  async inviteAdmin(email, invitedBy) {
    if (!supabase) return null;
    const { data, error } = await supabase.from("admins").insert({
      email: email.toLowerCase().trim(),
      role: "admin",
      invited_by: invitedBy,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async removeAdmin(id) {
    if (!supabase) return;
    await supabase.from("admins").delete().eq("id", id);
  },

  async makeOwner(email) {
    if (!supabase) return;
    // Add as admin with owner role
    await supabase.from("admins").upsert({
      email: email.toLowerCase().trim(),
      role: "owner",
    }, { onConflict: "email" });
  },
};
