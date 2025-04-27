import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { CallToActionSection } from "@/components/sections/call-to-action-section";

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container flex-1 pt-32 pb-16">
        <HeroSection />
        <FeaturesSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
