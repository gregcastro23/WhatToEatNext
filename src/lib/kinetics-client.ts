export const AlchemicalKineticsClient = {
  get: async (_args: any) => {
    return {
      power: [{ power: 1.0 }],
      momentum: 1.0,
      timing: { planetaryHours: ['Sun'], seasonalInfluence: 'Neutral' },
    }
  },
  put: async (_args: any) => {
    return {
      ok: true,
      json: async () => ({
        data: [
          {
            Timestamp: new Date().toISOString(),
            Total_Spirit: 0,
            Total_Essence: 0,
            Total_Matter: 0,
            Total_Substance: 0,
            Heat: 0,
            Entropy: 0,
          },
        ],
      }),
    }
  },
}
