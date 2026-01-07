# ⚡ Quick Testing & Sharing Reference Card

**Quick copy-paste commands for testing locally**

---

## 1. Prerequisites Check

```powershell
# Check Node.js
node --version          # Should be v20+

# Check PostgreSQL
psql --version         # Should be installed

# Check Redis
redis-cli ping         # Should return: PONG
```

---

## 2. Start the App (Do This First)

**Terminal 1 - Development Server:**
```powershell
cd c:\Users\chand\sentinel
npm run dev
# Should show: http://localhost:3000
```

**Terminal 2 - Background Worker:**
```powershell
cd c:\Users\chand\sentinel
npm run worker
# Should show: Listening for jobs...
```

**Terminal 3 - Ready for testing:**
```powershell
# Keep this terminal ready for curl commands
```

---

## 3. Quick API Tests

### Create a Transaction

```powershell
curl -X POST http://localhost:3000/api/transactions `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "john123",
    "description": "Coffee at Starbucks",
    "amount": 5.50
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "category": "FOOD",
    "confidence": 0.95,
    ...
  }
}
```

---

### Get All Transactions

```powershell
curl http://localhost:3000/api/transactions?userId=john123
```

---

### Create Alert Rule

```powershell
curl -X POST http://localhost:3000/api/alert-rules `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "john123",
    "category": "FOOD",
    "threshold": 100
  }'
```

---

### Get Spending Summary

```powershell
curl http://localhost:3000/api/spending?userId=john123
```

---

## 4. Sharing Instructions

### Quick Share (For Developers)

```
GitHub: https://github.com/YOUR-USERNAME/sentinel
```

**They need to:**
1. Clone the repo
2. Install Node.js, PostgreSQL, Redis
3. Create .env.local with their API keys
4. Run: npm install && npm run dev && npm run worker
5. Test at http://localhost:3000

---

### Easy Share (For Non-Technical)

1. Deploy to Vercel (5 minutes)
2. Share the URL: `https://sentinel-xyz.vercel.app`
3. Done! They can test the API

---

## 5. File Locations (For Reference)

```
API Endpoints:
- src/app/api/transactions/route.ts
- src/app/api/alert-rules/route.ts
- src/app/api/spending/route.ts

Services (Business Logic):
- src/services/transaction.service.ts
- src/services/alert.service.ts
- src/services/ai.service.ts

Database:
- prisma/schema.prisma

Worker:
- src/workers/alert.worker.ts
```

---

## 6. When Someone Asks to Try It

**Tell them:**
```
"Visit: https://sentinel-xyz.vercel.app

Or run locally:
1. Clone: git clone https://github.com/YOUR-USERNAME/sentinel
2. cd sentinel
3. npm install
4. npm run dev (and npm run worker in another terminal)
5. Visit: http://localhost:3000

Read README.md for full instructions."
```

---

## 7. Common Test Scenarios

### Test 1: Basic Transaction Creation
```powershell
curl -X POST http://localhost:3000/api/transactions `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test1",
    "description": "Subway sandwich",
    "amount": 12.50
  }'
```

### Test 2: Multiple Transactions (for spending calculation)
```powershell
# Transaction 1
curl -X POST http://localhost:3000/api/transactions `
  -H "Content-Type: application/json" `
  -d '{"userId": "test2", "description": "Starbucks", "amount": 5}'

# Transaction 2
curl -X POST http://localhost:3000/api/transactions `
  -H "Content-Type: application/json" `
  -d '{"userId": "test2", "description": "McDonald", "amount": 8}'

# Transaction 3
curl -X POST http://localhost:3000/api/transactions `
  -H "Content-Type: application/json" `
  -d '{"userId": "test2", "description": "Pizza", "amount": 15}'

# Check total
curl http://localhost:3000/api/spending?userId=test2
```

### Test 3: Alert Rules
```powershell
# Create rule
curl -X POST http://localhost:3000/api/alert-rules `
  -H "Content-Type: application/json" `
  -d '{"userId": "test3", "category": "FOOD", "threshold": 50}'

# Get rules
curl http://localhost:3000/api/alert-rules?userId=test3
```

---

## 8. Postman Testing (Alternative to curl)

Instead of curl, use Postman:

**Request Setup:**
- Method: POST
- URL: http://localhost:3000/api/transactions
- Headers: Content-Type: application/json
- Body (JSON):
  ```json
  {
    "userId": "test",
    "description": "Coffee",
    "amount": 5.50
  }
  ```

Click Send → See response with AI categorization!

---

## 9. Verify Everything Works

```powershell
# These should all return success responses

# 1. Health check (your app is running)
curl http://localhost:3000

# 2. Create transaction
curl -X POST http://localhost:3000/api/transactions `
  -H "Content-Type: application/json" `
  -d '{"userId":"u1","description":"test","amount":10}'

# 3. Get transactions
curl http://localhost:3000/api/transactions?userId=u1

# 4. Create alert
curl -X POST http://localhost:3000/api/alert-rules `
  -H "Content-Type: application/json" `
  -d '{"userId":"u1","category":"UNCATEGORIZED","threshold":50}'

# 5. Get alerts
curl http://localhost:3000/api/alert-rules?userId=u1

# All working? ✅ You're good to deploy!
```

---

## 10. Deployment Checklist Before Sharing

- [ ] `npm run build` passes
- [ ] `npm run lint` passes (0 errors)
- [ ] Local testing works (all API endpoints respond)
- [ ] .env.local has all required variables
- [ ] PostgreSQL database exists
- [ ] Redis is running
- [ ] Code is pushed to GitHub
- [ ] Vercel deployment is complete
- [ ] Deployed URL is accessible

✅ Then share with confidence!

---

## Quick Links for Reference

| Need | Link |
|------|------|
| How to Deploy | QUICK_DEPLOYMENT_STEPS.md |
| How It Works | HOW_TO_DEPLOY_AND_HOW_IT_WORKS.md |
| How to Use & Share | HOW_TO_USE_AND_SHARE.md |
| API Reference | README.md |
| Architecture | ARCHITECTURE.md |
| Setup Guide | QUICKSTART.md |

---

**Ready to share? Use the URL from Vercel and tell them to try it!** 🚀
