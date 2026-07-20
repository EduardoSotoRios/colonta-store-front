import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ValueActions from "@/components/ValueActions";
import ProductsSection from "@/components/ProductsSection";
import Inspiration from "@/components/Inspiration";

export const revalidate = 0;

export default function Page() {
  return (
    <>
      <main>
        <Hero />
        <Categories />
        <ValueActions />
        <ProductsSection />
        <Inspiration />
      </main>
    </>
  );
}