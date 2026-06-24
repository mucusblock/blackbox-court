# BlackBox Court Integration

BlackBox Court is a pre-trade control service. Call it before an agent sends any order to an exchange or paper executor.

## Evaluate

`POST /api/court/evaluate`

```json
{
  "prompt": "Long BTC 900 USDT. Max loss 1%. Stop below swing low.",
  "symbol": "BTCUSDT",
  "timeframe": "1H",
  "notional": 900,
  "maxRiskPct": 1,
  "policyPack": "balanced",
  "locale": "en"
}
```

Use the response as an execution contract:

- `allow`: route the requested notional to a paper executor or approved exchange adapter.
- `reduce`: route only `allowedNotional`.
- `watch` or `block`: do not submit an order.

The response also includes `policyGates`, `marketSignals`, `accountContext` when read-only credentials are available, `paperExecution`, and an audit `id`.

## Paper position snapshot

When the verdict is `allow` or `reduce`, `paperExecution` includes a simulated side, entry, snapshot mark, policy stop, policy target, quantity, snapshot PnL, fee, and slippage. It is an auditable estimate produced from the evaluation snapshot, not a live order or an order monitor.

## Read-only Bitget context

Set server-side environment variables:

```env
BITGET_API_KEY=
BITGET_SECRET_KEY=
BITGET_PASSPHRASE=
BITGET_READ_ONLY=true
```

If the probe succeeds, available USDT is added to policy gates. The browser never receives credentials.

## External paper-trade proof

For a public GetAgent Studio run or another paper-log provider, set:

```env
PAPER_LOG_URL=https://public-proof-link
```

This does not alter the gate. It provides a visible evidence link on `/developers` so reviewers can separately inspect a real paper-trading record.

## Persistence

Audit records are stored in `data/blackbox-records.json`. A public deployment needs persistent storage; ephemeral serverless filesystems are unsuitable for a replayable demo.
