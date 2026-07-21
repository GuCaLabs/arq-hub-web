"use client";

import { CircleCheck } from "lucide-react";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  monthlyPrice: string;
  description?: string;
  features: string[];
  featured?: boolean;
}

const pricingData: PricingCardProps[] = [
  {
    title: "Iniciante",
    monthlyPrice: "R$ 97",
    description:
      "Perfeito para arquitetos autônomos e escritórios em início de jornada.",
    features: [
      "Até 3 Projetos Simultâneos",
      "Gestão de Tarefas",
      "Suporte por Email",
      "Acesso via App",
    ],
  },
  {
    title: "Profissional",
    monthlyPrice: "R$ 197",
    description:
      "O essencial para escritórios em crescimento que precisam de mais controle.",
    features: [
      "Projetos Ilimitados",
      "Portal do Cliente",
      "Gestão Financeira",
      "Suporte Prioritário",
    ],
    featured: true,
  },
  {
    title: "Empresarial",
    monthlyPrice: "R$ 397",
    description:
      "Para grandes escritórios que exigem escala e métricas avançadas.",
    features: [
      "Tudo do Profissional",
      "Múltiplas Filiais",
      "Treinamento da Equipe",
      "Gerente de Conta Dedicado",
    ],
  },
];

export function PricingSection() {
  return (
    <section className="py-8 md:py-16 w-full">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Planos Simples e Transparentes
          </h2>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha a assinatura ideal para o momento atual do seu escritório de arquitetura.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 min-[900px]:grid-cols-3 w-full">
          {pricingData.map((plan) => (
            <PricingCard key={plan.title} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: PricingCardProps }) {
  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-visible border-border bg-card p-8 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-accent/40",
        plan.featured && "border-accent shadow-lg ring-1 ring-accent/10",
      )}
      aria-label={`${plan.title} plan`}
    >
      {/* Subtle accent glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />

      {/* "Mais popular" badge — posicionado fora do overflow do card */}
      {plan.featured && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-accent-foreground shadow-md whitespace-nowrap z-10">
          Mais popular
        </span>
      )}

      <CardHeader className="relative p-0 text-center">
        {/* Todos os badges com a mesma variante e cor */}
        <div className="inline-flex items-center justify-center">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {plan.title}
          </Badge>
        </div>

        <CardTitle className="mt-6 text-4xl font-bold tracking-tight">
          {plan.monthlyPrice}
          <span className="text-lg font-normal text-foreground/50">/mês</span>
        </CardTitle>

        {plan.description && (
          <p className="text-sm mt-2 leading-relaxed text-foreground/70">
            {plan.description}
          </p>
        )}
      </CardHeader>

      <div className="relative my-6 border-t border-border" />

      <CardContent className="relative p-0 flex-1 flex flex-col">
        <ul className="space-y-4">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center text-sm text-foreground/70"
            >
              <CircleCheck className="mr-3 h-5 w-5 text-accent shrink-0" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
