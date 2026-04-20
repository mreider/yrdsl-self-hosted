#!/usr/bin/env node
// Validates site.json + items.json against the zod schemas before build.
// Run via `pnpm validate` or from the GH Action.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Dynamic import so we pick up the vendored zod from node_modules.
const { SaleSite, SaleItem } = await import(`${root}/src/vendor/core/sale.ts`).catch(
  async () => {
    // `.ts` import fails under plain node; fall back to reading + eval via tsx/esbuild-register
    // isn't worth a new dep. Instead, read the file and re-import zod manually.
    const { z } = await import('zod');
    // Re-declare minimal shapes matching sale.ts. Keep in sync by hand — this is
    // a pre-commit sanity check, not a substitute for the actual schema.
    const ReservationInfo = z.object({
      on: z.string(),
      price: z.number(),
      note: z.string().optional(),
    });
    const SaleItem = z.object({
      id: z.string(),
      slug: z.string().optional(),
      title: z.string(),
      price: z.number(),
      tags: z.array(z.string()).default([]),
      added: z.string(),
      image: z.string().optional(),
      images: z.array(z.string()).optional(),
      description: z.string().optional(),
      reserved: ReservationInfo.nullable().optional(),
      sortOrder: z.number().int().optional(),
      updatedAt: z.string().optional(),
    });
    const SaleContact = z.object({
      email: z.string().email().optional(),
      sms: z.string().optional(),
      whatsapp: z.string().optional(),
      useRelay: z.boolean().optional(),
      notes: z.string().optional(),
    });
    const SaleAbout = z.object({
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      heading: z.string(),
      body: z.string(),
    });
    const SaleSite = z
      .object({
        siteName: z.string(),
        subtitle: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        endsAt: z.string().optional(),
        about: SaleAbout.optional(),
        contact: SaleContact.optional(),
        theme: z.enum(['conservative', 'retro', 'hip', 'artsy']).default('conservative'),
        currency: z.string().length(3).default('USD'),
        language: z.string().default('en'),
        slug: z.string().optional(),
        publishedAt: z.string().optional(),
        archivedAt: z.string().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      })
      .passthrough();
    return { SaleSite, SaleItem };
  },
);

const site = JSON.parse(readFileSync(`${root}/site.json`, 'utf8'));
const items = JSON.parse(readFileSync(`${root}/items.json`, 'utf8'));

const siteResult = SaleSite.safeParse(site);
if (!siteResult.success) {
  console.error('❌ site.json is invalid:');
  for (const issue of siteResult.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const itemsResult = SaleItem.array().safeParse(items);
if (!itemsResult.success) {
  console.error('❌ items.json is invalid:');
  for (const issue of itemsResult.error.issues) {
    console.error(`  [${issue.path.join('.')}]: ${issue.message}`);
  }
  process.exit(1);
}

// Photo path sanity check: warn on references to files that don't exist.
const { existsSync } = await import('node:fs');
const missing = [];
for (const item of itemsResult.data) {
  const imgs = [item.image, ...(item.images ?? [])].filter(Boolean);
  for (const img of imgs) {
    if (img.startsWith('http')) continue; // external URL
    const path = resolve(root, 'public', img.replace(/^\//, ''));
    if (!existsSync(path)) missing.push(`${item.id}: ${img}`);
  }
}
if (missing.length) {
  console.warn('⚠️  items.json references photos that don\'t exist:');
  for (const m of missing) console.warn(`  ${m}`);
  console.warn('  (The site will still build; items will render without thumbnails.)');
}

console.log(`✅ site.json valid; ${itemsResult.data.length} items valid.`);
