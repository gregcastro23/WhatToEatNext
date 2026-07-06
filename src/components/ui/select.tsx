import * as React from 'react';

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const Select = ({ children, ...p }: SelectProps) => <div {...p}>{children}</div>;
export const SelectTrigger = ({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...p}>{children}</button>;
export const SelectValue = ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }) => <span {...p}>{children}</span>;
export const SelectContent = ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>;
export const SelectItem = ({ children, ...p }: SelectItemProps) => <div {...p}>{children}</div>;
