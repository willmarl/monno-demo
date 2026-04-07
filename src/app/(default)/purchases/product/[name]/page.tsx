// Just here as temporary placeholder. should not put paywalled data bundled in frontend

import { ProductSlugPage } from "@/components/pages/purchases/product/ProductSlugPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Details",
};

export function generateStaticParams() {
  return [{ name: "demo" }];
}

export default function page() {
  return <ProductSlugPage />;
}
