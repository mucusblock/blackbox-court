# Bitget Agent Hub Integration

BlackBox Court documents Bitget Agent Hub as an **optional** path for coding agents. The evaluate API does not require MCP at runtime.

## Verified package

```bash
npx -y bitget-mcp-server --help
```

Common modules: `spot`, `futures`, `account`.

## Recommended mode

Read-only:

```bash
npx -y bitget-mcp-server --read-only --modules spot,futures,account
```

## Environment (server-side only)

```env
BITGET_API_KEY=
BITGET_SECRET_KEY=
BITGET_PASSPHRASE=
BITGET_READ_ONLY=true
```

When these keys work, `POST /api/court/evaluate` also probes account available balance via Bitget private REST.

## Relationship to BlackBox Court

| Layer | Role |
|-------|------|
| BlackBox Court `/evaluate` | Pre-trade policy gate + audit |
| Agent Hub MCP | Optional tools for your IDE agent |
| GetAgent Studio | Hackathon paper-trading log (see `USER_CHECKLIST.md`) |

Do not commit `.env` or API keys to GitHub.
