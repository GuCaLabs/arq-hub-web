"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/proxy-login" : "/api/auth/proxy-signup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(data.data.accessToken, data.data.refreshToken, data.data.user);
      } else {
        setError(data.message || (isLogin ? "Credenciais inválidas" : "Erro ao criar conta"));
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (providerName: 'google' | 'apple') => {
    setIsLoading(true);
    setError("");
    try {
      const configRes = await fetch("/api/auth/firebase-config");
      const configData = await configRes.json();

      if (!configData.success) {
        throw new Error(configData.message || "Failed to get Firebase configuration");
      }

      let app;
      if (!getApps().length) {
        app = initializeApp(configData.data);
      } else {
        app = getApp();
      }

      const auth = getAuth(app);
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else {
        provider = new OAuthProvider('apple.com');
      }
      
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const loginRes = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "firebase", idToken }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.success) {
        login(loginData.data.accessToken, loginData.data.refreshToken, loginData.data.user);
      } else {
        setError(loginData.message || `Erro ao fazer login com ${providerName === 'google' ? 'o Google' : 'a Apple'}`);
      }
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === "auth/popup-closed-by-user") {
        setError("O login foi cancelado.");
      } else {
        setError(err.message || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ArqHub</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isLogin ? "Acesse seu escritório de arquitetura" : "Crie sua conta no sistema"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
            {!isLogin && (
              <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? "Processando..." : (isLogin ? "Entrar" : "Criar Conta")}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">ou</span>
          <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={isLoading}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar com o Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuthLogin('apple')}
          disabled={isLoading}
          className="mt-3 w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.1-44.6-35.9-2.8-74.3 22.7-103.1 22.7-28.5 0-53-22.7-97.5-22.7-64.3 0-122.6 44.8-151.5 106.6-60.8 129.5-30.8 288 33 381 30.7 44.6 71.9 98.7 122.4 97 48.7-1.8 69.1-31.5 125.7-31.5 56.4 0 73.8 31.5 124 31.5 52.8 0 88.5-49 119.5-94.4 34.6-50.6 48.6-99.7 49.3-102.3-1.1-.4-94.8-35.8-97.7-128.7zM259.9 104.9c25.4-30.9 42.5-74 37.8-117-38.3 1.5-84.3 25.5-110.8 57.3-22.4 26.6-43 72.8-37.1 114.7 42.9 3.3 84.8-24.1 110.1-55z"/>
          </svg>
          Continuar com a Apple
        </button>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? "Não tem uma conta?" : "Já possui uma conta?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(""); }} 
              className="ml-2 font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              {isLogin ? "Cadastre-se" : "Faça Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
