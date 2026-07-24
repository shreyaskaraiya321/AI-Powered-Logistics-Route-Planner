async function createUsers() {
  const headers = { 'Content-Type': 'application/json' };
  
  try {
    let res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST', headers, body: JSON.stringify({name: "Test Dispatcher", email: "dispatcher@test.com", password: "password123", role: "dispatcher"})
    });
    console.log("Dispatcher status:", res.status);
  } catch (e) { console.log(e.message) }
  
  try {
    let res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST', headers, body: JSON.stringify({name: "Test Driver", email: "driver@test.com", password: "password123", role: "driver"})
    });
    console.log("Driver status:", res.status);
  } catch (e) { console.log(e.message) }

  try {
    let res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST', headers, body: JSON.stringify({name: "Test Customer", email: "customer@test.com", password: "password123", role: "customer"})
    });
    console.log("Customer status:", res.status);
  } catch (e) { console.log(e.message) }
}

createUsers();
