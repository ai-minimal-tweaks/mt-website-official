/* Icon set for the CMS. Plain JSX (no "use client") so server components can render it too. */

export const Icon = {
  case: (
    <svg viewBox="0 0 24 24" className="size-[60%]" fill="currentColor" aria-hidden>
      <path d="M9 3h6a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3V5a2 2 0 0 1 2-2Zm0 3h6V5H9v1Zm-5 4v8h16v-8H4Z" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" className="size-[60%]" fill="currentColor" aria-hidden>
      <path d="M12 3 2 11h3v9h6v-6h2v6h6v-9h3L12 3Z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  ext: (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  ),
};
