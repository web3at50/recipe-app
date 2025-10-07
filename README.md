# 🚀 SaaS Baseline Template

> A production-ready Next.js + Supabase template for building modern SaaS applications

**Start your next project in 30 minutes with authentication, database, and deployment ready to go.**

---

## ✨ What's Included

This template provides a complete baseline for SaaS applications:

- ✅ **Next.js 15** with App Router + TypeScript
- ✅ **React 19** with Server Components
- ✅ **Tailwind CSS v4** with dark/light theme toggle (dark mode default)
- ✅ **Supabase** authentication (Email + Google OAuth)
- ✅ **PostgreSQL** database with Row Level Security (RLS)
- ✅ **User profiles** auto-created on signup
- ✅ **shadcn/ui** components (New York style, neutral palette)
- ✅ **Geist** fonts (Sans + Mono)
- ✅ **Vercel** deployment ready
- ✅ **Responsive** design (mobile + desktop)

---

## 🎯 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15.5.4, React 19.1.0 |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Authentication** | Supabase Auth (Email + OAuth) |
| **Database** | Supabase PostgreSQL + RLS |
| **Deployment** | Vercel |
| **Theme** | next-themes (dark/light toggle) |

---

## 🚀 Quick Start

### **Option 1: Use This Template (Recommended)**

1. Click the **"Use this template"** button at the top of this page
2. Create your new repository
3. Follow the complete setup guide: [TEMPLATE_USAGE_GUIDE.md](TEMPLATE_USAGE_GUIDE.md)

### **Option 2: Clone Directly**

```bash
# Clone this repository
git clone https://github.com/web3at50/SAAS-Template.git my-project
cd my-project

# Install dependencies
cd frontend
npm install

# Set up environment variables
# Create frontend/.env.local with your Supabase credentials

# Run development server
npm run dev
```

**Full setup instructions:** See [TEMPLATE_USAGE_GUIDE.md](TEMPLATE_USAGE_GUIDE.md)

---

## 📁 Project Structure

```
saas-template/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── (auth)/          # Auth pages (login, signup)
│   │   │   ├── auth/callback/   # OAuth callback
│   │   │   ├── layout.tsx       # Root layout with theme
│   │   │   ├── page.tsx         # Homepage
│   │   │   └── globals.css      # Theme colors
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── auth/            # Auth forms
│   │   │   ├── ThemeToggle.tsx  # Theme toggle button
│   │   │   └── theme-provider.tsx
│   │   ├── lib/
│   │   │   ├── supabase/        # Supabase clients
│   │   │   └── utils.ts
│   │   └── middleware.ts        # Auth middleware
│   ├── .env.local               # Environment variables (create this)
│   ├── package.json             # Dependencies
│   └── components.json          # shadcn config
├── supabase/
│   ├── migrations/
│   │   └── 001_create_profiles.sql  # Initial schema
│   └── config.toml
├── setup/                       # Setup guides (gitignored)
├── TEMPLATE_USAGE_GUIDE.md      # 📖 Complete setup instructions
└── README.md                    # This file
```

---

## 🎨 Features Out of the Box

### **Authentication**
- Email signup/login with verification
- Google OAuth (production)
- Password reset flow
- Protected routes with middleware
- Automatic profile creation

### **Database**
- User profiles table with RLS
- Multi-tenant ready
- Auto-create profile trigger
- Migration system ready

### **UI/UX**
- Dark/light theme toggle (dark default)
- Smooth theme transitions
- Monochrome professional design
- Responsive layout
- shadcn/ui components pre-configured

### **Developer Experience**
- TypeScript throughout
- ESLint configured
- Hot reload
- Vercel deployment ready
- Environment variable management

---

## 📚 Documentation

- **[TEMPLATE_USAGE_GUIDE.md](TEMPLATE_USAGE_GUIDE.md)** - Complete step-by-step setup guide
- **[setup/SAAS_BASELINE_SETUP_TEMPLATE.md](setup/SAAS_BASELINE_SETUP_TEMPLATE.md)** - Technical specifications

---

## 🛠️ Customization

After setup, customize for your specific app:

### **1. Update Branding**
- Edit `frontend/src/app/layout.tsx` - Change app name in header
- Edit `frontend/src/app/page.tsx` - Update welcome message and CTAs
- Replace this README with your project description

### **2. Add Database Tables**
```bash
# Create new migration
supabase migration new add_your_table

# Edit the SQL file in supabase/migrations/
# Push to database
supabase db push
```

### **3. Add Features**
- Create pages in `frontend/src/app/`
- Add components in `frontend/src/components/`
- Update navigation in `layout.tsx`

---

## 🔐 Environment Variables

Required variables (create `frontend/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key  # Optional
OPENAI_API_KEY=your_openai_key        # Optional
```

---

## 🚢 Deployment

### **Vercel (Recommended)**

1. Push to GitHub
2. Import repository in Vercel
3. Set **Root Directory** to `frontend/`
4. Add environment variables
5. Deploy!

**Detailed instructions:** [TEMPLATE_USAGE_GUIDE.md](TEMPLATE_USAGE_GUIDE.md#step-10-deploy-to-vercel)

---

## 📋 Prerequisites

- Node.js 18+
- Git
- Supabase account
- Vercel account (for deployment)
- GitHub account

---

## 🤝 Contributing

This is a personal template, but feel free to:
- Fork for your own use
- Suggest improvements via issues
- Share your projects built with this template

---

## 📝 License

MIT License - feel free to use for personal or commercial projects.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [next-themes](https://github.com/pacocoursey/next-themes)

---

**Ready to build? Start here:** [TEMPLATE_USAGE_GUIDE.md](TEMPLATE_USAGE_GUIDE.md)
