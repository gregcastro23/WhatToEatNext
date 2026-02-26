import React from "react";

interface TemplateProps {
  children: React.ReactNode;
}

/**
 * App-level template. Renders children directly without any hydration gate
 * to prevent blank-page issues caused by deferred rendering.
 */
export default function Template({ children }: TemplateProps) {
  return <>{children}</>;
}
