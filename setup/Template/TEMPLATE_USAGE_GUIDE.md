# 🚀 How to Use This Template for a New Project

> **Quick Guide:** Start a new SaaS project from this baseline in ~30 minutes

**What You Get:**
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS v4 with dark/light theme toggle
- Supabase authentication (Email + Google OAuth)
- User profiles with RLS
- Ready to deploy to Vercel

---

## 📋 Prerequisites (Before You Start)

Have these accounts ready:
- ✅ GitHub account
- ✅ Supabase account (supabase.com)
- ✅ Vercel account (vercel.com)
- ✅ Anthropic API key (if using Claude)
- ✅ OpenAI API key (if using GPT)
- ✅ Google Cloud account (for OAuth - we'll set this up later)

Have these installed on your computer:
- ✅ Git
- ✅ Node.js 18+ (check: `node --version`)
- ✅ npm (comes with Node.js)
- ✅ Supabase CLI (install: `npm install -g supabase`)

---

## 🎯 The Complete Process (10 Steps)

### **Step 1: Create GitHub Repository**

1. Go to GitHub and create a **new empty repository**
2. Name it (e.g., `recipe-app`)
3. Choose public or private
4. ❌ **Do NOT** add README, .gitignore, or license
5. Click "Create repository"
6. **Save the URL:** `https://github.com/yourusername/recipe-app`

---

### **Step 2: Create from Template**

1. Go to: `https://github.com/web3at50/SAAS-Template`
2. Click the green **"Use this template"** button
3. Select **"Create a new repository"**
4. Name it the same as Step 1 (e.g., `recipe-app`)
5. Choose public/private
6. Click "Create repository"

**What this does:** Copies all the baseline code to your new repo

---

### **Step 3: Clone to Your Computer**

**Open Command Prompt and run:**

```bash
# Navigate to your Documents folder
cd C:\Users\bryn\Documents

# Clone your new repository
git clone https://github.com/yourusername/recipe-app.git

# Go into the directory
cd recipe-app
```

**Replace:**
- `yourusername` with your GitHub username
- `recipe-app` with your project name

---

### **Step 4: Install Dependencies**

**In the same Command Prompt, run:**

```bash
# Go into the frontend folder
cd frontend

# Install all dependencies (Next.js, React, Tailwind, etc.)
npm install
```

**What this does:**
- Reads `package.json`
- Downloads Next.js, React, Tailwind CSS, Supabase, and all libraries
- Creates `node_modules/` folder
- Takes 2-3 minutes

**Expected output:**
```
added 234 packages, and audited 235 packages in 2m
```

---

### **Step 5: Create Supabase Project**

1. Go to: `https://supabase.com/dashboard`
2. Click "New Project"
3. Fill in:
   - **Name:** `recipe-app` (or your project name)
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free (to start)
4. Click "Create new project"
5. Wait 2-3 minutes for setup

**Save these values (you'll need them):**
- **Project URL:** `https://abcdefg.supabase.co`
- **Project Ref:** `abcdefg` (the part before `.supabase.co`)
- **Anon Key:** Go to Settings → API → Copy "anon public" key

---

### **Step 6: Configure Supabase Authentication**

**In your Supabase project dashboard:**

1. Go to: **Authentication → Providers**
2. **Enable Email provider:**
   - Click on "Email"
   - Toggle "Enable Email provider" ✅
   - Toggle "Confirm email" ✅ (recommended)
   - Click "Save"

3. Go to: **Authentication → URL Configuration**
4. **Set Site URL:** `http://localhost:3000`
5. **Add Redirect URLs:**
   ```
   http://localhost:3000/auth/callback
   ```
6. Click "Save"

**Note:** We'll add Google OAuth later (Step 9)

---

### **Step 7: Create Environment Variables File**

**In your local project, create `.env.local` file:**

**Option A: Using Command Prompt**
```bash
# Make sure you're in the frontend folder
cd C:\Users\bryn\Documents\recipe-app\frontend

# Create the file (copy-paste this entire block)
echo NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co > .env.local
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here >> .env.local
echo ANTHROPIC_API_KEY=your-anthropic-key-here >> .env.local
echo OPENAI_API_KEY=your-openai-key-here >> .env.local
```

**Option B: Using Notepad (Easier)**
1. Open Notepad
2. Copy-paste this template:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ANTHROPIC_API_KEY=your-anthropic-key-here
   OPENAI_API_KEY=your-openai-key-here
   ```
3. **Replace the values** with your actual keys
4. Save as: `C:\Users\bryn\Documents\recipe-app\frontend\.env.local`
   - **Important:** Set "Save as type" to "All Files" (not .txt)

**Checklist:**
- [ ] File is named `.env.local` (not `.env.local.txt`)
- [ ] File is in the `frontend/` folder
- [ ] All values are replaced with real keys (no placeholders)

---

### **Step 8: Link Supabase and Push Database**

**In Command Prompt (in your project root):**

```bash
# Go back to project root
cd C:\Users\bryn\Documents\recipe-app

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

**Replace `YOUR_PROJECT_REF`** with your actual ref from Step 5 (e.g., `abcdefg`)

**When prompted:**
- Enter your database password (from Step 5)

**Then push the database migrations:**

```bash
supabase db push
```

**What this does:**
- Creates the `profiles` table
- Sets up Row Level Security (RLS)
- Creates auto-profile trigger

**Expected output:**
```
Applying migration 001_create_profiles.sql...
Finished supabase db push.
```

---

### **Step 9: Test Locally**

**Start the development server:**

```bash
# Go to frontend folder
cd frontend

# Start Next.js
npm run dev
```

**Open your browser:**
- Go to: `http://localhost:3000`

**Test these features:**
- ✅ Homepage loads
- ✅ Theme toggle (sun/moon icon) switches dark/light mode
- ✅ Click "Sign Up"
- ✅ Create an account with email
- ✅ Check email for verification link
- ✅ Sign in
- ✅ See your profile/dashboard

**If everything works, continue to Step 10!**

**To stop the server:** Press `Ctrl + C` in Command Prompt

---

### **Step 10: Deploy to Vercel**

**Push to GitHub first:**

```bash
# Go to project root
cd C:\Users\bryn\Documents\recipe-app

# Add all files
git add .

# Commit
git commit -m "Initial setup from SAAS template"

# Push to GitHub
git push origin main
```

**Deploy to Vercel:**

1. Go to: `https://vercel.com/dashboard`
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`recipe-app`)
4. **Configure:**
   - **Root Directory:** `frontend/`
   - Click "Edit" next to Root Directory and select `frontend`
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these (copy from your `.env.local`):
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     ANTHROPIC_API_KEY
     OPENAI_API_KEY
     ```
6. Click "Deploy"
7. Wait 2-3 minutes

**When done:**
- Copy your production URL (e.g., `https://recipe-app.vercel.app`)

**Update Supabase URLs:**

1. Go to Supabase → Authentication → URL Configuration
2. **Update Site URL:** `https://recipe-app.vercel.app`
3. **Add Redirect URL:** `https://recipe-app.vercel.app/auth/callback`
4. Keep the localhost URLs too (for local dev)
5. Click "Save"

**Test production:**
- Go to your Vercel URL
- Sign up with email
- Verify email login works

---

## 🔐 Optional: Set Up Google OAuth (After Deployment)

**When to do this:** After Step 10, when your site is live

### **Google Cloud Console Setup:**

1. Go to: `https://console.cloud.google.com`
2. Create new project or select existing
3. **Enable APIs:**
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to: APIs & Services → OAuth consent screen
   - Choose "External"
   - Fill in:
     - App name: Your project name
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - **Scopes:** Skip (click "Save and Continue")
   - **Test users:** Add your email
   - Click "Save and Continue"

5. **Create OAuth Client:**
   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Your Project - Supabase Auth"
   - **Authorized JavaScript origins:**
     ```
     https://YOUR_PROJECT_REF.supabase.co
     ```
   - **Authorized redirect URIs:**
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
   - Click "Create"
   - **Save:** Client ID and Client Secret

### **Supabase Configuration:**

1. Go to: Supabase → Authentication → Providers
2. Find "Google" and click to expand
3. **Enable Google provider** ✅
4. **Paste:**
   - Client ID: (from Google Cloud)
   - Client Secret: (from Google Cloud)
5. Click "Save"

### **Test Google OAuth:**

1. Go to your production site
2. Click "Sign Up" or "Sign In"
3. Look for "Continue with Google" button
4. Test the flow

---

## 📝 Customizing Your New Project

After setup is complete, customize for your specific app:

### **Update Branding:**

**Edit `frontend/src/app/layout.tsx`:**
- Change app name in header
- Update page title and description

**Edit `frontend/src/app/page.tsx`:**
- Update welcome message
- Change CTA cards to match your app's purpose

**Edit `README.md`:**
- Replace with your project's description
- Update features list
- Add project-specific instructions

### **Add Your Features:**

1. **Database Tables:**
   - Create new migration: `supabase migration new add_recipes_table`
   - Edit the SQL file in `supabase/migrations/`
   - Push: `supabase db push`

2. **New Pages:**
   - Create in `frontend/src/app/` (e.g., `recipes/page.tsx`)
   - Add navigation links

3. **Components:**
   - Add to `frontend/src/components/`

---

## 🔄 How to Update the Baseline Template

**When you improve the baseline and want to save it back to the template:**

### **Scenario:** You added a better header component that you want in all future projects

**From your project directory (e.g., recipe-app):**

```bash
# Add the template remote (one-time setup)
cd C:\Users\bryn\Documents\recipe-app
git remote add template https://github.com/web3at50/SAAS-Template.git

# Create a new branch for baseline changes
git checkout -b update-baseline

# Make your improvements to baseline files
# (e.g., edit components, update styles, etc.)

# Commit the changes
git add .
git commit -m "Improve header component"

# Push to template repository
git push template update-baseline

# Go to GitHub and create a Pull Request to merge into template
```

**Alternative (simpler but replaces everything):**

If you want to copy your entire improved project back to the template:

```bash
# From osmcpbot (your original baseline project)
cd C:\Users\bryn\Documents\osmcpbot

# Make improvements
# Then push to template
git push template main
```

**Best Practice:**
- Keep osmcpbot as your "baseline development" project
- Test improvements there first
- Push to template when stable
- Use template for new projects

---

## 🐛 Troubleshooting

### **npm install fails**
- Make sure you're in the `frontend/` folder
- Check Node.js is installed: `node --version`
- Try: `npm cache clean --force` then `npm install` again

### **Can't find .env.local**
- File might be named `.env.local.txt`
- In Windows Explorer, enable "File name extensions"
- Rename to remove `.txt`

### **Supabase link fails**
- Check your project ref is correct
- Make sure Supabase CLI is installed: `supabase --version`
- Try: `npm install -g supabase` to reinstall

### **localhost:3000 shows error**
- Check `.env.local` has correct values
- Restart the dev server: `Ctrl+C` then `npm run dev`
- Check console for specific error messages

### **Can't sign up / Auth not working**
- Verify Supabase URL and Anon Key in `.env.local`
- Check Supabase → Authentication → Providers is enabled
- Check redirect URLs are set correctly
- Clear browser cache and try again

### **Vercel deployment fails**
- Check Root Directory is set to `frontend/`
- Verify all environment variables are added
- Check build logs for specific errors

### **Google OAuth not working**
- Make sure test users are added in Google Cloud Console
- Verify redirect URIs match exactly (check for trailing slashes)
- Check Client ID and Secret are correct in Supabase

---

## 📚 Quick Reference

### **Common Commands:**

```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Link Supabase project
supabase link --project-ref YOUR_REF

# Push database migrations
supabase db push

# Create new migration
supabase migration new your_migration_name

# Git workflow
git add .
git commit -m "Your message"
git push origin main
```

### **Important File Locations:**

```
recipe-app/
├── frontend/
│   ├── .env.local                    ← Environment variables
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            ← Main layout (header, theme)
│   │   │   ├── page.tsx              ← Homepage
│   │   │   └── globals.css           ← Theme colors
│   │   ├── components/
│   │   │   ├── ThemeToggle.tsx       ← Theme toggle button
│   │   │   └── ui/                   ← shadcn components
│   │   └── lib/
│   │       └── supabase/             ← Supabase clients
│   └── package.json                   ← Dependencies
└── supabase/
    └── migrations/                    ← Database migrations
```

### **Useful Links:**

- **Template Repository:** https://github.com/web3at50/SAAS-Template
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Vercel Docs:** https://vercel.com/docs

---

## ✅ Success Checklist

**Your project is ready when:**

- [ ] Repository created on GitHub
- [ ] Code cloned locally
- [ ] `npm install` completed
- [ ] Supabase project created
- [ ] Database migrated (`supabase db push`)
- [ ] `.env.local` configured with all keys
- [ ] Local dev server runs (`npm run dev`)
- [ ] Can sign up with email locally
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production signup/login works
- [ ] Theme toggle works (dark/light)
- [ ] (Optional) Google OAuth configured and working

---

**🎉 You're ready to build your app!**

For questions or issues, refer to:
- `setup/SAAS_BASELINE_SETUP_TEMPLATE.md` (detailed technical specs)
- This guide (step-by-step process)
