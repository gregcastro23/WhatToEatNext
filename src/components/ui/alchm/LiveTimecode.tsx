"use client";

import { useEffect, useState, type JSX } from "react";

export interface LiveTimecodeProps {
  format?: "JD" | "UTC";
}

export function LiveTimecode({ format = "JD" }: LiveTimecodeProps): JSX.Element {
  const [t, setT] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (format === "JD") {
    const jd = t.getTime() / 86_400_000 + 2_440_587.5;
    return <span className="t-mono">JD {jd.toFixed(5)}</span>;
  }
  return <span className="t-mono">{t.toISOString().split("T")[1]?.slice(0, 8)} UTC</span>;
}

export default LiveTimecode;
