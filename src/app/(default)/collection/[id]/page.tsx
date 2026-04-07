import { CollectionPage } from "@/components/pages/collection/CollectionPage";

export function generateStaticParams() {
  return Array.from({ length: 5 }, (_, i) => ({ id: String(i + 1) }));
}

export default async function page({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  return <CollectionPage id={id} />;
}
