export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border bg-white shadow-sm">
      <div className="h-48 w-full rounded-t-xl bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}
