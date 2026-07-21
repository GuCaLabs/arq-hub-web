"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import {
  Folder as FolderIcon,
  FileText,
  Download,
  Trash2,
  Plus,
  MoreVertical,
  Eye,
  X,
  UploadCloud,
  Users,
  Copy,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { DriveTable, type Column } from "@/components/ui/drive-table";
import { type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  name: string;
  workspaceId: string;
  status: string;
  phase?: string;
  currentUserRole?: string;
}
interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
}
interface Document {
  id: string;
  fileName: string;
  mimeType: string;
  size: string;
  status: string;
  uploadStatus: string;
  uploadUrl?: string;
  folderId: string | null;
}
interface ProjectMember {
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

export default function ProjectDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [folderName, setFolderName] = useState("");
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const [inviteCode, setInviteCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    try {
      const projRes = await fetchApi(`/projects/${projectId}`);
      if (projRes.ok) {
        const projData = (await projRes.json()).data;
        setProject(projData);

        let fetchPersonsPromise = Promise.resolve<Response | null>(null);
        let fetchMembersPromise = Promise.resolve<Response | null>(null);

        if (projData.currentUserRole !== "CLIENT") {
          fetchPersonsPromise = fetchApi(
            `/workspaces/${projData.workspaceId}/persons`,
          );
          fetchMembersPromise = fetchApi(`/projects/${projectId}/members`);
        }

        const [docsRes, , memRes] = await Promise.all([
          fetchApi(`/projects/${projectId}/documents`),
          fetchPersonsPromise,
          fetchMembersPromise,
        ]);

        if (docsRes.ok) {
          const docsData = (await docsRes.json()).data;
          setFolders(docsData.folders);
          setDocuments(docsData.documents);
        }
        if (memRes?.ok) {
          setMembers((await memRes.json()).data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
  }, [projectId, loadData]);

  // Bloqueia o scroll quando o modal está aberto
  useEffect(() => {
    if (previewUrl || isCreateFolderModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [previewUrl, isCreateFolderModalOpen]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    try {
      await fetchApi(`/projects/${projectId}/folders`, {
        method: "POST",
        body: JSON.stringify({
          name: folderName,
          parentFolderId: selectedFolderId || undefined,
        }),
      });
      setFolderName("");
      setIsCreateFolderModalOpen(false);
      loadData();
    } catch {
      alert("Erro ao criar pasta");
    }
  };

  const handleGenerateInvite = async () => {
    const res = await fetchApi(`/projects/${projectId}/invites`, {
      method: "POST",
      body: "{}",
    });
    if (res.ok) {
      const data = await res.json();
      setInviteCode(data.data.code);
    }
  };

  const handleApproveMember = async (memberId: string) => {
    const res = await fetchApi(
      `/projects/${projectId}/members/${memberId}/approve`,
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
      `/projects/${projectId}/members/${memberId}/reject`,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Obter presigned URL
      const res = await fetchApi(`/projects/${projectId}/documents`, {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size.toString(),
          folderId: selectedFolderId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Erro ao preparar upload: " + (data.message || "Unknown error"));
        return;
      }

      const documentId = data.data.document.id;
      const uploadUrl = data.data.uploadUrl;

      if (!uploadUrl) {
        alert("Nenhuma URL de upload recebida. Storage está configurado?");
        await fetchApi(`/documents/${documentId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "FAILED" }),
        });
        return;
      }

      // 2. Fazer PUT real para o S3/R2
      try {
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });

        if (putRes.ok) {
          // 3. Marcar como COMPLETED
          await fetchApi(`/documents/${documentId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: "COMPLETED" }),
          });
        } else {
          throw new Error("S3 returned " + putRes.status);
        }
      } catch (err) {
        console.error("Upload PUT failed", err);
        await fetchApi(`/documents/${documentId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "FAILED" }),
        });
        alert(
          "Falha no upload para o bucket S3/R2. Verifique as variáveis de ambiente.",
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadData();
    }
  };

  const handleDownloadDocument = async (id: string, fileName: string) => {
    try {
      const res = await fetchApi(`/documents/${id}/download`);
      if (!res.ok) {
        alert("Erro ao tentar baixar o documento.");
        return;
      }

      const body = await res.json();
      const url = body.data?.url ?? body.url;
      if (!url || typeof url !== "string") {
        throw new Error("A API não retornou a URL do documento.");
      }

      // Como a API não retorna a URL com Content-Disposition: attachment e o CORS bloqueia fetch direto,
      // Usamos nosso próprio proxy no Next.js para baixar o arquivo e repassá-lo ao navegador como anexo.
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`;

      const a = document.createElement("a");
      a.href = proxyUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert("Erro ao tentar baixar o documento.");
    }
  };

  const handlePreviewDocument = async (id: string, fileName: string) => {
    try {
      const res = await fetchApi(`/documents/${id}/download`);
      if (!res.ok) {
        alert("Erro ao obter pré-visualização do documento.");
        return;
      }

      const body = await res.json();
      const url = body.data?.url ?? body.url;
      if (!url || typeof url !== "string") {
        throw new Error("A API não retornou a URL do documento.");
      }

      setPreviewUrl(url);
      setPreviewFileName(fileName);
    } catch (e) {
      console.error(e);
      alert("Erro ao tentar visualizar o documento.");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este documento?")) return;
    await fetchApi(`/documents/${id}`, { method: "DELETE" });
    loadData();
  };

  if (!project)
    return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  const isClient = project?.currentUserRole === "CLIENT";

  type DriveItem =
    | { type: "folder"; id: string; name: string; raw: Folder }
    | { type: "document"; id: string; name: string; raw: Document };

  const currentFolders = folders.filter(
    (f) => f.parentFolderId === selectedFolderId,
  );
  const currentDocuments = documents.filter(
    (d) => d.folderId === selectedFolderId,
  );

  const driveItems: DriveItem[] = [
    ...currentFolders.map(
      (f): DriveItem => ({ type: "folder", id: f.id, name: f.name, raw: f }),
    ),
    ...currentDocuments.map(
      (d): DriveItem => ({
        type: "document",
        id: d.id,
        name: d.fileName,
        raw: d,
      }),
    ),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const handleChangePhase = async (newPhase: string) => {
    try {
      const res = await fetchApi(`/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ phase: newPhase }),
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Erro ao alterar a fase do projeto.");
      }
    } catch {
      alert("Erro de conexão ao alterar a fase.");
    }
  };

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [
      {
        id: "root",
        label: project?.name || "Projeto",
        icon: <FolderIcon className="w-4 h-4" />,
      },
    ];
    if (!selectedFolderId) return crumbs;

    const path = [];
    let currentId: string | null = selectedFolderId;
    while (currentId) {
      const f = folders.find((folder) => folder.id === currentId);
      if (f) {
        path.unshift({ id: f.id, label: f.name });
        currentId = f.parentFolderId;
      } else {
        break;
      }
    }
    return [...crumbs, ...path];
  };

  const breadcrumbs = buildBreadcrumbs();

  const handleNavigateBreadcrumb = (id: string | null) => {
    if (id === "root") setSelectedFolderId(null);
    else setSelectedFolderId(id);
  };

  const columns: Column<DriveItem>[] = [
    {
      key: "name",
      header: "Nome",
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.type === "folder" ? (
            <FolderIcon className="w-5 h-5 text-blue-500 fill-blue-500/20" />
          ) : (
            <FileText className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="font-medium text-body">{item.name}</span>
        </div>
      ),
    },
    {
      key: "size",
      header: "Tamanho",
      render: (item) =>
        item.type === "document" ? (
          <span className="text-small">
            {(parseInt(item.raw.size) / 1024 / 1024).toFixed(2)} MB
          </span>
        ) : (
          <span className="text-small text-muted-foreground">--</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) =>
        item.type === "document" ? (
          <Badge variant="secondary">{item.raw.uploadStatus}</Badge>
        ) : null,
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      render: (item) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <MoreVertical size={16} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {item.type === "document" ? (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      handlePreviewDocument(item.raw.id, item.raw.fileName)
                    }
                  >
                    <Eye size={14} className="mr-2" /> Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleDownloadDocument(item.raw.id, item.raw.fileName)
                    }
                  >
                    <Download size={14} className="mr-2" /> Baixar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteDocument(item.raw.id)}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 size={14} className="mr-2" /> Excluir
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled>
                  Renomear (Em breve)
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          breadcrumbs={breadcrumbs}
          onNavigateBreadcrumb={handleNavigateBreadcrumb}
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateFolderModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Nova Pasta
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <UploadCloud className="w-4 h-4 mr-2" />{" "}
                {isUploading ? "Enviando..." : "Fazer Upload"}
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <DriveTable
                data={driveItems}
                columns={columns}
                onRowClick={(item) => {
                  if (item.type === "folder") {
                    setSelectedFolderId(item.raw.id);
                  } else if (item.type === "document") {
                    handlePreviewDocument(item.raw.id, item.raw.fileName);
                  }
                }}
                emptyMessage="Esta pasta está vazia."
              />
            </Card>
          </div>

          <div className="space-y-6">
            {!isClient && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-h3">Fase do Projeto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={project.phase || "BRIEFING"}
                      onChange={(e) => handleChangePhase(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary text-sm h-10"
                    >
                      <option value="PROSPECTION">Prospecção</option>
                      <option value="CONTRACT">Contrato</option>
                      <option value="SURVEY">Levantamento</option>
                      <option value="PRELIMINARY">Estudo Preliminar</option>
                      <option value="EXECUTIVE">Projeto Executivo</option>
                      <option value="APPROVAL">Aprovação</option>
                      <option value="CONSTRUCTION">Obra</option>
                      <option value="COMPLETED">Concluído</option>
                    </select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-h3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> Membros &
                      Convites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-small font-medium mb-3 text-muted-foreground">
                        Gerar Convite de Cliente
                      </h3>
                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={handleGenerateInvite}
                          variant="secondary"
                          className="w-full"
                        >
                          Gerar Convite
                        </Button>
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

                    <div className="border-t border-border pt-6">
                      <h3 className="text-small font-medium mb-3 text-muted-foreground">
                        Membros do Projeto
                      </h3>
                      <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {members.map((m) => (
                          <li
                            key={m.id}
                            className="flex flex-col p-3 bg-secondary/20 rounded-lg border border-border gap-2"
                          >
                            <div>
                              <span className="font-medium text-body truncate block">
                                {m.user?.name ||
                                  m.user?.email ||
                                  "Usuário Pendente"}
                              </span>
                              <div className="flex gap-2 items-center text-xs mt-1">
                                <span className="text-muted-foreground font-medium text-small">
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

                            {m.status === "PENDING" && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="w-full text-xs h-7"
                                  onClick={() => handleApproveMember(m.id)}
                                >
                                  Aceitar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="w-full text-xs h-7"
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
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Pré-visualização */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-background rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground truncate max-w-[80%]">
                {previewFileName}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewUrl(null)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
              >
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 bg-muted/30 p-2 overflow-hidden rounded-b-xl">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg bg-white border border-border"
                title={previewFileName}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar Pasta */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-background rounded-xl w-full max-w-sm flex flex-col shadow-2xl border border-border animate-in fade-in zoom-in duration-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground text-lg">
                Nova Pasta
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full -mr-2"
              >
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
              <Input
                autoFocus
                placeholder="Nome da pasta"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={!folderName.trim()}>
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
