<div align="center">

# 🛡️ EnvGuard

**Environment Variable Validation, Security Scanning & Documentation Generator**

[![CI](https://github.com/your-username/envguard/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/envguard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)

[English](#english) · [中文](#中文) · [日本語](#日本語)

</div>

---

<a id="english"></a>

## 🇬🇧 English

### Why EnvGuard?

Misconfigured environment variables are a leading cause of production incidents. EnvGuard provides a **single tool** to validate, secure, and document your project's configuration — catching errors before they reach production.

### Features

- **Schema Validation** — Define types, required fields, enums, ranges, and patterns for every variable
- **Security Scanning** — Detect accidentally committed secrets (AWS keys, GitHub tokens, private keys, etc.)
- **Auto Documentation** — Generate `.env.example` and markdown docs from your schema
- **Environment Diff** — Compare `.env` files across dev/staging/prod to find drift
- **CI/CD Ready** — Exit codes and GitHub Action integration for automated checks
- **Zero Dependencies** — Pure Node.js, no external packages required
- **Multi-format Support** — Works with `.env`, `.env.local`, `.env.production`, and more

### Quick Start

```bash
# Install
npm install -g envguard

# Create config
envguard init

# Validate environment variables
envguard validate

# Scan for secrets
envguard check

# Generate documentation
envguard docs

# Compare environments
envguard diff .env.development .env.production
```

### Configuration

Create `envguard.config.js` in your project root:

```js
module.exports = {
  schema: {
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
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'Database connection string',
    },
    JWT_SECRET: {
      required: true,
      type: 'string',
      description: 'Secret key for JWT signing',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: [],
  },
};
```

### Supported Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Any string value | `any text` |
| `number` | Numeric value with optional min/max | `42` |
| `boolean` | true/false, 1/0, yes/no | `true` |
| `url` | Valid URL | `https://example.com` |
| `email` | Valid email address | `user@example.com` |
| `port` | Valid port number (0-65535) | `3000` |
| `json` | Valid JSON string | `'{"key":"value"}'` |
| `regex` | Valid regex pattern | `^\\d+$` |

### Rule Options

| Option | Type | Description |
|--------|------|-------------|
| `required` | boolean | Variable must be set |
| `type` | string | Value type validation |
| `default` | any | Default value if not set |
| `enum` | array | Allowed values |
| `min` / `max` | number | Range constraints (for `number` type) |
| `pattern` | string | Regex pattern the value must match |
| `deprecated` | boolean | Mark as deprecated |
| `replacement` | string | Suggested replacement for deprecated vars |
| `description` | string | Human-readable description |

### Security Scanning

EnvGuard detects these secret types:

- AWS Access Keys & Secret Keys
- GitHub / GitLab Tokens
- Slack Tokens
- Stripe Live Keys
- Private Keys (RSA, EC, DSA)
- JWT Secrets
- Database URLs with embedded passwords
- Generic API Keys, Passwords, and Secrets

### CI/CD Integration

**GitHub Actions:**

```yaml
- name: Validate env config
  run: npx envguard validate

- name: Security check
  run: npx envguard check
```

The command exits with code `1` on validation errors or critical security findings, failing the build.

### Programmatic API

```js
const { validateEnv, scanForSecrets, generateEnvExample } = require('envguard');

const schema = { PORT: { required: true, type: 'port' } };
const result = validateEnv(process.env, schema);
// { valid: true, errors: [], warnings: [], checked: 1 }

const secrets = scanForSecrets(process.env);
// { findings: [], hasCritical: false, total: 0 }

const example = generateEnvExample(schema);
// "# Server port\n# type: port\nPORT=\n"
```

### License

[MIT](LICENSE)

---

<a id="中文"></a>

## 🇨🇳 中文

### 为什么需要 EnvGuard？

环境变量配置错误是生产事故的主要原因之一。EnvGuard 提供**一站式工具**来验证、保护和文档化项目配置——在错误到达生产环境之前就将其捕获。

### 功能特性

- **Schema 验证** — 为每个变量定义类型、必填、枚举、范围和正则模式
- **安全扫描** — 检测意外提交的密钥（AWS 密钥、GitHub Token、私钥等）
- **自动文档** — 从 Schema 生成 `.env.example` 和 Markdown 文档
- **环境对比** — 比较 dev/staging/prod 的 `.env` 文件差异
- **CI/CD 就绪** — 退出码和 GitHub Action 集成，支持自动化检查
- **零依赖** — 纯 Node.js 实现，无需外部包
- **多格式支持** — 支持 `.env`、`.env.local`、`.env.production` 等

### 快速开始

```bash
# 安装
npm install -g envguard

# 创建配置
envguard init

# 验证环境变量
envguard validate

# 扫描敏感信息
envguard check

# 生成文档
envguard docs

# 对比环境差异
envguard diff .env.development .env.production
```

### 配置

在项目根目录创建 `envguard.config.js`：

```js
module.exports = {
  schema: {
    NODE_ENV: {
      required: true,
      type: 'string',
      enum: ['development', 'staging', 'production', 'test'],
      description: '应用运行环境',
    },
    PORT: {
      required: false,
      type: 'port',
      default: '3000',
      description: '服务端口',
    },
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: '数据库连接字符串',
    },
    JWT_SECRET: {
      required: true,
      type: 'string',
      description: 'JWT 签名密钥',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: [],
  },
};
```

### 支持的类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `string` | 任意字符串 | `任意文本` |
| `number` | 数值，支持 min/max | `42` |
| `boolean` | true/false、1/0、yes/no | `true` |
| `url` | 合法 URL | `https://example.com` |
| `email` | 合法邮箱 | `user@example.com` |
| `port` | 合法端口号 (0-65535) | `3000` |
| `json` | 合法 JSON 字符串 | `'{"key":"value"}'` |
| `regex` | 合法正则表达式 | `^\\d+$` |

### 安全扫描

EnvGuard 可检测以下密钥类型：

- AWS 访问密钥和密钥
- GitHub / GitLab Token
- Slack Token
- Stripe Live Key
- 私钥（RSA、EC、DSA）
- JWT 密钥
- 包含密码的数据库连接 URL
- 通用 API Key、密码和密钥

### CI/CD 集成

**GitHub Actions：**

```yaml
- name: 验证环境配置
  run: npx envguard validate

- name: 安全检查
  run: npx envguard check
```

验证失败或发现严重安全问题时，命令以退出码 `1` 退出，使构建失败。

### 编程式 API

```js
const { validateEnv, scanForSecrets, generateEnvExample } = require('envguard');

const schema = { PORT: { required: true, type: 'port' } };
const result = validateEnv(process.env, schema);
// { valid: true, errors: [], warnings: [], checked: 1 }

const secrets = scanForSecrets(process.env);
// { findings: [], hasCritical: false, total: 0 }

const example = generateEnvExample(schema);
// "# Server port\n# type: port\nPORT=\n"
```

### 许可证

[MIT](LICENSE)

---

<a id="日本語"></a>

## 🇯🇵 日本語

### なぜ EnvGuard が必要か？

環境変数の設定ミスは本番障害の主要な原因の一つです。EnvGuard は、プロジェクトの設定を検証・保護・文書化する**オールインワンツール**を提供し、エラーが本番環境に到達する前に検出します。

### 機能

- **スキーマ検証** — 各変数の型、必須、列挙、範囲、正規表現パターンを定義
- **セキュリティスキャン** — 誤ってコミットされたシークレットの検出（AWS キー、GitHub トークン、秘密鍵など）
- **自動ドキュメント生成** — スキーマから `.env.example` と Markdown ドキュメントを生成
- **環境比較** — dev/staging/prod の `.env` ファイルの差分を検出
- **CI/CD 対応** — 終了コードと GitHub Action 統合による自動チェック
- **ゼロ依存** — 外部パッケージ不要のピュア Node.js 実装
- **マルチフォーマット対応** — `.env`、`.env.local`、`.env.production` などに対応

### クイックスタート

```bash
# インストール
npm install -g envguard

# 設定ファイルの作成
envguard init

# 環境変数の検証
envguard validate

# セキュリティスキャン
envguard check

# ドキュメント生成
envguard docs

# 環境の比較
envguard diff .env.development .env.production
```

### 設定

プロジェクトルートに `envguard.config.js` を作成：

```js
module.exports = {
  schema: {
    NODE_ENV: {
      required: true,
      type: 'string',
      enum: ['development', 'staging', 'production', 'test'],
      description: 'アプリケーション環境',
    },
    PORT: {
      required: false,
      type: 'port',
      default: '3000',
      description: 'サーバーポート',
    },
    DATABASE_URL: {
      required: true,
      type: 'url',
      description: 'データベース接続文字列',
    },
    JWT_SECRET: {
      required: true,
      type: 'string',
      description: 'JWT 署名用シークレットキー',
    },
  },
  security: {
    minSeverity: 'medium',
    ignoreKeys: [],
  },
};
```

### サポート型

| 型 | 説明 | 例 |
|----|------|-----|
| `string` | 任意の文字列 | `任意のテキスト` |
| `number` | 数値（min/max 対応） | `42` |
| `boolean` | true/false、1/0、yes/no | `true` |
| `url` | 有効な URL | `https://example.com` |
| `email` | 有効なメールアドレス | `user@example.com` |
| `port` | 有効なポート番号 (0-65535) | `3000` |
| `json` | 有効な JSON 文字列 | `'{"key":"value"}'` |
| `regex` | 有効な正規表現パターン | `^\\d+$` |

### セキュリティスキャン

EnvGuard は以下のシークレットタイプを検出します：

- AWS アクセスキー・シークレットキー
- GitHub / GitLab トークン
- Slack トークン
- Stripe ライブキー
- 秘密鍵（RSA、EC、DSA）
- JWT シークレット
- パスワード埋め込みデータベース URL
- 汎用 API キー、パスワード、シークレット

### CI/CD 統合

**GitHub Actions：**

```yaml
- name: 環境設定の検証
  run: npx envguard validate

- name: セキュリティチェック
  run: npx envguard check
```

検証エラーや重大なセキュリティ問題が見つかった場合、コマンドは終了コード `1` で終了し、ビルドを失敗させます。

### プログラマティック API

```js
const { validateEnv, scanForSecrets, generateEnvExample } = require('envguard');

const schema = { PORT: { required: true, type: 'port' } };
const result = validateEnv(process.env, schema);
// { valid: true, errors: [], warnings: [], checked: 1 }

const secrets = scanForSecrets(process.env);
// { findings: [], hasCritical: false, total: 0 }

const example = generateEnvExample(schema);
// "# Server port\n# type: port\nPORT=\n"
```

### ライセンス

[MIT](LICENSE)
