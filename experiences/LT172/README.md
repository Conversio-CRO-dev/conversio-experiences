# LT172

Experience for: **LT** (https://www.laithwaites.co.uk)

## Structure

```
LT172/
├── variation-1/src/index.js, styles.scss
├── variation-2/src/index.js, styles.scss   (delete if the ticket has one variation)
├── control/src/index.js                    (tracking only, no page changes)
└── guide.html                              (step-by-step page for this experience, open it in a browser)
```

## Develop

```bash
npm run test:v1       # or test:v2, test:control
```

## Build

```bash
npm run build         # every folder: compiles the CSS to dist/LT172/<folder>/styles.css
npm run build:v1      # or build:v2, build:control
```

## Ship

Paste <folder>/src/index.js into the testing tool exactly as it is, and dist/LT172/<folder>/styles.css if the build wrote one.

## Conventions

See CLAUDE.md in the repo root: naming, tracking, what a finished experience looks like.
