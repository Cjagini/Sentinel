# 🚀 Complete Guide: How Sentinel Works & How to Deploy It

**For Recruiters & Learning Purposes**

---

## Part 1: What is Sentinel? (The Big Picture)

### Simple Explanation
Sentinel is a **financial intelligence engine** that:
1. **Listens for financial transactions** (e.g., "I spent $5 on coffee")
2. **Automatically categorizes them** using AI (e.g., "That's in the FOOD category")
3. **Tracks spending per category** (e.g., "You spent $200 on food this month")
4. **Alerts you when you overspend** (e.g., "You set a $100 limit for FOOD but spent $120")

### Real-World Analogy
Imagine a smart bookkeeper who:
- 📝 Records every transaction you tell them about
- 🤖 Instantly categorizes it using AI (no manual work)
- 📊 Tracks your spending by category
- 🚨 Alerts you when you exceed budget limits

---

## Part 2: Technology Stack Explained (In Simple Terms)

### What is Each Technology?

#### **Next.js 16** (The Web Server)
- **What it is**: A framework that runs your web application
- **What it does**: Handles when users visit your website, makes pages load fast, and responds to API requests
- **Real world**: Like the structure of a restaurant - it handles customers coming in, taking orders, and serving them

#### **React 19** (The User Interface)
- **What it is**: A library for building interactive web pages
- **What it does**: Creates buttons, forms, and pages that respond to user clicks
- **Real world**: Like the menu and interface of a restaurant - what customers see and interact with

#### **TypeScript** (Smart JavaScript)
- **What it is**: A version of JavaScript with type checking
- **What it does**: Catches bugs before you run the code (like spell check in Word)
- **Why it's good**: Prevents bugs like "trying to add a number to text"
- **Real world**: Like having a grammar checker that catches mistakes before you send an email

#### **PostgreSQL** (The Database)
- **What it is**: A database that stores data permanently
- **What it does**: Saves user data, transactions, and alert rules to disk
- **Real world**: Like the filing system of a bank - where all customer records are stored
- **In Sentinel**: Stores:
  - Users
  - Transactions (every purchase)
  - Alert Rules (spending limits)
  - Categories (FOOD, TRANSPORT, etc.)

#### **Prisma** (Database Helper)
- **What it is**: A tool that talks to PostgreSQL in a safe way
- **What it does**: Converts your code into database queries without writing SQL
- **Real world**: Like a translator between your app and the database
- **Example**: Instead of writing: `SELECT * FROM users WHERE id = 1`
  You write: `prisma.user.findUnique({ where: { id: 1 } })`

#### **Redis** (The Message Queue)
- **What it is**: A super-fast memory storage system
- **What it does**: Stores jobs that need to be processed later
- **Real world**: Like a to-do list written on a whiteboard that workers read from
- **In Sentinel**: Holds "alert processing" jobs in a queue

#### **BullMQ** (Job Queue Manager)
- **What it is**: A system that manages background jobs
- **What it does**: Takes jobs from Redis queue and executes them one by one
- **Real world**: Like a manager who assigns tasks to workers to do them later
- **In Sentinel**: When a transaction is created, a job is added: "Check if this transaction exceeds any alert limits"

#### **OpenAI GPT-4o-mini** (The AI Brain)
- **What it is**: An AI model made by OpenAI
- **What it does**: Reads a transaction description and figures out the category
- **Real world**: Like having an expert who instantly knows what category any purchase belongs to
- **Example**: "Starbucks coffee" → AI says "FOOD category, 95% confident"

---

## Part 3: How Does the Application Actually Work? (Step by Step)

### The User Journey - Creating a Transaction

**User does this:**
```
User creates a transaction:
  UserID: "john123"
  Description: "Coffee at Starbucks"
  Amount: $5.50
```

**Step 1: User makes a POST request to the API**
- They hit the endpoint: `POST /api/transactions`
- They send JSON data (the transaction info)
- **Technology**: Next.js API Route listens for this request

**Step 2: API Route receives the request**
- File: `src/app/api/transactions/route.ts`
- **What happens**: The route handler checks if data is valid
  - Does it have userId? ✅
  - Does it have description? ✅
  - Is amount a positive number? ✅
- **If invalid**: Send error response back to user

**Step 3: Call the TransactionService**
- File: `src/services/transaction.service.ts`
- **What it does**: Main business logic coordinator
- **Next**: Call AI service to categorize

**Step 4: Call AI Service (OpenAI)**
- File: `src/services/ai.service.ts`
- **What happens**:
  ```
  Send to OpenAI: "Categorize this: 'Coffee at Starbucks'"
  OpenAI responds: {
    category: "FOOD",
    confidence: 0.95
  }
  ```
