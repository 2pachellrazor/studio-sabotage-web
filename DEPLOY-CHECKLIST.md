# Studio Sabotage -- Deploy-Checkliste

Shopify Custom Theme mit Three.js 3D-Galerie.
Store: `0u99wg-s5.myshopify.com` | Theme-ID: `198214746454`

---

## 1. PRE-DEPLOY -- Git & Repo

- [ ] Auf Branch `main`?
- [ ] `git status` sauber -- keine uncommitteten Aenderungen?
- [ ] `git fetch origin && git status` -- kein Diverge zwischen lokal und remote?
- [ ] Alle relevanten Aenderungen committed und gepusht?
- [ ] Commit-Message beschreibt die Aenderungen klar?

## 2. CODE-QUALITAET

### Console & Debug
- [ ] Keine ungewollten `console.log` / `console.warn` / `debugger` Statements?
      Bekannte Ausnahmen: `consent.js` (Consent-Logs "[Consent] Analytics/Marketing: erlaubt" -- gewollt)
- [ ] P-Key Debug-Overlay in `subrosa.js` -- startet hidden (OK)
- [ ] P-Key Debug-Overlay in `about3d.js` -- startet hidden (OK)
- [ ] P-Key Debug-Overlay in `gallery-main.js` -- startet hidden (OK)

### URLs & Referenzen
- [ ] Keine `localhost` / `127.0.0.1` Referenzen im Code?
- [ ] Keine hartcodierten Test-URLs oder Staging-Domains?
- [ ] Alle Asset-URLs nutzen `window.SS_ASSETS`-Pattern statt hartcodierter Pfade?

### Meta-Tags (je Seite pruefen)
- [ ] `index.liquid` -- `<title>`, `og:title`, `og:image`, `og:description` korrekt?
- [ ] `page.gallery.liquid` -- Canonical URL `https://studiosabotage.com/pages/gallery`?
- [ ] `page.gallery3d.liquid` -- Canonical URL `https://studiosabotage.com/pages/gallery3d`?
- [ ] `page.about3d.liquid` -- Canonical URL `https://studiosabotage.com/pages/about`?
- [ ] `og:image` verweist auf gueltige, erreichbare URL?
- [ ] Favicon-Pfade korrekt?

## 3. THREE.JS / 3D-SPEZIFISCH

### GLB-Dateien
- [ ] `manufactory.glb` (~3.4 MB, Draco-komprimiert von 35MB) liegt auf Shopify CDN?
- [ ] `room.glb` -- Referenz ueber `window.SS_ASSETS.roomGlb`?
- [ ] `gallery.glb` -- Referenz ueber `window.SS_ASSETS.galleryGlb`?
- [ ] Keine lokalen Dateipfade zu GLBs im JS-Code?

### DRACO Decoder
- [ ] Alle 3 JS-Dateien: DRACO-Pfad `gstatic.com/draco/versioned/decoders/1.5.7/`
- [ ] gstatic DRACO-URL erreichbar?

### Three.js Versionen (Import Maps)
- [ ] `page.gallery3d.liquid` -- Three.js `@0.164.1` via jsdelivr
- [ ] `page.gallery.liquid` + `page.about3d.liquid` -- Three.js `@0.162.0` via jsdelivr
- [ ] ACHTUNG: Versionsunterschied beabsichtigt? (Sub Rosa = 0.164.1, Rest = 0.162.0)

## 4. SEITEN-UEBERGREIFEND

### Navigation (4 Seiten)
- [ ] Landing (`/`) -- CTA-Link fuehrt zu `/pages/gallery`?
- [ ] Gallery -- Nav: Gallery (aktiv), Sub Rosa, About
- [ ] Sub Rosa -- Nav: Gallery, Sub Rosa (aktiv), About
- [ ] About -- Nav: Gallery, Sub Rosa, About (aktiv)

