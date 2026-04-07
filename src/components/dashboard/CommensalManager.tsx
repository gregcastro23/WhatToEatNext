'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LocationSearch } from '@/components/onboarding/LocationSearch';
import type { GroupMember, DiningGroup, CompositeNatalChart, LinkedCommensal } from '@/types/natalChart';

/* ─── Types ────────────────────────────────────────────── */

interface CuisineRec {
  cuisineId: string;
  cuisineName: string;
  aggregatedScore: number;
  harmony: number;
  dominantElement: string;
  memberScores: Array<{ memberId: string; memberName: string; score: number }>;
  reasons: string[];
}

interface GroupRecommendationResult {
  composite: CompositeNatalChart;
  recommendations: CuisineRec[];
  memberCount: number;
  strategy: string;
}

interface SearchResult {
  id: string;
  name: string;
  email: string;
}

/* ─── Constants ─────────────────────────────────────────── */

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'text-orange-600 bg-orange-50 border-orange-200',
  Water: 'text-blue-600 bg-blue-50 border-blue-200',
  Earth: 'text-green-600 bg-green-50 border-green-200',
  Air: 'text-purple-600 bg-purple-50 border-purple-200',
};

const ELEMENT_EMOJI: Record<string, string> = {
  Fire: '🔥', Water: '💧', Earth: '🌿', Air: '💨',
};

const RELATIONSHIP_OPTIONS: Array<GroupMember['relationship']> = [
  'friend', 'family', 'partner', 'colleague', 'other',
];

/* ─── Helpers ───────────────────────────────────────────── */

function ScoreBar({ value, color = 'purple' }: { value: number; color?: string }) {
  const pct = Math.round(value * 100);
  const colorClass =
    color === 'purple' ? 'bg-purple-500' :
    color === 'orange' ? 'bg-orange-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

/* ─── Add Mode Toggle ────────────────────────────────────── */

type AddMode = 'manual' | 'email';

function AddModeToggle({ mode, onModeChange }: { mode: AddMode; onModeChange: (m: AddMode) => void }) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => onModeChange('manual')}
        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
          mode === 'manual'
            ? 'bg-purple-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        Add Manual Chart
      </button>
      <button
        type="button"
        onClick={() => onModeChange('email')}
        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
          mode === 'email'
            ? 'bg-purple-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        Search Users
      </button>
    </div>
  );
}

/* ─── Email Search Form ──────────────────────────────────── */

