import { notFound, permanentRedirect } from "next/navigation";
import { caseStudyHref } from "@/content/case-studies";
import { findByLegacySlug } from "@/lib/cms/store";

/** Old /case-studies/<slug> URLs (the live site's, and any slug changed in the CMS) move permanently to /work/case-study/<client>. */
export default async function LegacyCaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const study = await findByLegacySlug((await params).slug);
  if (!study) notFound();
  permanentRedirect(caseStudyHref(study.slug));
}
