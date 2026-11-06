import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const entries = (name: string) => glob({ pattern: '**/*.md', base: `./src/content/${name}` });

const blog = defineCollection({
  loader: entries('blog'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      date: z.coerce.date(),
      category: reference('blog-categories'),
      tag: z.string(),
      byline: z.string(),
      /** featured = blog hero, insight = home v3 spotlight, standard = article grids. */
      placement: z.enum(['standard', 'featured', 'insight']).default('standard'),
      order: z.number().default(100),
      image: image(),
      homeImage: image(),
      singleImage: image(),
      detailsImage: image(),
      highlight: z.string(),
      quote: z.string().optional(),
      author: z.object({ name: z.string(), role: z.string(), image: image() }).optional(),
      metaDescription: z.string(),
    }),
});

const blogCategories = defineCollection({
  loader: entries('blog-categories'),
  schema: z.object({ name: z.string(), metaDescription: z.string() }),
});

const careers = defineCollection({
  loader: entries('careers'),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    schedule: z.string(),
    jobType: z.string(),
    benefit: z.string(),
    email: z.email(),
    tag: z.string(),
    intro: z.string(),
    summaryTitle: z.string(),
    summary: z.string(),
    detailTitles: z.array(z.string()).length(3),
    order: z.number().default(100),
    metaDescription: z.string(),
  }),
});

const caseStudies = defineCollection({
  loader: entries('case-studies'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      readTime: z.string(),
      tag: z.string(),
      logo: image(),
      image: image(),
      singleImage: image(),
      detailsImage: image(),
      highlight: z.string(),
      counters: z.array(z.object({ value: z.string(), label: z.string() })),
      order: z.number().default(100),
      metaDescription: z.string(),
    }),
});

const services = defineCollection({
  loader: entries('services'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      number: z.string(),
      tag: z.string(),
      icon: image(),
      image: image(),
      singleImage: image(),
      detailsImage: image(),
      highlight: z.string(),
      order: z.number().default(100),
      metaDescription: z.string(),
    }),
});

export const collections = { blog, 'blog-categories': blogCategories, careers, 'case-studies': caseStudies, services };
