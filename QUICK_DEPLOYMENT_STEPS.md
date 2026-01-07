# ⚡ Quick Deployment Checklist

**Read this before deploying**

---

## Prerequisites ✅

Make sure you have:
- [ ] GitHub account (github.com)
- [ ] Vercel account (vercel.com) - free tier
- [ ] OpenAI API key (platform.openai.com)
- [ ] PostgreSQL database URL
- [ ] Redis host details

---

## Deployment in 10 Minutes

### Step 1: Push to GitHub (3 min)

```powershell
cd c:\Users\chand\sentinel

# If not done already
git init
git add .
git commit -m "feat: Initial commit - Sentinel financial intelligence engine"

# Go to github.com → New Repository → Name: "sentinel"
# Copy the push URL

git remote add origin https://github.com/YOUR-USERNAME/sentinel.git
git branch -M main
git push -u origin main
```

✅ **Your code is on GitHub**

---

### Step 2: Create Vercel Account (2 min)

1. Go to **vercel.com**
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Authorize GitHub access
5. You're in Vercel!

---

### Step 3: Deploy to Vercel (5 min)

1. Click **"Add New"** → **"Project"**
2. Select your **"sentinel"** repository
3. Click **"Import"**
4. You see **"Environment Variables"** page

#### Add These Variables:

```
DATABASE_URL = postgresql://user:pass@host:5432/sentinel_db
OPENAI_API_KEY = sk-proj-YOUR-KEY-HERE
REDIS_HOST = localhost (or your Redis host)
REDIS_PORT = 6379
NEXT_PUBLIC_APP_URL = (Vercel will show this)
NODE_ENV = production
```

5. Click **"Deploy"**
6. Wait 2-3 minutes
7. **Done!** 🎉 Your app is live!

---

## Testing Your Deployed App

Once Vercel shows "Deployment Complete", test it:

```powershell
# Replace with your actual Vercel URL
$APP_URL = "https://sentinel-asdf123.vercel.app"

# Test the app loads
curl $APP_URL

# Test creating a transaction
curl -X POST "$APP_URL/api/transactions" `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user",
    "description": "Coffee at Starbucks",
    "amount": 5.50
  }'

# If you get back transaction data → Success! ✅
```

---

## What's Happening Behind Scenes

1. **Code on GitHub** - Your source code
2. **Vercel Watches GitHub** - Automatically detects changes
3. **Vercel Builds** - Runs `npm run build`
4. **Vercel Deploys** - Uploads to servers
5. **Your App Lives** - On the internet!

**Every time you push to main, Vercel auto-deploys!**

---

## Common Issues & Fixes

### Issue: "DATABASE_URL not found"
**Solution**: You forgot to add environment variable
- Go to Vercel Project Settings → Environment Variables
- Add DATABASE_URL

### Issue: "OpenAI API error"
**Solution**: Check your API key
- Make sure you copied the key correctly
- Key should start with `sk-proj-`

### Issue: "Can't connect to Redis"
**Solution**: Check Redis is accessible
- Make sure Redis URL is correct
- If using local Redis, won't work on Vercel (use managed Redis)

### Issue: "Build failed"
**Solution**: Run locally first
```powershell
npm run build  # See the error locally
npm run lint   # Fix any errors
git push       # Try again
```

---

## Optional: Add .env.example

Create a template file for team members:

Create file `.env.example`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/sentinel
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
REDIS_HOST=localhost
REDIS_PORT=6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

Then commit:
```powershell
git add .env.example
git commit -m "docs: Add environment variable template"
git push
```

---

## Success Indicators ✅

Your deployment is successful if:

- [ ] Vercel shows "Deployment Complete"
- [ ] You have a URL like `https://sentinel-xyz.vercel.app`
- [ ] `curl https://your-url/api/transactions` returns data
- [ ] Creating a transaction works (POST request)
- [ ] Getting transactions works (GET request)

---

## Next: Tell Recruiters About It

Add to your resume:

```
Sentinel Financial Intelligence Engine
- Built with Next.js 16, TypeScript, PostgreSQL, Redis
- Deployed on Vercel (auto-deploys on git push)
- Integrated OpenAI API for automatic categorization
- 6 RESTful endpoints, 4 database models
- Service-Repository architecture pattern
```

Link: `https://github.com/your-username/sentinel`

---

## You're Done! 🎉

Your app is now:
- ✅ On GitHub
- ✅ Deployed to production
- ✅ Accessible on the internet
- ✅ Auto-deploys on code changes
- ✅ Ready for recruiters to see

**Share the GitHub link or deployed URL with recruiters!**
