"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { exchangeFirebaseToken } from "@/lib/auth-api";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const completeLogin = async (credential: UserCredential) => {
    const idToken = await credential.user.getIdToken();
    const session = await exchangeFirebaseToken(idToken);
    login(session.accessToken, session.refreshToken, session.user);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const auth = getFirebaseAuth();
      const credential = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      await completeLogin(credential);
    } catch (error) {
      const firebaseError = error as Error & { code?: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("Já existe uma conta com este email.");
      } else if (firebaseError.code === "auth/invalid-credential") {
        setError("Email ou senha inválidos.");
      } else if (firebaseError.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(firebaseError.message || "Erro de conexão. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (providerName: 'google' | 'apple') => {
    setIsLoading(true);
    setError("");
    try {
      const auth = getFirebaseAuth();
      let provider: GoogleAuthProvider | OAuthProvider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
      } else {
        provider = new OAuthProvider('apple.com');
      }
      
      const result = await signInWithPopup(auth, provider);
      await completeLogin(result);
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-2">
            <span className="text-3xl font-extrabold tracking-tight">
              <span className="text-foreground">Arq</span>
              <span className="text-accent">Hub</span>
            </span>
          </div>
          <CardDescription className="text-body mt-2">
            {isLogin ? "Acesse seu escritório de arquitetura" : "Crie sua conta no sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-11"
              />
            </div>

            <div className="space-y-1">
              <Label>Senha</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-semibold"
            >
              {isLoading ? "Processando..." : (isLogin ? "Entrar" : "Criar Conta")}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="h-px w-full bg-border"></div>
            <span className="text-sm text-muted-foreground">ou</span>
            <div className="h-px w-full bg-border"></div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full h-11 text-base flex items-center justify-center gap-3 font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar com o Google
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuthLogin('apple')}
              disabled={isLoading}
              className="w-full h-11 text-base flex items-center justify-center gap-3 bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 font-semibold border-transparent"
            >
              <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.1-44.6-35.9-2.8-74.3 22.7-103.1 22.7-28.5 0-53-22.7-97.5-22.7-64.3 0-122.6 44.8-151.5 106.6-60.8 129.5-30.8 288 33 381 30.7 44.6 71.9 98.7 122.4 97 48.7-1.8 69.1-31.5 125.7-31.5 56.4 0 73.8 31.5 124 31.5 52.8 0 88.5-49 119.5-94.4 34.6-50.6 48.6-99.7 49.3-102.3-1.1-.4-94.8-35.8-97.7-128.7zM259.9 104.9c25.4-30.9 42.5-74 37.8-117-38.3 1.5-84.3 25.5-110.8 57.3-22.4 26.6-43 72.8-37.1 114.7 42.9 3.3 84.8-24.1 110.1-55z"/>
              </svg>
              Continuar com a Apple
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              {isLogin ? "Não tem uma conta?" : "Já possui uma conta?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); }} 
                className="ml-2 font-medium text-primary hover:underline focus:outline-none"
              >
                {isLogin ? "Cadastre-se" : "Faça Login"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
