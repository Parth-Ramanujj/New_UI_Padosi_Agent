import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X, ShieldCheck } from "lucide-react";
import { CLAIMS_URL, CLAIMS_IS_EXTERNAL } from "@/config/links";

const STORAGE_KEY = "padosi_claims_bar_dismissed_v2";

const ClaimsAnnouncementBar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY) === "1";
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (!visible) {
      root.style.setProperty("--claims-bar-height", "0px");
      return;
    }

    const updateHeight = () => {
      const height = barRef.current?.offsetHeight ?? 0;
      root.style.setProperty("--claims-bar-height", `${height}px`);
    };

    updateHeight();

    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateHeight)
      : null;

    if (observer && barRef.current) {
      observer.observe(barRef.current);
    } else {
      window.addEventListener("resize", updateHeight);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [visible]);

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  const inner = (
    <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 text-[11px] sm:text-[12.5px]">
      <span className="hidden sm:inline-flex items-center gap-1.5 font-medium text-foreground/70">
        <ShieldCheck className="h-3.5 w-3.5 text-claim" strokeWidth={2.2} />
        PadosiAgent powers India's neighbourhood
      </span>
      <span className="hidden sm:inline text-foreground/30">—</span>
      <span className="font-bold tracking-tight bg-gradient-to-r from-claim to-claim-dark bg-clip-text text-transparent">
        Claim Help
      </span>
      <span className="text-foreground/75 truncate">
        Find a local PadosiAgent to settle your claim faster
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-claim flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.4} />
    </div>
  );

  return (
    <div ref={barRef} className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-claim/[0.08] via-claim/[0.04] to-claim/[0.08] backdrop-blur-md border-b border-claim/15 shadow-[0_1px_0_0_hsl(var(--claim)/0.06)]">
      <div className="relative max-w-7xl mx-auto">
        {CLAIMS_IS_EXTERNAL ? (
          <a
            href={CLAIMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block hover:bg-claim/5 transition-colors duration-300"
          >
            {inner}
          </a>
        ) : (
          <Link to={CLAIMS_URL} className="group block hover:bg-claim/5 transition-colors duration-300">
            {inner}
          </Link>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss claims announcement"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ClaimsAnnouncementBar;
