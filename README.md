# conversio-experiences

Shared repo for Conversio's CRO team to build, test and ship A/B experiences for the testing tools we use (Dynamic Yield, Adobe Target, AB Tasty). One folder per experience, local headed-browser testing with live reload.

Step by step: [CONTRIBUTING.md](CONTRIBUTING.md). Conventions, tracking and gotchas: [CLAUDE.md](CLAUDE.md).

## Quick start

```bash
npm install
npm run scaffold -- FN092                  # creates experiences/FN092: variation-1, variation-2, control
node test.js FN092 variation-1             # opens the client's site, injects your code, reloads on save
node test.js FN092 control                 # the control, tracking only
npm run build:experience -- FN092          # dist/FN092/<variation>/main.js, JS and CSS in one file
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
packages/tester                                # `npm run tester -- test FN092 variation-1`: builds, then injects the built file
```

Older experiences keep `src/` at the top of their folder (no variation folders). `test.js` and the build handle both.

## Which site opens

`test.js` uses, in order: a URL you pass, the `client` in the experience's `package.json`, the leading letters of the code (`FN092` is `FN`), then the leading letters of the branch name. Prefixes are in `clients.json`. If an experience runs on another host, pass the URL: `node test.js WN012 variation-1 https://book.warnerhotels.co.uk/...`.

## Notes

- Experiences are plain JavaScript with no imports. `test.js` refuses a file that has them.
- `test.js` is the quick loop while building. `npm run tester -- test <CODE> <variation>` builds with webpack and injects the built file, which is what gets pasted. Use it as the final check.
- There is no automated test suite. Check by hand (see CLAUDE.md).
