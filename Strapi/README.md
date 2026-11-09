# Continer CMS (Strapi)

Strapi 5 backend for the Continer Astro theme. It holds the five collections migrated from Webflow. The Astro site reads them at build time.

| Collection     | API endpoint           | Entries |
| -------------- | ---------------------- | ------- |
| Blog Category  | `/api/blog-categories` | 3       |
| Blog Post      | `/api/blog-posts`      | 7       |
| Career         | `/api/careers`         | 7       |
| Case Study     | `/api/case-studies`    | 4       |
| Service        | `/api/services`        | 4       |

Every Webflow CSV column is stored. Content columns are regular fields, rich text is Markdown, and images live in the Media Library. Meta description and meta image go in the **SEO** component. Webflow's item ID, collection ID, locale ID, archived and draft flags, and created/updated/published dates go in the **Webflow** component.

## Run it

```bash
npm install
cp .env.example .env    # then replace every "tobemodified" secret
npm run develop         # admin at http://localhost:1337/admin
```

On first visit, the admin panel asks you to create the administrator account.

## Import from Webflow

```bash
npm run import:webflow
```

This reads the CSV exports in `../CMS` and does the following:

- Downloads every referenced image into the Media Library. The original URL is kept in the file's caption.
- Creates or updates entries, matched by slug.
- Checks every CSV cell against the stored data, and exits with an error on any mismatch.
- Issues a read-only API token named **Astro build (read-only)** and writes `STRAPI_URL` and `STRAPI_TOKEN` to `../Astro/.env`.

It is safe to run again. Each run regenerates the token, so rebuild Astro afterwards. Set `SKIP_TOKEN=1` to keep the current token. Stop `npm run develop` first, because the importer opens the database directly.

The column-to-field mapping lives in `scripts/webflow-map.js`.

## Access

- The public role has no permissions, so anonymous API requests are rejected.
- Astro authenticates with the read-only token. Manage tokens under **Settings > API Tokens**.

## Production notes

- SQLite (`.tmp/data.db`) and local uploads (`public/uploads`) suit development. For production, use PostgreSQL or MySQL (`DATABASE_CLIENT`) and a cloud upload provider.
- Neither the database nor the uploads are committed. Recreate them with `npm run import:webflow`.
- The Astro site is static, so publish changes by rebuilding it. Add a webhook under **Settings > Webhooks** that calls your host's build hook on `entry.publish`.
