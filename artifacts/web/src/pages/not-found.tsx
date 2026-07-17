import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-10 max-w-md text-center border border-white/10">
        <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
        <h1 className="text-3xl font-bold text-white mb-3">Void Detected</h1>
        <p className="text-muted-foreground mb-8">
          The quadrant you are attempting to access does not exist in the current OS namespace.
        </p>
        <Link href="/">
          <Button className="w-full bg-primary text-black font-semibold">
            Return to Authorized Zone
          </Button>
        </Link>
      </div>
    </div>
  );
}
