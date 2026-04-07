import { AdminCollectionPage } from "@/components/pages/admin/collections/AdminCollectionPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections",
};
export default async function page() {
  const params: any = {};
  return <AdminCollectionPage searchParams={params} />;
}
