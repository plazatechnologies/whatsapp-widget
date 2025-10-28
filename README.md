# Plaza WhatsApp Widget CDN

A lightweight, customizable WhatsApp widget for embedding on any website. Served via jsDelivr CDN for optimal performance and global availability.

## 📦 Quick Start

Add this script tag to your website:

```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"
        data-whatsapp-message="Hello, I'm interested in your properties"></script>
```

That's it! A floating WhatsApp button will appear on your website.

## 🚀 CDN URLs

### Recommended (Specific Version)
```html
<!-- Version 1.x (gets latest 1.x.x version) -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"></script>

<!-- Specific version (most stable) -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1.0.0/dist/whatsapp-widget.min.js"></script>
```

### Auto-updating (Latest)
```html
<!-- Always gets the latest version -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@latest/dist/whatsapp-widget.min.js"></script>
```

### With Subresource Integrity (SRI)
```html
<!-- Most secure option with integrity check -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1.0.0/dist/whatsapp-widget.min.js"
        integrity="sha384-kGaLRYzu31afUIjnDQcJaEe7wVYGfnI7swhwcLa/p+mbVmwlA3bGinAE5F2K0Nw2"
        crossorigin="anonymous"
        data-whatsapp-phone="5511999999999"></script>
```

## 🎨 Configuration Options

### Via Data Attributes
```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"
        data-whatsapp-message="Hello!"
        data-whatsapp-position="bottom-right"
        data-whatsapp-tooltip="Chat with us"
        data-whatsapp-color="#25D366"
        data-whatsapp-size="60"></script>
```

### Via URL Parameters
```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js?phone=5511999999999&message=Hello&position=bottom-right"></script>
```

## ⚙️ Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `phone` | string | *required* | WhatsApp number with country code (e.g., 5511999999999) |
| `message` | string | empty | Pre-filled message text |
| `position` | string | bottom-right | Button position: bottom-left, bottom-right, top-left, top-right |
| `tooltip` | string | empty | Tooltip text on hover |
| `color` | string | #25D366 | Button background color (hex) |
| `size` | number | 60 | Button size in pixels |

## 📋 Message Placeholders

Use these placeholders in your message - they'll be replaced automatically:

| Placeholder | Replaced With |
|------------|---------------|
| `{url}` | Current page URL |
| `{title}` | Current page title |
| `{domain}` | Current domain name |
| `{path}` | Current URL path |

### Example with Placeholders
```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"
        data-whatsapp-message="Hi! I'm contacting from {url} about {title}"></script>
```

## 🌍 Performance

- **Global CDN**: Served from 100+ edge locations worldwide
- **Minified**: Only 5.4KB (gzipped: ~2KB)
- **No dependencies**: Pure JavaScript, no jQuery required
- **Cached**: 1-year cache headers for versioned files
- **Fast**: <50ms load time from CDN

## 🔧 Development

### Building Locally

1. Clone this repository:
```bash
git clone https://github.com/plazatechnologies/whatsapp-widget.git
cd whatsapp-widget
```

2. Install dependencies:
```bash
npm install
```

3. Build the widget:
```bash
npm run build
# or
./build.sh
```

### NPM Scripts

- `npm run build` - Build production files
- `npm run clean` - Clean dist directory
- `npm run minify` - Minify JavaScript
- `npm test` - Run tests
- `npm run deploy` - Build and push to GitHub

### File Structure
```
whatsapp-widget/
├── src/
│   └── whatsapp-widget.js      # Source code
├── dist/
│   ├── whatsapp-widget.js      # Original
│   ├── whatsapp-widget.min.js  # Minified (CDN)
│   ├── whatsapp-widget.min.js.map  # Source map
│   └── whatsapp-widget.min.js.sri  # SRI hash
├── package.json
├── build.sh                     # Build script
└── README.md                    # This file
```

## 🚢 Deployment Process

### 1. Make Changes
Edit `src/whatsapp-widget.js` with your changes.

### 2. Build
```bash
npm run build
```

### 3. Test Locally
Open `test.html` in your browser to test the widget.

### 4. Commit & Tag
```bash
git add -A
git commit -m "Your change description"
git tag v1.0.1
```

### 5. Push to GitHub
```bash
git push origin main
git push origin v1.0.1
```

### 6. CDN Auto-updates
jsDelivr automatically picks up the new version within minutes.

## 📊 Version Management

### Semantic Versioning
We follow semantic versioning (MAJOR.MINOR.PATCH):

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Version Pinning Strategy

**For production sites:**
```html
<!-- Pin to major version (recommended) -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"></script>
```

**For testing:**
```html
<!-- Use latest -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@latest/dist/whatsapp-widget.min.js"></script>
```

## 🔒 Security

### Subresource Integrity (SRI)
For maximum security, use SRI to ensure file integrity:

```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1.0.0/dist/whatsapp-widget.min.js"
        integrity="sha384-[HASH]"
        crossorigin="anonymous"></script>
```

Find the current SRI hash in `dist/whatsapp-widget.min.js.sri` after building.

### Content Security Policy (CSP)
If using CSP, add these directives:

```
script-src 'self' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline';
connect-src https://wa.me;
```

## 🌐 Platform Integration Examples

### WordPress
Add to your theme's `footer.php`:
```php
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

  return () => {
    document.body.removeChild(script);
  };
}, []);
```

### Google Tag Manager
Create a Custom HTML tag:
```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
        data-whatsapp-phone="5511999999999"></script>
```

## 📈 Analytics

The widget doesn't collect any analytics data. To track clicks, use your own analytics:

```javascript
// Listen for WhatsApp button clicks
document.addEventListener('click', function(e) {
  if (e.target.closest('#whatsapp-widget-button')) {
    // Your analytics code here
    gtag('event', 'click', {
      'event_category': 'WhatsApp',
      'event_label': 'Widget Button'
    });
  }
});
```

## 🆘 Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify phone number format (country code + number, no spaces/dashes)
3. Ensure script tag is in the HTML body
4. Check for conflicting z-index styles

### Testing Locally

Create a test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp Widget Test</title>
</head>
<body>
  <h1>Testing WhatsApp Widget</h1>

  <script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js"
          data-whatsapp-phone="5511999999999"
          data-whatsapp-message="Test message"></script>
</body>
</html>
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues or questions:
- Open an issue on GitHub
- Contact support@plazatechnologies.com
- WhatsApp: +55 11 99999-9999

## 🔄 Migration from Old Version

If you're currently using the old Rails-served version:

### Old (Rails-served):
```html
<script src="https://yourdomain.com/whatsapp-widget.js?phone=5511999999999"></script>
```

### New (CDN):
```html
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js?phone=5511999999999"></script>
```

The new version is 100% backward compatible - just update the URL!