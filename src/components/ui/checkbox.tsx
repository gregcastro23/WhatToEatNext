import type { InputHTMLAttributes } from "react";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = ({ className = "", onCheckedChange, onChange, ...props }: CheckboxProps) => (
  <input
    type="checkbox"
    className={className}
    onChange={(e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    }}
    {...props}
  />
);
