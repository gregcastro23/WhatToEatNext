export interface ElementalBalance {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

export interface ElementalProperties {
  primary: keyof ElementalBalance;
  secondary: keyof ElementalBalance;
  strength: number;
}