- **Why**: The AI "understands" that coffee from Starbucks is food
- **What if offline?**: Has fallback - returns UNCATEGORIZED

**Step 5: Save to Database**
- File: `src/repositories/transaction.repository.ts`
- **What happens**:
  ```
  Create record in PostgreSQL:
  {
    id: "auto-generated",
    userId: "john123",
    description: "Coffee at Starbucks",
    amount: 5.50,
    category: "FOOD",
    confidence: 0.95,
    createdAt: "2026-01-07T10:30:00Z"
  }
  ```
- **Technology**: Prisma translates this to a database INSERT query

**Step 6: Queue Background Job**
- File: `src/services/queue.service.ts`
- **What happens**: Add to Redis queue:
  ```
  {
    jobType: "new-transaction",
    data: {
      userId: "john123",
      transactionId: "xyz123",
      category: "FOOD",
      amount: 5.50
    }
  }
  ```
- **Why**: Don't want to block the user - process alerts later

**Step 7: Send Response Back to User**
- **What user gets**:
  ```json
  {
    "success": true,
    "data": {
      "id": "xyz123",
      "userId": "john123",
      "description": "Coffee at Starbucks",
      "amount": 5.50,
      "category": "FOOD",
      "confidence": 0.95,
      "createdAt": "2026-01-07T10:30:00Z"
    },
    "statusCode": 201
  }
  ```
- **How long**: ~500ms (includes AI call)

---

### Background: Processing Alerts (Happens Later)

**Meanwhile, in the background worker:**

**Worker Job Starts**
- File: `src/workers/alert.worker.ts`
- **When**: After transaction is created, worker picks up the job from queue
- **Technology**: BullMQ worker process

**Worker Steps:**

1. **Get the Alert Rule**
   ```
   Get rule for: userID="john123", category="FOOD"
   Database response: {
     threshold: $100,
     isActive: true
   }
   ```

2. **Calculate Total Spending**
   ```
   Query database for all FOOD transactions by john123:
   - Coffee: $5.50
   - Lunch: $15.00
   - Dinner: $30.00
   - Groceries: $45.00
   Total: $95.50
   ```

3. **Check Against Threshold**
   ```
   Total ($95.50) < Threshold ($100)?
   YES - No alert needed
   ```

4. **If Over Budget**
   If total was $105.50:
   ```
   Alert triggered!
   Send notification: "You've exceeded your FOOD budget of $100 (spent $105.50)"
   ```

---

## Part 4: The Code Structure Explained

### Folder Organization

```
src/
├── app/                              # Next.js App Router (Handles web requests)
│   ├── api/
│   │   ├── transactions/route.ts    # Endpoint: POST, GET /api/transactions
│   │   ├── alert-rules/route.ts     # Endpoint: POST, GET /api/alert-rules
│   │   └── spending/route.ts        # Endpoint: GET /api/spending
│   ├── page.tsx                     # Homepage (if you build UI)
│   └── layout.tsx                   # Common layout for all pages
│
├── services/                         # Business Logic (The "Brains")
│   ├── transaction.service.ts       # Handles transaction creation & logic
│   ├── alert.service.ts             # Handles alert rule logic
│   ├── ai.service.ts                # Calls OpenAI API
│   └── queue.service.ts             # Manages Redis job queue
│
├── repositories/                     # Database Access (Data Layer)
│   ├── transaction.repository.ts    # All database operations for transactions
│   └── alert-rule.repository.ts     # All database operations for alert rules
│
├── workers/                          # Background Jobs
│   └── alert.worker.ts              # Processes alert checking jobs
│
├── types/                            # TypeScript Type Definitions
│   └── index.ts                     # All interfaces & types
│
└── lib/                              # Utilities
    ├── api-response.ts              # Helper to format API responses
    └── prisma.ts                    # Database connection singleton
```

### What Each Layer Does

**API Routes Layer** (Receives requests)
```typescript
// src/app/api/transactions/route.ts
export async function POST(request: NextRequest) {
  // 1. Parse request body
  // 2. Validate input
  // 3. Call TransactionService
  // 4. Return response
}
```
- **Job**: Listen for HTTP requests, validate input, return responses
- **Like**: Restaurant's front desk - receives orders

