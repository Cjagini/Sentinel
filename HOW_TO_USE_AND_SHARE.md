# 🚀 How to Use Sentinel Locally & Share With Others

---

## Part 1: Using Sentinel Locally (On Your Computer)

### What You Need Installed

Before you can run the app, you need these on your computer:

1. **Node.js** (JavaScript runtime)
   - Download from: nodejs.org
   - Check: Open PowerShell and run `node --version`
   - You should have v20+

2. **PostgreSQL** (Database)
   - Download from: postgresql.org
   - During install, remember the password you set
   - Check: Open PowerShell and run `psql --version`

3. **Redis** (Message Queue)
   - Download from: redis.io
   - Or use Windows Subsystem for Linux (WSL)
   - Check: Run `redis-cli ping` (should show "PONG")

4. **OpenAI API Key**
   - Go to: platform.openai.com
   - Sign up / Login
   - Go to API Keys → Create new key
   - Copy the key (starts with `sk-proj-`)

---

## Step-by-Step: Running Locally

### Step 1: Create a Database

```powershell
# Open PowerShell as Administrator

# Connect to PostgreSQL (default user is "postgres")
psql -U postgres

# Create the database
CREATE DATABASE sentinel_db;

# Exit
\q
```

✅ Database is created

---

### Step 2: Get the Code

```powershell
# Option A: Clone from GitHub (if you pushed it)
git clone https://github.com/YOUR-USERNAME/sentinel.git
cd sentinel

# Option B: Or use existing code
cd c:\Users\chand\sentinel
```

---

### Step 3: Set Up Environment Variables

Create a file named `.env.local` (if it doesn't exist):

```powershell
# Using PowerShell, create .env.local
@"
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@localhost:5432/sentinel_db"
OPENAI_API_KEY="sk-proj-YOUR-KEY-HERE"
REDIS_HOST="localhost"
REDIS_PORT="6379"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
"@ | Out-File -Encoding UTF8 .env.local
```

**Replace:**
- `YOUR-PASSWORD` with your PostgreSQL password
- `sk-proj-YOUR-KEY-HERE` with your OpenAI API key

---

### Step 4: Install Dependencies

```powershell
npm install
```

⏱️ This takes 1-2 minutes

✅ All packages are installed

---

### Step 5: Set Up Database

```powershell
# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npx prisma migrate deploy
```

✅ Database tables are created

---

### Step 6: Start the Application

**Open 3 separate PowerShell windows:**

**Terminal 1 - Development Server:**
```powershell
npm run dev
```
You'll see:
```
▲ Next.js 16.1.1
- Local:         http://localhost:3000
- Ready in 1.4s
```

**Terminal 2 - Background Worker:**
```powershell
npm run worker
```
You'll see:
```
[alert.worker] Starting worker...
Listening for jobs...
```

**Terminal 3 - Test the API:**
Keep this ready for testing

✅ Your app is now running!

---

## Step 7: Test the App (Real-Time Usage)

### Test Creating a Transaction

**In Terminal 3, run this:**

```powershell
$headers = @{"Content-Type" = "application/json"}
$body = @{
    userId = "john123"
    description = "Coffee at Starbucks"
    amount = 5.50
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/transactions `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertTo-Json
```

**You should get back:**
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
    "createdAt": "2026-01-07T12:30:00Z"
  },
  "statusCode": 201
}
```

✅ **Transaction created!** Notice:
- AI automatically categorized it as "FOOD"
- Confidence is 0.95 (95% sure)

---

### Test Creating an Alert Rule

```powershell
$headers = @{"Content-Type" = "application/json"}
$body = @{
    userId = "john123"
    category = "FOOD"
    threshold = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/alert-rules `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertTo-Json
```

**Response:**
```json
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

✅ **Alert rule created!** Now alerts will trigger if FOOD spending > $100

---

### Test Getting Spending Analytics

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/spending?userId=john123" | ConvertTo-Json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSpending": 5.50,
    "byCategory": {
      "FOOD": 5.50
    }
  },
  "statusCode": 200
}
```

✅ **Analytics work!** You can see spending by category

---

### Try More Transactions

Create more transactions to test the alert system:

```powershell
# Second transaction
$body = @{
    userId = "john123"
    description = "McDonald's lunch"
    amount = 15.00
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/transactions `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body

# Third transaction
$body = @{
    userId = "john123"
    description = "Restaurant dinner"
    amount = 85.00
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/transactions `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

Now check spending:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/spending?userId=john123" | ConvertTo-Json
```

You'll see:
```json
"totalSpending": 105.50,
"byCategory": {
  "FOOD": 105.50
}
```

✅ **Alert would trigger!** Because $105.50 > $100 threshold

---

## Part 2: Sharing With Someone Else

### Option 1: Share GitHub Link (They Run It Locally)

**What you give them:**
```
GitHub: https://github.com/YOUR-USERNAME/sentinel
OR
Deployed: https://sentinel-xyz.vercel.app
```

**What they need to do:**

1. **Install prerequisites** (same as above):
   - Node.js
   - PostgreSQL
   - Redis
   - OpenAI API key

2. **Clone the repo:**
   ```powershell
   git clone https://github.com/YOUR-USERNAME/sentinel.git
   cd sentinel
   ```

3. **Read the README.md** for instructions

4. **Create .env.local** with their own:
   - PostgreSQL password
   - OpenAI API key

5. **Run:**
   ```powershell
   npm install
   npm run prisma:generate
   npx prisma migrate deploy
   npm run dev        # Terminal 1
   npm run worker     # Terminal 2
   ```

6. **Test at:** http://localhost:3000

---

### Option 2: Share Deployed Link (Easy - They Just Use It)

**Much easier!** Just give them the URL:
```
https://sentinel-xyz.vercel.app
```

**But wait... right now it's just API, no UI!**

They would need to test it with curl or Postman (harder for non-technical users)

---

### Option 3: Add a Simple UI (Best for Sharing)

To make it easier for others, add a simple web interface:

Create file: `src/app/page.tsx`

```typescript
'use client';
import { useState } from 'react';

export default function Home() {
  const [userId, setUserId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [response, setResponse] = useState('');

  const createTransaction = async () => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        description,
        amount: parseFloat(amount),
      }),
    });
    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>💰 Sentinel - Transaction Tracker</h1>
      
      <div style={{ marginBottom: '10px' }}>
        <label>User ID: </label>
        <input 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)}
          placeholder="john123"
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Description: </label>
        <input 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Coffee at Starbucks"
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Amount: </label>
        <input 
          type="number"
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          placeholder="5.50"
        />
      </div>

      <button 
        onClick={createTransaction}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Create Transaction
      </button>

      {response && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h3>Response:</h3>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}
