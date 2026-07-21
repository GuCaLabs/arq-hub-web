"use client";

import { useState, useEffect } from "react";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  video: {
    src: "https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1",
    poster:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop",
    background:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1920&auto=format&fit=crop",
    title: "Gestão Inteligente",
    date: "Plataforma ArqHub",
    scrollToExpand: "Role para descobrir",
    about: {
      overview:
        "O ArqHub é a plataforma de gestão definitiva para escritórios de arquitetura. Controle todas as etapas dos seus projetos, acompanhe o cronograma da sua equipe e centralize a comunicação com seus clientes em uma única interface moderna e intuitiva.",
      conclusion:
        "Experimente a transformação digital do seu escritório. Com o ArqHub, você foca na criação e no design, enquanto nós cuidamos da organização e eficiência do seu negócio.",
    },
  },
  image: {
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop",
    background:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop",
    title: "ArqHub",
    date: "Tudo em um lugar",
    scrollToExpand: "Role para descobrir",
    about: {
      overview:
        "Acesse documentações, contratos e orçamentos com agilidade. O ArqHub permite categorizar cada documento por projeto e cliente, facilitando a busca e evitando perdas de arquivos importantes.",
      conclusion:
        "Seu escritório de arquitetura merece uma ferramenta à altura do seu talento. Junte-se a nós e eleve o nível de profissionalismo nas suas entregas e no atendimento ao cliente.",
    },
  },
};

const MediaContent = ({ mediaType }: { mediaType: "video" | "image" }) => {
  const currentMedia = sampleMediaContent[mediaType];

  return (
    <div className="max-w-4xl mx-auto text-center px-4">
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
        O Futuro da Gestão na Arquitetura
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
        {currentMedia.about.overview}
      </p>

      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        {currentMedia.about.conclusion}
      </p>
    </div>
  );
};

export const VideoExpansionTextBlend = () => {
  const mediaType = "video";
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event("resetSection");
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        posterSrc={currentMedia.poster}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
        textBlend
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

export const ImageExpansionTextBlend = () => {
  const mediaType = "image";
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event("resetSection");
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
        textBlend
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

export const VideoExpansion = () => {
  const mediaType = "video";
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event("resetSection");
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        posterSrc={currentMedia.poster}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

export const ImageExpansion = () => {
  const mediaType = "image";
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event("resetSection");
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

const Demo = () => {
  const mediaType = "image"; // Using image since it contained the text you mentioned
  const currentMedia = sampleMediaContent[mediaType];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event("resetSection");
    window.dispatchEvent(resetEvent);
  }, []);

  // Logo starts fading in after central title fades out (progress > 0.5)
  const logoOpacity = Math.max(0, Math.min(1, (progress - 0.5) * 2));

  return (
    <div className="min-h-screen relative">
      {/* Blend Layer for Arq (needs to be outside normal stacking context) */}
      <div className="fixed top-0 left-0 right-0 z-[51] px-6 py-6 md:px-12 pointer-events-none flex justify-between items-center mix-blend-difference">
        <Logo variant="logo" layer="blend" opacity={logoOpacity} size="lg" />
        {/* Ghost spacer — must match Button size="default" exactly: h-10 px-4 py-2 text-sm rounded-lg */}
        <div className="h-10 px-4 py-2 text-sm rounded-lg opacity-0" aria-hidden>Entrar</div>
      </div>

      {/* Normal Layer for Hub and Button */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 pointer-events-none">
        <Logo variant="logo" layer="normal" opacity={logoOpacity} size="lg" />
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold shadow-lg hover:shadow-xl pointer-events-auto">
          <Link href="/login">Entrar</Link>
        </Button>
      </header>
      <ScrollExpandMedia
        mediaType={mediaType as "video" | "image"}
        mediaSrc={currentMedia.src}
        posterSrc={currentMedia.poster}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
        onProgressChange={setProgress}
        textBlend
      >
        <MediaContent mediaType={mediaType as "video" | "image"} />
      </ScrollExpandMedia>
    </div>
  );
};

export default Demo;
