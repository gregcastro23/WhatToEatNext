"use client";

/**
 * SaveTemplateModal — modal to save the current weekly menu as a reusable template.
 *
 * @file src/components/menu-planner/modals/SaveTemplateModal.tsx
 */

import React, { useEffect, useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { createLogger } from "@/utils/logger";
import Sheet from "../shell/Sheet";

const logger = createLogger("SaveTemplateModal");

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function SaveTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: SaveTemplateModalProps): React.ReactElement | null {
  const { saveAsTemplate } = useMenuPlanner();
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setTemplateName("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (): Promise<void> => {
    if (isSaving) return;
    if (!templateName.trim()) {
      onError("Please enter a template name");
      return;
    }
    setIsSaving(true);
    try {
      await saveAsTemplate(templateName.trim());
      onSuccess(`Template "${templateName.trim()}" saved!`);
      onClose();
    } catch (err) {
      onError("Failed to save template");
      logger.error("Failed to save template:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open && !isSaving) onClose(); }} title="Save as Template" description="Save this week’s meal layout to load whenever you need it.">
        <div className="p-6">
          <label htmlFor="template-name-input" className="block mb-2 text-xs font-mono uppercase text-on-surface-variant font-semibold">
            Template Name
          </label>
          <input
            id="template-name-input"
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave().catch(() => {});
            }}
            placeholder="e.g., Quick Weeknight Staples"
            className="w-full px-4 py-2 border border-muted bg-surface-container-low text-primary text-sm rounded-xl focus:border-active-violet focus:outline-none placeholder:text-on-surface-variant/40"
          />
        </div>

        <div className="p-5 border-t border-muted bg-surface-container-lowest/80 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-muted text-on-surface-variant hover:text-white rounded-xl text-xs font-mono uppercase font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { handleSave().catch(() => {}); }}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-active-violet text-background font-semibold rounded-xl text-xs font-mono uppercase hover:bg-white transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>
    </Sheet>
  );
}