**Service Layer** (Business Logic)
```typescript
// src/services/transaction.service.ts
export class TransactionService {
  static async createTransaction(data) {
    // 1. Call AI service to classify
    // 2. Call repository to save
    // 3. Call queue service to queue alert job
    // 4. Return result
  }
}
```
- **Job**: Coordinate different parts, implement business rules
- **Like**: Restaurant's kitchen manager - coordinates cooking, plating, delivery

**Repository Layer** (Database Access)
```typescript
// src/repositories/transaction.repository.ts
export class TransactionRepository {
  static async create(data) {
    return await prisma.transaction.create({ data });
  }
  
  static async findByUserId(userId) {
    return await prisma.transaction.findMany({ where: { userId } });
  }
}
```
- **Job**: ONLY talk to database, nothing else
- **Like**: Restaurant's inventory system - only records what's in stock

**Worker Layer** (Background Processing)
```typescript
// src/workers/alert.worker.ts
queue.process('new-transaction', async (job) => {
  // 1. Get alert rule
  // 2. Calculate spending
  // 3. Check if over budget
  // 4. Send alert if needed
});
```
- **Job**: Process background jobs, no user waiting
- **Like**: Restaurant's dishwasher - works independently

---

## Part 5: Data Flow Diagram (Visual)

### Creating a Transaction

```
User sends request
         ↓
POST /api/transactions
         ↓
API Route validates input
         ↓
✓ Valid? Call TransactionService
         ↓
TransactionService coordinates:
  ├→ AIService: "What category is this?"
  │   └→ OpenAI: "FOOD category, 95% confident"
  │       └→ Return {category, confidence}
  │
  ├→ TransactionRepository: "Save to database"
  │   └→ Prisma: Convert to SQL
  │       └→ PostgreSQL: Insert record
  │           └→ Return saved transaction
  │
  └→ QueueService: "Queue alert checking job"
      └→ BullMQ: Add to Redis queue
          └→ Return job ID
  
TransactionService returns result
         ↓
API Route formats response
         ↓
Response sent to user: {success: true, data: {...}}
         ↓
User gets instant response ✅

Meanwhile (Background):
BullMQ worker picks up job from queue
         ↓
AlertWorker runs:
  ├→ Get alert rule from database
  ├→ Calculate total spending
  ├→ Check against threshold
  └→ Send alert if needed (asynchronously)
```

---

## Part 6: Each API Endpoint Explained

### 1. CREATE TRANSACTION
```
POST /api/transactions
Request:
{
  "userId": "john123",
  "description": "Coffee at Starbucks",
  "amount": 5.50
}

What happens:
1. AI categorizes it → "FOOD"
2. Saves to database
3. Queues alert check
4. Returns transaction with category

Response:
{
  "success": true,
  "data": {
    "id": "xyz123",
    "userId": "john123",
    "description": "Coffee at Starbucks",
    "amount": 5.50,
    "category": "FOOD",
    "confidence": 0.95,
    "createdAt": "2026-01-07T10:30:00Z"
  },
  "statusCode": 201
}
```

### 2. GET TRANSACTIONS
```
GET /api/transactions?userId=john123&category=FOOD

What happens:
1. Query database for all transactions
2. Filter by userId and optional category
3. Return sorted by newest first

Response:
{
  "success": true,
  "data": [
    { id: "xyz1", category: "FOOD", amount: 5.50, ... },
    { id: "xyz2", category: "FOOD", amount: 15.00, ... },
    ...
  ],
  "statusCode": 200
}
```

### 3. CREATE ALERT RULE
```
POST /api/alert-rules
Request:
{
  "userId": "john123",
  "category": "FOOD",
  "threshold": 100
}

What happens:
1. Create rule in database
2. Rule is now active and monitoring

Response:
{
  "success": true,
  "data": {
    "id": "rule123",
    "userId": "john123",
    "category": "FOOD",
    "threshold": 100,
    "isActive": true
  },
  "statusCode": 201
}
```

### 4. GET ALERT RULES
```
GET /api/alert-rules?userId=john123

Returns all alert rules for the user
```

### 5. UPDATE ALERT RULE
```
PATCH /api/alert-rules/rule123
Request:
{
  "threshold": 150
}

Updates the threshold to $150
```

### 6. DELETE ALERT RULE
```
DELETE /api/alert-rules/rule123

Removes the alert rule
```

### 7. GET SPENDING ANALYTICS
```
GET /api/spending?userId=john123

Response:
{
  "success": true,
  "data": {
    "totalSpending": 487.50,
    "byCategory": {
      "FOOD": 150.00,
      "TRANSPORT": 200.00,
      "UTILITIES": 137.50
    }
  },
  "statusCode": 200
}
```

---

## Part 7: Database Schema (What Data is Stored)

