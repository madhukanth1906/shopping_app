export const metadata = {
  title: "Terms of Service | Azhagii",
  description: "Azhagii Terms of Service.",
};

export default function TermsOfServicePage() {
  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <h1 className="font-headline text-4xl md:text-5xl mb-12 tracking-tight">Terms of Service</h1>
      
      <div className="prose prose-sm md:prose-base text-on-surface-variant font-label tracking-wide space-y-6">
        <p className="text-sm opacity-70 mb-8">Last Updated: July 2026</p>
        
        <h2 className="font-headline text-2xl text-on-surface mt-8 mb-4">1. Agreement to Terms</h2>
        <p>
          By accessing or using our website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our service.
        </p>

        <h2 className="font-headline text-2xl text-on-surface mt-8 mb-4">2. Intellectual Property</h2>
        <p>
          The service and its original content, features, and functionality are and will remain the exclusive property of Azhagii and its licensors. The service is protected by copyright, trademark, and other laws of both the country of operations and foreign countries.
        </p>

        <h2 className="font-headline text-2xl text-on-surface mt-8 mb-4">3. Purchases</h2>
        <p>
          If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, and your billing address.
        </p>

        <h2 className="font-headline text-2xl text-on-surface mt-8 mb-4">4. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
        </p>
      </div>
    </main>
  );
}
