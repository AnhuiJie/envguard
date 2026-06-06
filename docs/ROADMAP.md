# EnvGuard 差异化迭代计划

> 基于 Varlock 竞品分析，聚焦 Varlock **不做**的方向，做出差异化。
> Varlock 强项：密钥管理器集成（1Password/Infisical 等）、AI-safe .env.schema DSL、运行时注入。
> EnvGuard 差异化方向：**配置迁移**、**健康评分**、**框架模板** — 更贴近开发者日常痛点。

---

## 版本规划总览

| 版本 | 主题 | 核心差异化 | 预计周期 | 状态 |
|------|------|-----------|----------|------|
| v1.3 | 框架模板 | `envguard template` — 一键生成常见框架 schema | 1-2 周 | ✅ 已完成 |
| v1.4 | 配置迁移 | `envguard migrate` — 废弃检测 + 自动迁移 | 2-3 周 | 🔜 下一个 |
| v1.5 | 健康评分 | `envguard health` — 配置健康度仪表盘 | 2-3 周 | 待开始 |
| v1.6 | Git 深度集成 | pre-commit hook + CI JSON 输出 | 1-2 周 | 待开始 |
| v2.0 | 配置加密 | `envguard encrypt/decrypt` — 本地加密方案 | 3-4 周 | 待开始 |

---

## v1.3 — 框架模板（降低上手门槛）

**目标**：新项目不需要从零写 schema，选模板一键生成。

### 为什么先做这个？

- Varlock 用自定义 `.env.schema` DSL，学习成本高
- EnvGuard 用 JS config，但 `envguard init` 目前只生成通用模板
- 框架模板让用户 30 秒上手，形成"开箱即用"的差异化印象

### 新增功能

- [ ] **`envguard template` 命令**
  - 列出所有可用模板：`envguard template list`
  - 应用模板：`envguard template apply nextjs`
  - 合并到现有配置：`envguard template apply nextjs --merge`

- [ ] **内置框架模板**（首批 6 个）
  - `nextjs` — Next.js 全栈项目
  - `express` — Express API 服务
  - `django` — Django Python 项目
  - `rails` — Ruby on Rails
  - `docker-compose` — Docker Compose 编排
  - `serverless` — Serverless Framework

- [ ] **模板格式**
  ```js
  // templates/nextjs.js
  module.exports = {
    name: 'nextjs',
    description: 'Next.js full-stack application',
    schema: {
      NEXT_PUBLIC_APP_URL: {
        required: true,
        type: 'url',
        description: 'Public application URL',
      },
      NEXT_PUBLIC_API_URL: {
        required: true,
        type: 'url',
        description: 'API endpoint URL',
      },
      DATABASE_URL: {
        required: true,
        type: 'url',
        description: 'PostgreSQL connection string',
      },
      NEXTAUTH_SECRET: {
        required: true,
        type: 'string',
        description: 'NextAuth.js secret',
      },
      NEXTAUTH_URL: {
        required: true,
        type: 'url',
        description: 'NextAuth.js callback URL',
      },
    },
    security: {
      minSeverity: 'medium',
    },
  };
  ```

### 文件结构

```
src/
├── commands/
│   └── template.js      # 新增：template 命令
├── templates/            # 新增：模板目录
│   ├── nextjs.js
│   ├── express.js
│   ├── django.js
│   ├── rails.js
│   ├── docker-compose.js
│   └── serverless.js
```

### 版本号更新

- package.json: `1.2.0` → `1.3.0`
- CLI VERSION 常量同步更新

---

## v1.4 — 配置迁移（解决重构痛点）

**目标**：项目重构时 .env key 经常要改名，EnvGuard 自动处理迁移。

### 为什么做这个？

- 这是真实痛点：项目重构时 `DB_HOST` → `DATABASE_URL`，`API_KEY` → `OPENAI_API_KEY`
- 没有任何竞品做这个功能
- 和 Varlock 的"密钥管理器"路线完全不同，是开发者日常刚需

