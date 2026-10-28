"use client";

/**
 * Sheet — a right-hand slide-over panel built on Radix Dialog (already a
 * dependency). Used for Plan settings, meal details and the narrow-screen
 * recipes rail. Focus-trapped, Esc/overlay to close, labelled by its title.
 *
 * @file src/components/menu-planner/shell/Sheet.tsx
 */

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { useRef } from "react";

export default function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = "max-w-md",
  contentClassName = "px-5 py-4",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width class for the panel. */
  width?: string;
  contentClassName?: string;
}): React.ReactElement {
  const openerRef = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          onOpenAutoFocus={() => {
            if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
              openerRef.current = document.activeElement;
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const opener = openerRef.current;
            // A handoff may already have focused another dialog. Restore only
            // when closing has left focus on the document itself.
            window.requestAnimationFrame(() => {
              if (opener?.isConnected && document.activeElement === document.body) opener.focus();
            });
          }}
          className={`lab fixed inset-y-0 right-0 z-50 flex w-full ${width} flex-col border-l border-muted bg-surface shadow-2xl focus:outline-none data-[state=open]:animate-slide-in-right`}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className="flex items-start justify-between gap-4 border-b border-muted px-5 py-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-display-lg text-2xl text-primary leading-tight">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-sm text-on-surface-variant">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="rounded-full p-1.5 text-on-surface-variant hover:bg-on-surface/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-active-violet"
            >
              <X className="h-5 w-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>
          <div className={`flex-1 overflow-y-auto ${contentClassName}`}>{children}</div>
          {footer && (
            <div className="border-t border-muted bg-surface-container-lowest/80 px-5 py-3">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
