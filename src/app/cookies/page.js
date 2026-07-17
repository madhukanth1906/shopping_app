export const metadata = {
  title: "Cookies Policy | Azhagii",
  description: "Azhagii Cookies Policy.",
};

export default function CookiesPage() {
  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <h1 className="font-headline text-4xl md:text-5xl mb-12 tracking-tight">Cookies Policy</h1>
      
      <div className="prose prose-sm md:prose-base text-on-surface-variant font-label tracking-wide space-y-6">
        <p className="text-sm opacity-70 mb-8">Last Updated: July 2026</p>
        
        <h2 className="font-headline text-2xl text-on-surface mt-8 mb-4">What Are Cookies</h2>
        <p>
          As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies.
        </p>

        <h2 className="font-headline text-2xl text-on-surface mt-8 mb-4">How We Use Cookies</h2>
        <p>
          We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account related cookies:</strong> If you create an account with us, then we will use cookies for the management of the signup process and general administration.</li>
          <li><strong>Orders processing related cookies:</strong> This site offers e-commerce or payment facilities and some cookies are essential to ensure that your order is remembered between pages so that we can process it properly.</li>
          <li><strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it.</li>
        </ul>

        <h2 className="font-headline text-2xl text-on-surface mt-8 mb-4">Disabling Cookies</h2>
        <p>
          You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.
        </p>
      </div>
    </main>
  );
}
