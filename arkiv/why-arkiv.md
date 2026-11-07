# Why Arkiv

A yield comparison is perishable: it is only as relevant as its rates, costs and holding assumptions. Arkiv's native entity lifetime makes short-lived decision records part of the data model instead of relying only on a cleanup job.

The wallet owns each receipt. The frontend signs through the user's wallet and reads records directly from Arkiv, so there is no app-controlled database account required to recover active scenarios. A second client can query the same named schema and owner and reproduce the result.

This MVP could be built using a conventional database. Arkiv's specific contribution is shared, wallet-owned, queryable state with native expiration. It does not verify DeFiLlama data, make a pool safe, or guarantee privacy or permanent erasure.

The main calculator remains usable without Arkiv; persistent cross-device active receipts and independent read-back are the features that depend on it.
