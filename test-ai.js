

async function testAI() {
  try {
    // 1. Get Admin Token
    console.log('--- 1. Authenticating as Admin ---');
    let res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'planner_admin@logistics.com', password: 'password123' })
    });
    
    // Fallback to register if not exists (although test-planner created it)
    if (res.status === 401 || res.status === 404) {
      console.log('Login failed, registering instead...');
      res = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Admin', email: 'planner_admin@logistics.com', password: 'password123', role: 'admin' })
      });
    }

    const authData = await res.json();
    const token = authData.token;
    if (!token) throw new Error('Failed to get token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. Fetch a route to use for testing
    console.log('\n--- 2. Fetching existing Routes ---');
    res = await fetch('http://127.0.0.1:5000/api/routes', { headers });
    const routes = await res.json();
    if (routes.length === 0) {
      throw new Error('No routes exist. Please run test-planner.js first.');
    }
    const routeId = routes[0]._id;
    console.log(`Found Route ID: ${routeId}`);

    // 3. Test generateRouteExplanation
    console.log('\n--- 3. Testing POST /api/routes/:id/explain (Gemini API) ---');
    res = await fetch(`http://127.0.0.1:5000/api/routes/${routeId}/explain`, {
      method: 'POST',
      headers
    });
    const explanation = await res.json();
    console.log(`Status: ${res.status}`);
    
    if (res.status !== 200) {
       console.error('API Error:', explanation);
       return;
    }

    console.log(`\n=== GEMINI RESPONSE ===\n${explanation.responseText}\n=======================\n`);
    
    console.log(`AiGeneration Record Created: ID = ${explanation._id}, Type = ${explanation.type}`);
    
  } catch (err) {
    console.error('Test AI failed:', err);
  }
}

testAI();
