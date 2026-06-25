# BlackBox Court 项目说明与 Demo 录制脚本

这份文档用于提交前自检、录制演示视频，以及帮助评委或其他开发者快速理解项目。

## 1. 这个项目是什么

BlackBox Court 是一个面向交易 Agent 的下单前风控与审计网关，赛道定位是 Bitget AI Hackathon S1 的 Trading Infra。

它解决的问题是：交易 Agent 可以生成交易意图，但在真正路由到交易执行器、paper executor 或交易所适配器之前，通常缺少一个统一、可解释、可复查的控制层。BlackBox Court 把交易意图、策略边界、Bitget 行情证据和可选只读账户上下文合并成一次预交易评估，返回明确裁决：

- `allow`：允许进入模拟执行或已批准执行器。
- `reduce`：只允许缩小后的仓位。
- `watch`：先观察，不应发单。
- `block`：拦截，不应执行。

项目默认只做 paper-only 评估和审计，不会发送真实订单。

## 2. 已完成功能

- 预交易评估 API：`POST /api/court/evaluate`。
- 策略门禁：方向、止损/失效条件、风险预算、名义金额、波动率、趋势质量。
- Bitget 公开行情：价格、K 线、资金费率、持仓量、买卖价差等，失败时明确标注 fallback。
- 可选 Bitget 只读账户上下文：配置只读 API 后，可把可用 USDT 纳入风控判断。
- 下单前指挥台：展示交易意图、行情证据、策略裁决、已拦截敞口、审计 ID。
- 模拟持仓证据：方向、入场价、标记价、止损、目标、数量、手续费、滑点、快照 PnL。
- 审计记录与回放：可打开每条记录，并下载 JSON 审计包。
- 风控成效图表：干预率、已拦截敞口、裁决分布、常见风险原因。
- 开发者接入页：展示 curl 示例、接口说明、环境变量说明。
- 中英文界面与中文文档。
- 公开可核查样本：`examples/pre-trade-evaluation.sample.json`。

## 3. Demo 视频建议结构

建议控制在 2 分钟到 3 分钟。录制时使用中文界面：

```text
http://127.0.0.1:3000/?lang=zh
```

如果录线上版本，则使用：

```text
https://blackbox-court.vercel.app/?lang=zh
```

### 0:00 - 0:15 项目开场

操作：

1. 打开首页。
2. 停留在顶部下单前指挥台。

字幕/口播：

> BlackBox Court 是给交易 Agent 使用的下单前风控网关。Agent 在执行交易之前，先把交易意图发给这个系统，系统会结合策略规则和 Bitget 行情证据，返回放行、减仓、观察或拦截，并生成可复查的审计记录。

### 0:15 - 0:40 展示正常示例

操作：

1. 点击顶部 `运行放行示例`。
2. 等待右侧出现裁决结果。
3. 展示裁决、行情证据、模拟持仓证据。

字幕/口播：

> 这里演示的是一条规范交易请求：有方向、有金额、有最大亏损、有止损。系统会读取行情信号，检查策略门禁，并给出允许或减仓的裁决。注意这里是 paper-only 模拟，不会真实下单。

### 0:40 - 1:10 展示拦截示例

操作：

1. 点击顶部 `运行拦截示例`。
2. 展示 `拦截原因` 或失败的策略检查。
3. 强调没有止损、金额过大、风险不满足时不会进入执行。

字幕/口播：

> 再看一个故意不合规的请求：强行做多、金额较大、没有止损。BlackBox Court 会把这类请求拦截下来，并说明具体原因。这里的重点不是预测行情，而是证明 Agent 的交易动作能被规则化约束和审计。

### 1:10 - 1:35 展示风控成效图表

操作：

1. 点击 `展开成效图表`。
2. 展示干预率、已拦截敞口、裁决分布、常见风险原因。

字幕/口播：

> 这里是安全成效统计。系统记录了每次评估的裁决、风险分和拦截金额，评委可以看到这个网关累计拦下了多少风险敞口，以及常见风险原因是什么。

### 1:35 - 2:05 展示审计记录

操作：

1. 在左侧 `审计记录` 中打开一条记录。
2. 展示完整报告。
3. 点击或指向 `下载审计包`。

字幕/口播：

> 每次评估都会留下审计 ID。打开记录后，可以复查原始交易意图、行情快照、策略门禁、裁决结果和模拟持仓。审计包可以下载为 JSON，方便评委核查。

### 2:05 - 2:35 展示开发者接入

操作：

1. 打开 `开发者` 页面。
2. 展示 `POST /api/court/evaluate` 的 curl。
3. 展示环境变量说明。

字幕/口播：

> 对交易 Agent 来说，接入方式很简单：在发单前调用一次 evaluate API。如果结果是 allow 或 reduce，再进入 paper executor 或已批准执行器；如果是 watch 或 block，就不发单。

### 2:35 - 2:55 收尾

操作：

1. 回到首页或停留在开发者页。
2. 如果已经有 GetAgent 或外部 paper-log 链接，可以打开该公开链接。

字幕/口播：

> 这个项目的核心价值是让交易 Agent 从“能生成交易想法”变成“执行前可控、执行后可审计”。它不夸大收益，也不伪装成实盘系统，而是专注于交易 Infra 中最需要被证明的风控与证据链。

## 4. 推荐录制路径

最干净的录制顺序：

