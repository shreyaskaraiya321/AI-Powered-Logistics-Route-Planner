async function testCRUD() {
  const adminData = {
    name: 'Admin User',
    email: 'admin@logistics.com',
    password: 'password123',
    role: 'admin'
  };

  try {
    console.log('--- 1. Registering Admin ---');
    let res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    let data = await res.json();
    console.log('Status:', res.status);
    const token = data.token;
    const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    console.log('\n--- 2. Creating Vehicle ---');
    res = await fetch('http://localhost:5000/api/vehicles', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        plateNumber: 'ABC-1234',
        capacity: '5000kg',
        availability: true,
        operatingArea: 'Downtown',
        shift: 'Morning'
      })
    });
    data = await res.json();
    console.log('Status:', res.status, '\nResponse:', JSON.stringify(data, null, 2));
    const vehicleId = data._id;

    console.log('\n--- 3. Registering Driver User (required for Driver Profile) ---');
    let driverRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Driver',
        email: 'john@logistics.com',
        password: 'password123',
        role: 'driver'
      })
    });
    let driverData = await driverRes.json();
    console.log('Status:', driverRes.status, '\nDriver User Created:', driverData._id);
    const driverUserId = driverData._id;

    console.log('\n--- 4. Creating Driver Profile ---');
    res = await fetch('http://localhost:5000/api/drivers', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        userId: driverUserId,
        vehicleId: vehicleId,
        status: 'active'
      })
    });
    data = await res.json();
    console.log('Status:', res.status, '\nResponse:', JSON.stringify(data, null, 2));
    const driverId = data._id;

    console.log('\n--- 5. Creating Order ---');
    res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        origin: 'Warehouse A',
        destination: 'Customer B',
        loadDetails: '2 Pallets Electronics',
        servicePriority: 'express'
      })
    });
    data = await res.json();
    console.log('Status:', res.status, '\nResponse:', JSON.stringify(data, null, 2));
    const orderId = data._id;

    console.log('\n--- 6. Retrieving Entities (GET) ---');
    res = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, { headers: authHeader });
    data = await res.json();
    console.log('Vehicle Status:', res.status, '\nVehicle:', JSON.stringify(data, null, 2));
    
    res = await fetch(`http://localhost:5000/api/drivers/${driverId}`, { headers: authHeader });
    data = await res.json();
    console.log('Driver Status:', res.status, '\nDriver:', JSON.stringify(data, null, 2));
    
    res = await fetch(`http://localhost:5000/api/orders/${orderId}`, { headers: authHeader });
    data = await res.json();
    console.log('Order Status:', res.status, '\nOrder:', JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('Test Error:', err);
  }
}

testCRUD();
