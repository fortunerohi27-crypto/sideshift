import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Rocket, TrendingUp, Wallet, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Optimize Your <span className="text-primary">Side-Hustle</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop guessing. SideShift uses AI to find the highest-paying opportunities
            based on your specific skills, location, and availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 h-14">
                Get Started for Free <Rocket className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to earn more</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We've combined data and AI to take the friction out of starting a side hustle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-primary" />}
              title="AI-Powered Matching"
              description="Personalized recommendations that rank opportunities by realistic hourly earnings."
            />
            <FeatureCard
              icon={<Wallet className="w-6 h-6 text-primary" />}
              title="Earnings Tracker"
              description="Log your hours and income to see which hustles actually pay the most."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              title="Tax Estimates"
              description="Automatic basic tax calculations so you aren't surprised at the end of the year."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SideShift. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none bg-background shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
