# Buyer Lead Intake — Mini App

A small Next.js + TypeScript app to **capture, list, and manage buyer leads** with server-side pagination, CSV import/export, Zod validation, and ownership-based permissions.

---

- Server-side pagination  
- CSV import/export  
- Zod validation (shared client + server)  
- Ownership-based permissions  
- Email-based magic link login (demo users supported)  
- Concurrency-safe edits with history tracking  

---

## 📸 Screenshot

Here’s how the dashboard looks:

![Dashboard Screenshot](https://github.com/mrGupta04/certificate/blob/main/10.png?raw=true)


## 🚀 Features

- **Authentication & Demo Login**
  - Magic link login → users receive a link via email to sign in  
  - Demo users seeded with `npm run prisma:seed`  
  - Any logged-in user can browse, but ownership rules apply  

- **Create Lead** (`/buyers/new`)
  - Full validation with Zod (client + server)  
  - Conditional `bhk` field (Apartment/Villa only)  
  - History tracking → every insert creates an entry in `buyer_history`  

- **List & Search** (`/buyers`)
  - Server-side rendered **paginated list** (10 per page)  
  - Filters: `city`, `propertyType`, `status`, `timeline`  
  - Debounced keyword search: `fullName | phone | email`  
  - Sorting (default: `updatedAt` desc)  
  - SEO-friendly since lists are SSR  

- **View & Edit** (`/buyers/[id]`)
  - Concurrency-safe edit (hidden `updatedAt` check)  
  - Shows **last 5 changes** from `buyer_history`  

- **CSV Import/Export**
  - Import up to **200 rows**  
  - Row-level validation + error reporting (with row #)  
  - Inserts valid rows only (wrapped in DB transaction)  
  - Export filtered results (respects filters/search/sort)  

- **Ownership & Roles**
  - Any user → read all buyers  
  - Only `ownerId` or `admin` → edit/delete  
  - Enforced **server-side** (cannot be bypassed via UI)  

- **Quality & Safety**
  - Validation: Zod schemas shared across client + server  
  - Rate limiting on create/update endpoints  
  - Accessibility basics (labels, focus, error messages)  
  - Unit test: CSV row validator (`tests/csvValidator.test.ts`)  

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router) + TypeScript  
- **DB & ORM:** PostgreSQL + Prisma (migrations + type safety)  
- **Validation:** Zod (one source of truth)  
- **Auth:** NextAuth (magic link email) or demo login  
- **CSV:** papaparse (frontend) + validation server-side  
- **Rate Limiting:** Redis (prod) or in-memory (dev)  
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
# 🏡 Buyer Lead Intake App
```

---

## ⚙️ 2. Configure Environment
Copy `.env.example` → `.env` and update values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/buyer_leads
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=some_long_random_secret
APP_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379   # optional (rate limiting)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

---

## 🗄 3. Run Migrations & Seed
```bash
npx prisma migrate dev --name init
npm run prisma:seed   # optional: seeds demo users + leads
```

---

## 🖥 4. Start Dev Server
```bash
npm run dev
```
Visit → [http://localhost:3000](http://localhost:3000)


---

## 📤 CSV Import/Export

### Import
- Header must match:  
  ```
  fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
  ```
- Max **200 rows/file**  
- Validated row-by-row with Zod  
- Row-level error reporting (row # + message)  
- Inserts valid rows only, wrapped in transaction  

### Export
- Respects filters/search/sort  
- Download: `/api/buyers/export.csv`  

---

## 🔑 Auth & Ownership
- Any logged-in user → read all buyers  
- Only `ownerId` or `admin` → edit/delete buyer  
- Enforced **server-side**  

---

## 📝 Design Notes
- Prisma → strong typing + migrations  
- Zod shared schemas → one source of truth  
- SSR list → correct filters/pagination + SEO  
- Transactional CSV import → consistent data integrity  
- Ownership enforced server-side  

---

## ⚡ Done vs Skipped
**✅ Implemented:**  
- CRUD + filters/search/sort  
- Concurrency handling  
- Ownership enforcement  
- CSV import/export w/ validation + transactions  
- Zod validation both sides  
- Basic rate-limit + test + accessibility  

**⚠️ Skipped / Deferred:**  
- File attachments (attachmentUrl)  
- Rich full-text search (tsvector)  
- Full test suite (only 1 provided)  
- Advanced optimistic updates  

---

## 📌 Roadmap / Improvements
- Add tagging typeahead & status quick actions  
- Implement file upload (attachmentUrl)  
- Expand test coverage (integration + API)  
- Full-text search (Postgres tsvector / external service)  
- Improve optimistic UI for edits  

---

