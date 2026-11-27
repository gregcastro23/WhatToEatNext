import type { HTMLAttributes } from "react";

export const Card = ({ children, className = "", ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`border rounded-lg ${className}`} {...p}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className}`} {...p}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...p }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`font-semibold ${className}`} {...p}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "", ...p }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-500 ${className}`} {...p}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "", ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 pt-0 ${className}`} {...p}>
    {children}
  </div>
);
