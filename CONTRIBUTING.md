# Contributing: building an experience

## Set up (once)

```bash
git clone git@github.com:Conversio-CRO-dev/conversio-experiences.git
cd conversio-experiences
npm install
```

## Build one

1. **Branch.** Name it after the test ID, e.g. `FN092`. Push it with `git push origin FN092`. No pull request needed.
2. **Scaffold.** `npm run scaffold -- FN092`. The client comes from the code's prefix (see `clients.json`; add the prefix first if it is missing). It creates `variation-1`, `variation-2` and `control`: delete the folders the ticket does not need.
3. **Test while you build.** `node test.js FN092 variation-1` opens the client's site in Chrome, injects your code and CSS, and reloads when you save. The page's console prints in your terminal. For the control: `node test.js FN092 control`.
4. **Write the code.**
   - Plain JavaScript in `experiences/FN092/variation-1/src/index.js`. No imports.
   - Styles in `styles.scss` in the same folder (compiled and injected for you).
   - The scaffold gives a one-line starter. Add the guard, `logEvent` and `elementReady` from the skeleton in `.claude/skills/build-experience/SKILL.md`.
5. **Tracking.** While building, `logEvent` only logs to the console. When the experience works, paste in the events from the event generator app and replace the logging with them. Put the same events in the control, with the control label.
6. **Finish.** Remove every `console` line. Then build and check the built file:
   ```bash
   npm run build:experience -- FN092
   npm run tester -- test FN092 variation-1
   ```
7. **Ship.** Paste `dist/FN092/<variation>/main.js` (JS and CSS together) into the client's testing tool: Dynamic Yield, Adobe Target or AB Tasty. Check the preview, and reload to make sure it is the latest save.

## Rules

- Never write `${...}` in what you paste. Dynamic Yield and Adobe Target do not support it (the build prints a warning if the built file has any).
- Guard the script so a second run does nothing: `if (!window.__fn092Initialized) { ... }`.
- If your code clicks a button itself, check `event.isTrusted` in the tracking listener so only real clicks count.
- Avoid hashed `css-*` class names in selectors (they change on every site deploy). Use `data-testid` or stable classes.

More (naming, event labels and segments, gotchas): [CLAUDE.md](CLAUDE.md).

## Troubleshooting

- **Chrome will not open:** run `npm install` again.
- **`test.js` refuses my file:** it has an `import` or `export`. Write the helper in the file.
- **No site found:** the code's prefix is not in `clients.json`. Add it, or pass a URL.
- **Nothing appears:** open DevTools (F12) and look at the console. The terminal also shows `[page:error]` lines.
