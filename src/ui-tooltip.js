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
