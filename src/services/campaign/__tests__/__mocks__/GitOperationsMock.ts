/**
 * Mock Git Operations for Testing
 * Perfect Codebase Campaign - Git Mocking Infrastructure
 */

import { GitStash } from '../../../../types/campaign';

export class GitOperationsMock {
  private mockStashes: Map<string, GitStash> = new Map()
  private mockBranch: string = 'main',
  private mockGitStatus: string = '',
  private shouldFailCommands: boolean = false

  /**
   * Mock git stash creation
   */
  mockCreateStash(stashId: string, description: string): GitStash {
    const stash: GitStash = {
      id: stashId,
      description,
      timestamp: new Date(),
      branch: this.mockBranch,
      ref: `stash@{${this.mockStashes.size}}`
    },

    this.mockStashes.set(stashId, stash)
    return stash,
  }

  /**
   * Mock git stash application
   */
  mockApplyStash(stashId: string): boolean {
    if (this.shouldFailCommands) {
      throw new Error('Mock git stash apply failed')
    }

    return this.mockStashes.has(stashId)
  }

  /**
   * Mock git status
   */
  mockGetGitStatus(): string {
    if (this.shouldFailCommands) {
      throw new Error('Mock git status failed')
    }

    return this.mockGitStatus,
  }

  /**
   * Mock git branch
   */
  mockGetCurrentBranch(): string {
    if (this.shouldFailCommands) {
      throw new Error('Mock git branch failed')
    }

    return this.mockBranch,
  }

  /**
   * Mock git stash list
   */
  mockListStashes(): string {
    if (this.shouldFailCommands) {
      throw new Error('Mock git stash list failed')
    }

    const stashes = Array.from(this.mockStashes.values())
    return stashes.map(stash => `${stash.ref}: ${stash.description}`).join('\n')
  }

  /**
   * Set mock git status
   */
  setMockGitStatus(status: string): void {
    this.mockGitStatus = status
  }

  /**
   * Set mock branch
   */
  setMockBranch(branch: string): void {
    this.mockBranch = branch
  }

  /**
   * Enable/disable command failures
   */
  setShouldFailCommands(shouldFail: boolean): void {
    this.shouldFailCommands = shouldFail
  }

  /**
   * Get mock stashes
   */
  getMockStashes(): Map<string, GitStash> {
    return new Map(this.mockStashes)
  }

  /**
   * Clear mock stashes
   */
  clearMockStashes(): void {
    this.mockStashes.clear()
  }

  /**
   * Add mock stash directly
   */
  addMockStash(stash: GitStash): void {
    this.mockStashes.set(stash.id, stash)
  }

  /**
   * Remove mock stash
   */
  removeMockStash(stashId: string): boolean {
    return this.mockStashes.delete(stashId)
  }

  /**
   * Check if stash exists
   */
  hasStash(stashId: string): boolean {
    return this.mockStashes.has(stashId)
  }

  /**
   * Get stash by ID
   */
  getStash(stashId: string): GitStash | undefined {
    return this.mockStashes.get(stashId)
  }

  /**
   * Reset all mock state
   */
  reset(): void {
    this.mockStashes.clear()
    this.mockBranch = 'main',
    this.mockGitStatus = '',
    this.shouldFailCommands = false
  }
}

// Singleton instance for tests
export const _gitOperationsMock = new GitOperationsMock()
