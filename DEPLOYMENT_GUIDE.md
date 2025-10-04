# Deployment Guide - Opensea MCP Chatbot

## Overview
This guide will help you deploy your application to Vercel and complete the final setup steps.

---

## ✅ What's Already Done

- ✅ Next.js 15.5.4 application built and tested
- ✅ Tailwind v4 with monochrome design system configured
- ✅ Authentication system created (Email + Google OAuth)
- ✅ Supabase integration completed
- ✅ Database migration file created
- ✅ Code pushed to GitHub: https://github.com/web3at50/osmcpchatbot

---

## 🔧 Manual Steps Required

### Step 1: Push Database Migration to Supabase

You need to manually run these commands from the project root:

```bash
# If not already linked, link to your Supabase project
supabase link --project-ref srremctvztxsjsmjytcb

# Push the migration to create the profiles table
supabase db push
```

This will create:
- `profiles` table with RLS policies
- Auto-create trigger for new user signups
- Proper security policies for multi-tenancy

**Verify in Supabase Dashboard:**
- Go to Table Editor → profiles table should exist
- Go to Database → Functions → `handle_new_user()` should exist

---

### Step 2: Deploy to Vercel

#### 2.1 Import GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select repository: `web3at50/osmcpchatbot`
4. **Important:** Set Root Directory to `frontend/`

#### 2.2 Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:
- **Framework Preset:** Next.js
- **Root Directory:** `frontend/`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

#### 2.3 Add Environment Variables

Add these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://srremctvztxsjsmjytcb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycmVtY3R2enR4c2pzbWp5dGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1Nzc2MjYsImV4cCI6MjA3NTE1MzYyNn0.VQ8Jrc2B2UZwLbT0fSn1s73aNcS2gEpb6G3tJ-oHBco
ANTHROPIC_API_KEY=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
OPENAI_API_KEY=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
```

#### 2.4 Deploy

Click "Deploy" and wait for the build to complete (~2-3 minutes).

---

### Step 3: Update Supabase URLs for Production

Once deployed, you'll get a Vercel URL (e.g., `https://your-app.vercel.app`)

#### 3.1 Update Supabase Authentication URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/srremctvztxsjsmjytcb)
2. Navigate to: **Authentication → URL Configuration**
3. Update the following:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:** (Keep localhost for development)
```
http://localhost:3000/auth/callback
https://your-app.vercel.app/auth/callback
```

#### 3.2 Update Google OAuth Redirect URIs (if not already done)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `OS-MCP-Chatbot`
3. Navigate to: **APIs & Services → Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", ensure you have:
```
https://srremctvztxsjsmjytcb.supabase.co/auth/v1/callback
```

---

## 🧪 Testing Checklist

### Local Testing (Email Auth Only)

Run the dev server:
```bash
cd frontend
npm run dev
```

Test these flows:
- [ ] Navigate to http://localhost:3000
- [ ] Click "Sign Up" and create an account with email
- [ ] Check email for confirmation link
- [ ] Confirm email and sign in
- [ ] Verify you see the authenticated homepage
- [ ] Click user menu and sign out
- [ ] Sign in again with the same credentials

### Production Testing (Email + Google OAuth)

Once deployed to Vercel:
- [ ] Visit your Vercel URL
- [ ] Test email signup flow
- [ ] Test email login flow
- [ ] Test Google OAuth signup
- [ ] Test Google OAuth login
- [ ] Verify user menu shows correct email
- [ ] Test sign out
- [ ] Check Supabase Dashboard → Table Editor → profiles (users should appear)

---

## 🎯 Success Criteria

Your baseline is complete when:

### Frontend ✅
- [x] Next.js app running on `localhost:3000`
- [x] Tailwind v4 with monochrome colors applied
- [x] shadcn/ui components working
- [x] Responsive design (mobile + desktop)

### Authentication ✅
- [ ] Email signup works locally
- [ ] Email login works locally
- [ ] Google OAuth works in production
- [ ] Profile auto-created on signup
- [ ] User menu shows email and sign out

### Database ✅
- [ ] `profiles` table exists with RLS
- [ ] Trigger creates profile on signup
- [ ] Can view profiles in Supabase dashboard

### Deployment ✅
- [x] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production URL accessible
- [ ] No errors in browser console
- [ ] No errors in Supabase logs

### Homepage ✅
- [x] Unauthenticated: Welcome + 3 CTA cards + login/signup buttons
- [x] Authenticated: Welcome back + user menu + dashboard

---

## 🚀 Next Steps After Baseline

Once your baseline is deployed and working:

1. **Customize the Dashboard**
   - Build your chatbot interface
   - Integrate OpenSea MCP
   - Add custom features

2. **Add App-Specific Tables**
   - Create new migrations for your data models
   - Add RLS policies for security

3. **Enhance Features**
   - Add profile editing
   - Implement chat history storage
   - Add NFT/token search functionality

---

## 📝 Quick Commands Reference

### Local Development
```bash
cd frontend
npm run dev              # Start dev server
npm run build           # Test production build
npm run start           # Run production build locally
```

### Supabase
```bash
supabase link --project-ref srremctvztxsjsmjytcb
supabase db push        # Push migrations
supabase db reset       # Reset database (caution!)
supabase status         # Check status
```

### Git
```bash
git status
git add .
git commit -m "Your message"
git push
```

---

## 🆘 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify root directory is set to `frontend/`

### Authentication Not Working
- Check Supabase URL configuration
- Verify redirect URLs match your domain
- Check browser console for errors
- Ensure environment variables are correct

### Database Errors
- Verify migration was pushed successfully
- Check Supabase logs for errors
- Ensure RLS policies are active

### Google OAuth Not Working
- Verify OAuth credentials in Google Console
- Check redirect URI matches Supabase callback URL
- Ensure Google provider is enabled in Supabase

---

**Version:** 1.0.0
**Date:** 2025-10-04
**Stack:** Next.js 15.5.4, React 19.1.0, Tailwind v4.1.14, Supabase
