import ProductForm from "@/components/admin/product-form";

export const metadata = { title: "Adaugă produs", robots: { index: false, follow: false } };

export default function NewProductPage() {
  return <ProductForm mode="new" />;
}
