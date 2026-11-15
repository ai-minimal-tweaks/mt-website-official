"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { caseStudyHref, type CaseStudy } from "@/content/case-studies";
import { Badge, Button, Card, Icon, IconTile, Modal, inputCls, useToast } from "./ui";
import { RelativeTime } from "./RelativeTime";

const VIEWS = [
  { key: "all", label: "All Case Studies" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "featured", label: "Featured on /work" },
] as const;
type ViewKey = (typeof VIEWS)[number]["key"];
type SortKey = "order" | "client" | "updatedAt";

/** CRM-style list view: object header, list-view switcher, search, sortable table with row actions. */
export function CaseStudyList({ initial }: { initial: CaseStudy[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [view, setView] = useState<ViewKey>("all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "order", dir: 1 });
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<CaseStudy | null>(null);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQ(params.get("q") ?? ""), [params]);
  useEffect(() => {
    const close = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && setOpenMenu(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows
      .map((r, order) => ({ r, order }))
      .filter(({ r }) =>
        view === "published" ? r.status === "published" : view === "draft" ? r.status === "draft" : view === "featured" ? r.featured >= 0 && r.status === "published" : true,
      )
      .filter(({ r }) => !needle || [r.client, r.title, r.industry, r.service, r.slug, ...r.categories].join(" ").toLowerCase().includes(needle));
    return list.sort((a, b) => {
      const v = sort.key === "order" ? a.order - b.order : sort.key === "client" ? a.r.client.localeCompare(b.r.client) : a.r.updatedAt.localeCompare(b.r.updatedAt);
      return v * sort.dir;
    });
  }, [rows, view, q, sort]);

  const sortBy = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "updatedAt" ? -1 : 1 }));
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? " ▲" : " ▼") : "");

  const remove = async () => {
    if (!confirm) return;
    setBusy(true);
    const res = await fetch(`/api/cms/case-studies/${confirm.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setRows((cur) => cur.filter((r) => r.id !== confirm.id));
      toast({ tone: "success", title: `“${confirm.client}” was deleted.`, body: "It no longer appears on /work." });
      router.refresh();
    } else toast({ tone: "error", title: "Could not delete the case study." });
    setConfirm(null);
  };

  return (
    <div className="mx-auto max-w-[90rem]">
      <Card bodyClass="p-0">
        {/* Object home header */}
        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <IconTile size="lg">{Icon.case}</IconTile>
            <div>
              <p className="text-xs text-[#6b7080]">Case Studies</p>
              <div className="flex items-center gap-1">
                <select
                  aria-label="List view"
                  value={view}
                  onChange={(e) => setView(e.target.value as ViewKey)}
                  className="-ml-1 cursor-pointer rounded bg-transparent px-1 text-xl font-semibold outline-none hover:bg-black/5"
                >
                  {VIEWS.map((v) => (
                    <option key={v.key} value={v.key}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/work" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d6d1ca] bg-white px-4 text-sm font-medium text-[#0F2944] hover:bg-[#f7f5f2]">
              View /work {Icon.ext}
            </a>
            <Link href="/admin/case-studies/new" className="inline-flex h-9 items-center rounded-md border border-[#0F2944] bg-[#0F2944] px-4 text-sm font-medium text-white hover:bg-[#173a5f]">
              New
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3">
          <p className="text-xs text-[#6b7080]">
            {shown.length} item{shown.length === 1 ? "" : "s"} · Sorted by {sort.key === "order" ? "/work order" : sort.key === "client" ? "client" : "last modified"}
          </p>
          <label className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7f8b]">{Icon.search}</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this list…" aria-label="Search this list" className={`${inputCls} h-8 py-1 pl-9`} />
          </label>
        </div>

        <div className="overflow-x-auto border-t border-[#e2ddd6]">
          <table className="w-full min-w-[60rem] border-collapse text-sm">
            <thead>
              <tr className="bg-[#f7f5f2] text-left text-xs font-semibold text-[#4a4f5c]">
                <th className="w-12 border-b border-[#e2ddd6] px-3 py-2">
                  <button type="button" onClick={() => sortBy("order")}>#{arrow("order")}</button>
                </th>
                <th className="border-b border-[#e2ddd6] px-3 py-2">
                  <button type="button" onClick={() => sortBy("client")}>Client{arrow("client")}</button>
                </th>
                <th className="border-b border-[#e2ddd6] px-3 py-2">Title</th>
                <th className="border-b border-[#e2ddd6] px-3 py-2">Industry</th>
                <th className="border-b border-[#e2ddd6] px-3 py-2">Categories</th>
                <th className="border-b border-[#e2ddd6] px-3 py-2">Status</th>
                <th className="border-b border-[#e2ddd6] px-3 py-2">Featured</th>
                <th className="border-b border-[#e2ddd6] px-3 py-2">
                  <button type="button" onClick={() => sortBy("updatedAt")}>Last modified{arrow("updatedAt")}</button>
                </th>
                <th className="w-12 border-b border-[#e2ddd6] px-3 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ r, order }) => (
                <tr key={r.id} className="group border-b border-[#ece8e2] hover:bg-[#fbfaf8]">
                  <td className="px-3 py-2.5 text-xs text-[#7a7f8b]">{order + 1}</td>
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/case-studies/${r.id}`} className="font-semibold text-[#0F2944] hover:underline">
                      {r.client}
                    </Link>
                    <span className="block text-[0.7rem] text-[#9a9ea8]">/work/case-study/{r.slug}</span>
                  </td>
                  <td className="max-w-[22rem] px-3 py-2.5">
                    <span className="line-clamp-2 text-[#2b2f3a]">{r.title}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[#4a4f5c]">{r.industry || "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex flex-wrap gap-1">
                      {r.categories.length ? r.categories.map((c) => <Badge key={c} tone="navy">{c}</Badge>) : <span className="text-[#9a9ea8]">—</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone={r.status === "published" ? "success" : "warning"}>{r.status === "published" ? "Published" : "Draft"}</Badge>
                  </td>
                  <td className="px-3 py-2.5">{r.featured >= 0 ? <Badge tone="ember">★ #{r.featured + 1}</Badge> : <span className="text-[#9a9ea8]">—</span>}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-[#4a4f5c]">
                    <RelativeTime iso={r.updatedAt} />
                  </td>
                  <td className="relative px-3 py-2.5">
                    <button
                      type="button"
                      aria-label={`Actions for ${r.client}`}
                      aria-haspopup="menu"
                      onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                      className="grid size-7 place-items-center rounded border border-[#d6d1ca] bg-white text-[#4a4f5c] hover:bg-[#f7f5f2]"
                    >
                      ▾
                    </button>
                    {openMenu === r.id && (
                      <div ref={menuRef} role="menu" className="absolute right-3 top-11 z-20 w-40 overflow-hidden rounded-md border border-[#e2ddd6] bg-white py-1 text-sm shadow-xl">
                        <Link role="menuitem" href={`/admin/case-studies/${r.id}`} className="block px-3 py-1.5 hover:bg-[#f7f5f2]">
                          Edit
                        </Link>
                        {r.status === "published" && (
                          <a role="menuitem" href={caseStudyHref(r.slug)} target="_blank" rel="noreferrer" className="block px-3 py-1.5 hover:bg-[#f7f5f2]">
                            View page
                          </a>
                        )}
                        <button role="menuitem" type="button" onClick={() => (setConfirm(r), setOpenMenu(null))} className="block w-full px-3 py-1.5 text-left text-[#ba0517] hover:bg-[#f7f5f2]">
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-16 text-center text-sm text-[#6b7080]">
                    No case studies match this view.{" "}
                    <Link href="/admin/case-studies/new" className="font-medium text-[#0F2944] underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!confirm}
        title="Delete case study"
        onClose={() => setConfirm(null)}
        footer={
          <>
            <Button onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        Delete <strong>{confirm?.client}</strong>? Its page and its card on /work will be removed. This can&apos;t be undone.
      </Modal>
    </div>
  );
}
