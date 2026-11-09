/**
 * Imports the Webflow CMS CSV exports into Strapi, then verifies every cell.
 *
 *   npm run import:webflow
 *
 * Safe to re-run: entries are matched by slug and media by source URL.
 * Options (env): WEBFLOW_CSV_DIR (default ../CMS), ASTRO_ENV_FILE (default ../Astro/.env),
 * STRAPI_PUBLIC_URL (default http://localhost:1337).
 */
const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { COLLECTIONS, SYSTEM, SEO, ORDER } = require('./webflow-map.js');

const ROOT = path.resolve(__dirname, '..');
const CSV_DIR = path.resolve(ROOT, process.env.WEBFLOW_CSV_DIR || '../CMS');
const ASTRO_ENV = path.resolve(ROOT, process.env.ASTRO_ENV_FILE || '../Astro/.env');
const PUBLIC_URL = process.env.STRAPI_PUBLIC_URL || 'http://localhost:1337';
const CACHE = path.join(__dirname, '.webflow-cache');
const TOKEN_NAME = 'Astro build (read-only)';

// ---------- CSV
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [header, ...body] = rows;
  return { header, items: body.filter((r) => r.length > 1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? '']))) };
}

function loadCsv(name) {
  const files = fs.readdirSync(CSV_DIR).filter((f) => f.endsWith('.csv') && f.includes(` ${name} `));
  if (!files.length) throw new Error(`No CSV export found for "${name}" in ${CSV_DIR}`);
  // Webflow sometimes leaves duplicate downloads, e.g. "file (1).csv". Prefer the original and confirm copies match.
  files.sort((a, b) => a.length - b.length);
  const [primary, ...copies] = files.map((f) => fs.readFileSync(path.join(CSV_DIR, f), 'utf8'));
  copies.forEach((copy, i) => {
    if (copy !== primary) throw new Error(`${files[i + 1]} differs from ${files[0]}; resolve which export is current.`);
  });
  return { file: files[0], ...parseCsv(primary) };
}

// ---------- values
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*' });
const toMarkdown = (html) => turndown.turndown((html || '').replace(/‍/g, '').replace(/<p>\s*<\/p>/g, '')).trim();
const clean = (value) => (value ?? '').trim();
const toDate = (value) => (clean(value) ? new Date(value).toISOString().slice(0, 10) : null);
const toDateTime = (value) => (clean(value) ? new Date(value).toISOString() : null);
const toBool = (value) => clean(value).toLowerCase() === 'true';
const MIME = { '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif' };

function convert(field, raw) {
  switch (field.type) {
    case 'richtext': return toMarkdown(raw);
    case 'date': return toDate(raw);
    case 'boolean': return toBool(raw);
    default: return clean(raw) || null;
  }
}

// ---------- media
async function download(url) {
  fs.mkdirSync(CACHE, { recursive: true });
  const base = decodeURIComponent(url.split('/').pop()).replace(/^[0-9a-f]{24}_/, '');
  const ext = (path.extname(base) || '.bin').toLowerCase();
  const stem = base.slice(0, -ext.length).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'file';
  const id = url.match(/\/([0-9a-f]{24})_/)?.[1] ?? '';
  const name = `${stem}${id ? '-' + id.slice(-6) : ''}${ext}`;
  const file = path.join(CACHE, name);
  if (!fs.existsSync(file)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
    fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  }
  return { file, name, ext };
}

async function uploadMedia(strapi, url, alt) {
  const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { caption: url } });
  if (existing) return existing.id;
  const { file, name, ext } = await download(url);
  const [uploaded] = await strapi.plugin('upload').service('upload').upload({
    data: { fileInfo: { name, alternativeText: alt ?? '', caption: url } },
    files: { filepath: file, originalFilename: name, mimetype: MIME[ext] ?? 'application/octet-stream', size: fs.statSync(file).size },
  });
  return uploaded.id;
}

