# 别再泄露密钥了：EnvGuard 如何在 .env 文件中捕获 API Key

> 每年有数以万计的 API 密钥和密码被意外推送到 GitHub。EnvGuard 是一个零依赖的 CLI 工具，能在为时已晚之前帮你捕获它们。

## 问题有多严重？

我们都经历过——赶着上线，匆忙推送代码，然后突然发现你的 `.env` 文件里包含 AWS 密钥、数据库密码和 GitHub Token，已经公开了。等你反应过来，自动化爬虫早已抓取了你的凭证。

根据 GitHub 自身的研究，**一年内有超过 170 万个密钥**在平台上泄露。轮换一个被泄露的密钥平均需要多长时间？**数小时的停机和数千美元的损失。**

## 认识 EnvGuard

**EnvGuard** 是一个集环境变量验证、安全扫描和文档生成于一体的 CLI 工具。零外部依赖——纯 Node.js 实现，没有供应链风险。

```bash
npm install -g @anhuijie/envguard
```

## 安全扫描：发现你遗漏的密钥

假设你有一个这样的 `.env` 文件：

```env
# .env
NODE_ENV=production
DATABASE_URL=postgres://admin:s3cretP@ss@db.example.com:5432/mydb
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_KEY_HERE
APP_SECRET=my-super-secret-jwt-key-2024
```

运行扫描：

```bash
envguard check
```

输出结果：

```
🔍 Scanning environment variables for secrets...

🔴 CRITICAL: AWS Access Key detected in "AWS_ACCESS_KEY_ID"
🔴 CRITICAL: GitHub Token detected in "GITHUB_TOKEN"
🔴 CRITICAL: Stripe Key detected in "STRIPE_SECRET_KEY"
🔴 CRITICAL: Database URL with Password detected in "DATABASE_URL"
🟠 HIGH: JWT Secret detected in "APP_SECRET"

📊 Summary: 5 findings (4 critical, 1 high)
```

### 能检测哪些密钥？

| 密钥类型 | 严重级别 | 匹配规则 |
|---------|---------|---------|
| AWS 访问密钥 | 严重 | `AKIA` 前缀 + 16 位字母数字 |
| AWS 密钥 | 严重 | aws + secret/key 上下文 |
| GitHub Token | 严重 | `ghp_` / `ghs_` 前缀 |
| GitLab Token | 严重 | `glpat-` 前缀 |
| Slack Token | 严重 | `xoxb-` / `xoxp-` 前缀 |
| Stripe 线上密钥 | 严重 | `sk_live_` 前缀 |
| 私钥 | 严重 | `-----BEGIN PRIVATE KEY-----` |
| JWT 密钥 | 高 | jwt + secret/key 上下文 |
| 含密码的数据库连接串 | 高 | 内嵌凭证的连接字符串 |
| 通用 API Key / 密码 / 密钥 | 高/中 | 常见键名模式 |

## 不止扫描：全方位环境安全

安全扫描只是其中一环。EnvGuard 还提供：

### Schema 验证

定义环境变量应该长什么样：

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

在应用在生产环境崩溃之前，捕获缺失的必填变量、类型错误、无效端口等问题。

### 自动文档生成

```bash
envguard docs
```

从 Schema 自动生成 `.env.example` 和 `ENV.md`，让团队始终清楚需要哪些变量。

### 环境对比

```bash
envguard diff .env.development .env.production
```

比较不同环境的 `.env` 文件差异，在配置漂移引发问题之前发现它。

## CI/CD 集成

将 EnvGuard 加入你的 GitHub Actions 流水线：

```yaml
name: 环境安全检查
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
      - name: 验证环境配置
        run: envguard validate
      - name: 安全扫描
        run: envguard check
```

验证失败或发现严重安全问题时，命令以退出码 `1` 退出，使构建失败，阻止密钥进入生产环境。

### 编程式 API

在你自己的工具中使用 EnvGuard：

```js
const { validateEnv, scanForSecrets, generateEnvExample } = require('@anhuijie/envguard');

// 验证
const result = validateEnv(process.env, schema);
if (!result.valid) {
  console.error('配置无效:', result.errors);
}

// 扫描
const secrets = scanForSecrets(process.env);
if (secrets.hasCritical) {
  throw new Error('发现严重密钥泄露！');
}

// 生成文档
const example = generateEnvExample(schema);
```

## 为什么选择 EnvGuard？

| 功能 | EnvGuard | dotenv | convict | env-schema |
|------|----------|--------|---------|------------|
| Schema 验证 | ✅ | ❌ | ✅ | ✅ |
| 密钥扫描 | ✅ | ❌ | ❌ | ❌ |
| 自动文档 | ✅ | ❌ | ❌ | ❌ |
| 环境对比 | ✅ | ❌ | ❌ | ❌ |
| 零依赖 | ✅ | ❌ | ❌ | ❌ |
| CLI + API | ✅ | ❌ | ❌ | ❌ |

## 快速开始

```bash
# 全局安装
npm install -g @anhuijie/envguard

# 免安装直接使用
npx @anhuijie/envguard init
npx @anhuijie/envguard validate
npx @anhuijie/envguard check
```

**相关链接：**
- GitHub: https://github.com/AnhuiJie/envguard
- npm: https://www.npmjs.com/package/@anhuijie/envguard
- 许可证: MIT

---

*觉得有用？在 [GitHub](https://github.com/AnhuiJie/envguard) 上给个 Star 吧——这能帮助更多人发现它！*
