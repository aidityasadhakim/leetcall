import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { CallToActionSection } from "@/components/sections/call-to-action-section";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let workspaceId;
  if (user) {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_user_id", user.id)
      .single();
    if (data) {
      workspaceId = data.id;
    }
    if (error) {
      console.error("Error fetching workspace ID:", error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar workspaceId={workspaceId} />
      <main className="container flex-1 pt-32 pb-16">
        <HeroSection />
        <FeaturesSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
