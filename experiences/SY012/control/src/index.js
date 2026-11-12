(function () {

  // Segments and labels from the control event snippets. Labels with "| page type" or "| breadcrumb level" are filled in live.
  var EXPERIENCE_SEGMENT = 'SY012.XCO';
  var EXPERIENCE_LABEL = 'SY012 | Control Original';
  var LABEL_PREFIX = 'SY012 | (Control Original) | ';
  var SEGMENTS = {
    trigger: 'SY012ECOQ',
    quicklinkClick: 'SY012ECOG',
    plpAtb: 'SY012ECOH',
    plpClickThrough: 'SY012ECOI',
    pdpAtb: 'SY012ECOJ',
    quantityUp: 'SY012ECOK',
    quantityDown: 'SY012ECOL',
    breadcrumb: 'SY012ECOM',
    breadcrumbLevel: 'SY012ECON'
  };

  // Breadcrumb levels from the brief: 2nd is All, 3rd is More, 5th is Alternatives.
  // Breadcrumb items are Home (1), then the categories, then the product (no link).
  var QUICKLINKS = [
    { level: 2, type: 'All' },
    { level: 3, type: 'More' },
    { level: 5, type: 'Alternatives' }
  ];

  var zoneSelector = 'cx-product-intro h1';

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

  // Same rule as variation 1: a level only counts if the breadcrumb has a link there.
  function quicklinksWouldShow() {
    var items = crumbItems();
    return QUICKLINKS.some(function (quicklink) {
      var item = items[quicklink.level - 1];
      return !!(item && item.querySelector('a'));
    });
  }

  // Fires the trigger once per session on a PDP where variation 1 would show the quicklinks. Changes nothing on the page.
  function checkTrigger() {
    if (pageType() !== 'PDP') return;
    if (!document.querySelector(zoneSelector)) return;
    if (!quicklinksWouldShow()) return;

    if (!getFlag('sy012-quicklinks-present')) {
      setFlag('sy012-quicklinks-present');
      trackEvent(SEGMENTS.trigger, 'Quicklinks present (trigger)');
    }
  }

  function crumbLevel(crumb) {
    return Array.prototype.indexOf.call(crumbItems(), crumb.closest('li')) + 1;
  }

  // Label value per the spec: breadcrumb level and name, e.g. "1 (Home)" or "3 (Milk)".
  function crumbLevelLabel(crumb) {
    return crumbLevel(crumb) + ' (' + crumb.textContent.trim() + ')';
  }

  // One delegated listener: the storefront re-renders these nodes, and only real clicks count.
  // Clicks on quicklink never happen in control, so the "after a quicklink" flag is never set here.
  function onClick(event) {
    if (!event.isTrusted) return;
    // Several copies of this script can listen on the same page. Each click is handled once.
    if (event.__sy012Handled) return;
    event.__sy012Handled = true;
    var target = event.target;
    if (!target || !target.closest) return;

    var crumb = target.closest('nav[aria-label="breadcrumbs"] a');
    if (crumb) {
      trackEvent(SEGMENTS.breadcrumb, 'Breadcrumb click');
      trackEvent(SEGMENTS.breadcrumbLevel, 'Breadcrumb click | ' + crumbLevelLabel(crumb));
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
    // The page marker stops a second copy of the script from starting tracking again.
    if (window.__sy012Initialized || document.documentElement.getAttribute('data-sy012-tracking')) return;
    window.__sy012Initialized = true;
    document.documentElement.setAttribute('data-sy012-tracking', '1');

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
        checkTrigger();
      };
      requestAnimationFrame(run);
      setTimeout(run, 100);
    }
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    checkTrigger();
  }

  function apply(context, template) {
    // Control never renders, so there is nothing to show here.
    return Promise.resolve();
  }

  function reset(context, template) {}

  function control(context) {
    // Control group: campaign stats attributes on the content zone, then tracking. The page is not changed.
    // Tracking starts on every page, including PLPs, where the product title never appears.
    startTracking();
    if (pageType() !== 'PDP') return Promise.resolve();
    // The campaign attributes go on the Salesforce content zone; placement does not use it.
    return Evergage.DisplayUtils
      .pageElementLoaded(Evergage.getContentZoneSelector(context.contentZone))
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
    // Local tester (no Salesforce on the page): run the control directly.
    startTracking();
  }

})();
