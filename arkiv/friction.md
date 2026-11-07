# Integration feedback

What worked:
- SDK 1.0.1 exposes named schemas, typed attributes, owner-filtered queries and native expiry in a small adapter.
- `createEntity` returns transaction hash, entity key and expiry block for a verifiable demo.
- The public RPC allows building the read path without an app backend or a server-held wallet key.
- A live schema/owner-filtered read on Rabdi succeeded using the public RPC. It returned no records for the non-writer test address, as expected.

Friction observed:
- Search results mixed older payload/attributes examples with the newer schema API. The installed package source and current first-entity guide were used to reconcile them.
- Documentation navigation/search results included stale chain/export information; the installed `rabdi({accessKey})` source confirmed chain ID 7794095 and the current RPC.
- Public RPC is documented as heavily rate limited. The app supports an optional origin-restricted access key, but no key was supplied in this session.
- Dependency download and network checks needed environment network approval. This is local tooling friction, not attributed to Arkiv.
- Wallet transaction UX and time to first successful write remain unmeasured: the builder chose to connect their wallet later. No success is claimed for that step.

Suggested improvement: a versioned, current browser-wallet example combining schema creation, native expiry, a read-only receipt, and read-back using the returned entity key.

Before submission, append actual time to first write and any wallet/faucet/RPC friction observed during the live demo.
