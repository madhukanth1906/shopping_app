export default function ProductSkeleton({ viewMode = "grid" }) {
  return (
    <div className="block w-full text-left">
      <div 
        className={`product-skeleton cursor-wait animate-pulse ${viewMode === "list" ? "flex flex-row gap-8 items-center bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10" : ""}`}
      >
        <div className={`relative overflow-hidden bg-surface-container-high rounded-lg ${viewMode === "list" ? "w-48 h-64 flex-shrink-0 mb-0" : "aspect-[3/4] mb-6"}`}>
          {/* Shimmer Image Area */}
        </div>
        
        <div className={`space-y-2 flex-1`}>
          <div className="flex justify-between items-baseline">
            {/* Title Skeleton */}
            <div className="h-5 bg-surface-container-high rounded-sm w-3/5"></div>
            {/* Price Skeleton */}
            <div className="h-5 bg-surface-container-high rounded-sm w-1/5"></div>
          </div>
          
          {viewMode === 'list' && (
            <div className="mt-4 space-y-2">
              <div className="h-3 bg-surface-container-high rounded-sm w-full"></div>
              <div className="h-3 bg-surface-container-high rounded-sm w-full"></div>
              <div className="h-3 bg-surface-container-high rounded-sm w-4/5"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
