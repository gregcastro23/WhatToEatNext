"use client";

import React, { useState } from "react";
import type {
  GroupMember,
  DiningGroup,
  BirthData,
} from "@/types/natalChart";
import { useUser } from "@/contexts/UserContext";
import { calculateNatalChart, validateBirthData } from "@/services/natalChartService";
import {
  calculateCompositeNatalChart,
  getGroupInsights,
  calculateElementalHarmony,
  calculateGroupDiversity,
} from "@/services/groupNatalChartService";

/**
 * Group Management Component
 *
 * Allows users to manage dining groups and their members for
 * group-optimized food recommendations.
 */
export function GroupManagement() {
  const { currentUser, updateProfile } = useUser();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Form state for new member
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "friend" as const,
    dateTime: "",
    latitude: 40.7498,
    longitude: -73.7976,
  });

  // Form state for new group
  const [newGroup, setNewGroup] = useState({
    name: "",
    selectedMemberIds: [] as string[],
  });

  const groupMembers = currentUser?.groupMembers || [];
  const diningGroups = currentUser?.diningGroups || [];

  /**
   * Add a new group member
   */
  const handleAddMember = async () => {
    try {
      setIsCalculating(true);

      // Validate birth data
      const birthData: BirthData = {
        dateTime: newMember.dateTime,
        latitude: newMember.latitude,
        longitude: newMember.longitude,
      };

      const validation = validateBirthData(birthData);
      if (!validation.valid) {
        alert(`Invalid birth data:\n${validation.errors.join("\n")}`);
        return;
      }

      // Calculate natal chart
      const natalChart = await calculateNatalChart(birthData);

      // Create new member
      const member: GroupMember = {
        id: `member-${Date.now()}`,
        name: newMember.name,
        relationship: newMember.relationship,
        birthData,
        natalChart,
        createdAt: new Date().toISOString(),
      };

      // Update user profile
      const updatedMembers = [...groupMembers, member];
      await updateProfile({ groupMembers: updatedMembers });

      // Reset form
      setNewMember({
        name: "",
        relationship: "friend",
        dateTime: "",
        latitude: 40.7498,
        longitude: -73.7976,
      });
      setShowAddMember(false);
    } catch (error) {
      alert(`Error adding member: ${(error as Error).message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Remove a group member
   */
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    // Remove member from all groups first
    const updatedGroups = diningGroups.map((group) => ({
      ...group,
      memberIds: group.memberIds.filter((id) => id !== memberId),
    }));

    // Remove member
    const updatedMembers = groupMembers.filter((m) => m.id !== memberId);

    await updateProfile({
      groupMembers: updatedMembers,
      diningGroups: updatedGroups,
    });
  };

  /**
   * Create a new dining group
   */
  const handleCreateGroup = async () => {
    if (newGroup.name.trim() === "") {
      alert("Please enter a group name");
      return;
    }

    if (newGroup.selectedMemberIds.length < 2) {
      alert("Please select at least 2 members for the group");
      return;
    }

    const group: DiningGroup = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      memberIds: newGroup.selectedMemberIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedGroups = [...diningGroups, group];
    await updateProfile({ diningGroups: updatedGroups });

    // Reset form
    setNewGroup({ name: "", selectedMemberIds: [] });
    setShowCreateGroup(false);
  };

  /**
   * Delete a dining group
   */
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    const updatedGroups = diningGroups.filter((g) => g.id !== groupId);
    await updateProfile({ diningGroups: updatedGroups });

    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
  };

  /**
   * Get group members for a dining group
   */
  const getGroupMembers = (group: DiningGroup): GroupMember[] => {
    return group.memberIds
      .map((id) => groupMembers.find((m) => m.id === id))
      .filter((m): m is GroupMember => m !== undefined);
  };

  /**
   * Render group member card
   */
  const renderMemberCard = (member: GroupMember) => {
    const elementColor: Record<string, string> = {
      Fire: "from-red-500 to-orange-500",
      Water: "from-blue-500 to-cyan-500",
      Earth: "from-green-500 to-emerald-500",
      Air: "from-yellow-500 to-amber-500",
    };

    return (
      <div
        key={member.id}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{member.name}</h4>
            <p className="text-sm capitalize text-gray-500">
              {member.relationship || "Other"}
            </p>
          </div>
          <button
            onClick={() => handleRemoveMember(member.id)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>

        <div className="space-y-1">
          <div
            className={`inline-block rounded px-2 py-1 text-xs font-medium text-white bg-gradient-to-r ${elementColor[member.natalChart.dominantElement]}`}
          >
            {member.natalChart.dominantElement} Dominant
          </div>
          <p className="text-xs text-gray-600">
            {member.natalChart.dominantModality} Modality
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render dining group card
   */
  const renderGroupCard = (group: DiningGroup) => {
    const members = getGroupMembers(group);
    const isExpanded = selectedGroupId === group.id;

    // Calculate composite chart for insights
    let insights: string[] = [];
    let harmony = 0;
    let diversity = 0;

    if (members.length >= 2) {
      try {
        const composite = calculateCompositeNatalChart(members, group.id);
        insights = getGroupInsights(composite);
        harmony = calculateElementalHarmony(composite);
        diversity = calculateGroupDiversity(composite);
      } catch (error) {
        console.error("Error calculating group insights:", error);
      }
    }

    return (
      <div
        key={group.id}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{group.name}</h4>
            <p className="text-sm text-gray-500">{members.length} members</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setSelectedGroupId(isExpanded ? null : group.id)
              }
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {isExpanded ? "Hide" : "View"}
            </button>
            <button
              onClick={() => handleDeleteGroup(group.id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 border-t border-gray-200 pt-3">
            {/* Group metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded bg-purple-50 p-2">
                <div className="text-xs text-purple-700">Harmony</div>
                <div className="font-medium text-purple-900">
                  {(harmony * 100).toFixed(0)}%
                </div>
              </div>
              <div className="rounded bg-blue-50 p-2">
                <div className="text-xs text-blue-700">Diversity</div>
                <div className="font-medium text-blue-900">
                  {(diversity * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">
                Members:
              </div>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <span
                    key={member.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                  >
                    {member.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium text-gray-700">
                  Insights:
                </div>
                <ul className="space-y-1">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="text-xs text-gray-600">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Group Dining Management
        </h2>
        <p className="text-gray-600">
          Add friends and family to get group-optimized recommendations
        </p>
      </div>

      {/* Group Members Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Group Members ({groupMembers.length})
          </h3>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {showAddMember ? "Cancel" : "Add Member"}
          </button>
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <h4 className="mb-3 font-medium text-indigo-900">
              Add New Member
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Relationship
                </label>
                <select
                  value={newMember.relationship}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      relationship: e.target.value as any,
                    })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="partner">Partner</option>
                  <option value="colleague">Colleague</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Birth Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={newMember.dateTime}
                  onChange={(e) =>
                    setNewMember({ ...newMember, dateTime: e.target.value })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={newMember.latitude}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      latitude: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={newMember.longitude}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      longitude: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowAddMember(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={isCalculating || !newMember.name || !newMember.dateTime}
                className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {isCalculating ? "Calculating..." : "Add Member"}
              </button>
            </div>
          </div>
        )}

        {/* Members Grid */}
        {groupMembers.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No group members yet. Add your first member to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groupMembers.map(renderMemberCard)}
          </div>
        )}
      </div>

      {/* Dining Groups Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Dining Groups ({diningGroups.length})
          </h3>
          <button
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            disabled={groupMembers.length < 2}
            className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-gray-300"
          >
            {showCreateGroup ? "Cancel" : "Create Group"}
          </button>
        </div>

        {/* Create Group Form */}
        {showCreateGroup && (
          <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-medium text-purple-900">
              Create Dining Group
            </h4>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g., Family Dinners, Date Night, Work Lunch"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-700">
                  Select Members (min 2) *
                </label>
                <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={newGroup.selectedMemberIds.includes(
                          member.id,
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewGroup({
                              ...newGroup,
                              selectedMemberIds: [
                                ...newGroup.selectedMemberIds,
                                member.id,
                              ],
                            });
                          } else {
                            setNewGroup({
                              ...newGroup,
                              selectedMemberIds:
                                newGroup.selectedMemberIds.filter(
                                  (id) => id !== member.id,
                                ),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {member.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={
                  !newGroup.name || newGroup.selectedMemberIds.length < 2
                }
                className="rounded bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:bg-gray-300"
              >
                Create Group
              </button>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {diningGroups.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No dining groups yet.
            {groupMembers.length < 2
              ? " Add at least 2 members to create a group."
              : " Create your first group to get group recommendations!"}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {diningGroups.map(renderGroupCard)}
          </div>
        )}
      </div>
    </div>
  );
}
