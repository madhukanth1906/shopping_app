export const metadata = {
  title: "Size Guide | Azhagii",
  description: "Find your perfect fit with the Azhagii size guide.",
};

export default function SizeGuidePage() {
  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <h1 className="font-headline text-4xl md:text-5xl mb-12 tracking-tight">Size Guide</h1>
      
      <div className="prose prose-sm md:prose-base text-on-surface-variant font-label tracking-wide space-y-8">
        <p>
          Our garments are designed with a modern, relaxed fit in mind. Please use the chart below to find your perfect size. All measurements are in inches.
        </p>

        <div className="overflow-x-auto mt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface">
                <th className="py-4 pr-4 font-bold uppercase text-xs tracking-widest">Size</th>
                <th className="py-4 px-4 font-bold uppercase text-xs tracking-widest">Bust</th>
                <th className="py-4 px-4 font-bold uppercase text-xs tracking-widest">Waist</th>
                <th className="py-4 px-4 font-bold uppercase text-xs tracking-widest">Hip</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-outline-variant/10">
                <td className="py-4 pr-4 font-bold">XS (0-2)</td>
                <td className="py-4 px-4">31-32</td>
                <td className="py-4 px-4">24-25</td>
                <td className="py-4 px-4">34-35</td>
              </tr>
              <tr className="border-b border-outline-variant/10">
                <td className="py-4 pr-4 font-bold">S (4-6)</td>
                <td className="py-4 px-4">33-35</td>
                <td className="py-4 px-4">26-28</td>
                <td className="py-4 px-4">36-38</td>
              </tr>
              <tr className="border-b border-outline-variant/10">
                <td className="py-4 pr-4 font-bold">M (8-10)</td>
                <td className="py-4 px-4">36-38</td>
                <td className="py-4 px-4">29-31</td>
                <td className="py-4 px-4">39-41</td>
              </tr>
              <tr className="border-b border-outline-variant/10">
                <td className="py-4 pr-4 font-bold">L (12-14)</td>
                <td className="py-4 px-4">39-41</td>
                <td className="py-4 px-4">32-34</td>
                <td className="py-4 px-4">42-44</td>
              </tr>
              <tr className="border-b border-outline-variant/10">
                <td className="py-4 pr-4 font-bold">XL (16)</td>
                <td className="py-4 px-4">42-44</td>
                <td className="py-4 px-4">35-37</td>
                <td className="py-4 px-4">45-47</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="font-headline text-2xl text-on-surface mt-12 mb-6">How to Measure</h2>
        <ul className="space-y-4">
          <li><strong>Bust:</strong> Measure under your arms, around the fullest part of your chest.</li>
          <li><strong>Waist:</strong> Measure around your natural waistline, keeping the tape a bit loose.</li>
          <li><strong>Hip:</strong> Measure around the fullest part of your body at the top of your leg.</li>
        </ul>
      </div>
    </main>
  );
}
