"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  clearGuestBirthday,
  ELEMENT_TAGLINES,
  GUEST_PALATE_EVENT,
  loadGuestPalate,
  saveGuestBirthday,
  type GuestPalate,
} from "@/utils/guestPalate";

/**
 * Slim account-free personalization strip at the top of the homepage.
 *
 * The pitch: signing up is where the full value lives, but a bare birthday is
 * enough to start tuning readings to the visitor's sun sign — so we ask for
 * exactly that, inline, with zero interruption. Signed-in users never see it
 * (their profile owns their chart), and once a birthday is stored the strip
 * collapses into a small identity chip with an upgrade path to /onboarding.
 */
export function BirthdayStrip() {
  const { status } = useSession();
  const [palate, setPalate] = useState<GuestPalate | null>(null);
  const [value, setValue] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setPalate(loadGuestPalate());
    sync();
    setHydrated(true);
    window.addEventListener(GUEST_PALATE_EVENT, sync);
    return () => window.removeEventListener(GUEST_PALATE_EVENT, sync);
  }, []);

  if (status === "authenticated" || !hydrated) return null;

  const submit = () => {
    if (!value) return;
    setPalate(saveGuestBirthday(value));
  };

  return (
    <section className="alchm-bday" aria-label="Personalize without an account">
      <style>{stripStyles}</style>
      {palate ? (
        <div className="alchm-bday-row">
          <span className="alchm-bday-glyph" aria-hidden="true">
            {palate.glyph}
          </span>
          <p className="alchm-bday-copy">
            <strong className="alchm-bday-strong">
              {palate.signLabel} palate
            </strong>{" "}
            — {ELEMENT_TAGLINES[palate.element]}. Tonight&apos;s readings are
            tuned to your sun.
          </p>
          <span className="alchm-bday-actions">
            <Link href="/onboarding" className="t-mono alchm-bday-link">
              Full-chart precision →
            </Link>
            <button
              type="button"
              className="alchm-bday-clear"
              aria-label="Clear saved birthday"
              onClick={() => {
                clearGuestBirthday();
                setPalate(null);
                setValue("");
              }}
            >
              ×
            </button>
          </span>
        </div>
      ) : (
        <div className="alchm-bday-row">
          <span className="alchm-bday-glyph" aria-hidden="true">
            ✦
          </span>
          <p className="alchm-bday-copy">
            <strong className="alchm-bday-strong">
              Personalize in five seconds
            </strong>{" "}
            — your birthday tunes tonight&apos;s readings to your sign. No
            account needed; it stays on this device.
          </p>
          <span className="alchm-bday-actions">
            <input
              type="date"
              className="alchm-bday-input"
              aria-label="Your birthday"
              value={value}
              min="1900-01-01"
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
            <button
              type="button"
              className="t-mono alchm-bday-go"
              disabled={!value}
              onClick={submit}
            >
              Tune it →
            </button>
            <Link href="/login" className="t-mono alchm-bday-link is-quiet">
              or sign in to save
            </Link>
          </span>
        </div>
      )}
    </section>
  );
}

const stripStyles = `
  .alchm-bday {
    border: 1px solid color-mix(in oklch, var(--accent), transparent 65%);
    border-radius: var(--radius);
    background:
      linear-gradient(90deg, color-mix(in oklch, var(--accent), transparent 92%), transparent 55%),
      rgba(255,255,255,0.02);
    padding: 10px 16px;
  }
  .alchm-bday-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .alchm-bday-glyph {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid color-mix(in oklch, var(--accent), transparent 55%);
    border-radius: 8px;
    background: color-mix(in oklch, var(--accent), transparent 90%);
    color: var(--accent);
    font-size: 15px;
  }
  .alchm-bday-copy {
    flex: 1 1 260px;
    margin: 0;
    color: var(--fg-mute);
    font-size: 12px;
    line-height: 1.5;
  }
  .alchm-bday-strong { color: var(--fg); font-weight: 650; }
  .alchm-bday-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .alchm-bday-input {
    padding: 7px 10px;
    border: 1px solid var(--line-hi);
    border-radius: 8px;
    background: rgba(0,0,0,0.3);
    color: var(--fg);
    font-size: 12px;
    color-scheme: dark;
  }
  .alchm-bday-input:focus {
    outline: none;
    border-color: color-mix(in oklch, var(--accent), transparent 30%);
  }
  .alchm-bday-go {
    padding: 8px 14px;
    border: 1px solid color-mix(in oklch, var(--accent), white 10%);
    border-radius: 8px;
    background: var(--accent);
    color: #110d18;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .alchm-bday-go:hover { filter: brightness(1.08); }
  .alchm-bday-go:disabled { opacity: 0.4; cursor: default; }
  .alchm-bday-link {
    color: var(--accent);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
  }
  .alchm-bday-link:hover { text-decoration: underline; }
  .alchm-bday-link.is-quiet { color: var(--fg-mute); }
  .alchm-bday-clear {
    width: 26px;
    height: 26px;
    border: 1px solid var(--line-hi);
    border-radius: 50%;
    background: transparent;
    color: var(--fg-mute);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
  }
  .alchm-bday-clear:hover { color: var(--fg); border-color: var(--fg-mute); }
  @media (max-width: 640px) {
    .alchm-bday { padding: 12px 14px; }
    .alchm-bday-actions { width: 100%; }
    .alchm-bday-input { flex: 1; }
  }
`;
