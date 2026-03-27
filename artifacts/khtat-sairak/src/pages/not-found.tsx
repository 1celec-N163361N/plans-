import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full glass-panel p-10 rounded-3xl text-center">
        <div className="flex justify-center mb-6 text-destructive">
          <AlertCircle size={64} />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link href="/">
          <Button size="lg" className="w-full">
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
