import { RegisterForm } from "@/components/auth/register-form";
import { GoogleButton } from "@/components/auth/google-button";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 p-8 glass-card">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground">Start focusing better, everywhere.</p>
        </div>
        <RegisterForm />
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
        </div>
        <GoogleButton />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
