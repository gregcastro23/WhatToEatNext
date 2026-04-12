'use client';

/**
 * Bug Report Modal ("The Alchemist's Eye")
 *
 * Modal form for submitting bug reports. Posts to `/api/bug-reports`, which
 * persists the report and fires the "Alchemist's Eye" quest, awarding
 * 15 Spirit tokens. Dispatches a `tokenEconomy:updated` event on success so
 * the TokenBalanceBar flashes and the LiveLedgerFeed refreshes.
 *
 * Follows the ad-hoc modal pattern used elsewhere in the codebase
 * (backdrop + centered glass panel, no shared Modal primitive).
 *
 * @file src/components/economy/BugReportModal.tsx
 */

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { emitTokenEconomyUpdate } from '@/hooks/useTokenEconomy';

interface BugReportModalProps {
  open: boolean;
  onClose: () => void;
}

export function BugReportModal({ open, onClose }: BugReportModalProps) {
  const pathname = usePathname();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset on close.
      setTitle('');
      setDescription('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  // Escape-to-close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 4) {
      setError('Title must be at least 4 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }

    setSubmitting(true);

    // Optimistic flash for Spirit — reconciled on next balance refresh.
    emitTokenEconomyUpdate({ source: 'optimistic', credits: { spirit: 15 } });

    try {
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          pageUrl: pathname || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit bug report');
      }
      showToast(
        data.completedQuests?.length > 0
          ? '🏆 The Alchemist\'s Eye — +15 Spirit tokens awarded!'
          : 'Bug report received. Thank you, Premium.',
        'success',
      );
      // Emit a formal quest-source update so siblings refresh ledger + balance.
      emitTokenEconomyUpdate({ source: 'quest', credits: { spirit: 15 } });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="glass-card-premium rounded-3xl border-white/10 max-w-lg w-full p-7 relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bug-report-title"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/5 transition-all"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-px bg-amber-500/40" />
              <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-[0.4em]">
                Sanctum Task · The Alchemist&apos;s Eye
              </span>
            </div>
            <h2
              id="bug-report-title"
              className="text-xl font-black text-white tracking-tight mb-1"
            >
              Report a Bug
            </h2>
            <p className="text-[11px] text-white/30 mb-5 leading-relaxed">
              Help us perfect the Sanctum. Every confirmed report earns{' '}
              <span className="text-amber-400 font-bold">+15 Spirit 🝇</span>.
            </p>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <label htmlFor="bug-title" className="block text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1.5">
                  Title
                </label>
                <input
                  id="bug-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the issue"
                  maxLength={255}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white/90 placeholder-white/20 focus:outline-none focus:border-amber-500/40 transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="bug-desc" className="block text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1.5">
                  Description
                </label>
                <textarea
                  id="bug-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? What did you expect? Steps to reproduce."
                  rows={5}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white/90 placeholder-white/20 focus:outline-none focus:border-amber-500/40 transition-all resize-none"
                  required
                />
              </div>

              {pathname && (
                <div className="text-[9px] text-white/20 font-mono italic">
                  Page: {pathname}
                </div>
              )}

              {error && (
                <p className="text-[11px] text-red-400 font-medium">{error}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.03 }}
                  whileTap={{ scale: submitting ? 1 : 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
