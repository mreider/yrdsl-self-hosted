import { z } from 'zod';

/**
 * Canonical public JSON shape for a yard sale.
 *
 * **The same two shapes (SaleSite + SaleItem) are used by both distribution
 * modes.** Self-hosted users author them by hand in `site.json` + `items.json`.
 * The hosted api-worker serializes D1 rows into the exact same shapes at
 * `GET /sales/{user}/{slug}` so the viewer renders identically in either
 * mode.
 *
 * Some fields are marked "host-only" in their JSDoc. They're optional and
 * the self-hosted template leaves them out. The hosted API populates them
 * from D1 for lifecycle bookkeeping (slug, publishedAt, etc.). The viewer
 * ignores them during render; they survive a round-trip so export-and-import
 * is lossless.
 *
 * Unit conventions:
 *  - Money: `price` is a plain number in `site.currency`'s smallest display
 *    unit (dollars, euros, etc.). The hosted api-worker divides D1's
 *    `items.price_cents / 100` on serialize.
 *  - Dates: ISO-8601 strings (`"2026-04-17"` for dates, full ISO for
 *    timestamps). The hosted api-worker converts D1's unix integers on
 *    serialize.
 *  - Currency: ISO 4217 code at the site level, not per-item. Mixing
 *    currencies in one sale is not supported.
 */

export const ReservationInfo = z.object({
  /** ISO date (YYYY-MM-DD) the item was reserved. */
  on: z.string(),
  /** Final agreed price (may differ from the listed price). */
  price: z.number(),
  note: z.string().optional(),
});
export type ReservationInfo = z.infer<typeof ReservationInfo>;

export const SaleItem = z.object({
  id: z.string(),
  /** Host-only: URL slug. Self-hosted uses `id` in deep links instead. */
  slug: z.string().optional(),
  title: z.string(),
  price: z.number(),
  tags: z.array(z.string()).default([]),
  /** ISO date (YYYY-MM-DD) added. Used for sort order. */
  added: z.string(),
  /** Optional single image. Either absolute URL or repo-relative path. */
  image: z.string().optional(),
  /** Multiple images. First is the card thumbnail. */
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  reserved: ReservationInfo.nullable().optional(),
  /** Host-only: manual sort override. */
  sortOrder: z.number().int().optional(),
  /** Host-only: last-edit timestamp (ISO-8601). */
  updatedAt: z.string().optional(),
});
export type SaleItem = z.infer<typeof SaleItem>;

export const SaleAbout = z.object({
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  heading: z.string(),
  body: z.string(),
});
export type SaleAbout = z.infer<typeof SaleAbout>;

export const SaleContact = z.object({
  email: z.string().email().optional(),
  /** Digits only, E.164 without the "+" (e.g. "15125551234"). Drives tel: links. */
  sms: z.string().optional(),
  /** Same format as sms; drives wa.me/<number> links. */
  whatsapp: z.string().optional(),
  /** Host-only: when true the hosted platform exposes a relay form. Self-hosted ignores. */
  useRelay: z.boolean().optional(),
  /** Host-only: free-form seller note shown near the contact buttons. */
  notes: z.string().optional(),
});
export type SaleContact = z.infer<typeof SaleContact>;

export const SaleSite = z
  .object({
    siteName: z.string(),
    subtitle: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    /** ISO-8601 timestamp; shown as a countdown/ends-at badge. */
    endsAt: z.string().optional(),
    about: SaleAbout.optional(),
    contact: SaleContact.optional(),
    /** Theme id from packages/themes. */
    theme: z.enum(['conservative', 'retro', 'hip', 'artsy']).default('conservative'),
    /** ISO 4217. Prices are formatted with this. */
    currency: z.string().length(3).default('USD'),
    /** BCP-47 default locale. Sibling `_xx` keys (e.g. `siteName_de`) override per-locale. */
    language: z.string().default('en'),
    /** Host-only: URL slug (`yrdsl.app/{user}/{slug}`). Self-hosted lives at a repo root. */
    slug: z.string().optional(),
    /** Host-only lifecycle timestamps (ISO-8601). */
    publishedAt: z.string().optional(),
    archivedAt: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough(); // sibling locale keys like `siteName_de` pass through.
export type SaleSite = z.infer<typeof SaleSite>;
