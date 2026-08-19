# FN091

Experience for: **finisterre**

## Structure

```
FN091/
├── variation-1/
│   ├── src/
│   │   ├── index.js
│   │   └── styles.scss
│   └── webpack.config.js
├── variation-2/
│   ├── src/
│   │   ├── index.js
│   │   └── styles.scss
│   └── webpack.config.js
├── control/
│   ├── src/
│   │   ├── index.js
│   │   └── styles.scss
│   └── webpack.config.js
└── package.json
```

## Development

Test a specific variation:

```bash
npm run test:v1    # Test variation 1
npm run test:v2    # Test variation 2
npm run test:control  # Test control
```

## Build

Build a specific variation:

```bash
npm run build:v1    # Build variation 1
npm run build:v2    # Build variation 2
npm run build:control  # Build control
```

## Conventions

- Use `elementReady(selector)` to wait for DOM elements
- Use `fireDataLayerEvent(name, data)` for tracking
- Avoid selectors on hashed `css-*` classes; prefer stable classes or `data-testid`
