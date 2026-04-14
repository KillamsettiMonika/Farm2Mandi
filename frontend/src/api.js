import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE + '/api';

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});


export async function requestOtp(data) {
  const res = await client.post('/auth/request-otp', data);
  return res.data;
}

export async function register(data) {
  const res = await client.post('/auth/register', data);
  return res.data;
}

export async function login(data) {
  const res = await client.post('/auth/login', data);
  return res.data;
}

export async function logout() {
  const res = await client.post('/auth/logout');
  return res.data;
}

// GET /predict with query params (recommended)
export async function predict(params) {
  const { commodity, date, lat, lng, quantity } = params;
  const queryParams = new URLSearchParams({
    commodity,
    date,
    lat: lat.toString(),
    lng: lng.toString()
  });
  if (quantity) queryParams.append('quantity', quantity.toString());

  const res = await client.get(`/predict?${queryParams.toString()}`);
  return res.data;
}

// POST /predict (backward compatibility)
export async function predictPost(data) {
  const res = await client.post('/predict', data);
  return res.data;
}

export async function transportOptions(data) {
  const res = await client.post('/transport-options', data);
  return res.data;
}

export async function track(vehicleId) {
  const res = await client.get(`/track/${vehicleId}`);
  return res.data;
}

export async function getProfile() {
  const res = await client.get('/auth/me');
  return res.data;
}

export async function updateProfile(data) {
  const res = await client.put('/auth/me', data);
  return res.data;
}

export async function changePassword(body) {
  const res = await client.post('/auth/change-password', body);
  return res.data;
}

export async function forgotOtp(body) {
  const res = await client.post('/auth/forgot', body);
  return res.data;
}

export async function resetWithOtp(body) {
  const res = await client.post('/auth/reset-otp', body);
  return res.data;
}

// Browse endpoints (no auth required)
export async function getDistricts() {
  const res = await client.get('/districts');
  return res.data;
}

export async function getMarkets(district = null) {
  const url = district ? `/markets?district=${encodeURIComponent(district)}` : '/markets';
  const res = await client.get(url);
  return res.data;
}

export async function getMarketDetails(marketName) {
  const res = await client.get(`/markets/${encodeURIComponent(marketName)}`);
  return res.data;
}

// Driver location endpoints
export async function updateDriverLocation(latitude, longitude) {
  const res = await client.post('/driver/update-location', {
    latitude,
    longitude
  });
  return res.data;
}

export async function getMyLocation() {
  const res = await client.get('/driver/my-location');
  return res.data;
}

export async function getDriverLocation(driverId) {
  const res = await client.get(`/driver/location/${driverId}`);
  return res.data;
}

// Transport booking endpoints
export async function findDrivers(data) {
  const res = await client.post('/transport/find-drivers', data);
  return res.data;
}

export async function createBooking(data) {
  const res = await client.post('/transport/book', data);
  return res.data;
}

export async function getMyBookings() {
  const res = await client.get('/transport/my-bookings');
  return res.data;
}

export async function cancelBooking(bookingId) {
  const res = await client.post(`/transport/booking/${bookingId}/cancel`);
  return res.data;
}

// Driver booking actions
export async function acceptBooking(bookingId) {
  const res = await client.post(`/driver/booking/${bookingId}/accept`);
  return res.data;
}

export async function rejectBooking(bookingId) {
  const res = await client.post(`/driver/booking/${bookingId}/reject`);
  return res.data;
}

export async function completeBooking(bookingId) {
  const res = await client.post(`/driver/booking/${bookingId}/complete`);
  return res.data;
}

export async function getDriverBookings() {
  const res = await client.get('/driver/my-bookings');
  return res.data;
}

// Contact endpoint
export async function sendContactMessage(data) {
  const res = await client.post('/contact', data);
  return res.data;
}
