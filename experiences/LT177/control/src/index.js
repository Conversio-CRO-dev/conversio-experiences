(function () {
 
  adobeDataLayer.push({
  "event": "targetClickEvent",
  "eventData": {
    "click": {
      "clickLocation": "Conversio Experience",
      "clickAction": "LT177 | Optimal Filter Display - All vs Top 1 vs Top 3 Open",
      "clickText": "LT177 | Control Original"
    }
  }
});

  var VARIANT = 'Control';         
  var VARIANT_LABEL = 'Control Original';   
  var OPEN_SECTIONS = null;        
  var APPLY_LAYOUT = OPEN_SECTIONS !== null;
  var DESKTOP_MIN_WIDTH = 1024;         
  var PENDING_CLASS = 'lt177-pending';  
  var PENDING_TIMEOUT = 1500;

  var PANEL_SELECTOR = '.facets-navigation';
  var HEADING_SELECTOR = '.facets-navigation .heading';
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

  // Sets the layout once the sections exist: keeps the top N open and collapses the rest.
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

  // Waits for the filter sections, sets the layout, then shows the panel.
  function setUp() {
    var done = false;
    var timer = null;

    function finish() {
      if (done) return;
      done = true;
      if (observer) observer.disconnect();
      if (timer) clearTimeout(timer);
      document.documentElement.classList.remove(PENDING_CLASS);
    }

    function check() {
      var headings = document.querySelectorAll(HEADING_SELECTOR);
      if (!headings.length) return false;
      if (!initialLabels) {
        initialLabels = [];
        for (var i = 0; i < headings.length; i++) initialLabels.push(sectionName(headings[i]));
      }
      applyLayout();
      finish();
      return true;
    }

    var observer = null;
    if (APPLY_LAYOUT && isDesktop()) {
      document.documentElement.classList.add(PENDING_CLASS);
      timer = setTimeout(finish, PENDING_TIMEOUT);  // never leave the panel hidden
    }
    if (!check() && APPLY_LAYOUT && isDesktop()) {
      observer = new MutationObserver(function () { check(); });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
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
})();
