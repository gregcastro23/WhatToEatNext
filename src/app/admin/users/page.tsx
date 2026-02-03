"use client";

import React, { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  dominantElement: string | null;
  hasCompletedOnboarding: boolean;
}

/**
 * Admin Users Page - User management interface
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || "Failed to load users");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const data = await response.json();

      if (data.success) {
        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive } : u)),
        );
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, isActive });
        }
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
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
      const data = await response.json();

      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setSelectedUser(null);
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      alert("Failed to delete user");
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Users</h1>
        <p className="text-gray-600 mt-1">Manage user accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
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
            onClick={fetchUsers}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Element
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Onboarding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
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
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.name || "No name"}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.hasCompletedOnboarding
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.hasCompletedOnboarding ? "Complete" : "Pending"}
                      </span>
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
                              onClick={() =>
                                handleStatusChange(user.id, !user.isActive)
                              }
                              disabled={actionLoading}
                              className={`text-sm ${
                                user.isActive
                                  ? "text-yellow-600 hover:text-yellow-800"
                                  : "text-green-600 hover:text-green-800"
                              }`}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={actionLoading}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
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
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-medium">{selectedUser.name || "No name"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Roles</label>
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
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Dominant Element
                </label>
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
              <div>
                <label className="text-sm text-gray-500">Status</label>
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
              <div>
                <label className="text-sm text-gray-500">Onboarding</label>
                <p>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      selectedUser.hasCompletedOnboarding
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedUser.hasCompletedOnboarding
                      ? "Complete"
                      : "Pending"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Joined</label>
                <p>{new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
              {selectedUser.lastLoginAt && (
                <div>
                  <label className="text-sm text-gray-500">Last Login</label>
                  <p>{new Date(selectedUser.lastLoginAt).toLocaleString()}</p>
                </div>
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
