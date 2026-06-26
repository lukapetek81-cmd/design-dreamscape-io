#!/usr/bin/env node
// Generates src/data/ossAttributions.json from package.json + node_modules.
// Reads each runtime dependency's own package.json to extract license + homepage.
// Re-run after `npm install` (or via `npm run gen:attributions`).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const OUT = path.join(ROOT, 'src/data/ossAttributions.json');

// Skip dev/test/build-only deps that ship no user-facing code.
const EXCLUDE = new Set([
  '@playwright/test',
  '@testing-library/dom',
  '@testing-library/jest-dom',
  '@testing-library/react',
  '@testing-library/user-event',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  '@capacitor/assets',
  '@capacitor/cli',
  'vitest',
]);

function readPkg(name) {
  try {
    const p = path.join(ROOT, 'node_modules', name, 'package.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function normalizeLicense(lic) {
  if (!lic) return 'UNKNOWN';
  if (typeof lic === 'string') return lic;
  if (Array.isArray(lic)) return lic.map((l) => l.type || l).join(' OR ');
  return lic.type || 'UNKNOWN';
}

function normalizeUrl(pkg, name) {
  if (pkg?.homepage) return String(pkg.homepage).replace(/#.*$/, '');
  const repo = pkg?.repository;
  if (typeof repo === 'string') return repo;
  if (repo?.url) {
    return repo.url
      .replace(/^git\+/, '')
      .replace(/^git:\/\//, 'https://')
      .replace(/\.git$/, '');
  }
  return `https://www.npmjs.com/package/${name}`;
}

const deps = Object.keys(PKG.dependencies || {})
  .filter((d) => !EXCLUDE.has(d))
  .sort((a, b) => a.localeCompare(b));

const libraries = deps
  .map((name) => {
    const pkg = readPkg(name);
    if (!pkg) return { name, version: PKG.dependencies[name], license: 'UNKNOWN', url: `https://www.npmjs.com/package/${name}` };
    return {
      name,
      version: pkg.version,
      license: normalizeLicense(pkg.license),
      url: normalizeUrl(pkg, name),
    };
  });

const dataSources = [
  { name: 'OilPriceAPI', license: 'Commercial license', url: 'https://oilpriceapi.com' },
  { name: 'Financial Modeling Prep', license: 'Commercial license', url: 'https://financialmodelingprep.com' },
  { name: 'Marketaux', license: 'Commercial license', url: 'https://www.marketaux.com' },
  { name: 'BloFin API', license: 'Commercial license', url: 'https://blofin.com' },
];

const output = {
  generatedAt: new Date().toISOString(),
  libraries,
  dataSources,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');
console.log(`Wrote ${libraries.length} library attributions to ${path.relative(ROOT, OUT)}`);