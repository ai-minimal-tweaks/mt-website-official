"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { categories, caseStudyHref, slugify, type Block, type CaseStudy, type Category } from "@/content/case-studies";
import { Badge, Button, Card, Field, Icon, IconTile, Modal, Toggle, inputCls, useToast } from "./ui";
import { RelativeTime } from "./RelativeTime";
import { upload as blobUpload } from "@vercel/blob/client";
import { useStorageMode } from "./AdminShell";
import type { StorageMode } from "@/lib/cms/store";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, VIDEO_TYPES } from "@/lib/cms/media-types";

/* ------------------------------------------------------------------------------------------------
 * Form model. Text lives in the four page sections; media is edited separately and written back so the
 * page's rules hold: the first image is the approach visual, every other image/video is the showcase.
 * ---------------------------------------------------------------------------------------------- */

type TextType = "p" | "h" | "li" | "quote";
type TextItem = { key: string; type: TextType; text: string };
type MediaItem = { key: string; type: "image" | "video"; src: string; label: string };
type Section = "brief" | "approach" | "solution" | "conclusion";

type Form = {
  client: string;
  slug: string;
  slugTouched: boolean;
  status: "published" | "draft";
  title: string;
  industry: string;
  service: string;
  categories: Category[];
  concept: boolean;
  featured: boolean;
  featuredOrder: number;
  cover: string;
  description: string;
  metaTitle: string;
  metricValue: string;
  metricLabel: string;
  brief: TextItem[];
  approach: TextItem[];
  solution: TextItem[];
  conclusion: TextItem[];
  approachImage: { src: string; alt: string };
  gallery: MediaItem[];
  tQuote: string;
  tName: string;
  tRole: string;
};

let seq = 0;
const key = () => `k${++seq}`;

const SECTIONS: { id: Section; index: string; label: string; heading: string; hint: string }[] = [
  { id: "brief", index: "01", label: "The brief", heading: "What they came in with.", hint: "Who the client is and what they needed." },
  { id: "approach", index: "02", label: "Our approach", heading: "The idea behind the work.", hint: "Shown beside the approach image." },
  {
    id: "solution",
    index: "03",
    label: "Process",
    heading: "How the tweak happened.",
    hint: "Paragraphs show at the top of the dark band. Each Bullet becomes a numbered step card (01, 02, 03…).",
  },
  { id: "conclusion", index: "04/05", label: "Results", heading: "What changed.", hint: "Shown beside the result metric." },
];

const TEXT_TYPES: { type: TextType; label: string }[] = [
  { type: "p", label: "Paragraph" },
  { type: "h", label: "Sub-heading" },
  { type: "li", label: "Bullet" },
  { type: "quote", label: "Quote" },
];

function fromRecord(r?: CaseStudy): Form {
  const text = (blocks: Block[]) =>
    blocks.filter((b): b is Extract<Block, { type: TextType }> => b.type !== "image" && b.type !== "video").map((b) => ({ key: key(), type: b.type, text: b.text }));
  const media = r ? [...r.brief, ...r.approach, ...r.solution, ...r.conclusion].filter((b) => b.type === "image" || b.type === "video") : [];
  const firstImage = media.find((m) => m.type === "image") as Extract<Block, { type: "image" }> | undefined;
  return {
    client: r?.client ?? "",
    slug: r?.slug ?? "",
    slugTouched: !!r,
    status: r?.status ?? "draft",
    title: r?.title ?? "",
    industry: r?.industry ?? "",
    service: r?.service ?? "",
    categories: r?.categories ?? [],
    concept: r?.concept ?? false,
    featured: (r?.featured ?? -1) >= 0,
    featuredOrder: Math.max(r?.featured ?? 0, 0) + 1,
    cover: r?.cover ?? "",
    description: r?.description ?? "",
    metaTitle: r?.metaTitle ?? "",
    metricValue: r?.metric?.value ?? "",
    metricLabel: r?.metric?.label ?? "",
    brief: r ? text(r.brief) : [{ key: key(), type: "p", text: "" }],
    approach: r ? text(r.approach) : [{ key: key(), type: "p", text: "" }],
    solution: r ? text(r.solution) : [{ key: key(), type: "p", text: "" }],
    conclusion: r ? text(r.conclusion) : [{ key: key(), type: "p", text: "" }],
    approachImage: { src: firstImage?.src ?? "", alt: firstImage?.alt ?? "" },
    gallery: media
      .filter((m) => m !== firstImage)
      .map((m) => ({ key: key(), type: m.type as "image" | "video", src: (m as { src: string }).src, label: m.type === "image" ? m.alt : (m.title ?? "") })),
    tQuote: r?.testimonial?.quote ?? "",
    tName: r?.testimonial?.name ?? "",
    tRole: r?.testimonial?.role ?? "",
  };
}

