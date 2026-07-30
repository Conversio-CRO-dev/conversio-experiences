export function elementReady(selector, timeout = 5000) {
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
        clearTimeout(timer);
        resolve(el);
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found after ${timeout}ms`));
    }, timeout);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}
