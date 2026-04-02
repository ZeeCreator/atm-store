# Vercel Deployment Guide - ATM Autolighting Madiun

## 🚀 Deploy to Vercel

### **Option 1: Deploy with Vercel CLI (Recommended)**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### **Option 2: Deploy from GitHub**

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js
6. Click "Deploy"

---

## ⚙️ Vercel Configuration

### **Auto-Detected Settings:**
- ✅ **Framework:** Next.js 15
- ✅ **Build Command:** `npm run build`
- ✅ **Install Command:** `npm install`
- ✅ **Output Directory:** `.next`
- ✅ **Node.js Version:** 18.x (auto-detected)

### **Region:**
- 🌏 **Singapore (sin1)** - Closest to Indonesia for best performance

---

## 🔐 Environment Variables (Optional)

If you want to use environment variables instead of Firebase:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note:** Current setup uses Firebase SDK directly, so no environment variables needed.

---

## 📊 Vercel Features Enabled

### **✅ Automatic Optimizations:**
- Image Optimization (Next.js Image)
- Static Site Generation (SSG)
- Server-Side Rendering (SSR)
- API Routes
- Edge Functions (if needed)

### **✅ Headers Configured:**
- Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- Cache-Control for static assets
- Proper Content-Type for sitemap.xml & robots.txt

### **✅ Caching Strategy:**
- Static assets: 1 year (immutable)
- Sitemap: 1 hour
- Robots.txt: 24 hours

---

## 🔗 Custom Domain Setup

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your domain (e.g., `atmautolighting.com`)
5. Update DNS records:
   - **Type:** A Record
   - **Name:** @
   - **Value:** `76.76.21.21`
   - **TTL:** Auto

For subdomain (e.g., `www`):
   - **Type:** CNAME
   - **Name:** www
   - **Value:** `cname.vercel-dns.com`

---

## 📈 Monitoring & Analytics

### **Vercel Analytics:**
1. Go to project dashboard
2. Click "Analytics" tab
3. Enable Vercel Analytics
4. Add to your site (optional, already have Google Analytics)

### **Vercel Speed Insights:**
1. Go to project dashboard
2. Click "Speed Insights" tab
3. Enable for real-user monitoring

---

## 🔄 Automatic Deployments

### **Git Integration:**
- **Push to main branch** → Deploy to production
- **Push to other branches** → Deploy to preview URL
- **Pull Requests** → Automatic preview deployments

### **Deployment URLs:**
- **Production:** `https://your-domain.com`
- **Preview:** `https://git-branch-your-repo.vercel.app`

---

## 🛠️ Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>
```

---

## ⚠️ Important Notes

### **Build Process:**
- Vercel automatically runs `npm run build`
- Build output goes to `.next` folder
- Static pages are pre-rendered
- Dynamic routes are server-rendered

### **Serverless Functions:**
- API routes (`/sitemap.xml`, `/robots.txt`) run as serverless functions
- Cold start: ~100-300ms (acceptable for SEO endpoints)
- Timeout: 10 seconds (default)

### **Firebase Integration:**
- ✅ Works seamlessly on Vercel
- ✅ Real-time database connections maintained
- ✅ No additional configuration needed

---

## 🎯 Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify Firebase connection
- [ ] Check sitemap.xml is accessible
- [ ] Check robots.txt is accessible
- [ ] Submit sitemap to Google Search Console
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up custom domain (if needed)
- [ ] Configure environment variables (if needed)
- [ ] Test mobile responsiveness
- [ ] Test all animations work

---

## 🆘 Troubleshooting

### **Build Fails:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run lint
```

### **Firebase Connection Issues:**
- Ensure Firebase rules allow read access
- Check Firebase console for errors
- Verify Firebase config in code

### **404 on Dynamic Routes:**
- Dynamic routes (`/product/[id]`) are server-rendered
- First load may be slower (cold start)
- Subsequent visits are cached

---

## 📞 Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Ready to deploy!** 🚀

Run `vercel --prod` to deploy to production.
