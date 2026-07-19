"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { verifyMagicLink } from "@/lib/auth-api";
import Link from "next/link";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser, login, isLoading } = useAuth();
  
  const [status, setStatus] = useState<"loading" | "conflict" | "error">("loading");
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
      setErrorMessage(error instanceof Error ? error.message : "O link expirou ou é inválido.");
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
        setErrorMessage("O link de acesso fornecido possui um formato inválido.");
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
      setErrorMessage(error instanceof Error ? error.message : "O link expirou ou já foi utilizado.");
    }
  };

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Erro na Autenticação</h1>
          <p className="text-gray-500 max-w-sm mx-auto">{errorMessage}</p>
        </div>
        <Link
          href={currentUser ? "/dashboard" : "/login"}
          className="mt-4 inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {currentUser ? "Voltar para o Dashboard" : "Voltar para o Login"}
        </Link>
      </div>
    );
  }

  if (status === "conflict") {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Conflito de Sessão</h1>
          <p className="text-gray-500 max-w-sm mx-auto">
            Você já está conectado como <strong>{currentUser?.name || currentUser?.email || "outro usuário"}</strong>. 
            Este link de acesso pertence a uma conta diferente.
          </p>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            Deseja sair da conta atual e entrar com o novo acesso recebido?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-6">
          <button
            onClick={handleSwitchAccount}
            className="flex-1 inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Sim, Trocar Conta
          </button>
          <Link
            href="/dashboard"
            className="flex-1 inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Preparando seu ambiente ArqHub...</h1>
        <p className="text-gray-500">Estamos validando seu acesso seguro, por favor aguarde.</p>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow sm:rounded-xl sm:px-10 min-h-[400px] flex items-center justify-center border border-gray-100">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <div className="space-y-2">
                  <h1 className="text-xl font-medium text-gray-900">Carregando...</h1>
                </div>
              </div>
            }
          >
            <MagicLinkContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
