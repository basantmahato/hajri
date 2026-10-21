---
name: hajri-dev
description: >-
  Use this skill when working on the Hajri project. It covers the full-stack
  architecture (Express/Drizzle backend + Next.js frontend), the layered
  backend pattern with manual dependency injection, database schema conventions,
  Better Auth integration, and step-by-step instructions for adding new features
  end-to-end.
---

# Hajri Developer Skill

Hajri is a **multi-tenant employee attendance and workforce management SaaS**.
Monorepo structure:

| Folder | Tech | Dev port |
|--------|------|----------|
| `backend/` | Express 5 · TypeScript (ESM) · Drizzle ORM · PostgreSQL · Better Auth | 3000 |
| `frontend/` | Next.js 16 App Router · React 19 · Tailwind CSS v4 · Axios · Better Auth | 3001 |
| `mobile/` | Planned | — |
| `admin/` | Planned | — |

---

## 1. Backend Architecture — LLD & OOP Patterns

### 1.1 Layered Architecture (Separation of Concerns)

The backend is strictly split into five layers. **Never mix responsibilities across layers.**

```
HTTP Request
    |
    v
[Routes]          backend/src/routes/<feature>.routes.ts
    |               - Pure Express Router factory function
    |               - Maps HTTP verb + path to controller method
    |               - Zero business logic
    v
[Controller]      backend/src/controllers/<feature>.controller.ts
    |               - Class with constructor(private service: XService)
    |               - Declares Zod schemas at module scope (co-located)
    |               - Validates req.body / req.params with schema.parse()
    |               - Calls service method, sets HTTP status, calls res.json()
    |               - All methods are arrow functions (preserves `this`)
    |               - All errors forwarded to next(error) — never caught silently
    v
[Service]         backend/src/services/<feature>.service.ts
    |               - Class with constructor(private repo: XRepository)
    |               - Orchestrates business rules, no DB calls directly
    |               - Private readonly constants for config (SALT_ROUNDS, etc.)
    |               - Pure async methods returning typed domain objects
    |               - Throws plain Error with a human-readable message on failure
    v
[Repository]      backend/src/repository/<feature>.repository.ts
    |               - Class with constructor(private db: DrizzleDB)
    |               - Only place Drizzle query builder is used
    |               - Methods: findById, findByX, create, update, delete, list
    |               - Returns domain type or null (never throws on "not found")
    |               - Uses .returning() on insert/update to return the record
    v
[Database]        backend/src/config/database.ts
                    - Single exported `db` (DrizzleDB) singleton
                    - `verifyConnection()` called at startup
```

### 1.2 OOP Patterns Used

#### Encapsulation
- Each class owns its dependencies via private constructor parameters.
- Config constants (`SALT_ROUNDS`, `JWT_SECRET`, `JWT_EXPIRES_IN`) are `private readonly` on the service class — never passed around as loose values.

```typescript
// CORRECT — config is encapsulated in the service
export class AttendanceService {
  private readonly MAX_LATE_MINUTES = 15;
  constructor(private attendanceRepository: AttendanceRepository) {}
}
```

#### Constructor-Based Dependency Injection (Manual DI)
- **No IoC container.** Dependencies are wired by factory functions.
- Each layer receives exactly one dependency (its downstream layer) via constructor.
- The factory is the single source of truth for wiring.

```typescript
// backend/src/factories/attendance.factory.ts
export const createAttendanceRoutes = (db: DrizzleDB) => {
  const repo       = new AttendanceRepository(db);
  const service    = new AttendanceService(repo);
  const controller = new AttendanceController(service);
  return setupAttendanceRoutes(controller);
};
```

#### Arrow-Function Methods on Controllers
Controller methods are arrow functions assigned as class properties — this makes them safely passable as Express route handlers without `.bind(this)`.

```typescript
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  // Arrow function — `this` is always bound to the class instance
  getEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const employee = await this.employeeService.getById(Number(id));
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  };
}
```

