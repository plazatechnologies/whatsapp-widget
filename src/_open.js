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
