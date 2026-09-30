import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, TrendingUp, Wallet, Calendar, PieChart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer as RechartContainer } from "recharts";

interface Earning {
  id: string;
  opportunity_name: string;
  platform: string;
  hours: number;
  amount: number;
  date: string;
  hourly_rate: number;
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    opportunity_name: "",
    platform: "",
    hours: 0,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchEarnings();
  }, []);

  async function fetchEarnings() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("earnings")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setEarnings(data || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogEarnings(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const hourlyRate = form.amount / (form.hours || 1);

      const { error } = await supabase.from("earnings").insert({
        user_id: user.id,
        opportunity_name: form.opportunity_name,
        platform: form.platform,
        hours: form.hours,
        amount: form.amount,
        date: form.date,
        hourly_rate: hourlyRate,
      });

      if (error) throw error;

      toast({ title: "Earnings Logged!", description: `Added $${form.amount} to your tracker.` });
      setIsDialogOpen(false);
      setForm({ opportunity_name: "", platform: "", hours: 0, amount: 0, date: new Date().toISOString().split('T')[0] });
      fetchEarnings();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  const totalIncome = earnings.reduce((acc, curr) => acc + curr.amount, 0);
  const avgHourly = earnings.length ? (earnings.reduce((acc, curr) => acc + curr.hourly_rate, 0) / earnings.length).toFixed(2) : "0.00";

  // Simple Tax Estimate (assuming 25% self-employment tax)
  const taxEstimate = (totalIncome * 0.25).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings Tracker</h1>
          <p className="text-muted-foreground">Log your income and track your actual performance.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Log Earnings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Income</DialogTitle>
              <DialogDescription>Enter the details of your latest hustle payout.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogEarnings} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hustle Name</Label>
                  <Input value={form.opportunity_name} onChange={e => setForm({...form, opportunity_name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Input value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Hours Worked</Label>
                  <Input type="number" value={form.hours} onChange={e => setForm({...form, hours: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="space-y-2">
                  <Label>Amount Earned ($)</Label>
                  <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Save Earning</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cumulative income tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Hourly Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgHourly}/hr</div>
            <p className="text-xs text-muted-foreground">Across all logged activities</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Est. Tax Reserve (25%)</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${taxEstimate}</div>
            <p className="text-xs text-muted-foreground">Save this for tax season</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income over Time</CardTitle>
            <CardDescription>Your earnings growth trajectory.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...earnings].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Log</CardTitle>
            <CardDescription>Recent activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {earnings.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No earnings logged yet.</p>
            ) : (
              earnings.map(e => (
                <div key={e.id} className="flex justify-between items-center p-3 border rounded-lg space-x-4">
                  <div>
                    <p className="font-medium text-sm">{e.opportunity_name}</p>
                    <p className="text-xs text-muted-foreground">{e.date} • {e.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${e.amount}</p>
                    <p className="text-xs text-muted-foreground">${e.hourly_rate.toFixed(2)}/hr</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div >
  );
}