#### Single Responsibility
- Routes: wiring only.
- Controllers: HTTP adapter (parse → delegate → respond).
- Services: domain logic only.
- Repositories: data access only.
- Factories: wiring only.
- Schemas (`models/`): table definition + inferred types only.
- Types (`types/`): DTOs and interfaces only — no runtime code.

### 1.3 Routes — Factory Function Pattern

Routes are **not classes**. They are factory functions that receive a controller instance and return an Express `Router`.

```typescript
// backend/src/routes/employee.routes.ts
import { Router } from 'express';
import type { EmployeeController } from '../controllers/employee.controller.js';

export const createEmployeeRoutes = (controller: EmployeeController): Router => {
  const router = Router();
  router.get('/',    controller.list);
  router.get('/:id', controller.getById);
  router.post('/',   controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
};
```

### 1.4 API Router Structure

All feature routers are mounted inside `backend/src/routes/api.routes.ts`:

```
/api
  /v1
    /mobile    — mobile client routes
    /web       — web client routes
```

Mount feature routers under the appropriate client namespace:

```typescript
// api.routes.ts
import { createEmployeeRoutes } from './employee.routes.js';
// ...
mobile.use('/employees', createEmployeeRoutes(db));
web.use('/employees',    createEmployeeRoutes(db));
```

Pass `db` directly into factory functions inside `createApiRouter`. Do **not** instantiate repositories or services in `api.routes.ts` — that belongs in the factory.

### 1.5 Error Handling

- Controller methods wrap service calls in `try/catch` and forward all errors to `next(error)`.
- The global `errorHandler` middleware (`backend/src/middleware/error.middleware.ts`) handles all errors:
  - `ZodError` → HTTP 400 with `{ error: "Validation error", details: ... }`
  - Everything else → HTTP 500 with `{ error: "Internal server error", message: ... }`
- **Never** call `res.status(500)` inside a controller — always use `next(error)`.
- Services throw `new Error('Human-readable message')` on business rule violations.

### 1.6 Zod Validation — Co-location Rule

Zod schemas are **module-level constants** inside the controller file that uses them. Never put Zod schemas in `types/`.

```typescript
// backend/src/controllers/employee.controller.ts
import { z } from 'zod';

const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  position:  z.string().min(1),
  joiningDate: z.string().date(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern']),
});

export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createEmployeeSchema.parse(req.body);
      const employee = await this.employeeService.create(data);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  };
}
```

### 1.7 Repository — Drizzle Query Patterns

```typescript
import { eq, and, gte, desc } from 'drizzle-orm';
import { employees } from '../models/index.js';
import type { DrizzleDB } from '../config/database.js';

export class EmployeeRepository {
  constructor(private db: DrizzleDB) {}

  // findById returns T | null
  async findById(id: number): Promise<EmployeeSelect | null> {
    const [row] = await this.db.select().from(employees).where(eq(employees.id, id)).limit(1);
    return row ?? null;
  }

  // list with optional filters
  async findByOrganization(orgId: number): Promise<EmployeeSelect[]> {
    return this.db.select().from(employees).where(eq(employees.organizationId, orgId));
  }

  // insert always uses .returning()
  async create(data: EmployeeInsert): Promise<EmployeeSelect> {
    const [row] = await this.db.insert(employees).values(data).returning();
    return row;
  }

  // update with updatedAt refresh
  async update(id: number, data: Partial<EmployeeInsert>): Promise<EmployeeSelect> {
    const [row] = await this.db
      .update(employees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return row;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(employees).where(eq(employees.id, id));
  }
}
```

### 1.8 Types — DTOs vs Schema Types

Two separate type systems coexist:

| Location | What | How |
|----------|------|-----|
| `backend/src/models/<name>.schema.ts` | Raw DB row types | `export type XSelect = typeof table.$inferSelect;` |
| `backend/src/types/<feature>.types.ts` | DTOs for input/output | Plain TypeScript `interface` or `type` |

- **Never** use `XSelect` as the API response type directly — define a `XResponseDto` interface that strips sensitive fields (e.g. `password`).
- Use `Omit<User, 'password'>` or explicit DTO interfaces in `types/` for API responses.

