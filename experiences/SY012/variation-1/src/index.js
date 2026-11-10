(function () {

  // Segments and labels from the event snippets. Labels with "| page type" or "| breadcrumb level" are filled in live.
  var EXPERIENCE_SEGMENT = 'SY012.XV1';
  var EXPERIENCE_LABEL = 'SY012 | Variation 1';
  var LABEL_PREFIX = 'SY012 | (Variation 1) | ';
  var SEGMENTS = {
    trigger: 'SY012EV1Q',
    quicklinkClick: 'SY012EV1G',
    plpAtb: 'SY012EV1H',
    plpClickThrough: 'SY012EV1I',
    pdpAtb: 'SY012EV1J',
    quantityUp: 'SY012EV1K',
    quantityDown: 'SY012EV1L',
    breadcrumb: 'SY012EV1M',
    breadcrumbLevel: 'SY012EV1N'
  };

  // Breadcrumb levels from the brief: 2nd is All, 3rd is More, 5th is Alternatives.
  // Breadcrumb items are Home (1), then the categories, then the product (no link).
  var QUICKLINKS = [
    { level: 2, type: 'All', before: 'View All ', after: '' },
    { level: 3, type: 'More', before: 'View More ', after: '' },
    { level: 5, type: 'Alternatives', before: 'View ', after: ' Alternatives' }
  ];

  var ROW_ID = 'evg-new-template';
  var zoneSelector = 'cx-product-intro h1';
  var active = false; // true while the variation is applied; reset() turns it off

  // Styles live in this file so they load wherever the script runs (Salesforce has no separate CSS here).
  var STYLE_ID = 'sy012-quicklinks-styles';
  var CSS = [
    '.sy012-quicklinks { display: flex; flex-wrap: nowrap; gap: 8px; margin: 12px 0 16px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }',
    '.sy012-quicklinks::-webkit-scrollbar { display: none; }',
    '.sy012-quicklinks a { flex: 0 0 auto; padding: 8px 16px; border: 1px solid #1b2a4a; border-radius: 999px; background: #fff; color: #1b2a4a; font-size: 14px; font-weight: 600; line-height: 1.2; white-space: nowrap; text-decoration: none; }',
    '.sy012-quicklinks a:hover, .sy012-quicklinks a:focus-visible { background: #1b2a4a; color: #fff; }',
    '@media (min-width: 768px) { .sy012-quicklinks { flex-wrap: wrap; overflow-x: visible; } }'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function pushDataLayer(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function trackEvent(segment, label) {
    pushDataLayer({
      event: 'conversioEvent',
      conversio: {
        event_category: 'Conversio CRO',
        event_action: 'SY012 | Event Tracking',
        event_label: LABEL_PREFIX + label,
        event_segment: segment
      }
    });
  }

  // Session flags, so "once per session" events and the "after a quicklink" steps survive page loads.
  function getFlag(key) {
    try {
      return sessionStorage.getItem(key) === '1';
    } catch (e) {
      return false;
    }
  }
  function setFlag(key) {
    try {
      sessionStorage.setItem(key, '1');
    } catch (e) {}
  }

  function pageType() {
    var path = window.location.pathname;
    if (/\/p\/\d+/.test(path)) return 'PDP';
    if (/^\/search/.test(path)) return 'Search results';
    return 'PLP';
  }

  function crumbItems() {
    return document.querySelectorAll('nav[aria-label="breadcrumbs"] ol > li');
  }

  // A level only gets a link if the breadcrumb has one there, so short breadcrumbs show fewer links.
  function buildRow() {
    var items = crumbItems();
    var row = document.createElement('div');
    row.id = ROW_ID;
    row.className = 'sy012-quicklinks';
    row.setAttribute('data-path', window.location.pathname);

    var count = 0;
    QUICKLINKS.forEach(function (quicklink) {
      var item = items[quicklink.level - 1];
      var crumb = item && item.querySelector('a');
      if (!crumb) return;

      var link = document.createElement('a');
      link.href = crumb.getAttribute('href');
      link.setAttribute('data-link-type', quicklink.type);
      link.textContent = quicklink.before + crumb.textContent.trim() + quicklink.after;
      row.appendChild(link);
      count++;
    });

    return count ? row : null;
  }

  // Puts the quicklinks after the content zone on PDPs. Idempotent: safe to call on every DOM change.
  function showQuicklinks() {
    if (!active) return;
    var existing = document.getElementById(ROW_ID);
    if (pageType() !== 'PDP') {
      if (existing) existing.remove();
      return;
    }

    var zone = document.querySelector(zoneSelector);
    if (!zone) return;
    if (existing && existing.getAttribute('data-path') === window.location.pathname) return;
    if (existing) existing.remove();

    var row = buildRow();
    if (!row) return;
    zone.insertAdjacentElement('afterend', row);

    if (!getFlag('sy012-quicklinks-present')) {
      setFlag('sy012-quicklinks-present');
      trackEvent(SEGMENTS.trigger, 'Quicklinks present (trigger)');
    }
  }

  function crumbLevel(crumb) {
    return Array.prototype.indexOf.call(crumbItems(), crumb.closest('li')) + 1;
  }

  // One delegated listener: the storefront re-renders these nodes, and only real clicks count.
  function onClick(event) {
    if (!event.isTrusted) return;
    var target = event.target;
    if (!target || !target.closest) return;

    if (target.closest('.sy012-quicklinks a')) {
      setFlag('sy012-quicklink-clicked');
      trackEvent(SEGMENTS.quicklinkClick, 'Clicks on quicklink');
      return;
    }

    var crumb = target.closest('nav[aria-label="breadcrumbs"] a');
    if (crumb) {
      trackEvent(SEGMENTS.breadcrumb, 'Breadcrumb click');
      trackEvent(SEGMENTS.breadcrumbLevel, 'Breadcrumb click | ' + crumbLevel(crumb));
      return;
    }

    if (target.closest('cx-item-counter button.item-control-add')) {
      trackEvent(SEGMENTS.quantityUp, 'Increases quantity | ' + pageType());
      return;
    }
    if (target.closest('cx-item-counter button.item-control-remove')) {
      trackEvent(SEGMENTS.quantityDown, 'Decreases quantity | ' + pageType());
      return;
    }

    if (target.closest('cx-add-to-cart button[type="submit"]') && pageType() === 'PDP') {
      trackEvent(SEGMENTS.pdpAtb, 'ATB from PDP');
      return;
    }

    if (pageType() !== 'PLP' || !getFlag('sy012-quicklink-clicked')) return;

    if (target.closest('cx-product-grid-item button[type="submit"]')) {
      trackEvent(SEGMENTS.plpAtb, 'ATB from subsequent PLP');
      return;
    }
    if (target.closest('cx-product-grid-item a[href*="/p/"]')) {
      trackEvent(SEGMENTS.plpClickThrough, 'Click through from subsequent PLP');
    }
  }

  // Starts tracking once per page load: the experience push, the click listener and the DOM watcher.
  function startTracking() {
    if (window.__sy012Initialized) return;
    window.__sy012Initialized = true;

    pushDataLayer({
      event: 'conversio_experience',
      conversio: {
        experience_category: 'Conversio Experience',
        experience_action: 'SY012 | Quicklinks on PDPs',
        experience_label: EXPERIENCE_LABEL,
        experience_segment: EXPERIENCE_SEGMENT
      }
    });

    document.addEventListener('click', onClick, true);

    // Re-check after each DOM change (next frame, or 100ms in the background).
    var scheduled = false;
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      var run = function () {
        if (!scheduled) return;
        scheduled = false;
        showQuicklinks();
      };
      requestAnimationFrame(run);
      setTimeout(run, 100);
    }
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    showQuicklinks();
  }

  function apply(context, template) {
    // The quicklinks are built from the breadcrumb, so the Handlebars template is not used here.
    // The quicklinks always go after the product title, so the Salesforce content zone does not decide placement.
    active = true;
    injectStyles();
    // Tracking starts on every page, including PLPs, where the title never appears.
    startTracking();
    if (pageType() !== 'PDP') return Promise.resolve();
    return Evergage.DisplayUtils
      .pageElementLoaded(zoneSelector)
      .then(function () {
        showQuicklinks();
      });
  }

  function reset(context, template) {
    active = false;
    var row = document.getElementById(ROW_ID);
    if (row) row.remove();
  }

  function control(context) {
    // Campaign stats attributes, as the Salesforce template requires. Control tracking runs in the control folder.
    zoneSelector = Evergage.getContentZoneSelector(context.contentZone);
    return Evergage.DisplayUtils
      .pageElementLoaded(zoneSelector)
      .then(function (element) {
        Evergage.cashDom(element).attr({
          "data-evg-campaign-id": context.campaign,
          "data-evg-experience-id": context.experience,
          "data-evg-user-group": context.userGroup
        });
      });
  }

  if (typeof window.registerTemplate === 'function') {
    // Salesforce Personalization runs this template.
    registerTemplate({
      apply: apply,
      reset: reset,
      control: control
    });
  } else {
    // Local tester (no Salesforce on the page): run the variation directly.
    active = true;
    injectStyles();
    startTracking();
  }

})();
