import { AdminCommentPage } from "@/components/pages/admin/comments/AdminCommentPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comments",
};
export default async function page() {
  const params: any = {};
  return <AdminCommentPage searchParams={params} />;
}
