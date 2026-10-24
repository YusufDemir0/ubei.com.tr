/**
 * Canonical CMS Block Keys Registry
 * Unified between Backend Seed, Prisma cms_blocks, and Frontend useCMSStore
 */
export const CMS_KEYS = {
  contact: 'contact',
  ticker: 'ticker',
  trustTexts: 'trust_texts',
  popup: 'popup',
  deliveryZones: 'delivery_zones',
  socialLinks: 'social_links',
  homeHero: 'home_hero',
  homeConfig: 'home_config',
  corporate: 'corporate_config',
  landing: 'landing_page_config',
} as const;

export type CmsKey = (typeof CMS_KEYS)[keyof typeof CMS_KEYS];
