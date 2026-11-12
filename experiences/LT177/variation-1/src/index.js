(function () {
  // LT177 | A/B/n | Optimal Filter Display - All vs Top 1 vs Top 3 Open
  // Desktop PLPs and search results. Control keeps every filter section open.
  // Variants keep the top N sections open (order from the page at load) and collapse the rest.
  var VARIANT = 'V1';          // 'Control', 'V1' or 'V2'
  var OPEN_SECTIONS = 1;         // number of top sections left open; null means no change (control)
  var APPLY_LAYOUT = OPEN_SECTIONS !== null;
  var DESKTOP_MIN_WIDTH = 992;          // assumed breakpoint for the desktop filter panel
  var PENDING_CLASS = 'lt177-pending';  // hides the filter panel until the layout is set (styles.scss)
  var PENDING_TIMEOUT = 1500;

  var PANEL_SELECTOR = '.facets-navigation';
  var HEADING_SELECTOR = '.facets-navigation .heading';
  var TOGGLE_SELECTOR = '.facets-navigation .heading button';
  var CHECKBOX_SELECTOR = '.facets-navigation input.ais-RefinementList-checkbox';
  var CARD_SELECTOR = '.ais-Hits-item';

  var initialLabels = null;             // section names in the order shown at page load
  var userToggled = {};                 // section names the shopper has opened or closed themselves

  function pushEvent(eventName, params) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: 'conversioEvent', conversioEventName: eventName, experimentVariant: VARIANT };
    for (var key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) payload[key] = params[key];
    }
    window.dataLayer.push(payload);
  }

  function isDesktop() {
    return window.matchMedia('(min-width: ' + DESKTOP_MIN_WIDTH + 'px)').matches;
  }

  function sectionName(heading) {
    return heading.textContent.trim().replace(/\s+/g, ' ');
  }

  // Position at page load, so the number stays the same after re-ranking.
  function positionOf(name) {
    if (!initialLabels) return null;
    var index = initialLabels.indexOf(name);
    return index === -1 ? null : index + 1;
  }

  // The heading that sits above an element, i.e. the section it belongs to.
  function sectionFor(element) {
    var found = null;
    var headings = document.querySelectorAll(HEADING_SELECTOR);
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) found = headings[i];
    }
    return found;
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
      var action = isOpen(toggle) ? 'collapse' : 'expand';   // state before the click
      userToggled[name] = true;
      pushEvent('LT177_PLP_FILTER_SECTION_TOGGLE', {});
      pushEvent('LT177_PLP_FILTER_SECTION_TOGGLE_NAMED', {
        filter_name: name,
        action: action,
        filter_position: positionOf(name)
      });
      return;
    }

    if (target.closest('.refinements .refinement-item')) {
      pushEvent('LT177_CLEAR_INDIVIDUAL_FILTER', {});
      return;
    }

    if (target.closest('.clear-refinements')) {
      pushEvent('LT177_CLEAR_ALL_FILTERS', {});
      return;
    }

    if (target.closest(CARD_SELECTOR + ' a[href*="/product/"]')) {
      pushEvent('LT177_PLP_TO_PDP_CLICK_THROUGH', {});
      return;
    }

    if (target.closest(CARD_SELECTOR + ' button[aria-label="Increase quantity"]')) {
      pushEvent('LT177_INCREASES_QUANTITY', {});
      return;
    }

    if (target.closest(CARD_SELECTOR + ' button[aria-label="Decrease quantity"]')) {
      pushEvent('LT177_DECREASES_QUANTITY', {});
    }
  }

  // Filter applied: a shopper ticks a filter option.
  function onChange(event) {
    if (!event.isTrusted || !isDesktop()) return;
    var input = event.target;
    if (!input || !input.matches || !input.matches(CHECKBOX_SELECTOR) || !input.checked) return;

    var heading = sectionFor(input);
    var name = heading ? sectionName(heading) : '';
    var labelText = input.closest('label');
    var value = labelText ? labelText.querySelector('.ais-RefinementList-labelText') : null;
    pushEvent('LT177_PLP_FILTER_APPLIED', {
      filter_name: name,
      filter_value: value ? value.textContent.trim() : '',
      filter_position: positionOf(name)
    });
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
