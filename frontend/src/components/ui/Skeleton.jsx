// Skeleton loaders — replace spinners with content-shaped placeholders

function SkeletonBox({ className = '' }) {
  return <div className={`bg-slate-200 rounded animate-pulse ${className}`} />
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 border-l-4 border-slate-200">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-8 w-12" />
          <SkeletonBox className="h-2 w-16" />
        </div>
        <SkeletonBox className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 7 }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <SkeletonBox className={`h-4 ${i === 1 ? 'w-28' : i === cols - 1 ? 'w-16' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

export function TicketDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="flex justify-between">
        <SkeletonBox className="h-9 w-20" />
        <div className="flex gap-2">
          <SkeletonBox className="h-9 w-28" />
          <SkeletonBox className="h-9 w-20" />
        </div>
      </div>
      <div className="card p-5">
        <div className="flex gap-2 mb-3">
          <SkeletonBox className="h-5 w-12" />
          <SkeletonBox className="h-5 w-16" />
          <SkeletonBox className="h-5 w-14" />
        </div>
        <SkeletonBox className="h-7 w-56 mb-3" />
        <div className="flex gap-4">
          <SkeletonBox className="h-4 w-28" />
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-5 space-y-3">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-3/4" />
        </div>
        <div className="card p-5 space-y-3">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-9 w-full" />
          <SkeletonBox className="h-20 w-full" />
          <SkeletonBox className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonBox
