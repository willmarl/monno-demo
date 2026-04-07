import { getServerUser } from "@/features/auth/server";
import { ArticleDetail } from "@/components/pages/article/ArticleDetail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
};

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }));
}
export default async function page() {
  const user = await getServerUser();

  return <ArticleDetail user={user} />;
}
