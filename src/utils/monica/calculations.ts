import { AlchemicalState, MonicaMetrics } from './types';

export function calculateMonicaMetrics(state: AlchemicalState): MonicaMetrics {
  const { spirit, essence, matter, substance, fire, water, air, earth } = state;

  // 1. Heat: (Spirit^2 + Fire^2) / (Sum of others)^2
  // Note: Denominator excludes Spirit and Fire
  const heatNum = Math.pow(spirit, 2) + Math.pow(fire, 2);
  const heatDenom = Math.pow(substance + essence + matter + water + air + earth, 2);
  const heat = heatDenom === 0 ? 0 : heatNum / heatDenom;

  // 2. Entropy: (Spirit^2 + Substance^2 + Fire^2 + Air^2) / (Essence + Matter + Earth + Water)^2
  const entropyNum = Math.pow(spirit, 2) + Math.pow(substance, 2) + Math.pow(fire, 2) + Math.pow(air, 2);
  const entropyDenom = Math.pow(essence + matter + earth + water, 2);
  const entropy = entropyDenom === 0 ? 0 : entropyNum / entropyDenom;

  // 3. Reactivity: (Spirit^2 + Substance^2 + Essence^2 + Fire^2 + Air^2 + Water^2) / (Matter + Earth)^2
  const reactivityNum = Math.pow(spirit, 2) + Math.pow(substance, 2) + Math.pow(essence, 2) + 
                        Math.pow(fire, 2) + Math.pow(air, 2) + Math.pow(water, 2);
  const reactivityDenom = Math.pow(matter + earth, 2);
  const reactivity = reactivityDenom === 0 ? 0 : reactivityNum / reactivityDenom;

  // 4. Greg's Energy
  const gregsEnergy = heat - (entropy * reactivity);

  // 5. K_alchm (Equilibrium Constant)
  // (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
  const kAlchmNum = Math.pow(spirit, spirit) * Math.pow(essence, essence);
  const kAlchmDenom = Math.pow(matter, matter) * Math.pow(substance, substance);
  const kAlchm = kAlchmDenom === 0 ? 0 : kAlchmNum / kAlchmDenom;

  // 6. Monica Constant (M)
  // M = -Greg's Energy / (Reactivity * ln(K_alchm))
  const lnK = Math.log(kAlchm);
  let monica = 0;
  if (kAlchm > 0 && lnK !== 0 && reactivity !== 0) {
    monica = -gregsEnergy / (reactivity * lnK);
  }

  return { heat, entropy, reactivity, gregsEnergy, kAlchm, monicaConstant: monica };
}
