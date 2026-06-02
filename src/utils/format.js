/**
 * Output formatting utilities
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function colorize(text, color) {
  if (process.env.NO_COLOR) return text;
  return `${COLORS[color] || ''}${text}${COLORS.reset}`;
}

function formatError(error) {
  return colorize(`✗ ${error.key}: ${error.message}`, 'red');
}

function formatWarning(warning) {
  return colorize(`⚠ ${warning.key}: ${warning.message}`, 'yellow');
}

function formatSuccess(key) {
  return colorize(`✓ ${key}`, 'green');
}

function formatFinding(finding) {
  const severityColors = {
    critical: 'red',
    high: 'magenta',
    medium: 'yellow',
    low: 'blue',
  };
  const color = severityColors[finding.severity] || 'yellow';
  const label = colorize(`[${finding.severity.toUpperCase()}]`, color);
  return `${label} ${finding.message}`;
}

function printHeader(title) {
  console.log('');
  console.log(colorize(`  ${'═'.repeat(40)}`, 'cyan'));
  console.log(colorize(`  ${title}`, 'bold'));
  console.log(colorize(`  ${'═'.repeat(40)}`, 'cyan'));
  console.log('');
}

function printSummary(results) {
  console.log('');
  if (results.valid) {
    console.log(colorize('  ✓ All checks passed!', 'green'));
  } else {
    console.log(colorize(`  ✗ ${results.errors.length} error(s) found`, 'red'));
  }
  if (results.warnings && results.warnings.length > 0) {
    console.log(colorize(`  ⚠ ${results.warnings.length} warning(s)`, 'yellow'));
  }
  console.log(`  Checked: ${results.checked} variable(s)`);
  console.log('');
}

module.exports = { colorize, formatError, formatWarning, formatSuccess, formatFinding, printHeader, printSummary };
