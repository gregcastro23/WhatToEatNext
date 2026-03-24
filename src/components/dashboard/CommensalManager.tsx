'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { GroupMember, DiningGroup, CompositeNatalChart } from '@/types/natalChart';

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

/* ─── Add Commensal Form ─────────────────────────────────── */

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
  const [placeName, setPlaceName] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceNameBlur = async () => {
    if (!placeName.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(data[0].lat);
        setLongitude(data[0].lon);
        setError(null);
      } else {
        setError('Could not find location coordinates. Please enter latitude and longitude manually.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch location coordinates.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !dateTime || !latitude || !longitude) {
      setError('Name, birth date/time, latitude and longitude are all required.');
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
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to add commensal');
      onAdded(data.commensal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add commensal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-800">New Dining Companion</h4>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maria"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
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
        <div>
          <label className="block text-xs text-gray-500 mb-1">Birth Date &amp; Time *</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Timezone (optional)</label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="e.g. America/New_York"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Birth Place</label>
          <div className="relative">
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              onBlur={handlePlaceNameBlur}
              placeholder="e.g. New York, NY"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {isGeocoding && (
              <div className="absolute right-3 top-2.5 text-xs text-gray-400">
                Finding...
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Latitude *</label>
          <input
            type="number"
            step="0.0001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g. 40.7128"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Longitude *</label>
          <input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g. -74.0060"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Calculating chart…' : 'Add Companion'}
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

function CommensalCard({
  member,
  selected,
  onToggle,
  onDelete,
}: {
  member: GroupMember;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const el = member.natalChart?.dominantElement ?? 'Fire';
  const colorClass = ELEMENT_COLORS[el] ?? ELEMENT_COLORS.Fire;

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
          <span className="text-sm font-semibold text-gray-800">{member.name}</span>
          {member.relationship && (
            <span className="text-xs text-gray-400 capitalize">{member.relationship}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorClass}`}>
            {ELEMENT_EMOJI[el]} {el}
          </span>
          <span className="text-xs text-gray-400 capitalize">
            {member.natalChart?.dominantModality}
          </span>
          {member.natalChart?.ascendant && (
            <span className="text-xs text-gray-400 capitalize">
              {member.natalChart.ascendant} rising
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove companion"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Group Recommendations Panel ────────────────────────── */

function GroupRecommendationsPanel({
  commensalIds,
  allMembers,
}: {
  commensalIds: string[];
  allMembers: GroupMember[];
}) {
  const [result, setResult] = useState<GroupRecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'average' | 'minimum' | 'consensus'>('average');

  const fetchRecs = useCallback(async () => {
    if (!commensalIds.length) return;
    setLoading(true);
    try {
      const res = await fetch('/api/group-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commensalIds, strategy }),
      });
      const data = await res.json();
      if (data.success) setResult(data);
    } catch {
      // swallow
    } finally {
      setLoading(false);
    }
  }, [commensalIds, strategy]);

  useEffect(() => {
    if (commensalIds.length > 0) void fetchRecs();
    else setResult(null);
  }, [commensalIds, fetchRecs]);

  if (!commensalIds.length) return null;

  const selectedNames = allMembers
    .filter((m) => commensalIds.includes(m.id))
    .map((m) => m.name);

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
            {loading ? '…' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-6 text-sm text-gray-400">
          Calculating group harmony…
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
        </>
      )}
    </div>
  );
}

/* ─── Dining Group Manager ───────────────────────────────── */

function DiningGroupSection({
  groups,
  members,
  onGroupCreated,
  onGroupDeleted,
  onGetRecs,
}: {
  groups: DiningGroup[];
  members: GroupMember[];
  onGroupCreated: (g: DiningGroup) => void;
  onGroupDeleted: (id: string) => void;
  onGetRecs: (ids: string[]) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMember = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length === 0) {
      setError('Group name and at least one member are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/user/dining-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: groupName.trim(), memberIds: selectedIds }),
      });
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
            {members.length === 0 && (
              <p className="text-xs text-gray-400 italic">No companions added yet.</p>
            )}
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                  className="accent-purple-600"
                />
                <span className="text-sm text-gray-700">{m.name}</span>
                <span className="text-xs text-gray-400 capitalize">{m.natalChart?.dominantElement}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Creating…' : 'Create Group'}
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
        return (
          <div key={group.id} className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-800">{group.name}</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {groupMemberNames.length > 0
                    ? groupMemberNames.join(', ')
                    : 'No members'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onGetRecs(group.memberIds)}
                  className="px-3 py-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-medium hover:bg-orange-100 transition-colors"
                >
                  Recommend
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
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
  const [groups, setGroups] = useState<DiningGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeGroupIds, setActiveGroupIds] = useState<string[]>([]);

  // Load commensals + groups
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, gRes] = await Promise.all([
          fetch('/api/user/commensals', { credentials: 'include' }),
          fetch('/api/user/dining-groups', { credentials: 'include' }),
        ]);
        const [cData, gData] = await Promise.all([cRes.json(), gRes.json()]);
        if (cData.success) setCommensals(cData.commensals ?? []);
        if (gData.success) setGroups(gData.diningGroups ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleDelete = async (commensalId: string) => {
    try {
      await fetch(`/api/user/commensals/${commensalId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setCommensals((prev) => prev.filter((m) => m.id !== commensalId));
      setSelectedIds((prev) => prev.filter((id) => id !== commensalId));
    } catch {
      // ignore
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // IDs to show in recommendation panel: from group or manual selection
  const recIds = activeGroupIds.length > 0 ? activeGroupIds : selectedIds;

  if (loading) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        Loading companions…
      </div>
    );
  }

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

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <AddCommensalForm
            onAdded={(c) => {
              setCommensals((prev) => [...prev, c]);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Commensals list */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Your Companions
            {commensals.length > 0 && (
              <span className="ml-2 text-xs text-gray-400 font-normal">
                ({commensals.length})
              </span>
            )}
          </h4>
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                setActiveGroupIds([]);
                // Trigger recs via the recIds derived state
              }}
              className="text-xs text-orange-600 font-medium hover:text-orange-800"
            >
              Get Recs for {selectedIds.length} selected
            </button>
          )}
        </div>

        {commensals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
            <p className="text-sm text-gray-500">No companions yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Add a friend or family member to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {commensals.map((m) => (
              <CommensalCard
                key={m.id}
                member={m}
                selected={selectedIds.includes(m.id)}
                onToggle={() => toggleSelect(m.id)}
                onDelete={() => handleDelete(m.id)}
              />
            ))}
            {selectedIds.length > 0 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                {selectedIds.length} companion{selectedIds.length > 1 ? 's' : ''} selected
                &mdash; see recommendations below
              </p>
            )}
          </div>
        )}
      </div>

      {/* Group recommendations (auto-shown when selection exists) */}
      {recIds.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <GroupRecommendationsPanel
            commensalIds={recIds}
            allMembers={commensals}
          />
        </div>
      )}

      {/* Dining groups */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <DiningGroupSection
          groups={groups}
          members={commensals}
          onGroupCreated={(g) => setGroups((prev) => [...prev, g])}
          onGroupDeleted={(id) => setGroups((prev) => prev.filter((g) => g.id !== id))}
          onGetRecs={(ids) => {
            setActiveGroupIds(ids);
            setSelectedIds([]);
          }}
        />
      </div>
    </div>
  );
};
