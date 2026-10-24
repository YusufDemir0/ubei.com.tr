import type { NextConfig } from "next";

// GitHub Pages: tamamen statik dışa aktarım (out/). Backend yok; veri src/mock'tan gelir.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    // Statik sitede görsel optimizasyon sunucusu yok; ürün görselleri zaten küçük SVG
    unoptimized: true,
  },
};

export default nextConfig;
