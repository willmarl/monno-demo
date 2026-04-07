import { AdminPostPage } from "@/components/pages/admin/posts/AdminPostPage";
import { AdminPostSearchParams } from "@/types/search-params";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts",
};
export default async function page() {
  const params: any = {};
  return <AdminPostPage searchParams={params} />;
}
