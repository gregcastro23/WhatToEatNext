import { createLogger } from '@/utils/logger';

type MetricDelta = {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number
}

const logger = createLogger('TelemetryDev')

export const TelemetryDev = {
  recordVectorBlend(
    sign: string,
    alpha: number,
    deltas: MetricDelta,
    thermodynamics: Record<string, number>,
  ): void {
    if (process.env.NODE_ENV === 'production') return;
    logger.debug('Telemetry: vector blend', { sign, alpha, deltas, thermodynamics })
  }
}
