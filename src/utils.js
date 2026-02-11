  // ─── Utils ──────────────────────────────────────────────────────────

  /**
   * Decode a URI component with Latin-1 fallback for legacy Brazilian systems.
   * Handles Portuguese characters like a, e, i, o, u, a, o, c.
   */
  function safeDecode(str) {
    if (!str) return '';
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return str.replace(/%([0-9A-Fa-f]{2})/g, function(_, hex) {
        return String.fromCharCode(parseInt(hex, 16));
      });
    }
  }

  /**
   * Parse a query string into a plain object.
   * Handles optional leading "?" and uses safeDecode for both keys and values.
   */
  function parseQueryString(qs) {
    var obj = {};
    (qs || '').replace(/^\?/, '').split('&').forEach(function(pair) {
      var kv = pair.split('=');
      if (kv.length === 2 && kv[0]) {
        // Replace + with space before decoding (application/x-www-form-urlencoded)
        obj[safeDecode(kv[0].replace(/\+/g, ' '))] = safeDecode(kv[1].replace(/\+/g, ' '));
      }
    });
    return obj;
  }

  /**
   * Apply a CSS-property-keyed style object to a DOM element.
   * Converts kebab-case keys to camelCase automatically.
   */
  function applyStyles(el, styles) {
    Object.keys(styles).forEach(function(prop) {
      el.style[prop.replace(/-([a-z])/g, function(_, c) { return c.toUpperCase(); })] = styles[prop];
    });
  }
