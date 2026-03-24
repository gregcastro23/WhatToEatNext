'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Friendship } from '@/types/natalChart';

/* ─── Social Manager Component ─────────────────────────── */

export const SocialManager: React.FC = () => {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [incoming, setIncoming] = useState<Friendship[]>([]);
  const [outgoing, setOutgoing] = useState<Friendship[]>([]);
  const [accepted, setAccepted] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadFriendships = useCallback(async () => {
    try {
      const res = await fetch('/api/friends', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setFriendships(data.friendships ?? []);
        setIncoming(data.incoming ?? []);
        setOutgoing(data.outgoing ?? []);
        setAccepted(data.accepted ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFriendships();
  }, [loadFriendships]);

  const handleAccept = async (friendshipId: string) => {
    setActionInProgress(friendshipId);
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendshipId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadFriendships();
      }
    } catch {
      // ignore
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (friendshipId: string, block = false) => {
    setActionInProgress(friendshipId);
    try {
      await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendshipId, block }),
      });
      await loadFriendships();
    } catch {
      // ignore
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        Loading social connections...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Incoming Requests */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          Incoming Friend Requests
          {incoming.length > 0 && (
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              {incoming.length}
            </span>
          )}
        </h3>
        {incoming.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {incoming.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <span className="text-sm font-semibold text-gray-800">
                    {f.requesterName || 'User'}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{f.requesterEmail}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(f.id)}
                    disabled={actionInProgress === f.id}
                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(f.id)}
                    disabled={actionInProgress === f.id}
                    className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-60 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      {outgoing.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Sent Requests</h3>
          <div className="space-y-2">
            {outgoing.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <span className="text-sm font-semibold text-gray-800">
                    {f.addresseeName || 'User'}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{f.addresseeEmail}</span>
                  <span className="text-xs text-yellow-600 ml-2 font-medium">Pending</span>
                </div>
                <button
                  onClick={() => handleReject(f.id)}
                  disabled={actionInProgress === f.id}
                  className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Friends */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          Friends ({accepted.length})
        </h3>
        {accepted.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">No friends yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Use the Companions tab to search by email and send friend requests.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {accepted.map((f) => {
              // Determine which side is the friend (not the current user)
              // We don't know currentUserId here, so show both sides
              const friendName = f.requesterName || f.addresseeName || 'Friend';
              const friendEmail = f.requesterEmail || f.addresseeEmail || '';

              return (
                <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{friendName}</span>
                    <span className="text-xs text-gray-400 ml-2">{friendEmail}</span>
                    <span className="text-xs text-green-600 ml-2 font-medium">Connected</span>
                  </div>
                  <button
                    onClick={() => handleReject(f.id)}
                    disabled={actionInProgress === f.id}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove friend"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
