(function () {
	console.log('Alex test12')

	window.adobeDataLayer = window.adobeDataLayer || [];
	window.adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio Experience",
      "clickAction": "LT177 | Optimal Filter Display - All vs Top 1 vs Top 3 Open & Match Offer",
      "clickText": "LT177 | Variation 1"
    }
  }
});

  // Resolves with the first match, or with null after timeoutMs so the script never stalls silently.
  function elementReady(selector, timeoutMs) {
    return new Promise(function (resolve) {
      var el = document.querySelector(selector);
      if (el) { resolve(el); return; }

      var observer = new MutationObserver(function () {
        var found = document.querySelector(selector);
        if (found) {
          observer.disconnect();
          clearTimeout(timer);
          resolve(found);
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });

      var timer = setTimeout(function () {
        observer.disconnect();
        resolve(null);
      }, timeoutMs);
    });
  }

  var TEST_DELAY = 0;     // ms to wait after the headings appear, so the change can be seen in the testing tool
  var HEADING_SELECTOR = '.facets-navigation .heading';

  console.log('LT177: headings on page at start: ' + document.querySelectorAll(HEADING_SELECTOR).length);

  elementReady(HEADING_SELECTOR, 10000).then(function (heading) {
    if (!heading) {
      console.log('LT177: no filter headings after 10 seconds, layout not applied');
      return;
    }
    setTimeout(function () {
      console.log('LT177: elementReady fired, filter headings found: ' + document.querySelectorAll(HEADING_SELECTOR).length);

      var VARIANT = 'V1';
      var VARIANT_LABEL = 'Variation 1';
      var OPEN_SECTIONS = 1;
      var APPLY_LAYOUT = OPEN_SECTIONS !== null;
      var KEEP_LAYOUT_MS = 8000;   // how long to keep reapplying the layout after it is first set
      var DESKTOP_MIN_WIDTH = 1024;

      var TOGGLE_SELECTOR = '.facets-navigation .heading button';
      var CHECKBOX_SELECTOR = '.facets-navigation input.ais-RefinementList-checkbox';
      var CARD_SELECTOR = '.ais-Hits-item';

      var initialLabels = null;             // section names in the order shown at page load
      var userToggled = {};                 // section names the shopper has opened or closed themselves

      // Adobe Target click event, in the format the Adobe Data Layer uses for Conversio CRO events.
      function pushEvent(clickText) {
        window.adobeDataLayer = window.adobeDataLayer || [];
        window.adobeDataLayer.push({
          event: 'targetClickEvent',
          eventData: {
            click: {
              clickLocation: 'Conversio CRO',
              clickAction: 'LT177 | Event Tracking',
              clickText: 'LT177 (' + VARIANT_LABEL + ') | ' + clickText
            }
          }
        });
      }

      function isDesktop() {
        return window.matchMedia('(min-width: ' + DESKTOP_MIN_WIDTH + 'px)').matches;
      }

      function sectionName(heading) {
        return heading.textContent.trim().replace(/\s+/g, ' ');
      }

      function isOpen(button) {
        return button.classList.contains('minus');
      }

      // Keeps the top N sections open and collapses the rest.
      function applyLayout() {
        if (!APPLY_LAYOUT || !isDesktop()) return;
        var headings = document.querySelectorAll(HEADING_SELECTOR);
        for (var i = 0; i < headings.length; i++) {
          var name = sectionName(headings[i]);
          if (userToggled[name]) continue;          // shoppers keep the sections they changed
          var button = headings[i].querySelector('button');
          if (!button) continue;
          var shouldBeOpen = i < OPEN_SECTIONS;
          if (shouldBeOpen !== isOpen(button)) button.click();
        }
      }

      function setUp() {
        if (!initialLabels) {
          initialLabels = [];
          var headings = document.querySelectorAll(HEADING_SELECTOR);
          for (var i = 0; i < headings.length; i++) initialLabels.push(sectionName(headings[i]));
        }
        applyLayout();
        console.log('LT177: layout applied, desktop: ' + isDesktop());
        keepLayout();
      }

      // Some sections (Average Rating) are redrawn by the site after the first pass and come back open.
      // For a few seconds, reapply the layout whenever the filter panel changes.
      function keepLayout() {
        var panel = document.querySelector('.facets-navigation');
        if (!panel || !APPLY_LAYOUT) return;
        var timer = null;
        var observer = new MutationObserver(function () {
          clearTimeout(timer);
          timer = setTimeout(applyLayout, 150);
        });
        observer.observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        setTimeout(function () {
          observer.disconnect();
          clearTimeout(timer);
        }, KEEP_LAYOUT_MS);
      }

      // Trusted clicks only, so the layout changes made by this script are not tracked.
      function onClick(event) {
        if (!event.isTrusted || !isDesktop()) return;
        var target = event.target;
        if (!target || !target.closest) return;

        var toggle = target.closest(TOGGLE_SELECTOR);
        if (toggle) {
          var heading = toggle.closest('.heading');
          var name = sectionName(heading);
          userToggled[name] = true;
          pushEvent('PLP Filter Section Toggle');
          pushEvent('PLP Filter Section Toggle | ' + name);
          return;
        }

        if (target.closest('.refinements .refinement-item')) {
          pushEvent('Clear individual filter');
          return;
        }

        if (target.closest('.clear-refinements')) {
          pushEvent('Clears all filters');
          return;
        }

        if (target.closest(CARD_SELECTOR + ' a[href*="/product/"]')) {
          pushEvent('PLP > PDP Click through');
          return;
        }

        if (target.closest(CARD_SELECTOR + ' button[aria-label="Increase quantity"]')) {
          pushEvent('Increases quantity');
          return;
        }

        if (target.closest(CARD_SELECTOR + ' button[aria-label="Decrease quantity"]')) {
          pushEvent('Decreases quantity');
        }
      }

      // Filter applied: a shopper ticks a filter option.
      function onChange(event) {
        if (!event.isTrusted || !isDesktop()) return;
        var input = event.target;
        if (!input || !input.matches || !input.matches(CHECKBOX_SELECTOR) || !input.checked) return;

        pushEvent('PLP Filter Applied');
      }

      function startTracking() {
        if (window.__lt177Initialized) return;
        window.__lt177Initialized = true;
        document.addEventListener('click', onClick, true);
        document.addEventListener('change', onChange, true);
      }

      startTracking();
      setUp();
    }, TEST_DELAY);
  });
})();
