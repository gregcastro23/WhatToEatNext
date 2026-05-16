"use client";

import React, { useEffect, useState } from "react";
import { PROFILE_BLOCKS } from "./ProfileBlockRegistry";

interface CustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  layout: string[];
  onUpdateLayout: (newLayout: string[]) => void;
}

export function CustomizeDrawer({
  isOpen,
  onClose,
  layout,
  onUpdateLayout,
}: CustomizeDrawerProps) {
  const [localLayout, setLocalLayout] = useState<string[]>(layout);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalLayout(layout);
  }, [layout]);

  const move = (index: number, direction: -1 | 1) => {
    const next = [...localLayout];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLocalLayout(next);
  };

  const toggle = (blockId: string) => {
    setLocalLayout((prev) =>
      prev.includes(blockId)
        ? prev.filter((id) => id !== blockId)
        : [...prev, blockId],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/user/profile-layout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: localLayout }),
      });
      onUpdateLayout(localLayout);
      onClose();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  const allBlockIds = Object.keys(PROFILE_BLOCKS);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 h-full w-80 bg-[#0e0e1a] border-l border-white/10 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/80">
            Customize Layout
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {/* Active blocks in order */}
          {localLayout
            .filter((id) => PROFILE_BLOCKS[id])
            .map((blockId, index) => {
              const block = PROFILE_BLOCKS[blockId];
              return (
                <div
                  key={blockId}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <span className="flex-1 text-sm text-white/80 font-medium">
                    {block.title}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-white/30">
                    {block.tab}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="text-white/30 hover:text-white disabled:opacity-20 text-xs leading-none px-1"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === localLayout.filter((id) => PROFILE_BLOCKS[id]).length - 1}
                      className="text-white/30 hover:text-white disabled:opacity-20 text-xs leading-none px-1"
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    onClick={() => toggle(blockId)}
                    className="text-red-400/60 hover:text-red-400 text-xs px-1"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              );
            })}

          {/* Hidden blocks */}
          {allBlockIds
            .filter((id) => !localLayout.includes(id))
            .map((blockId) => {
              const block = PROFILE_BLOCKS[blockId];
              return (
                <div
                  key={blockId}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 opacity-50"
                >
                  <span className="flex-1 text-sm text-white/50 font-medium">
                    {block.title}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-white/20">
                    {block.tab}
                  </span>
                  <button
                    onClick={() => toggle(blockId)}
                    className="text-purple-400/60 hover:text-purple-400 text-xs px-2 py-0.5 border border-purple-500/20 rounded"
                  >
                    Add
                  </button>
                </div>
              );
            })}
        </div>

        <div className="px-4 py-4 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs text-white/50 hover:text-white border border-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 text-xs bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </aside>
    </>
  );
}
