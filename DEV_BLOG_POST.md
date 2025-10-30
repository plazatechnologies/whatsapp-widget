# We Built a 2KB WhatsApp Widget Because Everything Else Was Bloated

**TL;DR:** Needed a simple WhatsApp button. Found 50KB jQuery plugins. Built our own in vanilla JS. Made it open source. One script tag, zero dependencies, actually works.

[GitHub](https://github.com/plazatechnologies/whatsapp-widget) | [Live Demo](https://plazatechnologies.github.io/whatsapp-widget)

---

## The Problem Nobody Asked to Solve (But Here We Are)

Picture this: You're building a website for a real estate client in São Paulo. They want a WhatsApp button. "Should be easy," you think. "I'll just grab an open-source widget."

Fast forward three hours, and you're debugging why `Olá! Estou interessado em imóveis` displays as `Ol�! Estou interessado em im�veis` in WhatsApp.

Welcome to the wonderful world of WhatsApp widgets in 2025.

### What We Found Out There

After surveying the landscape, here's what most solutions looked like:

**Option 1: The jQuery Dinosaur**
```html
<link rel="stylesheet" href="whatsapp-widget.css">
<script src="jquery-3.x.x.min.js"></script>
<script src="whatsapp-widget.js"></script>
<script>
  $(document).ready(function() {
    $('.whatsapp-widget').whatsappWidget({
      phone: '5511999999999',
      // 47 more lines of config...
    });
  });
</script>
```

**Weight:** 87KB minified (jQuery + plugin)
**Dependencies:** jQuery (which you probably don't use anymore)
**Setup time:** 10+ minutes
**Breaking in production:** Guaranteed when jQuery version changes

**Option 2: The "SaaS" Solution**
```html
<script src="https://vendor.com/widget.js?key=abc123"></script>
```

**Cost:** Free for 100 conversations/month, then $49/month
**Privacy:** Every click tracked and monetized
**Performance:** 120KB + external tracking scripts
**Your data:** Belongs to them now

**Option 3: The "Framework-First" Widget**
```bash
npm install @some/whatsapp-react-widget
npm install styled-components
npm install react-spring
npm install framer-motion
```

**Bundle size:** "Only" 234KB
**Dependencies:** 12 packages
**Works without React:** No
**Overkill for a floating button:** Absolutely

---

## What We Actually Needed

Let's be real. A WhatsApp button is:
- A floating circle
- With an icon
- That opens a link

That's it. No animations framework. No state management. No server-side tracking. No jQuery.

Just HTML, CSS, and a sprinkle of JavaScript.

### Our Requirements

1. **One-line integration** → Paste a script tag, you're done
2. **CDN-delivered** → No npm, no build step, no server
3. **Zero dependencies** → Vanilla JavaScript, works everywhere
4. **Lightweight** → Under 5KB minified
5. **Customizable** → Colors, positions, messages, all configurable
6. **Bulletproof encoding** → Brazilian Portuguese must work (we learned this the hard way)
7. **Free forever** → MIT licensed, no tracking, no BS

---

## The Solution: One Script Tag to Rule Them All

Here's the entire integration:

```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"
        data-whatsapp-message="Hi! I'm interested in your properties"></script>
```

**That's it.**

Refresh your page. See a beautiful WhatsApp button. Mobile-optimized. Desktop-friendly. Works everywhere.

---

## How We Built It: Technical Deep Dive

### 1. CDN-First Architecture

We chose GitHub + jsDelivr as our distribution method:

```
https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js
```

**Why this rocks:**
- **100+ edge locations worldwide** → Fast everywhere
- **Automatic versioning** → Semantic versioning built in
- **Free forever** → jsDelivr is sponsored by open source
- **No server costs** → We don't maintain infrastructure
- **Auto-updates** → Use `@1` for latest 1.x.x, or pin to `@1.0.0`

### 2. Zero Dependencies = Zero Problems

The entire widget is vanilla JavaScript wrapped in an IIFE:

```javascript
(function() {
  'use strict';

  // Prevent double initialization
  if (window.__whatsappWidgetInitialized) {
    return;
  }
  window.__whatsappWidgetInitialized = true;

  // Get script element
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Configuration from data attributes or URL params
  var config = {
    phone: urlParams.phone || currentScript.getAttribute('data-whatsapp-phone'),
    message: urlParams.message || currentScript.getAttribute('data-whatsapp-message'),
    position: urlParams.position || currentScript.getAttribute('data-whatsapp-position') || 'bottom-left',
    color: urlParams.color || currentScript.getAttribute('data-whatsapp-color') || '#25D366',
    size: urlParams.size || currentScript.getAttribute('data-whatsapp-size') || '60'
  };

  // Create button, inject styles, initialize
  init();
})();
```

**No jQuery. No React. No framework lock-in.**

### 3. The Brazilian Portuguese Problem (And How We Solved It)

Here's a fun bug we encountered: URL encoding in Brazilian Portuguese.

WhatsApp uses `wa.me/?text=` links. Simple, right? Just `encodeURIComponent()` the message and you're done.

**WRONG.**

Some legacy Brazilian systems use Latin-1 encoding instead of UTF-8. When a user types "Olá, estou interessado em imóveis", you might get:

```
Ol%E1, estou interessado em im%F3veis
```

Standard `decodeURIComponent()` throws:
```
URIError: URI malformed
```

Our solution: **Brazilian-proof encoding fallback**

```javascript
function safeDecode(str) {
  if (!str) return '';

  try {
    // Try UTF-8 first (modern systems)
    return decodeURIComponent(str);
  } catch (e) {
    // Latin-1 fallback for legacy Brazilian systems
    // Handles á, é, í, ó, ú, ã, õ, ç properly
    return str.replace(/%([0-9A-Fa-f]{2})/g, function(match, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
}
```

Boom. Works on modern sites AND legacy systems.

### 4. Message Placeholders for Smarter Tracking

Want to know which page users contact you from? Use placeholders:

```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"
        data-whatsapp-message="Hi! I'm contacting from {url} about {title}"></script>
```

These get auto-replaced:
- `{url}` → Current page URL
- `{title}` → Page title
- `{domain}` → Domain name
- `{path}` → URL path

**Real example:**

User clicks button on `example.com/properties/luxury-penthouse`

WhatsApp opens with:
> Hi! I'm contacting from https://example.com/properties/luxury-penthouse about Luxury Penthouse - Downtown

No server required. No tracking pixels. Pure client-side magic.

### 5. Inline Styles = No CSS Conflicts

We inject all styles via JavaScript to avoid CSS conflicts:

```javascript
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
  'transition': 'all 0.3s ease'
};

// Apply styles
for (var style in buttonStyles) {
  button.style[style] = buttonStyles[style];
}
```

No external CSS file. No specificity wars. No `!important` battles.

### 6. Performance Obsession

Final minified size: **5.4KB**
Gzipped: **~2KB**

How?
- Tree-shaking via Terser
- No external dependencies
- Inline SVG icon (no image requests)
- CSS injected via JavaScript
- Single HTTP request

**Load time from CDN:** <50ms globally

---

## Configuration Options: Simple Yet Powerful

### Data Attributes (Recommended)

```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"
        data-whatsapp-message="Hello!"
        data-whatsapp-position="bottom-right"
        data-whatsapp-tooltip="Chat with us"
        data-whatsapp-color="#FF6B6B"
        data-whatsapp-size="70"></script>
```

### URL Parameters (Dynamic Configuration)

```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js?phone=5511999999999&position=bottom-left&color=%2325D366"></script>
```

### Hybrid Approach

```html
<!-- Static config via data attributes, dynamic phone via URL -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js?phone=<?= $client_phone ?>"
        data-whatsapp-message="Hi! I found you via {domain}"
        data-whatsapp-position="bottom-right"></script>
```

---

## Platform Integration Examples

### WordPress
```php
// functions.php or footer.php
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="<?php echo get_option('whatsapp_number'); ?>"></script>
```

### React
```jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js';
  script.setAttribute('data-whatsapp-phone', '5511999999999');
  document.body.appendChild(script);

  return () => document.body.removeChild(script);
}, []);
```

### Google Tag Manager
```html
<!-- Custom HTML Tag -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"></script>
```

### Shopify, Wix, Squarespace, Webflow
Just paste the script tag. Seriously. That's it.

---

## Versioning Strategy: No Breaking Changes

We use semantic versioning with jsDelivr smart URLs:

**For production (recommended):**
```html
<!-- Auto-updates to latest 1.x.x version -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"></script>
```

**For maximum stability:**
```html
<!-- Locked to exact version -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1.0.0/dist/whatsapp-widget.min.js"></script>
```

**For testing/development:**
```html
<!-- Always latest (including breaking changes) -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@latest/dist/whatsapp-widget.min.js"></script>
```

---

## Comparison: Us vs. The Competition

| Feature | Plaza Widget | jQuery Plugins | SaaS Widgets | React Widgets |
|---------|--------------|----------------|--------------|---------------|
| **File size** | 2KB gzipped | 50KB+ | 120KB+ | 234KB+ |
| **Dependencies** | Zero | jQuery | Proprietary | React + 12 libs |
| **Integration time** | 30 seconds | 10+ minutes | 5 minutes | 30+ minutes |
| **Framework required** | None | None | None | React |
| **Cost** | Free forever | Free | Free → $49/mo | Free |
| **Privacy** | No tracking | No tracking | Full tracking | No tracking |
| **Customizable** | ✅ | ✅ | Limited | ✅ |
| **CDN delivery** | ✅ | ❌ | ✅ | ❌ |
| **Works offline** | After cache | After cache | ❌ | After build |
| **Brazilian support** | ✅ | ❌ | ❌ | ❌ |

---

## What's Next: Our Roadmap

We're keeping this simple, but we have some ideas:

- **Multi-agent support** → Different buttons for sales, support, etc.
- **Schedule-based visibility** → Show/hide based on business hours
- **Analytics integration** → Optional GA4/Plausible events
- **Dark mode support** → Auto-detect system theme
- **More message placeholders** → UTM params, referrer, etc.

**But here's the thing:** We won't add features just to add features.

Every addition must:
1. Solve a real problem
2. Keep the bundle under 10KB
3. Remain zero-dependency
4. Not break existing integrations

---

## Open Source is Scary (But Worth It)

This is Plaza Technologies' first open-source project.

We're a small team in Brazil building software for real estate clients. We're not a big OSS company. We don't have a huge community (yet). We're just developers who got tired of bloated solutions.

**What we learned:**

1. **Documentation takes longer than code** → This README took 3x longer than the widget itself
2. **Edge cases are infinite** → We thought we covered everything. We didn't.
3. **People want simple tools** → "Just make it work" beats "50 configuration options"
4. **Sharing is scary** → What if nobody uses it? What if everyone hates it?

But we're doing it anyway.

---

## How You Can Help

⭐ **Star the repo** → It helps with visibility
🐛 **Report bugs** → We test, but not everything
💡 **Suggest features** → Lightweight additions only
🔧 **Submit PRs** → Code review is friendly, we promise
📢 **Share** → Tweet, blog, tell a friend
☕ **Use it in production** → And let us know where!

---

## Try It Right Now (60-Second Challenge)

1. Open any HTML file
2. Paste this before `</body>`:
```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"
        data-whatsapp-message="Testing the Plaza Widget!"></script>
```
3. Refresh the page
4. See a WhatsApp button. Click it.

Took longer than 60 seconds? We failed. Open an issue.

---

## Final Thoughts

We built this because we needed it. We're sharing it because you might need it too.

No vendor lock-in. No tracking. No credit card. No BS.

Just a simple, fast, reliable WhatsApp button that actually works.

**For developers who want things to just work. 🛠️**

---

## Links

- **GitHub:** https://github.com/plazatechnologies/whatsapp-widget
- **Live Demo:** https://plazatechnologies.github.io/whatsapp-widget
- **Issues:** https://github.com/plazatechnologies/whatsapp-widget/issues
- **CDN Stats:** https://www.jsdelivr.com/package/gh/plazatechnologies/whatsapp-widget

---

## About Plaza Technologies

We're a small development team in São Paulo, Brazil, building software for real estate companies. This is our first open-source project, but hopefully not our last.

Follow us on [LinkedIn](https://linkedin.com/company/plazatechnologies) | [GitHub](https://github.com/plazatechnologies)

---

*Built with ☕ in São Paulo, Brazil*
*MIT Licensed | No Tracking | Free Forever*

---

## Comments & Discussion

What do you think? Too simple? Missing features? Let's talk in the comments. 👇

Have you tried it? Found a bug? Have ideas? We're listening.

And if you use it in production, please share! We'd love to see where this little widget ends up.

---

**Tags:** #opensource #javascript #webdev #whatsapp #cdn #performance #vanilla-js #brazil #developer-tools #web-development