1. 首页：展示下单前指挥台。
2. 点击 `运行放行示例`。
3. 点击 `运行拦截示例`。
4. 展开风控成效图表。
5. 打开一条审计记录。
6. 下载或展示审计包入口。
7. 打开开发者页展示 API 接入。

不建议录制时频繁切换主题、语言或乱点表单。左侧表单适合展示“可自定义”，但视频主线应以顶部两个示例按钮为主。

## 5. 本地、GitHub、Vercel 的区别

### 本地运行

本地适合开发、录屏和调试。

```bash
npm install
cp .env.example .env
npm run dev
```

或使用生产预览：

```bash
npm run build
npm run start -- -p 3000
```

本地特点：

- 可以读取 `.env`。
- 可以配置 Bitget 只读 API Key。
- 如果有磁盘权限，审计记录可写入 `data/blackbox-records.json`。
- 适合录制稳定 demo。

### GitHub 仓库

GitHub 是源码和可核查材料入口。

评委会重点看：

- README 是否能说明项目。
- `docs/VERIFICATION.md` 是否能复现。
- `examples/pre-trade-evaluation.sample.json` 是否有样本输入/输出。
- `.env.example` 是否说明需要哪些配置。

GitHub 里不能出现：

- Bitget API Key。
- LLM API Key。
- 真实账户余额。
- 未脱敏交易记录。
- 私人聊天记录或未处理数据。

### Vercel 部署

Vercel 适合提交在线 Demo。

当前线上地址：

```text
https://blackbox-court.vercel.app
```

Vercel 特点：

- 评委无需登录即可打开。
- 环境变量需要在 Vercel Project Settings 里配置。
- Serverless 文件系统不适合长期持久保存审计记录。
- 当前项目已做降级处理：即使无法写本地文件，评估 API 仍能返回结果。
- 如果要长期保存线上审计记录，建议后续接 Supabase、Neon 或其他数据库。

## 6. 环境变量说明

`.env.example` 中的关键项：

```env
BITGET_API_KEY=
BITGET_SECRET_KEY=
BITGET_PASSPHRASE=
BITGET_READ_ONLY=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAPER_LOG_URL=
```

说明：

- Bitget Key 是可选，只应使用只读权限。
- 没有 Bitget Key 时，系统仍可使用公开行情运行。
- `NEXT_PUBLIC_APP_URL` 本地填 `http://localhost:3000`，Vercel 填线上域名。
- `PAPER_LOG_URL` 只有在你有公开 GetAgent Studio 或外部 paper-log 链接后再填。
- 不要把 `.env` 提交到 GitHub。

## 7. 提交材料建议

Trading Infra 赛道建议提交：

- GitHub 仓库：
  `https://github.com/mucusblock/blackbox-court`
- 在线 Demo：
  `https://blackbox-court.vercel.app`
- 可核查使用记录：
  `https://github.com/mucusblock/blackbox-court/blob/main/docs/VERIFICATION.md`
- 样本输入/输出：
  `https://github.com/mucusblock/blackbox-court/blob/main/examples/pre-trade-evaluation.sample.json`
- 演示视频：
  公开推文、YouTube 或其他无需登录的视频链接。

如果 GetAgent Studio 仍因为 `ACCESS-KEY is required before authoring` 失败，可以先不把它作为主提交材料。Trading Infra 的 GitHub、Demo、可核查样本更重要。

## 8. 录制时不要说错的点

不要说：

- “这是实盘交易系统。”
- “已经真实下单。”
- “这个 paperExecution 是 Bitget demo order。”
- “已经证明盈利。”
- “LLM 自动决定并执行交易。”

建议说：

- “这是下单前风控网关。”
- “系统默认 paper-only，不真实发单。”
- “核心是执行前约束和执行后审计。”
- “Bitget 行情数据用于生成市场证据。”
- “allow/reduce/watch/block 是确定性规则裁决。”

## 9. 评委可能关心的问题

### 这个项目为什么属于 Trading Infra？

因为它不是单一交易策略，而是给交易 Agent 使用的执行前控制层。它解决的是 Agent 发单前缺少统一风控、证据链和审计回放的问题。

### 如果别人拿到项目，能不能跑？

可以。无 Bitget 私钥时也能基于公开行情和 fallback 机制运行；有只读 Bitget API 时，可以加入账户可用余额作为额外风控门禁。

### 为什么不是直接接交易所下单？

为了安全边界清晰。Hackathon Demo 中最重要的是证明风控网关可靠、可解释、可复现，而不是让演示系统直接持有下单权限。

### 为什么需要外部 paper-log？

应用内 `paperExecution` 是快照估算，用来解释这次裁决可能对应的模拟仓位，不是外部平台可验证的订单。如果赛方强制要求 paper-trading 记录，可以额外提交 GetAgent Studio 或其他公开 paper-log。

## 10. 当前还可以后续增强的地方

- 接 Supabase 或 Neon，实现线上审计记录持久化。
- 获取 GetAgent ACCESS-KEY 后，补一个 `.py` Playbook adapter。
- 增加更多回测或批量样本。
- 给开发者页增加更明确的“复制 curl 后如何接入 Bot”的流程图。
- 增加更详细的中文 README 首屏说明。

## 11. 一句话总结

BlackBox Court 的核心不是“预测哪笔交易赚钱”，而是让交易 Agent 在执行前被风控约束，在执行后可以被审计复盘。
