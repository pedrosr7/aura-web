# Aura — marketing / early-access site

Single-file static landing page for the Aura fitness app. Built to match the app's
real brand (neon yellow `#CCFF00` on dark `#0E0E0E`, JetBrains Mono headings, Tabler icons).

```
aura-web/
├── index.html        # the whole site (Tailwind via CDN + inline CSS/JS)
└── assets/
    ├── aura_logo.png
    └── captures/      # real in-app screenshots used on the page
        ├── cap-pulse.png       # hero — daily home
        ├── cap-planning.png    # showcase — weekly plan
        ├── cap-newsession.png  # showcase — new session
        ├── cap-coach.png       # showcase — live workout timer
        ├── cap-log.png         # showcase — training log
        └── cap-insights.png    # showcase — session review
```

> The older `screen-hub/plan/log.png` files are no longer referenced — the page
> now uses the real captures above.

## Two things to wire up before launch

1. **Store links** — the App Store / Play Store buttons in the hero currently point to
   `#early-access`. Once the app is live, search `data-store="ios"` / `data-store="android"`
   in `index.html` and replace each `href="#early-access"` with the real store URL.

2. **Waitlist emails** — the form currently just shows a success message. To actually
   collect emails, create a free form at <https://formspree.io>, then in `index.html`
   find `var ENDPOINT = null;` and set it to your endpoint, e.g.
   `var ENDPOINT = 'https://formspree.io/f/abcdwxyz';`
   (Or point it at an Aura Ktor server route if you prefer to own the data.)

## Local preview

```bash
npx serve aura-web
```

## Deploy (GitHub Pages, same flow as pampaiter.com)

Recommended URL: `aura.pampaiter.com` (subdomain).

1. New GitHub repo `aura-web`, push this folder.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Add a `CNAME` file containing `aura.pampaiter.com`.
4. In Namecheap → Advanced DNS, add: `CNAME  aura  pedrosr7.github.io`.
5. Settings → Pages → Custom domain → `aura.pampaiter.com` → Enforce HTTPS.
