import { ArticlePage } from "@/components/pages/article/ArticlePage";
import type { Metadata } from "next";
import { getServerUser } from "@/features/auth/server";
import { PublicArticleSearchParams } from "@/types/search-params";

export const metadata: Metadata = {
  title: "Articles",
};

export default async function page() {
  const user = await getServerUser();
  const params: any = {};

  return (
    <div>
      <ArticlePage user={user} searchParams={params} />
    </div>
  );
}
