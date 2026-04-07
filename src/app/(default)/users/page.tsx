import { UsersPage } from "@/components/pages/users/UsersPage";
import { PublicUserSearchParams } from "@/types/search-params";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
};
export default async function page() {
  const params: any = {};

  return <UsersPage searchParams={params} />;
}
