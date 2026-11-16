"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";

type DemoUser = {
  displayName?: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

type AuthContextValue = {
  user: User | DemoUser | null;
  loading: boolean;
  isDemoMode: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isDemoMode = !hasSupabaseConfig || !supabase;

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = Boolean(
    user?.email && adminEmails.includes(user.email.toLowerCase())
  );

  useEffect(() => {
    if (!supabase) {
      const saved = window.localStorage.getItem("iduu-demo-user");
      setUser(saved ? JSON.parse(saved) : null);
      setLoading(false);
      return;
    }

    // Carrega sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuta mudanças de login/logout em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loginWithEmail(email: string, password: string) {
    if (!supabase) {
      const demoUser = { displayName: "Cliente M&B CELULARES", email };
      window.localStorage.setItem("iduu-demo-user", JSON.stringify(demoUser));
      setUser(demoUser);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Se a conta ainda não existir, cria automaticamente
    if (signInError) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        throw signUpError;
      }
    }
  }

  async function loginWithGoogle() {
    if (!supabase) {
      const demoUser = {
        displayName: "Cliente Google",
        email: "cliente@exemplo.com",
      };
      window.localStorage.setItem("iduu-demo-user", JSON.stringify(demoUser));
      setUser(demoUser);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw error;
    }
  }

  async function logout() {
    if (!supabase) {
      window.localStorage.removeItem("iduu-demo-user");
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        isAdmin,
        loginWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}