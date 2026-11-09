# Continer: Logistics Astro Theme

Continer is a multi-page theme for logistics, freight and supply chain companies. It ships three home pages, three about pages, three contact pages, services, careers, case studies, a blog, and utility pages, all driven by Astro components and Content Collections.

## Quick start

Requires Node.js 22.23.4 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Starts the dev server at `localhost:4321`     |
| `npm run build`   | Builds the production site to `dist/`         |
| `npm run preview` | Serves the production build locally           |
| `npm run check`   | Type-checks Astro and TypeScript files        |

## Before you launch

1. Set `PUBLIC_SITE_URL` in `.env`. Canonical URLs, Open Graph images, the sitemap and `robots.txt` all depend on it.
2. Connect the forms. Set `PUBLIC_FORM_ENDPOINT` to a service that accepts a JSON `POST`. **Until you do, forms run in demo mode**: visitors see a success message and nothing is delivered. Set `forms.demoMode` to `false` in `src/config/config.json` to turn that off.
3. Replace the demo content, brand details and social links (see below).
4. Replace the password page if you need real protection. `/401` is a visual template, because a static site has no server to verify a password. Use your host's access controls.

## Project structure

```text
public/
  images/               Pre-sized page images and icons
  videos/               Background videos: <name>.mp4, <name>.webm, <name>-poster.jpg
src/
  assets/
    cms/                Images used by content entries, optimized at build time
    icons/              SVG icons, imported as components
  components/
    cards/              Cards bound to collection entries (BlogCard, ServiceRow...)
    layout/             Header, Footer, SeoMeta
    sections/           Page sections, one folder per page, plus shared/ (Faq, Cta)
    ui/                 Buttons, section headings, Img, BackgroundVideo
  config/               config.json, menu.json, social.json
  content/              Markdown collections: blog, blog-categories, careers, case-studies, services
  data/                 faq.ts and sections/: repeated section content
  layouts/Base.astro    Document shell: head, header, footer, scripts
  lib/content.ts        Collection queries and Markdown helpers
  pages/                Routes, including dynamic [slug] pages
  scripts/              Client scripts, one per interaction
  styles/               tokens, base, components, responsive, interactions
```

## Customizing

**Brand and colors.** Colors, fonts, type scale and spacing are CSS variables in `src/styles/tokens.css`. The site name, logo and footer text are in `src/config/config.json`.

**Navigation and social links.** Edit `src/config/menu.json` and `src/config/social.json`. The header and footer update together.

**Section copy.** Each section is a component in `src/components/sections/<page>/`. One-off text lives in the component, and repeated items such as team cards and logos live in `src/data/sections/<page>.ts`.

**Header style.** Pass `header="absolute"` or `header="home-version"` to `Base` on any page.

## Content source: Strapi or Markdown

Blog posts, categories, careers, case studies and services come from one of two sources, and both produce the same pages:

- **Strapi**, when `STRAPI_URL` is set. Entries load at build time through `src/lib/strapi.ts`, and images are downloaded and optimized into the build, so the deployed site never calls the CMS. Set up the CMS in `../Strapi` (see its README); its importer writes `STRAPI_URL` and `STRAPI_TOKEN` to `.env` for you. Strapi must be running when you build.
- **Markdown**, when `STRAPI_URL` is empty. Content comes from `src/content/` as described below.

The field mapping between the two lives in `src/content.config.ts`.

## Adding content

To add content in Markdown mode, add a file to a folder in `src/content/`. The file name becomes the URL slug, and `src/content.config.ts` lists the required fields.

Detail pages place images and callouts between blocks of copy, so separate those blocks with a marker:

```md
---
title: "Your post title"
# ...other fields
---

The first block of the article.

<!-- split -->

The second block.

<!-- split -->

The third block, shown after the image and highlight.
```

| Collection        | Route                     | Blocks |
| ----------------- | ------------------------- | ------ |
| `blog`            | `/blog-posts/<slug>`      | 3      |
| `careers`         | `/career/<slug>`          | 3      |
| `case-studies`    | `/case-study/<slug>`      | 2      |
| `services`        | `/service/<slug>`         | 2      |
| `blog-categories` | `/blog-categories/<slug>` | none   |

On the blog, `placement` chooses where a post appears: `standard` for article grids, `featured` for the blog hero, and `insight` for the Home C spotlight. `order` sets the position in every list.

Home pages show collection entries by position, for example `services[0]`. If you delete entries, update the matching section component in `src/components/sections/home*/`.

## Animations

Add `data-anim="<token>"` to an element to animate it. The tokens are defined in `src/scripts/animations.ts`: `LOAD` holds page-load sequences and `SCROLL` holds scroll reveals. Text splitting, smooth scrolling and video playback all respect `prefers-reduced-motion`, and all content stays visible without JavaScript.

## SEO

`SeoMeta.astro` renders titles, descriptions, canonical URLs, Open Graph and Twitter tags, robots directives, favicons and JSON-LD. Pass these as props to `Base`. Blog posts add `Article` structured data. The `/401`, `/404` and `/style-guide` pages are `noindex` and left out of the sitemap.

## Dependencies

| Package                                   | Used for                              |
| ----------------------------------------- | ------------------------------------- |
| `gsap`                                    | Entrance, scroll and text animations  |
| `lenis`                                   | Smooth scrolling                      |
| `marked`                                  | Rendering split Markdown blocks       |
| `@astrojs/sitemap`                        | Sitemap generation                    |
| `@fontsource-variable/geist`, `geist-mono`| Self-hosted fonts                     |
