# SPADA — Forged for the Arena

Multi-page static website for the Spada Barber brand. No build step, no dependencies —
plain HTML/CSS/JS that can be hosted anywhere (Netlify, Vercel, GitHub Pages, cPanel).

## Pages

| File | Page |
|---|---|
| `index.html` | Home — video hero, TORQ showcases, spec comparison, film band, accessories rack, buy channels |
| `torq-clipper.html` | TORQ Clipper product page |
| `torq-trimmer.html` | TORQ Trimmer product page |
| `torq-shaver.html` | TORQ Shaver product page |
| `accessories.html` | Blades & parts catalog |

## Run locally

Any static server works:

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

## Commercials

Both spec commercials are live in the home hero: `assets/videos/commercial-01.mp4`
(45 s) and `commercial-02.mp4` (22 s) — compressed to 720p from the masters in
`01.my assets/COMMERCIALs/`. They run back-to-back in an endless loop at low opacity
behind the centered headline, crossfading at each switch. The second film only starts
downloading after the first is playing. Commercial 02 also loops in the
"Every chair is an arena" band. Autoplay is muted and suppressed for reduced-motion users.

To swap a film: replace the file in `assets/videos/` (H.264 MP4). To re-compress a new
master on a Mac: `avconvert --source in.mp4 --preset Preset1280x720 --output out.mp4`.

## Logo

The registered SPADA wordmark (from `01.my assets/Spada_logo_registered.pdf`) lives at
`assets/brand/spada-logo-chrome.svg` (chrome white, used in nav/footer) and
`assets/brand/spada-logo.svg` (inherits CSS `currentColor`). Both are true vectors.

## Product renders

Web-optimized renders (trimmed, 1400 px, from `01.my assets/mockups/`) live in
`assets/images/renders/`. The trimmer still uses the empirebarber.ca photography in
`assets/images/products/` — no trimmer mockups were provided yet; drop them in
`01.my assets/mockups/Trimmer/` and ask Claude to process them the same way.

## SEO

Every page ships meta descriptions/keywords, Open Graph + Twitter cards, and JSON-LD
structured data (Organization, WebSite, Product with CAD offers, ItemList), plus
`sitemap.xml` and `robots.txt`. **All absolute URLs use the placeholder domain
`https://www.spadabarber.com`** — when the real domain is confirmed, search-replace
that string across the `.html` files, `sitemap.xml`, and `robots.txt`.

## Update purchase links

All Buy buttons read from **one place**: `PRODUCT_LINKS` at the top of `js/main.js`.
Each product has an `empire` (trade) and an `amazon` (consumer) URL.
The Empire Barber links already point at the live product pages; the Amazon values are
search links — replace them with the real product URLs when you have them.

The "Choose your door" dialog (every Buy button opens it) sends pros to Empire Barber
at trade price and everyone else to Amazon, and remembers each visitor's last choice.

## Design system

Tokens live at the top of `css/main.css` (colors in OKLCH, fonts, spacing).
The visual direction ("The Arena") is documented in `DESIGN.md`; brand strategy in
`PRODUCT.md`. Product images were pulled from empirebarber.ca into
`assets/images/products/` (`manifest.json` maps titles → prices → files).
