"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started.",
    features: ["5 AI matches per day", "Basic earnings tracking", "Community support"],
    buttonText: "Current Plan",
    priceId: null,
    premium: false,
  },
  {
    name: "Premium",
    price: "9.99",
    description: "For serious hustle optimizers.",
    features: ["Unlimited AI matches", "Advanced income insights", "Priority recommendations", "Tax estimate calculator", "Priority support"],
    buttonText: "Upgrade Now",
    priceId: "price_HUSTLE_PREMIUM", // Replace with actual Stripe price ID
    premium: true,
  },
];

export default function PricingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ priceId: "price_HUSTLE_PREMIUM" }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12 py-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Choose the plan that fits your goals. Upgrade any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.premium ? "border-primary shadow-lg scale-105" : ""}>
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-4xl font-bold">${plan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.premium ? "default" : "outline"}
                disabled={!plan.premium || loading}
                onClick={plan.premium ? handleUpgrade : undefined}
              >
                {loading && plan.premium ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
