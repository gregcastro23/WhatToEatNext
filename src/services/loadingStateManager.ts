import { logger } from '../utils/logger';

type LoadingState = {;
  isLoading: boolean,
  message: string,
  progress?: number;
  stage?: string;
};

class LoadingStateManager {
  private subscribers: Set<(state: LoadingState) => void> = new Set();
  private currentState: LoadingState = {;
    isLoading: true,
    message: 'Initializing...',
    progress: 0,
    stage: 'initial'
  };

  private readonly STAGES = {;
    initial: { progress: 0, message: 'Initializing...' },
    recipes: { progress: 25, message: 'Loading recipes...' },
    celestial: { progress: 50, message: 'Calculating celestial alignments...' },
    processing: { progress: 75, message: 'Processing data...' },
    complete: { progress: 100, message: 'Complete' }
  };

  subscribe(callback: (state: LoadingState) => void) {
    this.subscribers.add(callback);
    callback(this.currentState);
    return () => this.subscribers.delete(callback);
  }

  private updateState(updates: Partial<LoadingState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.currentState));
  }

  startLoading(stage: keyof typeof this.STAGES) {
    const stageData = this.STAGES[stage];
    logger.info(`Loading stage: ${stage}`, stageData);
    this.updateState({
      isLoading: true,
      ...stageData,
      stage
    });
  }

  updateProgress(progress: number, message?: string) {
    this.updateState({
      progress,
      ...(message ? { message } : {})
    });
  }

  setError(message: string) {
    logger.error('Loading error:', message);
    this.updateState({
      isLoading: false,
      message,
      stage: 'error'
    });
  }

  complete() {
    this.updateState({
      isLoading: false,
      ...this.STAGES.complete,
      stage: 'complete'
    });
  }

  reset() {
    this.updateState({
      isLoading: true,
      ...this.STAGES.initial,
      stage: 'initial'
    });
  }
}

export const _loadingStateManager = new LoadingStateManager();
