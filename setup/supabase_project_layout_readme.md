# Supabase Project Layout

We create the **Migrations**, **Functions**, and **Seed** directories on setup, even if they’re not immediately populated.  
`.gitkeep` files are included so the folders are always tracked in Git.  

```
supabase/
├── config.toml             # Main Supabase project configuration
├── migrations/             # Database schema migrations (SQL files)
│   └── .gitkeep            # Placeholder so folder exists in Git
├── functions/              # Serverless Edge Functions (Deno)
│   └── .gitkeep            # Placeholder so folder exists in Git
└── seed/                   # Optional seed data (dev/test/demo only)
    └── .gitkeep            # Placeholder so folder exists in Git
```

---

## 📂 Migrations
- Used to create database tables and schemas for **version control**.  
- Files should be numbered and dated in sequential order, e.g.:
  - `001_create_users_table_20250715.sql`  
  - `002_add_index_to_tokens_20250720.sql`  
- We **do not use a local Supabase environment**.  
- Migration files are pushed to the remote project using:
  ```bash
  supabase db push
  ```

---

## 📂 Functions
- Directory for **Supabase Edge Functions** (Deno).  
- Each function lives in its own folder and matches the HTTP path.  
- Deploy functions with something like this:
  ```bash
  supabase functions deploy EDGE-FUNCTION-NAME --project-ref MYPROJECTREF --no-verify-jwt
  ```

---

## 📂 Seed
- Usually **not needed**.  
- Only used to add **dummy/test data** for local or demo purposes.  
- If used, keep files small and clear:
  - `001_minimal_seed.sql`  
  - `002_test_accounts.sql`  

---

✅ This ensures every project starts with the same Supabase skeleton, whether or not all directories are used right away.
