import { getServerUser } from "@/features/auth/server";
import { SpecificPost } from "@/components/pages/post/SpecificPost";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts",
};

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }));
}
export default async function page() {
  const user = await getServerUser();

  return <SpecificPost user={user} />;
}