function toPayload(f: Form) {
  const text = (items: TextItem[]): Block[] => items.filter((i) => i.text.trim()).map((i) => ({ type: i.type, text: i.text.trim() }));
  const gallery: Block[] = f.gallery
    .filter((m) => m.src.trim())
    .map((m) => (m.type === "image" ? { type: "image", src: m.src.trim(), alt: m.label.trim() } : { type: "video", src: m.src.trim(), title: m.label.trim() || undefined }));
  const approachImage: Block[] = f.approachImage.src.trim() ? [{ type: "image", src: f.approachImage.src.trim(), alt: f.approachImage.alt.trim() }] : [];
  return {
    client: f.client,
    slug: f.slug || slugify(f.client),
    status: f.status,
    title: f.title,
    industry: f.industry,
    service: f.service,
    categories: f.categories,
    concept: f.concept,
    featured: f.featured ? Math.max(1, Math.floor(f.featuredOrder || 1)) - 1 : -1,
    cover: f.cover,
    description: f.description,
    metaTitle: f.metaTitle,
    metric: f.metricValue.trim() ? { value: f.metricValue, label: f.metricLabel } : null,
    // Text stays in its section; the approach image leads the media order, the showcase follows it.
    brief: text(f.brief),
    approach: [...text(f.approach), ...approachImage],
    solution: [...text(f.solution), ...gallery],
    conclusion: text(f.conclusion),
    testimonial: f.tQuote.trim() ? { quote: f.tQuote, name: f.tName, role: f.tRole } : null,
  };
}

/* ------------------------------------------------------------------------------------------------ */

