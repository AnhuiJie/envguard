/**
 * envguard init — create envguard.config.js template
 */

const fs = require('fs');
const path = require('path');
const { printHeader, colorize } = require('../utils/format');
const { loadEnvFile } = require('../utils/file');

const CONFIG_TEMPLATE = `/**
 * EnvGuard Configuration
 * @see https://github.com/AnhuiJie/envguard#configuration
 */
module.exports = {
  // Define your environment variable schema
  schema: {
    // ── Application ──────────────────────
    NODE_ENV: {
      required: true,
      type: 'string',
      enum: ['development', 'staging', 'production', 'test'],
      description: 'Application environment',
    },
    PORT: {
      required: false,
      type: 'port',
      default: '3000',
      description: 'Server port',
    },

    // ── Database ─────────────────────────
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'Database connection string',
    },

    // ── Authentication ───────────────────
    JWT_SECRET: {
      required: true,
      type: 'string',
      description: 'Secret key for JWT signing',
    },

    // ── External Services ────────────────
    // API_KEY: {
    //   required: false,
    //   type: 'string',
    //   description: 'External API key',
    // },

    // ── Additional Types ─────────────────
    // APP_VERSION: {
    //   required: false,
    //   type: 'semver',
    //   description: 'Application version (e.g. 1.2.3)',
    // },
    // RELEASE_DATE: {
    //   required: false,
    //   type: 'date',
    //   description: 'Release date (ISO 8601, e.g. 2024-01-15)',
    // },
    // BRAND_COLOR: {
    //   required: false,
    //   type: 'color',
    //   description: 'Primary brand color (hex, rgb, or named CSS color)',
    // },
  },

  // Security scanning options
  security: {
    // Minimum severity to report: 'low' | 'medium' | 'high' | 'critical'
    minSeverity: 'medium',
    // Keys to ignore during security scan
    ignoreKeys: [],
  },

  // Documentation generation options
  docs: {
    projectName: '{{PROJECT_NAME}}',
  },
};
`;

function runInit(options = {}) {
  const cwd = options.cwd || process.cwd();

  printHeader('EnvGuard — Init');

  const configPath = path.join(cwd, 'envguard.config.js');

  if (fs.existsSync(configPath) && !options.force) {
    console.log(colorize('envguard.config.js already exists. Use --force to overwrite.', 'yellow'));
    return;
  }

  // Try to auto-detect variables from existing .env
  const envObj = loadEnvFile(path.join(cwd, '.env'));
  let content = CONFIG_TEMPLATE;

  if (Object.keys(envObj).length > 0) {
    console.log(colorize(`Detected ${Object.keys(envObj).length} variable(s) in .env`, 'cyan'));
    console.log('Review and update the generated config as needed.\n');
  }

  content = content.replace('{{PROJECT_NAME}}', path.basename(cwd));

  fs.writeFileSync(configPath, content, 'utf-8');
  console.log(colorize(`✓ Created envguard.config.js`, 'green'));
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit envguard.config.js to define your schema');
  console.log('  2. Run: npx envguard validate');
  console.log('  3. Run: npx envguard check');
  console.log('  4. Run: npx envguard docs');
}

module.exports = { runInit };
