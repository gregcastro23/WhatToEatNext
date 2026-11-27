import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface TabsItemProps {
  value?: string;
}

export const Tabs = ({
  children,
  className = "",
  value: _value,
  defaultValue: _defaultValue,
  onValueChange: _onValueChange,
  ...p
}: TabsProps) => (
  <div className={className} {...p}>
    {children}
  </div>
);

export const TabsList = ({ children, className = "", ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex gap-2 ${className}`} {...p}>
    {children}
  </div>
);

export const TabsTrigger = ({
  children,
  className = "",
  value: _value,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & TabsItemProps) => (
  <button className={className} {...p}>
    {children}
  </button>
);

export const TabsContent = ({
  children,
  className = "",
  value: _value,
  ...p
}: HTMLAttributes<HTMLDivElement> & TabsItemProps) => (
  <div className={className} {...p}>
    {children}
  </div>
);
