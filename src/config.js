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