### Users Table
```
CREATE TABLE users (
  id: String (unique ID)
  email: String (unique email)
  name: String (optional)
  createdAt: DateTime
  updatedAt: DateTime
)
```

### Transactions Table
```
CREATE TABLE transactions (
  id: String (unique)
  userId: String (refers to users.id)
  description: String ("Coffee at Starbucks")
  amount: Float (5.50)
  category: String ("FOOD")
  confidence: Float (0.95 - AI confidence)
  createdAt: DateTime
  updatedAt: DateTime
  
  Indexes:
  - userId (for fast lookup)
  - category (for filtering)
)
```

### Alert Rules Table
```
CREATE TABLE alert_rules (
  id: String (unique)
  userId: String (refers to users.id)
  category: String ("FOOD")
  threshold: Float (100)
  isActive: Boolean (true/false)
  createdAt: DateTime
  updatedAt: DateTime
  
  Unique: (userId, category) - one rule per category per user
  Index: userId (for fast lookup)
)
```

---

## Part 8: How Deployment Works

### Deployment = Putting Your App on the Internet

Currently:
```
Your Computer
    ↓
localhost:3000
Only you can access it
```

After Deployment:
```
Your GitHub Repository
    ↓
Vercel Cloud Server
    ↓
your-app.vercel.app
Everyone on internet can access it
```

### Deployment Options

#### **Option 1: Vercel (EASIEST) ⭐ RECOMMENDED**

**Steps:**
1. Push code to GitHub
2. Go to vercel.com
3. Connect your GitHub account
4. Click "Import Repository"
5. Add environment variables (database URL, API keys)
6. Click "Deploy"
7. Your app is live!

**How it works:**
```
Git Push
    ↓
GitHub gets the code
    ↓
Vercel watches GitHub
    ↓
Vercel runs: npm run build
    ↓
Vercel deploys to servers
    ↓
Your app is live on internet
```

**Every time you push:**
- Vercel automatically rebuilds
- Automatically deploys
- No extra work!

**Cost:** Free tier available, then pay as you grow

#### **Option 2: Railway (GOOD)**

**Steps:**
1. Push code to GitHub
2. Go to railway.app
3. Connect GitHub
4. Railway auto-creates PostgreSQL & Redis
5. Deploy
6. Your app is live!

**Cost:** $5/month free credits

#### **Option 3: Render**

**Similar to Railway, easy setup**

---

## Part 9: How to Deploy (Step by Step)

### Step 1: Create GitHub Repository

```powershell
# Initialize git if not done
git init

# Add all files
git add .

# Create first commit
git commit -m "feat: Initial commit - Sentinel financial intelligence engine"

# Go to github.com and create new repository named "sentinel"

# Connect local to GitHub
git remote add origin https://github.com/YOUR-USERNAME/sentinel.git
git branch -M main
git push -u origin main
```

**Result:** Your code is now on GitHub

### Step 2: Deploy to Vercel

1. Go to **vercel.com**
2. Click "Sign Up" → Choose "Continue with GitHub"
3. Authorize GitHub access
4. Click "Add New..." → "Project"
5. Select your "sentinel" repository
6. Click "Import"
7. **Environment Variables** page:
   - Add `DATABASE_URL` = your PostgreSQL URL
   - Add `OPENAI_API_KEY` = your OpenAI key
   - Add `REDIS_HOST` = your Redis host
   - Add `REDIS_PORT` = 6379
   - Add `NEXT_PUBLIC_APP_URL` = your Vercel URL (will be given)
   - Add `NODE_ENV` = production
8. Click "Deploy"
9. Wait 2-3 minutes
10. **Your app is live!** 🎉

### Step 3: Test Your Deployed App

```powershell
# Test the API
$url = "https://your-app-name.vercel.app"

# Create transaction
curl -X POST "$url/api/transactions" `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test",
    "description": "Coffee",
    "amount": 5.50
  }'

