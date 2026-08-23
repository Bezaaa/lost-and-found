import { AuthIllustration } from "@/components/auth/auth-illustration";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:grid lg:grid-cols-2">
      <AuthIllustration />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}
