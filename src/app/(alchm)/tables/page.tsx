"use client";

/**
 * /tables — my tables (upcoming / hosting / past tabs) + "Plan a Table"
 * create dialog (docs/plans/pr2-table-entity-plan.md commit 3; layout per
 * docs/design/tables-design-spec.md §3.3's Plan-a-Table panel language).
 */

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { TableCard } from "@/components/tables/TableCard";
import {
  GlassPanel,
  GradientButton,
  GradientText,
  LabelXS,
} from "@/components/tables/ui";
import { useMyTables, type TableListScope } from "@/hooks/useTables";

const TABS: Array<{ id: TableListScope; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "hosting", label: "Hosting" },
  { id: "past", label: "Past" },
];

const EMPTY_COPY: Record<string, string> = {
  upcoming: "No upcoming tables — plan one, or join a companion's.",
  hosting: "You haven't hosted a table yet.",
  past: "Your table memories will gather here.",
};

interface CreateForm {
  title: string;
  date: string;
  time: string;
  venueType: "home" | "restaurant" | "other";
  venueName: string;
  visibility: "public" | "commensals" | "private";
}

const INITIAL_FORM: CreateForm = {
  title: "",
  date: "",
  time: "",
  venueType: "home",
  venueName: "",
  visibility: "commensals",
};

export default function TablesPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [scope, setScope] = useState<TableListScope>("upcoming");
  const { tables, loading, error } = useMyTables(scope, {
    enabled: authStatus === "authenticated",
  });

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Discover deep-links: `?new=1` opens the create dialog; `?invite=<id>`
  // preselects a guest ("Break bread" from a PersonCard) to add on create.
  const [pendingInvite, setPendingInvite] = useState<{ id: string; name?: string } | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("new") === "1") setCreating(true);
    const invite = sp.get("invite");
    if (invite) setPendingInvite({ id: invite, name: sp.get("inviteName") ?? undefined });
  }, []);

  const submitCreate = async () => {
    const title = form.title.trim();
    if (!title || !form.date || !form.time || submitting) return;
    const scheduled = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(scheduled.getTime())) {
      setCreateError("Pick a valid date and time.");
      return;
    }
    setSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          scheduledAt: scheduled.toISOString(),
          venue: {
            type: form.venueType,
            name: form.venueName.trim() || undefined,
          },
          visibility: form.visibility,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        table?: { id: string };
      };
      if (!res.ok || !data.success || !data.table) {
        setCreateError(data.message || "Could not create the table.");
        return;
      }
      // If we arrived from a PersonCard's "Break bread", invite that guest now.
      if (pendingInvite?.id) {
        try {
          await fetch(`/api/tables/${data.table.id}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId: pendingInvite.id }),
          });
        } catch {
          // Best-effort — the host can still invite from the table page.
        }
      }
      router.push(`/tables/${data.table.id}`);
    } catch {
      setCreateError("Could not create the table.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 text-white md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <GradientText as="h1" className="text-4xl font-extrabold md:text-5xl">
              Tables
            </GradientText>
            <p className="mt-2 max-w-xl text-alchm-fg-dim">
              Gather your people around a shared meal — plan it, live it, keep the memory.
            </p>
          </div>
          <GradientButton onClick={() => setCreating((c) => !c)}>
            <Plus size={16} aria-hidden />
            Plan a Table
          </GradientButton>
        </div>

        {authStatus === "unauthenticated" && (
          <GlassPanel className="p-8 text-center">
            <p className="text-alchm-fg-dim">Sign in to plan a table or see your invitations.</p>
          </GlassPanel>
        )}

        {creating && (
          <GlassPanel className="p-6">
            <LabelXS className="text-alchm-fg-dim">Plan a Table</LabelXS>
            {pendingInvite && (
              <p className="mt-2 text-sm text-alchm-fg-warm">
                {pendingInvite.name ? `${pendingInvite.name} will be invited` : "Your guest will be invited"} once the table is created.
              </p>
            )}
            <div className="mt-4 space-y-4">
              <input
                type="text"
                value={form.title}
                maxLength={160}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Name your table..."
                className="w-full bg-transparent text-2xl font-bold text-alchm-fg placeholder:text-alchm-fg-mute focus:outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <LabelXS className="text-alchm-fg-dim">Date</LabelXS>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-alchm-fg focus:border-alchm-violet focus:outline-none"
                  />
                </label>
                <label className="block">
                  <LabelXS className="text-alchm-fg-dim">Time</LabelXS>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-alchm-fg focus:border-alchm-violet focus:outline-none"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <LabelXS className="text-alchm-fg-dim">Where</LabelXS>
                  <select
                    value={form.venueType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        venueType: e.target.value as CreateForm["venueType"],
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-alchm-fg focus:border-alchm-violet focus:outline-none [&>option]:bg-alchm-bg"
                  >
                    <option value="home">Cooking at home</option>
                    <option value="restaurant">A restaurant</option>
                    <option value="other">Somewhere else</option>
                  </select>
                </label>
                <label className="block">
                  <LabelXS className="text-alchm-fg-dim">Venue name (optional)</LabelXS>
                  <input
                    type="text"
                    value={form.venueName}
                    maxLength={200}
                    onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
                    placeholder={form.venueType === "home" ? "My place" : "Name the spot"}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-alchm-fg placeholder:text-alchm-fg-mute focus:border-alchm-violet focus:outline-none"
                  />
                </label>
              </div>
              <label className="block">
                <LabelXS className="text-alchm-fg-dim">Who can see it</LabelXS>
                <select
                  value={form.visibility}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      visibility: e.target.value as CreateForm["visibility"],
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-alchm-fg focus:border-alchm-violet focus:outline-none [&>option]:bg-alchm-bg"
                >
                  <option value="commensals">My commensals</option>
                  <option value="public">Everyone (memory becomes public)</option>
                  <option value="private">Invite only</option>
                </select>
              </label>

              {createError && <p className="text-sm text-rose-400">{createError}</p>}

              <div className="flex items-center gap-3">
                <GradientButton
                  onClick={() => void submitCreate()}
                  disabled={submitting || !form.title.trim() || !form.date || !form.time}
                  className="flex-1"
                >
                  {submitting ? "Setting the table…" : "Set the Table"}
                </GradientButton>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setForm(INITIAL_FORM);
                    setCreateError(null);
                  }}
                  className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-alchm-fg-mute hover:text-alchm-fg"
                >
                  Not now
                </button>
              </div>
            </div>
          </GlassPanel>
        )}

        {authStatus === "authenticated" && (
          <>
            <div
              role="tablist"
              aria-label="Table lists"
              className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={scope === tab.id}
                  onClick={() => setScope(tab.id)}
                  className={`rounded-full px-5 py-1.5 text-xs font-mono uppercase tracking-wide transition-colors ${
                    scope === tab.id
                      ? "bg-white/10 text-alchm-copper-bright"
                      : "text-alchm-fg-mute hover:text-alchm-fg"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
                ))}
              </div>
            ) : tables.length === 0 ? (
              <GlassPanel className="p-10 text-center">
                <p className="text-alchm-fg-dim">{EMPTY_COPY[scope] ?? EMPTY_COPY.upcoming}</p>
              </GlassPanel>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {tables.map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
