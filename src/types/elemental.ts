export interface elementalState {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

export interface ElementalProperties {
  primary: keyof elementalState;
  secondary: keyof elementalState;
  strength: number;
}
