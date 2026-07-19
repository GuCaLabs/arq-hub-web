"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User, redirectPath?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login", "/magic-link"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const login = useCallback((accessToken: string, refreshToken: string, userData: User, redirectPath?: string) => {
    localStorage.setItem("arqhub_access_token", accessToken);
    localStorage.setItem("arqhub_refresh_token", refreshToken);
    localStorage.setItem("arqhub_user", JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    router.push(redirectPath || "/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    void signOut(getFirebaseAuth()).catch(() => {
      // A sessão da API ainda deve ser encerrada se a configuração do Firebase falhar.
    });
    localStorage.removeItem("arqhub_access_token");
    localStorage.removeItem("arqhub_refresh_token");
    localStorage.removeItem("arqhub_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("arqhub_access_token");
      const storedUser = localStorage.getItem("arqhub_user");
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [logout]);

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!token && !isPublicRoute) {
      router.replace("/login");
    } else if (token && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [token, pathname, isLoading, router]);


  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
