# Opensea MCP Chatbot

> Chatbot to query NFT and Token data using Opensea MCP

## Tech Stack

- **Frontend:** Next.js 15.5+, React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui (New York style)
- **Authentication:** Supabase Auth (Email + Google OAuth)
- **Database:** Supabase PostgreSQL with RLS
- **Deployment:** Vercel
- **AI:** OpenAI, Anthropic Claude
- **MCP:** OpenSea MCP integration

## Project Structure

```
osmcpbot/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/ # React components
│   │   └── lib/       # Utilities & Supabase clients
├── supabase/          # Database migrations
│   └── migrations/
└── setup/             # Setup files (gitignored)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel account
- API keys: Anthropic, OpenAI

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/web3at50/osmcpchatbot.git
   cd osmcpbot
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials and API keys

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

Link to your Supabase project:
```bash
supabase link --project-ref srremctvztxsjsmjytcb
```

Push migrations:
```bash
supabase db push
```

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import repository in Vercel
3. Set root directory to `frontend/`
4. Add environment variables
5. Deploy!

## Features

- ✅ Email authentication (local development)
- ✅ Google OAuth (production)
- ✅ User profiles with RLS
- ✅ Monochrome design system
- ✅ Responsive layout
- 🚧 OpenSea MCP integration (coming soon)

## License

MIT