### Impressum & Rechtliches
- [ ] Gallery: Impressum-Overlay oeffnet per `data-legal="impressum"`
- [ ] Sub Rosa: Impressum-Link verweist auf `/pages/gallery#impressum`
- [ ] About: Impressum-Link verweist auf `/pages/gallery#impressum`
- [ ] Landing: Impressum-Link im Footer verweist auf `/pages/gallery#impressum`
- [ ] Datenschutz-Link im Cookie-Banner oeffnet Overlay (Gallery) oder navigiert zu `/pages/gallery#datenschutz` (andere Seiten)
- [ ] AGB-Overlay erreichbar?

### Cookie-Banner & Analytics (alle 4 Seiten)
- [ ] Cookie-Banner erscheint auf Landing, Gallery, Sub Rosa, About (via `snippets/cookie-consent.liquid`)
- [ ] "Zustimmen" laedt GTM Container `GTM-MGCNGSVV` (consent-gated)
- [ ] "Alle ablehnen" blockiert GTM-Load
- [ ] GA4 Mess-ID `G-N4W63Q3W4P` laeuft durch GTM (Tag "GA4 - Studio Sabotage")
- [ ] Shopify's built-in Cookie-Banner ist deaktiviert

### Footer
- [ ] Copyright-Jahr aktuell (2026)?
- [ ] Instagram-Link `@babydonthvrtme` korrekt und erreichbar?

### Mobile / Touch
- [ ] Touch-Controls in allen 3 JS-Dateien funktionieren?
- [ ] Kein Pointer-Lock-Bug auf iOS Safari?
- [ ] Viewport Meta-Tag auf allen 3D-Seiten gesetzt?

## 5. DEPLOY AUSFUEHREN

### Push
```bash
export PATH="$HOME/.local/node/bin:$PATH" && \
cd /Users/wladi/Documents/GitHub/studio-sabotage-web/shopify-theme && \
shopify theme push --store 0u99wg-s5.myshopify.com \
  --theme 198214746454 --allow-live
```
- [ ] Keine Fehler im Push-Output?
- [ ] Alle erwarteten Dateien hochgeladen?

## 6. POST-DEPLOY -- Verifizierung

### Desktop
- [ ] Landing laedt (`studiosabotage.com`)
- [ ] Gallery -- 3D-Raum betretbar, Bilder sichtbar
- [ ] Sub Rosa -- Manufactory-GLB laedt komplett
- [ ] About -- Room-GLB laedt, Hotspots funktionieren

### 3D-Funktionen
- [ ] Gallery: Pointer-Lock, WASD, Produkt-Modal, Raumwechsel
- [ ] Sub Rosa: Navigation fluessig
- [ ] About: Kamera-Steuerung, Hotspot-Klicks

### Mobile (echtes Geraet)
- [ ] Touch-Steuerung in allen Raeumen
- [ ] Kein Layout-Fehler, Schrift lesbar

### Optional -- Release-Tag
```bash
git tag -a v1.X.X -m "Beschreibung"
git push origin v1.X.X
```

---

## Schnell-Referenz

| Seite | Template | JS | CSS | GLB |
|-------|----------|----|-----|-----|
| Landing | `index.liquid` | `landing.js` | `landing.css` | -- |
| Gallery | `page.gallery.liquid` | `gallery-main.js` | `gallery-main.css` | `gallery.glb` |
| Sub Rosa | `page.gallery3d.liquid` | `subrosa.js` | `subrosa.css` | `manufactory.glb` (~3.4 MB, Draco) |
| About | `page.about3d.liquid` | `about3d.js` | `about3d.css` | `room.glb` |

**Shared Components (auf allen 4 Seiten):**
- `snippets/cookie-consent.liquid` -> `consent.js` + `consent.css` (GTM `GTM-MGCNGSVV`)
- `assets/components-header.css` (Header)
- `assets/components-footer.css` (Footer)
- `assets/tokens.css` (Design-Tokens: Farben, Typography, z-index-Skala, @font-face)

**Repo:** `2pachellrazor/studio-sabotage-web` (Branch: `main`)
**Store:** `0u99wg-s5.myshopify.com`
**Theme-ID:** `198214746454`
**GTM Container:** `GTM-MGCNGSVV` | **GA4 Mess-ID:** `G-N4W63Q3W4P`
