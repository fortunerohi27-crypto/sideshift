"use client";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading your hustle...</p>
    </div>
  );
}
