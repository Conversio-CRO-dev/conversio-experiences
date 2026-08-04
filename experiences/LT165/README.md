# LT165

Experience for: **laithwaites**

## Development

```bash
npm run test
```

This launches a Puppeteer browser with hot-reload. Edit files in `src/` and they'll auto-inject.

## Build

```bash
npm run build
```

Output: `dist/LT165/main.js`

## Structure

- `src/index.js` - Entry point, wrapped in `init()` helper
- `src/styles.scss` - Styles (auto-injected via webpack)
- `webpack.config.js` - Extends shared config

## Conventions

- Use `elementReady(selector)` to wait for DOM elements
- Use `fireDataLayerEvent(name, data)` for tracking
- Avoid selectors on hashed `css-*` classes; prefer stable classes or `data-testid`
