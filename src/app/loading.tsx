export default function Loading() {
  return (
    <main className="px-container-padding py-6 pb-24 flex flex-col gap-section-gap max-w-md mx-auto md:max-w-3xl animate-pulse">
      {/* Hero Card Skeleton */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high h-48 flex flex-col justify-between shadow-xs">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-surface-container-high rounded w-32"></div>
          <div className="h-6 bg-surface-container-high rounded-full w-24"></div>
        </div>
        <div>
          <div className="h-10 bg-surface-container-high rounded w-44 mb-2"></div>
          <div className="h-4 bg-surface-container-high rounded w-56"></div>
        </div>
        <div className="flex gap-3 mt-2">
          <div className="flex-1 h-11 bg-surface-container-high rounded-lg"></div>
          <div className="flex-1 h-11 bg-surface-container-high rounded-lg"></div>
        </div>
      </div>

      {/* Quick Nav Cards Skeleton */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="h-20 bg-surface-container-lowest rounded-xl border border-surface-container-high"></div>
        <div className="h-20 bg-surface-container-lowest rounded-xl border border-surface-container-high"></div>
        <div className="h-20 bg-surface-container-lowest rounded-xl border border-surface-container-high"></div>
        <div className="h-20 bg-surface-container-lowest rounded-xl border border-surface-container-high"></div>
      </div>

      {/* Chart Section Skeleton */}
      <div className="bg-surface-container-lowest rounded-xl p-5 border border-surface-container-high h-56 flex flex-col justify-between">
        <div className="h-5 bg-surface-container-high rounded w-36"></div>
        <div className="h-36 bg-surface-container-low rounded-lg w-full"></div>
      </div>

      {/* Recent Items Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="h-4 bg-surface-container-high rounded w-40"></div>
        <div className="h-16 bg-surface-container-lowest rounded-xl border border-surface-container-high"></div>
        <div className="h-16 bg-surface-container-lowest rounded-xl border border-surface-container-high"></div>
        <div className="h-16 bg-surface-container-lowest rounded-xl border border-surface-container-high"></div>
      </div>
    </main>
  );
}
