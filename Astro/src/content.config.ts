import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { cleanDescription, joinParts, media, strapiEnabled, strapiLoader } from '@/lib/strapi';

/**
 * Content comes from Strapi when STRAPI_URL is set, and from the Markdown files
 * in src/content otherwise, so the theme also builds without a running CMS.
 * Both sources produce the same data shape.
 */
const markdown = (name: string) => glob({ pattern: '**/*.md', base: `./src/content/${name}` });

const remoteImage = z.object({ remote: z.literal(true), src: z.string().url(), width: z.number().optional(), height: z.number().optional(), alt: z.string() });
const img = (image: SchemaContext['image']) => (strapiEnabled ? remoteImage : image());

const SEO_POPULATE = { seo: { populate: '*' } };
const pick = (...fields: string[]) => Object.fromEntries(fields.map((field) => [field, true]));

const blog = defineCollection({
  loader: strapiEnabled
    ? strapiLoader({
        collection: 'blog-posts',
        populate: { ...pick('mainImage', 'homeImage', 'detailsImage', 'authorImage', 'category'), ...SEO_POPULATE },
        map: (entry) => ({
          data: {
            title: entry.title,
            excerpt: entry.excerpt,
            date: entry.date,
            // Webflow left featured posts without a category; fall back to their tag.
            category: entry.category?.slug ?? entry.tag.toLowerCase(),
            tag: entry.tag,
            byline: entry.byline,
            placement: !entry.active ? 'standard' : entry.authorImage ? 'insight' : 'featured',
            order: entry.order,
            image: media(entry.mainImage),
            homeImage: media(entry.homeImage),
            singleImage: media(entry.mainImage),
            detailsImage: media(entry.detailsImage),
            highlight: entry.highlight,
            quote: entry.summary ?? undefined,
            author: entry.authorImage ? { name: entry.authorName, role: entry.authorRole, image: media(entry.authorImage) } : undefined,
            metaDescription: cleanDescription(entry.seo?.metaDescription),
          },
          body: joinParts(entry.details1, entry.details2, entry.details3),
        }),
      })
    : markdown('blog'),
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
      image: img(image),
      homeImage: img(image),
      singleImage: img(image),
      detailsImage: img(image),
      highlight: z.string(),
      quote: z.string().optional(),
      author: z.object({ name: z.string(), role: z.string(), image: img(image) }).optional(),
      metaDescription: z.string(),
    }),
});

const blogCategories = defineCollection({
  loader: strapiEnabled
    ? strapiLoader({
        collection: 'blog-categories',
        populate: SEO_POPULATE,
        map: (entry) => ({
          data: { name: entry.name.charAt(0) + entry.name.slice(1).toLowerCase(), metaDescription: cleanDescription(entry.seo?.metaDescription) },
        }),
      })
    : markdown('blog-categories'),
  schema: z.object({ name: z.string(), metaDescription: z.string() }),
});

const careers = defineCollection({
  loader: strapiEnabled
    ? strapiLoader({
        collection: 'careers',
        populate: SEO_POPULATE,
        map: (entry) => ({
          data: {
            title: entry.title,
            location: entry.location,
            schedule: entry.schedule,
            jobType: entry.jobType,
            benefit: entry.benefit,
            email: entry.email,
            tag: entry.singleTag,
            intro: entry.singleText,
            summaryTitle: entry.detailsTitle1,
            summary: entry.roleSummary,
            detailTitles: [entry.detailsTitle2, entry.detailsTitle3, entry.detailsTitle4],
            order: entry.order,
            metaDescription: cleanDescription(entry.seo?.metaDescription),
          },
          body: joinParts(entry.details1, entry.details2, entry.details3),
        }),
      })
    : markdown('careers'),
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
  loader: strapiEnabled
    ? strapiLoader({
        collection: 'case-studies',
        populate: { ...pick('logo', 'mainImage', 'singleImage', 'detailsImage', 'counters'), ...SEO_POPULATE },
        map: (entry) => ({
          data: {
            title: entry.title,
            readTime: entry.readTime,
            tag: entry.singleTag,
            logo: media(entry.logo),
            image: media(entry.mainImage),
            singleImage: media(entry.singleImage),
            detailsImage: media(entry.detailsImage),
            highlight: entry.shortText,
            counters: (entry.counters ?? []).map(({ value, label }: { value: string; label: string }) => ({ value, label })),
            order: entry.order,
            metaDescription: cleanDescription(entry.seo?.metaDescription),
          },
          body: joinParts(entry.details1, entry.details2),
        }),
      })
    : markdown('case-studies'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      readTime: z.string(),
      tag: z.string(),
      logo: img(image),
      image: img(image),
      singleImage: img(image),
      detailsImage: img(image),
      highlight: z.string(),
      counters: z.array(z.object({ value: z.string(), label: z.string() })),
      order: z.number().default(100),
      metaDescription: z.string(),
    }),
});

const services = defineCollection({
  loader: strapiEnabled
    ? strapiLoader({
        collection: 'services',
        populate: { ...pick('icon', 'mainImage', 'singleImage', 'detailsImage'), ...SEO_POPULATE },
        map: (entry) => ({
          data: {
            title: entry.title,
            excerpt: entry.excerpt,
            number: entry.number,
            tag: entry.singleTag,
            icon: media(entry.icon),
            image: media(entry.mainImage),
            singleImage: media(entry.singleImage),
            detailsImage: media(entry.detailsImage),
            highlight: entry.singleText,
            order: entry.order,
            metaDescription: cleanDescription(entry.seo?.metaDescription),
          },
          body: joinParts(entry.details1, entry.details2),
        }),
      })
    : markdown('services'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      number: z.string(),
      tag: z.string(),
      icon: img(image),
      image: img(image),
      singleImage: img(image),
      detailsImage: img(image),
      highlight: z.string(),
      order: z.number().default(100),
      metaDescription: z.string(),
    }),
});

export const collections = { blog, 'blog-categories': blogCategories, careers, 'case-studies': caseStudies, services };
