# LT177

LT177 | A/B/n | Optimal Filter Display - All vs Top 1 vs Top 3 Open

Desktop PLPs and search results. Controls how many left-hand filter sections are open on page load. Build follows the Adobe Target approach (plain JavaScript, no template system).

## Arms

- **Control:** all filter sections open. No layout change. Events tracked.
- **V1:** only the top filter section open. The rest collapsed.
- **V2:** the top three filter sections open. The rest collapsed.

"Top" is the order the sections appear on the page at load (set by Algolia, so it differs by page). No filter names are hardcoded. Shoppers can still open and close any section, and sections they change are left alone.

## Behaviour

- Runs on desktop only (window width 992px and up, an assumed breakpoint to confirm).
- The filter panel is hidden (`lt177-pending` class, `styles.scss`) until the layout is set, or for 1.5s at most, to avoid a visible flicker.
- Layout changes are made with programmatic clicks on the section headings. These are not tracked, because only trusted clicks are tracked.

## Events

Event names are SCREAMING_SNAKE_CASE, sent as `conversioEvent` with `conversioEventName`.

| Event | Trigger | Parameters |
| --- | --- | --- |
| `LT177_PLP_FILTER_SECTION_TOGGLE` | Shopper expands or collapses a section | none |
| `LT177_PLP_FILTER_SECTION_TOGGLE_NAMED` | Same click, with the section name | `filter_name`, `action` (expand or collapse), `filter_position` |
| `LT177_PLP_FILTER_APPLIED` | Shopper ticks a filter option | `filter_name`, `filter_value`, `filter_position` |
| `LT177_PLP_TO_PDP_CLICK_THROUGH` | Shopper clicks a product card | none |
| `LT177_INCREASES_QUANTITY` | Shopper increases quantity on a card | none |
| `LT177_DECREASES_QUANTITY` | Shopper decreases quantity on a card | none |
| `LT177_CLEAR_ALL_FILTERS` | Shopper clicks Clear all | none |
| `LT177_CLEAR_INDIVIDUAL_FILTER` | Shopper removes one applied filter | none |

`filter_position` is the section's position when the page loaded.

Every event carries `experimentVariant` (Control, V1 or V2).

## Open points

- Search results pages: the brief says to use all PLPs, so search is included. Confirm the search results layout matches category PLPs.
- Breakpoint for desktop (992px assumed).
- Whether the two section-toggle events should both be sent (the brief lists both).

## Build

`npm run build:experience -- LT177 ...` does not build variations yet (the shared script expects `src/index.js` at the experience root). Build each arm from its own folder instead:

```bash
cd experiences/LT177/variation-1 && ../../../node_modules/.bin/webpack --config webpack.config.js --output-path ../../../dist/LT177/variation-1
cd experiences/LT177/variation-2 && ../../../node_modules/.bin/webpack --config webpack.config.js --output-path ../../../dist/LT177/variation-2
cd experiences/LT177/control && ../../../node_modules/.bin/webpack --config webpack.config.js --output-path ../../../dist/LT177/control
```

Output goes to `dist/LT177/<arm>/main.js` for Adobe Target.

## Test

From the repo root: `node test.js LT177 variation-1`, `node test.js LT177 variation-2` or `node test.js LT177 control`. The `npm run test:*` scripts in this folder point at `test.js` but fail when run here, so run them from the root.
