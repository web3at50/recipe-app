
# Frontend (Next.js) – Standard Project Layout

This README defines our **canonical Next.js (App Router) setup**. Every new project should place the Next.js app in a folder called **`frontend/`** and follow this structure and conventions. It keeps our codebases consistent for both humans and AI tooling.

---

## 1) Directory Layout (Authoritative)

```
frontend/
├── .next/                  # Build directory (auto-generated)
├── node_modules/           # Project dependencies (auto-generated)
├── public/                 # Static assets like images, fonts, svgs
│   └── favicon.ico
├── src/                    # Main source code directory
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API route handlers (Edge/Node)
│   │   ├── (auth)/         # Route group for authentication pages (e.g., /signin)
│   │   │   └── signin/
│   │   │       └── page.tsx
│   │   └── (main)/         # Route group for primary application pages
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── layout.tsx  # Layout specific to the (main) group
│   │       └── page.tsx    # Home page
│   ├── globals.css         # Global styles (Tailwind + shadcn tokens)
│   ├── components/         # Shared, reusable UI components
│   │   └── ui/             # shadcn/ui generated components (buttons, cards, etc.)
│   ├── lib/                # Utility functions, API clients, helper scripts
│   │   ├── supabase.ts     # Supabase client initialization (if used)
│   │   └── utils.ts        # General utilities (includes `cn` for shadcn)
│   └── types/              # TypeScript types
│       └── index.ts
├── components.json         # shadcn configuration (CLI writes this)
├── next.config.mjs         # Next.js configuration
├── package-lock.json       # Locked dependency versions
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS (Tailwind)
├── tailwind.config.ts      # Tailwind config (with shadcn settings)
└── tsconfig.json           # TypeScript config (with alias to "@/")
```

> **Notes**
> - We always place the Next.js app at the **repository root `frontend/`** (not `app/`, not `web/`).
> - We use the **App Router** (`src/app`) and **TypeScript** by default.
