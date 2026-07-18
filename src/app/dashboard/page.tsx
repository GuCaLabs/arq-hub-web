"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const res = await fetchApi("/workspaces");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setWorkspaces(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load workspaces", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Ativo</span>;
      case "ONBOARDING": return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Onboarding</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ArqHub</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
              <button 
                onClick={logout}
                className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Escritórios</h2>
          <Link 
            href="/workspaces/create"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            Novo Escritório
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Carregando escritórios...</div>
        ) : workspaces.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Você ainda não faz parte de nenhum escritório.</p>
            <Link 
              href="/workspaces/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Criar meu primeiro escritório
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div 
                key={ws.id} 
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800 cursor-pointer overflow-hidden"
                onClick={() => router.push(`/workspaces/${ws.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={ws.name}>{ws.name}</h3>
                    {getStatusBadge(ws.status)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{ws.role}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                    <span className="text-gray-500">/{ws.slug}</span>
                    <span className="text-blue-600 font-medium group-hover:underline">Acessar &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
