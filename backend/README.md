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
