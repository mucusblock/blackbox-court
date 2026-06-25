# 提交前清单

这份清单按“没有演示视频也能提交”的路径整理。核心目标是让评委可以公开访问、独立理解、复现样本，并确认项目没有夸大成实盘交易系统。

## P0：主提交路径

### 1. 公开 GitHub 仓库

- [ ] 仓库为 public。
- [ ] README 能说明项目是什么、怎么运行、有哪些接口。
- [ ] `.env` 没有提交。
- [ ] 在干净环境验证 `npm install && npm run build`。

### 2. 可核查材料

- [ ] 提交 `docs/VERIFICATION.md` 链接。
- [ ] 提交 `examples/pre-trade-evaluation.sample.json` 链接。
- [ ] 确认样本是脱敏的，不包含 API Key、真实余额或私人信息。
- [ ] 明确说明 `paperExecution` 是快照估算，不是 Bitget demo order 或实盘收益。

### 3. 在线 Demo

- [ ] Vercel 页面公开可访问，无需登录。
- [ ] 首页可以运行 `运行放行示例` 和 `运行拦截示例`。
- [ ] `/developers` 页面可以看到 API 接入说明。
- [ ] 未配置 `PAPER_LOG_URL` 时，不应显示或声称已有外部 paper-trading 记录。

### 4. 提交表单

- [ ] 项目说明第一段重点讲 Trading Infra 痛点和解法。
- [ ] 第二段讲已完成功能、未实现内容、框架/API。
- [ ] 提交 GitHub 仓库链接。
- [ ] 提交可核查使用记录链接。
- [ ] 提交在线 Demo 链接。

## P1：选填增强

### 演示视频

- [ ] 如果录制，控制在 3 分钟内。
- [ ] 重点展示：放行/减仓示例、拦截示例、风控成效图表、审计记录、开发者接入。
- [ ] 如果 Demo 需要登录才能访问，才更需要用视频补充说明。

### 外部 paper-log

- [ ] 如果 GetAgent Studio 或其他平台已经能公开访问，再提交外部 paper-log。
- [ ] 记录最好包含时间、交易对、方向、价格、数量、状态或 PnL。
- [ ] 如果有公开链接，在环境变量中配置 `PAPER_LOG_URL=公开链接`。
- [ ] 重启项目，在 `/developers` 确认能看到“外部模拟交易证据”链接。

### 只读 Bitget API

- [ ] 可选配置只读 Bitget API Key。
- [ ] 确认 `/developers` 显示只读账户上下文可用。
- [ ] 不要配置真实下单权限。

## 不应声称的能力

- 本项目不会下真实订单。
- 页面内模拟持仓是评估快照，不是持续监控的真实仓位。
- 未设置 `PAPER_LOG_URL` 时，不应说已经具备可验证的外部 paper-trading record。
- 不应把风控裁决描述成收益预测。

## 当前推荐提交链接

- GitHub 仓库：`https://github.com/mucusblock/blackbox-court`
- 在线 Demo：`https://blackbox-court.vercel.app`
- 可核查使用记录：`https://github.com/mucusblock/blackbox-court/blob/main/docs/VERIFICATION.md`
- 样本输入/输出：`https://github.com/mucusblock/blackbox-court/blob/main/examples/pre-trade-evaluation.sample.json`
