const express = require('express');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const { requireAuth } = require('../middleware/authMiddleware');
const { calculateDistance } = require('../utils/distance');

const router = express.Router();

// POST /api/transport/find-drivers - Find available drivers for transport
router.post('/find-drivers', requireAuth, async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can book transport' });
    }

    const { fromMandal, toMandal, quantityKg, cropType, farmerLat, farmerLng, toLat, toLng } = req.body;

    if (!fromMandal || !toMandal || !quantityKg) {
      return res.status(400).json({ error: 'fromMandal, toMandal, and quantityKg are required' });
    }

    // Find all available drivers (simplified for testing)
    let drivers = await Driver.find({
    isAvailable: true,
    status: { $in: ['Idle', 'Assigned'] },
    vehicleCapacityKg: { $gte: quantityKg },
    currentMandal: { $regex: new RegExp(fromMandal, "i") } // 🔥 FIX
  })
      .select('-password');
      console.log("Searching for:", fromMandal);
      console.log("Drivers found:", drivers.length);

    // Calculate distance and cost for each driver
    const driversWithDetails = drivers.map(driver => {
      let estimatedDistance = 30; // Default fallback
      
      // Calculate route distance if coordinates available
      if (farmerLat && farmerLng && toLat && toLng) {
        // Distance from driver to farmer pickup point
        const driverToFarmer = driver.currentLocation?.latitude && driver.currentLocation?.longitude
          ? calculateDistance(
              driver.currentLocation.latitude,
              driver.currentLocation.longitude,
              farmerLat,
              farmerLng
            )
          : 0;
        
        // Distance from pickup to destination
        const pickupToDestination = calculateDistance(farmerLat, farmerLng, toLat, toLng);
        
        // Total route distance
        estimatedDistance = Math.round((driverToFarmer + pickupToDestination) * 100) / 100;
      } else if (driver.currentLocation?.latitude && driver.currentLocation?.longitude && farmerLat && farmerLng) {
        // Only pickup distance if destination coordinates not provided
        estimatedDistance = calculateDistance(
          driver.currentLocation.latitude,
          driver.currentLocation.longitude,
          farmerLat,
          farmerLng
        );
      }

      const estimatedCost = estimatedDistance * driver.costPerKm;

      return {
        driverId: driver.driverId,
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        vehicleCapacityKg: driver.vehicleCapacityKg,
        rating: driver.rating,
        totalTrips: driver.totalTrips,
        costPerKm: driver.costPerKm,
        currentMandal: driver.currentMandal,
        driverLocation: driver.currentLocation ? {
          lat: driver.currentLocation.latitude,
          lng: driver.currentLocation.longitude
        } : null,
        estimatedDistance: estimatedDistance,
        estimatedCost: Math.round(estimatedCost),
        locationName: driver.locationName || driver.currentMandal || 'Location not available'
      };
    });

    // Sort by: 1) Distance to farmer, 2) Rating, 3) Cost
    driversWithDetails.sort((a, b) => {
      // If both have driver locations and farmer coordinates, sort by distance
      if (farmerLat && farmerLng && a.driverLocation && b.driverLocation) {
        const distA = calculateDistance(farmerLat, farmerLng, a.driverLocation.lat, a.driverLocation.lng);
        const distB = calculateDistance(farmerLat, farmerLng, b.driverLocation.lat, b.driverLocation.lng);
        if (Math.abs(distA - distB) > 5) { // If distance difference > 5km, prioritize closer
          return distA - distB;
        }
      }
      // Then by rating
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      // Finally by cost
      return a.estimatedCost - b.estimatedCost;
    });

    // Limit to top 10
    const topDrivers = driversWithDetails.slice(0, 10);

    res.json({
      fromMandal,
      toMandal,
      quantityKg: Number(quantityKg),
      cropType: cropType || 'General',
      farmerLocation: farmerLat && farmerLng ? { lat: farmerLat, lng: farmerLng } : null,
      destinationLocation: toLat && toLng ? { lat: toLat, lng: toLng } : null,
      availableDrivers: topDrivers,
      count: topDrivers.length
    });
  } catch (err) {
    console.error('Find drivers error:', err);
    res.status(500).json({ error: 'Server error while finding drivers' });
  }
});

