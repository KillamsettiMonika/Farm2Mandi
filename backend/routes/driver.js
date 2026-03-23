const express = require('express');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const { requireAuth } = require('../middleware/authMiddleware');
const axios = require('axios');

const router = express.Router();

// Reverse geocoding function to get location name from coordinates.
// Priority: OpenCage (free tier with key) -> Google (paid) -> Nominatim (free, no key).
async function getLocationName(latitude, longitude) {
  const openCageKey = process.env.OPEN_CAGE_API_KEY;
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;

  // 1) OpenCage (good free tier ~2500/day)
  if (openCageKey) {
    try {
      const ocResp = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          key: openCageKey,
          q: `${latitude},${longitude}`,
          no_annotations: 1,
          language: 'en'
        }
      });
      if (ocResp.data?.results?.length) {
        const best = ocResp.data.results[0];
        if (best.formatted) return best.formatted;
      }
    } catch (err) {
      console.error('OpenCage geocoding error:', err.message);
    }
  }

  // 2) Google Maps Geocoding (if key provided)
  if (googleKey) {
    try {
      const googleResp = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${latitude},${longitude}`,
          key: googleKey
        }
      });
      if (googleResp.data?.results?.length) {
        return googleResp.data.results[0].formatted_address || 'Unknown Location';
      }
    } catch (err) {
      console.error('Google geocoding error:', err.message);
    }
  }

  // Fallback to Nominatim
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Farm2Mandi-App' // Required by Nominatim
      }
    });

    if (response.data && response.data.address) {
      const addr = response.data.address;
      const parts = [];
      if (addr.road) parts.push(addr.road);
      if (addr.village || addr.town || addr.city) parts.push(addr.village || addr.town || addr.city);
      if (addr.district) parts.push(addr.district);
      if (addr.state) parts.push(addr.state);
      if (addr.country) parts.push(addr.country);

      return parts.length > 0 ? parts.join(', ') : response.data.display_name || 'Unknown Location';
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return 'Location not available';
  }
}

// POST /api/driver/update-location - Update driver's current location
router.post('/update-location', requireAuth, async (req, res) => {
  try {
    // Check if user is a driver
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can update location' });
    }

    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Invalid coordinates format' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid coordinate values' });
    }

    // Get location name using reverse geocoding
    const locationName = await getLocationName(latitude, longitude);

    // Update driver location
    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      {
        currentLocation: {
          latitude,
          longitude
        },
        locationName,
        lastLocationUpdate: new Date()
      },
      { new: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({
      message: 'Location updated successfully',
      location: {
        latitude: driver.currentLocation.latitude,
        longitude: driver.currentLocation.longitude,
        locationName: driver.locationName,
        lastUpdate: driver.lastLocationUpdate
      }
    });
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ error: 'Server error while updating location' });
  }
});

// GET /api/driver/my-location - Get current driver's location
router.get('/my-location', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can access this endpoint' });
    }

    const driver = await Driver.findById(req.user._id).select('-password');
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({
      location: {
        latitude: driver.currentLocation?.latitude || null,
        longitude: driver.currentLocation?.longitude || null,
        locationName: driver.locationName || '',
        lastUpdate: driver.lastLocationUpdate || null,
        status: driver.status
      }
    });
  } catch (err) {
    console.error('Get location error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/driver/location/:driverId - Get driver location (for farmers to track)
router.get('/location/:driverId', requireAuth, async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const driver = await Driver.findOne({ driverId }).select('-password');
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({
      driverId: driver.driverId,
      driverName: driver.name,
      location: {
        latitude: driver.currentLocation?.latitude || null,
        longitude: driver.currentLocation?.longitude || null,
        locationName: driver.locationName || '',
        lastUpdate: driver.lastLocationUpdate || null
      },
      status: driver.status,
      vehicleNumber: driver.vehicleNumber
    });
  } catch (err) {
    console.error('Get driver location error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/driver/booking/:id/accept - Driver accepts a booking
router.post('/booking/:id/accept', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can accept bookings' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (String(booking.driver) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized for this booking' });
    }
    if (booking.status !== 'Requested' && booking.status !== 'Assigned') {
      return res.status(400).json({ error: 'Booking cannot be accepted in its current state' });
    }
    booking.status = 'Accepted';
    await booking.save();
    res.json({ message: 'Booking accepted', booking });
  } catch (err) {
    console.error('Accept booking error:', err);
    res.status(500).json({ error: 'Server error while accepting booking' });
  }
});

// POST /api/driver/booking/:id/reject - Driver rejects a booking
router.post('/booking/:id/reject', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can reject bookings' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (String(booking.driver) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized for this booking' });
    }
    if (booking.status !== 'Requested' && booking.status !== 'Assigned') {
      return res.status(400).json({ error: 'Booking cannot be rejected in its current state' });
    }
    booking.status = 'Rejected';
    await booking.save();
    
    // Make driver available again when rejecting
    const driver = await Driver.findById(req.user._id);
    if (driver) {
      driver.isAvailable = true;
      driver.status = 'Idle';
      await driver.save();
    }
    
    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    console.error('Reject booking error:', err);
    res.status(500).json({ error: 'Server error while rejecting booking' });
  }
});

module.exports = router;
