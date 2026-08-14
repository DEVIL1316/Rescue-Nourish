# Rescue & Nourish

A food rescue and nourishment coordination platform built with React, TypeScript, and Lovable Cloud. The app connects surplus food donors with NGOs and orphanages across Bangalore, reducing food waste while ensuring timely delivery to those in need.

## Project Overview

Rescue & Nourish is a role-based donation platform designed to streamline the journey of surplus food from donors to recipients. The system supports four primary roles:

- **Donor** – Individuals, restaurants, or event organizers who list surplus food donations.
- **NGO** – Logistics partners who verify, pick up, and deliver donations.
- **Orphanage Member** – Representatives who request and receive food for their institutions.
- **Admin** – Platform moderators who oversee users, donations, and system health.

The platform emphasizes real-time coordination, smart matching, multi-language accessibility, and transparent tracking.

## Key Features

### Donation Management
- Create food donation listings with type, quantity, expiry time, location, urgency, and donor type.
- Photo upload with client-side compression and base64 storage.
- Booking slots for scheduled pickups (08:00–19:00 hourly windows).
- Donation history grouped by recipient and status.

### Smart Matching
- Weighted scoring algorithm:
  - Location Proximity: 40%
  - Need Keyword Match: 40%
  - Capacity Fit: 20%
- Auto-suggests the best recipient for each donation based on distance, needs, and current capacity.

### Real-Time Coordination
- Live chat between donors, NGOs, and orphanage members with intent tags.
- Real-time notifications for status updates and messages via Supabase Realtime.
- Donation tracking through states: Pending → Picked Up → Delivered.

### Directory & Discovery
- NGO directory with contact details, verification status, and recent activity.
- Orphanage directory with capacity and current needs.
- Location clustering across 20 Bangalore neighborhoods in 6 clusters.

### Multi-Language Support
- Supported languages: English, Hindi, Telugu, Kannada, and Tamil.
- Persistent language selection across sessions.

### Admin & Oversight
- Admin dashboard for moderating donations, users, and platform activity.
- Anomaly detection flags duplicate submissions, unusual volumes, low ratings, and off-hours activity.
- Confirmation dialogs for destructive admin actions.

### Agent Integrations (MCP)
- Model Context Protocol server exposing read-only directory tools:
  - `list_ngos`
  - `list_orphanages`
  - `list_open_needs`
- OAuth-secured access for authenticated callers.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS v3, shadcn/ui |
| State | Zustand, React Query |
| Backend | Lovable Cloud (Supabase) – PostgreSQL, Auth, Realtime, Edge Functions |
| Charts | Recharts |
| PWA | vite-plugin-pwa |
| Mobile | Responsive layout with bottom navigation for PWA use |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── donation/        # Layout, booking slots, photo upload, etc.
│   └── ui/              # shadcn/ui components
├── contexts/            # Language context and other providers
├── hooks/               # Custom React hooks (auth, role, mobile, toast)
├── integrations/        # Auto-generated Supabase client and types
├── lib/                 # Utilities, constants, smart matching, MCP tools
├── pages/               # Route-level page components
│   └── donation/        # All donation-platform pages
├── App.tsx              # Main application router
└── main.tsx             # Application entry point

supabase/
├── functions/           # Edge functions (MCP server)
└── config.toml          # Supabase configuration

public/                  # Static assets, PWA icons, sitemap
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or bun
- A Lovable Cloud backend connection

### Installation

1. Clone the repository:

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build for Production

```bash
npm run build
```

## Environment Variables

The following variables are automatically managed by Lovable:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Do not modify `.env` or `src/integrations/supabase/client.ts` directly.

## Deployment

Publish directly from Lovable:

1. Open your project in Lovable.
2. Go to **Share → Publish**.
3. Your app will be deployed to the configured project URL.

## Core Concepts

### Role-Based Access

Roles are stored in `localStorage` / `sessionStorage` for the current session. The navigation and available actions adapt based on the active role.

### Smart Matching Formula

```
Score = (Location Proximity × 0.40) + (Need Keyword Match × 0.40) + (Capacity Fit × 0.20)
```

Higher scores indicate better recipient matches for a given donation.

### Donation Tracking Flow

1. Donor creates a donation listing.
2. Smart matching suggests the best recipient.
3. NGO or donor arranges pickup via booking slots or chat.
4. Status updates through: **Pending → Picked Up → Delivered**.
5. Recipient confirms delivery and donation is recorded in history.

### Anomaly Detection Rules

The system flags activity that may indicate misuse or errors:

- Duplicate submissions within 1 hour
- More than 5 submissions per day from the same source
- Donation volume more than 2× the recipient's typical capacity
- Ratings of 2 stars or below
- Submissions between 12:00 AM and 5:00 AM

## Security

- Row Level Security (RLS) enabled on all user-facing tables.
- Role checks performed via a `has_role` security definer function.
- Sensitive functions restricted from public/anonymous execution.
- Admin destructive actions require typed confirmation.

## SEO

- Dynamic `<title>` and `<meta name="description">` per route.
- Open Graph and Twitter Card metadata.
- Generated `sitemap.xml` and `robots.txt`.
- Semantic HTML and accessible navigation.

## License

This project is proprietary and maintained as part of the Rescue & Nourish initiative.

## Support

For questions or help with this project, open the Lovable project page or refer to the generated documentation in the repository.
