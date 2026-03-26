# API Documentation - Driver Location & Bookings

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except public ones) require a JWT token in the Cookie:
```
Cookie: token=<JWT_TOKEN>
```

---

## 📍 Location Tracking APIs

### 1. Update Driver Location
**Updates the driver's current GPS location and reverse geocodes to location name**

```
POST /driver/update-location
```

#### Request
```json
{
  "latitude": 13.1939,
  "longitude": 80.1829
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | number | Yes | GPS latitude (-90 to 90) |
| longitude | number | Yes | GPS longitude (-180 to 180) |

#### Response (200 OK)
```json
{
  "message": "Location updated successfully",
  "location": {
    "latitude": 13.1939,
    "longitude": 80.1829,
    "locationName": "Kurnool, Andhra Pradesh, India",
    "lastUpdate": "2024-03-26T10:30:00.000Z"
  }
}
```

#### Error Responses
| Status | Response |
|--------|----------|
| 400 | `{ "error": "latitude and longitude are required" }` |
| 400 | `{ "error": "Invalid coordinates format" }` |
| 403 | `{ "error": "Only drivers can update location" }` |
| 404 | `{ "error": "Driver not found" }` |
| 401 | `{ "error": "Unauthorized" }` |

#### Example (JavaScript)
```javascript
const response = await fetch('/api/driver/update-location', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 13.1939,
    longitude: 80.1829
  })
});
const data = await response.json();
console.log(data.location.locationName);
```

---

### 2. Get Current Driver Location
**Fetches the authenticated driver's current location**

```
GET /driver/my-location
```

#### Request
No body required. Uses authentication from Cookie.

#### Response (200 OK)
```json
{
  "location": {
    "latitude": 13.1939,
    "longitude": 80.1829,
    "locationName": "Kurnool, Andhra Pradesh, India",
    "lastUpdate": "2024-03-26T10:30:00.000Z",
    "status": "OnTrip"
  }
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| latitude | number | Current latitude (null if never updated) |
| longitude | number | Current longitude (null if never updated) |
| locationName | string | Human-readable address |
| lastUpdate | ISO8601 | Timestamp of last update |
| status | enum | "Idle" \| "Assigned" \| "OnTrip" |

#### Error Responses
| Status | Response |
|--------|----------|
| 403 | `{ "error": "Only drivers can access this endpoint" }` |
| 404 | `{ "error": "Driver not found" }` |
| 401 | `{ "error": "Unauthorized" }` |

#### Example (JavaScript)
```javascript
const response = await fetch('/api/driver/my-location', {
  credentials: 'include'
});
const data = await response.json();
console.log(`Driver at: ${data.location.locationName}`);
console.log(`Status: ${data.location.status}`);
```

---

### 3. Get Specific Driver Location
**Fetches location of a specific driver (for farmers to track)**

```
GET /driver/location/:driverId
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| driverId | string | Yes | Driver ID (URL param) |

#### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
```

#### Response (200 OK)
```json
{
  "driverId": "DRV001",
  "driverName": "Rajesh Kumar",
  "location": {
    "latitude": 13.1939,
    "longitude": 80.1829,
    "locationName": "Kurnool, Andhra Pradesh, India",
    "lastUpdate": "2024-03-26T10:30:00.000Z"
  },
  "status": "OnTrip",
  "vehicleNumber": "TG 09 AB 1234"
}
```

#### Error Responses
| Status | Response |
|--------|----------|
| 404 | `{ "error": "Driver not found" }` |
| 401 | `{ "error": "Unauthorized" }` |

#### Example (JavaScript)
```javascript
const response = await fetch('/api/driver/location/DRV001', {
  credentials: 'include'
});
const driver = await response.json();
console.log(`${driver.driverName} is at ${driver.location.locationName}`);
```

---

## 📦 Booking Management APIs

### 4. Get Driver Bookings (NEW)
**Fetches all bookings assigned to the authenticated driver**

```
GET /driver/my-bookings
```

#### Request
No body required. Uses authentication from Cookie.

#### Response (200 OK)
```json
{
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "farmerName": "Ramaiah Chowdary",
      "farmerPhone": "9876543210",
      "cropType": "Tomato",
      "quantityKg": 500,
      "fromMandi": "Madanapalli APMC",
      "toMandi": "Chittoor APMC",
      "status": "Requested",
      "estimatedCost": 2500.00,
      "distanceKm": 45.5,
      "createdAt": "2024-03-26T08:00:00.000Z",
      "updatedAt": "2024-03-26T08:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "farmerName": "Mohan Kumar",
      "farmerPhone": "9876543211",
      "cropType": "Onion",
      "quantityKg": 300,
      "fromMandi": "Kalikiri APMC",
      "toMandi": "Palamaner APMC",
      "status": "Accepted",
      "estimatedCost": 1800.00,
      "distanceKm": 30.0,
      "createdAt": "2024-03-25T10:00:00.000Z",
      "updatedAt": "2024-03-26T09:15:00.000Z"
    }
  ]
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Booking ID |
| farmerName | string | Name of farmer who made booking |
| farmerPhone | string | Farmer's contact number |
| cropType | string | Commodity being transported |
| quantityKg | number | Weight in kilograms |
| fromMandi | string | Pickup market |
| toMandi | string | Delivery market |
| status | enum | "Requested" \| "Assigned" \| "Accepted" \| "OnTheWay" \| "Delivered" \| "Rejected" \| "Cancelled" |
| estimatedCost | number | Cost in rupees |
| distanceKm | number | Distance in kilometers |
| createdAt | ISO8601 | When booking was created |
| updatedAt | ISO8601 | Last update timestamp |

#### Error Responses
| Status | Response |
|--------|----------|
| 403 | `{ "error": "Only drivers can access this endpoint" }` |
| 404 | `{ "error": "Driver not found" }` |
| 401 | `{ "error": "Unauthorized" }` |

#### Example (JavaScript)
```javascript
const response = await fetch('/api/driver/my-bookings', {
  credentials: 'include'
});
const data = await response.json();
const pendingCount = data.bookings.filter(b => b.status === 'Requested').length;
console.log(`${pendingCount} pending bookings`);

data.bookings.forEach(booking => {
  console.log(`${booking.farmerName} - ${booking.cropType} (${booking.quantityKg} kg)`);
});
```

---

### 5. Accept Booking
**Driver accepts a transportation booking request**

```
POST /driver/booking/:id/accept
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Booking ID (URL param) |

#### Request
No body required.

#### Response (200 OK)
```json
{
  "message": "Booking accepted",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Accepted",
    "updatedAt": "2024-03-26T10:00:00.000Z"
  }
}
```

#### Side Effects
- Booking status → "Accepted"
- Driver status → "OnTrip"
- Driver isAvailable → false
- Location updates change to 5-second intervals

#### Error Responses
| Status | Response |
|--------|----------|
| 400 | `{ "error": "Booking cannot be accepted in its current state" }` |
| 403 | `{ "error": "Only drivers can accept bookings" }` |
| 403 | `{ "error": "Not authorized for this booking" }` |
| 404 | `{ "error": "Booking not found" }` |
| 401 | `{ "error": "Unauthorized" }` |

#### Detailed Flow
```javascript
// Before accept:
{
  status: "Requested",
  driver: driver_id,
}

// After accept:
{
  status: "Accepted",
  driver: driver_id,
  updatedAt: new Date()
}

// Driver status changed:
{
  status: "OnTrip",
  isAvailable: false
}
```

#### Example (JavaScript)
```javascript
const bookingId = '507f1f77bcf86cd799439011';
const response = await fetch(`/api/driver/booking/${bookingId}/accept`, {
  method: 'POST',
  credentials: 'include'
});

if (response.ok) {
  const data = await response.json();
  console.log('✓ Booking accepted!');
  console.log(`Status: ${data.booking.status}`);
} else {
  const error = await response.json();
  console.error(`✗ ${error.error}`);
}
```

---

### 6. Reject Booking
**Driver rejects a transportation booking request**

```
POST /driver/booking/:id/reject
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Booking ID (URL param) |

#### Request
No body required.

#### Response (200 OK)
```json
{
  "message": "Booking rejected",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Rejected",
    "updatedAt": "2024-03-26T10:05:00.000Z"
  }
}
```

#### Side Effects
- Booking status → "Rejected"
- Driver status → "Idle"
- Driver isAvailable → true
- Location updates return to 60-second intervals

#### Error Responses
| Status | Response |
|--------|----------|
| 400 | `{ "error": "Booking cannot be rejected in its current state" }` |
| 403 | `{ "error": "Only drivers can reject bookings" }` |
| 403 | `{ "error": "Not authorized for this booking" }` |
| 404 | `{ "error": "Booking not found" }` |
| 401 | `{ "error": "Unauthorized" }` |

#### Example (JavaScript)
```javascript
const bookingId = '507f1f77bcf86cd799439011';
const response = await fetch(`/api/driver/booking/${bookingId}/reject`, {
  method: 'POST',
  credentials: 'include'
});

