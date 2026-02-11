/**
 * WhatsApp Widget - Embeddable WhatsApp Button
 *
 * Usage:
 * <script src="https://yourdomain.com/whatsapp-widget.js?phone=5511999999999&message=Hello"></script>
 *
 * Or with data attributes:
 * <script src="https://yourdomain.com/whatsapp-widget.js"
 *         data-whatsapp-phone="5511999999999"
 *         data-whatsapp-message="Hello"></script>
 *
 * Tracking parameters (UTM + click IDs) are automatically enriched into the
 * {url} placeholder from three sources, in ascending priority order:
 *   1. document.referrer  (lowest — sets utm_source only)
 *   2. RD Station cookie  (__trf.src)
 *   3. Current page URL   (highest — always wins)
 *
 * To disable tracking enrichment, pass utm=false:
 * <script src="...?phone=551199...&utm=false"></script>
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.__whatsappWidgetInitialized) {
    return;
  }
  window.__whatsappWidgetInitialized = true;
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
  // ─── Tracking ───────────────────────────────────────────────────────

  var TRACKING_KEYS = [
    // Standard UTM parameters
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    // Ad-platform click identifiers
    'gclid', 'fbclid', 'msclkid'
  ];

  /**
   * Return a new object containing only recognized tracking keys from obj.
   */
  function pickTracking(obj) {
    var result = {};
    TRACKING_KEYS.forEach(function(k) {
      if (obj[k]) result[k] = obj[k];
    });
    return result;
  }

  /**
   * Copy all own keys from source into target (mutates target).
   */
  function merge(target, source) {
    Object.keys(source).forEach(function(k) { target[k] = source[k]; });
  }

  // ── Tracking providers (lowest to highest priority) ─────────────────

  /**
   * Provider: extract utm_source from document.referrer when external.
   * Compares the last two domain segments as a registrable-domain approximation
   * so subdomains of the same site (blog.plaza.com -> app.plaza.com) are not
   * flagged as external referrers.
   */
  function resolveFromReferrer() {
    var result = {};
    try {
      if (!document.referrer) return result;
      var refMatch = document.referrer.match(/^https?:\/\/([^/:]+)/);
      if (!refMatch) return result;

      var refHost = refMatch[1].replace(/^www\./, '').toLowerCase();
      var pageHost = window.location.hostname.replace(/^www\./, '').toLowerCase();

      var refDomain  = refHost.split('.').slice(-2).join('.');
      var pageDomain = pageHost.split('.').slice(-2).join('.');

      if (refDomain !== pageDomain) {
        // Use the second-level label as the source name (e.g. "google")
        var parts = refHost.split('.');
        result.utm_source = parts.length >= 2 ? parts[parts.length - 2] : refHost;
      }
    } catch (e) {
      console.warn('WhatsApp Widget: failed to resolve referrer tracking', e);
    }
    return result;
  }

  /**
   * Provider: extract tracking params from RD Station's __trf.src cookie.
   * The cookie value is base64-encoded JSON with session data.
   */
  function resolveFromRdStation() {
    var result = {};
    try {
      var c = document.cookie.match(/(?:^|;\s*)__trf\.src=encoded_(.*?)(?:;|$)/);
      if (!c) return result;
      var decoded = JSON.parse(atob(c[1]));
      var session = decoded.current_session || decoded.first_session || {};
      merge(result, pickTracking(parseQueryString(session.value)));
    } catch (e) {
      console.warn('WhatsApp Widget: failed to resolve RD Station tracking', e);
    }
    return result;
  }

  /**
   * Provider: extract tracking params from the current page URL.
   */
  function resolveFromUrl() {
    return pickTracking(parseQueryString(window.location.search));
  }

  /** Ordered lowest-to-highest priority. Later providers overwrite earlier. */
  var TRACKING_PROVIDERS = [
    resolveFromReferrer,
    resolveFromRdStation,
    resolveFromUrl
  ];

  /**
   * Resolve tracking params by running all providers in priority order.
   * Called lazily so late-arriving cookies (e.g. after consent banners) are captured.
   */
  function resolveTracking() {
    var result = {};
    TRACKING_PROVIDERS.forEach(function(provider) {
      merge(result, provider());
    });
    return result;
  }

  /**
   * Build the current page URL enriched with resolved tracking params.
   * Params already present in the URL are never duplicated.
   */
  function getEnrichedUrl() {
    var tracking = resolveTracking();
    var search = window.location.search;
    var toAdd = [];

    Object.keys(tracking).forEach(function(k) {
      // Anchored regex avoids substring false-positives (e.g. "custom_utm_source=")
      var escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var pattern = new RegExp('[?&]' + escaped + '=');
      if (!pattern.test(search) && tracking[k]) {
        toAdd.push(encodeURIComponent(k) + '=' + encodeURIComponent(tracking[k]));
      }
    });

    if (!toAdd.length) return window.location.href;

    var hash = window.location.hash || '';
    var base = hash ? window.location.href.replace(hash, '') : window.location.href;
    return base + (base.indexOf('?') === -1 ? '?' : '&') + toAdd.join('&') + hash;
  }
  // ─── Configuration ──────────────────────────────────────────────────

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var urlParams = parseQueryString((currentScript.src || '').split('?')[1]);

  function getParam(name, dataAttr, fallback) {
    return urlParams[name] || currentScript.getAttribute(dataAttr) || fallback;
  }

  var config = {
    phone:    getParam('phone',    'data-whatsapp-phone',    ''),
    message:  getParam('message',  'data-whatsapp-message',  ''),
    position: getParam('position', 'data-whatsapp-position', 'bottom-left'),
    tooltip:  getParam('tooltip',  'data-whatsapp-tooltip',  'Converse conosco no WhatsApp'),
    color:    getParam('color',    'data-whatsapp-color',    '#25D366'),
    size:     getParam('size',     'data-whatsapp-size',     '60'),
    utm:      getParam('utm',      'data-whatsapp-utm',      'true')
  };

  if (!config.phone) {
    console.error(
      'WhatsApp Widget Error: Phone number is required. ' +
      'Provide it via URL parameter "phone" or data attribute "data-whatsapp-phone".'
    );
    return;
  }
  // ─── Message Processing ─────────────────────────────────────────────

  /**
   * Replace template placeholders in the message string.
   * Tracking enrichment is resolved lazily at call time.
   */
  function processMessage(message) {
    var url = (config.utm !== 'false') ? getEnrichedUrl() : window.location.href;
    return message
      .replace(/\{url\}/g,    url)
      .replace(/\{title\}/g,  document.title)
      .replace(/\{domain\}/g, window.location.hostname)
      .replace(/\{path\}/g,   window.location.pathname);
  }

  /**
   * Build the full wa.me URL with processed message and cleaned phone number.
   */
  function buildWhatsAppUrl() {
    var cleanPhone = config.phone.replace(/[^\d]/g, '');
    return 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(processMessage(config.message));
  }
  // ─── UI: Tooltip ────────────────────────────────────────────────────

  /**
   * Create a show/hide tooltip manager bound to a button position.
   * Returns { show: Function, hide: Function }.
   */
  function createTooltipManager(position, text) {
    var tooltip = null;

    function positionOffset() {
      var s = {};
      var offset = '90px';
      var edge = '20px';
      switch (position) {
        case 'bottom-right': s.bottom = offset; s.right = edge; break;
        case 'top-left':     s.top = offset;    s.left = edge;  break;
        case 'top-right':    s.top = offset;    s.right = edge; break;
        case 'bottom-left':
        default:             s.bottom = offset; s.left = edge;  break;
      }
      return s;
    }

    function show() {
      if (tooltip) return;

      tooltip = document.createElement('div');
      tooltip.className = 'whatsapp-widget-tooltip';
      tooltip.textContent = text;

      var styles = {
        'position': 'fixed',
        'background-color': '#333',
        'color': 'white',
        'padding': '8px 12px',
        'border-radius': '6px',
        'font-size': '14px',
        'white-space': 'nowrap',
        'z-index': '10000',
        'opacity': '0',
        'transition': 'opacity 0.3s ease',
        'pointer-events': 'none',
        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.2)'
      };
      merge(styles, positionOffset());
      applyStyles(tooltip, styles);

      document.body.appendChild(tooltip);
      setTimeout(function() {
        if (tooltip) tooltip.style.opacity = '0.95';
      }, 10);
    }

    function hide() {
      if (!tooltip) return;
      tooltip.style.opacity = '0';
      var ref = tooltip;
      tooltip = null;
      setTimeout(function() {
        if (ref && ref.parentNode) ref.parentNode.removeChild(ref);
      }, 300);
    }

    return { show: show, hide: hide };
  }
  // ─── UI: Button ─────────────────────────────────────────────────────

  function createButton() {
    var button = document.createElement('a');
    button.id = 'whatsapp-widget-button-' + Date.now();
    button.className = 'whatsapp-widget-button';

    // Set initial href (will be refreshed on click for late-arriving tracking data)
    button.href = buildWhatsAppUrl();
    button.target = '_blank';
    button.rel = 'noopener noreferrer';

    // Refresh href on click so tracking resolved lazily captures late cookies / SPA navigations
    button.addEventListener('click', function() {
      button.href = buildWhatsAppUrl();
    });

    // WhatsApp SVG icon
    var iconSize = config.size * 0.5;
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" ' +
      'width="' + iconSize + '" height="' + iconSize + '">' +
      '<path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 ' +
      '222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 ' +
      '224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4' +
      '-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 ' +
      '49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 ' +
      '184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 ' +
      '18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 ' +
      '1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9' +
      '-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 ' +
      '2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 ' +
      '4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>' +
      '</svg>';

    // Position
    var positionStyles = {};
    switch (config.position) {
      case 'bottom-right': positionStyles.bottom = '20px'; positionStyles.right = '20px'; break;
      case 'top-right':    positionStyles.top = '20px';    positionStyles.right = '20px'; break;
      case 'top-left':     positionStyles.top = '20px';    positionStyles.left = '20px';  break;
      case 'bottom-left':
      default:             positionStyles.bottom = '20px'; positionStyles.left = '20px';  break;
    }

    var buttonStyles = {
      'position': 'fixed',
      'width': config.size + 'px',
      'height': config.size + 'px',
      'background-color': config.color,
      'border-radius': '50%',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
      'z-index': '9999',
      'transition': 'all 0.3s ease',
      'text-decoration': 'none',
      'color': 'white',
      'cursor': 'pointer',
      '-webkit-tap-highlight-color': 'transparent'
    };
    merge(buttonStyles, positionStyles);
    applyStyles(button, buttonStyles);

    // Tooltip
    var tooltipMgr = createTooltipManager(config.position, config.tooltip);

    // Desktop hover effects
    if (!('ontouchstart' in window)) {
      button.addEventListener('mouseenter', function() {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        tooltipMgr.show();
      });
      button.addEventListener('mouseleave', function() {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        tooltipMgr.hide();
      });
    }

    // Mobile touch feedback
    button.addEventListener('touchstart', function() {
      button.style.transform = 'scale(0.95)';
    });
    button.addEventListener('touchend', function() {
      button.style.transform = 'scale(1)';
    });

    // Pulse animation on load
    setTimeout(function() {
      button.style.animation = 'whatsapp-widget-pulse 2s ease-in-out';
    }, 1000);

    return button;
  }
  // ─── UI: Animations ─────────────────────────────────────────────────

  function addAnimations() {
    if (document.getElementById('whatsapp-widget-styles')) return;

    var style = document.createElement('style');
    style.id = 'whatsapp-widget-styles';
    style.textContent =
      '@keyframes whatsapp-widget-pulse {' +
      '  0% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }' +
      '  50% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4); }' +
      '  100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }' +
      '}' +
      '@media (max-width: 768px) {' +
      '  .whatsapp-widget-button { width: 50px !important; height: 50px !important; }' +
      '  .whatsapp-widget-button svg { width: 25px !important; height: 25px !important; }' +
      '}';
    document.head.appendChild(style);
  }
  // ─── Init ───────────────────────────────────────────────────────────

  function init() {
    addAnimations();
    document.body.appendChild(createButton());
    console.log('WhatsApp Widget initialized successfully');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
