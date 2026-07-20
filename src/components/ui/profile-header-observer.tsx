"use client";

import { useEffect, useRef, useState } from "react";
import { VerifiedIcon } from "lucide-react";

interface ProfileHeaderObserverProps {
  slug: string;
  children: React.ReactNode;
}

export function ProfileHeaderObserver({ slug, children }: ProfileHeaderObserverProps) {
  const [isIntersecting, setIsIntersecting] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Fixed Sticky Header */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-transform duration-300 flex justify-center ${
          isIntersecting ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="w-full max-w-4xl p-3 flex items-center justify-center gap-2">
          <h2 className="font-bold text-lg flex items-center gap-1">
            @{slug}
            <VerifiedIcon size={16} color="#3b82f6" />
          </h2>
        </div>
      </div>
      
      {/* Target to observe */}
      <div ref={ref} className="w-full">
        {children}
      </div>
    </>
  );
}
