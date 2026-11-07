# Thehro — submission notes

**Partner:** Arkiv only.
**Track:** Build on Arkiv (from scratch).

## Short description

Thehro asks whether chasing a higher DeFi APY actually pays. It compares projected USDC earnings after switching fees, finds the break-even day, stress-tests reward dependence, and saves the precise assumptions as short-lived, wallet-owned Arkiv receipts.

## Two-to-three-minute demo

1. **0:00–0:25:** Show the labeled example: $5,000, current APY 4.2%, target APY 7.8%, $18 switching costs, 30 days. Explain why a higher APY can still leave you with less money.
2. **0:25–0:45:** Change to 90 days; show the conclusion and chart change. Toggle Exclude rewards and show that headline APY depends partly on incentives.
3. **0:45–1:10:** Open Markets, load DeFiLlama data, filter a network, select a real USDC pool. Point out source/retrieval time and the user-entered fee estimate.
4. **1:10–1:45:** Save a 2-minute receipt using the funded Rabdi wallet. Show the wallet confirmation and real explorer transaction link. My receipts reads the saved entity from Arkiv.
5. **1:45–2:15:** Reopen the receipt, export its JSON, and run the CLI query using your writer address. Explain ownership and native block expiry.
6. **At expiry:** Refresh and show the receipt no longer returned. If recording time is limited, explain and demonstrate expiration separately rather than pretending it has happened.

## Required finishing steps

- Connect and fund the wallet; perform real create/read/expiry and cancellation tests.
- Add the writer address, transaction hash, entity key and a real query result to README.
- Publish this source to a **public** repository under the included MIT license. Keep real incremental history; do not backdate commits or claim earlier work.
- Provide a judge-accessible live URL. The current Sites preview is private to its owner; localhost or a private preview is not a public submission link.
- Record the real demo; do not pass illustrative example values off as live markets or saved transactions.
- Append actual integration experience to `/arkiv/friction.md`.
- Include the AI-use disclosure and current limitations.

## Honest current status

Calculator, feed integration, Arkiv adapter, receipt UI, documentation and automated math tests implemented. Build and tests pass. Live feed retrieval checked. Wallet signing, actual writer evidence, public repository publication and a public judge link remain to be completed by the builder. Browser QA was unavailable because the automation browser host could not be reached.
