import { Suspense } from "react";
import Layout from "@/components/layout/default/Layout";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Layout>
        <Suspense fallback={null}>{children}</Suspense>
      </Layout>
    </div>
  );
}
