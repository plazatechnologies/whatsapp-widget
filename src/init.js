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
