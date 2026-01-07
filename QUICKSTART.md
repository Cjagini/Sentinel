# Sentinel - Quick Start Guide

### 1. Start Services (3 Terminal Windows)

**Terminal 1 - Next.js Dev Server**:

```bash
npm run dev
# Open http://localhost:3000
```

**Terminal 2 - BullMQ Worker**:

```bash
npm run worker
```

**Terminal 3 - Redis** (if not running):

```bash
redis-server
# Or with Docker: docker run -d -p 6379:6379 redis:7
```

## Testing the API

### Create a Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "description": "Starbucks coffee at downtown",
    "amount": 5.50
  }'
```

**Expected Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "cljxyz...",
    "userId": "user-123",
    "description": "Starbucks coffee at downtown",
    "amount": 5.5,
    "category": "Food",
    "confidence": 0.98,
    "createdAt": "2025-01-06T22:45:00.000Z",
    "updatedAt": "2025-01-06T22:45:00.000Z"
  },
  "statusCode": 201,
  "message": "Transaction created successfully"
}
```

### Create an Alert Rule

```bash
curl -X POST http://localhost:3000/api/alert-rules \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "category": "Food",
    "threshold": 500
  }'
```

**Expected Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "alert-789...",
    "userId": "user-123",
    "category": "Food",
    "threshold": 500,
    "isActive": true,
    "createdAt": "2025-01-06T22:45:00.000Z",
    "updatedAt": "2025-01-06T22:45:00.000Z"
  },
  "statusCode": 201
}
```

### Get Spending Summary

```bash
curl http://localhost:3000/api/spending?userId=user-123
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "Food": 5.5,
    "Transport": 0,
    "Utilities": 0,
    "Entertainment": 0,
    "Shopping": 0
  },
  "statusCode": 200,
  "message": "Spending summary retrieved successfully"
}
```

### Get All Transactions

```bash
curl "http://localhost:3000/api/transactions?userId=user-123"
```

### Get Transactions by Category

```bash
curl "http://localhost:3000/api/transactions?userId=user-123&category=Food"
```

### Update Alert Rule

```bash
curl -X PATCH http://localhost:3000/api/alert-rules/alert-789 \
  -H "Content-Type: application/json" \
  -d '{
    "threshold": 600,
    "isActive": true
  }'
```

### Delete Alert Rule

```bash
curl -X DELETE http://localhost:3000/api/alert-rules/alert-789
```

## Understanding the Flow

### When You Create a Transaction:

1. **API Receives Request** → Validates input
2. **AI Classification** → OpenAI categorizes the transaction
3. **Database Save** → Transaction stored with category
4. **Queue Job** → "new-transaction" job added to Redis
5. **Background Worker** → Picks up job, checks alert rules
6. **Alert Triggered** → If spending > threshold, alert logged
7. **Response Returned** → You get the classified transaction

All within ~2 seconds!

## Key Files

| File                                  | Purpose                    |
| ------------------------------------- | -------------------------- |
| `src/services/ai.service.ts`          | OpenAI classification      |
| `src/services/transaction.service.ts` | Transaction business logic |
| `src/services/alert.service.ts`       | Alert rule logic           |
| `src/services/queue.service.ts`       | BullMQ queue setup         |
| `src/repositories/`                   | Database access layer      |
| `src/app/api/transactions/route.ts`   | Transaction endpoints      |
| `src/app/api/alert-rules/route.ts`    | Alert rule endpoints       |
| `src/workers/alert.worker.ts`         | Background job processor   |
| `prisma/schema.prisma`                | Database schema            |

## Project Structure Created

```
sentinel/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── alert-rules/          ✓ POST/GET rules
│   │       ├── alert-rules/[id]/     ✓ PATCH/DELETE rule
│   │       ├── transactions/         ✓ POST/GET transactions
│   │       └── spending/             ✓ GET summary
│   ├── lib/
│   │   ├── api-response.ts          ✓ Response wrapper
│   │   └── prisma.ts                ✓ DB client
│   ├── services/
│   │   ├── ai.service.ts            ✓ GPT-4o-mini classification
│   │   ├── transaction.service.ts   ✓ Transaction logic
│   │   ├── alert.service.ts         ✓ Alert logic
│   │   └── queue.service.ts         ✓ BullMQ queue
│   ├── repositories/
│   │   ├── transaction.repository.ts ✓ Transaction data access
│   │   └── alert-rule.repository.ts  ✓ Alert rule data access
│   ├── workers/
│   │   └── alert.worker.ts          ✓ BullMQ worker
│   └── types/
│       └── index.ts                 ✓ Type definitions
├── prisma/
│   └── schema.prisma                ✓ Database models
├── .env.local                       ✓ Configuration
├── package.json                     ✓ Dependencies
└── README.md, ARCHITECTURE.md       ✓ Documentation
```

## Common Issues & Solutions

**"Cannot find module '@/services/...'"**

- Ensure TypeScript path alias is correct in `tsconfig.json`
- Run: `npm run build` to check

**"Error: connect ECONNREFUSED 127.0.0.1:6379"**

- Redis not running
- Start: `redis-server` or `docker run -d -p 6379:6379 redis:7`

**"PrismaClientInitializationError"**

- DATABASE_URL not set correctly
- Verify: `echo $DATABASE_URL`
- Check PostgreSQL is running

**"No response from OpenAI API"**

- OPENAI_API_KEY not set or invalid
- Check API key: `echo $OPENAI_API_KEY`
- Verify at https://platform.openai.com/api-keys

**Build fails with TypeScript errors**

- Clear cache: `rm -rf .next node_modules/.prisma`
- Reinstall: `npm install`
- Generate Prisma: `npx prisma generate`

## Get Help

- Check `ARCHITECTURE.md` for detailed technical documentation
- Review individual service files for implementation details
- See `README.md` for full API reference
- Check route handlers in `src/app/api/*/` for endpoint examples
