# BrewDash Deployment Plan - Progress Tracking

## Deployment Steps (GitHub Pages - Frontend Only):

**✅ Completed:**
1. Install GitHub CLI (`brew install gh`)
2. Plan created and approved

**⏳ Pending (User Action Required):**
1. Complete `gh auth login` (interactive: GitHub.com → HTTPS/browser login)
2. Create new repo: `gh repo create brew-dash --public --push --source=.` (overwrites current brew.git remote)

**To Complete After Auth:**
1. Commit & push: `git add . && git commit -m "Deploy: Prepare for GitHub Pages" && git push`
2. Create deployment branch: `git checkout -b blackboxai/deploy`
3. Move frontend: Copy `public/*` to root for Pages
4. Enable Pages: `gh pages --branch blackboxai/deploy`
5. Get link

**Note:** Backend (Node.js/MongoDB) cannot run on GitHub Pages. Use Render.com for full app (free tier):
- Fork repo → Connect to Render → Auto-deploy on push.

**Full Backend Deployment (Render):**
1. Push to GitHub brew-dash
2. render.com → New Web Service → GitHub repo
3. Env vars: MONGODB_URI, JWT_SECRET, etc.
4. Link: https://your-app.onrender.com

Live link coming after auth/push.

