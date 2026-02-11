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
