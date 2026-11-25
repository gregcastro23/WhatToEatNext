"use client";

/**
 * Opens an ingredient's full culinary card in a dialog (portalled to the body,
 * clear of the homepage panels' clipping). Fetched only when opened.
 */
import { BookOpen } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import styles from "@/components/home/search/homeSearch.module.css";
import { createSearchResource, useSearchResource } from "@/components/home/search/useSearchResource";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CulinaryCardResponseSchema } from "@/lib/validation/culinaryCardSchemas";
import type { JSX } from "react";

const CulinaryCardBody = dynamic(() => import("./CulinaryCardBody").then((mod) => mod.CulinaryCardBody));

const resource = createSearchResource((value: unknown) => CulinaryCardResponseSchema.parse(value));

export function culinaryCardUrl(name: string): string {
  return `/api/ingredients/${encodeURIComponent(name)}/culinary`;
}

function Loaded({ name, open }: { name: string; open: boolean }): JSX.Element {
  const { status, data } = useSearchResource(resource, open ? culinaryCardUrl(name) : null);
  if (status === "error") return <p className={styles.status}>There is no culinary card for this entry yet.</p>;
  if (data === null) return <p className={styles.status}>Opening the card…</p>;
  return <CulinaryCardBody card={data.card} />;
}

export function CulinaryCardButton({ name, title, className }: { name: string; title: string; className?: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={className ?? styles.secondary}>
          <BookOpen aria-hidden="true" size={14} />
          Culinary card
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-210px)] w-[calc(100vw-24px)] max-w-2xl sm:max-h-[88vh] overflow-y-auto border-white/10 bg-[#0e0c16] text-slate-100">
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">Buying, storing, preparing and cooking, with sources.</DialogDescription>
        </DialogHeader>
        {open && <Loaded name={name} open={open} />}
      </DialogContent>
    </Dialog>
  );
}
