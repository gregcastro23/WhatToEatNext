"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PWA !== "true") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
}
