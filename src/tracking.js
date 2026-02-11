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
