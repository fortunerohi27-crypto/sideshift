"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("profiles").update({
        full_name: profile.full_name,
      }).eq("id", user?.id);

      if (error) throw error;
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and billing preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile?.full_name || ""}
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                  />
                </div>
                <Button type="submit" disabled={updating}>
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="font-bold">{profile?.is_premium ? "Premium Plan" : "Free Plan"}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.is_premium ? "Unlimited AI matches & insights" : "Limited access to features"}
                  </p>
                </div>
                {profile?.is_premium ? (
                  <Button variant="outline" size="sm">Manage Billing</Button>
                ) : (
                  <Button size="sm" onClick={() => router.push("/pricing")}>Upgrade</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
