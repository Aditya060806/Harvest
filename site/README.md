# harvest-scan — website

Promo landing page + docs for [`harvest-scan`](https://www.npmjs.com/package/harvest-scan), built with **Next.js 14 + Tailwind CSS + Framer Motion**.

## Local development

```bash
cd site
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy to Vercel

This site lives in the `site/` subdirectory of the repo. When importing the repo into Vercel:

1. New Project → import `Aditya060806/Harvest`.
2. **Root Directory:** set to `site`.
3. Framework preset: **Next.js** (auto-detected). Build command `next build`, output handled automatically.
4. Deploy.

Or via the Vercel CLI from this folder:

```bash
cd site
vercel        # preview
vercel --prod # production
```

## Editing

All links and copy live in [`lib/site.ts`](lib/site.ts) — change them in one place.
