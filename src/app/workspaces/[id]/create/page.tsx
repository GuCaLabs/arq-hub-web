"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { use } from "react";
import { WorkspaceForm } from "@/components/workspaces/workspace-form";

export default function CompleteWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetchApi(`/workspaces/${id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          const workspace = data.data;
          if (workspace.status !== "ONBOARDING") {
            router.push(`/workspaces/${id}`);
          }
        } else {
          setError("Workspace não encontrado ou você não tem acesso.");
        }
      } catch {
        setError("Erro ao carregar os dados do workspace.");
      } finally {
        setIsFetching(false);
      }
    }
    loadWorkspace();
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError("");

    try {
      // PATCH with FormData
      const res = await fetchApi(`/workspaces/${id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Complete Onboarding
        const completeRes = await fetchApi(
          `/workspaces/${id}/complete-onboarding`,
          {
            method: "POST",
          },
        );

        const completeData = await completeRes.json();
        if (completeRes.ok && completeData.success) {
          router.push(`/workspaces/${id}`);
        } else {
          setError(
            completeData.message ||
              "Erro ao finalizar o onboarding do workspace.",
          );
        }
      } else {
        setError(data.message || "Erro ao atualizar dados do workspace.");
      }
    } catch {
      setError("Erro de conexão ao salvar os dados.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            className="text-sm text-blue-600 hover:underline mb-4 inline-block"
          >
            &larr; Voltar para Dashboard
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detalhes do Escritório
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os dados complementares para finalizar a criação. Todos os
            campos são opcionais.
          </p>
        </div>

        <WorkspaceForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          submitButtonText="Concluir Configuração"
        />
      </div>
    </div>
  );
}
