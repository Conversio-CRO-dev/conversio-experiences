---
name: build-experience
description: Build a Conversio A/B experience from a Figma frame and an Asana ticket. Reads the ticket, pulls exact values from Figma, writes the variation (JS and CSS), wires the client's event tracking, builds the control, and verifies it. Use when starting or continuing a ticket such as FN092, WN012 or BM261.
---

# Build an experience

You need an Asana ticket and a Figma frame. Read `CLAUDE.md` first for naming, files, tracking, the commands and the gotchas.

## 1. Read the ticket

Use the Asana tools (`get_task`, `get_task_stories`, `get_attachments`). Pull out: the test ID, the client page to run on, which testing tool it is for (Dynamic Yield, Adobe Target or AB Tasty), what each variation changes, and the event list (name, when it fires, how often). If something is missing, ask. Do not guess selectors, copy or events. The events themselves come later from the event generator app; build the UI first.

## 2. Branch and scaffold

`git fetch && git checkout --no-track -b <ID> origin/main`. Check the prefix is in `clients.json`. If it is missing, ask before adding it.

The branch is never merged with `main` and never gets a pull request. Do not merge, rebase or open a pull request for it, and do not offer to. When the experience is done, it stays a branch.

`npm run scaffold -- <ID>` creates `variation-1`, `variation-2` and `control`, each with a one-line starter, and `guide.html`, a step-by-step page for the user that is already filled in for this experience. Delete the folders the ticket does not need. If the user gives you the Asana or Figma links, `npm run guide -- <ID> --asana="<link>" --figma="<link>"` puts them in that page.

## 3. Figma: exact values, required

Do not build from a screenshot. For every frame and state you build (mobile, desktop, open, closed), run both:

- `get_design_context` for layout, spacing, sizes, text, colours and assets.
- `get_variable_defs` for the design's own tokens (colours, type, spacing).

Put those numbers straight into the CSS. Use `get_screenshot` only at the end, to compare. If the Figma tools are not available, stop and tell the user. Do not estimate from an image.

## 4. Look at the live page first

Run `node test.js <ID> variation-1` and inspect the real DOM before writing any selector. Check how the page re-renders (single-page apps replace nodes), and whether elements load late.

## 5. Write the files in this order

1. `experiences/<ID>/variation-1/src/index.js`: replace the starter with the skeleton in step 6.
2. `styles.scss` in the same folder, from the Figma numbers. Or inject a `<style>` from the JS.
3. Behaviour.
4. Events (step 7).
5. `experiences/<ID>/control/src/index.js`: only the tracking from the variation, with the control label and `ECO` segments. It must not change the page. Events that exist only because of the new UI do not go in it.

Do `variation-2` the same way if the ticket has one. Delete `variation-2` if it does not.

## 6. House patterns

The skeleton to start every variation from (`<id>` is the lowercase test ID; the control uses the same guard and `logEvent`, and nothing else):

```js
if (!window.__<id>Initialized) {
  window.__<id>Initialized = true;

  // While building this only logs. Replace the body with the push from the event generator.
  function logEvent(name) {
    console.log('[<ID>] event: ' + name);
  }

  // Resolves with the element, or null once the timeout passes.
  function elementReady(selector, timeout) {
    return new Promise(function (resolve) {
      var existing = document.querySelector(selector);
      if (existing) { resolve(existing); return; }

      var timer;
      var observer = new MutationObserver(function () {
        var found = document.querySelector(selector);
        if (!found) return;
        observer.disconnect();
        clearTimeout(timer);
        resolve(found);
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      timer = setTimeout(function () { observer.disconnect(); resolve(null); }, timeout || 10000);
    });
  }

  // Your code. Add styles once, under an id that starts with the test ID ('<id>-styles'),
  // or put them in styles.scss.
}
```


- Guard the whole script: `if (!window.__<id>Initialized) { window.__<id>Initialized = true; ... }`. The testing tool can run it more than once.
- Plain JavaScript, no imports: `test.js` refuses a file that has them. Write helpers in the file.
- Wait for elements with `elementReady(selector, timeout)` (a `MutationObserver`), not a fixed delay.
- Make every DOM change safe to repeat: check before inserting, give your `<style>` an id (`<id>-...-styles`) and add it once, prefix the classes you add with the test ID.
- Never write `${...}` in what is pasted. Dynamic Yield and Adobe Target do not support it. Build strings with `+`. The file is pasted as written and nothing converts it. (`test.js` and the build warn about it.)
- Use the breakpoints and numbers from Figma, not the page's.
- Phones: form fields at 16px or more, a high `z-index` on fixed buttons, and no class toggling on `<html>` from a resize handler. See the gotchas in `CLAUDE.md`.

## 7. Tracking

- While building, `logEvent(name)` only calls `console.log`. Do not write the dataLayer push yourself: the format differs by client.
- When the UI works, ask the user for the events from the event generator app. Paste them in as given (exact keys, casing, segments) in place of the logging, and keep one map of event name to segment.
- Follow the ticket on how often each event fires (once per page view, or every click). Delegate click listeners instead of binding to nodes that get replaced.
- If the experience itself clicks a button, that click is not a real user click. The tracking listener must check `event.isTrusted` and ignore it.
- Put the same helper in the control, with the control label.

## 8. Verify

Run through all of these before calling it done:

- [ ] `node test.js <ID> variation-1` loads the client page and the terminal shows no `[page:error]` lines.
- [ ] Computed styles match Figma (spot-check the `get_variable_defs` values in the inspector).
- [ ] Checked at mobile and desktop widths. Chrome's phone mode misses Safari-only issues, so check once in the iOS Simulator.
- [ ] Each event in the ticket fires once per interaction: as a `console.log` while building, then as the pushed event once the generator's events are in, with the exact label and segment. Tick them off against the ticket list one by one.
- [ ] `node test.js <ID> control` sends the same events with the control label, and the page is unchanged.
- [ ] Pages the experience is not meant for are untouched.
- [ ] Last step, once everything works: remove every `console` line (the event logging included).
- [ ] `npm run build:experience -- <ID>` prints no warning, and lists `styles.css` for every folder that has styles.
- [ ] Paste `src/index.js` as it is, plus `dist/<ID>/<folder>/styles.css` if there is one, into the testing tool's preview and check there too (`test.js` injects after load, so it hides flicker and early-run problems). Previews can serve an older save: reload and confirm you are on the latest. Do not paste `main.js`.
