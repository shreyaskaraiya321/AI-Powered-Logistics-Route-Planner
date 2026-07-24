# Database Schema Documentation

This document describes the structure of the MongoDB collections used by Mongoose in this application.

### User
Manages authentication and roles.
- `name` (String): Full name.
- `email` (String): Unique email.
- `passwordHash` (String): Bcrypt hashed password.
- `role` (Enum): `admin`, `dispatcher`, `driver`, `customer`.

### Vehicle
Represents a physical vehicle in the fleet.
- `plateNumber` (String): Unique identifier.
- `capacity` (Number): Maximum weight capacity in kg.
- `availability` (Boolean): Is it ready for dispatch.
- `operatingArea` (String): Valid operating zone.
- `shift` (String): Operating hours.
- `specialConstraints` (Array of Strings): e.g. "refrigerated".

### Driver
Links a user account to a vehicle.
- `userId` (ObjectId, ref: User): The driver's user account.
- `vehicleId` (ObjectId, ref: Vehicle): Assigned vehicle.
- `status` (String): Current status (e.g., "active", "off-duty").

### Order
Represents a customer shipment requirement.
- `origin` (String): Pickup address.
- `destination` (String): Dropoff address.
- `timeWindowStart` (Date): Earliest delivery time.
- `timeWindowEnd` (Date): Latest delivery time.
- `loadDetails` (String): e.g., "5000kg".
- `servicePriority` (Enum): "standard", "express".
- `customerInstructions` (String): User notes.
- `status` (Enum): pending, dispatched, in-transit, delayed, delivered, failed, rescheduled.
- `customerId` (ObjectId, ref: User).

### Route
A grouping of orders assigned to a vehicle/driver.
- `orderIds` (Array of ObjectIds, ref: Order).
- `vehicleId` (ObjectId, ref: Vehicle).
- `driverId` (ObjectId, ref: Driver).
- `stopOrder` (Array of ObjectIds): Sequence of deliveries.
- `estimatedDistance` (Number): Calculated metric.
- `estimatedDuration` (Number): Calculated metric (minutes).
- `status` (Enum): planned, in-progress, completed, failed.
- `dispatcherApproved` (Boolean): Must be true to be dispatched.

### StatusEvent
Audit log of real-world events.
- `routeId` (ObjectId, ref: Route).
- `type` (Enum): Matches Order statuses (in-transit, delivered, etc.).
- `reason` (String): Explanation if failed/delayed.
- `proofOfDelivery` (String): URL/Signature.
- `timestamp` (Date).

### AiGeneration
Audit log of all Gemini interactions.
- `type` (Enum): The type of prompt executed.
- `relatedRouteId` (ObjectId, ref: Route).
- `relatedOrderId` (ObjectId, ref: Order).
- `promptUsed` (String): The exact text sent to Gemini.
- `responseText` (String): The raw output from the AI.
