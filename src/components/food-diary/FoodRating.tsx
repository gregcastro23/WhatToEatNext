"use client";

/**
 * FoodRating Component
 * Star rating system with mood tags for food entries
 *
 * @file src/components/food-diary/FoodRating.tsx
 * @created 2026-02-02
 */

import React, { useState } from "react";
import type { FoodRating as FoodRatingType, MoodTag } from "@/types/foodDiary";

interface FoodRatingProps {
  rating?: FoodRatingType;
  moodTags?: MoodTag[];
  onRate: (rating: FoodRatingType, moodTags?: MoodTag[]) => Promise<boolean>;
  compact?: boolean;
  readOnly?: boolean;
}

const MOOD_TAG_OPTIONS: { tag: MoodTag; label: string; emoji: string; color: string }[] = [
  { tag: "energized", label: "Energized", emoji: "lightning", color: "bg-yellow-100 text-yellow-800" },
  { tag: "satisfied", label: "Satisfied", emoji: "smile", color: "bg-green-100 text-green-800" },
  { tag: "content", label: "Content", emoji: "heart", color: "bg-pink-100 text-pink-800" },
  { tag: "focused", label: "Focused", emoji: "target", color: "bg-blue-100 text-blue-800" },
  { tag: "tired", label: "Tired", emoji: "sleep", color: "bg-gray-100 text-gray-800" },
  { tag: "bloated", label: "Bloated", emoji: "balloon", color: "bg-orange-100 text-orange-800" },
  { tag: "sluggish", label: "Sluggish", emoji: "snail", color: "bg-amber-100 text-amber-800" },
  { tag: "hungry_after", label: "Still Hungry", emoji: "question", color: "bg-red-100 text-red-800" },
  { tag: "craving_more", label: "Want More", emoji: "plus", color: "bg-purple-100 text-purple-800" },
];

export default function FoodRating({
  rating,
  moodTags = [],
  onRate,
  compact = false,
  readOnly = false,
}: FoodRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<FoodRatingType | undefined>(rating);
  const [selectedMoods, setSelectedMoods] = useState<MoodTag[]>(moodTags);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const displayRating = hoverRating ?? selectedRating ?? 0;

  const handleStarClick = async (value: number) => {
    if (readOnly) return;

    // Allow half-star by clicking on left half
    const newRating = value as FoodRatingType;
    setSelectedRating(newRating);

    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleMoodToggle = (mood: MoodTag) => {
    if (readOnly) return;

    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleSave = async () => {
    if (!selectedRating) return;

    setIsSaving(true);
    const success = await onRate(selectedRating, selectedMoods);
    setIsSaving(false);

    if (success) {
      setIsExpanded(false);
    }
  };

  const renderStar = (index: number) => {
    const filled = displayRating >= index;
    const halfFilled = displayRating >= index - 0.5 && displayRating < index;

    return (
      <button
        key={index}
        onClick={() => handleStarClick(index)}
        onMouseEnter={() => !readOnly && setHoverRating(index)}
        onMouseLeave={() => setHoverRating(null)}
        disabled={readOnly}
        className={`${compact ? "w-5 h-5" : "w-8 h-8"} relative transition-transform ${
          !readOnly ? "hover:scale-110 cursor-pointer" : "cursor-default"
        }`}
      >
        <svg
          className="w-full h-full"
          fill={filled ? "#f59e0b" : halfFilled ? "url(#half)" : "#e5e7eb"}
          stroke={filled || halfFilled ? "#f59e0b" : "#d1d5db"}
          strokeWidth={1}
          viewBox="0 0 24 24"
        >
          <defs>
            <linearGradient id="half" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(renderStar)}
        {selectedRating && (
          <span className="text-sm text-gray-500 ml-1">
            {selectedRating.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">How was this food?</h4>
        {selectedRating && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-amber-600 hover:text-amber-700"
          >
            Edit
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(renderStar)}
        <span className="text-gray-500 ml-2">
          {displayRating > 0 ? `${displayRating.toFixed(1)} / 5` : "Tap to rate"}
        </span>
      </div>

      {/* Mood Tags - Expanded View */}
      {isExpanded && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How did it make you feel?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAG_OPTIONS.map(({ tag, label, color }) => (
                <button
                  key={tag}
                  onClick={() => handleMoodToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedMoods.includes(tag)
                      ? `${color} ring-2 ring-offset-1 ring-amber-400`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setSelectedRating(rating);
                setSelectedMoods(moodTags);
                setIsExpanded(false);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedRating || isSaving}
              className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Rating"}
            </button>
          </div>
        </>
      )}

      {/* Display Selected Moods (when not expanded) */}
      {!isExpanded && selectedMoods.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedMoods.map(mood => {
            const option = MOOD_TAG_OPTIONS.find(o => o.tag === mood);
            return option ? (
              <span
                key={mood}
                className={`px-2 py-0.5 rounded-full text-xs ${option.color}`}
              >
                {option.label}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Inline star display for read-only contexts
 */
export function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(index => {
        const filled = rating >= index;
        const halfFilled = rating >= index - 0.5 && rating < index;

        return (
          <svg
            key={index}
            className={sizeClasses[size]}
            fill={filled ? "#f59e0b" : halfFilled ? "url(#halfDisplay)" : "#e5e7eb"}
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id="halfDisplay" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      })}
      <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}
