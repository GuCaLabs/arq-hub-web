"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

export default function CreateWorkspacePage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetchApi("/workspaces", {
        method: "POST",
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/workspaces/${data.data.workspace.id}/create`);
      } else {
        setError(data.message || "Erro ao criar workspace");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline mb-4 inline-block"
          >
            &larr; Voltar
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Criar novo Escritório
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Escritório
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Auto-generate slug suggestion if empty or matches previous slug
                if (
                  !slug ||
                  slug ===
                    name
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, "")
                ) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
                }
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Studio Arquitetura"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug (URL)
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-lg text-gray-500 dark:text-gray-400 text-sm">
                arqhub.com/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className="w-full px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="studio-arquitetura"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Apenas letras minúsculas, números e hífens.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name || !slug}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-70 shadow-sm"
          >
            {isLoading ? "Criando..." : "Criar Escritório"}
          </button>
        </form>
      </div>
    </div>
  );
}