if (response.ok) {
  const data = await response.json();
  console.log('✗ Booking rejected');
  console.log(`Status: ${data.booking.status}`);
} else {
  const error = await response.json();
  console.error(`Error: ${error.error}`);
}
```

---

## 🔄 API Call Sequences

### Location Update Sequence
```
1. Browser → POST /driver/update-location
   ├─ Get GPS (navigator.geolocation)
   ├─ Send lat/lng
   └─ Store token in Cookie

2. Backend → Reverse Geocoding
   ├─ Try OpenCage API
   ├─ Try Google Maps
   └─ Fallback to Nominatim

3. Backend → Update Database
   ├─ Driver.findOneAndUpdate({ userId })
   ├─ Update currentLocation
   ├─ Update locationName
   └─ Update lastLocationUpdate

4. Browser ← Response
   ├─ Display new coordinates
   ├─ Show location name
   └─ Update timestamp
```

### Booking Accept Sequence
```
1. Browser → GET /driver/my-bookings
   ├─ Load pending bookings
   └─ Display in pending tab

2. User → Click "Accept"
   ├─ Open confirmation dialog
   ├─ Show farmer & booking details
   └─ Require user confirmation

3. Browser → POST /driver/booking/:id/accept
   ├─ Send booking ID
   └─ Include JWT token