---

## 2. Database Schema Conventions

All schemas live in `backend/src/models/` and follow these rules:

### Naming
- File: `<feature>.schema.ts`
- Table export: camelCase (`employees`, `attendance`)
- DB table name: `snake_case` (passed as string to `pgTable`)
- Column names: `snake_case` strings; TypeScript property: `camelCase`

### Standard Columns (every table must have)
```typescript
createdAt: timestamp('created_at').notNull().defaultNow(),
updatedAt: timestamp('updated_at').notNull().defaultNow(),
```

### Primary Keys
- Use `serial('id').primaryKey()` for app tables.
- Better Auth tables use `text('id').primaryKey()` (UUID strings managed by Better Auth).

### Foreign Keys
```typescript
// Cascade delete on child records
userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

// Nullify on parent delete (for optional references like manager)
managerId: integer('manager_id').references((): AnyPgColumn => employees.id, { onDelete: 'set null' }),

// Restrict — don't delete parent while children exist (use sparingly)
orgId: integer('org_id').notNull().references(() => organizations.id, { onDelete: 'restrict' }),
```

### JSON String Columns
Use `text` with a comment when storing JSON:
```typescript
settings: text('settings'), // JSON string: { ... }
workDays: text('work_days'), // JSON array: ["monday", "tuesday"]
```

### Indexes
Add `index()` or `uniqueIndex()` inside the third argument of `pgTable` for frequently queried columns:
```typescript
export const authSessions = pgTable('session', { ... },
  (table) => [index('session_user_id_idx').on(table.userId)]
);
```

### Drizzle Kit Config
- Schema glob: `./src/models/*.schema.ts` (all `.schema.ts` files are auto-picked)
- Output: `./drizzle/`
- After any model change: `npm run db:generate` → `npm run db:migrate`

---

## 3. Better Auth Integration Rules

- Better Auth is mounted at `/api/auth/*splat` using `toNodeHandler(auth)`.
- **This handler MUST be registered before all Express body parsers** (`express.json()`, `cookieParser()`). Already done in `app.ts` — do not reorder middleware.
- Email/password is **disabled** (`emailAndPassword.enabled: false`). Never re-enable.
- Phone OTP uses MSG91. Numbers must be E.164 (`+919876543210`).
- Auth tables (`user`, `session`, `account`, `verification`) are **separate** from the app `users` table. Do not join them in application queries.
- Mapping flow: Better Auth signs in → creates `authUsers` row → app code must create/find a matching `users` row and link by `authUsers.id` (integration step not yet implemented).

---

## 4. Adding a New Feature — Step-by-Step

### Step 1 — Types
Create `backend/src/types/<feature>.types.ts`:
- `Create<Feature>Dto` interface (input)
- `<Feature>ResponseDto` interface (output, no sensitive fields)
- Any other domain-specific interfaces

### Step 2 — Schema
Create `backend/src/models/<feature>.schema.ts`:
- Define with `pgTable`, following column conventions above
- Export `export type <Feature>Select = typeof table.$inferSelect;`
- Export `export type <Feature>Insert = typeof table.$inferInsert;`
- Re-export both from `backend/src/models/index.ts`

### Step 3 — Migration
```bash
cd backend
npm run db:generate   # generates SQL in ./drizzle/
npm run db:migrate    # applies to DB
```

### Step 4 — Repository
Create `backend/src/repository/<feature>.repository.ts`:
- Class with `constructor(private db: DrizzleDB) {}`
- Implement: `findById`, `findBy<X>`, `create`, `update`, `delete`, `list` as needed
- Return `T | null` for single-row lookups; `T[]` for lists
- Use `.returning()` on all inserts and updates

### Step 5 — Service
Create `backend/src/services/<feature>.service.ts`:
- Class with `constructor(private <feature>Repository: <Feature>Repository) {}`
- Encapsulate domain logic; never call `db` directly
- `private readonly` constants for magic values
- Throw `new Error('message')` on business rule violations
- Return `<Feature>ResponseDto`, not raw `<Feature>Select`

