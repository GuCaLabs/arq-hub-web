import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="w-full px-4 md:px-8 pb-8 mt-16">
      <div className="@container mx-auto max-w-5xl bg-card text-foreground rounded-container shadow-xl flex flex-col justify-between py-12 md:py-16 px-8 md:px-12 border border-border">
        {/* Top Content */}
        <div className="flex flex-col md:flex-row justify-between gap-16 md:gap-8">
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-3">
              <div>
                <Logo variant="logo" size="lg" />
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mt-1">
                  Tudo em um lugar
                </p>
              </div>
            </div>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md">
              Nossa missão é democratizar ferramentas de gestão para escritórios
              de arquitetura e empoderar profissionais e organizações em todo o
              mundo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-4 shrink-0 md:self-center mt-4 md:mt-0 w-full sm:w-auto">
            {/* App Store Button */}
            <a
              href="#"
              className="flex items-center justify-center sm:justify-start gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-button hover:bg-secondary/80 transition-all shadow-sm min-w-[200px] w-full sm:w-auto"
            >
              <svg
                viewBox="0 0 384 512"
                className="w-7 h-7 shrink-0"
                fill="currentColor"
              >
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] leading-tight text-muted-foreground">
                  Baixe na
                </span>
                <span className="text-base font-semibold leading-tight tracking-tight">
                  App Store
                </span>
              </div>
            </a>

            {/* Google Play Button */}
            <a
              href="#"
              className="flex items-center justify-center sm:justify-start gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-button hover:bg-secondary/80 transition-all shadow-sm min-w-[200px] w-full sm:w-auto"
            >
              <svg
                viewBox="0 0 512 512"
                className="w-7 h-7 shrink-0"
                fill="currentColor"
              >
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] leading-tight uppercase text-muted-foreground">
                  Disponível no
                </span>
                <span className="text-base font-semibold leading-tight tracking-tight">
                  Google Play
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <p>
            Copyright {new Date().getFullYear()}© ArqHub, Todos os direitos
            reservados
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacidade"
              className="hover:text-foreground transition-colors underline decoration-border underline-offset-4"
            >
              Política de Privacidade
            </Link>
            <span>•</span>
            <Link
              href="/termos"
              className="hover:text-foreground transition-colors underline decoration-border underline-offset-4"
            >
              Termos e Condições
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
