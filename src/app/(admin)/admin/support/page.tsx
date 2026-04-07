import { AdminTicketPage } from "@/components/pages/admin/support/AdminTicketPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Tickets",
};
export default async function page() {
  const params: any = {};
  return <AdminTicketPage searchParams={params} />;
}
