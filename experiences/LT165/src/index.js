console.log('LT165 loaded');

// Write your plain JavaScript here
// No imports needed - just vanilla JS

// Example: Wait for an element
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found after ${timeout}ms`));
    }, timeout);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
};

// Example: Modify the page
waitForElement('body')
  .then(() => {
    console.log('Body found, ready to modify');
    // Add your code here
  })
  .catch(err => console.error('Error:', err));

// Example: Send tracking event
if (window.dataLayer) {
  window.dataLayer.push({
    event: 'conversioEvent',
    conversioEventName: 'LT165_LOADED',
  });
}
