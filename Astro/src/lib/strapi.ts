import type { Loader } from 'astro/loaders';

/** A Strapi media file, normalized for `CmsImage`. */
export interface RemoteImage {
  remote: true;
  src: string;
  width?: number;
  height?: number;
  alt: string;
}

interface StrapiMedia {
  url: string;
  width?: number | null;
  height?: number | null;
  alternativeText?: string | null;
}

export type StrapiEntry = Record<string, any> & { documentId: string; slug: string };

const STRAPI_URL = import.meta.env.STRAPI_URL as string | undefined;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN as string | undefined;

export const strapiEnabled = Boolean(STRAPI_URL);

export function media(file: StrapiMedia | null | undefined): RemoteImage | undefined {
  if (!file?.url || !STRAPI_URL) return undefined;
  return {
    remote: true,
    src: new URL(file.url, STRAPI_URL).href,
    width: file.width ?? undefined,
    height: file.height ?? undefined,
    alt: file.alternativeText ?? '',
  };
}

/** Builds Strapi's bracket query string, e.g. `populate[seo][populate]=*`. */
function query(params: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(params).flatMap(([key, value]) => {
    const name = prefix ? `${prefix}[${key}]` : key;
    return value !== null && typeof value === 'object' ? query(value as Record<string, unknown>, name) : [`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`];
  });
}

async function fetchAll(plural: string, populate: Record<string, unknown>): Promise<StrapiEntry[]> {
  const entries: StrapiEntry[] = [];
  for (let page = 1; ; page++) {
    const url = `${STRAPI_URL}/api/${plural}?${query({ populate, status: 'published', sort: 'id:asc', pagination: { page, pageSize: 100 } }).join('&')}`;
    const response = await fetch(url, { headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {} });
    if (!response.ok) {
      throw new Error(`Strapi request failed (${response.status} ${response.statusText}) for ${plural}. Check STRAPI_URL, STRAPI_TOKEN and that Strapi is running.`);
    }
    const { data, meta } = await response.json();
    entries.push(...data);
    if (page >= (meta?.pagination?.pageCount ?? 1)) return entries;
  }
}

interface StrapiLoaderOptions {
  /** Plural API ID, e.g. `blog-posts`. */
  collection: string;
  /** Relations, media and components to include in the response. */
  populate: Record<string, unknown>;
  /** Shapes a Strapi entry into the collection schema. `body` feeds `renderParts`. */
  map: (entry: StrapiEntry) => { data: Record<string, unknown>; body?: string };
}

/** Loads published Strapi entries into an Astro content collection at build time, keyed by slug. */
export function strapiLoader({ collection, populate, map }: StrapiLoaderOptions): Loader {
  return {
    name: `strapi:${collection}`,
    load: async ({ store, parseData, generateDigest, logger }) => {
      const entries = await fetchAll(collection, populate);
      store.clear();
      for (const entry of entries) {
        const { data, body } = map(entry);
        const parsed = await parseData({ id: entry.slug, data });
        store.set({ id: entry.slug, data: parsed, body, digest: generateDigest({ data, body: body ?? '' }) });
      }
      logger.info(`Loaded ${entries.length} ${collection} from Strapi`);
    },
  };
}

/** Joins rich-text fields with the marker that detail pages split on. */
export const joinParts = (...parts: (string | null | undefined)[]) => parts.map((part) => part ?? '').join('\n\n<!-- split -->\n\n');

/** Webflow exported some descriptions with a numbering prefix such as "24. ". */
export const cleanDescription = (value: string | null | undefined) => (value ?? '').replace(/^\d+\.\s*/, '').trim();
