# Sentinel Project - Development Guidelines

## Project Summary

Sentinel is a production-ready Next.js 15 financial intelligence engine featuring:
- **AI Classification**: GPT-4o-mini for automatic transaction categorization
- **Background Jobs**: BullMQ + Redis for alert processing
- **Clean Architecture**: Service-Repository pattern for testability
- **Type Safety**: Full TypeScript with strict configuration
- **REST API**: Standardized responses with error handling

## Project Status

✅ **Completed Tasks**:
1. ✅ Project initialization with Next.js 15 App Router
2. ✅ Database schema (Prisma with PostgreSQL)
3. ✅ API response wrapper for standardized responses
4. ✅ Service-Repository pattern architecture
5. ✅ AI classification service (OpenAI GPT-4o-mini)
6. ✅ Transaction CRUD operations
7. ✅ Alert rule management
8. ✅ BullMQ worker setup
9. ✅ Redis queue configuration
10. ✅ Comprehensive documentation (README, ARCHITECTURE, QUICKSTART)

## Technology Stack

- Next.js 16.1.1 (App Router, TypeScript)
- Prisma 6.1.0 (ORM)
- PostgreSQL (Database)
- Redis 5.10.0 (Message broker)
- BullMQ 5.66.4 (Job queue)
- OpenAI SDK (AI classification)
- Tailwind CSS 4 (Styling)
- Shadcn UI (Components)

## Directory Structure

```
sentinel/
├── .github/                          # GitHub/Copilot configs
├── .next/                            # Build output
├── node_modules/                     # Dependencies
├── prisma/
│   └── schema.prisma                 # Database models
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── alert-rules/          # Alert rule endpoints
│   │   │   ├── transactions/         # Transaction endpoints
│   │   │   └── spending/             # Spending analytics
│   │   └── layout.tsx, page.tsx      # UI pages
│   ├── lib/
│   │   ├── api-response.ts           # Response wrapper
│   │   └── prisma.ts                 # Prisma singleton
│   ├── services/
│   │   ├── ai.service.ts             # OpenAI integration
│   │   ├── transaction.service.ts    # Transaction logic
│   │   ├── alert.service.ts          # Alert logic
│   │   └── queue.service.ts          # BullMQ queue
│   ├── repositories/
│   │   ├── transaction.repository.ts # Data access layer
│   │   └── alert-rule.repository.ts  # Data access layer
│   ├── workers/
│   │   └── alert.worker.ts           # Background worker
│   ├── types/
│   │   └── index.ts                  # Type definitions
│   └── worker.ts                     # Worker entry point
├── .env.local                        # Environment config
├── .eslintrc.json                    # ESLint rules
├── .gitignore                        # Git ignore
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
├── tailwind.config.js                # Tailwind config
├── postcss.config.js                 # PostCSS config
├── README.md                         # API reference
├── ARCHITECTURE.md                   # Technical documentation
├── QUICKSTART.md                     # Getting started
└── copilot-instructions.md           # This file
```

## Key Implementation Details

### API Response Format

All endpoints return a standardized format:
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  message?: string;
}
```

### Service Layer Pattern

Services contain business logic and coordinate between repositories and external services:
```typescript
class TransactionService {
  static async createTransaction(data: TransactionInput) {
    // 1. Call AI service for classification
    // 2. Save via repository
    // 3. Queue background job
    // 4. Return result
  }
}
```

### Repository Pattern

Repositories abstract database access:
```typescript
class TransactionRepository {
  static async create(data) { /* Prisma.create */ }
  static async findByUserId(userId) { /* Prisma.findMany */ }
  // ... other methods
}
```

### Background Jobs

Jobs are queued immediately when transactions are created:
```typescript
await alertQueue.add("new-transaction", {
  userId, transactionId, category, amount
});

// Worker processes asynchronously:
// 1. Gets alert rule for user+category
// 2. Calculates total spending
// 3. Triggers alert if threshold exceeded
```

## Environment Variables

Create `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sentinel"
OPENAI_API_KEY="sk-..."
REDIS_HOST="localhost"
REDIS_PORT="6379"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Running the Project

### Development
```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Background worker
npm run worker

# Terminal 3: Redis (if needed)
redis-server
```

### Production
```bash
npm run build
npm start            # App server
npm run worker       # Worker process (separate)
```

## Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Seed database (if needed)
npx prisma db seed
```

## API Endpoints

### Transactions
- `POST /api/transactions` - Create (with AI classification)
- `GET /api/transactions?userId=<id>&category=<optional>` - List
- `DELETE /api/transactions/:id` - Delete

### Alert Rules
- `POST /api/alert-rules` - Create
- `GET /api/alert-rules?userId=<id>` - List
- `PATCH /api/alert-rules/:id` - Update
- `DELETE /api/alert-rules/:id` - Delete

### Analytics
- `GET /api/spending?userId=<id>` - Spending summary

## Development Workflow

### Adding a Feature

1. **Update Database Schema** (`prisma/schema.prisma`)
   ```bash
   npx prisma migrate dev --name feature_name
   ```

2. **Create Repository** (if new entity)
   ```typescript
   // src/repositories/new.repository.ts
   export class NewRepository {
     static async create(data) { /* ... */ }
   }
   ```

3. **Create Service** (business logic)
   ```typescript
   // src/services/new.service.ts
   export class NewService {
     static async doSomething() {
       // Use repositories
     }
   }
   ```

4. **Create API Route**
   ```typescript
   // src/app/api/new/route.ts
   export async function POST(request: NextRequest) {
     // Call service, return response
   }
   ```

5. **Test with cURL or Postman**

### Testing

Currently no test suite configured. To add:
```bash
npm install --save-dev jest @testing-library/react ts-jest
npx jest --init
```

## Performance Optimization

### Current
- Prisma singleton with connection pooling
- Database indexes on userId and category
- BullMQ worker concurrency: 5 jobs
- Exponential backoff for retries
- Fallback for AI failures

### Future Improvements
- Add Redis caching for frequently classified descriptions
- Implement database query caching
- Add request rate limiting
- Monitor and optimize slow queries
- Add database replication for read scaling

## Error Handling

All services implement try/catch with logging:
```typescript
static async method() {
  try {
    // Business logic
  } catch (error) {
    console.error("[Service.method] Error:", error);
    throw error; // Let caller handle
  }
}
```

Route handlers catch and format errors:
```typescript
try {
  const result = await Service.method();
  return toHttpResponse(successResponse(result));
} catch (error) {
  return toHttpResponse(errorResponse(error, 500));
}
```

## Deployment

### Vercel (Recommended for Next.js)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy with `npm run build`
5. Run worker separately (e.g., Render, Railway)

### Self-Hosted
1. Use PM2 for process management
2. Nginx as reverse proxy
3. PostgreSQL with backups
4. Redis with persistence
5. Monitoring with Sentry/New Relic

## Maintenance & Monitoring

### Logs to Monitor
- `[API Route]` - HTTP request logs
- `[Service]` - Business logic errors
- `[Alert Worker]` - Job processing
- `[Alert Queue]` - Queue errors

### Key Metrics
- Transaction creation latency (should be <1s)
- Worker job success rate (target >99%)
- Database query performance
- OpenAI API response time
- Redis queue depth

## Documentation

- **README.md** - API reference and setup
- **ARCHITECTURE.md** - Detailed technical architecture
- **QUICKSTART.md** - Getting started guide
- **Code Comments** - Implementation details in source files

## Resume Points

This project demonstrates:
- Full-stack Node.js/React development
- Service-Repository architectural pattern
- Type-safe TypeScript development
- Message queue / background job processing
- Third-party API integration
- Database design and optimization
- REST API design best practices
- Error handling and logging
- Production-ready code structure

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run worker          # Start background worker
npm run build           # Production build
npm start               # Run production build

# Database
npm run prisma:generate # Generate Prisma Client
npm run prisma:migrate  # Run migrations

# Code Quality
npm run lint            # Run ESLint
npm run lint --fix      # Fix linting issues

# Cleanup
rm -rf .next node_modules # Full reset
npm install              # Reinstall deps
npm ci                   # Clean install (CI/CD)
```

## Known Limitations & TODOs

- [ ] Authentication not implemented (use NextAuth v5)
- [ ] UI dashboard not built (add Shadcn components)
- [ ] Notification system placeholder only
- [ ] No test coverage (add Jest + RTL)
- [ ] No rate limiting
- [ ] No request validation middleware
- [ ] Transaction categorization override not implemented
- [ ] No audit logging

## Getting Help

1. Check the relevant documentation file
2. Look at similar implementation in other services
3. Review error logs with `[Service.method]` prefix
4. Check Git history for previous patterns
5. Run type checking: `npx tsc --noEmit`

## Version History

- **v0.1.0** (Jan 6, 2025) - Initial project structure, core services, APIs, and worker setup