// ---------- import
async function importCollection(strapi, collection, categoryIds) {
  const { file, header, items } = loadCsv(collection.csv);
  const uid = `api::${collection.uid}.${collection.uid}`;
  const known = new Set([...Object.keys(collection.fields), ...Object.keys(SYSTEM), ...Object.keys(SEO)]);
  const unmapped = header.filter((h) => !known.has(h));
  if (unmapped.length) throw new Error(`${file}: unmapped columns ${unmapped.join(', ')}`);

  const ids = {};
  for (const item of items) {
    const titleColumn = Object.keys(collection.fields).find((k) => collection.fields[k].name === collection.titleField);
    const title = clean(item[titleColumn]);
    const data = { counters: [] };
    for (const [column, field] of Object.entries(collection.fields)) {
      const raw = item[column];
      if (field.counter !== undefined) {
        data.counters[field.counter] = { ...data.counters[field.counter], [field.key]: clean(raw) };
      } else if (field.type === 'media') {
        const decorative = ['logo', 'icon'].includes(field.name);
        data[field.name] = clean(raw) ? await uploadMedia(strapi, clean(raw), decorative ? '' : field.name === 'authorImage' ? clean(item['Insiggts Author Tag 01']) : title) : null;
      } else if (field.type === 'relation') {
        data[field.name] = clean(raw) ? categoryIds[clean(raw)] ?? null : null;
        if (clean(raw) && !data[field.name]) throw new Error(`Unknown category "${raw}" on ${item.Slug}`);
      } else {
        data[field.name] = convert(field, raw);
      }
    }
    if (!data.counters.length) delete data.counters;
    data.seo = {
      metaDescription: clean(item['Meta Description']) || null,
      metaImage: clean(item['Meta Image']) ? await uploadMedia(strapi, clean(item['Meta Image']), title) : null,
    };
    data.webflow = Object.fromEntries(
      Object.entries(SYSTEM).map(([column, key]) => [key, ['archived', 'draft'].includes(key) ? toBool(item[column]) : /On$/.test(key) ? toDateTime(item[column]) : clean(item[column])]),
    );
    if (collection.uid !== 'blog-category') {
      const order = (ORDER[collection.uid] ?? []).indexOf(data.slug);
      data.order = order >= 0 ? order + 1 : parseInt(item['Service Number'], 10) || 100;
    }
    // Archived items stay out of the site; Webflow drafts become Strapi drafts.
    const status = toBool(item.Archived) || toBool(item.Draft) ? 'draft' : 'published';

    const existing = await strapi.documents(uid).findFirst({ filters: { slug: data.slug }, status: 'draft' });
    const saved = existing
      ? await strapi.documents(uid).update({ documentId: existing.documentId, data, status })
      : await strapi.documents(uid).create({ data, status });
    if (status === 'published' && existing) await strapi.documents(uid).publish({ documentId: saved.documentId });
    ids[data.slug] = saved.documentId;
  }
  return { file, items, ids };
}

