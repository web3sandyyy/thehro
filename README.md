# Thehro (ठहरो)

Thehro means “pause” or “wait” in Hindi: take a moment to check whether a higher APY is worth the cost of moving.

**Is chasing that APY worth it?** Thehro compares the dollars you would earn by keeping a USDC position against moving it after fees, and shows the break-even day.

Built for **Arkiv — Build on Arkiv (from scratch)** at ETHGlobal Mumbai 2026.

## Run

Requires Node.js 22.10+ and npm.

```sh
npm ci
npm run dev
npm test
npm run build
```

This version ships the calculator with three clearly labeled illustrative scenarios. Live markets and Arkiv receipts are coming next.

## Math

For principal `P`, one-time switching cost `C`, current effective annual yield `a`, target yield `b`, and days `d`:

```text
Stay ending balance = P × (1+a)^(d/365)
Move ending balance = (P−C) × (1+b)^(d/365)
Net advantage = Move − Stay
Break-even days = 365 × ln(P/(P−C)) / (ln(1+b) − ln(1+a))
```

Break-even exists for positive costs only when `b > a`. Rates are held constant, USDC is assumed to stay at $1, and taxes, lockups and protocol risk are not modeled.

Licensed MIT.
