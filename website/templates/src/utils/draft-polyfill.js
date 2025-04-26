// Polyfill for Draft.js global object
if (typeof global === 'undefined') {
  window.global = window;
} 