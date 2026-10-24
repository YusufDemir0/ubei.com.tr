import { Skeleton, TextSkeleton } from '../components/Skeleton';

// Kendi iskeleti olmayan sayfalara (kurumsal, iletişim, katalog, indirimler…) geçişte genel iskelet
export default function Loading() {
  return (
    <div className="w-full bg-canvas min-h-[70vh] py-12" aria-busy="true" aria-label="Sayfa yükleniyor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-3 w-40" />
        <div className="bg-white border border-line rounded-xs p-8 md:p-12 space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <TextSkeleton lines={2} className="max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-line rounded-xs p-6 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <TextSkeleton lines={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
