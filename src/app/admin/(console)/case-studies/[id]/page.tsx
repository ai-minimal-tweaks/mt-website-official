import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getById } from "@/lib/cms/store";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getById((await params).id)?.client ?? "Case Study" };
}

export default async function EditCaseStudyPage({ params }: Props) {
  const record = getById((await params).id);
  if (!record) notFound();
  // Keyed by id so moving between records resets the form.
  return <CaseStudyEditor key={record.id} record={record} />;
}
