"use client";

import { use } from "react";
import ProductForm from "@/components/admin/product-form";

export default function EditProductPage({ params }) {
  const { id } = use(Promise.resolve(params));
  return <ProductForm mode="edit" productId={id} />;
}
