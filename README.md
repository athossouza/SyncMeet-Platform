# 🚀 SyncMeet (SessionOS)

**SyncMeet** is a premium, distraction-free mentorship session portal powered by AI. It bridges Google Calendar, YouTube, and Supabase to provide an automated content hub for mentors and mentees.

---

## 🛠️ Tech Stack

### Core
- **Frontend**: React 19, Vite 6, TypeScript 5.
- **Design System**: **Material UI v7 (MUI)**.
- **Backend & Auth**: Supabase (PostgreSQL, RLS, Edge Functions).
- **Runtime**: Node.js 20+ (for backend scripts and server).
- **Containerization**: Docker & Docker Compose.

### Key Libraries
- **UI Components**: `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`.
- **State/Fetching**: `@tanstack/react-query`.
- **Editor**: Tiptap (Rich Text).
- **Dates**: `date-fns` v4.
- **API integrations**: `googleapis` (Calendar/YouTube), `openai` (GPT-4o).

---

## 📏 Development Standards & Rules

**CRITICAL**: This project follows strict coding standards. All contributors must adhere to these rules.

### 1. UI & Styling Policy
- **MUI First**: Use Material UI components for EVERYTHING.
    - ❌ Do not use native HTML elements (`div`, `span`, `button`).
    - ✅ Use `Box`, `Stack`, `Typography`, `Button`.
- **No Inline Styles**: Never use the `style={{}}` prop.
    - ✅ Use the `sx={{}}` prop for ad-hoc styling.
    - ✅ Use `src/theme/theme.ts` for global variables (colors, spacing).
- **No Tailwind Layouts**: Tailwind classes are banned for structural layout. Use MUI `Grid` or `Stack`.

### 2. Component Guidelines
- **Typography**: Always use `Typography` with standard variants (`h1`...`h6`, `body1`, `caption`).
- **Icons**: Use `@mui/icons-material` exclusively.
- **Video Player**: Use the custom `CustomVideoPlayer.tsx` which wraps `react-youtube` with MUI controls (Slider, Box).

### 3. File Structure
- `/src/components`: Reusable UI components.
- `/src/pages`: Route views (Admin vs Portal).
- `/src/theme`: Centralized theme configuration.
- `/scripts`: Node.js automation scripts.

---

## 🤖 Scripts & Automation

The project relies heavily on Node.js scripts located in the `/scripts` directory.

| Script | Purpose |
| :--- | :--- |
| `deploy-manual-production.cjs` | **Main Deployment Script**. Uploads source code to VPS via SFTP, cleans old builds, and triggers Docker Compose rebuild. |
| `sync-calendar.cjs` | Fetches events from Google Calendar, matches them with Clients, and inserts/updates sessions in Supabase. |
| `server.cjs` | Express server running in production. Serves the SPA (`dist`) and exposes API endpoints for manual sync triggers. |
| `generate-summary.cjs` | Connects to OpenAI to read session notes and generate a concise 25-word summary title. |
| `verify-production.cjs` | Diagnostic script to SSH into VPS and verify container file integrity (hash checks). |

---

## � Deployment (Manual Production)

This project uses a **Manual SFTP + Docker Compose** deployment strategy designed for stability.

### The "Clean Build" Process
To deploy changes to the production VPS (191.96.251.250):

1. **Wait for Build**: Ensure your local code compiles (`npm run build`).
2. **Run Deploy Script**:
   ```bash
   node scripts/deploy-manual-production.cjs
   ```
3. **What happens automatically**:
   - Files are uploaded via SFTP (including `docker-compose.yml` to prevent volume masking).
   - Remote Docker container is stopped (`docker compose down`).
   - `dist` folder is wiped.
   - Project is rebuilt inside the container (`npm install && npm run build`).
   - Container starts (`docker compose up -d`).

### Verification
After deployment, strictly verify:
1. **Version Badge**: Look for the version chip (e.g., `v5.0 (Clean)`) in the header.
2. **Hard Refresh**: Always `Cmd + Shift + R`.
3. **Console**: Check for clean React hydration.

---

## � Security & data

- **RLS (Row Level Security)**: Supabase policies strictly enforce that Clients can only see sessions where their email is listed in `attendees`.
- **Environment Variables**: Managed via `.env` locally and securely injected in production. **NEVER** commit `.env` or `token.json`.

---

## 📝 Setup for Contributors

1. **Clone & Install**:
   ```bash
   git clone <repo>
   npm install
   ```
2. **Env Vars**: Copy `.env.example` to `.env`.
3. **Run Dev**:
   ```bash
   npm run dev
   ```
4. **MUI Theme**:
   - Primary: `#2C74B3` (Blue)
   - Background: `#051426` (Navy)
   - Paper: `#0A2647` (Card Blue)

---
*Maintained by Start Seu*
