import Link from "next/link";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="py-24 text-center space-y-8">
      <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
        Master LeetCode Through
        <span className="text-primary block">Spaced Repetition</span>
      </h1>
      <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
        Enhance your problem-solving skills with our scientifically proven
        spaced repetition system. Track, review, and truly master LeetCode
        problems.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/sign-up">
          <Button size="lg" className="text-base">
            Get Started
          </Button>
        </Link>
        <Link href="#features">
          <Button size="lg" variant="outline" className="text-base">
            Learn More
          </Button>
        </Link>
      </div>
    </section>
  );
};
