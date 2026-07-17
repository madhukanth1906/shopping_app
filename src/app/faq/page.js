export const metadata = {
  title: "FAQ | Azhagii",
  description: "Frequently asked questions about Azhagii products and services.",
};

export default function FAQPage() {
  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <h1 className="font-headline text-4xl md:text-5xl mb-12 tracking-tight">Frequently Asked Questions</h1>
      
      <div className="prose prose-sm md:prose-base text-on-surface-variant font-label tracking-wide space-y-8">
        
        <div className="space-y-4">
          <h2 className="font-headline text-xl text-on-surface">Where do you ship?</h2>
          <p>We currently ship worldwide. Please see our Shipping & Returns page for detailed timelines and rates based on your region.</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-headline text-xl text-on-surface">How can I track my order?</h2>
          <p>Once your order has been dispatched, you will receive a shipping confirmation email containing your tracking number and a link to track the parcel.</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-headline text-xl text-on-surface">Are your materials sustainably sourced?</h2>
          <p>Yes. Sustainability is at the core of Azhagii. We prioritize organic, recycled, and ethically sourced materials. Read more on our Sustainability page.</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-headline text-xl text-on-surface">What is your return policy?</h2>
          <p>We accept returns of unworn and unwashed items within 14 days of delivery. Custom or final sale items are not eligible for return.</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-headline text-xl text-on-surface">How do I contact customer support?</h2>
          <p>You can reach our client care team at support@azhagii.me. We aim to respond within 24 hours on business days.</p>
        </div>
      </div>
    </main>
  );
}
