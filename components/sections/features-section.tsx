const features = [
  {
    title: "Smart Review Scheduling",
    description:
      "Our SM-2 algorithm adapts to your learning pace, optimizing review intervals for maximum retention.",
  },
  {
    title: "Problem Tracking",
    description:
      "Centralize your LeetCode practice with detailed progress tracking and performance metrics.",
  },
  {
    title: "Progress Sharing",
    description:
      "Share your learning journey with peers or mentors while maintaining privacy control.",
  },
] as const;

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <h2 className="text-3xl font-bold text-center mb-16">
        Why Choose LeetCall?
      </h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
