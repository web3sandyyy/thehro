# Entity schema

Network: Arkiv Rabdi testnet, chain ID 7794095.
SDK: `@arkiv-network/sdk` 1.0.1 (resolved by package-lock).
Schema tag: `stayput.mumbai2026.receipts.v1`.

| Attribute | Type | Indexed | Meaning |
| --- | --- | --- | --- |
| name | str | no | User-supplied scenario label, max 128 UTF-8 bytes |
| source | str | yes | `example`, `manual` or `defillama` |
| savedAt | u64 | yes | UTC milliseconds when scenario was prepared for signing |
| receipt | bytes | no | UTF-8 JSON containing version, name, numeric inputs, source provenance, selected pool, reward toggle, savedAt and wall-clock expiresAt |

The schema name adds the SDK's namespace tag. System fields `$key`, `$owner`, `$expiresAt` are selected. `$owner` is the connected wallet signing the write. Queries use `.from(Receipts).ownedBy(address).orderBy(desc('savedAt')).limit(100)`.

Example inputs: `{amount:5000,currentApy:4.2,targetApy:7.8,days:30,cost:18}`. These are labeled illustrative values, not market rates.

Creation uses `ExpirationTime.fromMinutes(2 | 15 | 30 | 60)` and `{readonly:true}`. No permissionless extension is enabled. The app offers deletion but does not offer extending old assumptions. Native expiration is enforced by block height; a wall-clock cutoff also hides stale receipts. Other clients should check both if applying the same freshness policy.

All fields are public. Data is not encrypted. A receipt proves that its owner published these assumptions, not that the APY is accurate. There is no stablecoin transfer or smart-contract deployment.

Actual writer wallet and entity key are pending the user's first signed write. Download receipt in the app exports these fields after a successful network read.
