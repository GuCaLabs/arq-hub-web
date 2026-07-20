import Demo from '@/components/demo/scroll-expansion-demo';
import { StickyFeatureSection } from '@/components/ui/sticky-scroll-cards-section';
import { PricingSection } from '@/components/ui/pricing-section';
import { Footer } from '@/components/ui/footer';

export default function Home() {
  return (
    <main className="w-full flex flex-col">
      <Demo />
      <StickyFeatureSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
