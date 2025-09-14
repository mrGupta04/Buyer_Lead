# Buyer Lead Intake — Mini App

A small Next.js + TypeScript app to **capture, list, and manage buyer leads** with server-side pagination, CSV import/export, Zod validation, and ownership-based permissions.

---

## 🚀 Features

- **Create Lead** (`/buyers/new`)  
  - Full client + server validation via Zod  
  - Conditional `bhk` field (Apartment/Villa only)  
  - Writes to `buyer_history` on create  

- **List & Search** (`/buyers`)  
  - SSR paginated list (10/page)  
  - URL-synced filters (`city`, `propertyType`, `status`, `timeline`)  
  - Debounced search by `fullName | phone | email`  
  - Default sort: `updatedAt` desc  

- **View & Edit** (`/buyers/[id]`)  
  - Edit with concurrency check (`updatedAt`)  
  - Shows last 5 changes from `buyer_history`  

- **CSV Import/Export**  
  - Import: max 200 rows, row-level validation with detailed errors, inserts valid rows in a transaction  
  - Export: filtered CSV export (respects filters/search/sort)  

- **Ownership & Auth**  
  - Any logged-in user can **read all** buyers  
  - Users can **edit/delete only their own** (`ownerId`)  
  - Optional `admin` role can edit all  

- **Safety & Quality**  
  - Zod validation on client + server  
  - Rate limiting on create/update endpoints  
  - Error boundary + empty states  
  - Accessibility basics (labels, focus, error messages)  
  - Unit test (CSV row validator)  

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router) + TypeScript  
- **DB & ORM:** PostgreSQL + Prisma (with migrations)  
- **Validation:** Zod (shared client + server)  
- **Auth:** Magic link or demo login (NextAuth or custom)  
- **CSV:** papaparse (or csv-parse)  
- **Rate limiting:** Simple middleware (Redis in prod, in-memory in dev)  
- **Testing:** Vitest / Jest  

---

## ⚙️ Local Setup

### Requirements
- Node.js 18+  
- PostgreSQL (or Supabase/SQLite)  
- Git  

### 1. Clone & Install
```bash
git clone https://github.com/YOUR-USERNAME/buyer-lead-intake.git
cd buyer-lead-intake
npm install

2. Configure Environment

Copy .env.example → .env and update values:

DATABASE_URL=postgresql://user:password@localhost:5432/buyer_leads
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=some_long_random_secret
APP_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379  # optional for rate limiting

3. Run Migrations & Seed
npx prisma migrate dev --name init
npm run prisma:seed   # optional: seeds demo users + leads

4. Start Dev Server
npm run dev


Visit: http://localhost:3000

🗄 Database Models
Buyer

id (uuid)

fullName (string, 2–80)

email (optional, valid email)

phone (string, 10–15 digits)

city (enum: Chandigarh | Mohali | Zirakpur | Panchkula | Other)

propertyType (enum: Apartment | Villa | Plot | Office | Retail)

bhk (enum: 1 | 2 | 3 | 4 | Studio; required for Apartment/Villa)

purpose (enum: Buy | Rent)

budgetMin (int, optional)

budgetMax (int, ≥ budgetMin if both set)

timeline (enum: 0-3m | 3-6m | >6m | Exploring)

source (enum: Website | Referral | Walk-in | Call | Other)

status (enum: New | Qualified | Contacted | Visited | Negotiation | Converted | Dropped, default = New)

notes (≤ 1000 chars)

tags (string[], optional)

ownerId (user id)

updatedAt (timestamp)

BuyerHistory

id

buyerId (relation)

changedBy (user id)

changedAt (timestamp)

diff (JSON of changed fields)

User

id

email

name

role (default: user, optional: admin)

✅ Validation Rules (Zod)

fullName: 2–80 chars

phone: numeric string, 10–15 digits

email: optional, must be valid if present

budgetMax ≥ budgetMin if both exist

bhk: required if propertyType ∈ {Apartment, Villa}

notes: ≤ 1000 chars

tags: parsed into array

Validation schemas live in /lib/validators/buyer.ts and are shared across client + server.

🔗 API Endpoints

GET /buyers — paginated list with filters/search/sort

POST /api/buyers — create buyer (rate-limited, ownership enforced)

PUT /api/buyers/:id — update buyer (checks ownerId, updatedAt concurrency, writes history)

DELETE /api/buyers/:id — delete buyer (ownership check)

POST /api/buyers/import — validate + import CSV rows (transactional)

GET /api/buyers/export.csv — export filtered list

🔒 Concurrency Handling

Edit forms include hidden updatedAt.

On update, server compares DB updatedAt.

If mismatch → reject with 409 Conflict:

“Record changed by someone else — please refresh.”

📤 CSV Import/Export
Import

Header must be:

fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status


Max 200 rows per file

Validated with Zod row-by-row

Row-level error reporting (row # + message)

Inserts valid rows only, wrapped in a DB transaction

Export

Current filtered list (filters/search/sort respected)

CSV download (/api/buyers/export.csv)

🔑 Auth & Ownership

Any logged-in user → read all buyers

Only ownerId or admin → edit/delete buyer

Enforced server-side

🧪 Tests

Example unit test: CSV row validator (tests/csvValidator.test.ts)

Run tests:

npm run test

📊 Deployment

Set DATABASE_URL, NEXTAUTH_SECRET, and APP_URL in production env

Run migrations:

npx prisma migrate deploy


Deploy app to Vercel (or similar)

(Optional) Add Redis for rate-limiting

📝 Design Notes

Prisma chosen for strong typing & migration support

Zod shared schemas: one source of truth across client/server

SSR list ensures correct filters/pagination + SEO-friendly

Transactional CSV import → consistent data integrity

Ownership checks server-side → UI cannot bypass restrictions

⚡ Done vs Skipped

✅ Implemented:

CRUD + filters/search/sort

Concurrency handling

Ownership enforcement

CSV import/export with errors + transactions

Zod validation both sides

Rate limit + test + accessibility basics

⚠️ Skipped / deferred:

Attachment upload (attachmentUrl)

Rich full-text search (tsvector)

Extensive test suite (only 1 unit test provided)

Advanced optimistic updates

📌 Roadmap / Improvements

Add tagging typeahead & status quick actions

Implement file upload (attachmentUrl)

Enhance test coverage (integration + API)

Add full-text search with Postgres tsvector or external service

Improve optimistic UI for edits

📚 Useful Commands
# Dev
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev

# Build & Prod
npm run build
npm run start
npx prisma migrate deploy

# Prisma
npx prisma studio
npx prisma generate

# Tests
npm run test


Do you want me to also **generate `.env.example` and `prisma/schema.prisma` templates** for your repo s
