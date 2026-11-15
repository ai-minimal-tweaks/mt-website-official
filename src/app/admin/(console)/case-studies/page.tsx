import type { Metadata } from "next";
import { Suspense } from "react";
import { listAll } from "@/lib/cms/store";
import { CaseStudyList } from "@/components/admin/CaseStudyList";

export const metadata: Metadata = { title: "Case Studies" };
export const dynamic = "force-dynamic";

export default function CaseStudiesPage() {
  return (
    <Suspense>
      <CaseStudyList initial={listAll()} />
    </Suspense>
  );
}
