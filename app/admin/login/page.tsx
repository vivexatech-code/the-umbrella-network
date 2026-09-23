import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin login | The Umbrella Network", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
