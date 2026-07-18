"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

interface Person { id: string; name: string; email: string | null }
interface Project { id: string; name: string; status: string }
interface Workspace { id: string; name: string; slug: string; status: string; role: string }

export default function WorkspaceDashboard() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  
  const [projectName, setProjectName] = useState("");
  
  const [inviteCode, setInviteCode] = useState("");

  const loadData = async () => {
    try {
      const [wsRes, pRes, projRes] = await Promise.all([
        fetchApi(`/workspaces/${workspaceId}`),
        fetchApi(`/workspaces/${workspaceId}/persons`),
        fetchApi(`/workspaces/${workspaceId}/projects`)
      ]);
      
      if (wsRes.ok) setWorkspace((await wsRes.json()).data);
      if (pRes.ok) setPersons((await pRes.json()).data);
      if (projRes.ok) setProjects((await projRes.json()).data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

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

  const handleGenerateInvite = async (role: string) => {
    const res = await fetchApi(`/workspaces/${workspaceId}/invites`, {
      method: "POST",
      body: JSON.stringify({ role })
    });
    if (res.ok) {
      const data = await res.json();
      setInviteCode(data.data.code);
    }
  };

  if (!workspace) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

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
        <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold mb-4">Convites para o Escritório</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => handleGenerateInvite("PROFESSIONAL")} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Gerar Convite (Professional)
            </button>
            <button onClick={() => handleGenerateInvite("ADMIN")} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Gerar Convite (Admin)
            </button>
            {inviteCode && (
              <div className="ml-4 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded font-mono font-medium flex items-center gap-2">
                Código gerado: {inviteCode} 
                <button onClick={() => navigator.clipboard.writeText(inviteCode)} title="Copiar" className="hover:text-blue-600">📋</button>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PROJECTS */}
          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4">Projetos</h2>
            <form onSubmit={handleCreateProject} className="flex gap-2 mb-6">
              <input 
                type="text" required placeholder="Nome do Projeto" 
                value={projectName} onChange={e => setProjectName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-blue-500"
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
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.status}</p>
                  </div>
                  <Link href={`/projects/${p.id}`} className="text-blue-600 text-sm hover:underline">Ver Projeto</Link>
                </li>
              ))}
              {projects.length === 0 && <li className="text-sm text-gray-500 text-center py-4">Nenhum projeto criado.</li>}
            </ul>
          </section>

          {/* PERSONS */}
          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4">Pessoas (Agenda)</h2>
            <form onSubmit={handleCreatePerson} className="flex flex-col gap-3 mb-6">
              <input 
                type="text" required placeholder="Nome" 
                value={personName} onChange={e => setPersonName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <input 
                  type="email" placeholder="Email (opcional)" 
                  value={personEmail} onChange={e => setPersonEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-blue-500"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Adicionar
                </button>
              </div>
            </form>
            
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {persons.map(p => (
                <li key={p.id} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="font-medium">{p.name}</span>
                  {p.email && <span className="text-xs text-gray-500">{p.email}</span>}
                </li>
              ))}
              {persons.length === 0 && <li className="text-sm text-gray-500 text-center py-4">Nenhuma pessoa cadastrada.</li>}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
