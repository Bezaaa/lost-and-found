import { Backpack, KeyRound, Search, Smartphone, Umbrella, Watch } from "lucide-react";

const SCATTERED_ICONS = [
  { icon: Backpack, className: "left-[12%] top-[18%] size-10" },
  { icon: KeyRound, className: "right-[18%] top-[28%] size-8" },
  { icon: Umbrella, className: "left-[22%] top-[62%] size-9" },
  { icon: Watch, className: "right-[14%] top-[64%] size-8" },
  { icon: Smartphone, className: "left-[48%] top-[42%] size-9" },
];

export function AuthIllustration() {
  return (
    <div className="relative flex flex-col justify-center overflow-hidden bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-12 lg:h-full lg:px-14">
      <div aria-hidden className="absolute inset-0 hidden lg:block">
        {SCATTERED_ICONS.map(({ icon: Icon, className }, index) => (
          <span
            key={index}
            className={`absolute flex items-center justify-center rounded-2xl bg-white/10 p-3 ${className}`}
          >
            <Icon className="size-full text-white/70" />
          </span>
        ))}
      </div>

      <div className="relative flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-white/15">
          <Search className="size-4.5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Lost &amp; Found</span>
      </div>

      <div className="relative mt-6 max-w-sm lg:mt-10">
        <h1 className="text-2xl font-semibold leading-tight text-balance lg:text-3xl">
          Lost something? Let&apos;s help you find it.
        </h1>
        <p className="mt-3 hidden text-sm leading-relaxed text-indigo-100 sm:block">
          Report what you&apos;ve lost or found on campus, and we&apos;ll surface likely matches
          automatically — so you can spend less time searching and more time back to your day.
        </p>
      </div>
    </div>
  );
}
