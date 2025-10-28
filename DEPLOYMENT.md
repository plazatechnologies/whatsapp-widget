# WhatsApp Widget CDN Deployment Guide

## 📋 Prerequisites

1. **GitHub Account**: Create repository at `github.com/plazatechnologies/whatsapp-widget`
2. **Node.js**: Version 14+ for build tools
3. **Git**: For version control

## 🚀 Initial Setup (One-time)

### Step 1: Create GitHub Repository

```bash
# Create new repo on GitHub (via web or CLI)
gh repo create plazatechnologies/whatsapp-widget --public --description "WhatsApp Widget for customer websites"

# Clone locally
git clone https://github.com/plazatechnologies/whatsapp-widget.git
cd whatsapp-widget
```

### Step 2: Copy CDN Files

```bash
# Copy the prepared files from plaza4/whatsapp-widget-cdn
cp -r /path/to/plaza4/whatsapp-widget-cdn/* .

# Install dependencies
npm install

# Run initial build
npm run build
```

### Step 3: Initial Commit & Push

```bash
# Add all files
git add -A

# Commit
git commit -m "Initial WhatsApp widget CDN setup

- Added source widget code
- Configured build pipeline with Terser
- Added comprehensive documentation
- Set up jsDelivr CDN deployment"

# Push to GitHub
git push origin main

# Create initial version tag
git tag v1.0.0 -m "Initial release"
git push origin v1.0.0
```

### Step 4: Verify CDN Availability

After pushing, the widget will be available at:
- Latest: `https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@latest/dist/whatsapp-widget.min.js`
- Version 1: `https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1/dist/whatsapp-widget.min.js`
- Specific: `https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1.0.0/dist/whatsapp-widget.min.js`

**Note**: jsDelivr may take 10-15 minutes to cache the first version.

## 📝 Regular Deployment Process

### Making Changes

1. **Edit Source Code**
```bash
# Make your changes
vim src/whatsapp-widget.js
```

2. **Test Locally**
```bash
# Build the widget
npm run build

# Open test file in browser
open test/index.html
```

3. **Update Version** (following semantic versioning)
```bash
# For bug fixes (1.0.0 → 1.0.1)
npm version patch

# For new features (1.0.0 → 1.1.0)
npm version minor

# For breaking changes (1.0.0 → 2.0.0)
npm version major
```

4. **Build & Commit**
```bash
# Build production files
npm run build

# Commit changes
git add -A
git commit -m "Your change description"
```

5. **Deploy to CDN**
```bash
# Push to GitHub
git push origin main

# Push tags
git push --tags
```

## 🔄 Version Management Strategy

### Semantic Versioning Rules

| Change Type | Version Bump | Example | When to Use |
|------------|--------------|---------|-------------|
| Patch | x.x.X | 1.0.0 → 1.0.1 | Bug fixes, typos |
| Minor | x.X.x | 1.0.0 → 1.1.0 | New features, backward compatible |
| Major | X.x.x | 1.0.0 → 2.0.0 | Breaking changes |

### Customer Communication

When releasing new versions:

#### For Patch Releases (Bug Fixes)
- No customer action needed
- Auto-updates for `@1` and `@latest` users
- No announcement necessary

#### For Minor Releases (New Features)
- Send email about new features
- Update documentation
- Example message:
```
New WhatsApp Widget Features (v1.1.0)
- Added animation options
- Improved mobile experience
- Fixed tooltip display bug

No action required - your widget will auto-update.
```

#### For Major Releases (Breaking Changes)
- Advance notice required (2 weeks)
- Migration guide needed
- Keep old major version working
- Example message:
```
Important: WhatsApp Widget v2.0 Coming
- New configuration format
- Improved performance
- Migration guide: [link]

Current v1.x widgets will continue working.
To upgrade: change @1 to @2 in your script URL.
```

## 🔐 Security Considerations

### SRI Hash Generation

After each build, provide SRI hash for security-conscious users:

