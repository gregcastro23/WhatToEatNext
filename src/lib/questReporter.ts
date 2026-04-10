/**
 * Client-Side Quest Event Reporter
 *
 * Fires quest event reports from React components as best-effort side effects.
 * Used for events that originate on the client (view_chart, save_recipe, etc.)
 * where the server route either lacks auth context or is public.
 *
 * Usage:
 *   import { reportQuestEvent } from '@/lib/questReporter';
 *   reportQuestEvent('view_chart');
 *
 * @file src/lib/questReporter.ts
 */

/**
 * Fire-and-forget quest event reporter.
 * Calls POST /api/quests with the event string.
 * Never throws — always best-effort.
 */
export function reportQuestEvent(event: string): void {
  // Use void to indicate intentional fire-and-forget
  void (async () => {
    try {
      await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ event }),
      });
    } catch {
      // Best-effort — silently ignore failures
    }
  })();
}
