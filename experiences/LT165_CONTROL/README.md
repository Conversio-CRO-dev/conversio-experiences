# LT165_CONTROL

Control variation for: **Laithwaites**

This is a control variation that tracks all user interactions but makes NO changes to the page.

## What it does

- Tracks all 12 customer interaction events via console.log
- Does not modify button text
- Does not change any page elements
- Baseline for measuring LT165 variation impact

## Development

```bash
npm run test
```

This launches a Puppeteer browser with hot-reload on Laithwaites.

## Events tracked

1. Customer in minibasket
2. Customer in basket
3. Minibasket View Basket CTA click
4. Minibasket Checkout CTA click
5. Minibasket Continue Shopping CTA click
6. Minibasket > PDP Click
7. Increases Quantity in basket
8. Decreases Quantity in basket
9. Removes item from basket
10. Basket Checkout CTA click
11. Basket > PDP Click
12. Basket Continue Shopping CTA click

## Build

```bash
npm run build
```

Output: `dist/LT165_CONTROL/main.js`
