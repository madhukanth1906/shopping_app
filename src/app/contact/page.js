export const metadata = {
  title: "Contact Us | Azhagii",
  description: "Get in touch with the Azhagii team.",
};

export default function ContactPage() {
  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <h1 className="font-headline text-4xl md:text-5xl mb-12 tracking-tight">Contact Us</h1>
      
      <div className="prose prose-sm md:prose-base text-on-surface-variant font-label tracking-wide space-y-8">
        <p>
          We're here to help. Whether you have a question about an order, need styling advice, or want to know more about our sustainability practices, our Client Care team is always happy to assist.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          <div>
            <h2 className="font-headline text-2xl text-on-surface mb-4">Email Us</h2>
            <p className="mb-2">For general inquiries and support:</p>
            <a href="mailto:support@azhagii.me" className="text-secondary hover:underline font-bold">
              support@azhagii.me
            </a>
            
            <p className="mt-6 mb-2">For press and collaborations:</p>
            <a href="mailto:hello@azhagii.me" className="text-secondary hover:underline font-bold">
              hello@azhagii.me
            </a>
          </div>

          <div>
            <h2 className="font-headline text-2xl text-on-surface mb-4">Hours of Operation</h2>
            <p>Monday – Friday</p>
            <p>9:00 AM – 6:00 PM (IST)</p>
            <p className="mt-4 text-sm opacity-80">
              We aim to respond to all inquiries within 24-48 business hours.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
