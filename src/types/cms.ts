export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaCategoryFilter: string;
  badgeText?: string;
}

export interface HeroConfig {
  autoPlayIntervalMs?: number;
  slides: HeroSlide[];
}

export interface CategoryItemConfig {
  id: string;
  name: string;
  slug: string;
  image: string;
  badgeText?: string;
}

export interface CategoryListConfig {
  title: string;
  subtitle?: string;
  categories: CategoryItemConfig[];
}

export interface PromotionalBannerConfig {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  discountPercentage?: number;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

export type PageBlock =
  | { id: string; type: 'hero'; data: HeroConfig }
  | { id: string; type: 'category_list'; data: CategoryListConfig }
  | { id: string; type: 'banner'; data: PromotionalBannerConfig };

export interface PageConfig {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  blocks: PageBlock[];
}
