if (!window.__lt172Initialized) {
  window.__lt172Initialized = true;

  // The click event from the event generator. Only the event name changes between pushes.
  var EVENT_LABEL = 'LT172 (Control Original) | ';
  function logEvent(name) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    adobeDataLayer.push({
      "event": "targetClickEvent",
      "eventData": {
        "click": {
          "clickLocation": "Conversio CRO",
          "clickAction": "LT172 | Event Tracking",
          "clickText": EVENT_LABEL + name
        }
      }
    });
  }

  // Control: no change to the page, tracking only. The same events as the variations.
  var ROOT = '.mantine-Modal-content-minicart';
  var FOOTER = ROOT + ' .button-container.minicart-sticky-cta';

  var seen = false;

  // Minicart open, once each time it opens.
  function check() {
    var footer = document.querySelector(FOOTER);
    if (!footer) {
      seen = false;
      return;
    }
    if (!seen) {
      seen = true;
      logEvent('Minicart open & changes seen (trigger)');
    }
  }

  // Runs on the next frame, or after 100ms if the tab is in the background and frames are paused.
  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    var run = function () {
      if (!scheduled) return;
      scheduled = false;
      check();
    };
    requestAnimationFrame(run);
    setTimeout(run, 100);
  }

  // One delegated listener: the site replaces these nodes whenever it re-renders.
  document.addEventListener('click', function (event) {
    if (!event.isTrusted) return;
    var target = event.target;
    if (!target || !target.closest) return;
    var root = target.closest(ROOT);
    if (!root) return;

    if (target.closest('[data-testid="continue-shopping"]')) {
      logEvent('Clicks Continue Shopping CTA');
    } else if (target.closest('.button-container a[href="/cart"], .button-container button.view-basket')) {
      logEvent('Clicks View Basket CTA');
    } else if (target.closest('[data-testid="checkout-button"]')) {
      logEvent('Clicks Checkout CTA');
    } else if (target.closest('.wrapper a')) {
      logEvent('Product click through');
    } else if (target.closest('.trending-items-container [data-testid="add-to-cart-button"]')) {
      logEvent('Trending product ATB');
    } else if (target.closest('.trending-items-container a')) {
      logEvent('Trending product click through');
    } else if (target.closest('.mantine-CloseButton-root') || !target.closest('section')) {
      logEvent('Close Minicart');
    }
  }, true);

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  schedule();
}
