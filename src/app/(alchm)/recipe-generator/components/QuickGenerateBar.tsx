import React from "react";
import { MEAL_TYPES, type QuickGenerateBarProps } from "./types";

export const QuickGenerateBar: React.FC<QuickGenerateBarProps> = ({
  onGenerate,
  onGenerateAll,
  isGenerating,
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-xs font-semibold text-gray-500 mr-1">Quick:</span>
    {MEAL_TYPES.map((meal) => (
      <button
        key={meal}
        type="button"
        onClick={() => onGenerate(meal)}
        disabled={isGenerating}
        className="px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed capitalize"
      >
        {meal}
      </button>
    ))}
    <button
      type="button"
      onClick={onGenerateAll}
      disabled={isGenerating}
      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-700 hover:to-amber-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      All Meals
    </button>
  </div>
);
