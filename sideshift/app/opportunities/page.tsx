"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface Opportunity {
  id: string;
  title: string;
  platform: string;
  description: string;
  estimated_hourly: number;
  difficulty: string;
  category: string;
}

interface Match {
  opportunity_id: string;
  match_score: number;
  reason: string;
}

interface RankedOpportunity extends Opportunity {
  match_score: number;
  reason: string;
}

export default function OpportunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [opportunities, setOpportunities] = useState<RankedOpportunity[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 1. Get matches for the user
      const { data: matches, error: matchesError } = await supabase
        .from("user_matches")
        .select("*")
        .eq("user_id", user.id)
        .order("match_score", { ascending: false });

      if (matchesError) throw matchesError;

      // 2. Get opportunity details
      const { data: opps, error: oppsError } = await supabase
        .from("opportunities")
        .select("*");

      if (oppsError) throw oppsError;

      // 3. Combine and rank
      const ranked = (matches || []).map(m => {
        const details = opps?.find(o => o.id === m.opportunity_id);
        return details ? { ...details, match_score: m.match_score, reason: m.reason } : null;
      }).filter(Boolean) as RankedOpportunity[];

      setOpportunities(ranked);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const triggerAIMatch = async () => {
    setMatching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const response = await fetch("/api/openai/match", {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error("AI matching failed");

      toast({ title: "Matches Updated!", description: "Your opportunities have been re-ranked by AI." });
      await fetchMatches();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setMatching(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Best Matches</h1>
          <p className="text-muted-foreground">Ranked by AI based on your specific profile.</p>
        </div>
        <Button
          onClick={triggerAIMatch}
          disabled={matching}
          className="flex items-center gap-2"
        >
          {matching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Refresh AI Matches
        </Button>
      </div >

      {opportunities.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No matches yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Click "Refresh AI Matches" to let our engine analyze your skills and find the best hustles for you.
            </p>
          </div >
          <Button onClick={triggerAIMatch} variant="outline" className="mt-4">
            Run AI Analysis
          </Button>
        </div >
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="flex flex-col hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {opp.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-lg font-bold text-primary">
                    <TrendingUp className="w-4 h-4" />
                    {opp.match_score}%
                  </div >
                </div >
                <CardTitle className="text-xl">{opp.title}</CardTitle>
                <CardDescription className="font-medium text-foreground">{opp.platform}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {opp.description}
                </p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-l-4 border-primary">
                  <p className="text-xs italic text-foreground font-medium">
                    "{opp.reason}"
                  </p>
                </div >
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Est. Hourly</p>
                    <p className="font-bold">${opp.estimated_hourly}/hr</p>
                  </div >
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Difficulty</p>
                    <p className="font-bold">{opp.difficulty}</p>
                  </div >
                </div >
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div >
      )}
    </div >
  );
}
