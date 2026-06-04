/**
 * Tests for new type validators: date, semver, color
 */

const { validateEnv, validators } = require('../src/core/validator');
const { validateSchema, SUPPORTED_TYPES } = require('../src/core/schema');

// ── date validator ──────────────────────────────────
const dateValidator = validators.date;

// Valid dates
assert(dateValidator('2024-01-15').valid, 'ISO date should be valid');
assert(dateValidator('2024-01-15T10:30:00').valid, 'ISO datetime should be valid');
assert(dateValidator('2024-01-15T10:30:00Z').valid, 'ISO datetime with Z should be valid');
assert(dateValidator('2024-01-15T10:30:00+08:00').valid, 'ISO datetime with timezone should be valid');

// Invalid dates
assert(!dateValidator('not-a-date').valid, 'Random string should be invalid');
assert(!dateValidator('2024/01/15').valid, 'Slash-separated date should be invalid');
assert(!dateValidator('01-15-2024').valid, 'US format date should be invalid');
assert(!dateValidator('2024-13-01').valid, 'Invalid month should be invalid');

// ── semver validator ────────────────────────────────
const semverValidator = validators.semver;

// Valid semver
assert(semverValidator('1.2.3').valid, 'Basic semver should be valid');
assert(semverValidator('0.0.0').valid, 'Zero semver should be valid');
assert(semverValidator('10.20.30').valid, 'Large numbers should be valid');
assert(semverValidator('1.0.0-beta').valid, 'Semver with prerelease should be valid');
assert(semverValidator('1.0.0-beta.1').valid, 'Semver with prerelease number should be valid');
assert(semverValidator('2.0.0+build').valid, 'Semver with build metadata should be valid');

// Invalid semver
assert(!semverValidator('1.2').valid, 'Missing patch version should be invalid');
assert(!semverValidator('v1.2.3').valid, 'Leading v should be invalid');
assert(!semverValidator('1.2.3.4').valid, 'Extra version segment should be invalid');
assert(!semverValidator('abc').valid, 'Random string should be invalid');

// ── color validator ─────────────────────────────────
const colorValidator = validators.color;

// Valid hex colors
assert(colorValidator('#fff').valid, '3-digit hex should be valid');
assert(colorValidator('#ffffff').valid, '6-digit hex should be valid');
assert(colorValidator('#ffffffaa').valid, '8-digit hex should be valid');
assert(colorValidator('#FF6600').valid, 'Uppercase hex should be valid');

// Valid rgb/hsl
assert(colorValidator('rgb(255, 128, 0)').valid, 'rgb should be valid');
assert(colorValidator('rgba(255, 128, 0, 0.5)').valid, 'rgba should be valid');
assert(colorValidator('hsl(120, 50%, 50%)').valid, 'hsl should be valid');

// Valid named colors
assert(colorValidator('red').valid, 'Named color "red" should be valid');
assert(colorValidator('blue').valid, 'Named color "blue" should be valid');
assert(colorValidator('cornflowerblue').valid, 'Long named color should be valid');

// Invalid colors
assert(!colorValidator('notacolor').valid, 'Invalid named color should be invalid');
assert(!colorValidator('#12').valid, '2-digit hex should be invalid');
assert(!colorValidator('#12345').valid, '5-digit hex should be invalid');
assert(!colorValidator('rgb(300 0 0)').valid, 'rgb without commas should be invalid');

// ── validateEnv integration ──────────────────────────
const result = validateEnv(
  {
    APP_VERSION: '1.2.3',
    RELEASE_DATE: '2024-01-15',
    BRAND_COLOR: '#ff6600',
    BAD_VERSION: 'v1.2',
    BAD_DATE: 'not-a-date',
    BAD_COLOR: 'notacolor',
  },
  {
    APP_VERSION: { required: true, type: 'semver' },
    RELEASE_DATE: { required: true, type: 'date' },
    BRAND_COLOR: { required: true, type: 'color' },
    BAD_VERSION: { required: true, type: 'semver' },
    BAD_DATE: { required: true, type: 'date' },
    BAD_COLOR: { required: true, type: 'color' },
  }
);

assert(result.checked === 6, 'Should check 6 variables');
assert(!result.valid, 'Should fail validation due to 3 invalid values');
assert(result.errors.length === 3, 'Should have 3 errors');

// ── schema validation ───────────────────────────────
assert(SUPPORTED_TYPES.includes('date'), 'date should be in SUPPORTED_TYPES');
assert(SUPPORTED_TYPES.includes('semver'), 'semver should be in SUPPORTED_TYPES');
assert(SUPPORTED_TYPES.includes('color'), 'color should be in SUPPORTED_TYPES');

// Schema with new types should validate
validateSchema({
  APP_VERSION: { required: true, type: 'semver', description: 'Version' },
  RELEASE_DATE: { required: true, type: 'date', description: 'Release date' },
  BRAND_COLOR: { required: false, type: 'color', description: 'Brand color' },
});

// ── helper ──────────────────────────────────────────
function assert(condition, message) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('\nAll tests passed!');