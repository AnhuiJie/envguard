#!/usr/bin/env node

/**
 * EnvGuard CLI — Environment variable & config validation, security scanning, and documentation generator
 */

const { runInit } = require('./commands/init');
const { runValidate } = require('./commands/validate');
const { runCheck } = require('./commands/check');
const { runDocs } = require('./commands/docs');
const { runDiff } = require('./commands/diff');

const VERSION = '1.0.0';

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const options = {};
  const positional = [];

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      positional.push(args[i]);
    }
  }

  // Map positional args to command-specific options
  if (command === 'diff' && positional.length >= 2) {
    options.fileA = positional[0];
    options.fileB = positional[1];
  }

  return { command, options };
}

function printHelp() {
  console.log(`
EnvGuard v${VERSION} — Environment variable & config validation, security scanning, and documentation generator

Usage:
  envguard <command> [options]

Commands:
  init              Create envguard.config.js template
  validate          Validate environment variables against schema
  check             Scan .env files for sensitive information
  docs              Generate .env.example and documentation
  diff              Compare two .env files

Options:
  --config <path>   Path to config file
  --env-file <path> Path to .env file
  --output <dir>    Output directory for docs
  --severity <level> Minimum severity for security check (low|medium|high|critical)
  --recursive       Scan subdirectories for .env files
  --force           Overwrite existing files
  --allow-failure   Exit with code 0 even on errors
  --help            Show this help message
  --version         Show version number

Examples:
  envguard init
  envguard validate
  envguard validate --env-file .env.production
  envguard check --recursive
  envguard docs --output ./docs
  envguard diff .env.development .env.production
`);
}

function main() {
  const { command, options } = parseArgs(process.argv);

  if (options.help) {
    printHelp();
    return;
  }

  if (options.version) {
    console.log(`EnvGuard v${VERSION}`);
    return;
  }

  switch (command) {
    case 'init':
      runInit({ ...options, cwd: process.cwd() });
      break;
    case 'validate':
      runValidate({ ...options, cwd: process.cwd() });
      break;
    case 'check':
      runCheck({ ...options, cwd: process.cwd() });
      break;
    case 'docs':
      runDocs({ ...options, cwd: process.cwd() });
      break;
    case 'diff':
      runDiff({ ...options, cwd: process.cwd() });
      break;
    default:
      printHelp();
      if (command) {
        console.log(`Unknown command: ${command}`);
      }
      break;
  }
}

main();
