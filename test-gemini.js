async function testGeminiRoute() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    // 1. Get dispatcher token
    console.log("Logging in as dispatcher...");
    let res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers, body: JSON.stringify({ email: 'dispatcher@test.com', password: 'password123' })
    });
    let data = await res.json();
    const token = data.token;
    const authHeader = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    // 2. Create Order
    console.log("Creating new order...");
    res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST', headers: authHeader, body: JSON.stringify({ origin: "South Hub", destination: "North Warehouse", loadDetails: "300kg Wood" })
    });
    data = await res.json();
    const orderId = data._id;

    // 3. Plan Route
    console.log("Planning route...");
    res = await fetch('http://localhost:5000/api/routes/plan', {
      method: 'POST', headers: authHeader, body: JSON.stringify({ orderIds: [orderId] })
    });
    data = await res.json();
    const routeId = data._id;

    // 4. Fetch Explanation
    console.log("Fetching Gemini AI Explanation...");
    res = await fetch(`http://localhost:5000/api/routes/${routeId}/explain`, {
      method: 'POST', headers: authHeader, body: JSON.stringify({})
    });
    data = await res.json();
    console.log("\nSuccess! AI Output:\n------------------\n", data.responseText, "\n------------------\n");
    
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

testGeminiRoute();
