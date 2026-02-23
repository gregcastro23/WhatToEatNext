"use client";

import React from "react";
import Providers from "./providers";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
