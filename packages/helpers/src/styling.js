function makeStyleElementString(css) {
  return `<style type="text/css">${css}</style>`;
}

function injectStyles(css) {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

module.exports = { makeStyleElementString, injectStyles };
