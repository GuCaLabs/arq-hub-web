"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

interface Person { id: string; name: string; email: string | null }
interface Project { id: string; name: string; workspaceId: string; status: string }
interface Folder { id: string; name: string; parentFolderId: string | null }
interface Document { id: string; fileName: string; mimeType: string; size: string; status: string; uploadStatus: string; uploadUrl?: string; folderId: string | null }

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [folderName, setFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  
  const [inviteCode, setInviteCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const projRes = await fetchApi(`/projects/${projectId}`);
      if (projRes.ok) {
        const projData = (await projRes.json()).data;
        setProject(projData);
        
        const [docsRes, pRes] = await Promise.all([
          fetchApi(`/projects/${projectId}/documents`),
          fetchApi(`/workspaces/${projData.workspaceId}/persons`)
        ]);
        
        if (docsRes.ok) {
          const docsData = (await docsRes.json()).data;
          setFolders(docsData.folders);
          setDocuments(docsData.documents);
        }
        if (pRes.ok) {
          setPersons((await pRes.json()).data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchApi(`/projects/${projectId}/folders`, {
      method: "POST",
      body: JSON.stringify({ name: folderName, parentFolderId: selectedFolderId || undefined })
    });
    setFolderName("");
    loadData();
  };

  const handleLinkPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) return;
    await fetchApi(`/projects/${projectId}/persons`, {
      method: "POST",
      body: JSON.stringify({ personId: selectedPersonId })
    });
    setSelectedPersonId("");
    alert("Pessoa vinculada!");
  };

  const handleGenerateInvite = async () => {
    const res = await fetchApi(`/projects/${projectId}/invites`, { method: "POST", body: "{}" });
    if (res.ok) {
      const data = await res.json();
      setInviteCode(data.data.code);
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
          folderId: selectedFolderId || undefined
        })
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
          body: JSON.stringify({ status: "FAILED" })
        });
        return;
      }

      // 2. Fazer PUT real para o S3/R2
      try {
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file
        });
        
        if (putRes.ok) {
          // 3. Marcar como COMPLETED
          await fetchApi(`/documents/${documentId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: "COMPLETED" })
          });
        } else {
          throw new Error("S3 returned " + putRes.status);
        }
      } catch (err) {
        console.error("Upload PUT failed", err);
        await fetchApi(`/documents/${documentId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "FAILED" })
        });
        alert("Falha no upload para o bucket S3/R2. Verifique as variáveis de ambiente.");
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadData();
    }
  };

  const handleDownloadDocument = async (id: string) => {
    try {
      // The fetchApi wrapper will add the Authorization header
      const res = await fetchApi(`/documents/${id}/download`);
      
      if (res.redirected) {
        // If the backend redirects us, we can get the redirected URL from res.url
        window.open(res.url, '_blank');
      } else if (res.ok) {
        // Just in case it returned JSON with the URL
        const data = await res.json();
        if (data.url) window.open(data.url, '_blank');
      } else {
        alert("Erro ao tentar baixar o documento.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao tentar baixar o documento.");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este documento?")) return;
    await fetchApi(`/documents/${id}`, { method: "DELETE" });
    loadData();
  };

  if (!project) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href={`/workspaces/${project.workspaceId}`} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">&larr; Voltar</Link>
          <h1 className="text-xl font-bold">{project.name}</h1>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-300">{project.status}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4">Membros & Convites</h2>
            
            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium mb-3">Gerar Convite de Cliente</h3>
              <div className="flex items-center gap-3">
                <button onClick={handleGenerateInvite} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Gerar Convite</button>
                {inviteCode && <span className="font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded">{inviteCode}</span>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Vincular Pessoa (do Escritório)</h3>
              <form onSubmit={handleLinkPerson} className="flex gap-2">
                <select 
                  value={selectedPersonId} onChange={e => setSelectedPersonId(e.target.value)} required
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                >
                  <option value="">Selecione uma pessoa</option>
                  {persons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Vincular</button>
              </form>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4">Pastas</h2>
            <form onSubmit={handleCreateFolder} className="flex flex-col gap-2 mb-6">
              <input 
                type="text" required placeholder="Nova pasta..." value={folderName} onChange={e => setFolderName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              />
              <div className="flex gap-2">
                <select 
                  value={selectedFolderId || ""} onChange={e => setSelectedFolderId(e.target.value || null)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
                >
                  <option value="">(Raiz)</option>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Criar Pasta</button>
              </div>
            </form>

            <ul className="space-y-1">
              <li 
                onClick={() => setSelectedFolderId(null)} 
                className={`p-2 rounded cursor-pointer ${selectedFolderId === null ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                📁 / (Raiz)
              </li>
              {folders.map(f => (
                <li 
                  key={f.id} onClick={() => setSelectedFolderId(f.id)}
                  className={`p-2 rounded cursor-pointer flex items-center gap-2 ${selectedFolderId === f.id ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  📁 {f.name}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Documentos em: {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "(Raiz)"}</h2>
            
            <div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isUploading ? "Enviando..." : "⬆ Fazer Upload"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
                <tr>
                  <th className="p-3 rounded-tl-lg">Nome do Arquivo</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Tamanho</th>
                  <th className="p-3 rounded-tr-lg">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documents.filter(d => d.folderId === selectedFolderId).length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum documento nesta pasta.</td></tr>
                )}
                {documents.filter(d => d.folderId === selectedFolderId).map(d => (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="p-3 font-medium">{d.fileName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${d.uploadStatus === "COMPLETED" ? "bg-green-100 text-green-700" : d.uploadStatus === "FAILED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {d.uploadStatus}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{(parseInt(d.size) / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button onClick={() => handleDownloadDocument(d.id)} className="text-blue-600 hover:underline">
                          Visualizar / Baixar
                        </button>
                        <button onClick={() => handleDeleteDocument(d.id)} className="text-red-500 hover:underline">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
