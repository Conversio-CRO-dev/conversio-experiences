const dedupCache = new Set();

function fireDataLayerEvent(eventName, eventData = {}) {
  if (!window.dataLayer) {
    console.warn('dataLayer not found; event not fired');
    return;
  }

  const eventKey = JSON.stringify({ eventName, ...eventData });
  if (dedupCache.has(eventKey)) {
    console.debug('Deduped dataLayer event:', eventName);
    return;
  }

  dedupCache.add(eventKey);
  window.dataLayer.push({
    event: 'conversioEvent',
    conversioEventName: eventName,
    ...eventData,
  });
}

function fireAdobeEvent(eventType, eventData = {}) {
  if (!window.adobeDataLayer) {
    console.warn('adobeDataLayer not found; event not fired');
    return;
  }

  const eventKey = JSON.stringify({ eventType, ...eventData });
  if (dedupCache.has(eventKey)) {
    console.debug('Deduped Adobe event:', eventType);
    return;
  }

  dedupCache.add(eventKey);
  window.adobeDataLayer.push({
    event: 'targetClickEvent',
    eventType,
    ...eventData,
  });
}

module.exports = { fireDataLayerEvent, fireAdobeEvent };
