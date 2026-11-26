"use client";

/**
 * Opens an ingredient's full culinary card. The dialog is loaded on first open
 * and its card fetched only then: ingredient pages have a first-load budget
 * (scripts/check-route-sizes.cjs).
 */
import { BookOpen } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import styles from "@/components/home/search/homeSearch.module.css";
import type { JSX } from "react";

const CulinaryCardDialog = dynamic(() => import("./CulinaryCardDialog").then((mod) => mod.CulinaryCardDialog), { ssr: false });

export function CulinaryCardButton({ name, title, className }: { name: string; title: string; className?: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={button}
        type="button"
        className={className ?? styles.secondary}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setWanted(true);
          setOpen(true);
        }}
      >
        <BookOpen aria-hidden="true" size={14} />
        Culinary card
      </button>
      {wanted && <CulinaryCardDialog name={name} title={title} open={open} onOpenChange={setOpen} returnFocus={() => button.current?.focus()} />}
    </>
  );
}
