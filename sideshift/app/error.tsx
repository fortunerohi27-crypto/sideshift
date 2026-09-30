"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 bg-background">
      <div className="p-4 bg-destructive/10 rounded-full">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-md">
          We encountered an unexpected error while loading the page. Please try again.
        </p>
      </div>
      <Button onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
