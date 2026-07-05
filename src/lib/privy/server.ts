/**
 * Server-side Privy verification + embedded-wallet resolution. Privy is layered
 * as a shared cross-site IDENTITY (a Privy DID) on top of NextAuth — it is NOT
 * the primary login.
 *
 * Lazily constructed so importing this module never throws when PRIVY_APP_SECRET
 * is unset (build / tests / unconfigured envs). `getPrivyClient()` returns null
 * when unconfigured so a route can return a clean 500; `verifyPrivyToken()`
 * returns null on a bad/expired token (or when unconfigured) so a route can
 * return a 401.
 *
 * Mirrors PA's lib/privy/server.ts so both sites resolve the same DID + wallet.
 *
 * @file src/lib/privy/server.ts
 */

import { PrivyClient } from "@privy-io/server-auth";

let _client: PrivyClient | null = null;

/** Lazily build the Privy server client. Returns null when unconfigured. */
export function getPrivyClient(): PrivyClient | null {
  if (_client) return _client;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (appId && appSecret) {
    // If the app registers an authorization keypair in the Privy Dashboard,
    // every walletApi call (createWallet, ethereum.sendTransaction for the
    // server-wallet minter/redeemer) must be signed with its private key —
    // without it those calls fail. Optional until a keypair is registered.
    const authorizationPrivateKey = process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY;
    _client = new PrivyClient(
      appId,
      appSecret,
      authorizationPrivateKey ? { walletApi: { authorizationPrivateKey } } : undefined,
    );
  }
  return _client;
}

/**
 * Verify a Privy access token. Returns the Privy DID (did:privy:…), or null if
 * the token is invalid/expired or Privy is unconfigured. Callers that need to
 * distinguish "unconfigured" (500) from "bad token" (401) should check
 * getPrivyClient() first.
 */
export async function verifyPrivyToken(accessToken: string): Promise<string | null> {
  if (!accessToken) return null;
  const client = getPrivyClient();
  if (!client) return null;
  try {
    const claims = await client.verifyAuthToken(accessToken);
    return claims.userId || null; // claims.userId is the Privy DID
  } catch (err) {
    console.warn("[privy] token verification failed:", err);
    return null;
  }
}

/**
 * Resolve the user's embedded EVM (Privy) wallet address from their verified DID
 * — server authoritative (never trust a client-sent address). Returns null if
 * none / on error. Mirrors PA's getPrivyWallet().
 */
export async function getPrivyWallet(did: string): Promise<string | null> {
  const client = getPrivyClient();
  if (!client) return null;
  try {
    const user = await client.getUser(did);
    const accounts = ((user as { linkedAccounts?: unknown[] }).linkedAccounts || []) as Array<
      Record<string, unknown>
    >;
    const embedded = accounts.find(
      (a) =>
        a?.type === "wallet" &&
        a?.walletClientType === "privy" &&
        a?.chainType === "ethereum",
    );
    const anyWallet = accounts.find((a) => a?.type === "wallet");
    return (embedded?.address ?? anyWallet?.address ?? null) as string | null;
  } catch (err) {
    console.warn("[privy] getPrivyWallet failed:", err);
    return null;
  }
}

/** Mask a DID for display: did:privy:••••<last6>. Mirrors PA's maskDid. */
export function maskDid(did: string): string {
  return `did:privy:••••${did.slice(-6)}`;
}
