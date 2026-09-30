"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, TrendingUp, Sparkles, ArrowRight, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total: 0, avgHourly: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Profile
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);

      // 2. Earnings Summary
      const { data: earns } = await supabase.from("earnings").select("amount, hourly_rate").eq("user_id", user.id);
      const total = earns?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
      const avg = earns?.length ? (earns.reduce((acc, curr) => acc + curr.hourly_rate, 0) / earns.length).toFixed(2) : "0.00";
      setSummary({ total, avgHourly: parseFloat(avg) });

      // 3. Top matches
      const { data: matches } = await supabase
        .from("user_matches")
        .select("*, opportunities(*)")
        .eq("user_id", user.id)
        .order("match_score", { ascending: false })
        .limit(3);

      setTopMatches(matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.full_name || "Hustler"} 👋</h1>
          <p className="text-muted-foreground">Here is your income and opportunity overview.</p>
        </div>
        <Link href="/earnings">
          <Button className="flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Log Earnings
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total tracked income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Hourly</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.avgHourly}/hr</div>
            <p className="text-xs text-muted-foreground">Across all hustles</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Match Quality</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {topMatches.length > 0 ? `${topMatches[0].match_score}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Top AI match score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Top Recommended Hustles</h2>
            <Link href="/opportunities" className="text-sm text-primary hover:underline flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {topMatches.length === 0 ? (
            <Card className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">No matches found yet.</p>
              <Link href="/opportunities">
                <Button variant="outline">Find Matches</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {topMatches.map(match => (
                <Card key={match.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {match.opportunities?.title[0]}
                    </div>
                    <div>
                      <p className="font-bold">{match.opportunities?.title}</p>
                      <p className="text-xs text-muted-foreground">{match.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{match.match_score}%</Badge>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start h-12" onClick={() => router.push("/earnings")}>
              <Wallet className="w-4 h-4 mr-2" /> Log Earnings
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => router.push("/opportunities")}>
              <Sparkles className="w-4 h-4 mr-2" /> Update Matches
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => router.push("/settings")}>
              <LayoutDashboard className="w-4 h-4 mr-2" /> Account Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
