/**
 * Tests for template command: list, apply, merge
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const { getTemplate, listTemplates, getTemplateNames } = require('../src/templates');
const { runTemplateList, runTemplateApply, generateConfigFile } = require('../src/commands/template');

// ── helper ──────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✓ PASS: ${message}`);
    passed++;
  }
}

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envguard-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ── template registry tests ─────────────────────────

// All 6 templates should be registered
const names = getTemplateNames();
assert(names.length === 6, `Should have 6 templates, got ${names.length}`);
assert(names.includes('nextjs'), 'Should include nextjs template');
assert(names.includes('express'), 'Should include express template');
assert(names.includes('django'), 'Should include django template');
assert(names.includes('rails'), 'Should include rails template');
assert(names.includes('docker-compose'), 'Should include docker-compose template');
assert(names.includes('serverless'), 'Should include serverless template');

// Each template should have required fields
const templates = listTemplates();
for (const t of templates) {
  assert(typeof t.name === 'string' && t.name.length > 0, `Template ${t.name} should have a name`);
  assert(typeof t.description === 'string' && t.description.length > 0, `Template ${t.name} should have a description`);
  assert(typeof t.schema === 'object' && Object.keys(t.schema).length > 0, `Template ${t.name} should have a non-empty schema`);
  assert(Array.isArray(t.tags), `Template ${t.name} should have tags array`);
}

// getTemplate should return null for unknown template
assert(getTemplate('nonexistent') === null, 'Unknown template should return null');

// getTemplate should return valid template for known name
const nextjs = getTemplate('nextjs');
assert(nextjs !== null, 'nextjs template should exist');
assert(nextjs.schema.DATABASE_URL !== undefined, 'nextjs should have DATABASE_URL');
assert(nextjs.schema.NEXTAUTH_SECRET !== undefined, 'nextjs should have NEXTAUTH_SECRET');

// ── generateConfigFile tests ─────────────────────────

const testSchema = {
  NODE_ENV: {
    required: true,
    type: 'string',
    enum: ['development', 'production'],
    description: 'App environment',
  },
  PORT: {
    required: false,
    type: 'port',
    default: '3000',
    description: 'Server port',
  },
  API_KEY: {
    required: true,
    type: 'string',
    description: 'API key',
  },
};

const configContent = generateConfigFile(testSchema, { minSeverity: 'medium', ignoreKeys: [] }, { projectName: 'TestApp' }, 'test');

assert(configContent.includes('module.exports'), 'Config should be a module.exports');
assert(configContent.includes('schema:'), 'Config should have schema section');
assert(configContent.includes('security:'), 'Config should have security section');
assert(configContent.includes('docs:'), 'Config should have docs section');
assert(configContent.includes('NODE_ENV'), 'Config should include NODE_ENV');
assert(configContent.includes('PORT'), 'Config should include PORT');
assert(configContent.includes('API_KEY'), 'Config should include API_KEY');
assert(configContent.includes('required') || configContent.includes('Required'), 'Config should have required/Required references');
assert(configContent.includes('false') || configContent.includes('Optional'), 'Config should have optional (required: false) entries');
assert(configContent.includes('development') && configContent.includes('production'), 'Config should include enum values');
assert(configContent.includes('3000'), 'Config should include default value');

// ── apply template (fresh) tests ─────────────────────

const tempDir1 = createTempDir();
try {
  // Apply nextjs template to empty directory
  runTemplateApply({ cwd: tempDir1, template: 'nextjs', force: true });

  const configPath = path.join(tempDir1, 'envguard.config.js');
  assert(fs.existsSync(configPath), 'Config file should be created');

  // Verify the generated config is valid JS
  delete require.cache[require.resolve(configPath)];
  const config = require(configPath);
  assert(config.schema !== undefined, 'Generated config should have schema');
  assert(config.schema.DATABASE_URL !== undefined, 'Generated config should have DATABASE_URL from nextjs template');
  assert(config.schema.NEXTAUTH_SECRET !== undefined, 'Generated config should have NEXTAUTH_SECRET from nextjs template');
  assert(config.security !== undefined, 'Generated config should have security section');
  assert(config.docs !== undefined, 'Generated config should have docs section');
} finally {
  cleanupTempDir(tempDir1);
}

// ── apply template (merge) tests ─────────────────────

const tempDir2 = createTempDir();
try {
  // Create an existing config
  const existingConfig = `module.exports = {
  schema: {
    MY_CUSTOM_VAR: {
      required: true,
      type: 'string',
      description: 'My custom variable',
    },
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'Old database URL',
    },
  },
  security: { minSeverity: 'low', ignoreKeys: [] },
  docs: { projectName: 'OldProject' },
};`;
  fs.writeFileSync(path.join(tempDir2, 'envguard.config.js'), existingConfig, 'utf-8');

  // Merge express template
  runTemplateApply({ cwd: tempDir2, template: 'express', merge: true });

  const configPath = path.join(tempDir2, 'envguard.config.js');
  assert(fs.existsSync(configPath), 'Config file should still exist after merge');

  delete require.cache[require.resolve(configPath)];
  const config = require(configPath);

  // Custom variable should be preserved
  assert(config.schema.MY_CUSTOM_VAR !== undefined, 'Existing custom variable should be preserved');
  // DATABASE_URL should be overwritten by template
  assert(config.schema.DATABASE_URL !== undefined, 'DATABASE_URL should exist after merge');
  // Express-specific variables should be added
  assert(config.schema.JWT_SECRET !== undefined, 'JWT_SECRET from express template should be added');
  assert(config.schema.PORT !== undefined, 'PORT from express template should be added');
} finally {
  cleanupTempDir(tempDir2);
}

// ── apply template without name should error ─────────

const tempDir3 = createTempDir();
const originalExit3 = process.exit;
try {
  let exitCode = 0;
  process.exit = (code) => { exitCode = code; throw new Error(`EXIT:${code}`); };

  try {
    runTemplateApply({ cwd: tempDir3, template: undefined });
  } catch (e) {
    if (!e.message.startsWith('EXIT:')) throw e;
  }

  assert(exitCode === 1, 'Should exit with code 1 when no template name provided');
} finally {
  process.exit = originalExit3;
  cleanupTempDir(tempDir3);
}

// ── apply unknown template should error ───────────────

const tempDir4 = createTempDir();
const originalExit4 = process.exit;
try {
  let exitCode = 0;
  process.exit = (code) => { exitCode = code; throw new Error(`EXIT:${code}`); };

  try {
    runTemplateApply({ cwd: tempDir4, template: 'nonexistent' });
  } catch (e) {
    if (!e.message.startsWith('EXIT:')) throw e;
  }

  assert(exitCode === 1, 'Should exit with code 1 for unknown template');
} finally {
  process.exit = originalExit4;
  cleanupTempDir(tempDir4);
}

// ── summary ──────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
