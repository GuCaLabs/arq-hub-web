"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { MoreVertical } from "lucide-react";

interface Person { id: string; name: string; email: string | null }
interface Project { id: string; name: string; status: string }
interface Workspace { id: string; name: string; slug: string; status: string; role: string }
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

export default function WorkspaceDashboard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: workspaceId } = use(params);
  const { user } = useAuth();
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  
  const [projectName, setProjectName] = useState("");
  
  const [inviteCode, setInviteCode] = useState("");
  const [inviteRole, setInviteRole] = useState("PROFESSIONAL");

  const loadData = useCallback(async () => {
    try {
      const [wsRes, pRes, projRes, memRes] = await Promise.all([
        fetchApi(`/workspaces/${workspaceId}`),
        fetchApi(`/workspaces/${workspaceId}/persons`),
        fetchApi(`/workspaces/${workspaceId}/projects`),
        fetchApi(`/workspaces/${workspaceId}/members`)
      ]);
      
      if (wsRes.ok) setWorkspace((await wsRes.json()).data);
      if (pRes.ok) setPersons((await pRes.json()).data);
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

  const handleCompleteOnboarding = async () => {
    await fetchApi(`/workspaces/${workspaceId}/complete-onboarding`, { method: "POST" });
    loadData();
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchApi(`/workspaces/${workspaceId}/persons`, {
      method: "POST",
      body: JSON.stringify({ name: personName, email: personEmail || undefined })
    });
    setPersonName(""); setPersonEmail("");
    loadData();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchApi(`/workspaces/${workspaceId}/projects`, {
      method: "POST",
      body: JSON.stringify({ name: projectName })
    });
    setProjectName("");
    loadData();
  };

  const handleGenerateInvite = async () => {
    const res = await fetchApi(`/workspaces/${workspaceId}/invites`, {
      method: "POST",
      body: JSON.stringify({ role: inviteRole })
    });
    if (res.ok) {
      const data = await res.json();
      setInviteCode(data.data.code);
    }
  };

  const handleApproveMember = async (memberId: string) => {
    const res = await fetchApi(`/workspaces/${workspaceId}/members/${memberId}/approve`, {
      method: "POST"
    });
    if (res.ok) {
      loadData();
    } else {
      alert("Erro ao aprovar membro.");
    }
  };

  const handleRejectMember = async (memberId: string) => {
    const res = await fetchApi(`/workspaces/${workspaceId}/members/${memberId}/reject`, {
      method: "POST"
    });
    if (res.ok) {
      loadData();
    } else {
      alert("Erro ao recusar membro.");
    }
  };

  const handleLeaveWorkspace = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja sair deste escritório?")) return;
    const res = await fetchApi(`/workspaces/${workspaceId}/members/${memberId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Erro ao sair do escritório.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;
    const res = await fetchApi(`/workspaces/${workspaceId}/members/${memberId}`, { method: "DELETE" });
    if (res.ok) {
      setOpenDropdownId(null);
      loadData();
    } else {
      alert("Erro ao remover membro.");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    const res = await fetchApi(`/workspaces/${workspaceId}/members/${memberId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      setOpenDropdownId(null);
      loadData();
    } else {
      alert("Erro ao alterar cargo.");
    }
  };

  if (!workspace) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  const isOwnerOrAdmin = workspace.role === "OWNER" || workspace.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">&larr; Voltar</Link>
            <h1 className="text-xl font-bold">{workspace.name}</h1>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-300">{workspace.role}</span>
          </div>
          {workspace.status === "ONBOARDING" && (
            <button onClick={handleCompleteOnboarding} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Completar Onboarding
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* INVITES */}
        {isOwnerOrAdmin && (
          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4">Convites para o Escritório</h2>
            <div className="flex items-center gap-4">
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-blue-500 text-sm"
              >
                <option value="PROFESSIONAL">Professional</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button onClick={handleGenerateInvite} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Gerar Convite
              </button>
              {inviteCode && (
                <div className="ml-4 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded font-mono font-medium flex items-center gap-2 text-sm">
                  Código: {inviteCode} 
                  <button onClick={() => navigator.clipboard.writeText(inviteCode)} title="Copiar" className="hover:text-blue-600">📋</button>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-8">
            {/* PROJECTS */}
            <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4">Projetos</h2>
              <form onSubmit={handleCreateProject} className="flex gap-2 mb-6">
                <input 
                  type="text" required placeholder="Nome do Projeto" 
                  value={projectName} onChange={e => setProjectName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-blue-500 text-sm"
                />
                <button type="submit" disabled={workspace.status !== "ACTIVE"} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  Criar
                </button>
              </form>
              {workspace.status !== "ACTIVE" && <p className="text-xs text-red-500 mb-4">Complete o onboarding para criar projetos.</p>}
              
              <ul className="space-y-3">
                {projects.map(p => (
                  <li key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.status}</p>
                    </div>
                    <Link href={`/projects/${p.id}`} className="text-blue-600 text-sm hover:underline">Ver Projeto</Link>
                  </li>
                ))}
                {projects.length === 0 && <li className="text-sm text-gray-500 text-center py-4">Nenhum projeto criado.</li>}
              </ul>
            </section>
          </div>

          <div className="space-y-8">
            {/* MEMBERS */}
            <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4">Membros do Escritório</h2>
              <ul className="space-y-3 pr-2">
                {members.map(m => (
                  <li key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 gap-4">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {m.user?.name || m.user?.email || "Usuário Pendente"}
                      </span>
                      <div className="flex gap-2 items-center text-xs mt-1">
                        <span className="text-gray-500 font-medium">{m.role}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          m.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                          m.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.status === "PENDING" && isOwnerOrAdmin && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApproveMember(m.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                          >
                            Aceitar
                          </button>
                          <button 
                            onClick={() => handleRejectMember(m.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                          >
                            Recusar
                          </button>
                        </div>
                      )}
                      
                      {m.role !== "OWNER" && (m.userId === user?.id || isOwnerOrAdmin) && (
                        <div className="relative">
                          <button
                            type="button"
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setOpenDropdownId(openDropdownId === m.id ? null : m.id)}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {openDropdownId === m.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                                {m.userId === user?.id && m.role !== "OWNER" && (
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => handleLeaveWorkspace(m.id)}
                                  >
                                    Sair do Escritório
                                  </button>
                                )}
                                
                                {isOwnerOrAdmin && m.userId !== user?.id && m.role !== "OWNER" && (
                                  <>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                      onClick={() => handleUpdateRole(m.id, m.role === "ADMIN" ? "PROFESSIONAL" : "ADMIN")}
                                    >
                                      Tornar {m.role === "ADMIN" ? "Profissional" : "Admin"}
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      onClick={() => handleRemoveMember(m.id)}
                                    >
                                      Remover Membro
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                {members.length === 0 && <li className="text-sm text-gray-500 text-center py-4">Nenhum membro vinculado.</li>}
              </ul>
            </section>

            {/* PERSONS */}
            <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4">Pessoas (Agenda)</h2>
              <form onSubmit={handleCreatePerson} className="flex flex-col gap-3 mb-6">
                <input 
                  type="text" required placeholder="Nome" 
                  value={personName} onChange={e => setPersonName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-blue-500 text-sm"
                />
                <div className="flex gap-2">
                  <input 
                    type="email" placeholder="Email (opcional)" 
                    value={personEmail} onChange={e => setPersonEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-blue-500 text-sm"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Adicionar
                  </button>
                </div>
              </form>
              
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {persons.map(p => (
                  <li key={p.id} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{p.name}</span>
                    {p.email && <span className="text-xs text-gray-500">{p.email}</span>}
                  </li>
                ))}
                {persons.length === 0 && <li className="text-sm text-gray-500 text-center py-4">Nenhuma pessoa cadastrada.</li>}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
