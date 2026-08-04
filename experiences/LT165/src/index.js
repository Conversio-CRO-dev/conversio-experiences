console.log("LT165 loaded v.3");

// Continuously watch and update minibasket button
const watchMinibasketContinuously = () => {
  const observer = new MutationObserver(() => {
    const button = document.querySelector(".button-container a:nth-child(2) button");
    if (button) {
      if (button.textContent !== "SECURE CHECKOUT") {
        button.textContent = "SECURE CHECKOUT";
        console.log("LT165 - Customer in minibasket");
          adobeDataLayer.push({
            "event": "targetClickEvent",
            "eventData": {
              "click": {
                "clickLocation": "Conversio CRO",
                "clickAction": "LT165 | Event Tracking",
                "clickText": "LT165 (Variation 1) | Customer in minibasket"
              }
            }
          });
      }

      // View Basket click
      const viewBasketBtn = document.querySelector('.button-container a[href="/cart"] button');
      if (viewBasketBtn && !viewBasketBtn.dataset.ltTracked) {
        viewBasketBtn.addEventListener("click", () => {
          console.log("LT165 - Minibasket View Basket CTA click");
          adobeDataLayer.push({
            "event": "targetClickEvent",
            "eventData": {
              "click": {
                "clickLocation": "Conversio CRO",
                "clickAction": "LT165 | Event Tracking",
                "clickText": "LT165 (Variation 1) | Minibasket View Basket CTA click"
              }
            }
          });


        });
        viewBasketBtn.dataset.ltTracked = "true";
      }

      // Checkout click
      if (button && !button.dataset.ltCheckoutTracked) {
        button.addEventListener("click", () => {
          console.log("LT165 - Minibasket Checkout CTA click");

          adobeDataLayer.push({
            "event": "targetClickEvent",
            "eventData": {
              "click": {
                "clickLocation": "Conversio CRO",
                "clickAction": "LT165 | Event Tracking",
                "clickText": "LT165 (Variation 1) | Minibasket Checkout CTA click"
              }
            }
          });

        });
        button.dataset.ltCheckoutTracked = "true";
      }

      // Continue Shopping (desktop button + mobile div)
      const continueDesktop = document.querySelector('button[data-testid="continue-shopping"]');
      if (continueDesktop && !continueDesktop.dataset.ltTracked) {
        continueDesktop.addEventListener("click", () => {
          console.log("LT165 - Minibasket Continue Shopping CTA click");

          adobeDataLayer.push({
            "event": "targetClickEvent",
            "eventData": {
              "click": {
                "clickLocation": "Conversio CRO",
                "clickAction": "LT165 | Event Tracking",
                "clickText": "LT165 (Variation 1) | Minibasket Continue Shopping CTA click"
              }
            }
          });
        });
        continueDesktop.dataset.ltTracked = "true";
      }

      const continueMobile = document.querySelector('div.continue-shopping.mobile');
      if (continueMobile && !continueMobile.dataset.ltTracked) {
        continueMobile.addEventListener("click", () => {
          console.log("LT165 - Minibasket Continue Shopping CTA click");

          adobeDataLayer.push({
          "event": "targetClickEvent",
          "eventData": {
            "click": {
              "clickLocation": "Conversio CRO",
              "clickAction": "LT165 | Event Tracking",
              "clickText": "LT165 (Variation 1) | Minibasket Continue Shopping CTA click"
            }
          }
        });
        });
        continueMobile.dataset.ltTracked = "true";
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// Continuously watch and update cart button
const watchCartPageContinuously = () => {
  const observer = new MutationObserver(() => {
    const button = document.querySelector(".payment-checkout button");
    if (button) {
      const text = button.textContent;
      if (text.includes("Checkout") && !text.includes("SECURE")) {
        const items = text.match(/\(.*\)/);
        button.textContent = items ? `SECURE CHECKOUT ${items[0]}` : "SECURE CHECKOUT";
        console.log("LT165 - Customer in basket");

        adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio CRO",
      "clickAction": "LT165 | Event Tracking",
      "clickText": "LT165 (Variation 1) | Customer in basket"
    }
  }
});
      }

      // Checkout click
      if (!button.dataset.ltTracked) {
        button.addEventListener("click", () => {
          console.log("LT165 - Basket Checkout CTA click");

          adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio CRO",
      "clickAction": "LT165 | Event Tracking",
      "clickText": "LT165 (Variation 1) | Basket Checkout CTA click"
    }
  }
});
        });
        button.dataset.ltTracked = "true";
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// Global click handler for all interactions
document.addEventListener("click", (e) => {
  // Minibasket PDP clicks (trending items carousel)
  if (e.target.closest('a[data-atg="atg-link"]') && document.querySelector('[data-testid="trending-items"]')) {
    console.log("LT165 - Minibasket > PDP Click");

    adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio CRO",
      "clickAction": "LT165 | Event Tracking",
      "clickText": "LT165 (Variation 1) | Minibasket > PDP Click"
    }
  }
});
  }

  // Quantity increase (plus button)
  if (e.target.closest('button[data-testid="plus-button"]')) {
    console.log("LT165 - Increases Quantity in basket");
    adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio CRO",
      "clickAction": "LT165 | Event Tracking",
      "clickText": "LT165 (Variation 1) | Increases Quantity in basket"
    }
  }
});
  }
  // Quantity decrease (minus button)
  if (e.target.closest('button[data-testid="minus-button"]')) {
    console.log("LT165 - Decreases Quantity in basket");
    adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio CRO",
      "clickAction": "LT165 | Event Tracking",
      "clickText": "LT165 (Variation 1) | Decreases Quantity in basket"
    }
  }
});
  }
  // Remove item (product-delete div)
  if (e.target.closest('.product-delete')) {
    console.log("LT165 - Removes item from basket");
    adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio CRO",
      "clickAction": "LT165 | Event Tracking",
      "clickText": "LT165 (Variation 1) | Removes item from basket"
    }
  }
});
  }
  // Basket PDP (product links - both h5 and button variants)
  if ((e.target.closest('h5.product-link') || e.target.closest('button.product-link')) && window.location.pathname === "/cart") {
    console.log("LT165 - Basket > PDP Click");
    adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio CRO",
      "clickAction": "LT165 | Event Tracking",
      "clickText": "LT165 (Variation 1) | Basket > PDP Click"
    }
  }
});
  }
  // Basket Continue Shopping (span element)
  if (e.target.closest('span.continue-shopping-link') && window.location.pathname === "/cart") {
    console.log("LT165 - Basket Continue Shopping CTA click");
    adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio CRO",
      "clickAction": "LT165 | Event Tracking",
      "clickText": "LT165 (Variation 1) | Basket Continue Shopping CTA click"
    }
  }
});
  }
});

// Start watching
watchMinibasketContinuously();
watchCartPageContinuously();