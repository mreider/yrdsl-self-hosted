# yrdsl-self-hosted

A yard sale you self-host. Edit two JSON files, push to GitHub, GitHub
Pages serves it. No database, no auth, no server.

Live demo: <https://mreider.github.io/yrdsl-example/>

This is the self-hosted flavor of [yrdsl.app](https://yrdsl.app). If you
want the managed version (multi-sale accounts, email confirmation,
Claude via MCP over HTTPS, billing), sign up at yrdsl.app instead. Both
render from the exact same JSON shape, so you can move between them
without rewriting your data.

## Fork-and-run

1. Click **Use this template** → create your own repo (name it whatever).
2. Clone your new repo.
3. Edit `site.json` (your sale's name, location, contact info).
4. Edit `items.json` (your items).
5. Drop photos into `public/photos/` and reference them as
   `/photos/<filename>` from `items.json`.
6. `git commit && git push`.
7. In your repo's **Settings → Pages**, set source to "GitHub Actions".

The first push triggers `.github/workflows/deploy.yml` which builds and
publishes. Usually live in under a minute at
`https://<your-username>.github.io/<your-repo>/`.

## Run it locally first

```bash
pnpm install
pnpm dev
```

Opens on `http://localhost:5173`. Hot-reloads on JSON changes.

To validate the JSON shapes without starting the dev server:

```bash
pnpm validate
```

## Using Claude to edit

Open this repo in Claude Code. The `SKILL.md` at the repo root tells
Claude the file layout and common edits ("add an item", "mark reserved",
"change the theme"). Claude uses its built-in Read/Edit/Write/Bash tools
so nothing else needs to be installed.

Example prompts that work well:

- *"Add a toaster for $25, tags kitchen + appliance, using the photo I
   just saved as toaster.jpg."*
- *"Mark the couch reserved for $400 as of today."*
- *"Switch the theme to retro."*
- *"Commit and push."*

## Custom domain

1. Add a `CNAME` file at the repo root with your domain (e.g.
   `sale.mydomain.com`).
2. Point a CNAME DNS record at `<your-username>.github.io`.
3. In the repo's Settings → Pages, add the custom domain.
4. Edit `vite.config.ts` so `base` is `"/"` (remove the
   `GH_PAGES_BASE` override in the workflow).

## Theme options

Four themes ship with the renderer: `conservative`, `retro`, `hip`,
`artsy`. Set `"theme"` in `site.json`.

## Schema

JSON shapes are defined as zod schemas in `src/vendor/core/sale.ts`.
They're identical to what the hosted yrdsl.app API produces, so export
from one and import into the other works cleanly.

## License

Apache 2.0. Part of the [Kuvop OSS](https://oss.kuvop.com) family.
