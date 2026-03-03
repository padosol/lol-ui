export default function PatchContentSkeleton() {
  return (
    <div className="space-y-4">
      {/* 헤더 스켈레톤 */}
      <div className="bg-surface-1 rounded-lg border border-divider/50 p-6">
        <div className="h-8 w-48 bg-surface-4 rounded animate-pulse mb-2" />
        <div className="h-4 w-32 bg-surface-4 rounded animate-pulse" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-10 w-24 bg-surface-4 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* 섹션 스켈레톤 */}
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-surface-1 rounded-lg border border-divider/50 p-4"
        >
          <div className="h-6 w-40 bg-surface-4 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            {[...Array(3)].map((_, itemIndex) => (
              <div
                key={itemIndex}
                className="h-16 bg-surface-2 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
