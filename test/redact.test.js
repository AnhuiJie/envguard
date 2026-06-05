/**
 * Tests for log redaction module
 */

const { redactObject, redactString, isSensitiveKey, createRedactionMiddleware } = require('../src/core/redact');

// ── redactObject ────────────────────────────────────
const objResult = redactObject({
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://admin:s3cret@db:5432/mydb',
  API_KEY: 'sk_live_abc123',
  PORT: '3000',
  JWT_SECRET: 'my-secret-key',
  APP_NAME: 'myapp',
});

assert(objResult.NODE_ENV === 'production', 'Non-sensitive key should keep original value');
assert(objResult.PORT === '3000', 'PORT should not be redacted');
assert(objResult.APP_NAME === 'myapp', 'APP_NAME should not be redacted');
assert(objResult.API_KEY === '***', 'API_KEY should be redacted');
assert(objResult.JWT_SECRET === '***', 'JWT_SECRET should be redacted');
assert(objResult.DATABASE_URL === '***', 'DATABASE_URL should be redacted');

// Custom mask
const customMask = redactObject({ PASSWORD: 'abc123' }, { mask: '[REDACTED]' });
assert(customMask.PASSWORD === '[REDACTED]', 'Custom mask should work');

// Ignore keys
const ignored = redactObject({ API_KEY: 'sk_live_abc' }, { ignoreKeys: ['API_KEY'] });
assert(ignored.API_KEY === 'sk_live_abc', 'Ignored key should keep original value');

// Custom detector
const customDetected = redactObject({ MY_CUSTOM_FIELD: 'value' }, {
  customDetector: (key) => key.startsWith('MY_CUSTOM_'),
});
assert(customDetected.MY_CUSTOM_FIELD === '***', 'Custom detector should work');

// ── redactString ────────────────────────────────────
// Key=value patterns
assert(redactString('JWT_SECRET=my-secret-key') === 'JWT_SECRET=***', 'JWT_SECRET=value should be redacted');
assert(redactString('API_KEY=sk_live_abc123') === 'API_KEY=***', 'API_KEY=value should be redacted');

// Database connection strings (both key and embedded password are redacted)
const dbResult = redactString('DATABASE_URL=postgres://admin:s3cretP@ss@db.example.com:5432/mydb');
assert(dbResult.includes('***'), 'Database URL should contain redaction');
assert(!dbResult.includes('s3cretP@ss'), 'Database URL password should be redacted');

// AWS keys
assert(redactString('Found key AKIAIOSFODNN7EXAMPLE') === 'Found key ***', 'AWS key should be redacted');

// GitHub tokens
const ghResult = redactString('Token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij');
assert(!ghResult.includes('ghp_'), 'GitHub token value should be redacted');
assert(ghResult.includes('***'), 'GitHub token should be replaced with mask');

// Private keys
const privateKeyInput = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQ\n-----END RSA PRIVATE KEY-----';
const privateKeyOutput = redactString(privateKeyInput);
assert(privateKeyOutput.includes('REDACTED'), 'Private key block should be redacted');
assert(!privateKeyOutput.includes('MIIEpAIBAAKCAQ'), 'Private key content should be removed');

// Known values
assert(
  redactString('Login with password s3cretP@ss', { knownValues: ['s3cretP@ss'] })
    .includes('***'),
  'Known value should be redacted'
);

// Non-sensitive strings should pass through
assert(redactString('NODE_ENV=production') === 'NODE_ENV=production', 'Non-sensitive key=value should not be redacted');
assert(redactString('PORT=3000') === 'PORT=3000', 'PORT=value should not be redacted');

// ── isSensitiveKey ──────────────────────────────────
assert(isSensitiveKey('PASSWORD'), 'PASSWORD should be sensitive');
assert(isSensitiveKey('API_KEY'), 'API_KEY should be sensitive');
assert(isSensitiveKey('JWT_SECRET'), 'JWT_SECRET should be sensitive');
assert(isSensitiveKey('DATABASE_URL'), 'DATABASE_URL should be sensitive');
assert(!isSensitiveKey('PORT'), 'PORT should not be sensitive');
assert(!isSensitiveKey('NODE_ENV'), 'NODE_ENV should not be sensitive');
assert(!isSensitiveKey('APP_NAME'), 'APP_NAME should not be sensitive');

// ── createRedactionMiddleware ────────────────────────
const middleware = createRedactionMiddleware({ mask: '[HIDDEN]' });
assert(middleware('JWT_SECRET=abc123') === 'JWT_SECRET=[HIDDEN]', 'Middleware should redact strings');
assert(middleware({ API_KEY: 'sk_live_abc', PORT: '3000' }).API_KEY === '[HIDDEN]', 'Middleware should redact objects');
assert(middleware({ API_KEY: 'sk_live_abc', PORT: '3000' }).PORT === '3000', 'Middleware should keep non-sensitive values');

// ── helper ──────────────────────────────────────────
function assert(condition, message) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('\nAll redaction tests passed!');