
# 💬 Convos

**A multi-hub, multilingual social learning/community app.**
Features hub-based feeds, threaded comments, auth, DMs, and a comprehensive admin panel.
<img width="1898" height="860" alt="Screenshot_1" src="https://github.com/user-attachments/assets/279abacf-953d-4653-8e1d-9b8b757bde95" />

---

## 📋 Requirements

- **Node.js:** 18+ (Recommended: 20+)
- **Database:** PostgreSQL (Local or Docker)
- **Package Manager:** pnpm (Recommended) / npm / yarn

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
# or
npm install

```

### 2. Configure Environment (.env)

Create a `.env` file in the project root.

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/convos?schema=public"

# Auth (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="CHANGE_ME"

# Uploads (Optional)
# UPLOAD_DIR="public/uploads"

```

> **Tip:** Generate a secure secret for `NEXTAUTH_SECRET`:
> **OpenSSL:**
> ```bash
> openssl rand -base64 32
> 
> ```
> 
> 
> **Node:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> 
> ```
> 
> 

### 3. Database Setup (Prisma)

Generate the client and migrate the database:

```bash
pnpm prisma generate
pnpm prisma migrate dev

```

### 4. Seed the Database

Populate the DB with default hubs, admin users, and sample content.

**Option A: Prisma Seed Command**

```bash
pnpm prisma db seed

```

**Option B: Run Script Directly**

```bash
# If using TypeScript
pnpm ts-node prisma/seed.ts

# If using JavaScript
node prisma/seed.js

```

> **🔐 Default Credentials:**
> * **Admin:** `admin@local.dev` / `admin123`
> * **Demo:** `demo@local.dev` / `demo123`
> 
> 

### 5. Run Development Server

```bash
pnpm dev

```

Visit: [http://localhost:3000]()

---

## 📂 Key Routes

### Frontend Pages

| Section | Route | Description |
| --- | --- | --- |
| **Feeds** | `/` | Global Feed |
|  | `/h/[lang]` | Hub Feed (e.g., `/h/en`) |
| **Auth** | `/auth/login` | Login Page |
|  | `/auth/register` | Registration Page |
| **Profile** | `/u/[username]` | User Profile |
| **Messages** | `/messages` | Direct Messages (DMs) |
| **Admin** | `/admin` | Dashboard (Admin/Mod only) |
|  | `/admin/users` | User Management |
|  | `/admin/reports` | Moderation Queue |

### Route Protection (Middleware)

* **Authenticated:** `/friends/*`, `/messages/*`, `/settings/*`, `/tutor/*`, `/notifications/*`
* **Admin/Mod Only:** `/admin/*`

---

## 🔌 API Overview

### Hubs & Feed

* `GET /api/hubs` — List all hubs
* `GET /api/posts` — Feed (Params: `sort`, `hub`, `q`, `limit`)
* `POST /api/posts` — Create post `{ hub, type, title, content }`

### Comments

* `GET /api/comments?postId=...` — Fetch comment tree
* `POST /api/comments` — Create comment `{ postId, parentId, body }`

### Admin

* `GET /api/admin/users` — List users (`q`, `take`)
* `GET /api/admin/users/[idOrUsername]` — User details
* `PATCH /api/admin/users/[idOrUsername]` — Update user

---

## ⚠️ Developer Notes

### Admin Links

When linking to user detail pages in the Admin panel, ensure the link matches the dynamic route structure:

* If route is `/admin/users/[username]`:
```jsx
<Link href={`/admin/users/${it.username}`}>Manage</Link>

```


* If route is `/admin/users/[id]`:
```jsx
<Link href={`/admin/users/${it.id}`}>Manage</Link>

```



### Uploads (Avatars / Media)

If using upload endpoints, ensure the following directories exist:

```bash
mkdir -p public/uploads/ public/uploads/avatars/ public/uploads/posts/

```

---

## 🔧 Common Issues & Fixes

**1. “Unexpected token '<' … is not valid JSON”**

* **Cause:** Client expects JSON but received HTML (usually a redirect).
* **Fix:** Check if you are logged in, if `credentials: "include"` is set in fetch, or if middleware is redirecting you.

**2. Prisma “Unknown field …”**

* **Cause:** Schema and Client are out of sync.
* **Fix:** Run `pnpm prisma generate` and restart the server.

**3. Next.js Dynamic Route Mismatch**

* **Cause:** Using different slug names (e.g., `[bookId]` vs `[lessonId]`) for the same path segment.
* **Fix:** Ensure consistent slug naming across the app.

---

## 🗺 Roadmap & Product Notes

### Current Direction

* [x] **Layout:** Left sidebar fixed, main content wider.
* [ ] **Create Post:** Move to a Modal instead of a separate page.
* [ ] **Widgets:** Trending hubs & Top learners in right sidebar.
* [ ] **Branding:** "Convos" logo lockup.

### Future Ideas

* [ ] Voting system with optimistic UI.
* [ ] Improved DM composer.
* [ ] Better profile editor.
* [ ] Advanced moderation logs.

```
## Project status

Not a complete product yet — this repo currently contains only the **community** portion.
