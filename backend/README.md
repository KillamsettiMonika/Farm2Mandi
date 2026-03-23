# Farm2Mandi - Backend

This is the backend API for the Farm2Mandi project. It provides endpoints for authentication, price prediction, and mandi recommendations.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the `backend/` directory:
   ```
   MONGO_URI=mongodb://localhost:27017/farm-mandi
   JWT_SECRET=your-secret-key-here
   PORT=5000
   FRONTEND_ORIGIN=http://localhost:5173

   # Mobile OTP (Twilio Verify - recommended)
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Optional fallback if using Twilio Messaging API instead of Verify
   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

   # SMTP for forgot-password and contact email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM="Farm2Mandi <your-email@gmail.com>"
   FARM2MANDI_CONTACT_EMAIL=your-email@gmail.com
   ```

3. Run the backend:
   ```bash
   npm run dev
   ```

## Database Seeding

To populate the database with mandi and price data from the CSV:

1. Ensure the CSV file is at `frontend/src/dataset/Agriculture_price_dataset.csv`
2. Run the seed script:
   ```bash
   npm run seed
   ```

**Note:** The seed script uses approximate coordinates based on state. For accurate coordinates, you'll need to use a geocoding API (e.g., Google Maps Geocoding API) to update the mandi locations.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new farmer
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot` - Request password reset OTP
- `POST /api/auth/reset-otp` - Reset password with OTP

### Prediction & Recommendations
- `GET /api/predict?commodity=Wheat&date=2025-11-06&lat=28.7041&lng=77.1025&quantity=1000` - Get price prediction and top 3 mandi recommendations
  - Query parameters:
    - `commodity` (required) - Commodity name (e.g., Wheat, Rice, Tomato)
    - `date` (required) - Date in YYYY-MM-DD format
    - `lat` (required) - Farmer's latitude
    - `lng` (required) - Farmer's longitude
    - `quantity` (optional) - Quantity in kg (default: 1000)
  
- `POST /api/predict` - Alternative endpoint (backward compatible)
  - Body: `{ commodity, date, lat, lng, quantity }`

### Transport & Tracking
- `POST /api/transport-options` - Get transport options
- `GET /api/track/:vehicleId` - Track vehicle location

## Architecture

### Models
- **Farmer** - User/farmer data
- **Mandi** - Agricultural market information with coordinates
- **Price** - Historical price data

### Utilities
- **distance.js** - Haversine formula for distance calculation
- **prediction.js** - Price prediction logic (uses historical data average)

### Flow
1. Frontend sends GET request with commodity, date, and farmer coordinates
2. Backend predicts price using historical data
3. Backend finds all mandis for that commodity
4. Backend calculates distance for each mandi using Haversine formula
5. Backend calculates transport cost (distance × 10)
6. Backend calculates profit (revenue - transport cost)
7. Backend sorts by profit and returns top 3 mandis

## Notes

- Price prediction uses a simple average of recent modal prices. For more sophisticated predictions, integrate LSTM/ARIMA models if required by your mentor or for a final-year deep ML project.
- Distance calculation uses the Haversine formula. You can later integrate Google Maps API for more accurate road distances.
- Transport cost is calculated as `distance_km × 10`. This can be improved with real logistics provider APIs.