// POST /api/transport/book - Create a booking request
router.post('/book', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can create bookings' });
    }

    const { driverId, fromMandal, toMandal, cropType, quantityKg, farmerLat, farmerLng, toLat, toLng } = req.body;

    if (!driverId || !fromMandal || !toMandal || !cropType || !quantityKg) {
      return res.status(400).json({ error: 'All fields are required: driverId, fromMandal, toMandal, cropType, quantityKg' });
    }

    // Find the driver
    const driver = await Driver.findOne({ driverId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check if driver is available
    if (!driver.isAvailable || driver.status === 'OnTrip') {
      return res.status(400).json({ error: 'Driver is not available at the moment' });
    }

    // Check capacity
    if (driver.vehicleCapacityKg < quantityKg) {
      return res.status(400).json({ error: `Driver vehicle capacity (${driver.vehicleCapacityKg}kg) is less than required quantity (${quantityKg}kg)` });
    }

    // Calculate estimated cost using actual coordinates if available
    let estimatedDistance = 30; // Default fallback
    
    if (farmerLat && farmerLng && toLat && toLng) {
      // Distance from driver to farmer pickup point
      const driverToFarmer = driver.currentLocation?.latitude && driver.currentLocation?.longitude
        ? calculateDistance(
            driver.currentLocation.latitude,
            driver.currentLocation.longitude,
            farmerLat,
            farmerLng
          )
        : 0;
      
      // Distance from pickup to destination
      const pickupToDestination = calculateDistance(farmerLat, farmerLng, toLat, toLng);
      
      // Total route distance
      estimatedDistance = Math.round((driverToFarmer + pickupToDestination) * 100) / 100;
    } else if (driver.currentLocation?.latitude && driver.currentLocation?.longitude && farmerLat && farmerLng) {
      estimatedDistance = calculateDistance(
        driver.currentLocation.latitude,
        driver.currentLocation.longitude,
        farmerLat,
        farmerLng
      );
    }
    
    const estimatedCost = estimatedDistance * driver.costPerKm;

    // Create booking
    const booking = new Booking({
      farmerId: req.user._id,
      driver: driver._id,
      fromMandi: fromMandal,
      toMandi: toMandal,
      cropType,
      quantityKg: Number(quantityKg),
      status: 'Requested',
      estimatedCost: Math.round(estimatedCost),
      distanceKm: estimatedDistance
    });

    await booking.save();

    // Update driver status to Assigned
    driver.status = 'Assigned';
    driver.isAvailable = false;
    await driver.save();

    // Populate driver details for response
    await booking.populate('driver', 'driverId name phone vehicleType vehicleNumber rating');

    res.json({
      message: 'Booking request created successfully',
      booking: {
        id: booking._id,
        farmerId: booking.farmerId,
        driver: {
          driverId: driver.driverId,
          name: driver.name,
          phone: driver.phone,
          vehicleType: driver.vehicleType,
          vehicleNumber: driver.vehicleNumber
        },
        fromMandi: booking.fromMandi,
        toMandi: booking.toMandi,
        cropType: booking.cropType,
        quantityKg: booking.quantityKg,
        status: booking.status,
        estimatedCost: booking.estimatedCost,
        distanceKm: booking.distanceKm,
        createdAt: booking.createdAt
      }
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Server error while creating booking' });
  }
});

// GET /api/transport/my-bookings - Get bookings (for farmers and drivers)
router.get('/my-bookings', requireAuth, async (req, res) => {
  try {
    let bookings;
    
    if (req.user.role === 'farmer') {
      // Farmers see bookings they created
      bookings = await Booking.find({ farmerId: req.user._id })
        .populate('driver', 'driverId name phone vehicleType vehicleNumber rating')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'driver') {
      // Drivers see bookings assigned to them
      bookings = await Booking.find({ driver: req.user._id })
        .populate('farmerId', 'name phone')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ error: 'Invalid role' });
    }

    res.json({ bookings });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/transport/booking/:id/cancel - Farmer cancels their own booking
router.post('/booking/:id/cancel', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can cancel bookings' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (String(booking.farmerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized for this booking' });
    }

    if (['Delivered', 'Rejected', 'Cancelled'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled in its current state' });
    }

    const previousStatus = booking.status;
    booking.status = 'Cancelled';
    await booking.save();

    if (
      booking.driver &&
      ['Requested', 'Assigned', 'Accepted'].includes(previousStatus)
    ) {
      const driver = await Driver.findById(booking.driver);
      if (driver) {
        driver.isAvailable = true;
        driver.status = 'Idle';
        await driver.save();
      }
    }

    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Server error while cancelling booking' });
  }
});

module.exports = router;
// POST /api/transport/update-location
// POST /api/transport/update-location
router.post('/update-location', requireAuth, async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔍 debug

    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can update location' });
    }

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and Longitude required' });
    }

    const driver = await Driver.findById(req.user._id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    driver.currentLocation = {
      latitude,
      longitude
    };

    driver.lastUpdated = new Date();

    await driver.save();

    res.json({
      message: 'Location updated successfully',
      location: driver.currentLocation
    });

  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
