"use client";

import { useEffect, useState, useCallback } from "react";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isInviteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isInviteModalOpen]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [wsRes, projRes] = await Promise.all([
        fetchApi("/workspaces"),
        fetchApi("/users/me/projects"),
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
        setIsInviteModalOpen(false);
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
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Ativo
          </Badge>
        );
      case "ONBOARDING":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Onboarding
          </Badge>
        );
      case "ARCHIVED":
        return <Badge variant="outline">Arquivado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
    router.push(`/workspaces/${id}/edit`);
  };

  const isOwner = workspaces.some((ws) => ws.role === "OWNER");

  return (
    <div className="min-h-screen bg-background pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-h1">Meus Escritórios</h2>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button
              variant="secondary"
              onClick={() => setIsInviteModalOpen(true)}
            >
              Usar Convite
            </Button>

            {!isOwner && (
              <Button asChild>
                <Link href="/workspaces/create">Novo Escritório</Link>
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted">
            Carregando escritórios...
          </div>
        ) : workspaces.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center">
            <p className="text-muted mb-6">
              Você ainda não faz parte de nenhum escritório.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isOwner && (
                <Button asChild>
                  <Link href="/workspaces/create">
                    Criar meu primeiro escritório
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <Card
                key={ws.id}
                className="cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => {
                  if (ws.status === "ONBOARDING") {
                    router.push(`/workspaces/${ws.id}/create`);
                  } else {
                    router.push(`/workspaces/${ws.id}`);
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-secondary border border-border overflow-hidden shrink-0">
                        {ws.logoUrl ? (
                          <Image
                            src={ws.logoUrl}
                            alt={ws.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-small">
                            {getInitials(ws.name)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-h3 truncate pr-2" title={ws.name}>
                        {ws.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      {getStatusBadge(ws.status)}

                      {ws.role === "OWNER" && (
                        <div className="relative">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                              >
                                <MoreVertical
                                  size={18}
                                  className="text-muted-foreground"
                                />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => handleEdit(ws.id, e)}
                              >
                                <Edit2 size={14} className="mr-2" /> Editar
                              </DropdownMenuItem>
                              {ws.status === "ARCHIVED" ? (
                                <DropdownMenuItem
                                  onClick={(e) => handleUnarchive(ws.id, e)}
                                >
                                  <ArchiveRestore size={14} className="mr-2" />{" "}
                                  Desarquivar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={(e) => handleArchive(ws.id, e)}
                                >
                                  <Archive size={14} className="mr-2" />{" "}
                                  Arquivar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => handleDelete(ws.id, e)}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <Trash2 size={14} className="mr-2" /> Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-muted mb-4">
                    <Badge variant="secondary" className="font-medium">
                      {ws.role}
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
                    <span className="text-muted">/{ws.slug}</span>
                    <span className="text-primary font-medium group-hover:underline">
                      Acessar &rarr;
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && projects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-h2 mb-6">Meus Projetos (Cliente)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <Card
                  key={proj.id}
                  className="cursor-pointer hover:bg-secondary/20 transition-colors"
                  onClick={() => router.push(`/projects/${proj.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 overflow-hidden shrink-0">
                          <span className="text-small text-primary">
                            {getInitials(proj.name)}
                          </span>
                        </div>
                        <h3 className="text-h3 truncate pr-2" title={proj.name}>
                          {proj.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(proj.status)}
                      </div>
                    </div>
                    <div className="flex items-center text-muted mb-4">
                      <Badge variant="secondary" className="mr-2">
                        {proj.phase}
                      </Badge>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
                      <span className="text-muted">Projeto Vinculado</span>
                      <span className="text-primary font-medium group-hover:underline">
                        Acessar &rarr;
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Convite */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-background rounded-xl w-full max-w-sm flex flex-col shadow-2xl border border-border animate-in fade-in zoom-in duration-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground text-lg">
                Usar Código de Convite
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsInviteModalOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full -mr-2"
              >
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={handleJoinWithCode} className="flex flex-col gap-4">
              <Input
                autoFocus
                type="text"
                placeholder="Código de 6 a 8 dígitos"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
                disabled={isJoining}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsInviteModalOpen(false)}
                  disabled={isJoining}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isJoining || inviteCode.length < 6}
                >
                  {isJoining ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
