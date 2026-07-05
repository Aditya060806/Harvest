#!/usr/bin/env node
const https = require('https');
const { exec } = require('child_process');
const repoUrl = 'https://github.com/Aditya060806/Harvest';
// Opt‑in only: set HARVEST_OPEN=1 to open the repo after install.
const shouldOpen = process.env.HARVEST_OPEN === '1';
const fs = require('fs');
const path = require('path');
const flagFile = path.join(process.env.HOME || process.cwd(), '.harvest-opened');

// 1) Messaggio per utenti reali
const isInteractive = process.stdout.isTTY && !process.env.CI && process.env.NODE_ENV !== 'test';
if (isInteractive) {
  console.log('\n📣 Thanks for having installed harvest!');
  console.log('⭐ If you liked but an star: ' + repoUrl + '\n');
  if (shouldOpen) {
    if (!fs.existsSync(flagFile)) {
      try {
        const cmd =
          process.platform === 'darwin'
            ? `open "${repoUrl}"`
            : process.platform === 'win32'
              ? `start "" "${repoUrl}"`
              : `xdg-open "${repoUrl}"`;
        exec(cmd);
        fs.writeFileSync(flagFile, 'opened');
      } catch (_) {
        /* Non‑fatal: ignore failures (e.g. CI or headless environments) */
      }
    }
  }
}
