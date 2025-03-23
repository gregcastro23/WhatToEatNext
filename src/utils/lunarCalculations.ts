function getLunarPhaseModifier(phase: LunarPhase): number {
  switch(phase) {
    case 'new_moon':
      return 0.1;
    case 'waxing_crescent':
      return 0.3;
    // ... other cases
    default:
      return 0;
  }
} 