# Get transactions
curl "$url/api/transactions?userId=test"
```

**If it works:** Your app is deployed! ✅

---

## Part 10: What You Learned (For Your Resume)

### Technologies Used
- ✅ **Next.js 16** - Modern web framework
- ✅ **React 19** - UI library
- ✅ **TypeScript** - Type-safe JavaScript
- ✅ **PostgreSQL** - Relational database
- ✅ **Prisma ORM** - Database abstraction
- ✅ **Redis** - In-memory data store
- ✅ **BullMQ** - Job queue system
- ✅ **OpenAI API** - AI integration

### Architecture Concepts
- ✅ **Service-Repository Pattern** - Clean separation of concerns
- ✅ **API Design** - RESTful endpoints with standard responses
- ✅ **Background Jobs** - Async processing for heavy tasks
- ✅ **Database Design** - Normalized schema with proper indexes
- ✅ **Error Handling** - Proper try-catch and error responses
- ✅ **Type Safety** - Full TypeScript implementation

### Skills Demonstrated
- ✅ Full-stack development (frontend + backend)
- ✅ API design and implementation
- ✅ Database design and management
- ✅ AI/ML integration
- ✅ Cloud deployment
- ✅ Production-ready code quality
- ✅ Professional documentation
- ✅ Git version control

---

## Part 11: How to Explain This to Recruiters

### 30-Second Pitch
"I built Sentinel, a financial intelligence engine using Next.js and TypeScript. It uses AI to automatically categorize transactions and alerts users when they exceed spending limits. The system processes transactions instantly and handles alerts asynchronously using BullMQ background jobs."

### 2-Minute Explanation
"Sentinel is a full-stack application with a React frontend and Next.js backend. Here's how it works:

1. Users submit transactions
2. OpenAI instantly categorizes them
3. The transaction is saved to PostgreSQL
4. A background job is queued to check alert rules
5. If spending exceeds limits, the user is alerted

It uses service-repository architecture for clean code, TypeScript for type safety, and handles 6 RESTful API endpoints. I deployed it to Vercel for production hosting."

### When They Ask "What Would You Do Differently?"
"If I were rebuilding it, I would:
1. Add authentication (NextAuth) for multi-user support
2. Add comprehensive test coverage (Jest)
3. Implement rate limiting for API endpoints
4. Add request validation middleware
5. Build a React UI dashboard
6. Add audit logging for compliance"

### When They Ask "How Do You Deploy This?"
"The application is configured for Vercel deployment:
1. Code lives on GitHub
2. I set environment variables (database URL, API keys)
3. Vercel auto-deploys on every git push
4. The app scales automatically
5. PostgreSQL runs as a managed service
6. Redis handles background job queue
7. BullMQ worker processes jobs asynchronously"

---

## Part 12: Key Files to Show Recruiters

### Show These to Demonstrate Quality

1. **src/services/transaction.service.ts**
   - Shows: Coordinating multiple services, business logic
   - Good for: Full-stack thinking

2. **src/repositories/transaction.repository.ts**
   - Shows: Clean data access layer, Prisma usage
   - Good for: Architecture understanding

3. **src/app/api/transactions/route.ts**
   - Shows: API design, input validation, error handling
   - Good for: Backend development

4. **prisma/schema.prisma**
   - Shows: Database design, relationships, indexes
   - Good for: Database modeling

5. **src/workers/alert.worker.ts**
   - Shows: Background job processing, async logic
   - Good for: Advanced concepts

6. **README.md & ARCHITECTURE.md**
   - Shows: Communication, documentation
   - Good for: Professionalism

---

## Summary: How Everything Works Together

```
User creates transaction
         ↓
API Route (receives request)
         ↓
TransactionService (coordinates)
    ├→ AIService (calls OpenAI for categorization)
    ├→ TransactionRepository (saves to PostgreSQL)
    └→ QueueService (adds job to Redis)
         ↓
Response sent to user immediately
         ↓
Meanwhile (Background):
  BullMQ Worker picks up job
      ↓
  AlertWorker processes:
    ├→ AlertRuleRepository (get rules)
    ├→ TransactionRepository (calculate spending)
    └→ Send alert if needed
```

---

## FAQ for Recruiter Interview

**Q: What does your application do?**
A: It's a financial intelligence engine that categorizes transactions using AI and alerts users about overspending.

**Q: How does the AI categorization work?**
A: I call OpenAI's GPT-4o-mini API with the transaction description, and it returns the category and confidence score. I handle failures with a fallback.

**Q: Why use a background job queue?**
A: Because alert checking might take time (querying spending across transactions), I don't want to block the user's response. BullMQ lets me process it asynchronously.

**Q: How is your code organized?**
A: I use Service-Repository pattern. Routes handle requests, Services handle logic, and Repositories handle only database access. This separation makes testing and maintenance easy.

**Q: How is it deployed?**
A: On Vercel, which auto-deploys whenever I push to GitHub. The database is PostgreSQL (managed), Redis handles the job queue, and Vercel handles the application server.

**Q: What would you improve?**
A: Add authentication, test coverage, rate limiting, and build a UI dashboard. Right now it's API-only.

---

**You're now ready to explain this application to any recruiter!** 🚀