### 新增功能

- [ ] **`envguard migrate` 命令**
  - 检测废弃变量：`envguard migrate --check`
  - 执行迁移：`envguard migrate`
  - 生成迁移脚本：`envguard migrate --dry-run`

- [ ] **Schema 迁移声明**
  ```js
  // envguard.config.js
  module.exports = {
    schema: {
      DATABASE_URL: {
        required: true,
        type: 'url',
        description: 'Database connection string',
        // 迁移声明：旧 key → 新 key
        replaces: {
          oldKey: 'DB_HOST',
          strategy: 'transform',  // 'copy' | 'transform' | 'merge'
          transform: (oldValue) => `postgres://${oldValue}:5432/mydb`,
        },
      },
    },
    // 废弃变量声明
    deprecated: {
      DB_HOST: {
        since: '1.4.0',
        replacement: 'DATABASE_URL',
        removeAfter: '2025-09-01',  // 过期后 migrate 会自动删除
      },
      REDIS_HOST: {
        since: '1.4.0',
        replacement: 'REDIS_URL',
      },
    },
  };
  ```

- [ ] **迁移执行逻辑**
  - 读取 .env 文件
  - 检查废弃 key 是否仍存在
  - 按 `replaces` 声明转换值
  - 写入新 key，标记旧 key 为注释
  - 生成迁移报告

- [ ] **迁移报告输出**
  ```
  EnvGuard — Migration Report
  ════════════════════════════

  ✓ Migrated: DB_HOST → DATABASE_URL
    Value: "localhost" → "postgres://localhost:5432/mydb"

  ⚠ Deprecated (still present): REDIS_HOST
    → Replace with: REDIS_URL

  ✗ Expired: OLD_API_KEY (removal date passed: 2025-06-01)
    → Will be removed on next migrate
  ```

### 文件结构

```
src/
├── commands/
│   └── migrate.js       # 新增：migrate 命令
├── core/
│   └── migrate.js       # 新增：迁移核心逻辑
```

---

## v1.5 — 健康评分（配置仪表盘）

**目标**：给 .env 配置打分，从"工具"变成"仪表盘"。

### 为什么做这个？

- Varlock 是"扫描 → 报告问题"模式，没有全局视角
- 健康评分让用户一眼看出配置状态，差异化明显
- 适合写进 CI：健康分低于阈值就告警

### 新增功能

- [ ] **`envguard health` 命令**
  - 综合评分：0-100
  - 分维度评分 + 可视化
  - CI 模式：`envguard health --ci --min-score 70`

- [ ] **评分维度**
  | 维度 | 权重 | 说明 |
  |------|------|------|
  | 完整性 | 30% | 必填变量是否都设置了 |
  | 安全性 | 30% | 是否有泄露风险、弱密钥 |
  | 一致性 | 20% | 多环境配置是否对齐 |
  | 新鲜度 | 10% | 是否有废弃变量、过期配置 |
  | 规范性 | 10% | 是否有类型错误、命名不规范 |

- [ ] **可视化输出**
  ```
  EnvGuard — Health Check
  ════════════════════════

  Overall Score: 72/100 ⚠

  ┌─────────────────────────────────────┐
  │ Completeness  ████████░░  80/100    │
  │ Security      ██████░░░░  60/100    │
  │ Consistency   ███████░░░  70/100    │
  │ Freshness     █████████░  90/100    │
  │ Standards     ██████░░░░  60/100    │
  └─────────────────────────────────────┘

  Issues:
    ✗ Missing: DATABASE_URL (required)
    ⚠ Weak: JWT_SECRET is only 8 characters
    ⚠ Drift: .env.production has 3 vars not in .env
    ⚠ Deprecated: OLD_API_KEY (since v1.2.0)

  Suggestions:
    → Set DATABASE_URL or add a default value
    → JWT_SECRET should be at least 32 characters
    → Run: envguard diff .env .env.production
    → Run: envguard migrate --check
  ```

- [ ] **JSON 输出**（CI 集成）
  ```bash
  envguard health --format json
  ```
  ```json
  {
    "score": 72,
    "dimensions": {
      "completeness": { "score": 80, "issues": [...] },
      "security": { "score": 60, "issues": [...] },
      "consistency": { "score": 70, "issues": [...] },
      "freshness": { "score": 90, "issues": [...] },
      "standards": { "score": 60, "issues": [...] }
    },
    "timestamp": "2025-06-05T12:00:00Z"
  }
  ```

### 文件结构

```
src/
├── commands/
│   └── health.js        # 新增：health 命令
├── core/
│   └── health.js        # 新增：健康评分核心逻辑
```

---

## v1.6 — Git 深度集成

**目标**：让 EnvGuard 无缝融入 Git 工作流。

### 新增功能

- [ ] **`envguard hook` 命令** — 安装 pre-commit hook
  ```bash
  envguard hook install    # 安装 pre-commit hook
  envguard hook uninstall  # 卸载
  ```

- [ ] **Pre-commit Hook**
  - 自动扫描暂存文件中的 .env 变更
  - 发现密钥泄露时阻止提交
  - 检查 schema 一致性

- [ ] **CI 友好输出格式**
  - `--format json` — 通用 JSON
  - `--format checkstyle` — Checkstyle XML（SonarQube 等）
  - `--format github-actions` — GitHub Actions annotation 格式

- [ ] **`envguard ci` 命令** — CI 专用模式
  - 合并 validate + check + health
  - 单次运行输出所有结果
  - 退出码反映严重程度

### 文件结构

```
src/
├── commands/
│   ├── hook.js           # 新增：hook 管理
│   └── ci.js             # 新增：CI 模式
├── core/
│   └── formatters.js     # 新增：多格式输出
├── hooks/
│   └── pre-commit.js     # 新增：pre-commit 脚本
```

---

## v2.0 — 配置加密（本地安全方案）

**目标**：不依赖外部密钥管理器，提供本地加密方案。

### 为什么做这个？

- Varlock 的密钥管理器集成是给企业用的（需要 1Password/Infisical 账号）
- 小团队和个人开发者只需要"加密 .env 存到 Git 里"这种简单方案
- 这是 Varlock **不做**的 — 它选择对接外部工具，我们选择内置

### 新增功能

- [ ] **`envguard encrypt`** — 加密 .env 中的敏感值
  ```bash
  envguard encrypt                    # 交互式加密
  envguard encrypt --key .env.key     # 指定密钥文件
  envguard encrypt --only-sensitive   # 只加密敏感值
  ```

- [ ] **`envguard decrypt`** — 解密并注入
  ```bash
  envguard decrypt                    # 解密到 .env
  envguard decrypt --run -- node app.js  # 解密并运行
  ```

- [ ] **加密方案**
  - AES-256-GCM 加密
  - 密钥来源：密钥文件 / 环境变量 / 交互输入
  - 加密后生成 `.env.encrypted`（可安全提交到 Git）
  - `.env.key` 加入 .gitignore

- [ ] **加密文件格式**
  ```
  # .env.encrypted (safe to commit)
  # Encrypted by EnvGuard v2.0.0
  # Algorithm: AES-256-GCM

  DATABASE_URL=ENC(Af3xK9...base64...)
  API_KEY=ENC(Bg7mL2...base64...)
  NODE_ENV=production
  PORT=3000
  ```

### 文件结构

```
src/
├── commands/
│   ├── encrypt.js        # 新增
│   └── decrypt.js        # 新增
├── core/
│   └── crypto.js         # 新增：加密/解密核心
```

---

## 实施原则

1. **每版只做一个主题**，做完发布，不堆积
2. **向后兼容**，新功能不影响现有命令
3. **零依赖**原则不变，加密用 Node.js 内置 `crypto` 模块
4. **每个版本配套测试**，测试覆盖新功能核心逻辑
5. **README 每版更新**，新功能同步到文档
