'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const findings = [
  { sev: 'ERROR', color: 'bg-red-500/20 text-red-300', loc: '42:10', msg: 'Use of eval()', plugin: 'critical' },
  { sev: 'WARN', color: 'bg-yellow-500/20 text-yellow-200', loc: '42:10', msg: 'Use of eval()', plugin: 'heuristic' },
  { sev: 'WARN', color: 'bg-yellow-500/20 text-yellow-200', loc: '7:3', msg: 'Possible hard-coded credential', plugin: 'heuristic' },
  { sev: 'INFO', color: 'bg-sky-500/20 text-sky-200', loc: '15:1', msg: 'console.log left in code', plugin: 'no-console' },
];

export default function ScanDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const target = 87;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setScore(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div ref={ref} className="card glow-border mx-auto max-w-3xl overflow-hidden">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
        <span className="h-3 w-3 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-xs text-zinc-500">harvest src/ --complete</span>
      </div>

      <div className="p-6 font-mono text-sm">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-extrabold text-lime-400">B+</span>
          <span className="text-2xl font-bold text-white">{score}<span className="text-zinc-500">/100</span></span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-harvest-400 to-lime-400"
              initial={{ width: 0 }}
              animate={{ width: inView ? `${score}%` : 0 }}
            />
          </div>
          <span className="text-xs text-zinc-500">good</span>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          <span className="text-red-400">1 error</span> · <span className="text-yellow-300">2 warning</span> ·{' '}
          <span className="text-sky-300">1 info</span> · 4 total · 210ms
        </div>

        <div className="mt-5 text-zinc-400">src/payments.js</div>
        <div className="mt-2 space-y-1.5">
          {findings.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="flex items-center gap-3"
            >
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${f.color}`}>{f.sev}</span>
              <span className="text-zinc-500">{f.loc}</span>
              <span className="text-zinc-200">{f.msg}</span>
              <span className="text-zinc-600">({f.plugin})</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.1 }}
          className="mt-5 text-emerald-400"
        >
          ▲ +5 since last run <span className="text-zinc-600">(was 82)</span>
        </motion.div>
      </div>
    </div>
  );
}
