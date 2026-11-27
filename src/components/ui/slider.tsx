import type { InputHTMLAttributes } from "react";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value"> {
  value?: number | readonly number[];
  onValueChange?: (value: number[]) => void;
}

export const Slider = ({ value, onValueChange, onChange, ...p }: SliderProps) => {
  const scalar = Array.isArray(value) ? value[0] : value;
  return (
    <input
      type="range"
      value={scalar}
      onChange={(e) => {
        onChange?.(e);
        onValueChange?.([Number(e.target.value)]);
      }}
      {...p}
    />
  );
};