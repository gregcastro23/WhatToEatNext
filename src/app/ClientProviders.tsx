"use client";

import dynamic from "next/dynamic";
import React from "react";

const DynamicProviders = dynamic(() => import("./providers"), { ssr: false });

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <DynamicProviders>{children}</DynamicProviders>;
}
