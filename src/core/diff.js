/**
 * Multi-environment config diff tool
 * Compares .env files across environments (dev/staging/prod)
 */

const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const vars = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
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

function diffEnvs(envA, envB, labelA = 'A', labelB = 'B') {
  const keysA = new Set(Object.keys(envA));
  const keysB = new Set(Object.keys(envB));

  const onlyInA = [...keysA].filter((k) => !keysB.has(k));
  const onlyInB = [...keysB].filter((k) => !keysA.has(k));
  const common = [...keysA].filter((k) => keysB.has(k));

  const valueDiff = common
    .filter((k) => envA[k] !== envB[k])
    .map((k) => ({
      key: k,
      [labelA]: envA[k],
      [labelB]: envB[k],
    }));

  return {
    onlyInA: onlyInA.map((k) => ({ key: k, value: envA[k] })),
    onlyInB: onlyInB.map((k) => ({ key: k, value: envB[k] })),
    valueDiff,
    identical: common.filter((k) => envA[k] === envB[k]),
    summary: {
      totalA: keysA.size,
      totalB: keysB.size,
      onlyInA: onlyInA.length,
      onlyInB: onlyInB.length,
      valueDiff: valueDiff.length,
      identical: common.filter((k) => envA[k] === envB[k]).length,
    },
  };
}

function formatDiffResult(result, labelA, labelB) {
  const lines = [];

  lines.push(`Environment Diff: ${labelA} ↔ ${labelB}`);
  lines.push('═'.repeat(50));
  lines.push('');

  lines.push(`Summary: ${result.summary.totalA} vars in ${labelA}, ${result.summary.totalB} vars in ${labelB}`);
  lines.push(`  ${result.summary.identical} identical, ${result.summary.valueDiff} different`);
  lines.push('');

  if (result.onlyInA.length > 0) {
    lines.push(`Only in ${labelA}:`);
    for (const item of result.onlyInA) {
      lines.push(`  - ${item.key}=${item.value}`);
    }
    lines.push('');
  }

  if (result.onlyInB.length > 0) {
    lines.push(`Only in ${labelB}:`);
    for (const item of result.onlyInB) {
      lines.push(`  - ${item.key}=${item.value}`);
    }
    lines.push('');
  }

  if (result.valueDiff.length > 0) {
    lines.push('Different values:');
    for (const item of result.valueDiff) {
      lines.push(`  - ${item.key}:`);
      lines.push(`      ${labelA}: ${item[labelA]}`);
      lines.push(`      ${labelB}: ${item[labelB]}`);
    }
  }

  return lines.join('\n');
}

module.exports = { parseEnvFile, diffEnvs, formatDiffResult };
