#!/usr/bin/env node
// ==============================================================================
// 🔄 OpenPisoWiFi - Automated Installer Script Synchronization
// ==============================================================================
// Copies scripts/install.sh into landing/public/install.sh so the landing
// website (openpisowifi.nicolei.games) always serves the exact latest installer.
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const srcInstall = path.join(ROOT_DIR, 'scripts', 'install.sh');
const destInstall = path.join(ROOT_DIR, 'landing', 'public', 'install.sh');

if (fs.existsSync(srcInstall)) {
  fs.mkdirSync(path.dirname(destInstall), { recursive: true });
  fs.copyFileSync(srcInstall, destInstall);
  const size = fs.statSync(destInstall).size;
  console.log(`✓ Synchronized installer script to landing/public/install.sh (${size} bytes)`);
} else {
  console.warn(`! Source installer not found at ${srcInstall}`);
}
