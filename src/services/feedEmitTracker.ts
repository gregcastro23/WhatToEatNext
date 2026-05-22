/**
 * ⚡ Feed Emit Tracker
 * Keeps track of the last fire-and-forget feed event sent by Planetary Agents to /api/feed.
 * Retains details in-memory across Next.js API handler invocations.
 */

export interface FeedEmitStatus {
  eventType: string;
  agentEmail: string;
  responseCode: number;
  timestamp: string;
}

const globalForFeedEmit = global as unknown as {
  lastFeedEmitStatus?: FeedEmitStatus;
};

export const feedEmitTracker = {
  /**
   * Get the last captured feed emit status
   */
  getLastEmit: (): FeedEmitStatus | null => {
    return globalForFeedEmit.lastFeedEmitStatus || null;
  },

  /**
   * Set a new feed emit status
   */
  setLastEmit: (emit: FeedEmitStatus): void => {
    globalForFeedEmit.lastFeedEmitStatus = emit;
  }
};
