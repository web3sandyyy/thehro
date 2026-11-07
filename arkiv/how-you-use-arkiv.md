# How Thehro uses Arkiv

`src/arkiv.js` implements the complete integration:

1. Define `stayput.mumbai2026.receipts.v1` with queryable source and creation-time attributes and a JSON bytes payload.
2. Connect an injected EVM wallet. Switch/add Rabdi and verify chain ID before writing.
3. `createEntity` signs a real native Arkiv transaction with an expiry and read-only attributes.
4. My receipts executes an owner-filtered SDK query. It does not populate its list from browser storage or a fabricated transaction result.
5. Reopen reads a validated payload and restores the numeric scenario. Export downloads the record, including owner, key and expiry block.
6. Delete submits an owner-authorized delete transaction; native expiry also removes records from query results.

Run `npm run query -- 0xYOUR_WRITER_WALLET_ADDRESS` to reproduce the UI's read. The reader fetches up to 100 active entities, newest first; pagination is a future extension.

Verification boundary: create/delete code is implemented, but the user will connect and sign later. Submission evidence must include a real wallet address, transaction hash and entity key from that step.