```

Then they can visit `http://localhost:3000` and use a simple form!

---

## Part 3: Easy Testing with Postman (For Technical Users)

### If they prefer Postman:

1. Download Postman from postman.com
2. Create a request:
   - Method: POST
   - URL: `http://localhost:3000/api/transactions`
   - Body (raw JSON):
     ```json
     {
       "userId": "test123",
       "description": "Coffee",
       "amount": 5.50
     }
     ```
3. Click Send
4. See the response with AI categorization!

---

## Part 4: What to Tell Someone Interested in Using It

### If They Want to **Use It Locally:**

**Email them this:**

```
Hi!

I've built Sentinel - a financial intelligence engine that 
automatically categorizes your spending and alerts you about 
overspending using AI.

To run it on your computer:

Prerequisites:
- Node.js (nodejs.org)
- PostgreSQL (postgresql.org)
- Redis (redis.io)
- OpenAI API key (platform.openai.com)

Instructions:
1. Clone: git clone [link to your repo]
2. Install: npm install
3. Setup database: npx prisma migrate deploy
4. Run: npm run dev (and npm run worker in another terminal)
5. Visit: http://localhost:3000

See README.md for detailed instructions.
```

---

### If They Want to **Use the Deployed Version:**

**Just give them the URL:**
```
https://sentinel-xyz.vercel.app
```

They can test the API with curl or Postman.

---

### If They're Non-Technical:

**Add a simple UI first** (see Part 3 above), then deploy it.
Then they can just visit the website and use the form!

---

## Part 5: Share Instructions Document

Create a file: `SETUP_FOR_OTHERS.md`

```markdown
# How to Run Sentinel Locally

## What You Need

1. Node.js - Download from nodejs.org
2. PostgreSQL - Download from postgresql.org
3. Redis - Download from redis.io
4. OpenAI API Key - Get from platform.openai.com

## Quick Start (5 minutes)

### 1. Create Database
```powershell
psql -U postgres
CREATE DATABASE sentinel_db;
\q
```

### 2. Clone and Setup
```powershell
git clone [your repo]
cd sentinel
npm install
npm run prisma:generate
npx prisma migrate deploy
```

### 3. Configure Environment
Create `.env.local`:
```
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@localhost:5432/sentinel_db
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
REDIS_HOST=localhost
REDIS_PORT=6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run the App

**Terminal 1:**
```powershell
npm run dev
```

**Terminal 2:**
```powershell
npm run worker
```

### 5. Test It
Visit: http://localhost:3000

Or test API:
```powershell
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "description": "Coffee",
    "amount": 5.50
  }'
```

Done! 🎉
```

Then share this file with them.

---

## Summary: Different Ways to Share

| Method | For Whom | Effort | Experience |
|--------|----------|--------|------------|
| GitHub Link | Developers | Medium | CLI/Postman |
| Deployed URL + UI | Anyone | Easy | Web Form |
| Deployed URL | Developers | Low | API/Postman |
| Local Setup Guide | Developers | Medium | Full control |

---

## Best Practice: Deploy + Share URL

**Recommended approach:**

1. Deploy to Vercel (one-time, 5 minutes)
2. Add simple UI (optional, 30 minutes)
3. Share the URL: `https://sentinel-xyz.vercel.app`
4. They just visit and use it! No installation needed

---

## Your Next Steps

1. **Test locally** using Part 1 above
2. **Deploy to Vercel** using QUICK_DEPLOYMENT_STEPS.md
3. **Share the URL** with interested people
4. **Add UI** (optional) if you want non-technical users to use it

**Once deployed, it's as easy as: "Visit this link to try my app!"** 🚀
