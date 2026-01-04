# 🚀 SyncMeet

**SyncMeet** is a modern, AI-powered portal for managing mentorship sessions, designed to provide a premium, distraction-free experience for mentees.

## 🎯 Who is this for?

**SyncMeet** is the ultimate tool for **Mentors, Coaches, and Consultants** who want to elevate their client experience. If you deliver high-value sessions via Google Meet and use YouTube to host recordings, this platform is for you.

## 💡 The Problem vs. The Solution

### ❌ Without SyncMeet ( The "Old Way" )
- **Manual Work**: You finish a session, download the recording, upload to YouTube, set visibility to "Unlisted".
- **Lost Links**: You email the link to the client. Months later, they ask: *"Can you resend the link for our session in January?"*
- **Zero Context**: The client watches the video on YouTube, surrounded by distractions, ads, and unrelated video suggestions.
- **No Summary**: If the client wants to recall a specific topic, they have to watch the whole hour again.

### ✅ With SyncMeet ( The "Premium Way" )
- **Automated Hub**: Sessions from your Google Calendar appear automatically in the portal.
- **Centralized Access**: Clients have a dedicated login to access ALL their past sessions, organized by date.
- **Distraction-Free**: Videos play in a custom, branded player without YouTube branding or ads.
- **AI Intelligence**: An **AI Agent** listens to the session notes and automatically generates a concise, punchy topic title (e.g., *"Strategic Planning for Q1 Launch"* instead of *"Meeting with John"*).

---

## ✨ Key Features

- **🎯 Distraction-Free Video Player**: Custom-built video player that removes all YouTube distractions (ads, related videos, titles), focusing solely on the content.
- **🤖 AI-Powered Summaries**: Automatically generates executive summaries of mentorship sessions using **OpenAI (GPT-4o)** via **Supabase Edge Functions**.
- **📅 Smart Calendar Sync**: Seamlessly syncs Google Calendar events to the platform, organizing sessions by client and date.
- **🔐 Secure Access**: Role-based access control (Admin vs. Mentee) powered by **Supabase Auth**.
- **📄 Content Hub**: Integrated view for session notes, transcripts, and attached documents.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/).
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions).
- **AI**: [OpenAI API](https://openai.com/) (Chat Completions).
- **Integrations**: Google Calendar API, YouTube Data API.

## 🏗️ Architecture

1.  **Sync Engine**: Fetches events from Google Calendar and maps them to the database.
2.  **AI Worker**: Listens for new content (`INSERT/UPDATE` on `sessions`) and triggers an Edge Function to generate a concise 25-word topic summary.
3.  **Portal UI**: A clean, responsive interface for clients to access their recorded sessions and materials.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI
- Google Cloud Project (for Calendar/YouTube API)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/athossouza/SyncMeet-Platform.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    ```bash
    cp .env.example .env
    # Fill in SUPABASE_URL, OPENAI_API_KEY, etc.
    ```
4.  Run development server:
    ```bash
    npm run dev
    ```

## 🛡️ License

This project is licensed under the MIT License.

---
*Built with ❤️ by [Start Seu](https://github.com/Start-Seu)*
