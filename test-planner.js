async function testPlanner() {
  try {
    // 1. Setup - get an admin token
    console.log('--- Setup: Getting Admin Token ---');
    let res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Planner Admin',
        email: 'planner_admin@logistics.com',
        password: 'password123',
        role: 'admin'
      })
    });
    
    // If it fails with 400 because user exists, login instead
    let adminData = await res.json();
    let token = adminData.token;
    
    if (res.status === 400) {
       let loginRes = await fetch('http://localhost:5000/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: 'planner_admin@logistics.com', password: 'password123' })
       });
       adminData = await loginRes.json();
       token = adminData.token;
    }
    
    const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. Setup - Create a vehicle with capacity "5000kg"
    console.log('\n--- Setup: Creating Vehicle (Capacity 5000kg) ---');
    res = await fetch('http://localhost:5000/api/vehicles', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        plateNumber: `TEST-VP-${Date.now()}`,
        capacity: '5000kg',
        availability: true
      })
    });
    let vehicle = await res.json();
    console.log('Vehicle Created:', vehicle._id);

    // 3. Create 3 Orders
    console.log('\n--- 1. Creating 3 Orders ---');
    const orders = [];
    for (let i = 1; i <= 3; i++) {
       const loadAmount = i === 3 ? "1000kg" : "3000kg"; // Orders 1 & 2 = 3000kg, Order 3 = 1000kg
       res = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: authHeader,
          body: JSON.stringify({
            origin: `Origin ${i}`,
            destination: `Dest ${i}`,
            loadDetails: loadAmount,
            timeWindowStart: new Date(Date.now() + i*10000).toISOString(),
            timeWindowEnd: new Date(Date.now() + i*10000 + 3600000).toISOString()
          })
       });
       const order = await res.json();
       orders.push(order);
       console.log(`Created Order ${i} - Load: ${loadAmount}`);
    }

    // 4. Test Scenario: Fail Constraint (Capacity)
    console.log('\n--- 2. Attempting Invalid Plan (Capacity Check) ---');
    console.log('Trying to plan Order 1 (3000kg) and Order 2 (3000kg) -> Total 6000kg vs 5000kg vehicle');
    res = await fetch('http://localhost:5000/api/routes/plan', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        orderIds: [orders[0]._id, orders[1]._id]
      })
    });
    let result = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));


    // 5. Test Scenario: Succeed 
    console.log('\n--- 3. Attempting Valid Plan ---');
    console.log('Trying to plan Order 1 (3000kg) and Order 3 (1000kg) -> Total 4000kg <= 5000kg');
    res = await fetch('http://localhost:5000/api/routes/plan', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        orderIds: [orders[0]._id, orders[2]._id]
      })
    });
    result = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    const routeId = result._id;

    // 6. Approve Route
    console.log('\n--- 4. Approving Route ---');
    res = await fetch(`http://localhost:5000/api/routes/${routeId}/approve`, {
      method: 'POST',
      headers: authHeader
    });
    result = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Route Approved:`, result.dispatcherApproved);

    // 7. Post Status Update
    console.log('\n--- 5. Posting Status Update (in-transit) ---');
    res = await fetch(`http://localhost:5000/api/routes/${routeId}/status`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        type: 'in-transit',
        reason: 'Left warehouse'
      })
    });
    result = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Route Status: ${result.route.status}`);
    console.log(`Event Recorded:`, result.event.type);

  } catch (err) {
    console.error('Test script failed:', err);
  }
}

testPlanner();
