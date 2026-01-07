# Sentinel - Architecture & Implementation Guide

## Project Overview

Sentinel is a full-stack financial intelligence engine built with Next.js 15, Prisma, PostgreSQL, Redis, and BullMQ. It automatically categorizes financial transactions using OpenAI's GPT-4o-mini model and triggers alerts when users exceed spending thresholds.

## Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   API Layer                             │
│  (Route Handlers - /api/*)                              │
│  - Request validation                                   │
│  - Response formatting                                  │
│  - Error handling                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Service Layer                          │
│  (Business Logic)                                       │
│  - TransactionService                                  │
│  - AlertService                                        │
│  - AIService                                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Repository & Data Layer                    │
│  - TransactionRepository                               │
│  - AlertRuleRepository                                 │
│  - Prisma ORM                                          │
│  - PostgreSQL Database                                 │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. AI Classification Service (`src/services/ai.service.ts`)

**Purpose**: Classify transaction descriptions into predefined categories using OpenAI API.

**Key Features**:

- Uses GPT-4o-mini model for cost efficiency
- System prompt restricts responses to 5 categories: Food, Transport, Utilities, Entertainment, Shopping
- Returns confidence score (0-1) with each classification
- Fallback mechanism for API failures

**Method**: `classifyTransaction(description: string)`

```typescript
Input: "Starbucks coffee"
Output: { category: "Food", confidence: 0.95 }
```

**System Prompt**:

```
You are a financial transaction classifier. Classify transactions into:
- Food, Transport, Utilities, Entertainment, Shopping

Respond with ONLY JSON: {"category": "Category Name", "confidence": 0.95}
```

### 2. Transaction Service (`src/services/transaction.service.ts`)

**Responsibilities**:

1. Orchestrate transaction creation
2. Call AI service for classification
3. Save to database via repository
4. Queue background job for alert checking
5. Provide transaction queries and analytics

**Key Methods**:

- `createTransaction()` - Create + classify + enqueue alert job
- `getUserTransactions()` - Get all user transactions
- `getTransactionsByCategory()` - Filter by category
- `getSpendingSummary()` - Aggregate spending by category
- `deleteTransaction()` - Remove transaction with auth check

### 3. Alert Service (`src/services/alert.service.ts`)

**Responsibilities**:

1. Manage alert rules (CRUD operations)
2. Check if spending exceeds thresholds
3. Trigger alert events
4. Log alerts for notification systems

**Key Methods**:

- `createAlertRule()` - Create spending threshold alert
- `checkAndTriggerAlert()` - Check if threshold exceeded (called by worker)
- `updateAlertRule()` - Update threshold or active status
- `toggleAlertRule()` - Enable/disable alert

**Alert Logic**:

```
1. Get alert rule for (userId, category)
2. Calculate total spent: SUM(transactions.amount) WHERE category
3. If totalSpent > threshold:
   - Create AlertEvent
   - Log/store alert (ready for Telegram/Email)
   - Return alert
```

### 4. Background Worker (`src/workers/alert.worker.ts`)

**Purpose**: Process background jobs asynchronously using BullMQ.

**Setup**:

- Connects to Redis
- Listens for "new-transaction" jobs
- Processes up to 5 jobs concurrently
- Implements retry logic (3 attempts, exponential backoff)

**Job Processing**:

```
Job Received: {
  userId: "user-123",
  transactionId: "tx-456",
  category: "Food",
  amount: 25.50
}
        ↓
Call AlertService.checkAndTriggerAlert()
        ↓
If threshold exceeded:
  - Log alert event
  - Ready for notification integration
  - Return: { alertTriggered: true, message: "..." }
        ↓
Complete job (or fail with retry)
```

**Running the Worker**:

```bash
npm run worker
# In production:
# pm2 start npm --name sentinel-worker -- run worker
```

### 5. Repository Pattern

**TransactionRepository** (`src/repositories/transaction.repository.ts`):

- Static methods for data access
- Handles all Prisma queries for transactions
- Provides: create, find, findByCategory, getTotalByCategory, delete

**AlertRuleRepository** (`src/repositories/alert-rule.repository.ts`):

- Static methods for alert rule data access
- Handles CRUD + queries for alert rules
- Provides: create, findByUserId, findByUserAndCategory, update, delete

**Benefits**:

- Centralized database logic
- Easier to mock for testing
- Single point of change for query modifications
- Cleaner service layer code

### 6. API Response Wrapper (`src/lib/api-response.ts`)

**Standardized Response Format**:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  message?: string;
}
```

**Success Response**:

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "statusCode": 200,
  "message": "Transaction created successfully"
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 400
}
```

**Helper Functions**:

- `successResponse<T>()` - Create success response
- `errorResponse()` - Create error response
- `toHttpResponse()` - Convert to HTTP Response
- `withErrorHandling()` - Wrap route handler with global error catch

## Data Flow: Creating a Transaction

```
1. POST /api/transactions
   ├─ Body: { userId, description, amount }
   ├─ Validate input
   │
2. TransactionService.createTransaction()
   ├─ Call AIService.classifyTransaction()
   │  └─ → OpenAI API → { category, confidence }
   │
   ├─ TransactionRepository.create()
   │  └─ → Prisma → PostgreSQL
   │  └─ → Save with category & confidence
   │
   ├─ alertQueue.add("new-transaction")
   │  └─ → Redis queue
   │
3. Return Response
   ├─ 201 Created
   └─ { id, userId, description, amount, category, confidence, ... }

4. Background: Alert Worker picks up job
   ├─ Read job: { userId, category, ... }
   │
   ├─ AlertService.checkAndTriggerAlert()
   │  ├─ Get alert rule for (userId, category)
   │  ├─ Calculate totalSpent
   │  ├─ If totalSpent > threshold:
   │  │  └─ Log AlertEvent (ready for Telegram/Email)
   │  └─ Return result
   │
   └─ Complete job
```

## Data Flow: Creating an Alert Rule

```
1. POST /api/alert-rules
   ├─ Body: { userId, category, threshold }
   ├─ Validate input
   │  └─ Check category in AIService.getAllowedCategories()
   │
2. AlertService.createAlertRule()
   ├─ AlertRuleRepository.create()
   │  └─ → Prisma → PostgreSQL
   │     INSERT INTO alert_rules (userId, category, threshold, isActive)
   │     Unique constraint: (userId, category)
   │
3. Return Response
   ├─ 201 Created
   └─ { id, userId, category, threshold, isActive: true, ... }
```

## Error Handling Strategy

**Try-Catch Wrapper**:

```typescript
static async createTransaction(data: TransactionInput) {
  try {
    // Business logic
  } catch (error) {
    console.error("[TransactionService.createTransaction] Error:", error);
    throw error; // Let route handler catch
  }
}
```

**Route Handler Error Handling**:

```typescript
export async function POST(request: NextRequest) {
  try {
    // Call service
    const result = await TransactionService.createTransaction(data);
    return toHttpResponse(successResponse(result, 201));
  } catch (error) {
    const response = errorResponse(
      error instanceof Error ? error.message : "Internal error",
      500
    );
    return toHttpResponse(response);
  }
}
```

**Benefits**:

- Proper error logging with context
- Consistent error responses
- HTTP status codes reflect actual errors
- Stack traces for debugging

## Database Schema Highlights

### Indexes for Performance

```sql
-- Fast transaction queries by user
CREATE INDEX transactions_user_id ON transactions(user_id);

-- Fast category filtering
CREATE INDEX transactions_category ON transactions(category);

-- Unique constraint for alert rules
ALTER TABLE alert_rules ADD CONSTRAINT alert_rules_user_category_key
  UNIQUE(user_id, category);
```

### Cascade Delete

```sql
-- When user is deleted, cascade to transactions and alert_rules
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

## Configuration & Environment

**Key Environment Variables**:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sentinel"
OPENAI_API_KEY="sk-..."
REDIS_HOST="localhost"
REDIS_PORT="6379"
NODE_ENV="development"
```

**Development Setup**:

```bash
# Terminal 1: Next.js Dev Server
npm run dev
# Watches src/ for changes, hot reload on localhost:3000

# Terminal 2: BullMQ Worker
npm run worker
# Uses tsx to watch & reload TypeScript worker

# Terminal 3 (Optional): Database
# docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
```

## Testing Strategy (Future)

```typescript
// Mock repositories
jest.mock('@/repositories/transaction.repository');

// Mock AI service
jest.mock('@/services/ai.service');

// Test service logic in isolation
describe('TransactionService', () => {
  it('should classify and save transaction', async () => {
    TransactionRepository.create = jest.fn().mockResolvedValue({...});
    AIService.classifyTransaction = jest.fn()
      .mockResolvedValue({ category: 'Food', confidence: 0.95 });

    const result = await TransactionService.createTransaction({...});
    expect(result.category).toBe('Food');
  });
});
```

## Performance Considerations

1. **Query Optimization**:

   - Use indexes on frequently filtered columns
   - Aggregate queries for spending summaries
   - Avoid N+1 queries

2. **Queue Performance**:

   - Concurrency: 5 jobs per worker
   - Retry backoff: exponential (2s base)
   - Remove completed jobs to save memory

3. **AI API Caching**:

   - Consider caching common descriptions
   - Batch requests if possible
   - Monitor token usage

4. **Database Connection**:
   - Singleton pattern prevents multiple connections
   - Connection pooling via Prisma

## Future Enhancements

1. **Notification System**:

   - Telegram bot integration
   - Email alerts via SendGrid/Mailgun
   - SMS alerts via Twilio

2. **UI Dashboard**:

   - Shadcn/UI components
   - Charts with recharts
   - Real-time updates via WebSockets

3. **Advanced Features**:

   - Recurring alert rules
   - Budget forecasting with ML
   - Transaction categorization override
   - Multi-currency support
   - Custom categories per user

4. **Scalability**:
   - Microservices: AI service separate
   - Database replication
   - Multiple worker instances
   - Message queue redundancy

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Migrate database: `npm run prisma:migrate -- --skip-generate`
- [ ] Build: `npm run build`
- [ ] Start app: `npm start`
- [ ] Start worker (separate process): `npm run worker`
- [ ] Monitor logs and errors
- [ ] Set up Sentry/error tracking
- [ ] Configure Redis persistence
- [ ] Database backups scheduled

## Troubleshooting

**Worker not processing jobs**:

1. Check Redis is running: `redis-cli ping`
2. Verify REDIS_HOST/PORT in .env.local
3. Check worker logs for connection errors
4. Ensure alertQueue is being imported in transaction.service.ts

**Database connection errors**:

1. Verify DATABASE_URL is correct
2. Check PostgreSQL is running
3. Confirm database exists
4. Run migrations: `npm run prisma:migrate`

**AI classification not working**:

1. Check OPENAI_API_KEY is set
2. Verify API key has access to gpt-4o-mini
3. Check OpenAI API quota/rate limits
4. Look at console logs for API errors

**Build errors**:

1. Check TypeScript errors: `npx tsc --noEmit`
2. Clear .next folder: `rm -rf .next`
3. Reinstall dependencies: `npm install`
4. Check Node version: `node -v` (should be 18+)
