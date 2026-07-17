import Link from "next/link";

export const metadata = {
  title: "Shipping & Returns | Azhagii",
  description: "Information about shipping policies and return procedures at Azhagii.",
};

export default function ShippingReturnsPage() {
  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <h1 className="font-headline text-4xl md:text-5xl mb-12 tracking-tight">Shipping & Returns</h1>
      
      <div className="prose prose-sm md:prose-base text-on-surface-variant font-label tracking-wide space-y-8">
        <h2 className="font-headline text-2xl text-on-surface mb-6">Shipping Information</h2>
        <p>
          We offer worldwide shipping. All orders are processed within 1-3 business days. You will receive a tracking number via email once your order has been dispatched.
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-4">
          <li><strong>Domestic Standard:</strong> 3-5 business days (Free over $150)</li>
          <li><strong>Domestic Express:</strong> 1-2 business days ($15.00)</li>
          <li><strong>International:</strong> 7-14 business days (Calculated at checkout)</li>
        </ul>

        <h2 className="font-headline text-2xl text-on-surface mt-12 mb-6">Return Policy</h2>
        <p>
          We accept returns within 14 days of delivery. Items must be unworn, unwashed, and have all original tags attached.
        </p>
        <p>
          To initiate a return, please visit our Returns Portal or contact our client care team. Please note that return shipping costs are the responsibility of the customer unless the item is faulty.
        </p>

        <h2 className="font-headline text-2xl text-on-surface mt-12 mb-6">Refunds</h2>
        <p>
          Once your return is received and inspected, we will send you an email notification. Approved refunds will be processed to your original method of payment within 5-10 business days.
        </p>

        <div className="mt-16 pt-8 border-t border-outline-variant/20">
          <Link href="/contact" className="text-secondary hover:underline font-bold uppercase text-xs tracking-widest">
            Contact Client Care
          </Link>
        </div>
      </div>
    </main>
  );
}
