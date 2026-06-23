# Aura — marketing / early-access site

Single-file static landing page for the Aura fitness app. Built to match the app's
real brand (neon yellow `#CCFF00` on dark `#0E0E0E`, JetBrains Mono headings, Tabler icons).

```
aura-web/
├── index.html              # landing / early-access (the marketing page)
├── privacy.html            # privacy policy   (EN) · privacy.es.html (ES)
├── terms.html              # terms of service (EN) · terms.es.html (ES)
├── support.html            # support + FAQ    (EN) · support.es.html (ES)
├── delete-account.html     # account deletion (EN) · delete-account.es.html (ES)
└── assets/
    ├── aura_logo.png
    └── captures/           # real in-app screenshots used on the landing page
        ├── cap-pulse.png       # hero — daily home
        ├── cap-planning.png    # showcase — weekly plan
        ├── cap-newsession.png  # showcase — new session
        ├── cap-coach.png       # showcase — live workout timer
        ├── cap-log.png         # showcase — training log
        └── cap-insights.png    # showcase — session review
```

Every content page has an EN/ES pair with a language toggle in the header.
The older `screen-hub/plan/log.png` files are no longer referenced.
Screenshots are localized: `assets/captures/*.png` (Spanish app UI) feed `index.es.html`;
`assets/captures/en/*.png` (English app UI) feed `index.html`.
`WEB_HANDOFF.md` and the `appstore-*` files are internal tooling and are
**excluded from the repo** via `.gitignore`.

## Store URLs

GitHub Pages serves clean paths (`/terms` → `terms.html`), so use these in
App Store Connect / Play Console:

| Purpose | URL |
|---|---|
| Marketing    | `https://aura.pampaiter.com` |
| Support      | `https://aura.pampaiter.com/support` |
| Privacy      | `https://aura.pampaiter.com/privacy` |
| Terms / EULA | `https://aura.pampaiter.com/terms` |
| Delete account | `https://aura.pampaiter.com/delete-account` |

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

## Deploy — DONE (GitHub Pages)

Live at **https://aura.pampaiter.com**, served from `pedrosr7/aura-web` (this folder),
branch `main` / root. Domain verified; the `CNAME` file points the custom domain and
Namecheap has `CNAME  aura  pedrosr7.github.io`.

Remaining one-off: **enforce HTTPS** once GitHub finishes provisioning the certificate
(after DNS fully propagates):

```bash
gh api -X PUT repos/pedrosr7/aura-web/pages -f https_enforced=true
```
