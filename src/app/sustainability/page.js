import Link from "next/link";

export const metadata = {
  title: "Sustainability | Azhagii",
  description: "Learn about Azhagii's commitment to sustainable and mindful fashion.",
};

export default function SustainabilityPage() {
  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <h1 className="font-headline text-4xl md:text-5xl mb-12 tracking-tight">Sustainability</h1>
      
      <div className="prose prose-sm md:prose-base text-on-surface-variant font-label tracking-wide space-y-8">
        <p>
          At Azhagii, we believe that true elegance shouldn't come at the expense of our planet. Our commitment to sustainability is woven into every garment we create, from the initial sketch to the final stitch.
        </p>

        <h2 className="font-headline text-2xl text-on-surface mt-12 mb-6">Mindful Materials</h2>
        <p>
          We carefully source our fabrics from ethical suppliers who share our values. Our collections heavily feature organic cotton, peace silk, and recycled materials that minimize our environmental footprint.
        </p>

        <h2 className="font-headline text-2xl text-on-surface mt-12 mb-6">Ethical Craftsmanship</h2>
        <p>
          Every piece is crafted in small batches by skilled artisans. We ensure fair wages, safe working conditions, and respect for traditional crafting techniques that have been passed down through generations.
        </p>

        <h2 className="font-headline text-2xl text-on-surface mt-12 mb-6">Zero Waste Initiative</h2>
        <p>
          We are continuously working towards a zero-waste production model. Fabric scraps are upcycled into accessories, and our packaging is entirely biodegradable or recyclable.
        </p>

        <div className="mt-16 pt-8 border-t border-outline-variant/20">
          <Link href="/shop" className="text-secondary hover:underline font-bold uppercase text-xs tracking-widest">
            Explore the Collection
          </Link>
        </div>
      </div>
    </main>
  );
}
