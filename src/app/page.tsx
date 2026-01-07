export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto', background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>💰 Sentinel</h1>
          <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '0.5rem' }}>Financial Intelligence Engine</p>
          <p style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ Backend API Ready</p>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>🚀 Test the API</h2>
          
          <p style={{ color: '#374151', marginBottom: '1rem' }}>Use curl to test:</p>

          <div style={{ fontSize: '0.75rem', color: '#374151', background: 'white', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', marginBottom: '1rem' }}>
            <p style={{ color: '#4b5563', fontWeight: '600', marginBottom: '0.5rem' }}>1️⃣ Create Transaction</p>
            <pre style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem', overflow: 'auto' }}>
{`curl -X POST http://localhost:3000/api/transactions \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "user-demo",
    "description": "Coffee at Starbucks",
    "amount": 5.50
  }'`}
            </pre>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#374151', background: 'white', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace' }}>
            <p style={{ color: '#4b5563', fontWeight: '600', marginBottom: '0.5rem' }}>2️⃣ Get Transactions</p>
            <pre style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem', overflow: 'auto' }}>
{`curl http://localhost:3000/api/transactions?userId=user-demo`}
            </pre>
          </div>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#faf5ff', borderRadius: '0.5rem', borderLeft: '4px solid #a855f7' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>📚 API Endpoints</h2>
          
          <div style={{ color: '#374151', lineHeight: '1.75' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>POST /api/transactions</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Create a transaction with AI categorization</p>
              <code style={{ display: 'block', background: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', marginBottom: '0.5rem' }}>userId, description, amount</code>
              <p style={{ fontSize: '0.875rem', color: '#16a34a' }}>✅ AI categorizes: FOOD, TRANSPORT, UTILITIES, etc.</p>
            </div>

            <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>GET /api/transactions?userId=</h3>
              <p style={{ fontSize: '0.875rem' }}>List all transactions for a user</p>
            </div>

            <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>POST /api/alert-rules</h3>
              <p style={{ fontSize: '0.875rem' }}>Create spending limit alerts</p>
            </div>

            <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>GET /api/alert-rules?userId=</h3>
              <p style={{ fontSize: '0.875rem' }}>List alert rules for a user</p>
            </div>

            <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />

            <div>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>GET /api/spending?userId=</h3>
              <p style={{ fontSize: '0.875rem' }}>Get total spending by category</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '0.5rem', borderLeft: '4px solid #16a34a' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>⚙️ Technology Stack</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', color: '#374151' }}>
            <div>
              <p>🔵 <strong>Next.js 16</strong> - React</p>
              <p>🐘 <strong>PostgreSQL</strong> - Database</p>
              <p>🔴 <strong>Redis</strong> - Message broker</p>
            </div>
            <div>
              <p>⚡ <strong>TypeScript</strong> - Type safety</p>
              <p>🤖 <strong>OpenAI GPT-4o-mini</strong> - AI</p>
              <p>📦 <strong>BullMQ</strong> - Job queue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
