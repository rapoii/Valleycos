# 📚 SocPlay Technical Documentation

This document provides a deep dive into the technical architecture, project structure, and deployment processes for SocPlay (Website-Cosplay).

## 🏗️ Architecture Overview

SocPlay is a Single Page Application (SPA) built with the React ecosystem, leveraging Supabase for backend services.

-   **Frontend**: React 19 + TypeScript + Vite
-   **State Management**: React Context (`DataContext`)
-   **Routing**: React Router DOM (v7)
-   **Styling**: Tailwind CSS + Inline styles for specific Pixel Art effects
-   **Backend**: Supabase (PostgreSQL, Authentication, Storage)

## 📂 Project Structure

```bash
/
├── components/          # Reusable UI components
│   ├── ui/              # Primitive pixel components (buttons, cards)
│   └── Navbar.tsx       # Main navigation
├── contexts/            # Global state management
│   └── DataContext.tsx  # Auth state, user data, global settings
├── pages/               # Route components / Page views
│   ├── Home.tsx         # Landing page
│   ├── Gallery.tsx      # Cosplay photo browsing
│   ├── Profile.tsx      # User profile management
│   ├── GlobalChat.tsx   # Real-time chat interface
│   └── ...
├── services/            # API & external service integrations
│   └── api.ts           # Supabase wrapper functions
├── supabase/            # Database assets
│   ├── schema.sql       # Database table definitions & RLS
│   └── backfill_emails.sql
└── src/
    └── lib/             # Core library configurations
        └── supabaseClient.ts
```

## 💾 Database Schema (Supabase)

The application uses a relational PostgreSQL database hosted on Supabase.

### Core Tables

1.  **`profiles`**:
    *   `id` (uuid, PK): Links to `auth.users`
    *   `username` (text, unique)
    *   `avatar_url` (text)
    *   `bio` (text)
    *   `is_admin` (boolean)

2.  **`posts` (Cosplay Sets)**:
    *   `id` (uuid, PK)
    *   `user_id` (fk -> profiles.id)
    *   `title`, `description`, `image_url`
    *   `likes` (integer)

3.  **`comments`**:
    *   `id`, `post_id`, `user_id`, `text`

4.  **`chat_messages`** (Global Chat):
    *   `id`, `user_id`, `text`, `created_at`

### Security (RLS)

Row Level Security (RLS) is enabled on all tables to ensure:
*   Users can only edit their own profiles.
*   Admin features are restricted to users with `is_admin = true`.
*   Public data (posts, comments) is readable by everyone.

## 🔐 Authentication Flow

1.  **Sign Up**: Uses `supabase.auth.signUp()`. Creates an entry in `auth.users` AND a corresponding public profile in `public.profiles` (via Trigger or manual creation).
2.  **Sign In**: Uses `supabase.auth.signInWithPassword()`.
3.  **Session Persistence**: Handled automatically by Supabase client in `src/lib/supabaseClient.ts`.

## 🚀 Deployment Guide (Vercel)

This project is optimized for deployment on Vercel.

### 1. Push to GitHub
Ensure your code is pushed to the repository:
[https://github.com/rapoii/Website-Cosplay](https://github.com/rapoii/Website-Cosplay)

### 2. Import in Vercel
1.  Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the `Website-Cosplay` repository.

### 3. Configure Build Settings
Vite projects are typically detected automatically:
*   **Framework Preset**: Vite
*   **Root Directory**: `./` (default)
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`

### 4. Environment Variables
You **MUST** add the environment variables from your `.env.local` to Vercel:

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Public Anon Key |

### 5. Deploy
Click **Deploy**. Vercel will build your project and assign a public URL.

## 🎨 Customizing the Design

*   **Pixel Art Components**: Located in `components/ui/PixelComponents.tsx`. Modify `border-width` and `box-shadow` to change the pixel depth.
*   **Colors**: Defined in `tailwind.config.js` (if extended) or used as utility classes (e.g., `bg-indigo-600`).

---

*Documentation created for SocPlay / Website-Cosplay.*
