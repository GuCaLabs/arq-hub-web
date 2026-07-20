import React from "react";
import { cn } from "@/lib/utils";

type LogoVariant = "dark" | "light" | "logo" | "translucent";
type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  opacity?: number; // 0 to 1
  layer?: "all" | "blend" | "normal"; // Used for fixed header split layers
}

const sizeClasses: Record<LogoSize, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-6xl",
};

export function Logo({
  variant = "logo",
  size = "lg",
  className,
  opacity = 1,
  layer = "all",
}: LogoProps) {
  const baseClasses = cn(
    "font-extrabold tracking-tight inline-flex items-center",
    sizeClasses[size],
    className,
  );

  // Compute the alpha values for RGBA based on opacity prop
  const whiteAlpha = `rgba(255, 255, 255, ${opacity})`;
  const blackAlpha = `rgba(0, 0, 0, ${opacity})`;
  // Terracota #C85A32 -> RGB(200, 90, 50)
  const accentAlpha = `rgba(200, 90, 50, ${opacity})`;

  if (variant === "dark") {
    return (
      <div className={baseClasses} style={{ color: whiteAlpha }}>
        ArqHub
      </div>
    );
  }

  if (variant === "light") {
    return (
      <div className={baseClasses} style={{ color: blackAlpha }}>
        ArqHub
      </div>
    );
  }

  if (variant === "translucent") {
    return (
      <div
        className={cn("mix-blend-difference", baseClasses)}
        style={{ color: whiteAlpha }}
      >
        ArqHub
      </div>
    );
  }

  // variant === "logo" (Dynamic Arq + Terracota Hub)
  if (layer === "blend") {
    return (
      <div className={cn("pointer-events-none whitespace-nowrap", baseClasses, className)} style={{ color: whiteAlpha }}>
        <span>Arq</span>
      </div>
    );
  }

  if (layer === "normal") {
    return (
      <div className={cn("pointer-events-auto whitespace-nowrap", baseClasses, className)}>
        <span className="opacity-0 select-none">Arq</span>
        <span style={{ color: accentAlpha }}>Hub</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", baseClasses, className)}>
      <div className="flex pointer-events-auto">
        <span className="opacity-0 select-none">Arq</span>
        <span style={{ color: accentAlpha }}>Hub</span>
      </div>
      <div
        className="absolute inset-0 mix-blend-difference pointer-events-none whitespace-nowrap"
        style={{ color: whiteAlpha }}
      >
        Arq
      </div>
    </div>
  );
}
