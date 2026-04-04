import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (email) => {
    if (!supabase) { setIsAdmin(true); return; }
    const adminStatus = await db.isAdmin(email);
    setIsAdmin(adminStatus);

    // If no admins exist yet, make this user the owner (first signup)
    if (!adminStatus) {
      const admins = await db.getAdmins();
      if (admins.length === 0) {
        await db.makeOwner(email);
        setIsAdmin(true);
      }
    }
  };

  useEffect(() => {
    if (!supabase) {
      const demo = localStorage.getItem("fc_demo_user");
      if (demo) {
        const parsed = JSON.parse(demo);
        setUser(parsed);
        setIsAdmin(true);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await checkAdmin(u.email);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await checkAdmin(u.email);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) {
      const demoUser = { id: "demo", email, role: "admin" };
      localStorage.setItem("fc_demo_user", JSON.stringify(demoUser));
      setUser(demoUser);
      setIsAdmin(true);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const adminStatus = await db.isAdmin(email);
      if (!adminStatus) {
        await supabase.auth.signOut();
        return { error: { message: "You don't have admin access. Ask the club owner to invite you." } };
      }
    }
    return { error };
  };

  const signUp = async (email, password) => {
    if (!supabase) {
      const demoUser = { id: "demo", email, role: "admin" };
      localStorage.setItem("fc_demo_user", JSON.stringify(demoUser));
      setUser(demoUser);
      setIsAdmin(true);
      return { error: null };
    }

    // Check if email is invited or if no admins exist yet
    const adminStatus = await db.isAdmin(email);
    const admins = await db.getAdmins();

    if (!adminStatus && admins.length > 0) {
      return { error: { message: "You need an admin invite to sign up. Ask the club owner to add your email." } };
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (!error) {
      // If first user, make owner
      if (admins.length === 0) {
        await db.makeOwner(email);
      }
      setIsAdmin(true);
    }
    return { error };
  };

  const signOut = async () => {
    if (!supabase) {
      localStorage.removeItem("fc_demo_user");
      setUser(null);
      setIsAdmin(false);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
