# Deployment Guide: Hawaii SNAP Visualization Dashboard

Step-by-step guide to deploy the interactive visualization dashboard to Netlify.

## Quick Deployment (5 minutes)

### Option 1: Netlify Drag & Drop (Easiest)

1. **Generate the data**:
   ```bash
   python scripts/prepare_web_data.py
   ```

2. **Visit** [Netlify Drop](https://app.netlify.com/drop)

3. **Drag** the entire `web/` folder onto the page

4. **Done!** Your site is live with a random URL like `https://random-name-123.netlify.app`

5. **Optional**: Change site name in Netlify settings

---

### Option 2: Netlify CLI (Recommended for Updates)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy** (first time):
   ```bash
   # Generate data
   python scripts/prepare_web_data.py

   # Initialize and deploy
   netlify init
   netlify deploy --prod
   ```

4. **Update** (subsequent times):
   ```bash
   python scripts/prepare_web_data.py
   netlify deploy --prod
   ```

---

### Option 3: GitHub Integration (Recommended for Continuous Deployment)

#### Initial Setup

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add visualization dashboard"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize
   - Select your `Hawaii-SNAP` repository

3. **Configure Build Settings**:
   ```
   Build command: python scripts/prepare_web_data.py
   Publish directory: web
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy automatically

#### Automatic Updates

From now on, every push to GitHub will automatically:
1. Run `python scripts/prepare_web_data.py` to generate JSON
2. Deploy the `web/` directory
3. Update your live site

**Workflow**:
```bash
# Update CSV data files
# Then commit and push
git add Data/
git commit -m "Update data through May 2025"
git push

# Netlify automatically rebuilds and deploys
```

---

## Configuration Details

### netlify.toml

The `netlify.toml` file in the repository root configures:

```toml
[build]
  command = "python scripts/prepare_web_data.py"
  publish = "web"

[build.environment]
  PYTHON_VERSION = "3.9"
```

This ensures Netlify:
- Uses Python 3.9
- Runs the data preparation script
- Deploys the `web/` directory

### requirements.txt

Lists Python dependencies for the build:
- `pandas` - For data processing
- Other dependencies as needed

Netlify automatically installs these during build.

---

## Verification Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] All navigation tabs work
- [ ] Charts render properly
- [ ] Statistics populate correctly
- [ ] Mobile responsive design works
- [ ] No console errors
- [ ] Data loads from JSON files

### Test URLs

Test these pages:
- `/` - Main dashboard
- Each tab should work (Overview, Trends, Benefits, COVID, Counties, Insights)

---

## Custom Domain (Optional)

### Add Your Own Domain

1. **In Netlify Dashboard**:
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `hawaii-snap-data.org`)

2. **Configure DNS**:
   - Add Netlify's nameservers to your domain registrar
   - Or add CNAME/A records as instructed

3. **Enable HTTPS**:
   - Netlify provides free SSL via Let's Encrypt
   - Automatically enabled for custom domains

---

## Updating the Site

### When CSV Data is Updated

```bash
# 1. Update CSV files in Data/ directory
# 2. Regenerate JSON
python scripts/prepare_web_data.py

# 3. Redeploy
# - GitHub Integration: just push
# - CLI: netlify deploy --prod
# - Drag & Drop: drag web/ folder again
```

### When Making Code Changes

```bash
# 1. Edit HTML/CSS/JS files in web/
# 2. Test locally
cd web
python -m http.server 8000

# 3. Deploy
# Same as above - push to GitHub or use CLI
```

---

## Troubleshooting

### Build Fails

**Problem**: "Command failed: python scripts/prepare_web_data.py"

**Solutions**:
1. Check Python version in `runtime.txt` (should be 3.9)
2. Verify `requirements.txt` includes `pandas`
3. Check build log for specific errors
4. Test locally: `python scripts/prepare_web_data.py`

### Data Not Loading

**Problem**: Charts show "Loading..." forever

**Solutions**:
1. Check browser console for errors
2. Verify JSON files exist in `web/data/`
3. Check file paths are correct
4. Ensure CORS headers are set (Netlify handles this)

### Charts Not Rendering

**Problem**: Blank spaces where charts should be

**Solutions**:
1. Check Chart.js CDN is accessible
2. Verify JavaScript has no errors (console)
3. Ensure data is in correct format
4. Test with sample data

### Mobile Display Issues

**Problem**: Layout broken on mobile

**Solutions**:
1. Check CSS media queries
2. Verify viewport meta tag in HTML
3. Test with browser dev tools mobile emulation

---

## Performance Optimization

### Already Implemented

✅ CDN for Chart.js library
✅ Minified JSON data
✅ Efficient chart rendering
✅ Lazy loading for tabs
✅ HTTP caching headers

### Future Improvements

- [ ] Compress JSON with gzip
- [ ] Add service worker for offline support
- [ ] Implement chart data decimation for large datasets
- [ ] Add loading skeletons for better perceived performance

---

## Monitoring

### Netlify Analytics (Optional, Paid)

Track:
- Page views
- Visitor locations
- Popular sections
- Performance metrics

### Google Analytics (Free)

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

---

## Security

### Implemented

✅ HTTPS enforced
✅ Security headers (X-Frame-Options, CSP, etc.)
✅ No sensitive data exposure
✅ Static site (no backend vulnerabilities)

### Headers in netlify.toml

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

---

## Cost

### Netlify Free Tier Includes:

- ✅ 100 GB bandwidth/month
- ✅ Unlimited sites
- ✅ HTTPS
- ✅ Continuous deployment
- ✅ Form handling (100 submissions/month)

**This dashboard uses ~200KB per page load**, so free tier supports:
- ~500,000 page views/month
- More than sufficient for most use cases

---

## Backup Strategy

### Regular Backups

1. **GitHub repository** is primary backup
2. **Netlify keeps** deployment history
3. **CSV source data** in repository

### Recovery

If site goes down:
1. Redeploy from GitHub
2. Or deploy from local copy
3. Or restore from Netlify deployment history

---

## Next Steps After Deployment

1. **Share the URL**:
   - Add to repository README
   - Share with stakeholders
   - Submit to Hawaii data portals

2. **Set up monitoring**:
   - Add analytics
   - Monitor performance
   - Track user engagement

3. **Plan updates**:
   - Schedule data refreshes
   - Add new visualizations
   - Incorporate feedback

4. **Documentation**:
   - Update README with live URL
   - Document any custom configurations
   - Create user guide if needed

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com
- **Chart.js Docs**: https://www.chartjs.org/docs
- **Repository Issues**: GitHub Issues for this project

---

## Quick Reference Commands

```bash
# Generate data
python scripts/prepare_web_data.py

# Test locally
cd web && python -m http.server 8000

# Deploy with CLI
netlify deploy --prod

# Check deployment status
netlify status

# View deployment logs
netlify logs

# Open site in browser
netlify open:site
```

---

**Ready to deploy?** Start with Option 1 (Drag & Drop) for quickest results!

**Questions?** Check the web/README.md or open an issue on GitHub.
