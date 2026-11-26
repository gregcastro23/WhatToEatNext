"use client";

/**
 * The culinary card in a dialog (portalled to the body, clear of the homepage
 * panels' clipping). Loaded by CulinaryCardButton on first open, so the dialog,
 * its wire schema and the card body stay out of every page's first load.
 */
import styles from "@/components/home/search/homeSearch.module.css";
import { createSearchResource, useSearchResource } from "@/components/home/search/useSearchResource";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CulinaryCardResponseSchema } from "@/lib/validation/culinaryCardSchemas";
import { CulinaryCardBody } from "./CulinaryCardBody";
import type { JSX } from "react";

const resource = createSearchResource((value: unknown) => CulinaryCardResponseSchema.parse(value));

export function culinaryCardUrl(name: string): string {
  return `/api/ingredients/${encodeURIComponent(name)}/culinary`;
}

function Loaded({ name, open }: { name: string; open: boolean }): JSX.Element {
  const { status, data, failedStatus } = useSearchResource(resource, open ? culinaryCardUrl(name) : null);
  if (status === "error") {
    const message = failedStatus === 404 ? "There is no culinary card for this entry yet." : "The card could not be loaded. Close it and open it again to retry.";
    return <p className={styles.status}>{message}</p>;
  }
  if (data === null) return <p className={styles.status}>Opening the card…</p>;
  return <CulinaryCardBody card={data.card} />;
}

export interface CulinaryCardDialogProps {
  name: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Puts focus back on the button that opened the dialog. */
  returnFocus: () => void;
}

export function CulinaryCardDialog({ name, title, open, onOpenChange, returnFocus }: CulinaryCardDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-210px)] w-[calc(100vw-24px)] max-w-2xl overflow-y-auto border-white/10 bg-[#0e0c16] text-slate-100 sm:max-h-[88vh]"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">Buying, storing, preparing and cooking, with sources.</DialogDescription>
        </DialogHeader>
        {open && <Loaded name={name} open={open} />}
      </DialogContent>
    </Dialog>
  );
}
