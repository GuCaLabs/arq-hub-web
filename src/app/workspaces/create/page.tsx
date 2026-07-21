"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <Button
            variant="link"
            asChild
            className="w-fit p-0 h-auto text-muted-foreground hover:text-primary mb-4"
          >
            <Link href="/dashboard">&larr; Voltar</Link>
          </Button>
          <CardTitle className="text-h2">Criar novo Escritório</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>Nome do Escritório</Label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
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
                placeholder="Ex: Studio Arquitetura"
              />
            </div>

            <div className="space-y-1">
              <Label>Slug (URL)</Label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-md text-muted-foreground text-sm h-10 flex items-center">
                  arqhub.com/
                </span>
                <Input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  className="rounded-l-none"
                  placeholder="studio-arquitetura"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Apenas letras minúsculas, números e hífens.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !name || !slug}
              className="w-full"
            >
              {isLoading ? "Criando..." : "Criar Escritório"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
