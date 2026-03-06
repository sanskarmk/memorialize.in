# memorialize.in

Premium marketing website concept for **MEMORIALIZE**, an AI-assisted 3D printed gifting brand.

## What’s in this project

- `index.html` — Main experience page with:
  - Hero and brand messaging
  - “How it works” process cards
  - Interactive order-configuration wizard
  - Gallery, occasions, pricing, tracking, testimonials, and footer
- `about.html` — Dedicated About page covering mission, process, and values
- `stories.html` — Multi-card customer story page with richer examples
- `CNAME` — Custom domain config for static hosting

## Highlights

- Futuristic dark UI with cyan accent system
- Custom cursor + animated particle/grid background
- Scroll reveal interactions
- Multi-step configuration flow (profile → generate → customize → review → checkout)
- Replaced emoji-based visuals with image assets across process, gallery, occasions, testimonials, and key checkout/status elements
- Expanded from a single-page feel into a small multi-page site (`index`, `about`, `stories`)

## Running locally

Since this is a static HTML project, you can open files directly or serve them via a lightweight static server.

### Option 1: Open directly

Open `index.html` in your browser.

### Option 2: Serve with Python

```bash
python -m http.server 8080
```

Then open:

- `http://localhost:8080/index.html`
- `http://localhost:8080/about.html`
- `http://localhost:8080/stories.html`

## Deployment

Deploy as a static site to platforms like:

- GitHub Pages
- Netlify
- Vercel (static output)
- Cloudflare Pages

If using GitHub Pages with custom domain, keep `CNAME` at repo root.

## Notes

- Image assets currently use remote URLs (Unsplash + Icons8).
- For production, consider self-hosting optimized assets to avoid third-party dependencies.
