import type { Metadata } from "next";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";

export const metadata: Metadata = { title: "New Case Study" };

export default function NewCaseStudyPage() {
  return <CaseStudyEditor />;
}