async function upload(file: File, storage: StorageMode): Promise<{ url?: string; error?: string }> {
  const isVideo = file.type.startsWith("video/");
  if (![...IMAGE_TYPES, ...VIDEO_TYPES].includes(file.type)) return { error: "Use a JPG, PNG, WebP, GIF, AVIF, MP4, WebM or MOV file." };
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) return { error: `File is larger than ${max / 1024 / 1024} MB.` };

  if (storage === "blob") {
    // Straight from the browser to Vercel Blob; the server only signs a short-lived token for signed-in admins.
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "").slice(-80) || "file";
      const blob = await blobUpload(`cms/uploads/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/cms/blob-upload",
        contentType: file.type,
        multipart: file.size > 20 * 1024 * 1024,
      });
      return { url: blob.url };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Upload failed." };
    }
  }

  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/cms/upload", { method: "POST", body }).catch(() => null);
  if (!res) return { error: "Network error during upload." };
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  return res.ok ? { url: json.url } : { error: json.error ?? "Upload failed." };
}

const isVideoFile = (src: string) => /\.(mp4|webm|mov)(\?|$)/i.test(src);

function Thumb({ src, video }: { src: string; video?: boolean }) {
  if (!src) return <span className="grid size-full place-items-center text-[0.65rem] text-[#9a9ea8]">No media</span>;
  if (video) {
    return isVideoFile(src) ? (
      <video src={src} muted playsInline preload="metadata" className="size-full object-cover" />
    ) : (
      <span className="grid size-full place-items-center bg-[#0F2944] text-white">▶</span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="size-full object-cover" />;
}

/** URL input + upload button + preview, for images or videos. */
function MediaInput({ value, onChange, kind, placeholder }: { value: string; onChange: (v: string) => void; kind: "image" | "video"; placeholder?: string }) {
  const toast = useToast();
  const storage = useStorageMode();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    const { url, error } = await upload(file, storage);
    setBusy(false);
    if (url) onChange(url);
    else toast({ tone: "error", title: "Upload failed", body: error });
    if (fileRef.current) fileRef.current.value = "";
  };
  return (
    <div className="flex gap-3">
      <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-md border border-[#e2ddd6] bg-[#f7f5f2]">
        <Thumb src={value} video={kind === "video"} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <input
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? (kind === "video" ? "YouTube / Vimeo link or video file URL" : "https://… or upload")}
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            hidden
            accept={kind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/gif,image/avif"}
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : kind === "video" ? "Upload video" : "Upload image"}
          </Button>
          {value && (
            <Button size="sm" variant="ghost" onClick={() => onChange("")}>
              Remove
            </Button>
          )}
          <span className="text-[0.7rem] text-[#7a7f8b]">{kind === "video" ? "MP4 / WebM / MOV up to 200 MB" : "JPG, PNG, WebP, GIF, AVIF up to 15 MB"}</span>
        </div>
      </div>
    </div>
  );
}

function RowTools({ i, n, move, remove }: { i: number; n: number; move: (from: number, to: number) => void; remove: () => void }) {
  return (
    <span className="flex shrink-0 gap-1">
      <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="grid size-7 place-items-center rounded border border-[#d6d1ca] bg-white text-xs disabled:opacity-30">
        ↑
      </button>
      <button type="button" aria-label="Move down" disabled={i === n - 1} onClick={() => move(i, i + 1)} className="grid size-7 place-items-center rounded border border-[#d6d1ca] bg-white text-xs disabled:opacity-30">
        ↓
      </button>
      <button type="button" aria-label="Remove" onClick={remove} className="grid size-7 place-items-center rounded border border-[#d6d1ca] bg-white text-xs text-[#ba0517]">
        ✕
      </button>
    </span>
  );
}

function moveItem<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

function TextBlocks({ items, onChange }: { items: TextItem[]; onChange: (v: TextItem[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={it.key} className="flex gap-2 rounded-md border border-[#ece8e2] bg-[#fbfaf8] p-2">
          <select
            aria-label="Block type"
            value={it.type}
            onChange={(e) => onChange(items.map((x) => (x.key === it.key ? { ...x, type: e.target.value as TextType } : x)))}
            className="h-9 shrink-0 rounded-md border border-[#d6d1ca] bg-white px-2 text-xs font-semibold text-[#0F2944]"
          >
            {TEXT_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
          <textarea
            aria-label={`${TEXT_TYPES.find((t) => t.type === it.type)?.label} text`}
            value={it.text}
            rows={it.type === "h" ? 1 : Math.min(8, Math.max(2, Math.ceil(it.text.length / 90)))}
            onChange={(e) => onChange(items.map((x) => (x.key === it.key ? { ...x, text: e.target.value } : x)))}
            className={`${inputCls} min-h-9 resize-y ${it.type === "h" ? "font-semibold" : ""} ${it.type === "quote" ? "italic" : ""}`}
            placeholder={it.type === "li" ? "Bullet / step text" : it.type === "h" ? "Sub-heading" : it.type === "quote" ? "Quoted text" : "Paragraph text"}
          />
          <RowTools i={i} n={items.length} move={(a, b) => onChange(moveItem(items, a, b))} remove={() => onChange(items.filter((x) => x.key !== it.key))} />
        </div>
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        {TEXT_TYPES.map((t) => (
          <Button key={t.type} size="sm" onClick={() => onChange([...items, { key: key(), type: t.type, text: "" }])}>
            + {t.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */

type Tab = "details" | "content" | "media" | "seo";

export function CaseStudyEditor({ record }: { record?: CaseStudy }) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState<CaseStudy | undefined>(record);
  const [form, setForm] = useState<Form>(() => fromRecord(record));
  const [baseline, setBaseline] = useState(() => JSON.stringify(toPayload(fromRecord(record))));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>("details");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const payload = useMemo(() => toPayload(form), [form]);
  const dirty = JSON.stringify(payload) !== baseline;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Slug follows the client name until it is edited by hand.
  const setClient = (client: string) => setForm((f) => ({ ...f, client, slug: f.slugTouched ? f.slug : slugify(client) }));

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useCallback(
    async (status?: "published" | "draft") => {
      setBusy(true);
      setErrors({});
      const body = { ...payload, ...(status && { status }) };
      const res = await fetch(saved ? `/api/cms/case-studies/${saved.id}` : "/api/cms/case-studies", {
        method: saved ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => null);
      setBusy(false);
      if (!res) return toast({ tone: "error", title: "Network error. Nothing was saved." });
      const json = await res.json().catch(() => ({}));
      if (res.status === 422) {
        setErrors(json.errors ?? {});
        setTab("details");
        return toast({ tone: "error", title: "Review the errors on this page.", body: Object.values(json.errors ?? {}).join(" ") });
      }
      if (!res.ok) return toast({ tone: "error", title: json.error ?? "Could not save." });

      const rec = json as CaseStudy;
      const next = fromRecord(rec);
      setSaved(rec);
      setForm(next);
      setBaseline(JSON.stringify(toPayload(next)));
      toast({
        tone: "success",
        title: saved ? `“${rec.client}” was saved.` : `Case study “${rec.client}” was created.`,
        body:
          rec.status === "published" ? (
            <a href={caseStudyHref(rec.slug)} target="_blank" rel="noreferrer" className="underline">
              Live at {caseStudyHref(rec.slug)}
            </a>
          ) : (
            "Saved as a draft: not visible on the site yet."
          ),
      });
      if (!saved) router.replace(`/admin/case-studies/${rec.id}`);
      router.refresh();
    },
    [payload, saved, router, toast],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!busy) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, busy]);

  const remove = async () => {
    if (!saved) return;
    setBusy(true);
    const res = await fetch(`/api/cms/case-studies/${saved.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return toast({ tone: "error", title: "Could not delete." });
    setBaseline(JSON.stringify(payload)); // nothing left to lose
    toast({ tone: "success", title: `“${saved.client}” was deleted.` });
    router.replace("/admin/case-studies");
    router.refresh();
  };

  const url = caseStudyHref(form.slug || slugify(form.client) || "…");
  const steps = form.solution.filter((b) => b.type === "li" && b.text.trim()).length;
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "details", label: "Details" },
    { id: "content", label: "Page content" },
    { id: "media", label: "Media", count: (form.cover ? 1 : 0) + (form.approachImage.src ? 1 : 0) + form.gallery.length },
    { id: "seo", label: "SEO" },
  ];

  return (
    <div className="mx-auto max-w-[90rem] space-y-4">
      {/* Highlights panel */}
      <Card bodyClass="p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <IconTile size="lg">{Icon.case}</IconTile>
            <div className="min-w-0">
              <p className="text-xs text-[#6b7080]">
                <Link href="/admin/case-studies" className="hover:underline">
                  Case Studies
                </Link>{" "}
                › {saved ? "Record" : "New"}
              </p>
              <h1 className="truncate text-xl font-semibold">{form.client || (saved ? saved.client : "New Case Study")}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {saved?.status === "published" && (
              <a href={caseStudyHref(saved.slug)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d6d1ca] bg-white px-4 text-sm font-medium text-[#0F2944] hover:bg-[#f7f5f2]">
                View page {Icon.ext}
              </a>
            )}
            {saved && (
              <Button onClick={() => setConfirmDelete(true)} disabled={busy}>
                Delete
              </Button>
            )}
            <Button variant="brand" onClick={() => save()} disabled={busy || (!dirty && !!saved)}>
              {busy ? "Saving…" : saved ? "Save" : "Create"}
            </Button>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-[#ece8e2] px-4 py-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[0.7rem] text-[#6b7080]">Status</dt>
            <dd className="mt-0.5">
              <Badge tone={form.status === "published" ? "success" : "warning"}>{form.status === "published" ? "Published" : "Draft"}</Badge>
              {dirty && <span className="ml-2 text-[0.7rem] font-medium text-[#b45309]">Unsaved changes</span>}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[0.7rem] text-[#6b7080]">Page URL</dt>
            <dd className="mt-0.5 truncate font-medium text-[#0F2944]">{url}</dd>
          </div>
          <div>
            <dt className="text-[0.7rem] text-[#6b7080]">Industry</dt>
            <dd className="mt-0.5">{form.industry || "—"}</dd>
          </div>
          <div>
            <dt className="text-[0.7rem] text-[#6b7080]">Last modified</dt>
            <dd className="mt-0.5">{saved ? <RelativeTime iso={saved.updatedAt} /> : "Not saved yet"}</dd>
          </div>
        </dl>
        {/* Path: publishing stage */}
        <div className="flex flex-wrap items-center gap-3 border-t border-[#ece8e2] px-4 py-3">
          <ol className="flex min-w-[15rem] flex-1 overflow-hidden rounded-full border border-[#e2ddd6] text-sm font-medium">
            {(["draft", "published"] as const).map((s, i) => {
              const active = form.status === s;
              const done = form.status === "published" && s === "draft";
              return (
                <li key={s} className="flex-1">
                  <button
                    type="button"
                    onClick={() => set("status", s)}
                    className={`relative h-9 w-full whitespace-nowrap px-6 transition-colors ${i === 0 ? "[clip-path:polygon(0_0,calc(100%-14px)_0,100%_50%,calc(100%-14px)_100%,0_100%)]" : "-ml-3 pl-8"} ${
                      active ? "bg-[#0F2944] text-white" : done ? "bg-[#2e844a] text-white" : "bg-[#f1eee9] text-[#4a4f5c] hover:bg-[#e8e4de]"
                    }`}
                  >
                    {done ? "✓ " : ""}
                    {s === "draft" ? "Draft" : (
                      <>
                        Published<span className="hidden sm:inline"> on /work</span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <Button variant="brand" className="w-full sm:w-auto" disabled={busy} onClick={() => save(form.status === "published" ? "draft" : "published")}>
            {form.status === "published" ? "Save & move to draft" : saved ? "Save & publish" : "Create & publish"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card bodyClass="p-0">
          <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-[#ece8e2] px-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap border-b-[3px] px-3 py-3 text-sm ${tab === t.id ? "border-[#FE9004] font-semibold text-[#0F2944]" : "border-transparent text-[#4a4f5c] hover:text-[#0F2944]"}`}
              >
                {t.label}
                {t.count ? <span className="ml-1.5 rounded-full bg-[#f1eee9] px-1.5 text-[0.7rem]">{t.count}</span> : null}
              </button>
            ))}
          </div>

          <div className="space-y-8 p-4 sm:p-6">
            {tab === "details" && (
              <>
                <FormSection title="Client & page" note="The hero of the case-study page and its card on /work.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Client name" required error={errors.client} hint="Hero line 1, the card title, and the default URL.">
                      <input className={inputCls} value={form.client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. CREX" />
                    </Field>
                    <Field label="Page URL" hint={<>Lowercase letters, numbers and dashes. Old URLs keep redirecting when you change it.</>}>
                      <div className="flex items-stretch overflow-hidden rounded-md border border-[#d6d1ca] focus-within:border-[#0F2944]">
                        <span className="flex items-center bg-[#f7f5f2] px-2.5 text-xs text-[#6b7080]">/work/case-study/</span>
                        <input
                          className="w-full px-2 py-2 text-sm outline-none"
                          value={form.slug}
                          onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value), slugTouched: true }))}
                          placeholder={slugify(form.client) || "client-name"}
                        />
                      </div>
                    </Field>
                    <Field label="Project title" required error={errors.title} hint="Hero line 2 (italic) and the card subtitle." className="sm:col-span-2">
                      <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Cricket Kahi Bhi, Kabhi Bhi campaign for a Cricket app" />
                    </Field>
                  </div>
                </FormSection>

                <FormSection title="Project facts" note="The facts row under the hero, and the filters on /work.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Industry">
                      <input className={inputCls} value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. Sports & Fantasy" />
                    </Field>
                    <Field label="Services" hint="Shown as “Services”. Falls back to the categories when empty.">
                      <input className={inputCls} value={form.service} onChange={(e) => set("service", e.target.value)} placeholder="e.g. Social Media" />
                    </Field>
                  </div>
                  <fieldset className="mt-4">
                    <legend className="mb-1.5 text-[0.75rem] font-medium text-[#555b68]">Categories (hero tags, “Focus” fact and /work filters)</legend>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => {
                        const on = form.categories.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            aria-pressed={on}
                            onClick={() => set("categories", on ? form.categories.filter((x) => x !== c) : [...form.categories, c])}
                            className={`h-8 rounded-full border px-3 text-sm transition-colors ${on ? "border-[#0F2944] bg-[#0F2944] text-white" : "border-[#d6d1ca] bg-white text-[#4a4f5c] hover:border-[#0F2944]"}`}
                          >
                            {on ? "✓ " : ""}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div className="mt-5 space-y-3">
                    <Toggle checked={form.concept} onChange={(v) => set("concept", v)} label="Concept tweak (self-initiated work, not a client brief)" />
                    <div className="flex flex-wrap items-center gap-4">
                      <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Feature in “Selected work” on /work" />
                      {form.featured && (
                        <label className="flex items-center gap-2 text-sm text-[#4a4f5c]">
                          Position
                          <input type="number" min={1} max={50} value={form.featuredOrder} onChange={(e) => set("featuredOrder", Number(e.target.value))} className={`${inputCls} w-20 py-1`} />
                        </label>
                      )}
                    </div>
                    <p className="text-[0.72rem] text-[#7a7f8b]">Not featured: the case study is listed in “More work · The full archive” on /work. New case studies appear first.</p>
                  </div>
                </FormSection>

                <FormSection title="Result metric" note="The big number card in the Results section. Leave empty to hide it.">
                  <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                    <Field label="Value">
                      <input className={inputCls} value={form.metricValue} onChange={(e) => set("metricValue", e.target.value)} placeholder="e.g. 68%" />
                    </Field>
                    <Field label="Label">
                      <input className={inputCls} value={form.metricLabel} onChange={(e) => set("metricLabel", e.target.value)} placeholder="e.g. growth in organic traffic" />
                    </Field>
                  </div>
                </FormSection>

                <FormSection title="Client testimonial" note="“In their words” card. Leave empty to use a matching quote from the testimonials page, if any.">
                  <Field label="Quote">
                    <textarea rows={3} className={inputCls} value={form.tQuote} onChange={(e) => set("tQuote", e.target.value)} />
                  </Field>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Name">
                      <input className={inputCls} value={form.tName} onChange={(e) => set("tName", e.target.value)} />
                    </Field>
                    <Field label="Role, company">
                      <input className={inputCls} value={form.tRole} onChange={(e) => set("tRole", e.target.value)} />
                    </Field>
                  </div>
                </FormSection>
              </>
            )}

            {tab === "content" &&
              SECTIONS.map((s) => (
                <FormSection
                  key={s.id}
                  title={
                    <>
                      <span className="mr-2 text-[#b45309]">{s.index}</span>
                      {s.label}
                      <span className="ml-2 font-normal text-[#7a7f8b]">· “{s.heading}”</span>
                    </>
                  }
                  note={s.id === "solution" ? `${s.hint} ${steps} step card${steps === 1 ? "" : "s"} so far.` : s.hint}
                >
                  <TextBlocks items={form[s.id]} onChange={(v) => set(s.id, v)} />
                </FormSection>
              ))}

            {tab === "media" && (
              <>
                <FormSection title="Cover image" note="Hero image of the page, the card image on /work, and the share image. Landscape, at least 1600px wide.">
                  <MediaInput kind="image" value={form.cover} onChange={(v) => set("cover", v)} />
                </FormSection>
                <FormSection title="Approach image" note="Shown beside “Our approach”. Uses the cover image when empty.">
                  <MediaInput kind="image" value={form.approachImage.src} onChange={(v) => set("approachImage", { ...form.approachImage, src: v })} />
                  <Field label="Alt text" className="mt-3" hint="Describe the image for screen readers.">
                    <input className={inputCls} value={form.approachImage.alt} onChange={(e) => set("approachImage", { ...form.approachImage, alt: e.target.value })} />
                  </Field>
                </FormSection>
                <FormSection
                  title="Work showcase"
                  note="The “The work, up close” gallery, in this order: the first image runs full width, then two-thirds + one-third, then rows of three. Videos always take a full 16:9 row. Hidden when empty."
                >
                  <div className="space-y-3">
                    {form.gallery.map((m, i) => (
                      <div key={m.key} className="rounded-md border border-[#ece8e2] bg-[#fbfaf8] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge tone={m.type === "video" ? "navy" : "ember"}>
                            {m.type === "video" ? "Video" : "Image"} {i + 1}
                          </Badge>
                          <RowTools
                            i={i}
                            n={form.gallery.length}
                            move={(a, b) => set("gallery", moveItem(form.gallery, a, b))}
                            remove={() => set("gallery", form.gallery.filter((x) => x.key !== m.key))}
                          />
                        </div>
                        <MediaInput kind={m.type} value={m.src} onChange={(v) => set("gallery", form.gallery.map((x) => (x.key === m.key ? { ...x, src: v } : x)))} />
                        <Field label={m.type === "video" ? "Video title" : "Alt text"} className="mt-3">
                          <input className={inputCls} value={m.label} onChange={(e) => set("gallery", form.gallery.map((x) => (x.key === m.key ? { ...x, label: e.target.value } : x)))} />
                        </Field>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => set("gallery", [...form.gallery, { key: key(), type: "image", src: "", label: "" }])}>
                        + Image
                      </Button>
                      <Button size="sm" onClick={() => set("gallery", [...form.gallery, { key: key(), type: "video", src: "", label: "" }])}>
                        + Video
                      </Button>
                    </div>
                  </div>
                </FormSection>
              </>
            )}

            {tab === "seo" && (
              <FormSection title="Search & sharing" note="What Google and social previews show for this page.">
                <div className="space-y-4">
                  <Field label="Meta title" hint={`${form.metaTitle.length}/60 characters. Defaults to “${form.client || "Client"}: ${form.title || "Title"}”.`}>
                    <input className={inputCls} value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
                  </Field>
                  <Field label="Meta description" hint={`${form.description.length}/160 characters.`}>
                    <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
                  </Field>
                  <div className="rounded-md border border-[#ece8e2] p-4">
                    <p className="text-xs text-[#6b7080]">Google preview</p>
                    <p className="mt-1 truncate text-[1.05rem] text-[#1a0dab]">{form.metaTitle || `${form.client || "Client"}: ${form.title || "Title"}`}</p>
                    <p className="text-xs text-[#006621]">minimaltweaks.com{url}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{form.description || "Add a meta description."}</p>
                  </div>
                </div>
              </FormSection>
            )}
          </div>
        </Card>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card title="Card preview" icon={<IconTile size="sm" tone="navy">{Icon.case}</IconTile>} bodyClass="p-3">
            <div className="overflow-hidden rounded-xl border border-[#e2ddd6] bg-[#f3f3f2] p-1.5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#0b0b0b]">
                {form.cover && <Thumb src={form.cover} />}
              </div>
              <div className="px-2 pb-2 pt-3">
                <p className="font-semibold tracking-tight">{form.client || "Client name"}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-[#5e5e5c]">{form.title || "Project title"}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {form.categories.map((c) => (
                    <Badge key={c}>{c}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          <Card title="How the page is built" bodyClass="p-4">
            <ol className="space-y-2.5 text-[0.8rem] text-[#3a3f4b]">
              {[
                ["Hero", "Client + title, category tags, cover image"],
                ["Facts row", "Client, industry, services, focus, type"],
                ["01 The brief", "Brief text"],
                ["02 Our approach", "Approach image + approach text"],
                ["03 Process", "Dark band: process paragraphs + numbered step cards from bullets"],
                ["04 Work showcase", "Gallery images and videos"],
                ["05 Results", "Result metric + results text"],
                ["In their words", "Testimonial"],
                ["Next case", "Automatic: the next case study on /work"],
              ].map(([a, b]) => (
                <li key={a} className="flex gap-2">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#FE9004]" />
                  <span>
                    <span className="font-semibold">{a}:</span> {b}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
          {saved && (
            <Card title="Record info" bodyClass="space-y-1.5 p-4 text-[0.8rem] text-[#3a3f4b]">
              <p>
                Created <RelativeTime iso={saved.createdAt} />
              </p>
              <p>
                Modified <RelativeTime iso={saved.updatedAt} />
              </p>
              {saved.legacySlugs.length > 0 && <p className="break-all text-[#6b7080]">Redirects from: {saved.legacySlugs.map((s) => `/case-studies/${s}`).join(", ")}</p>}
              <p className="text-[#9a9ea8]">ID {saved.id}</p>
            </Card>
          )}
        </aside>
      </div>

      <Modal
        open={confirmDelete}
        title="Delete case study"
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        Delete <strong>{saved?.client}</strong>? Its page and its card on /work will be removed. This can&apos;t be undone.
      </Modal>
    </div>
  );
}

function FormSection({ title, note, children }: { title: React.ReactNode; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="rounded-md bg-[#f3f1ee] px-3 py-2 text-sm font-semibold text-[#181b25]">{title}</h3>
      {note && <p className="mt-2 px-1 text-[0.75rem] text-[#6b7080]">{note}</p>}
      <div className="mt-4 px-1">{children}</div>
    </section>
  );
}
