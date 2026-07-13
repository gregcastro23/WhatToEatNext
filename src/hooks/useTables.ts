"use client";

/**
 * Table entity data hooks (docs/plans/pr2-table-entity-plan.md commit 3).
 * Thin fetch wrappers over the /api/tables surface — mirrors the
 * fetch/useState/useCallback shape of useNotifications.ts. Mutations
 * (create/RSVP/invite/etc.) are issued directly from components; these
 * hooks own reads + a `refetch` callers invoke after a successful mutation.
 */

import { useCallback, useEffect, useState } from "react";
import type { TableDetail, TableRecord } from "@/types/table";

export type TableListScope = "upcoming" | "past" | "hosting" | "all";

interface UseMyTablesOptions {
  enabled?: boolean;
}

interface UseMyTablesResult {
  tables: TableRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMyTables(
  scope: TableListScope = "all",
  options?: UseMyTablesOptions,
): UseMyTablesResult {
  const enabled = options?.enabled ?? true;
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const res = await fetch(`/api/tables?scope=${encodeURIComponent(scope)}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to load tables (${res.status})`);
      }
      const data = (await res.json()) as { tables?: TableRecord[] };
      setTables(data.tables ?? []);
    } catch {
      setError("Unable to load tables right now.");
    } finally {
      setLoading(false);
    }
  }, [enabled, scope]);

  useEffect(() => {
    setLoading(true);
    void refetch();
  }, [refetch]);

  return { tables, loading, error, refetch };
}

interface UseTableOptions {
  enabled?: boolean;
}

interface UseTableResult {
  table: TableDetail | null;
  /** The caller's resolved DB user id, from the API (never derived from the
   * session client-side — OAuth-sub vs DB-UUID mismatches). */
  viewerId: string | null;
  loading: boolean;
  error: string | null;
  /** HTTP status of the last failed fetch (404 not found, 403 not authorized). */
  statusCode: number | null;
  refetch: () => Promise<void>;
}

export function useTable(
  tableId: string | null | undefined,
  options?: UseTableOptions,
): UseTableResult {
  const enabled = (options?.enabled ?? true) && !!tableId;
  const [table, setTable] = useState<TableDetail | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled || !tableId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setStatusCode(null);
      const res = await fetch(`/api/tables/${encodeURIComponent(tableId)}`, {
        credentials: "include",
      });
      const data = (await res.json()) as {
        table?: TableDetail;
        viewerId?: string | null;
        message?: string;
      };
      if (!res.ok) {
        setStatusCode(res.status);
        setTable(null);
        return;
      }
      setTable(data.table ?? null);
      setViewerId(data.viewerId ?? null);
    } catch {
      setError("Unable to load this table right now.");
    } finally {
      setLoading(false);
    }
  }, [enabled, tableId]);

  useEffect(() => {
    setLoading(true);
    void refetch();
  }, [refetch]);

  return { table, viewerId, loading, error, statusCode, refetch };
}
