<div align="center"> 

<br/>

# CampusCred

**Earn Real Work. Gain Real Cred.**

*India's most trusted student career ecosystem — 100% free for students.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](./LICENSE)

<br/>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Deployment](#-deployment) · [Contributing](#-contributing)

<br/>

</div>

---

## Overview

**CampusCred** is a full-stack student skill verification, certification, and internship platform built for Indian college students. Students complete real-world tasks from companies, earn QR-verified digital certificates with SHA-256 tamper-proof hashes, build public portfolios, and get hired — all without spending a single rupee.

The platform serves four user roles: **Students**, **Companies**, **Colleges**, and **Mentors**, each with dedicated dashboards, analytics, and workflows. An admin panel provides full platform control including submission reviews, fraud detection, and certificate management.

---

## Features

### For Students
- **Real-World Tasks** — Browse and complete tasks from companies across 6 categories (Development, Design, Marketing, Data Science, Content Writing, Research)
- **QR-Verified Certificates** — Earn tamper-proof digital certificates with QR codes, SHA-256 hashes, available as PDF + PNG + WebP thumbnail
- **CampusCred Score** — A 0-1000 reputation score across 5 levels: Starter, Achiever, Expert, Elite, Legend
- **Public Portfolio** — Shareable portfolio at `campuscred.in/student/[username]` with certificates, skills, and score
- **Branch Leaderboard** — Compete with peers in your branch
- **Hall of Fame** — Top students across all branches
- **Daily Challenges** — New challenges every day with bonus points
- **Micro-Internships** — Apply for short-term (2-6 months) internships from companies
- **Resume Builder** — Build and export your resume
- **Mentorship** — Book sessions with professional mentors
- **Ambassador Program** — Refer friends, earn points, climb ambassador tiers
- **Journey Timeline** — Track your progress with a visual timeline
- **Messaging** — Direct messaging with students, mentors, and companies
- **OAuth Login** — Sign in with Google, GitHub, or LinkedIn

### For Companies
- **Post Internships** — Create micro-internships with branch/degree filters
- **Post Tasks** — Assign real-world tasks to students
- **Talent Discovery** — Browse student portfolios, scores, and certificates
- **Submission Reviews** — Review student work and provide feedback
- **Hiring Tracker** — Track students you've hired or expressed interest in
- **Analytics Dashboard** — Track engagement, submissions, and hiring metrics

### For Colleges
- **Student Analytics** — Monitor student progress, scores, and achievements
- **Placement Statistics** — Track placement rates and hiring data
- **Student Enrollment** — Enroll students directly into the platform
- **NIRF Ranking Contributions** — Showcase student achievements for ranking

### For Mentors
- **Review Queue** — Review student submissions and provide detailed feedback
- **Mentorship Sessions** — Schedule and conduct mentorship sessions
- **Professional Profile** — Showcase expertise, designation, and hourly rate
- **Ratings & Reviews** — Build reputation through student ratings

### Platform-Wide
- **Admin Dashboard** — Full platform control with analytics, fraud detection, and user management
- **Certificate Generation Engine** — Automated pipeline: HTML → Puppeteer → PNG/PDF + Sharp thumbnail + SHA-256 hash
- **Fraud Detection** — Suspicious login detection, plagiarism flags, abuse monitoring
- **JWT Authentication** — 15-min access tokens + 7-day refresh tokens with HttpOnly cookies
- **Brute-Force Protection** — 5 attempts → 15-min lockout
- **Device Fingerprinting** — Track login devices and sessions
- **2FA Support** — Optional two-factor authentication
- **SMS OTP** — MSG91 (India) / Twilio (international) verification
- **Email OTP** — SMTP-based email verification
- **Dynamic Stats** — Auto-fetching real student/certificate/company/branch counts from the database
- **Dark/Light Mode** — Full theme support

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | 16 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 5 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | 4 |
| **UI Library** | [shadcn/ui](https://ui.shadcn.com/) (new-york style) | 45 components |
| **Database** | [Supabase PostgreSQL](https://supabase.com/database) | Via Prisma |
| **File storage** | [Supabase Storage](https://supabase.com/storage) | Profile photos + certificates |
| **ORM** | [Prisma](https://www.prisma.io/) | 6 |
| **Authentication** | Custom JWT + bcryptjs | — |
| **State Management** | [Zustand](https://zustand.docs.pmnd.rs/) | 5 |
| **Data Fetching** | [TanStack React Query](https://tanstack.com/query/) | 5 |
| **Forms** | React Hook Form + Zod | 7 / 4 |
| **Certificate Engine** | Puppeteer + Sharp + jsPDF + QRCode | — |
| **Email** | Nodemailer (SMTP) | 7 |
| **SMS** | MSG91 / Twilio | — |
| **Charts** | [Recharts](https://recharts.org/) | 2 |
| **Animations** | [Framer Motion](https://motion.dev/) | 12 |
| **Icons** | [Lucide React](https://lucide.dev/) | — |
| **Search** | [Fuse.js](https://www.fusejs.io/) | 7 |
| **Runtime** | [Bun](https://bun.sh/) | — |

---

## Getting Started

### Prerequisites

- **Node.js** 20.9+ (required by Next.js 16)
- **npm** or **bun** package manager

### 1. Clone and install

```bash
git clone https://github.com/brutal-45/Campus-Cred.git
cd Campus-Cred
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then copy its PostgreSQL connection strings from **Project Settings → Database → Connection string**. Use the pooler URL for `DATABASE_URL` and the direct connection URL for `DIRECT_URL`.

Create a **public** Storage bucket named `campuscred-assets` (or use a different name and set `SUPABASE_STORAGE_BUCKET`). The app uses it for profile photos and generated certificate files. Keep the service-role key private and only set it as a server-side environment variable.

### 3. Configure the app

```bash
cp .env.example .env
```

Fill in both Supabase database URLs, the project URL and service-role key, and unique random values for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CERT_SECRET`. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the administrator account. Do not commit `.env` or expose the service-role key through a `NEXT_PUBLIC_` variable.

### 4. Initialize Supabase and start locally

```bash
npm run db:generate
npm run db:push
npm run dev
```

`db:push` creates/updates the Prisma tables in your Supabase database. Database schema changes are intentionally **not** pushed automatically during deploy. Open [http://localhost:3000](http://localhost:3000) to use the app.

To create the first administrator, run `npm run db:seed` from a trusted environment after configuring `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

> **Note:** Admin accounts are not created during login. The public `/api/seed` endpoint is disabled; seed an admin from the command line only.

---

## Project Structure

```
campuscred/
├── prisma/
│   ├── schema.prisma          # 29 database models
│   └── seed.ts                # Database seeder
├── public/
│   ├── assets/
│   │   ├── logos/             # Company logos (SVG)
│   │   ├── png/               # PNG assets
│   │   └── svg/               # SVG assets
│   ├── certificates/          # Generated certificates
│   └── uploads/avatars/       # User profile photos
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # 40+ API routes
│   │   ├── admin/             # Admin dashboard (11 pages)
│   │   ├── college/           # College dashboard (6 pages)
│   │   ├── company/           # Company dashboard (11 pages)
│   │   ├── dashboard/         # Student dashboard (19 pages)
│   │   └── ...                # Public pages (16 pages)
│   ├── components/
│   │   ├── ui/                # 45 shadcn/ui primitives
│   │   ├── admin/             # Admin components
│   │   ├── auth/              # Login, register, OAuth
│   │   ├── certificate/       # Certificate generation & display
│   │   ├── college/           # College components
│   │   ├── company/           # Company components
│   │   ├── dashboard/         # Student dashboard components
│   │   ├── landing/           # Homepage sections
│   │   ├── mentor/            # Mentor components
│   │   ├── onboarding/        # Multi-step onboarding wizard
│   │   ├── portfolio/         # Public portfolio
│   │   ├── profile/           # Profile editing
│   │   ├── shared/            # Navbar, Footer, Logo, etc.
│   │   └── task/              # Task components
│   ├── data/                  # Indian cities & colleges
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core libraries (auth, db, validations, etc.)
│   │   └── certificate/       # Certificate generation engine
│   ├── providers/             # Auth & Query providers
│   └── store/                 # Zustand global store
├── .env                       # Environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies & scripts
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login with email/phone + password |
| `POST` | `/api/auth/logout` | Invalidate refresh token |
| `POST` | `/api/auth/refresh-token` | Silent token refresh |
| `POST` | `/api/auth/send-otp` | Send SMS OTP |
| `POST` | `/api/auth/verify-otp` | Verify SMS OTP |
| `POST` | `/api/auth/send-email-otp` | Send email OTP |
| `POST` | `/api/auth/verify-email-otp` | Verify email OTP |
| `POST` | `/api/auth/forgot-password` | Initiate password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `POST` | `/api/auth/oauth` | OAuth login (Google/GitHub/LinkedIn) |
| `POST` | `/api/auth/upload-photo` | Upload profile photo |
| `GET` | `/api/auth/sessions` | List active sessions |

### Student

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/student/score` | Get CampusCred score breakdown |
| `GET` | `/api/student/submissions` | List student submissions |
| `GET` | `/api/student/certificates` | List student certificates |
| `GET` | `/api/student/leaderboard` | Branch-based leaderboard |
| `GET` | `/api/student/hall-of-fame` | Top students across branches |
| `GET` | `/api/student/portfolio/[username]` | Public portfolio data |
| `POST` | `/api/student/tasks/[taskId]/submit` | Submit task work |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/submissions` | List all submissions |
| `POST` | `/api/admin/submissions/[id]/approve` | Approve submission + generate certificate |
| `POST` | `/api/admin/submissions/[id]/reject` | Reject submission with feedback |
| `GET` | `/api/admin/analytics` | Platform analytics |
| `GET` | `/api/admin/students` | List all students |

### Company

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/company/analytics` | Company analytics |
| `GET/POST` | `/api/company/internships` | List/create internships |
| `POST` | `/api/company/hire/[studentId]` | Express hiring interest |
| `GET` | `/api/company/talent` | Browse talent pool |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List tasks (filterable) |
| `GET` | `/api/certificates/[id]` | Get certificate |
| `GET` | `/api/verify/[id]` | Verify certificate authenticity |
| `GET` | `/api/stats` | Platform statistics |
| `GET` | `/api/internships` | List internships |
| `GET/POST` | `/api/mentorship` | List/book mentorship sessions |
| `GET` | `/api/daily-challenges` | Get daily challenge |
| `GET` | `/api/blog` | List blog posts |
| `GET` | `/api/ambassador` | Ambassador program data |

---

## Deployment

### Vercel + Supabase (recommended)

1. Create a Supabase project and a **public** Storage bucket (`campuscred-assets`).
2. Add the variables from `.env.example` to **Vercel → Project Settings → Environment Variables** for Production, Preview, and Development as appropriate:
   - `DATABASE_URL`: Supabase pooled PostgreSQL connection string. For the transaction pooler (port `6543`), include `?pgbouncer=true`.
   - `DIRECT_URL`: Supabase direct PostgreSQL connection string (used by Prisma for schema changes). If Vercel cannot reach the project's direct IPv6 endpoint, use the Supabase **session pooler** URL (port `5432`) for this variable; don't use the transaction pooler for schema changes.
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`: Storage configuration. Never prefix the service-role key with `NEXT_PUBLIC_`.
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CERT_SECRET`: independent random secrets (at least 32 characters); never use the development example values.
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: administrator credentials, set privately.
   - `NEXT_PUBLIC_APP_URL`: your deployed site origin, such as `https://your-project.vercel.app`.
3. Before the first deployment, apply the database schema from a trusted machine with the Supabase variables configured: `npm run db:push`. The Vercel build deliberately does not alter or reset your database.
4. Import the repository in Vercel and deploy. The project uses the standard Next.js build and Vercel's App Router/serverless support; no custom server or standalone output is required.

The first administrator must be created from a trusted CLI environment after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD`; the public `/api/seed` route is disabled. The Vercel function duration is configured to allow longer database and certificate operations. Generated profile photos and certificates are stored in Supabase Storage because Vercel's function filesystem is temporary.

### Local production build

```bash
npm run build
npm run start
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase pooled PostgreSQL URL for app traffic |
| `DIRECT_URL` | Yes | Supabase direct PostgreSQL URL for Prisma schema changes |
| `SUPABASE_URL` | Yes on Vercel | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes on Vercel | Server-only Supabase Storage key |
| `SUPABASE_STORAGE_BUCKET` | Yes on Vercel | Public Storage bucket (default `campuscred-assets`) |
| `JWT_SECRET` | Yes in production | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes in production | Refresh token signing secret |
| `CERT_SECRET` | Yes in production | Certificate integrity secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | For admin seed | Private administrator credentials |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public origin used in generated links |
| `EMAIL_PROVIDER` | Yes for production OTP delivery | Set to `resend` or `smtp`; production will not return OTPs from the console provider |
| `RESEND_API_KEY` / SMTP variables | If using that email provider | Configure a real email delivery provider for verification and password reset |
| `SMS_PROVIDER` | Optional | `msg91`, `twilio`, or `console`; configure provider credentials if phone OTP delivery is needed |

---

## CampusCred Score System

The CampusCred Score (0–1000) is calculated based on multiple factors:

| Activity | Points |
|----------|--------|
| Task Completed | +50 |
| Quality Submission (rating-based) | +10 to +50 |
| Certificate Earned | +30 |
| Streak (per day) | +5 |
| Peer Review Given | +10 |
| Referral | +20 |
| LinkedIn Share | +5 |
| Early Submission Bonus | +15 |

**Levels:**

| Level | Score Range |
|-------|-------------|
| Starter | 0 – 100 |
| Achiever | 101 – 300 |
| Expert | 301 – 600 |
| Elite | 601 – 900 |
| Legend | 901 – 1000 |

---

## Certificate Generation Engine

The certificate pipeline is fully automated:

1. **Fetch Data** — Student info, task details, submission data
2. **Generate QR Code** — Points to `campuscred.in/verify/[certificateId]`
3. **Render HTML** — Custom template with Poppins, Playfair Display, Cormorant Garamond fonts
4. **Puppeteer Screenshot** — A4 landscape 300 DPI PNG (3508×2480)
5. **PDF Generation** — Via Puppeteer print-to-PDF
6. **Sharp Thumbnail** — WebP 800×566 for fast loading
7. **SHA-256 Hash** — Tamper-proof integrity verification
8. **Database Update** — Store all URLs and hash in the Certificate model
9. **Fallback** — If Puppeteer unavailable, uses jsPDF + Sharp

---

## Design System

| Element | Value |
|---------|-------|
| **Primary Navy** | `#0A0F2C` |
| **Electric Blue** | `#3B82F6` |
| **Electric Blue Light** | `#60A5FA` |
| **Gold** | `#E8C84A` |
| **Text Primary** | `#0A0F2C` / `white` (dark mode) |
| **Text Secondary** | `#64748B` / `#94A3B8` (dark mode) |
| **Background** | `white` / `#0A0F2C` (dark mode) |
| **Border** | `#E2E8F0` |
| **Card Style** | White, 1px border, 12px radius, subtle shadow, -2px hover lift |
| **Hero** | Navy background with static dot grid at 8% opacity |
| **Allowed Animations** | fadeIn, fadeInUp, modalIn, toastIn, shimmer |

---

## Database Schema

29 Prisma models covering the full platform:

- **Auth & Users** — User, Session, PasswordReset, LoginHistory, OtpVerification
- **Tasks & Submissions** — Task, Submission, PeerReview
- **Certificates** — Certificate (with QR, hash, PDF/PNG/WebP URLs)
- **Organizations** — Company, College, Mentor
- **Internships** — Internship, InternshipApplicant
- **Social** — Conversation, ConversationParticipant, Message, Notification
- **Gamification** — SkillBadge, StudentBadge, JourneyLog, LeaderboardSnapshot, AmbassadorActivity, Referral
- **Content** — BlogPost
- **Analytics** — AnalyticsEvent, FraudLog, CityDatabase

---

## Contributing

This project is developed under **BrutalTools**. Contributions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Proprietary — All rights reserved. Developed under **BrutalTools**.

---

<div align="center">

**CampusCred** — Earn Real Work. Gain Real Cred.

[📧 creatorsports81@gmail.com](mailto:creatorsports81@gmail.com) · [📍 Maharashtra, Pune, Mumbai]

</div>
