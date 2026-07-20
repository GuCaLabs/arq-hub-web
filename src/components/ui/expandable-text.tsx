"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  className?: string;
}

export function ExpandableText({ text = "", className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [displayText, setDisplayText] = useState(text);
  const [isCalculated, setIsCalculated] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const calculateTruncation = useCallback(() => {
    if (!measureRef.current || !containerRef.current) return;

    const measureEl = measureRef.current;

    // Reset to full text to measure natural height
    measureEl.textContent = text;

    const style = window.getComputedStyle(measureEl);
    let lineHeight = parseFloat(style.lineHeight);
    if (isNaN(lineHeight)) {
      // Fallback if line-height is 'normal'
      lineHeight = parseFloat(style.fontSize) * 1.5;
    }

    const maxHeight = lineHeight * 3;

    // If text naturally fits in 3 lines, no need to truncate
    if (measureEl.scrollHeight <= maxHeight + 2) {
      // +2px for safety
      setIsOverflowing(false);
      setDisplayText(text);
      setIsCalculated(true);
      return;
    }

    setIsOverflowing(true);

    // Binary search to find exactly where to cut the text so it fits with the button
    let start = 0;
    let end = text.length;
    let mid;
    let best = 0;

    const buttonHtml =
      '... <span class="text-sm font-medium inline">mais</span>';

    while (start <= end) {
      mid = Math.floor((start + end) / 2);

      const escapedText = text
        .slice(0, mid)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      measureEl.innerHTML = escapedText + buttonHtml;

      if (measureEl.scrollHeight <= maxHeight + 2) {
        best = mid;
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    setDisplayText(text.slice(0, best));
    setIsCalculated(true);
  }, [text]);

  useEffect(() => {
    calculateTruncation();

    const resizeObserver = new ResizeObserver(() => {
      calculateTruncation();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [calculateTruncation]);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Invisible clone used strictly for measuring text height */}
      <div
        ref={measureRef}
        className="whitespace-pre-wrap absolute invisible pointer-events-none top-0 left-0 w-full"
        aria-hidden="true"
      />

      <div
        className={cn(
          "whitespace-pre-wrap",
          !isExpanded && !isCalculated && "line-clamp-3",
        )}
      >
        {isExpanded ? text : displayText}
        {!isExpanded && isOverflowing && (
          <>
            ...{" "}
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-400 text-sm font-medium inline"
            >
              mais
            </button>
          </>
        )}
      </div>
    </div>
  );
}
