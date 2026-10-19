if (!window.__lt172Initialized) {
  window.__lt172Initialized = true;

  // The click event from the event generator. Only the event name changes between pushes.
  var EVENT_LABEL = 'LT172 (Variation 1) | ';
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

  // Variation 1: the basket price above the CTAs, CTAs stacked (View basket, then Checkout).
  var ROOT = '.mantine-Modal-content-minicart';
  var FOOTER = ROOT + ' .button-container.minicart-sticky-cta';
  var HEADER_PRICE = '[data-testid="header-cart-price"]';

  // The same figures the design uses. Phones and tablets first, the 482px panel from 1024px up
  // (the site's own breakpoint for the panel).
  var STYLES =
    FOOTER + '.lt172-footer{padding:16px;gap:16px;}' +
    '.lt172-subtotal{display:flex;align-items:baseline;gap:24px;box-sizing:border-box;width:100%;height:28px;white-space:nowrap;color:#000;}' +
    '.lt172-subtotal[hidden]{display:none;}' +
    '.lt172-subtotal__label{font-family:Roboto,"Roboto Fallback",sans-serif;font-size:16px;font-weight:400;line-height:22.4px;}' +
    '.lt172-subtotal__value{font-family:"Noto Serif","Noto Serif Fallback",serif;font-size:22px;font-weight:600;line-height:26.4px;letter-spacing:-0.22px;}' +
    '@media (min-width:1024px){' +
      FOOTER + '.lt172-footer{padding:32px 32px 24px;gap:20px;}' +
      FOOTER + '.lt172-footer .lt172-subtotal{margin-bottom:-4px;}' +
    '}';

  function addStyles() {
    if (document.getElementById('lt172-styles')) return;
    var style = document.createElement('style');
    style.id = 'lt172-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // The full basket price is the one the site already shows in its header (hidden on phones, but in the page).
  function readPrice() {
    var el = document.querySelector(HEADER_PRICE);
    var text = el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    return /\d/.test(text) ? text : '';
  }

  function setText(el, text) {
    if (el.textContent !== text) el.textContent = text;
  }

  function ensureRow(footer) {
    var row = footer.querySelector('.lt172-subtotal');
    if (!row) {
      row = document.createElement('div');
      row.className = 'lt172-subtotal';
      row.innerHTML = '<span class="lt172-subtotal__label">Subtotal:</span><span class="lt172-subtotal__value"></span>';
    }
    if (footer.firstChild !== row) footer.insertBefore(row, footer.firstChild);
    return row;
  }

  var open = false;
  var seen = false;

  function enhance() {
    var footer = document.querySelector(FOOTER);
    if (!footer) {
      open = false;
      seen = false;
      return;
    }
    open = true;

    var price = readPrice();
    var row = ensureRow(footer);

    if (price) {
      setText(row.querySelector('.lt172-subtotal__value'), price);
      if (row.hidden) row.hidden = false;
      if (!footer.classList.contains('lt172-footer')) footer.classList.add('lt172-footer');
      if (!seen) {
        seen = true;
        logEvent('Minicart open & changes seen (trigger)');
      }
    } else {
      if (!row.hidden) row.hidden = true;
      if (footer.classList.contains('lt172-footer')) footer.classList.remove('lt172-footer');
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
      enhance();
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

  addStyles();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  schedule();
}
