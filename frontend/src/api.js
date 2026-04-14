import axios from 'axios';
import emailjs from 'emailjs-com';


// Determine API base URL based on environment
let API_BASE = import.meta.env.VITE_API_BASE;

// If VITE_API_BASE is not set, auto-detect
if (!API_BASE || API_BASE === 'undefined') {
  // Detect if running on Vercel deployed domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // On Vercel production
    if (hostname.includes('vercel.app') || hostname.includes('farm2-mandi.vercel.app')) {
      API_BASE = 'https://farm2mandi-ra80.onrender.com/api';
    } 
    // On localhost
    else {
      API_BASE = 'http://localhost:5000/api';
    }
  }
}

console.log('🌐 API Base URL:', API_BASE);
console.log('📍 Running on:', typeof window !== 'undefined' ? window.location.hostname : 'server');

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

// Add request interceptor for debugging
client.interceptors.request.use(config => {
  console.log('📤 API Request:', config.method.toUpperCase(), config.baseURL + config.url);
  return config;
}, error => {
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
client.interceptors.response.use(response => {
  console.log('✅ API Response:', response.status, response.statusText);
  return response;
}, error => {
  console.error('❌ Response Error:', error.response?.status, error.response?.statusText, error.message);
  return Promise.reject(error);
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
// Contact endpoint using EmailJS

export async function sendContactMessage(data) {
  console.log("Sending data:", data);   // 👈 ADD THIS

  return emailjs.send(
    "service_szlpmx4",
    "template_3ly9sk6",
    {
      name: data.name,
      email: data.email,
      message: data.message,
      phone: data.phone || "Not provided"
    },
    "M9EPGwpia5C6Q-unZ"
  );
}

