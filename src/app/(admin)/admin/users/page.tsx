import { AdminUserPage } from "@/components/pages/admin/users/AdminUserPage";
import { AdminUserSearchParams } from "@/types/search-params";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
};
export default async function page() {
  const params: any = {};
  return <AdminUserPage searchParams={params} />;
}
