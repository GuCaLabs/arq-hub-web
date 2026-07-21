"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  MoreVertical,
  Folder as FolderIcon,
  Users,
  Copy,
  Plus,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  status: string;
  phase?: string;
}
interface Workspace {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
}
interface WorkspaceMember {
  id: string;
  userId: string | null;
  role: string;
  status: string;
  joinedAt: string;
  user?: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export default function WorkspaceDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: workspaceId } = use(params);
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  const [projectName, setProjectName] = useState("");

  const [inviteCode, setInviteCode] = useState("");
  const [inviteRole, setInviteRole] = useState("PROFESSIONAL");

  const loadData = useCallback(async () => {
    try {
      const [wsRes, projRes, memRes] = await Promise.all([
        fetchApi(`/workspaces/${workspaceId}`),
        fetchApi(`/workspaces/${workspaceId}/projects`),
        fetchApi(`/workspaces/${workspaceId}/members`),
      ]);

      if (wsRes.ok) setWorkspace((await wsRes.json()).data);
      if (projRes.ok) setProjects((await projRes.json()).data);
      if (memRes.ok) setMembers((await memRes.json()).data);
    } catch (e) {
      console.error(e);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
  }, [workspaceId, loadData]);

  useEffect(() => {
    if (isCreateProjectModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCreateProjectModalOpen]);

  const handleCompleteOnboarding = async () => {
    await fetchApi(`/workspaces/${workspaceId}/complete-onboarding`, {
      method: "POST",
    });
    loadData();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    await fetchApi(`/workspaces/${workspaceId}/projects`, {
      method: "POST",
      body: JSON.stringify({ name: projectName }),
    });
    setProjectName("");
    setIsCreateProjectModalOpen(false);
    loadData();
  };

  const handleGenerateInvite = async () => {
    const res = await fetchApi(`/workspaces/${workspaceId}/invites`, {
      method: "POST",
      body: JSON.stringify({ role: inviteRole }),
    });
    if (res.ok) {
      const data = await res.json();
      setInviteCode(data.data.code);
    }
  };

  const handleApproveMember = async (memberId: string) => {
    const res = await fetchApi(
      `/workspaces/${workspaceId}/members/${memberId}/approve`,
      {
        method: "POST",
      },
    );
    if (res.ok) {
      loadData();
    } else {
      alert("Erro ao aprovar membro.");
    }
  };

  const handleRejectMember = async (memberId: string) => {
    const res = await fetchApi(
      `/workspaces/${workspaceId}/members/${memberId}/reject`,
      {
        method: "POST",
      },
    );
    if (res.ok) {
      loadData();
    } else {
      alert("Erro ao recusar membro.");
    }
  };

  const handleLeaveWorkspace = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja sair deste escritório?")) return;
    const res = await fetchApi(
      `/workspaces/${workspaceId}/members/${memberId}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Erro ao sair do escritório.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;
    const res = await fetchApi(
      `/workspaces/${workspaceId}/members/${memberId}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      loadData();
    } else {
      alert("Erro ao remover membro.");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    const res = await fetchApi(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      },
    );
    if (res.ok) {
      loadData();
    } else {
      alert("Erro ao alterar cargo.");
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

  if (!workspace)
    return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  const isOwnerOrAdmin =
    workspace.role === "OWNER" || workspace.role === "ADMIN";

  const breadcrumbs: BreadcrumbItem[] = [
    {
      id: "workspace",
      label: workspace.name,
      icon: <FolderIcon className="w-4 h-4" />,
    },
  ];

  const handleNavigateBreadcrumb = (id: string | null) => {
    if (id === "dashboard") router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          breadcrumbs={breadcrumbs}
          onNavigateBreadcrumb={handleNavigateBreadcrumb}
          action={
            workspace.status === "ONBOARDING" ? (
              <Button
                onClick={handleCompleteOnboarding}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                Completar Onboarding
              </Button>
            ) : (
              <Badge variant="outline">{workspace.role}</Badge>
            )
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-h2">Projetos</h2>
                <Button
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  disabled={workspace.status !== "ACTIVE"}
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Projeto
                </Button>
              </div>
              {workspace.status !== "ACTIVE" && (
                <p className="text-xs text-destructive mb-4">
                  Complete o onboarding para criar projetos.
                </p>
              )}

              {projects.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center">
                  <p className="text-muted mb-6">
                    Nenhum projeto criado neste escritório.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <h3
                              className="text-h3 truncate pr-2"
                              title={proj.name}
                            >
                              {proj.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(proj.status)}
                          </div>
                        </div>
                        {proj.phase && (
                          <div className="flex items-center text-muted mb-4">
                            <Badge variant="secondary" className="mr-2">
                              {proj.phase}
                            </Badge>
                          </div>
                        )}
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
              )}
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-h3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Membros & Convites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isOwnerOrAdmin && (
                  <div>
                    <h3 className="text-small font-medium mb-3 text-muted-foreground">
                      Gerar Convite de Equipe
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary text-sm h-10"
                        >
                          <option value="PROFESSIONAL">Professional</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <Button
                          onClick={handleGenerateInvite}
                          variant="secondary"
                        >
                          Gerar
                        </Button>
                      </div>
                      {inviteCode && (
                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-md font-mono text-small justify-between">
                          <span>{inviteCode}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-primary hover:bg-primary/20"
                            onClick={() =>
                              navigator.clipboard.writeText(inviteCode)
                            }
                            title="Copiar"
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={
                    isOwnerOrAdmin ? "border-t border-border pt-6" : ""
                  }
                >
                  <h3 className="text-small font-medium mb-3 text-muted-foreground">
                    Membros do Escritório
                  </h3>
                  <ul className="space-y-3 pr-2 max-h-[600px] overflow-y-auto">
                    {members.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-col p-3 bg-secondary/20 rounded-lg border border-border gap-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-body block truncate">
                              {m.user?.name ||
                                m.user?.email ||
                                "Usuário Pendente"}
                            </span>
                            <div className="flex gap-2 items-center mt-1">
                              <span className="text-small text-muted-foreground font-medium">
                                {m.role}
                              </span>
                              <Badge
                                variant={
                                  m.status === "APPROVED"
                                    ? "default"
                                    : m.status === "PENDING"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {m.status}
                              </Badge>
                            </div>
                          </div>

                          {m.role !== "OWNER" &&
                            (m.userId === user?.id || isOwnerOrAdmin) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <MoreVertical
                                      size={16}
                                      className="text-muted-foreground"
                                    />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {m.userId === user?.id &&
                                    m.role !== "OWNER" && (
                                      <DropdownMenuItem
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                        onClick={() =>
                                          handleLeaveWorkspace(m.id)
                                        }
                                      >
                                        Sair do Escritório
                                      </DropdownMenuItem>
                                    )}

                                  {isOwnerOrAdmin &&
                                    m.userId !== user?.id &&
                                    m.role !== "OWNER" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleUpdateRole(
                                              m.id,
                                              m.role === "ADMIN"
                                                ? "PROFESSIONAL"
                                                : "ADMIN",
                                            )
                                          }
                                        >
                                          Tornar{" "}
                                          {m.role === "ADMIN"
                                            ? "Profissional"
                                            : "Admin"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                          onClick={() =>
                                            handleRemoveMember(m.id)
                                          }
                                        >
                                          Remover Membro
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>

                        {m.status === "PENDING" && isOwnerOrAdmin && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="w-full h-7 text-xs"
                              onClick={() => handleApproveMember(m.id)}
                            >
                              Aceitar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-full h-7 text-xs"
                              onClick={() => handleRejectMember(m.id)}
                            >
                              Recusar
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                    {members.length === 0 && (
                      <li className="text-small text-muted-foreground text-center py-4">
                        Nenhum membro vinculado.
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal de Criar Projeto */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-background rounded-xl w-full max-w-sm flex flex-col shadow-2xl border border-border animate-in fade-in zoom-in duration-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground text-lg">
                Adicionar Projeto
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateProjectModalOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full -mr-2"
              >
                <X size={18} />
              </Button>
            </div>
            <form
              onSubmit={handleCreateProject}
              className="flex flex-col gap-4"
            >
              <Input
                autoFocus
                placeholder="Nome do projeto"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateProjectModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={!projectName.trim()}>
                  Criar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
