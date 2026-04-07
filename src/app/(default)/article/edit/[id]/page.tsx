import { EditArticlePage } from "@/components/pages/article/EditArticlePage";
import { requireAuth } from "@/features/auth/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Article",
};

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }));
}

export default async function page() {
  const user = await requireAuth();

  return <EditArticlePage />;
}
