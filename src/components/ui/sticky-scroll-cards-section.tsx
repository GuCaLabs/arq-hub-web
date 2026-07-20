import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings2, Sparkles, Zap } from "lucide-react";
import { ReactNode } from "react";

export function StickyFeatureSection() {
  return (
    <section className="py-16">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Tudo que seu escritório precisa
          </h2>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatize processos, centralize informações e tenha mais tempo para focar no que realmente importa: projetar e encantar clientes.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16 md:max-w-full md:grid-cols-3">
          <Card className="group border-0 bg-muted shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Zap className="size-6 text-accent" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 text-xl font-semibold text-foreground">Fluxos Adaptáveis</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Personalize cada etapa do funil de projetos, adaptando a plataforma perfeitamente ao método de trabalho exclusivo do seu escritório.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 bg-muted shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Settings2 className="size-6 text-accent" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 text-xl font-semibold text-foreground">Controle Absoluto</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tenha visão em tempo real de prazos, orçamentos, aprovações e cronogramas da equipe através de um único painel gerencial.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 bg-muted shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Sparkles className="size-6 text-accent" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 text-xl font-semibold text-foreground">Gestão Inteligente</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Geração automática de insights e relatórios que ajudam na precisão da sua precificação e na alocação de recursos da sua equipe.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div
    aria-hidden
    className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
  >
    <div className="absolute inset-0 [--border:theme(colors.border)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l border-border rounded-full shadow-sm">
      {children}
    </div>
  </div>
);
