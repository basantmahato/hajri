# Hajri Backend API

## Architecture

This project follows a **layered architecture with manual dependency injection**:

```
src/
├── app.ts                 # Express app setup and middleware
├── config/
│   ├── database.ts        # Drizzle database connection
│   └── schema.ts          # Database schema definitions
├── types/
│   └── user.types.ts      # TypeScript interfaces and DTOs
├── repository/
│   └── user.repository.ts # Data access layer (class-based)
├── services/
│   └── auth.service.ts    # Business logic layer (class-based)
├── controllers/
│   └── auth.controller.ts # Request handling layer (class-based)
├── routes/
│   └── auth.routes.ts     # Route definitions (functional)
├── middleware/
│   └── error.middleware.ts # Express middleware
├── factories/
│   └── index.ts           # Dependency injection wiring
└── utils/
    └── logger.ts          # Utility functions
```

## Layer Responsibilities

### 1. Routes Layer
- Pure route definitions
- Maps HTTP methods to controllers
- No business logic

### 2. Controllers Layer
- Request/response handling
- Input validation with Zod
- Delegates to services
- Error handling

### 3. Services Layer
- Business logic and orchestration
- Uses repositories for data access
- Can have dependencies injected via constructor

### 4. Repository Layer
- Database operations with Drizzle
- Encapsulates data access logic
- Easy to mock for testing

### 5. Factories
- Wire dependencies together
- Manual dependency injection
- No DI container needed

## Benefits

- **Clear separation of concerns** - Easy to find and modify code
- **Testable** - Each layer can be tested independently
- **Maintainable** - Structure scales well as project grows
- **Type-safe** - TypeScript interfaces throughout
- **Simple** - No heavy frameworks or magic

## Adding New Features

1. Define types in `types/`
2. Create schema in `config/schema.ts`
3. Create repository in `repository/`
4. Create service in `services/`
5. Create controller in `controllers/`
6. Create routes in `routes/`
7. Wire everything in `factories/index.ts`
8. Mount routes in `app.ts`

## Database Migrations

```bash
# Generate migration
npx drizzle-kit generate

# Run migration
npx drizzle-kit migrate

# Open Drizzle Studio
npx drizzle-kit studio
```

## Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run with watch
npm run dev:watch

# Build
npm run build

# Start production
npm start
```

## Google and phone sign-in

The backend exposes Better Auth at `/api/auth/*`; Google and phone-number OTP
sign-in are enabled, and email/password authentication is disabled. The previous
`/api/v1/auth/register` and `/api/v1/auth/login` endpoints are no longer mounted.

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `BETTER_AUTH_URL`,
   `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
   `FRONTEND_URL`. For phone OTP, also set `MSG91_AUTH_KEY` and
   `MSG91_OTP_TEMPLATE_ID`. Generate a Better Auth secret with
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
2. In Google Cloud Console, add
   `${BETTER_AUTH_URL}/api/auth/callback/google` as an authorized redirect URI.
   For the default local URL, this is
   `http://localhost:3000/api/auth/callback/google`.
3. In MSG91, create and approve an OTP template containing the OTP placeholder,
   then copy its Auth Key and template ID into `.env`. For Indian SMS delivery,
   complete MSG91's sender ID and DLT/template registration requirements.
4. Apply the Better Auth and phone-number migrations:

   ```bash
   npm run db:migrate
   ```

The Better Auth identity tables (`user`, `session`, `account`, and
`verification`) are separate from the application's existing `users` table;
mapping Google identities to application users and roles remains an application
integration step. Phone OTP sign-up creates a Better Auth user with a generated
placeholder email; connect that identity to an application user before relying
on app-specific roles or employee records.

Auth rate limiting uses Express's resolved client IP. If the backend is deployed
behind a reverse proxy, configure Express to trust only the actual proxy hops.
