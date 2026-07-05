'use client';

import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';

/** Scroll-triggered reveal wrapper. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Command block with a copy button. */
export function CommandLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button
      onClick={copy}
      className="group flex w-full items-center justify-between gap-4 rounded-xl border border-line/10 bg-card/80 px-4 py-3 text-left font-mono text-sm shadow-sm transition hover:border-harvest-500/40"
    >
      <span className="truncate">
        <span className="text-harvest-500">$</span> <span className="text-fg">{command}</span>
      </span>
      <span className="shrink-0 text-xs text-muted group-hover:text-harvest-500">
        {copied ? 'copied ✓' : 'copy'}
      </span>
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-harvest-500/30 bg-harvest-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-harvest-600 dark:text-harvest-300">
      {children}
    </span>
  );
}