```bash
# Generate SRI hash
openssl dgst -sha384 -binary dist/whatsapp-widget.min.js | openssl base64 -A

# Customer usage:
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1.0.0/dist/whatsapp-widget.min.js"
        integrity="sha384-[HASH]"
        crossorigin="anonymous"></script>
```

### Security Checklist

- [ ] No sensitive data in code
- [ ] No API keys or secrets
- [ ] Validate all user inputs
- [ ] Escape HTML in messages
- [ ] Test XSS prevention

## 🚨 Rollback Procedure

If a release has issues:

### Option 1: Quick Fix (Recommended)
```bash
# Fix the issue
vim src/whatsapp-widget.js

# Bump patch version
npm version patch

# Build and deploy
npm run build
git add -A
git commit -m "Fix: [description]"
git push origin main --tags
```

### Option 2: Git Revert
```bash
# Revert the problematic commit
git revert HEAD

# Bump version
npm version patch

# Push
git push origin main --tags
```

### Option 3: Direct CDN Pin (Customer Side)
Customers can pin to previous version:
```html
<!-- Pin to specific working version -->
<script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1.0.0/dist/whatsapp-widget.min.js"></script>
```

## 📊 Monitoring & Analytics

### CDN Statistics

Monitor usage at: https://www.jsdelivr.com/package/gh/plazatechnologies/whatsapp-widget

Metrics available:
- Daily/Monthly hits
- Bandwidth usage
- Geographic distribution
- Version adoption

### Customer Feedback Loop

1. **Feedback Channel**: Create GitHub Issues template
2. **Testing Group**: Maintain list of beta testers
3. **Rollout Strategy**:
   - Deploy to `@latest` first
   - Monitor for 24 hours
   - Tag stable version

## 🔧 Troubleshooting

### CDN Not Updating

```bash
# Force CDN refresh (takes ~10 minutes)
curl -X POST https://purge.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@latest/dist/whatsapp-widget.min.js

# Check specific version
curl -I https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@1.0.0/dist/whatsapp-widget.min.js
```

### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify terser installation
npx terser --version
```

### Testing CDN Locally

```html
<!DOCTYPE html>
<html>
<head>
  <title>CDN Test</title>
</head>
<body>
  <h1>Testing CDN Widget</h1>

  <!-- Test with CDN URL -->
  <script src="https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@latest/dist/whatsapp-widget.min.js"
          data-whatsapp-phone="5511999999999"></script>
</body>
</html>
```

## 📝 Deployment Checklist

Before each deployment:

- [ ] Tests pass locally
- [ ] Version number updated in package.json
- [ ] Build completes without errors
- [ ] File size is reasonable (<10KB minified)
- [ ] Test in multiple browsers
- [ ] Documentation updated if needed
- [ ] Migration guide for breaking changes
- [ ] SRI hash generated for security

## 🚀 CI/CD Automation (Optional)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to CDN

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node
      uses: actions/setup-node@v2
      with:
        node-version: '16'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Generate SRI
      run: |
        echo "SRI_HASH=$(openssl dgst -sha384 -binary dist/whatsapp-widget.min.js | openssl base64 -A)" >> $GITHUB_ENV

    - name: Update README with SRI
      run: |
        sed -i "s/integrity=\"sha384-.*\"/integrity=\"sha384-${{ env.SRI_HASH }}\"/" README.md

    - name: Commit built files
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add dist/ README.md
        git commit -m "Build: ${{ github.ref }}" || echo "No changes to commit"
        git push origin HEAD:main
```

## 📚 Additional Resources

- **jsDelivr Docs**: https://www.jsdelivr.com/documentation
- **Semantic Versioning**: https://semver.org/
- **SRI Generator**: https://www.srihash.org/
- **Terser Options**: https://terser.org/docs/api-reference

## 🤝 Support

For deployment issues:
1. Check GitHub Actions logs
2. Verify CDN purge status
3. Open issue at github.com/plazatechnologies/whatsapp-widget/issues
4. Contact: devops@plazatechnologies.com

---

**Last Updated**: October 2024
**Maintained by**: Plaza Team