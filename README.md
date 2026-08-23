# Lost & Found Matcher

A small university lost-and-found application that helps students identify
potential matches between lost and found item reports.

The system automatically compares active lost and found reports and ranks
potential matches using a transparent similarity score rather than claiming
that two reports definitely refer to the same item.

## Features

- Student registration and email/password authentication
- Create lost and found reports
- Optional item image URL
- Global active reports with search, filters, and pagination
- Personal "My Reports" view
- Edit and resolve owned reports
- Automatic potential matching between lost and found reports
- Ranked similarity scores with matching reasons
- Potential match detail view
- Contact information for reporters
- Dashboard and a responsive, dark-themed application UI

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- UI primitives hand-built in the shadcn/ui style (class-variance-authority +
  Tailwind, no Radix)
- PostgreSQL (developed against Neon)
- Prisma 7, with the `@prisma/adapter-pg` driver adapter
- Auth.js v5 (Credentials provider + JWT sessions)
- Zod
- Jest
- npm

## How Matching Works

The matching system is deterministic and intentionally does not use an LLM,
embeddings, or an external AI API. It lives entirely in `lib/matching/` with
zero Prisma or Next.js imports, so the scoring logic can be unit-tested in
complete isolation.

Each active lost report is compared with active found reports, and each
active found report is compared with active lost reports. The score
considers:

- Item name similarity
- Description similarity
- Category similarity
- Location similarity
- Date proximity
- Time-of-day similarity
- Color similarity
- Brand similarity

| Signal | Weight | How it's compared |
|---|---|---|
| Item name | 22 | best of word-overlap and character similarity (catches both a reworded name and a typo) |
| Description | 20 | word-overlap on normalized text |
| Category | 18 | exact match, a small hardcoded "related category" table, or a low floor otherwise — never a hard gate |
| Location | 15 | same hybrid similarity as item name |
| Date | 10 | smooth decay by days apart — never reaches zero |
| Color | 6 | exact match after synonym normalization (navy → blue, grey → gray, ...) |
| Time of day | 5 | ordinal distance across morning/afternoon/evening/night |
| Brand | 4 | same hybrid similarity as item name |

Images are shown as supporting visual evidence but are not part of the
numerical similarity score.

The result is a **similarity score from 0-100**, not a probability. For
example:

> **91/100 — Strong match**

The match details view also shows the per-signal reasons behind the score,
so the student can make the final judgment.

### Important assumptions

- Different categories do not automatically eliminate a potential match.
- Missing optional information (color, brand, time of day) does not count
  as a mismatch — the weight of a missing signal is redistributed across
  the signals that are present.
- Time is a soft signal. A found item reported weeks after it was lost can
  still be a strong potential match if everything else lines up.
- Only active reports participate in automatic matching.
- A report can have multiple potential matches.
- A potential match is a relationship between two reports, not a report
  status.
- Reports have two lifecycle states: `ACTIVE` and `RESOLVED`.
- Resolving a report means the reporter considers the case finished.
  Physical ownership verification and item handover are outside the MVP.
- A report's LOST/FOUND type and category can both be changed on edit, in
  case a student mis-entered either one.

The current scoring weights and the 50/100 qualifying threshold were
calibrated against representative hand-built examples and are covered by
automated tests (`lib/matching/__tests__/`) — not yet against real usage
data, which is the most likely thing to need retuning later.

## Application Structure

### Dashboard

A lightweight overview of:

- active lost reports
- active found reports
- the student's own potential matches
- recent reports
- the student's strongest potential matches

### Reports

Students can browse active reports submitted by the university community.
Reports support Lost/Found filtering, live debounced search (item name,
description, location, category, brand), and pagination.

### My Reports

Shows reports created by the current student, with Lost/Found and
Active/Resolved filtering, a match-count/best-score indicator per report,
and editing/resolving actions.

### Potential Matches

Shows every qualifying potential match involving the student's own active
reports, ranked by similarity score. Each result includes the score, a
match-strength label, both reports, key matching reasons, a link to the
full comparison, and a contact action for the other reporter.

### Create / Edit Report

Creating a report opens as a modal (via a Next.js intercepting route) from
a "New Report" button anywhere in the app, so it never needs its own
full-page detour — a direct visit to `/reports/new` still renders the full
page. The form is grouped into four short steps: what the item is, where
and when, additional details, and contact info.

