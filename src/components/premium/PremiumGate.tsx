"use client";

import React from "react";

interface PremiumGateProps {
  children: React.ReactNode;
  preview?: React.ReactNode;
  featureName?: string;
}

export default function PremiumGate({
  children,
}: PremiumGateProps) {
  return <>{children}</>;
}
