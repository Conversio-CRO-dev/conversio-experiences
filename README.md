# conversio-experiences

Shared repo for Conversio's CRO team to build, test and ship A/B experiences for the testing tools we use (Dynamic Yield, Adobe Target, AB Tasty). One folder per experience, local headed-browser testing with live reload.

Step by step: [CONTRIBUTING.md](CONTRIBUTING.md). Conventions, tracking and gotchas: [CLAUDE.md](CLAUDE.md).

## Quick start

```bash
npm install
npm run scaffold -- FN092                  # creates experiences/FN092: variation-1, variation-2, control
node test.js FN092 variation-1             # opens the client's site, injects your code, reloads on save
node test.js FN092 control                 # the control, tracking only
npm run build:experience -- FN092          # writes dist/FN092/<folder>/styles.css, the CSS you paste
```

## Layout

```
experiences/FN092/
├── variation-1/src/index.js, styles.scss     # plain JavaScript (no imports) and optional SCSS
├── variation-2/...                            # only if the ticket has two variations
├── control/src/index.js                       # tracking only, no page changes
└── package.json                               # { "client": "FN" } plus the test and build scripts
clients.json                                   # prefix to site URL: FN, LT, WN, BM, ...
scripts/                                       # scaffold and build
packages/tester                                # `npm run tester -- test FN092 variation-1`: optional check on a webpack bundle
```

Older experiences keep `src/` at the top of their folder (no variation folders). `test.js` and the build handle both.

## Which site opens

`test.js` uses, in order: a URL you pass, the `client` in the experience's `package.json`, the leading letters of the code (`FN092` is `FN`), then the leading letters of the branch name. Prefixes are in `clients.json`. If an experience runs on another host, pass the URL: `node test.js WN012 variation-1 https://book.warnerhotels.co.uk/...`.

## Notes

- **Nothing is ever merged into `main`.** Each experience is its own branch, started from `main` and left as a branch: no merges, no pull requests. `main` holds only the shared tooling and docs.
- Experiences are plain JavaScript with no imports. `test.js` refuses a file that has them.
- What you paste into the testing tool: the folder's `src/index.js` exactly as it is, and `dist/<CODE>/<folder>/styles.css` if the folder has styles (`npm run build:experience` writes it). Nothing is bundled or changed for you.
- `test.js` is the quick loop while building, and it injects what you paste. `npm run tester -- test <CODE> <variation>` is an optional extra check on a webpack bundle, which is not pasted.
- There is no automated test suite. Check by hand (see CLAUDE.md).
