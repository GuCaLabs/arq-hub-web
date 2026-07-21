"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { use } from "react";
import {
  WorkspaceForm,
  WorkspaceFormProps,
} from "@/components/workspaces/workspace-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EditWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialData, setInitialData] =
    useState<WorkspaceFormProps["initialData"]>();

  const router = useRouter();

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetchApi(`/workspaces/${id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setInitialData(data.data);
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
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetchApi(`/workspaces/${id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message || "Erro ao atualizar dados do workspace.");
      }
    } catch {
      setError("Erro de conexão ao salvar os dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center flex-col gap-4">
        <div className="text-red-500 font-medium">{error}</div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:underline"
        >
          Voltar para o Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <Button
            variant="link"
            onClick={() => router.back()}
            className="w-fit p-0 h-auto text-muted-foreground hover:text-primary mb-4"
          >
            &larr; Voltar
          </Button>
          <CardTitle className="text-h2">Editar Escritório</CardTitle>
          <CardDescription>
            Altere as informações do seu escritório.
          </CardDescription>
        </CardHeader>
        <CardContent>

        <WorkspaceForm
          initialData={initialData}
          isEditMode={true}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          submitButtonText="Salvar Alterações"
          onCancel={handleCancel}
        />
        </CardContent>
      </Card>
    </div>
  );
}
