import EditPostClient from "./EditPostClient";

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }));
}

export default function Page() {
  return <EditPostClient />;
}
