import { Skeleton, TextSkeleton } from '../../../components/Skeleton';

// Ürün sayfasına geçişte: görsel, başlık, fiyat ve butonların yeri ayrılır
export default function Loading() {
  return (
    <div className="w-full bg-canvas min-h-screen py-8" aria-busy="true" aria-label="Ürün yükleniyor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-3 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 md:p-10 rounded-xs border border-line">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-6 w-48" />
            <TextSkeleton lines={3} />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
            <div className="border-y border-line py-4 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-9 w-44" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-11 w-28" />
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 flex-1" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
