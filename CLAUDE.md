# Conversio A/B experiences

A shared repo for building experiences that are delivered through the client's testing tool: Dynamic Yield, Adobe Target or AB Tasty. One folder per experience, one branch per ticket. To build one from a Figma frame and an Asana ticket, use the `build-experience` skill. `README.md` and `CONTRIBUTING.md` are the human versions of the commands below.

**The one rule: branches are never merged with `main`.** Each experience is its own branch with its own code, and it stays a branch. Nothing is merged into `main`, and no pull request is opened. `main` holds only the shared tooling and docs. Never merge, rebase or open a pull request for a ticket branch, and do not offer to.

## Files

| Path | What it is |
|---|---|
| `experiences/<ID>/variation-1/src/index.js` | The variation. Plain browser JavaScript, no imports (`test.js` refuses a file that has them). |
| `experiences/<ID>/variation-2/src/index.js` | Second variation, if the ticket has one. |
| `experiences/<ID>/control/src/index.js` | The control. Tracking only, same events, no page changes. |
| `experiences/<ID>/<folder>/src/styles.scss` | CSS for that folder, if it has any. `test.js` compiles and injects it; the build writes the compiled `dist/<ID>/<folder>/styles.css`. |
| `experiences/<ID>/package.json`, `<folder>/webpack.config.js` | Made by the scaffold. Leave them. |
| `clients.json` | Prefix to client site URL. The only client list. |
| `scripts/scaffold.js`, `scripts/build.js`, `scripts/lib/experience.js` | Scaffold, build, and the shared lookup of experiences and sites. |
| `packages/tester` | `npm run tester -- test <ID> <folder>`: bundles the folder with webpack, then injects the bundle. An extra check. The bundle is not what gets pasted. |
| `packages/helpers` | Optional shared helpers (`elementReady`, `init`, ...). Experiences do not import them. |

Older experiences keep `src/` at the top of their folder (no variation folders). The scripts handle both.

## Naming

- Test ID, ticket ID and folder name are the same: client prefix plus number, e.g. `FN092`. A follow-up takes a suffix (`LT155.1`).
- Name the branch after the test ID and start it from `main` without tracking it: `git fetch && git checkout --no-track -b FN092 origin/main`. Push it (`git push origin FN092`) and leave it there. The branch name does not decide the client.
- Guard each script: `if (!window.__<id>Initialized) { window.__<id>Initialized = true; ... }` (lowercase id). The testing tool can run a script more than once.
- Style element ids and the classes you add start with the lowercase test ID, e.g. `fn092-styles`.
- Event label: `<ID> | (Variation 1) | <Event name>`. Second variation: `(Variation 2)`. Control: `(Control Original)`.
- Event segment: `<ID>EV1<letter>`, `<ID>EV2<letter>`, control `<ID>ECO<letter>`. The letters come from the event generator and are the same in the variation and the control (they usually start at G).

## clients.json

Maps a prefix to the client's site, e.g. `"FN": "https://www.finisterre.com"`. `test.js` opens, in order: a URL you pass, the `client` in the experience's `package.json` (if it is a prefix here), the leading letters of the code (`FN092` is `FN`), then the leading letters of the branch name. Add a prefix here before scaffolding for a new client. Some experiences run on another host from the one listed (WN012 runs on `book.warnerhotels.co.uk`): pass the URL.

## Tracking

- While building, `logEvent(name)` only does a `console.log` of the event. When the experience works, the user pastes in the events from the event generator app, with the segments. Replace the logging with the pasted push and copy the keys and casing exactly. Do not write the push from memory.
- The ticket says when each event fires and how often.
- If the experience itself clicks a button, that is not a real user click. Check `event.isTrusted` in the tracking listener so only real clicks fire an event.
- The control sends the same events with the control label and `ECO` segments, so the two can be compared.

Shapes the generator has produced so far, for reference only (the pasted snippet wins):

- Laithwaites: `adobeDataLayer.push({ event: "targetClickEvent", eventData: { click: { clickLocation: "Conversio CRO", clickAction: "<ID> | Event Tracking", clickText: "<ID> (Variation 1) | <Event name>" } } })`, no segment.
- Others: `dataLayer.push({ event: "conversioEvent", conversio: { category: "Conversio CRO", action: "<ID> | Event Tracking", label: ..., segment: ... } })`. The keys are camelCase (`eventCategory`) on FN, TS and most BM, and snake_case (`event_category`) on WN, SA and SY.
- Some tests (SA, SY, BM258) also push an experience event on load (`conversioExperience` or `conversio_experience`, with `experience_*` keys). Only if the ticket asks.

## A finished experience

- A `variation-1` folder (and `variation-2` if the ticket has one) and a `control` folder.
- Every event in the ticket's list is in the variation and the control, with the exact label and segment from the event generator.
- Guarded, runs once, leaves non-target pages alone.
- No `${...}` in the file. Dynamic Yield and Adobe Target do not support it, and AB Tasty is not confirmed, so avoid it everywhere. The file is pasted as written and nothing converts it: build strings with `+`. `test.js` and the build warn if `${` is there.
- No `console` lines left. Use them while testing, then remove every one before it goes out for testing.
- Ready to paste: the folder's `src/index.js` exactly as it is, and `dist/<ID>/<folder>/styles.css` if the folder has styles.

## Run

- `npm install` once.
- `npm run scaffold -- <ID> [--client=<PREFIX>]` creates `variation-1`, `variation-2` and `control`, each with a one-line starter. Delete the folders the ticket does not need. The client comes from the code's prefix.
- `node test.js <ID> <folder> [url]` opens Chrome on the client's site and injects that folder's `index.js` and compiled `styles.scss` on every page load. It reloads on save and prints the page's console in the terminal. `<folder>` is `variation-1`, `variation-2` or `control` (default `variation-1`).
- `npm run build:experience -- <ID> [folder]` compiles the folder's SCSS to `dist/<ID>/<folder>/styles.css` (every folder if none is named) and warns about `${` or imports in the source. It also writes `main.js`, a webpack bundle for the tester package. Do not paste that.
- What goes into the testing tool: the folder's `src/index.js` as it is, and the `styles.css` if the build wrote one. Nothing is bundled or changed for you.
- `npm run tester -- test <ID> <folder>` injects the webpack bundle. Optional: `node test.js` already injects what you paste.
- There is no automated test suite. Check by hand, as set out in the skill.

## Gotchas

- Dynamic Yield replaces `${...}` with nothing. On BM257 it blanked a media query, and rules meant for phones applied on desktop too.
- Dynamic Yield previews can serve an older save for a few minutes after you save. Each save gives a new preview link. Reload, and confirm you are on the latest.
- Sites re-render and replace nodes: use `MutationObserver` waits and delegated listeners, and make every DOM change safe to repeat.
- `test.js` injects after the page has loaded, so it hides flicker and early-run problems. Check in the testing tool's preview as well.
- iPhone Safari: a text field under 16px zooms the page when tapped, so use 16px or more for form fields on phones. Safari 26 floats its toolbar over the page and clips fixed elements at the page area. The on-screen keyboard moves the visible area (`visualViewport`). Tapping a modal can focus it, and a site may raise a focused element (BM257: `z-index: 10`) over your fixed buttons, so give them a higher `z-index`. Use the iOS Simulator for these.
- Do not toggle classes on `<html>` or `<body>` from a resize handler: the site may reset them, and the two can loop and freeze the page (BM257).
