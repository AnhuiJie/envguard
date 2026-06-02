/**
 * envguard diff — compare environment files across environments
 */

const { diffEnvs, formatDiffResult } = require('../core/diff');
const { printHeader, colorize } = require('../utils/format');
const fs = require('fs');
const path = require('path');

function runDiff(options = {}) {
  const cwd = options.cwd || process.cwd();

  printHeader('EnvGuard — Environment Diff');

  const fileA = options.fileA;
  const fileB = options.fileB;

  if (!fileA || !fileB) {
    console.error('Usage: envguard diff <fileA> <fileB>');
    console.error('Example: envguard diff .env.development .env.production');
    process.exit(1);
  }

  const pathA = path.resolve(cwd, fileA);
  const pathB = path.resolve(cwd, fileB);

  if (!fs.existsSync(pathA)) {
    console.error(`File not found: ${fileA}`);
    process.exit(1);
  }
  if (!fs.existsSync(pathB)) {
    console.error(`File not found: ${fileB}`);
    process.exit(1);
  }

  // Parse both files
  const { parseEnvFile } = require('../core/diff');
  const envA = parseEnvFile(pathA);
  const envB = parseEnvFile(pathB);

  // Diff
  const labelA = path.basename(fileA);
  const labelB = path.basename(fileB);
  const result = diffEnvs(envA, envB, labelA, labelB);

  // Output
  console.log(formatDiffResult(result, labelA, labelB));
  console.log('');

  if (result.summary.onlyInA > 0 || result.summary.onlyInB > 0 || result.summary.valueDiff > 0) {
    console.log(colorize('⚠ Environments are not in sync', 'yellow'));
  } else {
    console.log(colorize('✓ Environments are in sync', 'green'));
  }

  return result;
}

module.exports = { runDiff };
