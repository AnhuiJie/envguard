/**
 * File system utilities for finding and loading .env files
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE_PATTERNS = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.staging',
  '.env.production',
  '.env.test',
];

function findEnvFiles(dir, options = {}) {
  const recursive = options.recursive || false;
  const maxDepth = options.maxDepth || 3;
  const envFiles = [];

  function scan(currentDir, depth) {
    if (depth > maxDepth) return;

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name.endsWith('.env')) {
          envFiles.push(path.join(currentDir, entry.name));
        } else if (entry.name === '.env') {
          envFiles.push(path.join(currentDir, entry.name));
        } else if (entry.name.startsWith('.env.')) {
          envFiles.push(path.join(currentDir, entry.name));
        }

        // Also check for env files without leading dot
        if (entry.name === 'env' || entry.name.startsWith('env.')) {
          envFiles.push(path.join(currentDir, entry.name));
        }

        if (recursive && entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scan(path.join(currentDir, entry.name), depth + 1);
        }
      }
    } catch {
      // Permission denied or other FS errors — skip
    }
  }

  scan(dir, 0);
  return [...new Set(envFiles)];
}

function findConfigFile(dir) {
  const configNames = [
    'envguard.config.js',
    'envguard.config.cjs',
    '.envguardrc.js',
    '.envguardrc.cjs',
  ];

  for (const name of configNames) {
    const fullPath = path.join(dir, name);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const vars = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    vars[key] = value;
  }

  return vars;
}

module.exports = { findEnvFiles, findConfigFile, loadEnvFile, ENV_FILE_PATTERNS };
