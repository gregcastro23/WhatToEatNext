"use client";

/**
 * /profile/api-keys client surface.
 *
 * Lists the caller's API keys, lets them mint a new one (with a single
 * one-time-reveal modal), and soft-revokes existing keys.
 *
 * Plaintext is shown EXACTLY ONCE — when the POST /api/account/api-keys
 * response returns it. After the user dismisses the reveal modal it is
 * dropped from component state and never recoverable.
 */

import { Copy, Eye, Plus, Trash2, TriangleAlert } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyRow {
  id: string;
  name: string;
  scopes: string[];
  rate_limit_tier: string;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const ts = new Date(iso);
  if (Number.isNaN(ts.getTime())) return "—";
  const diff = Date.now() - ts.getTime();
  if (diff < 60_000) return "Just now";
  const m = Math.round(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return ts.toISOString().slice(0, 10);
}

function maskKeyPreview(plaintext: string): string {
  if (plaintext.startsWith("sk_alchm_live_")) {
    return `${plaintext.slice(0, 18)}…${plaintext.slice(-4)}`;
  }
  return `…${plaintext.slice(-4)}`;
}

export function ApiKeysPanel(): JSX.Element {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [revealedPlaintext, setRevealedPlaintext] = useState<string | null>(
    null,
  );
  const [revealedKey, setRevealedKey] = useState<ApiKeyRow | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const loadKeys = useCallback(async (): Promise<void> => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/account/api-keys", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401) {
        setLoadError("Please sign in to view your API keys.");
        setKeys([]);
        return;
      }
      if (!res.ok) {
        setLoadError(`Failed to load keys (${res.status}).`);
        return;
      }
      const json = (await res.json()) as {
        success: boolean;
        keys?: ApiKeyRow[];
      };
      setKeys(json.keys ?? []);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load keys.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  // Focus the name field when the create dialog opens (replacement for the
  // autoFocus prop, which has accessibility tradeoffs at mount).
  useEffect(() => {
    if (!createOpen) return;
    const id = window.setTimeout(() => nameInputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [createOpen]);

  const handleCreate = useCallback(async (): Promise<void> => {
    const name = draftName.trim();
    if (name.length === 0) {
      setCreateError("Name is required.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/account/api-keys", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, scopes: ["mcp:invoke"] }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        key?: ApiKeyRow;
        plaintext?: string;
      };
      if (!res.ok || !json.success || !json.key || !json.plaintext) {
        setCreateError(json.error ?? `Mint failed (${res.status}).`);
        return;
      }
      setRevealedKey(json.key);
      setRevealedPlaintext(json.plaintext);
      setKeys((prev) => [json.key as ApiKeyRow, ...prev]);
      setCreateOpen(false);
      setDraftName("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Mint failed.");
    } finally {
      setCreating(false);
    }
  }, [draftName]);

  const handleRevoke = useCallback(async (id: string): Promise<void> => {
    setRevoking(id);
    try {
      const res = await fetch(
        `/api/account/api-keys/${encodeURIComponent(id)}`,
        { method: "DELETE", credentials: "include" },
      );
      if (res.ok) {
        setKeys((prev) =>
          prev.map((k) => (k.id === id ? { ...k, is_active: false } : k)),
        );
      }
    } finally {
      setRevoking(null);
    }
  }, []);

  const handleCopy = useCallback(async (): Promise<void> => {
    if (!revealedPlaintext) return;
    try {
      await navigator.clipboard.writeText(revealedPlaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* swallow — user can manually select */
    }
  }, [revealedPlaintext]);

  const handleDismissReveal = useCallback((): void => {
    setRevealedKey(null);
    setRevealedPlaintext(null);
    setCopied(false);
  }, []);

  const activeCount = useMemo(
    () => keys.filter((k) => k.is_active).length,
    [keys],
  );

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "40px 24px",
        color: "var(--fg)",
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <div
          className="t-tag"
          style={{ color: "var(--fg-mute)", marginBottom: 6 }}
        >
          ← PROFILE / API KEYS
        </div>
        <h1
          className="t-display"
          style={{ fontSize: 36, margin: 0, marginBottom: 8 }}
        >
          API keys
        </h1>
        <p
          style={{
            color: "var(--fg-mute)",
            fontSize: 14,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Mint keys for Claude Desktop, Cursor, and other MCP clients. The
          plaintext is shown exactly once at mint time — store it somewhere
          safe. Revoke any key at any time without affecting the others.
        </p>
      </header>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          className="t-mono"
          style={{ fontSize: 11, color: "var(--fg-mute)" }}
        >
          {activeCount} ACTIVE · {keys.length} TOTAL
        </div>
        <Button
          onClick={() => {
            setCreateError(null);
            setDraftName("");
            setCreateOpen(true);
          }}
        >
          <Plus />
          Mint new key
        </Button>
      </div>

      {loadError && (
        <div
          style={{
            border: "1px solid var(--line)",
            background: "rgba(180, 80, 80, 0.08)",
            color: "var(--fg-mute)",
            padding: "12px 16px",
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {loadError}
        </div>
      )}

      {!loading && keys.length === 0 && !loadError && (
        <div
          style={{
            border: "1px dashed var(--line)",
            padding: "40px 24px",
            borderRadius: 8,
            textAlign: "center",
            color: "var(--fg-mute)",
            fontSize: 13,
          }}
        >
          No API keys yet. Mint one above to start using the MCP server.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {keys.map((k) => (
          <ApiKeyRowView
            key={k.id}
            row={k}
            revoking={revoking === k.id}
            onRevoke={handleRevoke}
          />
        ))}
      </div>

      {/* CREATE — name input */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mint a new API key</DialogTitle>
            <DialogDescription>
              Give the key a memorable name so you can identify it later.
              Default scope is <code>mcp:invoke</code>.
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Label htmlFor="api-key-name">Name</Label>
            <Input
              id="api-key-name"
              ref={nameInputRef}
              placeholder="Claude Desktop on Mac"
              value={draftName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDraftName(e.target.value)
              }
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && !creating) void handleCreate();
              }}
              maxLength={100}
            />
            {createError && (
              <div
                style={{
                  color: "var(--danger, #ff6464)",
                  fontSize: 12,
                }}
              >
                {createError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleCreate()}
              disabled={creating}
            >
              {creating ? "Minting…" : "Mint key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REVEAL — one-time plaintext */}
      <Dialog
        open={revealedPlaintext != null}
        onOpenChange={(open) => {
          if (!open) handleDismissReveal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <TriangleAlert
                style={{
                  width: 18,
                  height: 18,
                  color: "var(--warning, #f5a623)",
                }}
              />
              Save this key now
            </DialogTitle>
            <DialogDescription>
              This is the only time we will show the full key. Copy it into
              your MCP client now — we cannot recover it later.
            </DialogDescription>
          </DialogHeader>
          <div
            style={{
              border: "1px solid var(--line)",
              background: "var(--bg-elev, rgba(255,255,255,0.04))",
              padding: 12,
              borderRadius: 6,
              fontFamily: "var(--f-mono, monospace)",
              fontSize: 12,
              wordBreak: "break-all",
              userSelect: "all",
            }}
          >
            {revealedPlaintext ?? ""}
          </div>
          {revealedKey && (
            <div
              style={{
                fontSize: 12,
                color: "var(--fg-mute)",
                marginTop: 4,
              }}
            >
              Saved as <strong>{revealedKey.name}</strong> ·{" "}
              {revealedKey.scopes.join(", ")}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => void handleCopy()}>
              <Copy />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button onClick={handleDismissReveal}>
              <Eye />I have saved it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ApiKeyRowViewProps {
  row: ApiKeyRow;
  revoking: boolean;
  onRevoke: (id: string) => void | Promise<void>;
}

function ApiKeyRowView({
  row,
  revoking,
  onRevoke,
}: ApiKeyRowViewProps): JSX.Element {
  const isExpired =
    row.expires_at != null && new Date(row.expires_at).getTime() <= Date.now();
  const active = row.is_active && !isExpired;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 12,
        border: "1px solid var(--line)",
        background: "var(--bg-elev, rgba(255,255,255,0.02))",
        padding: "14px 16px",
        borderRadius: 8,
        opacity: active ? 1 : 0.5,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            className="t-display"
            style={{ fontSize: 16, lineHeight: 1.2 }}
          >
            {row.name}
          </span>
          {!active && (
            <Badge variant="secondary">
              {isExpired ? "Expired" : "Revoked"}
            </Badge>
          )}
          {row.scopes.map((s) => (
            <Badge key={s} variant="outline">
              {s}
            </Badge>
          ))}
        </div>
        <div
          className="t-mono"
          style={{
            fontSize: 10,
            color: "var(--fg-mute)",
            letterSpacing: "0.04em",
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <span>CREATED {relativeTime(row.created_at)}</span>
          <span>LAST USED {relativeTime(row.last_used_at)}</span>
          <span>{row.usage_count.toLocaleString()} CALLS</span>
          {row.expires_at && (
            <span>EXPIRES {row.expires_at.slice(0, 10)}</span>
          )}
        </div>
      </div>
      {active && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={revoking}
              aria-label={`Revoke ${row.name}`}
            >
              <Trash2 />
              {revoking ? "Revoking…" : "Revoke"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke {row.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Any MCP client using this key will start receiving 401s on
                the next call. This cannot be undone — mint a new key if
                you need to restore access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void onRevoke(row.id)}>
                Revoke
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

/** Re-export the mask helper for test use. */
export { maskKeyPreview };
