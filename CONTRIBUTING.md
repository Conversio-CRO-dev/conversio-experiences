# Contributing Guide: Building CRO Experiences

Step-by-step guide for team members creating A/B test experiences.

## Setup (First Time Only)

### 1. Clone the repo

```bash
git clone git@github.com:Conversio-CRO-dev/conversio-experiences.git
cd conversio-experiences
```

### 2. Install dependencies

```bash
npm install
```

This installs Puppeteer, webpack, sass, and all build tools.

## Creating a New Experience

### Step 1: Create a feature branch

Name it after your experience code. Use lowercase with hyphens:

```bash
git checkout -b feature/cnv001
```

Or if testing a different client:

```bash
git checkout -b feature/wn-hero-banner
```

Git branch prefixes map to clients in `clients.json`:
- `feature/...` → uses `FEATURE` client mapping
- `wn-*` → uses `WN` (Warner Hotels)
- `ts-*` → uses `TS` (Team Sport)
- `lt-*` → uses `LT` (Laithwaites)

### Step 2: Scaffold a new experience

Generate the folder structure and template files:

```bash
npm run scaffold -- CNV001 --client=conversio
```

This creates:
```
experiences/CNV001/
├── src/
│   ├── index.js          # Your code goes here
│   └── styles.scss       # Optional styles
├── package.json          # { "client": "conversio" }
├── webpack.config.js     # Extends shared config
└── README.md
```

### Step 3: Develop locally with live reload

Launch the local tester:

```bash
node test.js CNV001
```

This will:
1. Launch Chrome (headed browser, visible window)
2. Navigate to conversio.com
3. Inject your code
4. Watch `src/` for file changes
5. Auto-reload when you save

You'll see console logs in your terminal like:
```
[page:log] My experience loaded
[page:error] Some error
```

### Step 4: Write your experience code

Open `experiences/CNV001/src/index.js` and write plain JavaScript:

```javascript
console.log("CNV001 loaded");

// Wait for a DOM element
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector}`));
    }, timeout);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
};

// Example: change a button color
waitForElement("button.cta").then((button) => {
  button.style.backgroundColor = "red";
  console.log("Button changed to red");
});

// Send tracking event
if (window.dataLayer) {
  window.dataLayer.push({
    event: "conversioEvent",
    conversioEventName: "cnv001_loaded",
  });
}
```

**Key points:**
- Write plain JavaScript (no imports/exports needed)
- No module system — just global `window` and DOM APIs
- Console.log freely — logs appear in your terminal
- SCSS optional: if `src/styles.scss` exists, it's auto-compiled and injected

### Step 5: Test and iterate

1. **Edit** `src/index.js`
2. **Save** the file
3. **Watch** test.js terminal for console logs and errors
4. **Check** the Chrome window to see your changes live

Repeat until your experience works. Stop with `Ctrl+C`.

### Step 6: Commit your code

Commit your changes:

```bash
git add experiences/CNV001/
git commit -m "Add CNV001 experience: red CTA button test

- Changes CTA button color to red on page load
- Tracks event to dataLayer
- Tested on conversio.com"
```

### Step 7: Push and create a PR

Push your branch:

```bash
git push origin feature/cnv001
```

Create a PR on GitHub:
- Title: `Add CNV001 experience`
- Description: Explain what the test does, what it changes, why
- Link to relevant Jira/Linear ticket if applicable

### Step 8: Code review and merge

Team reviews your code. Once approved, merge to main.

### Step 9: Build for production

After merge, build your experience:

```bash
npm run build:experience -- CNV001
```

Output: `dist/CNV001/main.js`

Copy this file into AB Tasty / Adobe Target and deploy.

## Troubleshooting

### "Chrome won't launch"

Make sure Puppeteer installed correctly:

```bash
npm install
```

If still broken, try the manual workflow:
1. Build: `npm run build:experience -- CNV001`
2. Manually paste `dist/CNV001/main.js` into AB Tasty
3. Test on live site

### "Code not injecting / console is empty"

Check for errors in your JavaScript:
1. Open Chrome DevTools (F12)
2. Look for red errors in the Console tab
3. Fix syntax errors and save
4. test.js will auto-reload

### "How do I use styles?"

Create `src/styles.scss`:

```scss
.my-custom-element {
  background: red;
  padding: 20px;
  
  &:hover {
    background: darkred;
  }
}
```

Save and test.js will compile and inject it automatically.

### "How do I access page variables / dataLayer?"

Just use them directly — they're global:

```javascript
// Access dataLayer
console.log(window.dataLayer);

// Access other globals
console.log(window.myApp);
```

## Template: A Complete Experience

Here's a full example:

**src/index.js:**
```javascript
console.log("WN_HERO loaded");

// Wait for hero section
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector}`));
    }, timeout);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
};

// Main experience
waitForElement(".hero")
  .then((hero) => {
    hero.classList.add("wn-hero-variation");
    console.log("Hero styled");

    // Track
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "conversioEvent",
        conversioEventName: "wn_hero_variation_shown",
      });
    }
  })
  .catch((err) => {
    console.error("Failed to find hero:", err);
  });
```

**src/styles.scss:**
```scss
.wn-hero-variation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;

  h1 {
    font-size: 48px;
    margin: 0 0 20px 0;
  }

  .cta {
    background: white;
    color: #667eea;
    padding: 15px 40px;
    border: none;
    border-radius: 30px;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
}
```

## Conventions

- **Selectors**: Use `data-testid` or stable class names, never hashed `css-*` classes (they change on every site deploy)
- **Tracking**: Use `dataLayer.push()` with `conversioEvent` and `conversioEventName`
- **Naming**: Use SCREAMING_SNAKE_CASE for event names: `WN_HERO_LOADED`
- **Errors**: Always log errors and handle gracefully

## Questions?

Check the main [README.md](README.md) or ask in Slack #cro-dev.
