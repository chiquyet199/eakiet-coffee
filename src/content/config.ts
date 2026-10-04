import { defineCollection, z } from 'astro:content';
import { AWARD_KINDS, BEAN_TYPES, NEWS_CATEGORIES, PROCESS_METHODS, PRODUCT_LINES, keysOf } from '../utils/taxonomy';

const flavorScore = z.number().min(0).max(5).optional();

const productCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Optional: green coffee for B2B is usually quoted on request ("Liên hệ").
    price: z.number().optional(),
    currency: z.string().default('VND'),
    productLine: z.enum(keysOf(PRODUCT_LINES)).default('roasted'),
    beanType: z.enum(keysOf(BEAN_TYPES)).optional(),
    processMethod: z.enum(keysOf(PROCESS_METHODS)).optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    images: z
      .array(z.union([z.string(), z.object({ image: z.string() })]))
      .optional()
      .default([]),
    mainImage: z.string(),
    description: z.string(),
    specifications: z
      .object({
        origin: z.string().optional(),
        roastLevel: z.string().optional(),
        altitude: z.string().optional(),
        flavor: z.string().optional(),
      })
      .optional(),
    // Green coffee (B2B) spec sheet.
    greenSpec: z
      .object({
        moisture: z.string().optional(),
        foreignMatter: z.string().optional(),
        brokenBeans: z.string().optional(),
        screenSize: z.string().optional(),
      })
      .optional(),
    packaging: z.array(z.string()).optional().default([]),
    specSheet: z.string().optional(),
    // Roasted coffee: 0–5 per axis, drawn as a radar chart.
    flavorProfile: z
      .object({
        bitterness: flavorScore,
        acidity: flavorScore,
        sweetness: flavorScore,
        aroma: flavorScore,
        body: flavorScore,
      })
      .optional(),
    grindOptions: z.array(z.string()).optional().default([]),
    order: z.number().default(0),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    featuredImage: z.string(),
    author: z.string().optional(),
    category: z.enum(keysOf(NEWS_CATEGORIES)).default('htx'),
    publishedDate: z.coerce.date(),
    published: z.boolean().default(true),
    tags: z.array(z.string()).optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

const awardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    kind: z.enum(keysOf(AWARD_KINDS)).default('award'),
    year: z.number().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    organization: z.string().optional(),
    order: z.number().default(0),
  }),
});

// Single-file collection (src/content/settings/home.json) holding editable homepage copy.
const settingsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    heroSlogan: z.string(),
    heroSubtitle: z.string().optional(),
    heroPoster: z.string().optional(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    aboutPreview: z.string().optional(),
    processSteps: z.array(z.object({ title: z.string(), description: z.string().optional() })).default([]),
  }),
});

export const collections = {
  products: productCollection,
  news: newsCollection,
  awards: awardCollection,
  settings: settingsCollection,
};
