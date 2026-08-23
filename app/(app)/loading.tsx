export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 animate-pulse rounded-md bg-stone-700" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-stone-800" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 w-full animate-pulse rounded-lg bg-stone-800" />
        ))}
      </div>
    </div>
  );
}
