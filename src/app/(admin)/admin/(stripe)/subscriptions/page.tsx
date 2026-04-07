import { AdminSubscriptionsPage } from "@/components/pages/admin/stripe/subscription/AdminSubscriptionsPage";
import { AdminSubscriptionsSearchParams } from "@/types/search-params";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions",
};
export default async function page() {
  const params: any = {};
  return (
    <div>
      <AdminSubscriptionsPage searchParams={params} />
    </div>
  );
}
