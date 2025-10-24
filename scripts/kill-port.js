#!/usr/bin/env node

/**
 * Script pour tuer les processus utilisant un port spécifique
 * Usage: node kill-port.js 3000
 */

const { exec } = require("child_process");
const port = process.argv[2];

if (!port) {
  console.error("❌ Usage: node kill-port.js <port>");
  console.error("   Example: node kill-port.js 3000");
  process.exit(1);
}

console.log(`🔍 Searching for processes using port ${port}...`);

// Commande pour trouver les processus utilisant le port
const findCommand = `netstat -ano | findstr :${port}`;

exec(findCommand, (error, stdout, stderr) => {
  if (error || !stdout.trim()) {
    console.log(`✅ Port ${port} is already free`);
    return;
  }

  const lines = stdout.trim().split("\n");
  const pids = new Set();

  lines.forEach((line) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5) {
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0") {
        pids.add(pid);
      }
    }
  });

  if (pids.size === 0) {
    console.log(`✅ No processes found using port ${port}`);
    return;
  }

  console.log(`🎯 Found ${pids.size} process(es) using port ${port}`);

  // Tuer chaque processus
  pids.forEach((pid) => {
    const killCommand = `taskkill /PID ${pid} /F`;

    exec(killCommand, (killError, killStdout, killStderr) => {
      if (killError) {
        console.error(`❌ Failed to kill process ${pid}:`, killError.message);
      } else {
        console.log(`✅ Successfully killed process ${pid}`);
      }
    });
  });
});
