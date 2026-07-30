# conversio-experiences

Shared framework for Conversio's CRO team to build, test, and ship A/B test experiences. Consolidates scaffold, build tooling, local live-site tester, and reusable helpers.

## Quick Start

### Create a new experience

```bash
npm run scaffold -- WN003 --client=warner-hotels
```

Available clients: `warner-hotels`, `team-sport`, `laithwaites`, `finisterre`

### Test locally

```bash
cd experiences/WN003
npm run test
```

Launches Puppeteer with hot-reload. Edit `src/index.js` and changes inject automatically.

### Build for production

```bash
npm run build:experience -- WN003
```

Output: `dist/WN003/main.js` - paste into AB Tasty / Adobe Target.

## Architecture

### Monorepo Structure

```
conversio-experiences/
├── packages/
│   ├── helpers/          # Shared JS utilities (DOM, tracking, retry logic)
│   └── tester/           # Local test CLI
├── experiences/          # Individual A/B tests (WN003, etc.)
├── config/
│   ├── clients.json      # Client URLs registry
│   └── webpack.experience.js  # Shared webpack config
├── scripts/
│   ├── scaffold.js       # Generate new experience
│   └── build.js          # Build single experience
```

### Shared Helpers

Each experience imports `@conversio/helpers`:

```javascript
import {
  init,                   // Init wrapper with retry logic
  elementReady,           // Wait for DOM element
  fireDataLayerEvent,     // Send tracking event to dataLayer
  fireAdobeEvent,         // Send tracking event to Adobe
  injectStyles,           // Inject CSS
} from '@conversio/helpers';

// Example
init(5, () => {
  elementReady('body').then(() => {
    fireDataLayerEvent('experience_loaded', { code: 'WN003' });
  });
});
```

### Experience Structure

```
experiences/WN003/
├── package.json          # Defines client: "warner-hotels"
├── src/
│   ├── index.js          # Entry point
│   ├── styles.scss       # Styles
│   └── tracking.js       # (optional) Event tracking
├── webpack.config.js     # Extends shared config
└── README.md
```

## Development

### Setup

```bash
npm install
```

### Create & test an experience

```bash
npm run scaffold -- TEST001 --client=warner-hotels
npm run build:experience -- TEST001    # Build
npm run tester -- test TEST001         # Test locally (hot-reload)
```

### File structure conventions

- **Selectors**: Avoid hashed `css-*` classes (they change on every deploy). Use stable classes or `data-testid` instead.
- **Tracking**: Use `fireDataLayerEvent()` or `fireAdobeEvent()` with dedup built-in.
- **Retry**: The `init()` helper retries up to 5 times if DOM isn't ready; configure with `init(tries, runFn)`.

## Configuration

### clients.json

Maps client codes to URLs:

```json
{
  "clients": {
    "warner-hotels": {
      "name": "Warner Hotels",
      "url": "https://www.warnerhotels.com",
      "selectors": { ... }
    }
  }
}
```

### webpack.experience.js

Shared webpack config. Each experience can extend it:

```javascript
// experiences/WN003/webpack.config.js
const baseConfig = require('../../config/webpack.experience.js');

module.exports = {
  ...baseConfig('WN003'),
  // Override as needed
};
```

## Scripts

### npm run scaffold -- <CODE> --client=<CLIENT>

Generate a new experience folder with template files.

### npm run build:experience -- <CODE>

Build experience to `dist/<CODE>/main.js`.

### npm run tester -- test <CODE>

Launch local Puppeteer tester with hot-reload.

### npm run tester -- build <CODE>

Build without running Puppeteer (same as `build:experience`).

## Contributing

1. Create a new experience: `npm run scaffold -- WN003 --client=warner-hotels`
2. Develop and test locally: `npm run tester -- test WN003`
3. Commit to feature branch, PR to main
4. On merge, deploy the bundle from `dist/WN003/main.js` to AB Tasty / Adobe Target

## Next Steps

- [ ] Example experience with full tracking setup
- [ ] CI/CD pipeline to auto-build on merge
- [ ] Publish helpers to private npm (optional)
- [ ] Support for Adobe Target / AB Tasty config in experience metadata