### Step 6 — Controller
Create `backend/src/controllers/<feature>.controller.ts`:
- Class with `constructor(private <feature>Service: <Feature>Service) {}`
- All handler methods are **arrow function class properties**
- Define Zod schemas at module scope, above the class
- Parse with `schema.parse(req.body)` — ZodError auto-handled by error middleware
- Always `next(error)` in catch blocks; never call `res.status(500)` manually

### Step 7 — Routes
Create `backend/src/routes/<feature>.routes.ts`:
- Named export: `export const create<Feature>Routes = (controller: <Feature>Controller): Router => { ... }`
- Pure router wiring; no logic

### Step 8 — Factory
Create `backend/src/factories/<feature>.factory.ts`:
```typescript
import type { DrizzleDB } from '../config/database.js';
import { <Feature>Repository } from '../repository/<feature>.repository.js';
import { <Feature>Service }    from '../services/<feature>.service.js';
import { <Feature>Controller } from '../controllers/<feature>.controller.js';
import { create<Feature>Routes as setup<Feature>Routes } from '../routes/<feature>.routes.js';

export const create<Feature>Routes = (db: DrizzleDB) => {
  const repo       = new <Feature>Repository(db);
  const service    = new <Feature>Service(repo);
  const controller = new <Feature>Controller(service);
  return setup<Feature>Routes(controller);
};
```
Re-export from `backend/src/factories/index.ts`.

### Step 9 — Mount
In `backend/src/routes/api.routes.ts`:
```typescript
import { create<Feature>Routes } from '../factories/index.js';
// ...
mobile.use('/<feature>s', create<Feature>Routes(db));
web.use('/<feature>s',    create<Feature>Routes(db));
```
Pass the `db` instance — call `import { db } from '../config/database.js'` at the top of `api.routes.ts` if not already imported.

---

## 5. Global Backend Conventions

| Rule | Detail |
|------|--------|
| **ESM extensions** | All relative imports end in `.js` even for `.ts` source files |
| **Named exports only** | No `export default` from any backend file |
| **No `console.*`** | Use `import { logger } from '../utils/logger.js'` everywhere |
| **Pino structured logs** | `logger.info(...)`, `logger.error({ error }, 'message')` |
| **Zod v4** | `zod@^4` — use `z.string().date()` not `z.coerce.date()` for date strings |
| **`updatedAt` on update** | Always set `updatedAt: new Date()` in repository `.set({})` |
| **`.returning()`** | All `insert` and `update` calls use `.returning()` |
| **Drizzle query builder** | Prefer type-safe builder over `sql\`\`` tagged template |
| **`DrizzleDB` type** | Import as `import type { DrizzleDB } from '../config/database.js'` |
| **No `any`** | Use `unknown` and type-narrow; never `as any` |
| **Private sensitive fields** | Never return `password` or auth tokens in API responses |

---

## 6. Running the Backend

```bash
cd backend
npm run dev          # tsx src/app.ts (single run)
npm run dev:watch    # nodemon + tsx (hot reload)
npm run build        # tsc → dist/
npm start            # node dist/app.js
npm run db:generate  # drizzle-kit generate
npm run db:migrate   # drizzle-kit migrate
npx drizzle-kit studio  # DB browser
```

Required `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Backend public URL (`http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Min 32-char random string |
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `FRONTEND_URL` | CORS allowed origin (`http://localhost:3001`) |
| `MSG91_AUTH_KEY` | MSG91 SMS OTP |
| `MSG91_OTP_TEMPLATE_ID` | MSG91 OTP template |

---

## 7. Running the Frontend

```bash
cd frontend
npm run dev    # Next.js on http://localhost:3001
npm run build  # Production bundle
npm run lint   # ESLint
```

`.env.local` (copy from `.env.example`):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` |

> Before writing any Next.js code, read `frontend/node_modules/next/dist/docs/`
> — this is Next.js 16, APIs may differ from your training data.
