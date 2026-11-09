// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';

const { PUBLIC_SITE_URL, STRAPI_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

const excluded = ['/401', '/404', '/style-guide'];

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE_URL || 'https://continer.example.com',
  // Lets astro:assets optimize media served by Strapi.
  image: STRAPI_URL ? { remotePatterns: [{ protocol: new URL(STRAPI_URL).protocol.replace(':', ''), hostname: new URL(STRAPI_URL).hostname }] } : {},
  integrations: [
    sitemap({
      filter: (page) => !excluded.includes(new URL(page).pathname.replace(/\/$/, '')),
    }),
  ],
});
