export function makeStyleElementString(css) {
  return `<style type="text/css">${css}</style>`;
}

export function injectStyles(css) {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}