4. Backend → Authorization & Update
   ├─ Verify driver owns booking
   ├─ Update booking status → Accepted
   ├─ Update driver status → OnTrip
   └─ Update driver isAvailable → false

5. Browser ← Response
   ├─ Show success notification
   ├─ Close dialog
   ├─ Reload bookings
   └─ Booking moves to Accepted tab

6. Auto Behavior → Location Updates
   ├─ Change interval to 5 seconds
   └─ Active location tracking begins
```

---

## 🧪 Testing with cURL

### Test Update Location
```bash
curl -X POST http://localhost:5000/api/driver/update-location \
  -H "Content-Type: application/json" \
  -b "token=YOUR_JWT_TOKEN" \
  -d '{
    "latitude": 13.1939,
    "longitude": 80.1829
  }'
```

### Test Get Location
```bash
curl -X GET http://localhost:5000/api/driver/my-location \
  -b "token=YOUR_JWT_TOKEN"
```

### Test Get Bookings
```bash
curl -X GET http://localhost:5000/api/driver/my-bookings \
  -b "token=YOUR_JWT_TOKEN"
```

### Test Accept Booking
```bash
curl -X POST http://localhost:5000/api/driver/booking/BOOKING_ID/accept \
  -H "Content-Type: application/json" \
  -b "token=YOUR_JWT_TOKEN"
```

---

## 📊 Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - Request completed successfully |
| 400 | Bad Request - Invalid parameters or format |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Not authorized for this action |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal server error |

---

## ⚡ Rate Limiting (Future)
Currently no rate limiting. Recommended future implementation:
- 30 requests/minute for location updates
- 10 requests/minute for booking actions
- 5 requests/second for read operations

---

## 📝 Notes

1. **Geolocation accuracy**: ±5-10 meters with high-accuracy mode
2. **Location name**: Reverse geocoding may be slow on first call (~1-2 seconds)
3. **Caching**: Location names are cached in the database for repeat queries
4. **Timezone**: All timestamps are in UTC (ISO8601 format)
5. **Phone numbers**: Farmer phone numbers are populated from Farmer collection
6. **Auto-update intervals**:
   - Idle: 60 seconds
   - OnTrip: 5 seconds
   - Assigned: 60 seconds

---

## 🔒 Security Notes

1. All endpoints require valid JWT token
2. Drivers can only accept/reject their own bookings
3. Farmers can only view locations of drivers they booked
4. Phone numbers are masked in responses (future enhancement)
5. No sensitive data in error messages

---

Last Updated: March 2024
API Version: 1.0
