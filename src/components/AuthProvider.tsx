"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import { getFirebaseAuth, googleProvider, hasFirebaseConfig } from "@/lib/firebase";

type DemoUser = {
  displayName: string;
  email: string;
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
  const auth = useMemo(() => getFirebaseAuth(), []);
  const isDemoMode = !hasFirebaseConfig || !auth;
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const isAdmin = Boolean(
  user?.email && adminEmails.includes(user.email.toLowerCase())
);

  useEffect(() => {
    if (!auth) {
      const saved = window.localStorage.getItem("iduu-demo-user");
      setUser(saved ? JSON.parse(saved) : null);
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
  }, [auth]);

  async function loginWithEmail(email: string, password: string) {
    if (!auth) {
      const demoUser = { displayName: "Cliente M%B CELULARES", email };
      window.localStorage.setItem("iduu-demo-user", JSON.stringify(demoUser));
      setUser(demoUser);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      await createUserWithEmailAndPassword(auth, email, password);
    }
  }

  async function loginWithGoogle() {
    if (!auth) {
      const demoUser = {
        displayName: "Cliente Google",
        email: "cliente@exemplo.com"
      };
      window.localStorage.setItem("iduu-demo-user", JSON.stringify(demoUser));
      setUser(demoUser);
      return;
    }

    await signInWithPopup(auth, googleProvider);
  }

  async function logout() {
    if (!auth) {
      window.localStorage.removeItem("iduu-demo-user");
      setUser(null);
      return;
    }

    await signOut(auth);
  }

  return (
    <AuthContext.Provider
    value={{ user, loading, isDemoMode, isAdmin, loginWithEmail, loginWithGoogle, logout }}
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
