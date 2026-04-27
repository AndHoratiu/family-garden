import { products } from "@/lib/products-data";

export async function generateMetadata({ params }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) {
    return { title: "Produs inexistent" };
  }
  return {
    title: `${product.name} – ${product.price.toFixed(2)} ${product.unit}`,
    description: `${product.description} Cultivat local de Family Garden în Vințu de Jos, Alba.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default function Layout({ children }) {
  return children;
}
