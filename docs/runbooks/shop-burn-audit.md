# Shop burn audit: contract read failures

The hourly `chain-reconcile` job checks whether a one-time shop item was burned
on-chain but never granted in Postgres. A successful `redeemedOrders(bytes32)`
read returns an ABI-encoded boolean, including `false` for an order that was not
burned. An empty `0x` response means the audit could not verify that order.

## Triage

1. Open `/admin/chain`. The **ESMS contract** card checks the configured RPC
   chain ID, deployed code at `ESMS_CONTRACT_ADDRESS`, and the
   `redeemedOrders(bytes32)` call. The address link opens the explorer for the
   configured chain.
2. Open `/admin/jobs` and inspect `chain-reconcile`. A blocked or partially
   failed audit records a failed heartbeat with the shop preflight result and
   first error in its run details.
3. If the card says `rpc-chain-mismatch`, point the configured RPC URL at the
   chain selected by `NEXT_PUBLIC_ESMS_CHAIN`.
4. If it says `contract-missing`, verify that `ESMS_CONTRACT_ADDRESS` is deployed
   on that chain. The address and chain must be changed together. Base Sepolia
   is `eip155:84532`; Base mainnet is `eip155:8453`.
5. If it says `read-failed` while code exists, check the proxy implementation
   and ABI for `redeemedOrders(bytes32)` and the RPC provider's response.

The chain and contract settings are on the Vercel frontend service. A change to
`NEXT_PUBLIC_ESMS_CHAIN` also needs a new deployment because that value is built
into the wallet client. Sensitive production values may be hidden as
`[SENSITIVE]` by `vercel env pull`; use the production settings and the live
admin check to verify the actual values.

## Verify recovery

After correcting the setting and deploying, wait for the next hourly run (or
invoke the authorized cron through the normal operator workflow). Confirm the
contract card reads **ready**, the job records a successful run, and its shop
details show `preflight: ready` with zero failures. The alert changes from
Degraded to Healthy once. An unconfigured audit does not claim recovery.

Do not grant purchases from the alert alone. The contract burn is the proof of
payment; the reconciliation job grants only after a successful on-chain read.
