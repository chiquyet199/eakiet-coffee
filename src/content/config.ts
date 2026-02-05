import { defineCollection, z } from 'astro:content';

const productCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    price: z.number(),
    currency: z.string().default('VND'),
    category: z.string().optional(),
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
        process: z.string().optional(),
        altitude: z.string().optional(),
        flavor: z.string().optional(),
      })
      .optional(),
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
    year: z.number(),
    description: z.string(),
    image: z.string().optional(),
    organization: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  products: productCollection,
  news: newsCollection,
  awards: awardCollection,
};
