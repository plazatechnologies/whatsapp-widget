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
