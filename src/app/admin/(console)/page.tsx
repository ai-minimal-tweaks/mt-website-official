import type { Metadata } from "next";
import Link from "next/link";
import { listAll } from "@/lib/cms/store";
import { Card, IconTile, Badge } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";
import { RelativeTime } from "@/components/admin/RelativeTime";

export const metadata: Metadata = { title: "Home" };
export const dynamic = "force-dynamic";

export default function AdminHome() {
  const all = listAll();
  const published = all.filter((c) => c.status === "published");
  const recent = [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  const kpis = [
    { label: "Case studies", value: all.length, note: "All records" },
    { label: "Published", value: published.length, note: "Live on /work" },
    { label: "Drafts", value: all.length - published.length, note: "Hidden from the site" },
    { label: "Featured", value: published.filter((c) => c.featured >= 0).length, note: "In “Selected work”" },
  ];

  return (
    <div className="mx-auto max-w-[90rem] space-y-4">
      <Card bodyClass="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <IconTile tone="navy" size="lg">{Icon.home}</IconTile>
          <div>
            <p className="text-xs text-[#6b7080]">Tweaks CMS</p>
            <h1 className="text-xl font-semibold">Welcome back</h1>
          </div>
        </div>
        <Link href="/admin/case-studies/new" className="inline-flex h-9 items-center rounded-md border border-[#0F2944] bg-[#0F2944] px-4 text-sm font-medium text-white hover:bg-[#173a5f]">
          New case study
        </Link>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} bodyClass="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#6b7080]">{k.label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-[#0F2944]">{k.value}</p>
            <p className="mt-1 text-xs text-[#7a7f8b]">{k.note}</p>
          </Card>
        ))}
      </div>

      <Card
        title="Recently modified"
        icon={<IconTile size="sm">{Icon.case}</IconTile>}
        actions={<Link href="/admin/case-studies" className="text-sm font-medium text-[#0F2944] hover:underline">View all</Link>}
        bodyClass="divide-y divide-[#ece8e2]"
      >
        {recent.map((c) => (
          <Link key={c.id} href={`/admin/case-studies/${c.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#f7f5f2]">
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[#0F2944]">{c.client}</span>
              <span className="block truncate text-xs text-[#6b7080]">{c.title}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3 text-xs text-[#6b7080]">
              <Badge tone={c.status === "published" ? "success" : "warning"}>{c.status === "published" ? "Published" : "Draft"}</Badge>
              <RelativeTime iso={c.updatedAt} />
            </span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
