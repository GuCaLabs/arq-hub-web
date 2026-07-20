"use client";

import { useState } from "react";
import Balancer from "react-wrap-balancer";
import Link from "next/link";
import { CircleCheck } from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---- minimal craft-ds inline (single-file helper) ----------------
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};
type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

const Section = ({ children, className, id }: SectionProps) => (
  <section className={cn("py-8 md:py-12 w-full", className)} id={id}>
    {children}
  </section>
);

const Container = ({ children, className, id }: ContainerProps) => (
  <div className={cn("mx-auto max-w-5xl p-6 sm:p-8 w-full", className)} id={id}>
    {children}
  </div>
);
// ------------------------------------------------------------------

interface PricingCardProps {
  title: "Basic" | "Standard" | "Pro";
  monthlyPrice: string;
  yearlyPrice: string;
  description?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

// Dummy pricing data
const pricingData: PricingCardProps[] = [
  {
    title: "Basic",
    monthlyPrice: "R$ 97",
    yearlyPrice: "R$ 970",
    description:
      "Perfeito para arquitetos autônomos e escritórios em início de jornada.",
    features: [
      "Até 3 Projetos Simultâneos",
      "Gestão de Tarefas",
      "Suporte por Email",
      "Acesso via App",
    ],
    cta: "Assinar Iniciante",
    href: "https://stripe.com/",
  },
  {
    title: "Standard",
    monthlyPrice: "R$ 197",
    yearlyPrice: "R$ 1970",
    description:
      "O essencial para escritórios em crescimento que precisam de mais controle.",
    features: [
      "Projetos Ilimitados",
      "Portal do Cliente",
      "Gestão Financeira",
      "Suporte Prioritário",
    ],
    cta: "Assinar Profissional",
    href: "https://stripe.com/",
    featured: true,
  },
  {
    title: "Pro",
    monthlyPrice: "R$ 397",
    yearlyPrice: "R$ 3970",
    description:
      "Para grandes escritórios que exigem escala e métricas avançadas.",
    features: [
      "Tudo do Profissional",
      "Múltiplas Filiais",
      "Treinamento da Equipe",
      "Gerente de Conta Dedicado",
    ],
    cta: "Falar com Consultor",
    href: "https://stripe.com/",
  },
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );

  return (
    <Section>
      <Container className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Planos Simples e Transparentes
        </h2>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          <Balancer>
            Escolha a assinatura ideal para o momento atual do seu escritório de
            arquitetura.
          </Balancer>
        </p>

        <div className="mt-8 w-full not-prose flex justify-center">
          <Tabs
            defaultValue="monthly"
            onValueChange={(v) => setBillingPeriod(v as "monthly" | "yearly")}
            className="w-[300px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">
                Anual
                <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                  Economize 17%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="not-prose mt-8 grid grid-cols-1 gap-6 min-[900px]:grid-cols-3 w-full">
          {pricingData.map((plan) => (
            <PricingCard
              key={plan.title}
              plan={plan}
              billingPeriod={billingPeriod}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function PricingCard({
  plan,
  billingPeriod,
}: {
  plan: PricingCardProps;
  billingPeriod: "monthly" | "yearly";
}) {
  const price =
    billingPeriod === "monthly"
      ? `${plan.monthlyPrice}/month`
      : `${plan.yearlyPrice}/year`;

  return (
    <div
      className={cn(
        "flex flex-col rounded-card border p-8 text-left bg-card text-card-foreground",
        plan.featured &&
          "border-accent shadow-lg ring-1 ring-accent/10 relative",
      )}
      aria-label={`${plan.title} plan`}
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2">
          <Badge
            variant={plan.featured ? "default" : "secondary"}
            className={cn(
              "text-sm px-3 py-1",
              plan.featured &&
                "bg-accent hover:bg-accent/80 text-accent-foreground",
            )}
          >
            {plan.title}
          </Badge>
          {plan.featured && (
            <span className="absolute -top-3 right-8 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
              Mais popular
            </span>
          )}
        </div>
        <h4 className="mb-2 mt-6 text-4xl font-bold text-foreground">
          {price}
        </h4>
        {plan.description && (
          <p className="text-sm opacity-70 mt-2 text-muted-foreground">
            {plan.description}
          </p>
        )}
      </div>

      <div className="my-6 border-t dark:border-gray-700" />

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center text-sm opacity-80 text-foreground"
          >
            <CircleCheck className="mr-3 h-5 w-5 text-accent" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <Link
          href={plan.href}
          target="_blank"
          rel="noreferrer noopener"
          className="w-full"
        >
          <Button
            size="lg"
            className={cn(
              "w-full text-base font-semibold",
              plan.featured &&
                "bg-accent hover:bg-accent/90 text-accent-foreground",
            )}
            variant={plan.featured ? "default" : "outline"}
          >
            {plan.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
