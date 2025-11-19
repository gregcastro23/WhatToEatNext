"use client";

import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";

export const ProfileHeader: React.FC = () => {
  const { currentUser, updateProfile, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.name || "");
  const [editedEmail, setEditedEmail] = useState(currentUser?.email || "");

  const handleSave = async () => {
    if (!currentUser) return;

    await updateProfile({
      name: editedName,
      email: editedEmail,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(currentUser?.name || "");
    setEditedEmail(currentUser?.email || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="alchm-card p-8 animate-pulse">
        <div className="h-16 w-16 bg-gradient-to-br from-purple-200 to-orange-200 rounded-full mb-4"></div>
        <div className="h-6 bg-gradient-to-br from-purple-200 to-orange-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gradient-to-br from-purple-200 to-orange-200 rounded w-64"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="alchm-card p-8">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="alchm-card p-8">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-orange-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold alchm-glow">
          {currentUser.name?.charAt(0).toUpperCase() || "U"}
        </div>

        {/* User Info */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-orange-700 transition-all duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold alchm-gradient-text">
                  {currentUser.name || "User"}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-purple-600 hover:text-purple-700 transition-colors"
                  aria-label="Edit profile"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-1">{currentUser.email}</p>
              <p className="text-sm text-gray-500">User ID: {currentUser.userId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
