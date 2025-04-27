import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CallToActionSection = () => {
  return (
    <section className="py-24 text-center space-y-8">
      <h2 className="text-3xl font-bold">
        Ready to Improve Your Problem-Solving Skills?
      </h2>
      <p className="mx-auto max-w-[42rem] text-muted-foreground">
        Join LeetCall today and transform the way you practice coding problems.
      </p>
      <Link href="/sign-up">
        <Button size="lg" className="text-base">
          Start Your Journey
        </Button>
      </Link>
    </section>
  );
};
