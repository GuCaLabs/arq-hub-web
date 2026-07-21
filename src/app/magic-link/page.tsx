"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { verifyMagicLink } from "@/lib/auth-api";
import Link from "next/link";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const { user: currentUser, login, isLoading } = useAuth();

  const [status, setStatus] = useState<"loading" | "conflict" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const hasChecked = useRef(false);

  // Função isolada para consumir o token e logar
  const consumeAndLogin = async (token: string, redirectPath: string) => {
    setStatus("loading");
    try {
      const data = await verifyMagicLink(token);
      login(data.accessToken, data.refreshToken, data.user, redirectPath);
    } catch (error: unknown) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "O link expirou ou é inválido.",
      );
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (hasChecked.current) return;
    // Opcional: ignorar se currentUser ainda está sendo carregado (mas assumimos que a página carrega rápido ou AuthContext resolve rápido)

    async function checkToken() {
      const token = searchParams.get("token");
      const redirectPath = searchParams.get("redirect") || "/dashboard";

      if (!token) {
        setStatus("error");
        setErrorMessage("Link de acesso inválido ou incompleto.");
        return;
      }

      // Previne re-execução
      hasChecked.current = true;

      try {
        // Decodifica JWT localmente para checar colisão (sem queimar na API)
        const payloadStr = atob(token.split(".")[1]);
        const payload = JSON.parse(payloadStr);
        const targetUserId = payload.userId;

        // Verifica colisão: usuário diferente do logado
        if (currentUser && currentUser.id !== targetUserId) {
          setStatus("conflict");
          return;
        }

        // Se for o mesmo usuário ou se não houver sessão ativa, consome o token
        await consumeAndLogin(token, redirectPath);
      } catch {
        setStatus("error");
        setErrorMessage(
          "O link de acesso fornecido possui um formato inválido.",
        );
      }
    }

    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isLoading]); // Só depende do currentUser e isLoading para o check inicial

  const handleSwitchAccount = async () => {
    const token = searchParams.get("token");
    const redirectPath = searchParams.get("redirect") || "/dashboard";

    if (!token) return;

    setStatus("loading");

    try {
      // 1. Tenta consumir o token na API PRIMEIRO.
      // Se já tiver sido consumido em outro dispositivo, vai dar erro e ele nem desloga a Conta A.
      const data = await verifyMagicLink(token);

      // 2. Se o token era válido, agora sim limpamos o Firebase da Conta A
      try {
        await signOut(getFirebaseAuth());
      } catch (e) {
        console.warn("Falha ao deslogar do Firebase", e);
      }

      // 3. Efetivamos o login com a nova Conta B
      login(data.accessToken, data.refreshToken, data.user, redirectPath);
    } catch (error: unknown) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "O link expirou ou já foi utilizado.",
      );
    }
  };

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Erro na Autenticação
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">{errorMessage}</p>
        </div>
        <Button asChild className="mt-4">
          <Link href={currentUser ? "/dashboard" : "/login"}>
            {currentUser ? "Voltar para o Dashboard" : "Voltar para o Login"}
          </Link>
        </Button>
      </div>
    );
  }

  if (status === "conflict") {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Conflito de Sessão
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Você já está conectado como{" "}
            <strong className="text-foreground">
              {currentUser?.name || currentUser?.email || "outro usuário"}
            </strong>
            . Este link de acesso pertence a uma conta diferente.
          </p>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            Deseja sair da conta atual e entrar com o novo acesso recebido?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-6">
          <Button onClick={handleSwitchAccount} className="flex-1">
            Sim, Trocar Conta
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">Cancelar</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Preparando seu ambiente ArqHub...
        </h1>
        <p className="text-muted-foreground">
          Estamos validando seu acesso seguro, por favor aguarde.
        </p>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto shadow-xl border-border">
        <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center min-h-[400px]">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="space-y-2">
                  <h1 className="text-xl font-medium text-foreground">
                    Carregando...
                  </h1>
                </div>
              </div>
            }
          >
            <MagicLinkContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
