/**
 * envguard check — scan for sensitive information in .env files
 */

const { scanForSecrets } = require('../core/security');
const { formatFinding, printHeader, colorize } = require('../utils/format');
const { findEnvFiles, loadEnvFile } = require('../utils/file');

function runCheck(options = {}) {
  const cwd = options.cwd || process.cwd();

  printHeader('EnvGuard — Security Check');

  // Find .env files
  const envFiles = findEnvFiles(cwd, { recursive: options.recursive });

  if (envFiles.length === 0) {
    console.log(colorize('No .env files found.', 'yellow'));
    return { findings: [], total: 0 };
  }

  console.log(`Scanning ${envFiles.length} file(s)...\n`);

  let allFindings = [];

  for (const filePath of envFiles) {
    const envObj = loadEnvFile(filePath);
    const result = scanForSecrets(envObj, {
      ignoreKeys: options.ignoreKeys,
      minSeverity: options.severity || 'medium',
    });

    if (result.findings.length > 0) {
      console.log(colorize(`📄 ${filePath}`, 'bold'));
      for (const finding of result.findings) {
        console.log(`  ${formatFinding(finding)}`);
      }
      console.log('');
      allFindings = allFindings.concat(
        result.findings.map((f) => ({ ...f, file: filePath }))
      );
    }
  }

  if (allFindings.length === 0) {
    console.log(colorize('✓ No sensitive information detected!', 'green'));
  } else {
    console.log(colorize(`Found ${allFindings.length} potential issue(s)`, 'yellow'));
    if (allFindings.some((f) => f.severity === 'critical')) {
      console.log(colorize('  Critical issues found! Do not commit these files.', 'red'));
    }
  }

  console.log('');

  // Support both camelCase and kebab-case: allowFailure or allow-failure
  const allowFailure = options.allowFailure || options['allow-failure'];
  if (allFindings.some((f) => f.severity === 'critical') && !allowFailure) {
    process.exit(1);
  }

  return { findings: allFindings, total: allFindings.length };
}

module.exports = { runCheck };
