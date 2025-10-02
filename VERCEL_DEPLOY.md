# 🚀 Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RiosenBeq/NASA)

## Manual Deployment Steps

### 1. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 2. Configure Settings

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `ui` (IMPORTANT!)

**Build Command:** 
```bash
npm run build
```

**Output Directory:** 
```
.next
```

**Install Command:**
```bash
npm install
```

### 3. Environment Variables

Add the following environment variable in Vercel Dashboard:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**How to add:**
1. Go to Project Settings
2. Click "Environment Variables"
3. Add `OPENAI_API_KEY`
4. Set value to your OpenAI API key
5. Select all environments (Production, Preview, Development)
6. Click "Save"

### 4. Deploy

Click "Deploy" button and wait for the build to complete.

## Project Structure

```
NASA/
├── ui/                    # Next.js application (Deploy this!)
│   ├── src/
│   │   ├── app/          # App router pages
│   │   │   ├── api/      # API routes
│   │   │   ├── analytics/
│   │   │   ├── guidelines/
│   │   │   ├── resources/
│   │   │   └── scientist/
│   │   └── components/   # React components
│   ├── public/           # Static assets
│   │   └── kg_data/      # Knowledge Graph data
│   ├── package.json
│   └── next.config.ts
├── vercel.json           # Vercel configuration
└── .vercelignore         # Files to ignore
```

## Build Configuration

### Node Version
- **Required:** Node.js >= 18.18.0
- **NPM:** >= 9.0.0

Vercel automatically uses Node.js 20.x

### Next.js Version
- **Version:** 15.5.3
- **Features:** Turbopack, App Router, Server Components

## Troubleshooting

### Build Fails

1. **Check Node version:**
   - Vercel uses Node 20.x by default
   - Our package.json requires >= 18.18.0

2. **Check environment variables:**
   - OPENAI_API_KEY must be set
   - Variable must be saved in all environments

3. **Check root directory:**
   - Must be set to `ui` in Vercel settings
   - Not the repository root

### API Routes Not Working

1. **Check OPENAI_API_KEY:**
   ```bash
   echo $OPENAI_API_KEY  # Should not be empty
   ```

2. **Check deployment logs:**
   - Go to Vercel Dashboard
   - Click on your deployment
   - Check "Functions" tab for errors

3. **Check runtime logs:**
   - Real-time logs available in Vercel Dashboard
   - Look for API errors

### Images Not Loading

1. **Check next.config.ts:**
   - Remote patterns are configured
   - AVIF/WebP formats enabled

2. **Check public folder:**
   - logo.png exists
   - kg_data/ folder with JSON files

## Performance

### Expected Metrics

- **Build Time:** ~2-3 minutes
- **Bundle Size:** ~126KB (main page)
- **First Load JS:** ~118KB (shared)
- **Static Pages:** 7 pages
- **API Routes:** 7 routes

### Optimizations

✅ Turbopack enabled (faster builds)  
✅ Image optimization (AVIF/WebP)  
✅ Compression enabled  
✅ Static generation where possible  
✅ Standalone output mode  

## Post-Deployment

### 1. Test Deployment

Visit your Vercel URL and test:
- ✅ Home page loads
- ✅ Search works
- ✅ AI Summarization works (needs API key)
- ✅ Analytics page loads
- ✅ Knowledge Graph visualizes
- ✅ All navigation links work

### 2. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS (Vercel provides instructions)
4. Wait for SSL certificate provisioning

### 3. Environment Management

**Production:**
- Used for main deployment
- www.your-domain.com

**Preview:**
- Automatic for each PR
- preview-branch.vercel.app

**Development:**
- For local testing
- Uses .env.local

## Support

### Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Turbopack](https://turbo.build/pack/docs)

### Common Issues

**Issue:** "Cannot find module 'next'"  
**Solution:** Delete node_modules, run `npm install`

**Issue:** "OpenAI API error"  
**Solution:** Check OPENAI_API_KEY is set correctly

**Issue:** "404 on pages"  
**Solution:** Check root directory is set to `ui`

## Success Checklist

Before marking deployment as complete:

- [ ] Project imported to Vercel
- [ ] Root directory set to `ui`
- [ ] OPENAI_API_KEY added to environment variables
- [ ] Build succeeds (green checkmark)
- [ ] Deployment URL works
- [ ] Search functionality works
- [ ] AI features work (summarize, Q&A)
- [ ] All pages load correctly
- [ ] Knowledge Graph renders
- [ ] No console errors in browser

---

**🌌 Ready to Deploy!**

Your NASA Space Bioscience Explorer is now ready for the world! 🚀

