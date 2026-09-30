"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Step = "skills" | "logistics" | "goals";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("skills");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    skills: "" as string[],
    tools: "" as string[],
    location: "",
    available_hours: 0,
    work_type: "Remote",
    income_goal: 0,
  });

  const addTag = (value: string, field: "skills" | "tools") => {
    if (!value) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }));
  };

  const removeTag = (index: number, field: "skills" | "tools") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (step === "skills") setStep("logistics");
    else if (step === "logistics") setStep("goals");
  };

  const handleBack = () => {
    if (step === "goals") setStep("logistics");
    else if (step === "logistics") setStep("skills");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          skills: formData.skills,
          tools: formData.tools,
          location: formData.location,
          available_hours: formData.available_hours,
          work_type: formData.work_type,
          income_goal: formData.income_goal,
        });

      if (error) throw error;

      toast({
        title: "Profile Updated!",
        description: "Welcome to SideShift. Let's find your best hustle.",
      });

      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Step {step === "skills" ? 1 : step === "logistics" ? 2 : 3} of 3
          </CardDescription>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: step === "skills" ? "33%" : step === "logistics" ? "66%" : "100%" }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-8 py-10">
          {step === "skills" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Your Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Writing, Python, Design"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(e.currentTarget.value, "skills");
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button onClick={() => {
                    const input = document.querySelector('input[placeholder="e.g. Writing, Python, Design"]') as HTMLInputElement;
                    addTag(input.value, "skills");
                    input.value = "";
                  }}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm border border-primary/20">
                      {skill}
                      <button onClick={() => removeTag(i, "skills")} className="hover:text-red-500">&times;</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tools/Equipment You Own</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Laptop, DSLR, Car"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(e.currentTarget.value, "tools");
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button onClick={() => {
                    const input = document.querySelector('input[placeholder="e.g. Laptop, DSLR, Car"]') as HTMLInputElement;
                    addTag(input.value, "tools");
                    input.value = "";
                  }}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tools.map((tool, i) => (
                    <div key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm border border-primary/20">
                      {tool}
                      <button onClick={() => removeTag(i, "tools")} className="hover:text-red-500">&times;</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "logistics" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location (City, Country)</Label>
                <Input
                  id="location"
                  placeholder="New York, USA"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hours">Available Hours per Week</Label>
                  <Input
                    id="hours"
                    type="number"
                    placeholder="10"
                    value={formData.available_hours}
                    onChange={(e) => setFormData({...formData, available_hours: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_type">Preferred Work Type</Label>
                  <Select
                    value={formData.work_type}
                    onValueChange={(val) => setFormData({...formData, work_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === "goals" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goal">Current Main Income Goal (USD)</Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="500"
                  value={formData.income_goal}
                  onChange={(e) => setFormData({...formData, income_goal: parseInt(e.target.value) || 0})}
                />
                <p className="text-xs text-muted-foreground">How much extra do you want to make per month?</p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-muted-foreground">
                SideShift will now analyze your profile and find the most profitable hustles for you.
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between py-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === "skills"}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {step === "goals" ? (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finish & Find Hustles"} <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