// ---------- verification
async function verify(strapi, collection, items) {
  const uid = `api::${collection.uid}.${collection.uid}`;
  const problems = [];
  let cells = 0;
  const media = (file) => file?.caption ?? null;
  for (const item of items) {
    const doc = await strapi.documents(uid).findFirst({ filters: { slug: clean(item.Slug) }, status: 'published', populate: '*' });
    if (!doc) { problems.push(`${collection.uid}/${item.Slug}: missing`); continue; }
    const full = await strapi.documents(uid).findOne({
      documentId: doc.documentId,
      status: 'published',
      populate: { seo: { populate: '*' }, webflow: true, ...(collection.uid === 'case-study' ? { counters: true } : {}), ...Object.fromEntries(Object.values(collection.fields).filter((f) => f.type === 'media' || f.type === 'relation').map((f) => [f.name, true])) },
    });
    const check = (label, expected, actual) => {
      cells++;
      if (JSON.stringify(expected) !== JSON.stringify(actual)) problems.push(`${collection.uid}/${item.Slug} ${label}: expected ${JSON.stringify(expected)?.slice(0, 80)} got ${JSON.stringify(actual)?.slice(0, 80)}`);
    };
    for (const [column, field] of Object.entries(collection.fields)) {
      const raw = item[column];
      if (field.counter !== undefined) check(column, clean(raw), full.counters?.[field.counter]?.[field.key]);
      else if (field.type === 'media') check(column, clean(raw) || null, media(full[field.name]));
      else if (field.type === 'relation') check(column, clean(raw) || null, full[field.name]?.slug ?? null);
      else check(column, convert(field, raw), full[field.name] ?? (field.type === 'boolean' ? false : null));
    }
    check('Meta Description', clean(item['Meta Description']) || null, full.seo?.metaDescription ?? null);
    check('Meta Image', clean(item['Meta Image']) || null, media(full.seo?.metaImage));
    for (const [column, key] of Object.entries(SYSTEM)) {
      const expected = ['archived', 'draft'].includes(key) ? toBool(item[column]) : /On$/.test(key) ? toDateTime(item[column]) : clean(item[column]);
      const actual = /On$/.test(key) && full.webflow?.[key] ? new Date(full.webflow[key]).toISOString() : full.webflow?.[key];
      check(column, expected, actual);
    }
  }
  const total = await strapi.documents(uid).count({ status: 'published' });
  if (total !== items.length) problems.push(`${collection.uid}: ${total} published entries for ${items.length} CSV rows`);
  return { cells, problems };
}

// ---------- access for Astro
async function issueToken(strapi) {
  const tokens = strapi.service('admin::api-token');
  const existing = await tokens.getByName(TOKEN_NAME);
  const token = existing
    ? await tokens.regenerate(existing.id)
    : await tokens.create({ name: TOKEN_NAME, description: 'Used by the Astro site to read published content at build time.', type: 'read-only', lifespan: null });
  return token.accessKey;
}

function writeAstroEnv(accessKey) {
  const current = fs.existsSync(ASTRO_ENV) ? fs.readFileSync(ASTRO_ENV, 'utf8') : '';
  const values = { STRAPI_URL: PUBLIC_URL, STRAPI_TOKEN: accessKey };
  let next = current;
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    next = new RegExp(`^${key}=.*$`, 'm').test(next) ? next.replace(new RegExp(`^${key}=.*$`, 'm'), line) : `${next.replace(/\s*$/, '')}${next ? '\n' : ''}${line}\n`;
  }
  fs.writeFileSync(ASTRO_ENV, next);
}

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const categories = COLLECTIONS.find((c) => c.uid === 'blog-category');
    const imported = { 'blog-category': await importCollection(app, categories, {}) };
    for (const collection of COLLECTIONS.filter((c) => c !== categories)) {
      imported[collection.uid] = await importCollection(app, collection, imported['blog-category'].ids);
    }

    console.log('\nImported');
    let cells = 0;
    const problems = [];
    for (const collection of COLLECTIONS) {
      const { file, items } = imported[collection.uid];
      const result = await verify(app, collection, items);
      cells += result.cells;
      problems.push(...result.problems);
      console.log(`  ${collection.displayName.padEnd(14)} ${items.length} entries from ${file}`);
    }
    const mediaCount = await app.db.query('plugin::upload.file').count();
    console.log(`  Media library   ${mediaCount} files`);
    console.log(`\nVerified ${cells} CSV cells: ${problems.length ? problems.length + ' mismatches' : 'all match'}`);
    problems.forEach((p) => console.log('  ✗ ' + p));
    failed = problems.length > 0;

    if (!failed && process.env.SKIP_TOKEN !== '1') {
      writeAstroEnv(await issueToken(app));
      console.log(`\nIssued read-only API token "${TOKEN_NAME}" and wrote STRAPI_URL and STRAPI_TOKEN to ${ASTRO_ENV}`);
    }
  } catch (error) {
    console.error(error);
    failed = true;
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
})();
