"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit2,
  Archive,
  Trash2,
  ArchiveRestore,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
  logoUrl?: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  phase: string;
  workspaceId: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    try {
      const [wsRes, projRes] = await Promise.all([
        fetchApi("/workspaces"),
        fetchApi("/users/me/projects")
      ]);
      
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        if (wsData.success) setWorkspaces(wsData.data);
      }
      
      if (projRes.ok) {
        const projData = await projRes.json();
        if (projData.success) setProjects(projData.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadDashboardData();
    })();
  }, [loadDashboardData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.length < 6) return;
    setIsJoining(true);

    try {
      // Tentar workspace primeiro
      let res = await fetchApi("/workspaces/join", {
        method: "POST",
        body: JSON.stringify({ code: inviteCode.trim() }),
      });

      if (!res.ok && res.status !== 401) {
        // Tentar projeto se falhar no workspace (pode ser um código de projeto)
        res = await fetchApi("/projects/join", {
          method: "POST",
          body: JSON.stringify({ code: inviteCode.trim() }),
        });
      }

      if (res.ok) {
        alert("Solicitação enviada ou entrada realizada com sucesso!");
        setInviteCode("");
        loadDashboardData();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.message || "Código inválido ou expirado.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao tentar entrar. Verifique sua conexão.");
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
            Ativo
          </span>
        );
      case "ONBOARDING":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
            Onboarding
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
            Arquivado
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (!confirm("Deseja realmente arquivar este escritório?")) return;

    try {
      const res = await fetchApi(`/workspaces/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (res.ok) {
        loadDashboardData();
      } else {
        alert("Erro ao arquivar escritório.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao arquivar.");
    }
  };

  const handleUnarchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);

    try {
      const res = await fetchApi(`/workspaces/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      if (res.ok) {
        loadDashboardData();
      } else {
        alert("Erro ao desarquivar escritório.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao desarquivar.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (
      !confirm(
        "CUIDADO: Deseja realmente excluir este escritório permanentemente?",
      )
    )
      return;

    try {
      const res = await fetchApi(`/workspaces/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadDashboardData();
      } else {
        alert("Erro ao excluir escritório.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao excluir.");
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    router.push(`/workspaces/${id}/edit`);
  };

  const isOwner = workspaces.some((ws) => ws.role === "OWNER");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ArqHub
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </span>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Meus Escritórios
          </h2>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <form
              onSubmit={handleJoinWithCode}
              className="flex flex-1 md:flex-none items-center gap-2"
            >
              <input
                type="text"
                placeholder="Código de convite"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-40"
                disabled={isJoining}
              />
              <button
                type="submit"
                disabled={isJoining || inviteCode.length < 6}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? "..." : "Entrar"}
              </button>
            </form>

            {!isOwner && (
              <Link
                href="/workspaces/create"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm whitespace-nowrap"
              >
                Novo Escritório
              </Link>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Carregando escritórios...
          </div>
        ) : workspaces.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center flex flex-col items-center">
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Você ainda não faz parte de nenhum escritório.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isOwner && (
                <Link
                  href="/workspaces/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Criar meu primeiro escritório
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800 cursor-pointer overflow-hidden relative"
                onClick={() => {
                  if (ws.status === "ONBOARDING") {
                    router.push(`/workspaces/${ws.id}/create`);
                  } else {
                    router.push(`/workspaces/${ws.id}`);
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                        {ws.logoUrl ? (
                          <Image
                            src={ws.logoUrl}
                            alt={ws.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            {getInitials(ws.name)}
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-lg font-bold text-gray-900 dark:text-white truncate pr-2"
                        title={ws.name}
                      >
                        {ws.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      {getStatusBadge(ws.status)}

                      {ws.role === "OWNER" && (
                        <div className="relative dropdown-container">
                          <button
                            type="button"
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                openDropdownId === ws.id ? null : ws.id,
                              );
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openDropdownId === ws.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
                              <button
                                type="button"
                                onClick={(e) => handleEdit(ws.id, e)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Edit2 size={14} /> Editar
                              </button>
                              {ws.status === "ARCHIVED" ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleUnarchive(ws.id, e)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <ArchiveRestore size={14} /> Desarquivar
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleArchive(ws.id, e)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Archive size={14} /> Arquivar
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDelete(ws.id, e)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Deletar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      {ws.role}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                    <span className="text-gray-500">/{ws.slug}</span>
                    <span className="text-blue-600 font-medium group-hover:underline">
                      Acessar &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && projects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Meus Projetos (Cliente)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800 cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/projects/${proj.id}`)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 overflow-hidden shrink-0">
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {getInitials(proj.name)}
                          </span>
                        </div>
                        <h3
                          className="text-lg font-bold text-gray-900 dark:text-white truncate pr-2"
                          title={proj.name}
                        >
                          {proj.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(proj.status)}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs mr-2">
                        {proj.phase}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                      <span className="text-gray-500">Projeto Vinculado</span>
                      <span className="text-blue-600 font-medium group-hover:underline">
                        Acessar &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
