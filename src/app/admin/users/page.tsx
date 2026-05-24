"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { looseIncludes } from "@/utils/searchNormalize";

/**
 * Admin user-management page.
 *
 * Agentic users (is_agent=true, typically @agentic.alchm.kitchen) are sorted
 * separately from human users via the User Type filter. When viewing "All",
 * humans render first; pick "Agents" to inspect the planetary-agents roster
 * (24h feed-event counts, bio, Monica constant, dominant element).
 */
interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  tier?: string;
  subscriptionStatus?: string | null;
  isActive: boolean;
  isAgent: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  loginCount?: number;
  activeSessions?: number;
  dominantElement: string | null;
  bio?: string | null;
  monicaConstant?: number | null;
  feedEvents24h?: number;
  hasCompletedOnboarding: boolean;
}

interface UserCounts {
  all: number;
  humans: number;
  agents: number;
}

type UserType = "all" | "human" | "agent";
type StatusFilter = "all" | "active" | "inactive";

const USER_TYPE_LABELS: Record<UserType, string> = {
  all: "All",
  human: "Humans",
  agent: "Agents",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState<UserCounts>({ all: 0, humans: 0, agents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [userType, setUserType] = useState<UserType>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("userType", userType);

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error(`Server error (${response.status})`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        if (data.counts) setCounts(data.counts);
        setError(null);
      } else {
        setError(data.message || "Failed to load users");
      }
    } catch (_err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, userType]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchUsers();
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error(`Server error (${response.status})`);
      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive } : u)),
        );
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, isActive });
        }
      } else {
        console.warn(data.message || "Failed to update status");
      }
    } catch (_err) {
      console.warn("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      // eslint-disable-next-line no-alert
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Server error (${response.status})`);
      const data = await response.json();

      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setSelectedUser(null);
      } else {
        console.warn(data.message || "Failed to delete user");
      }
    } catch (_err) {
      console.warn("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const getElementColor = (element: string | null) => {
    switch (element?.toLowerCase()) {
      case "fire":
        return "text-red-600 bg-red-100";
      case "water":
        return "text-blue-600 bg-blue-100";
      case "earth":
        return "text-green-600 bg-green-100";
      case "air":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Client-side search filter on top of the server response. The server
  // already applies `?search=...`, but keeping this preserves snappy filtering
  // while the user types between debounce ticks.
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          !search ||
          looseIncludes(user.email, search) ||
          looseIncludes(user.name, search),
      ),
    [users, search],
  );

  // When viewing "All", we still split visually into Humans and Agents so the
  // boundary is obvious. The API already sorts humans first, so the boundary
  // index just falls at the first agent.
  const agentBoundaryIndex = useMemo(() => {
    if (userType !== "all") return -1;
    return filteredUsers.findIndex((u) => u.isAgent === true);
  }, [filteredUsers, userType]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts. Humans and planetary agents are tracked separately.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{counts.humans}</span> humans
          {" · "}
          <span className="font-semibold text-purple-700">{counts.agents}</span> agents
        </div>
      </div>

      {/* User Type Tabs */}
      <div className="bg-white rounded-lg shadow p-2 mb-4 inline-flex gap-1">
        {(Object.keys(USER_TYPE_LABELS) as UserType[]).map((type) => {
          const isActive = userType === type;
          const count =
            type === "all" ? counts.all : type === "human" ? counts.humans : counts.agents;
          const accent =
            type === "agent"
              ? isActive
                ? "bg-purple-600 text-white"
                : "text-purple-700 hover:bg-purple-50"
              : isActive
                ? "bg-gray-800 text-white"
                : "text-gray-700 hover:bg-gray-100";
          return (
            <button
              key={type}
              type="button"
              onClick={() => setUserType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${accent}`}
            >
              {USER_TYPE_LABELS[type]}
              <span
                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : type === "agent"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form
          onSubmit={(event) => {
            handleSearch(event);
          }}
          className="flex flex-wrap gap-4"
        >
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => {
              void fetchUsers();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {userType === "agent" ? "Identity" : "Roles"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Element
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {userType === "agent" ? "24h Activity" : "Onboarding"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {userType === "agent" ? "Provisioned" : "Joined"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {userType === "agent"
                      ? "No planetary agents provisioned yet"
                      : userType === "human"
                        ? "No human users match these filters"
                        : "No users found"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <React.Fragment key={user.id}>
                    {/* Section divider when transitioning from humans to agents (All view). */}
                    {idx === agentBoundaryIndex && agentBoundaryIndex > 0 && (
                      <tr className="bg-purple-50/60">
                        <td
                          colSpan={7}
                          className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-purple-700"
                        >
                          ⚹ Planetary Agents ({counts.agents})
                        </td>
                      </tr>
                    )}
                    <tr
                      className={`hover:bg-gray-50 ${
                        user.isAgent ? "bg-purple-50/30" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.isAgent && (
                            <span
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold"
                              title="Planetary Agent"
                            >
                              ⚹
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">
                                {user.name || "No name"}
                              </p>
                              {user.isAgent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                                  Agent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 font-mono">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isAgent ? (
                          <div className="flex flex-col gap-0.5">
                            {user.monicaConstant !== null && user.monicaConstant !== undefined && (
                              <span className="text-xs font-mono text-purple-700">
                                M = {user.monicaConstant.toFixed(3)}
                              </span>
                            )}
                            {user.bio ? (
                              <span
                                className="text-xs text-gray-600 max-w-xs truncate"
                                title={user.bio}
                              >
                                {user.bio}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span
                                key={role}
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.dominantElement ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getElementColor(
                              user.dominantElement,
                            )}`}
                          >
                            {user.dominantElement}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isAgent ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-mono font-medium ${
                              (user.feedEvents24h ?? 0) > 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {user.feedEvents24h ?? 0} events
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.hasCompletedOnboarding
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.hasCompletedOnboarding ? "Complete" : "Pending"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-sm text-purple-600 hover:text-purple-800"
                          >
                            View
                          </button>
                          {!user.roles.includes("admin") && (
                            <>
                              <button
                                onClick={() => {
                                  void handleStatusChange(user.id, !user.isActive);
                                }}
                                disabled={actionLoading}
                                className={`text-sm ${
                                  user.isActive
                                    ? "text-yellow-600 hover:text-yellow-800"
                                    : "text-green-600 hover:text-green-800"
                                }`}
                              >
                                {user.isActive ? "Deactivate" : "Activate"}
                              </button>
                              {!user.isAgent && (
                                <button
                                  onClick={() => {
                                    void handleDelete(user.id);
                                  }}
                                  disabled={actionLoading}
                                  className="text-sm text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div
              className={`p-6 border-b border-gray-200 flex justify-between items-center ${
                selectedUser.isAgent
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedUser.isAgent && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-lg font-bold">
                    ⚹
                  </span>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedUser.isAgent ? "Agent Profile" : "User Details"}
                  </h2>
                  {selectedUser.isAgent && (
                    <p className="text-xs text-purple-700 font-mono">
                      planetary-agent · @agentic.alchm.kitchen
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <DetailField label="Name" value={selectedUser.name || "No name"} />
              <DetailField label="Email" value={selectedUser.email} mono />
              {selectedUser.isAgent && selectedUser.bio && (
                <DetailField label="Bio" value={selectedUser.bio} />
              )}
              <div>
                <span className="text-sm text-gray-500">Roles</span>
                <div className="flex gap-2 mt-1">
                  {selectedUser.roles.map((role) => (
                    <span
                      key={role}
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                  {selectedUser.isAgent && (
                    <span className="px-2 py-1 rounded text-sm font-medium bg-indigo-100 text-indigo-800">
                      agent
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Dominant Element</span>
                <p>
                  {selectedUser.dominantElement ? (
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getElementColor(
                        selectedUser.dominantElement,
                      )}`}
                    >
                      {selectedUser.dominantElement}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not determined</span>
                  )}
                </p>
              </div>
              {selectedUser.isAgent && (
                <>
                  {selectedUser.monicaConstant !== null &&
                    selectedUser.monicaConstant !== undefined && (
                      <DetailField
                        label="Monica Constant"
                        value={selectedUser.monicaConstant.toFixed(4)}
                        mono
                      />
                    )}
                  <DetailField
                    label="Feed events (24h)"
                    value={`${selectedUser.feedEvents24h ?? 0}`}
                    mono
                  />
                </>
              )}
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <p>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      selectedUser.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              {!selectedUser.isAgent && (
                <div>
                  <span className="text-sm text-gray-500">Onboarding</span>
                  <p>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        selectedUser.hasCompletedOnboarding
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedUser.hasCompletedOnboarding ? "Complete" : "Pending"}
                    </span>
                  </p>
                </div>
              )}
              <DetailField
                label={selectedUser.isAgent ? "Provisioned" : "Joined"}
                value={new Date(selectedUser.createdAt).toLocaleString()}
              />
              {selectedUser.lastLoginAt && (
                <DetailField
                  label="Last login"
                  value={new Date(selectedUser.lastLoginAt).toLocaleString()}
                />
              )}
              {(selectedUser.activeSessions ?? 0) > 0 && (
                <DetailField
                  label="Active sessions"
                  value={`${selectedUser.activeSessions}`}
                  mono
                />
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="text-sm text-gray-500">{label}</span>
      <p className={`font-medium ${mono ? "font-mono text-sm" : ""}`}>{value}</p>
    </div>
  );
}
