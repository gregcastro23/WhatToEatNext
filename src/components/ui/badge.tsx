export const Badge = ({ children, className = "", ...p }: any) => <span className={`px-2 py-1 rounded-full text-xs ${className}`} {...p}>{children}</span>;
