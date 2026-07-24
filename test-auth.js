const registerBody = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'dispatcher'
};

async function testAuth() {
  try {
    console.log('--- 1. Testing protected route without token ---');
    let res = await fetch('http://localhost:5000/api/auth/me');
    let data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);

    console.log('\n--- 2. Registering new user ---');
    res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerBody)
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
    const token = data.token;

    console.log('\n--- 3. Logging in ---');
    res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerBody.email, password: registerBody.password })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);

    console.log('\n--- 4. Testing protected route WITH token ---');
    res = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    console.error('Error running test script:', error);
  }
}

testAuth();
