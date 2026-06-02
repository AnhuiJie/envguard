# EnvGuard Roadmap — 迭代计划

## 版本规划总览

| 版本 | 主题 | 预计周期 |
|------|------|----------|
| v1.0 | 核心功能 | 已完成 |
| v1.1 | 多语言 CLI 支持 | 1-2 个月 |
| v1.2 | 插件系统 | 2-3 个月 |
| v1.3 | IDE 集成 | 1-2 个月 |
| v2.0 | 云平台 & 团队协作 | 3-4 个月 |

---

## v1.1 — 多语言 CLI 支持

**目标**：支持 Python、Go、Rust 项目，不仅限于 Node.js

### 新增功能

- [ ] **Python CLI** (`pip install envguard`)
  - 使用 Python 重写 CLI 入口，复用核心验证逻辑
  - 支持 `pyproject.toml` / `setup.py` 读取配置
  - 支持 `.env` / `.ini` / `yaml` 配置格式

- [ ] **Go CLI** (`go install github.com/AnhuiJie/envguard/cmd/envguard@latest`)
  - 单二进制分发，无运行时依赖
  - 适合 CI/CD 环境和容器化部署

- [ ] **Rust CLI** (`cargo install envguard`)
  - 高性能版本，适合大型 monorepo

- [ ] **配置格式扩展**
  - YAML Schema 支持 (`envguard.config.yaml`)
  - JSON Schema 支持 (`envguard.config.json`)
  - TOML Schema 支持 (`envguard.config.toml`)

### 技术方案

```
envguard/
├── core/           # 语言无关的验证规则（JSON Schema 定义）
├── cli-node/       # Node.js CLI
├── cli-python/     # Python CLI
├── cli-go/         # Go CLI
└── cli-rust/       # Rust CLI
```

---

## v1.2 — 插件系统

**目标**：允许社区扩展验证规则、安全检测模式、输出格式

### 新增功能

- [ ] **自定义验证器插件**
  ```js
  // envguard.config.js
  module.exports = {
    plugins: [
      'envguard-plugin-custom-types',  // npm 包
      './local-plugin.js',              // 本地文件
    ],
    schema: {
      CUSTOM_ID: {
        type: 'custom-uuid',  // 由插件提供
        required: true,
      },
    },
  };
  ```

- [ ] **安全检测插件**
  - 支持自定义敏感信息检测规则
  - 企业内部密钥格式支持（如 `COMPANY_KEY_*`）

- [ ] **输出格式插件**
  - JSON 输出（便于 CI 解析）
  - SARIF 输出（GitHub Security 集成）
  - HTML 报告

- [ ] **Hook 系统**
  - `preValidate` / `postValidate`
  - `preScan` / `postScan`
  - `onError` / `onWarning`

### 插件 API 示例

```js
// envguard-plugin-example/index.js
module.exports = {
  name: 'envguard-plugin-example',
  version: '1.0.0',

  // 注册自定义类型
  types: {
    'custom-uuid': (value) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(value)
        ? { valid: true }
        : { valid: false, error: 'Not a valid UUID v4' };
    },
  },

  // 注册安全检测规则
  securityPatterns: [
    {
      name: 'Company API Key',
      pattern: /COMPANY_KEY_[A-Za-z0-9]{32}/,
      severity: 'critical',
    },
  ],

  // Hook
  hooks: {
    postValidate: (results) => {
      // 自定义后处理
    },
  },
};
```

---

## v1.3 — IDE 集成

**目标**：在开发环境中实时验证和提示

### 新增功能

- [ ] **VS Code 扩展**
  - `.env` 文件语法高亮
  - 实时 Schema 验证（红色波浪线提示错误）
  - 悬停显示变量描述和类型
  - 自动补全（基于 Schema）
  - 敏感信息高亮警告

- [ ] **JetBrains 插件**
  - 支持 WebStorm / IntelliJ / PyCharm
  - 与 VS Code 扩展功能对等

- [ ] **Language Server Protocol (LSP)**
  - 统一的 IDE 支持后端
  - 便于社区移植到其他编辑器（Vim、Emacs 等）

### VS Code 扩展功能预览

```
.env 文件：
  DATABASE_URL=postgres://localhost:5432/db  ✓
  PORT=abc                                    ✗ Expected type: port
  JWT_SECRET=secret123                        ⚠ Potential sensitive value
```

---

## v2.0 — 云平台 & 团队协作

**目标**：为企业团队提供集中式配置管理

### 新增功能

- [ ] **EnvGuard Cloud（可选自部署）**
  - 团队共享 Schema 定义
  - 多环境配置集中管理
  - 配置变更审计日志
  - RBAC 权限控制

- [ ] **加密存储**
  - 敏感值加密存储（AES-256-GCM）
  - 运行时解密注入环境变量
  - 密钥轮换支持

- [ ] **CI/CD 深度集成**
  - GitHub App（自动 PR 检查）
  - GitLab CI 集成
  - Jenkins 插件
  - CircleCI Orb

- [ ] **团队协作功能**
  - Schema 变更审批流程
  - 配置差异可视化
  - Slack / Discord 通知集成

### 架构预览

```
┌─────────────────────────────────────────────────────┐
│                   EnvGuard Cloud                     │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐  │
│  │ Schema  │  │ Config  │  │     Audit Log       │  │
│  │ Storage │  │ Vault   │  │  (who changed what) │  │
│  └─────────┘  └─────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │              REST API + WebSocket             │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │ CLI     │          │ CI/CD   │          │ IDE     │
    │ (pull)  │          │ (sync)  │          │ (realtime)│
    └─────────┘          └─────────┘          └─────────┘
```

---

## 长期愿景（12+ 个月）

- [ ] **AI 辅助配置**
  - 根据项目依赖自动推断所需环境变量
  - 智能推荐默认值和最佳实践
  - 自动检测配置漂移风险

- [ ] **合规性检查**
  - SOC 2、GDPR、HIPAA 配置合规规则
  - 自动生成合规报告

- [ ] **多云集成**
  - AWS Secrets Manager 同步
  - Azure Key Vault 同步
  - GCP Secret Manager 同步
  - HashiCorp Vault 同步

---

## 贡献指南

欢迎社区贡献！优先级高的 Good First Issues：

1. 添加更多内置类型验证器（如 `date`、`color`、`semver`）
2. 扩展安全检测模式（更多云服务商密钥格式）
3. 编写单元测试和集成测试
4. 翻译文档到更多语言
5. 编写使用案例和教程

---

## 版本发布节奏

- **Patch 版本** (v1.0.x)：Bug 修复、小改进，随时发布
- **Minor 版本** (v1.x.0)：新功能、向后兼容，每月 1 次
- **Major 版本** (vX.0.0)：破坏性变更，充分预告后发布
