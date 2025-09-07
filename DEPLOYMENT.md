# 🚀 Deployment Guide

## Quick Deployment (Recommended)

### 1. Backend Deployment (Railway)

1. **Go to [Railway.app](https://railway.app/)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Add Environment Variables in Railway dashboard:**
   ```
   GEMINI_API_KEY=your_actual_api_key
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```
6. **Railway will automatically:**
   - Detect Node.js backend
   - Install dependencies
   - Create MySQL database
   - Set DB_HOST, DB_USER, DB_PASSWORD automatically
   - Deploy and give you a URL like: `https://your-app.railway.app`

### 2. Frontend Deployment (Vercel)

1. **Go to [Vercel.com](https://vercel.com/)**
2. **Sign up with GitHub**
3. **Click "New Project" → Import from GitHub**
4. **Select your repository**
5. **Set Root Directory to:** `ai-recipe-frontend`
6. **Add Environment Variable:**
   ```
   REACT_APP_BACKEND_URL=https://your-backend.railway.app
   ```
7. **Deploy** - Vercel gives you URL like: `https://your-app.vercel.app`

---

## Alternative: Free Hosting Options

### Backend Options:
- **Railway** (Recommended) - $5/month after free tier
- **Render** - Free tier available
- **Heroku** - No longer free
- **Railway** - Best for databases

### Frontend Options:
- **Vercel** (Recommended) - Free forever for personal projects
- **Netlify** - Free tier
- **GitHub Pages** - Free but static only

### Database Options:
- **Railway MySQL** - Included with backend deployment
- **PlanetScale** - Free tier available
- **Supabase** - Free PostgreSQL

---

## 📋 Pre-Deployment Checklist

### ✅ Code Preparation
- [x] Environment variables configured
- [x] README.md created
- [x] .env.example files created
- [x] Hardcoded URLs replaced with environment variables
- [ ] Add screenshots to README
- [ ] Test locally one more time

### ✅ GitHub Repository
- [ ] Push all code to GitHub
- [ ] Make repository public (for deployment)
- [ ] Add proper commit messages
- [ ] Ensure .env files are in .gitignore

---

## 🌐 Expected Result

After deployment, you'll have:

**Live Website**: `https://your-app.vercel.app`
**Backend API**: `https://your-backend.railway.app`
**GitHub Repo**: `https://github.com/rohan-khanna-15/ai-recipe-generator`

---

## 📝 For Resume/Interview

Update your resume entry with:
```
AI Recipe Generator | Website | Source Code
🌐 Live Demo: https://your-app.vercel.app
📝 Code: https://github.com/rohan-khanna-15/ai-recipe-generator
```

---

## 🚨 Important Notes

1. **API Keys**: Never commit real API keys to GitHub
2. **Database**: Railway will create a fresh database (your local data won't transfer)
3. **CORS**: Update backend CORS to allow your Vercel domain
4. **Environment**: Production environment variables are different from local

---

## 🛠️ Troubleshooting

### Common Issues:
1. **CORS Errors**: Update CORS origin in backend
2. **API Key Invalid**: Check environment variables in deployment dashboard
3. **Database Connection**: Ensure Railway database is connected
4. **Build Failures**: Check Node.js version compatibility

### Debug Steps:
1. Check deployment logs in Railway/Vercel dashboards
2. Test backend API endpoints directly
3. Verify environment variables are set correctly
4. Check browser console for frontend errors
