import { AdminShell } from "@/components/admin/AdminShell";
import { storageMode } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell storage={storageMode()}>{children}</AdminShell>;
}
