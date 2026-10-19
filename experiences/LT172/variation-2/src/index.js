if (!window.__lt172Initialized) {
  window.__lt172Initialized = true;

  // The click event from the event generator. Only the event name changes between pushes.
  var EVENT_LABEL = 'LT172 (Variation 2) | ';
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

  // Variation 2: the basket price and the item count above the CTAs, CTAs side by side (Checkout, then View basket).
  var ROOT = '.mantine-Modal-content-minicart';
  var FOOTER = ROOT + ' .button-container.minicart-sticky-cta';
  var HEADER_PRICE = '[data-testid="header-cart-price"]';
  var HEADER_COUNT = '.cart-quantity';

  // The same figures the design uses. Phones and tablets first, the 482px panel from 1024px up
  // (the site's own breakpoint for the panel).
  // The item count moves up next to the price, so the View basket label drops its "(n items)".
  // That is done in CSS, so the site's own button text is never touched.
  var STYLES =
    FOOTER + '.lt172-footer{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;padding:16px;}' +
    FOOTER + '.lt172-footer a[href="/cart"]{order:1;}' +
    FOOTER + '.lt172-footer button{justify-content:center;padding-left:8px;padding-right:8px;white-space:nowrap;}' +
    FOOTER + '.lt172-footer button.view-basket{font-size:0;}' +
    FOOTER + '.lt172-footer button.view-basket::before{content:"VIEW BASKET";font-size:14px;}' +
    '.lt172-subtotal{display:flex;align-items:baseline;gap:24px;box-sizing:border-box;order:-1;grid-column:1/-1;min-width:0;height:28px;white-space:nowrap;color:#000;}' +
    '.lt172-subtotal[hidden]{display:none;}' +
    '.lt172-subtotal__label{font-family:Roboto,"Roboto Fallback",sans-serif;font-size:16px;font-weight:400;line-height:22.4px;}' +
    '.lt172-subtotal__price{display:flex;align-items:baseline;gap:8px;min-width:0;}' +
    '.lt172-subtotal__value{font-family:"Noto Serif","Noto Serif Fallback",serif;font-size:22px;font-weight:600;line-height:26.4px;letter-spacing:-0.22px;}' +
    '.lt172-subtotal__items{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:Roboto,"Roboto Fallback",sans-serif;font-size:14px;font-weight:400;line-height:22.4px;color:#767676;}' +
    '.lt172-subtotal__items strong{font-weight:700;}' +
    // Narrow phones: tighten the row so the item count still fits beside the price.
    '@media (max-width:359px){.lt172-subtotal{gap:12px;}.lt172-subtotal__items{font-size:12px;}}' +
    '@media (min-width:1024px){' +
      FOOTER + '.lt172-footer{padding:24px 32px;}' +
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

  // The item count is the number on the site's basket icon. Falls back to the number in the View basket label.
  function readCount() {
    var badge = document.querySelector(HEADER_COUNT);
    var fromBadge = badge ? parseInt(badge.textContent, 10) : NaN;
    if (!isNaN(fromBadge)) return fromBadge;
    var button = document.querySelector(FOOTER + ' button.view-basket');
    var match = button ? /(\d+)/.exec(button.textContent) : null;
    return match ? parseInt(match[1], 10) : 0;
  }

  function setText(el, text) {
    if (el.textContent !== text) el.textContent = text;
  }

  function ensureRow(footer) {
    var row = footer.querySelector('.lt172-subtotal');
    if (!row) {
      row = document.createElement('div');
      row.className = 'lt172-subtotal';
      row.innerHTML =
        '<span class="lt172-subtotal__label">Subtotal:</span>' +
        '<span class="lt172-subtotal__price"><span class="lt172-subtotal__value"></span><span class="lt172-subtotal__items"></span></span>';
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
      var count = readCount();
      setText(row.querySelector('.lt172-subtotal__value'), price);

      var items = row.querySelector('.lt172-subtotal__items');
      var itemsKey = String(count);
      if (items.getAttribute('data-count') !== itemsKey) {
        items.setAttribute('data-count', itemsKey);
        items.innerHTML = count > 0 ? '(<strong>' + count + (count === 1 ? ' item' : ' items') + '</strong> in your cart)' : '';
      }

      var viewBasket = footer.querySelector('button.view-basket');
      if (viewBasket && viewBasket.getAttribute('aria-label') !== 'View basket') viewBasket.setAttribute('aria-label', 'View basket');

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
