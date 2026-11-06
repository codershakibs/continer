// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';

const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_');

const excluded = ['/401', '/404', '/style-guide'];

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE_URL || 'https://continer.example.com',
  integrations: [
    sitemap({
      filter: (page) => !excluded.includes(new URL(page).pathname.replace(/\/$/, '')),
    }),
  ],
});
