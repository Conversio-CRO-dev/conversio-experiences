if (!window.__sy012Initialized) {
  window.__sy012Initialized = true;

  // Event labels from the ticket. Console only while building, the event generator's push replaces it.
  var EVENT_LABEL = 'SY012 (Variation 1) | ';
  function logEvent(name) {
    console.log(EVENT_LABEL + name);
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

  // Breadcrumb levels from the brief: 2nd is All, 3rd is More, 5th is Alternatives.
  // Breadcrumb items are Home (1), then the categories, then the product (no link).
  var QUICKLINKS = [
    { level: 2, type: 'All', before: 'View All ', after: '' },
    { level: 3, type: 'More', before: 'View More ', after: '' },
    { level: 5, type: 'Alternatives', before: 'View ', after: ' Alternatives' }
  ];

  function crumbItems() {
    return document.querySelectorAll('nav[aria-label="breadcrumbs"] ol > li');
  }

  // A level only gets a link if the breadcrumb has one there, so short breadcrumbs show fewer links.
  function buildRow() {
    var items = crumbItems();
    var row = document.createElement('div');
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

  function renderQuicklinks() {
    var existing = document.querySelector('.sy012-quicklinks');
    if (pageType() !== 'PDP') {
      if (existing) existing.remove();
      return;
    }

    var title = document.querySelector('cx-product-intro h1');
    if (!title) return;
    if (existing && existing.getAttribute('data-path') === window.location.pathname) return;
    if (existing) existing.remove();

    var row = buildRow();
    if (!row) return;
    title.insertAdjacentElement('afterend', row);

    if (!getFlag('sy012-quicklinks-present')) {
      setFlag('sy012-quicklinks-present');
      logEvent('Quicklinks present (trigger)');
    }
  }

  // One delegated listener: the site re-renders these nodes, and only real clicks count.
  document.addEventListener('click', function (event) {
    if (!event.isTrusted) return;
    var target = event.target;
    if (!target || !target.closest) return;

    var quicklink = target.closest('.sy012-quicklinks a');
    if (quicklink) {
      setFlag('sy012-quicklink-clicked');
      logEvent('Clicks on quicklink | ' + quicklink.getAttribute('data-link-type'));
      return;
    }

    var crumb = target.closest('nav[aria-label="breadcrumbs"] a');
    if (crumb) {
      var level = Array.prototype.indexOf.call(crumbItems(), crumb.closest('li')) + 1;
      logEvent('Breadcrumb click');
      logEvent('Breadcrumb click | ' + level);
      return;
    }

    if (target.closest('cx-item-counter button.item-control-add')) {
      logEvent('Increases quantity | ' + pageType());
      return;
    }
    if (target.closest('cx-item-counter button.item-control-remove')) {
      logEvent('Decreases quantity | ' + pageType());
      return;
    }

    if (target.closest('cx-add-to-cart button[type="submit"]') && pageType() === 'PDP') {
      logEvent('ATB from PDP');
      return;
    }

    if (pageType() !== 'PLP' || !getFlag('sy012-quicklink-clicked')) return;

    if (target.closest('cx-product-grid-item button[type="submit"]')) {
      logEvent('ATB from subsequent PLP');
      return;
    }
    if (target.closest('cx-product-grid-item a[href*="/p/"]')) {
      logEvent('Click through from subsequent PLP');
    }
  }, true);

  // The storefront re-renders the PDP on navigation, so re-check after each change (next frame, or 100ms in the background).
  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    var run = function () {
      if (!scheduled) return;
      scheduled = false;
      renderQuicklinks();
    };
    requestAnimationFrame(run);
    setTimeout(run, 100);
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  schedule();
}
