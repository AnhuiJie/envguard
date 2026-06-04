# Stop Leaking Secrets: How EnvGuard Catches API Keys in Your .env Files

> Every year, thousands of API keys and secrets are accidentally pushed to GitHub. EnvGuard is a zero-dependency CLI tool that catches them before it's too late.

## The Problem

We've all been there — you're rushing to deploy, push your code, and suddenly realize your `.env` file containing AWS keys, database passwords, and GitHub tokens just went public. By the time you notice, automated scrapers have already harvested your credentials.

According to GitHub's own research, **over 1.7 million secrets** were leaked on the platform in a single year. The average time to rotate a compromised key? **Hours of downtime and thousands of dollars.**

## Meet EnvGuard

**EnvGuard** is an all-in-one CLI tool for environment variable validation, security scanning, and documentation generation. It's built with zero external dependencies — pure Node.js, no supply chain risk.

```bash
npm install -g @anhuijie/envguard
```

## The Security Scanner That Catches What You Miss

Let's say you have a `.env` file like this:

```env
# .env
NODE_ENV=production
DATABASE_URL=postgres://admin:s3cretP@ss@db.example.com:5432/mydb
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_KEY_HERE
APP_SECRET=my-super-secret-jwt-key-2024
```

Run the scanner:

```bash
envguard check
```

Output:

```
🔍 Scanning environment variables for secrets...

🔴 CRITICAL: AWS Access Key detected in "AWS_ACCESS_KEY_ID"
🔴 CRITICAL: GitHub Token detected in "GITHUB_TOKEN"
🔴 CRITICAL: Stripe Key detected in "STRIPE_SECRET_KEY"
🔴 CRITICAL: Database URL with Password detected in "DATABASE_URL"
🟠 HIGH: JWT Secret detected in "APP_SECRET"

📊 Summary: 5 findings (4 critical, 1 high)
```

### What It Detects

| Secret Type | Severity | Pattern |
|-------------|----------|---------|
| AWS Access Key | Critical | `AKIA` prefix + 16 alphanumeric chars |
| AWS Secret Key | Critical | aws + secret/key context |
| GitHub Token | Critical | `ghp_` / `ghs_` prefix |
| GitLab Token | Critical | `glpat-` prefix |
| Slack Token | Critical | `xoxb-` / `xoxp-` prefix |
| Stripe Live Key | Critical | `sk_live_` prefix |
| Private Key | Critical | `-----BEGIN PRIVATE KEY-----` |
| JWT Secret | High | jwt + secret/key context |
| Database URL with Password | High | Connection string with embedded credentials |
| Generic API Key / Password / Secret | High/Medium | Common key name patterns |

## Beyond Scanning: Full Environment Safety

Security scanning is just one piece. EnvGuard also provides:

### Schema Validation

Define what your environment variables should look like:

```js
// envguard.config.js
module.exports = {
  schema: {
    NODE_ENV: {
      required: true,
      type: 'string',
      enum: ['development', 'staging', 'production', 'test'],
    },
    PORT: {
      required: false,
      type: 'port',
      default: '3000',
    },
    DATABASE_URL: {
      required: true,
      type: 'url',
    },
  },
};
```

```bash
envguard validate
```

Catches missing required variables, wrong types, invalid ports, and more — before your app crashes in production.

### Auto Documentation

```bash
envguard docs
```

Generates `.env.example` and `ENV.md` from your schema, so your team always knows which variables are needed.

### Environment Diff

```bash
envguard diff .env.development .env.production
```

Compare `.env` files across environments to find configuration drift before it causes issues.

## CI/CD Integration

Add EnvGuard to your GitHub Actions pipeline:

```yaml
name: Env Safety Check
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @anhuijie/envguard
      - name: Validate environment config
        run: envguard validate
      - name: Security scan
        run: envguard check
```

The command exits with code `1` on validation errors or critical findings, failing the build and preventing secrets from reaching production.

## Programmatic API

Use EnvGuard in your own tools:

```js
const { validateEnv, scanForSecrets, generateEnvExample } = require('@anhuijie/envguard');

// Validate
const result = validateEnv(process.env, schema);
if (!result.valid) {
  console.error('Invalid config:', result.errors);
}

// Scan
const secrets = scanForSecrets(process.env);
if (secrets.hasCritical) {
  throw new Error('Critical secrets detected!');
}

// Generate docs
const example = generateEnvExample(schema);
```

## Why EnvGuard?

| Feature | EnvGuard | dotenv | convict | env-schema |
|---------|----------|--------|---------|------------|
| Schema Validation | ✅ | ❌ | ✅ | ✅ |
| Secret Scanning | ✅ | ❌ | ❌ | ❌ |
| Auto Documentation | ✅ | ❌ | ❌ | ❌ |
| Environment Diff | ✅ | ❌ | ❌ | ❌ |
| Zero Dependencies | ✅ | ❌ | ❌ | ❌ |
| CLI + API | ✅ | ❌ | ❌ | ❌ |

## Get Started

```bash
# Install globally
npm install -g @anhuijie/envguard

# Or use without installing
npx @anhuijie/envguard init
npx @anhuijie/envguard validate
npx @anhuijie/envguard check
```

**Links:**
- GitHub: https://github.com/AnhuiJie/envguard
- npm: https://www.npmjs.com/package/@anhuijie/envguard
- License: MIT

---

*Found this useful? Star the repo on [GitHub](https://github.com/AnhuiJie/envguard) — it helps others discover it too!*
