import { _ElementalProperties } from './alchemy';

import type { Season } from './alchemy';

export interface SeasonalPhase {
  name: Season;
  start: Date;
  peak: Date;
  end: Date;
  primaryElement: keyof ElementalProperties;
  secondaryElement: keyof ElementalProperties;
}
