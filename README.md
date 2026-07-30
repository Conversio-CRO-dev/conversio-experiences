# conversio-experiences

Shared framework for Conversio's CRO team to build, test, and ship A/B test experiences. One repo, shared helpers, local headed-browser testing with live reload.

## Quick Start

### 1. Create a new experience

```bash
npm run scaffold -- CNV001 --client=conversio
```

Available clients: See `clients.json` for registered clients, or map your git branch prefix (e.g., `feature/cnv001` uses prefix `FEATURE`).

### 2. Develop locally

```bash
node test.js CNV001
```

Launches Chrome, navigates to conversio.com, injects your code, and auto-reloads on file saves. Console logs forward to your terminal.

### 3. Edit your code

Open `experiences/CNV001/src/index.js` and write plain JavaScript:

```javascript
console.log("CNV001 loaded");

// Your code here - no bundling, no imports needed
document.body.style.backgroundColor = "red";
```

Save and watch it inject live in the browser.

### 4. Build for production

```bash
npm run build:experience -- CNV001
```

Output: `dist/CNV001/main.js` - paste into AB Tasty / Adobe Target.

## How It Works

### Monorepo Structure

```
conversio-experiences/
├── experiences/              # Individual experiences (CNV001, WN003, etc.)
│   └── CNV001/
│       ├── src/
│       │   ├── index.js      # Plain JavaScript, no imports
│       │   └── styles.scss   # (optional) SCSS compiled on inject
│       ├── package.json      # client: "conversio"
│       └── webpack.config.js
├── packages/
│   └── helpers/              # Shared utilities (optional for future use)
├── config/
│   ├── clients.json          # Maps branch prefixes & codes to URLs
│   └── webpack.experience.js
├── scripts/
│   ├── scaffold.js           # Generate new experience
│   └── build.js              # Compile to dist/
└── test.js                   # Local tester (Puppeteer + auto-reload)
```

### Experience Structure

```
experiences/CNV001/
├── src/
│   ├── index.js              # Plain JavaScript
│   └── styles.scss           # Compiled & injected
├── package.json              # { "client": "conversio" }
└── webpack.config.js         # Extends shared config
```

Write plain JavaScript in `index.js` — no imports, no module system:

## Development Workflow

### Setup

```bash
npm install
```

### Create a new experience

```bash
npm run scaffold -- WN_HERO --client=warner-hotels
cd experiences/WN_HERO
```

### Test locally (live reload)

```bash
node test.js WN_HERO
```

This:
1. Reads your `src/index.js`
2. Compiles `src/styles.scss` (if it exists)
3. Launches Chrome and navigates to warner-hotels.com
4. Injects your code
5. Watches for file changes and auto-reloads
6. Forwards console logs to your terminal

Press `Ctrl+C` to stop.

### Build for production

```bash
npm run build:experience -- WN_HERO
```

Output: `dist/WN_HERO/main.js` — paste into AB Tasty / Adobe Target.

## Configuration

### clients.json

Maps branch prefixes and experience codes to client URLs:

```json
{
  "WN": "https://www.warnerhotels.co.uk",
  "TS": "https://www.team-sport.co.uk/",
  "CNV": "https://www.conversio.com/",
  "FEATURE": "https://www.conversio.com/"
}
```

On branch `feature/cnv001`, prefix is `FEATURE` → uses conversio.com.
On branch `wn-hero`, prefix is `WN` → uses warner-hotels.
Or pass a URL manually: `node test.js WN_HERO https://custom-url.com`

## Best Practices

- **Selectors**: Avoid hashed `css-*` classes (change on deploy). Use stable classes or `data-testid`.
- **SCSS**: Optional. If `src/styles.scss` exists, it's compiled and injected.
- **Console logs**: Write them freely — they forward to your terminal.


## Contributing

1. Create a feature branch: `git checkout -b feature/cnv001`
2. Scaffold: `npm run scaffold -- CNV001 --client=conversio`
3. Test locally: `node test.js CNV001`
4. Iterate and commit to your branch
5. Push: `git push origin feature/cnv001`
6. Create PR to main
7. On merge, deploy `dist/CNV001/main.js` to AB Tasty / Adobe Target

## Notes

- Each experience is independent. You can work on multiple experiences across branches without conflicts.
- `test.js` uses Puppeteer 25.1.0 (headed Chrome). Requires Puppeteer installed (`npm install`).
- No webpack bundling for test.js—just plain JavaScript injection. Keep your code simple.
- Helpers in `packages/helpers/` are available if you need shared utilities (optional for future).

## Future Enhancements

- [ ] CI/CD to auto-build on PR
- [ ] Publish helpers package to npm
- [ ] Support Adobe Target metadata
- [ ] Variant A/B/Control templates
