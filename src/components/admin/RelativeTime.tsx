"use client";

import { useEffect, useState } from "react";

/** "3 min ago" style timestamp; renders the date first so server and client markup match. */
export function RelativeTime({ iso }: { iso: string }) {
  const d = new Date(iso);
  const absolute = d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
  const [label, setLabel] = useState(d.toISOString().slice(0, 10));
  useEffect(() => {
    const s = (Date.now() - d.getTime()) / 1000;
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    setLabel(
      s < 60 ? "just now" : s < 3600 ? rtf.format(-Math.round(s / 60), "minute") : s < 86400 ? rtf.format(-Math.round(s / 3600), "hour") : s < 86400 * 30 ? rtf.format(-Math.round(s / 86400), "day") : absolute,
    );
  }, [iso]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <time dateTime={iso} title={absolute}>
      {label}
    </time>
  );
}