## Running Locally

### Prerequisites

- Node.js 20.9+ (Next.js 16's minimum supported version)
- npm
- A PostgreSQL database — the project was developed against Neon, but any
  compatible PostgreSQL database works

### Installation

```bash
git clone git@github.com:Bezaaa/lost-and-found.git
cd lost-and-found
npm install
```

Create a `.env` file (see `.env.example`):

```env
DATABASE_URL="your-postgresql-connection-string"
AUTH_SECRET="your-auth-secret"
```

Generate an auth secret with:

```bash
openssl rand -base64 32
```

Run the Prisma migration:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Testing

The project uses Jest for both the matching engine's unit tests and the
matching service's database integration tests.

```bash
npm test
```

Type checking:

```bash
npx tsc --noEmit
```

Production build:

```bash
npm run build
```

The matching engine is isolated from Next.js and Prisma so the core scoring
behavior can be tested independently of the framework and database.

## Important Technical Decisions

### Next.js as the full-stack framework

A single Next.js application was used instead of separate frontend and
backend services, since the assignment has a deliberately small scope.
Server Components handle reads, and Server Actions handle authenticated
mutations — there's no separate REST/GraphQL API layer.

### Prisma + PostgreSQL

The data is relational and consists primarily of users, reports, and
potential matches, making PostgreSQL a natural fit. Prisma 7 requires an
explicit driver adapter (`@prisma/adapter-pg`) rather than a connection URL
in the schema file — connection config lives in `prisma.config.ts`.

### Auth.js with Credentials + JWT

Basic email/password authentication was all the assignment called for, so
there's no OAuth provider and no database session table — sessions are
signed JWTs in an HttpOnly cookie.

### Deterministic matching

A transparent scoring system was chosen instead of an AI-powered matcher
because it's easier to explain, test, calibrate, and reason about for this
scope — and because the assignment explicitly asked for it.

### PotentialMatch as a separate relationship

A report can have multiple potential matches, so a match is represented as
its own row (with its own score and reasons) rather than as a status on the
report.

### Active vs. Resolved

A report stays `ACTIVE` until the reporter considers it finished. Resolving
it removes it from active matching without deleting its match history.

### Report creation as a modal

"New Report" opens as a modal over whatever page the student is already on,
using Next.js's intercepting-route pattern, rather than taking over the
screen as its own nav destination — while still being a real, linkable page
at `/reports/new` for direct visits.

## Scope Intentionally Not Built

The MVP intentionally does not include:

- university/student identity verification
- admin or staff moderation
- ownership verification
- physical item handover management
- in-app messaging
- email/SMS notifications
- maps or GPS
- image recognition or computer-vision matching
- AI/LLM-based matching
- password reset/change
- complex analytics
- multi-university support

These would require additional product and infrastructure decisions beyond
the scope of the exercise.

## What I Would Improve for a Real Product

With more time, I would consider:

- university SSO/student verification
- proper image upload and object storage, instead of a plain URL field
- stronger privacy controls around contact information
- notifications for high-confidence matches
- a secure claim/ownership verification workflow
- richer location support for campus buildings
- Postgres full-text search once free-text search needs to rank relevance
  rather than just filter
- retuning the matching weights and threshold against real usage data
- moderation and reporting tools
- production-grade observability and rate limiting

The current implementation deliberately prioritizes a complete,
understandable MVP over a larger, unfinished feature set.

## AI Usage

Claude Code was used as an iterative development assistant throughout the
project. I defined the product scope, matching approach, architecture,
technology choices, and implementation priorities, then used Claude for
targeted implementation tasks and code review at each milestone.

The development process was incremental rather than one-shot: I reviewed
Claude's proposals before implementation, made the key design decisions,
tested the resulting features, and adjusted the implementation when needed.

Claude was mainly used for:

- implementing selected backend and UI tasks
- generating and refining tests
- helping diagnose implementation issues
- running type checks, tests, and build verification

The matching system itself does **not** use AI. It is a deterministic,
rule-based TypeScript scoring system designed to be transparent and
explainable.

No LLM, embedding model, or external AI API is used by the running
application.

## Submission

Repository: `https://github.com/Bezaaa/lost-and-found`

Deployed application: `<production-url>`
