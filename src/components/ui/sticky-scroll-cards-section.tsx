import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2, Sparkles, Zap } from "lucide-react";
import { ReactNode } from "react";

export function StickyFeatureSection() {
  return (
    <section className="py-8 md:py-16">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Tudo que seu escritório precisa
          </h2>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatize processos, centralize informações e tenha mais tempo para focar no que realmente importa: projetar e encantar clientes.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-sm gap-8 *:text-center md:mt-16 md:max-w-full md:grid-cols-3">
          <FeatureCard
            icon={<Zap className="size-8" aria-hidden />}
            title="Fluxos Adaptáveis"
            description="Personalize cada etapa do funil de projetos, adaptando a plataforma perfeitamente ao método de trabalho exclusivo do seu escritório."
          />
          <FeatureCard
            icon={<Settings2 className="size-8" aria-hidden />}
            title="Controle Absoluto"
            description="Tenha visão em tempo real de prazos, orçamentos, aprovações e cronogramas da equipe através de um único painel gerencial."
          />
          <FeatureCard
            icon={<Sparkles className="size-8" aria-hidden />}
            title="Gestão Inteligente"
            description="Geração automática de insights e relatórios que ajudam na precisão da sua precificação e na alocação de recursos da sua equipe."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-accent/40 hover:-translate-y-1">
      {/* Subtle accent glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardHeader className="relative pb-3">
        <CardDecorator>{icon}</CardDecorator>
        <CardTitle className="mt-6">{title}</CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <p className="text-sm leading-relaxed text-foreground/70">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div
    aria-hidden
    className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
  >
    <div className="absolute inset-0 [--border:theme(colors.border)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
    <div className="bg-background absolute inset-0 m-auto flex size-16 items-center justify-center border border-border rounded-full shadow-sm text-accent group-hover:border-accent/40 group-hover:shadow-md group-hover:shadow-accent/10 transition-all duration-300">
      {children}
    </div>
  </div>
);