function AddByEmailForm({
  onRequestSent,
  onCancel,
}: {
  onRequestSent: () => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSearch = useCallback(async () => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      if (data.success) setResults(data.users ?? []);
    } catch {
      setMessage({ type: 'error', text: 'Search failed. Please check your connection.' });
    } finally {
      setSearching(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) void handleSearch();
      else setResults([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleSendRequest = async (userEmail: string) => {
    setSending(userEmail);
    setMessage(null);
    try {
      // Try the commensal-specific request endpoint first, fall back to friends
      const res = await fetch('/api/commensals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail }),
      });

      if (!res.ok) throw new Error('Failed to send request');
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Commensal request sent to ${userEmail}` });
        setSentTo((prev) => new Set(prev).add(userEmail));
        onRequestSent();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send request' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to send request' });
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-800">Find a Dining Companion on Alchm.kitchen</h4>
      <p className="text-xs text-gray-500">
        Search by email or name. When they accept, their birth chart syncs automatically for group recommendations.
      </p>

      {message && (
        <div className={`text-sm px-3 py-2 rounded-lg border ${
          message.type === 'success'
            ? 'text-green-700 bg-green-50 border-green-200'
            : 'text-red-600 bg-red-50 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or name (min 3 characters)..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {searching && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          Searching users...
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {results.map((u) => {
            const alreadySent = sentTo.has(u.email);
            return (
              <div key={u.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{u.name || 'User'}</div>
                  <div className="text-xs text-gray-400 truncate">{u.email}</div>
                </div>
                <button
                  onClick={() => { void handleSendRequest(u.email); }}
                  disabled={sending === u.email || alreadySent}
                  className={`ml-2 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex-shrink-0 ${
                    alreadySent
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60'
                  }`}
                >
                  {alreadySent ? 'Sent' : sending === u.email ? 'Sending...' : 'Add Companion'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {query.length >= 3 && !searching && results.length === 0 && (
        <div className="text-center py-3">
          <p className="text-xs text-gray-400 italic">No users found matching &ldquo;{query}&rdquo;</p>
          <p className="text-[10px] text-gray-300 mt-1">They may not have an account yet. Try adding them manually.</p>
        </div>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

/* ─── Add Commensal Form (Manual Chart) ───────────────────── */

function AddCommensalForm({
  onAdded,
  onCancel,
}: {
  onAdded: (c: GroupMember) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<GroupMember['relationship']>('friend');
  const [dateTime, setDateTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezone, setTimezone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !dateTime || !latitude || !longitude) {
      setError('Name, birth date/time, and birth location are all required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/commensals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          relationship,
          birthData: {
            dateTime: new Date(dateTime).toISOString(),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            timezone: timezone || undefined,
          },
        }),
      });
      let data: { success: boolean; message?: string; commensal?: GroupMember };
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const raw = await res.text();
        console.error('Non-JSON response from /api/user/commensals:', res.status, raw);
        throw new Error(`Server error (${res.status}): ${raw.slice(0, 200)}`);
      }
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to add commensal');
      onAdded(data.commensal!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add commensal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-800">New Manual Chart</h4>
      <p className="text-xs text-gray-500">
        For friends/family who do NOT have an alchm.kitchen account.
      </p>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-1">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-xs text-gray-500 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maria"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="sm:col-span-1">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-xs text-gray-500 mb-1">Relationship</label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as GroupMember['relationship'])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            {RELATIONSHIP_OPTIONS.map((r) => (
              <option key={r} value={r}>{r ? r.charAt(0).toUpperCase() + r.slice(1) : ''}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-1">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-xs text-gray-500 mb-1">Birth Date &amp; Time *</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="sm:col-span-2">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-xs text-gray-500 mb-1">Birth Location *</label>
          <LocationSearch
            compact
            showCoordinates
            placeholder="Search birth city..."
            onLocationSelect={(loc) => {
              setLatitude(loc.latitude.toString());
              setLongitude(loc.longitude.toString());
              if (loc.timezone) setTimezone(loc.timezone);
            }}
          />
        </div>
        {timezone && (
          <div className="sm:col-span-1">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="block text-xs text-gray-500 mb-1">Timezone</label>
            <div className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg border border-gray-200">
              {timezone}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Calculating chart...' : 'Add Companion'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Commensal Card ─────────────────────────────────────── */

interface CompanionCardProps {
  name: string;
  element: string;
  modality?: string;
  ascendant?: string;
  relationship?: string;
  isLinked?: boolean;
  selected: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}

const CompanionCard: React.FC<CompanionCardProps> = ({
  name, element, modality, ascendant, relationship, isLinked, selected, onToggle, onDelete,
}) => {
  const colorClass = ELEMENT_COLORS[element] ?? ELEMENT_COLORS.Fire;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        selected ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded accent-purple-600"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{name}</span>
          {relationship && (
            <span className="text-xs text-gray-400 capitalize">{relationship}</span>
          )}
          {isLinked && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200 font-medium">
              Linked
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorClass}`}>
            {ELEMENT_EMOJI[element]} {element}
          </span>
          {modality && (
            <span className="text-xs text-gray-400 capitalize">{modality}</span>
          )}
          {ascendant && (
            <span className="text-xs text-gray-400 capitalize">{ascendant} rising</span>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove companion"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/* ─── Group Recommendations Panel ────────────────────────── */

function GroupRecommendationsPanel({
  commensalIds,
  linkedUserIds,
  allMembers,
  linkedCommensals,
}: {
  commensalIds: string[];
  linkedUserIds: string[];
  allMembers: GroupMember[];
  linkedCommensals: LinkedCommensal[];
}) {
  const [result, setResult] = useState<GroupRecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'average' | 'minimum' | 'consensus'>('average');

  const fetchRecs = useCallback(async () => {
    if (!commensalIds.length && !linkedUserIds.length) return;
    setLoading(true);
    try {
      const res = await fetch('/api/group-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commensalIds, linkedUserIds, strategy }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setResult(data);
    } catch {
      // swallow
    } finally {
      setLoading(false);
    }
  }, [commensalIds, linkedUserIds, strategy]);

  useEffect(() => {
    if (commensalIds.length > 0 || linkedUserIds.length > 0) void fetchRecs();
    else setResult(null);
  }, [commensalIds, linkedUserIds, fetchRecs]);

  if (!commensalIds.length && !linkedUserIds.length) return null;

  const manualNames = allMembers
    .filter((m) => commensalIds.includes(m.id))
    .map((m) => m.name);
  const linkedNames = linkedCommensals
    .filter((f) => linkedUserIds.includes(f.userId))
    .map((f) => f.name);
  const selectedNames = [...manualNames, ...linkedNames];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-sm font-bold text-gray-800">
            Group Recommendations
          </h4>
          <p className="text-xs text-gray-500">
            For: {selectedNames.join(', ')} + you
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as typeof strategy)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none bg-white"
          >
            <option value="average">Average</option>
            <option value="minimum">Minimum (no one left behind)</option>
            <option value="consensus">Consensus</option>
          </select>
          <button
            onClick={() => void fetchRecs()}
            disabled={loading}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {loading ? '...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-6 text-sm text-gray-400">
          Calculating group harmony...
        </div>
      )}

      {result && !loading && (
        <>
          {/* Composite summary */}
          <div className="grid grid-cols-3 gap-2">
            {(['Spirit', 'Essence', 'Matter', 'Substance'] as const).map((prop) => (
              <div key={prop} className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500">{prop}</div>
                <div className="text-base font-bold text-purple-700">
                  {(result.composite.alchemicalProperties[prop] ?? 0).toFixed(1)}
                </div>
              </div>
            ))}
            <div className="bg-orange-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Group Element</div>
              <div className="text-base font-bold text-orange-700">
                {ELEMENT_EMOJI[result.composite.dominantElement]} {result.composite.dominantElement}
              </div>
            </div>
          </div>

          {/* Top cuisine recommendations */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Best Cuisines for the Group
            </h5>
            {result.recommendations.slice(0, 6).map((rec, i) => (
              <div key={rec.cuisineId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{rec.cuisineName}</span>
                    <span className="text-xs text-gray-400">
                      harmony {Math.round(rec.harmony * 100)}%
                    </span>
                  </div>
                  <ScoreBar value={rec.aggregatedScore} color="purple" />
                </div>
              </div>
            ))}
          </div>

          {/* Per-member score breakdown */}
          {result.recommendations.length > 0 && result.recommendations[0].memberScores?.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Member Harmony Breakdown (Top Pick)
              </h5>
              <div className="grid gap-2">
                {result.recommendations[0].memberScores.map((ms) => (
                  <div key={ms.memberId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-700 w-24 truncate">{ms.memberName}</span>
                    <div className="flex-1">
                      <ScoreBar value={ms.score} color="green" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Dining Group Manager ───────────────────────────────── */

function DiningGroupSection({
  groups,
  members,
  linkedCommensals,
  onGroupCreated,
  onGroupDeleted,
  onGetRecs,
}: {
  groups: DiningGroup[];
  members: GroupMember[];
  linkedCommensals: LinkedCommensal[];
  onGroupCreated: (g: DiningGroup) => void;
  onGroupDeleted: (id: string) => void;
  onGetRecs: (manualIds: string[], linkedIds: string[]) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allCompanions = [
    ...members.map((m) => ({ id: m.id, name: m.name, element: m.natalChart?.dominantElement, isLinked: false })),
    ...linkedCommensals.map((f) => ({ id: f.userId, name: f.name, element: f.natalChart?.dominantElement, isLinked: true })),
  ];

  const toggleMember = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length === 0) {
      setError('Group name and at least one member are required.');
      return;
    }
    setSaving(true);
    setError(null);

    // Separate manual vs linked IDs
    const manualMemberIds = new Set(members.map((m) => m.id));
    const groupManualIds = selectedIds.filter((id) => manualMemberIds.has(id));
    const groupLinkedIds = selectedIds.filter((id) => !manualMemberIds.has(id));

    try {
      const res = await fetch('/api/user/dining-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: groupName.trim(),
          memberIds: groupManualIds,
          linkedUserIds: groupLinkedIds,
        }),
      });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onGroupCreated(data.diningGroup);
      setGroupName('');
      setSelectedIds([]);
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    try {
      await fetch(`/api/user/dining-groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      onGroupDeleted(groupId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">Dining Groups</h4>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs text-purple-600 font-medium hover:text-purple-800 transition-colors"
        >
          {showCreate ? 'Cancel' : '+ New Group'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name (e.g. Friday Night Crew)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="space-y-1.5">
            <span className="text-xs text-gray-500">Select members:</span>
            {allCompanions.length === 0 && (
              <p className="text-xs text-gray-400 italic">No companions added yet.</p>
            )}
            {allCompanions.map((c) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleMember(c.id)}
                  className="accent-purple-600"
                />
                <span className="text-sm text-gray-700">{c.name}</span>
                <span className="text-xs text-gray-400 capitalize">{c.element}</span>
                {c.isLinked && (
                  <span className="text-[10px] text-green-600 font-medium">Linked</span>
                )}
              </label>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      )}

      {groups.length === 0 && !showCreate && (
        <p className="text-sm text-gray-400 italic text-center py-3">
          No groups yet. Create one to get group recommendations.
        </p>
      )}

      {groups.map((group) => {
        const groupMemberNames = members
          .filter((m) => group.memberIds.includes(m.id))
          .map((m) => m.name);
        const groupLinkedNames = linkedCommensals
          .filter((f) => ((group as any).linkedUserIds ?? []).includes(f.userId))
          .map((f) => f.name);
        const allNames = [...groupMemberNames, ...groupLinkedNames];

        return (
          <div key={group.id} className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-800">{group.name}</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {allNames.length > 0 ? allNames.join(', ') : 'No members'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onGetRecs(group.memberIds, (group as any).linkedUserIds ?? [])}
                  className="px-3 py-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-medium hover:bg-orange-100 transition-colors"
                >
                  Recommend
                </button>
                <button
                  onClick={() => { void handleDelete(group.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export const CommensalManager: React.FC = () => {
  const [commensals, setCommensals] = useState<GroupMember[]>([]);
  const [linkedCommensals, setLinkedCommensals] = useState<LinkedCommensal[]>([]);
  const [groups, setGroups] = useState<DiningGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('manual');
  const [selectedManualIds, setSelectedManualIds] = useState<string[]>([]);
  const [selectedLinkedIds, setSelectedLinkedIds] = useState<string[]>([]);
  const [activeManualIds, setActiveManualIds] = useState<string[]>([]);
  const [activeLinkedIds, setActiveLinkedIds] = useState<string[]>([]);

  // Load commensals + groups + linked friends
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, gRes, lcRes] = await Promise.all([
          fetch('/api/user/commensals', { credentials: 'include' }),
          fetch('/api/user/dining-groups', { credentials: 'include' }),
          fetch('/api/commensals', { credentials: 'include' }),
        ]);
        if (!cRes.ok || !gRes.ok) throw new Error('Failed to load data');
        const [cData, gData, lcData] = await Promise.all([cRes.json(), gRes.json(), lcRes.ok ? lcRes.json() : Promise.resolve({ success: false })]);
        if (cData.success) setCommensals(cData.commensals ?? []);
        if (gData.success) setGroups(gData.diningGroups ?? []);
        if (lcData.success) setLinkedCommensals(lcData.linkedCommensals ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const refreshLinkedCommensals = async () => {
    try {
      const res = await fetch('/api/commensals', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setLinkedCommensals(data.linkedCommensals ?? []);
    } catch {
      // ignore
    }
  };

  const handleDeleteCommensal = async (commensalId: string) => {
    try {
      await fetch(`/api/user/commensals/${commensalId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setCommensals((prev) => prev.filter((m) => m.id !== commensalId));
      setSelectedManualIds((prev) => prev.filter((id) => id !== commensalId));
    } catch {
      // ignore
    }
  };

  const toggleManualSelect = (id: string) =>
    setSelectedManualIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleLinkedSelect = (id: string) =>
    setSelectedLinkedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // IDs for recommendation panel
  const recManualIds = activeManualIds.length > 0 ? activeManualIds : selectedManualIds;
  const recLinkedIds = activeLinkedIds.length > 0 ? activeLinkedIds : selectedLinkedIds;
  const hasSelection = recManualIds.length > 0 || recLinkedIds.length > 0;
  const totalSelected = selectedManualIds.length + selectedLinkedIds.length;

  if (loading) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        Loading companions...
      </div>
    );
  }

  const totalCompanions = commensals.length + linkedCommensals.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-bold text-gray-800">Dining Companions</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Add friends and family to get group meal recommendations tuned to everyone&apos;s cosmic constitution.
            </p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              + Add Companion
            </button>
          )}
        </div>
      </div>

      {/* Dual-track add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <AddModeToggle mode={addMode} onModeChange={setAddMode} />
          {addMode === 'manual' ? (
            <AddCommensalForm
              key="manual-form"
              onAdded={(c) => {
                setCommensals((prev) => [...prev, c]);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <AddByEmailForm
              key="email-form"
              onRequestSent={() => { void refreshLinkedCommensals(); }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      )}

      {/* Companions list (manual + linked) */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Your Companions
            {totalCompanions > 0 && (
              <span className="ml-2 text-xs text-gray-400 font-normal">
                ({totalCompanions})
              </span>
            )}
          </h4>
          {totalSelected > 0 && (
            <button
              onClick={() => {
                setActiveManualIds([]);
                setActiveLinkedIds([]);
              }}
              className="text-xs text-orange-600 font-medium hover:text-orange-800"
            >
              Get Recs for {totalSelected} selected
            </button>
          )}
        </div>

        {totalCompanions === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
            <p className="text-sm text-gray-500">No companions yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Add a friend or family member to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Manual commensals */}
            {commensals.map((m) => (
              <CompanionCard
                key={m.id}
                name={m.name}
                element={m.natalChart?.dominantElement ?? 'Fire'}
                modality={m.natalChart?.dominantModality}
                ascendant={m.natalChart?.ascendant}
                relationship={m.relationship}
                selected={selectedManualIds.includes(m.id)}
                onToggle={() => { toggleManualSelect(m.id); }}
                onDelete={() => { void handleDeleteCommensal(m.id); }}
              />
            ))}

            {/* Linked friends */}
            {linkedCommensals.map((f) => (
              <CompanionCard
                key={f.userId}
                name={f.name}
                element={f.natalChart?.dominantElement ?? 'Fire'}
                modality={f.natalChart?.dominantModality}
                ascendant={f.natalChart?.ascendant}
                isLinked
                selected={selectedLinkedIds.includes(f.userId)}
                onToggle={() => { toggleLinkedSelect(f.userId); }}
              />
            ))}

            {totalSelected > 0 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                {totalSelected} companion{totalSelected > 1 ? 's' : ''} selected
                &mdash; see recommendations below
              </p>
            )}
          </div>
        )}
      </div>

      {/* Group recommendations (auto-shown when selection exists) */}
      {hasSelection && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <GroupRecommendationsPanel
            commensalIds={recManualIds}
            linkedUserIds={recLinkedIds}
            allMembers={commensals}
            linkedCommensals={linkedCommensals}
          />
        </div>
      )}

      {/* Dining groups */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <DiningGroupSection
          groups={groups}
          members={commensals}
          linkedCommensals={linkedCommensals}
          onGroupCreated={(g) => setGroups((prev) => [...prev, g])}
          onGroupDeleted={(id) => setGroups((prev) => prev.filter((g) => g.id !== id))}
          onGetRecs={(manualIds, linkedIds) => {
            setActiveManualIds(manualIds);
            setActiveLinkedIds(linkedIds);
            setSelectedManualIds([]);
            setSelectedLinkedIds([]);
          }}
        />
      </div>
    </div>
  );
};
