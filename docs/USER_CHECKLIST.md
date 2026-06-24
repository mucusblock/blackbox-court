# 提交前清单

以下项目必须由你在线下完成；代码仓库不能替你生成真实交易或外部平台证据。

## P0：提交前必须完成

### 1. 公开 GitHub 仓库

- [ ] 创建 public GitHub repository 并推送当前项目
- [ ] 确认 `.env` 没有提交
- [ ] 在干净环境验证 `npm install && npm run build`

### 2. 可验证的模拟交易记录

官方群信息强调至少提供一条可验证的 paper trading 或 live trading 记录。BlackBox Court 的页面内 `Paper Position Evidence` 是透明的快照估算，不应冒充外部真实 paper order。

- [ ] 在 GetAgent Studio 或其他可公开验证的平台发布一条 paper-trading / Playbook 记录
- [ ] 确认公开链接不需要评委登录；若需要登录，录制 demo 视频佐证
- [ ] 记录至少包含时间、交易对、方向、价格、数量、状态或 PnL
- [ ] 在 `.env` 加入 `PAPER_LOG_URL=公开链接`
- [ ] 重启项目，在 `/developers` 确认能看到“外部模拟交易证据”链接

### 3. 录制视频与提交链接

- [ ] 录制不超过 3 分钟的视频，按 `docs/SUBMISSION.md` 的顺序展示
- [ ] 提交 GitHub、demo 视频、公开 paper-log 链接
- [ ] 发布 X 帖子并带 `#BitgetHackathon` 与 `@Bitget_AI`（按主办方最终规则核对）

## P1：可信度加分

- [ ] 配置只读 Bitget API Key，确认 `/developers` 显示 `Active in evaluate`
- [ ] 部署到带持久盘的环境，并设置 `NEXT_PUBLIC_APP_URL`
- [ ] 提交表单上的 Bitget UID 与 GetAgent/API Key 所属账号保持一致

## 不应声称的能力

- 本项目不会下真实订单
- 页面内模拟持仓是评估快照，不是持续监控的实盘仓位
- 未设置 `PAPER_LOG_URL` 时，不应说已经具备可验证的外部 paper-trading record
