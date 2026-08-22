export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <span className="text-lg font-semibold tracking-tight text-indigo-900">Lost &amp; Found</span>
      {children}
    </div>
  );
}
