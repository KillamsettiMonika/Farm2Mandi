import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Divider
} from '@mui/material';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { findDrivers, createBooking, getMyBookings, acceptBooking, rejectBooking, getProfile } from '../api';

export default function Transport() {
  const location = useLocation();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    fromMandal: '',
    toMandal: '',
    quantityKg: '',
    cropType: '',
    farmerLat: '',
    farmerLng: '',
    toLat: '',
    toLng: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [profile, setProfile] = useState(null);

  // Load profile for role-based actions
  useEffect(() => {
    getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    // Pre-fill form if coming from recommendation page
    if (location.state) {
      setForm(prev => ({
        ...prev,
        quantityKg: location.state.quantity || '',
        cropType: location.state.cropType || '',
        toLat: location.state.to?.lat || '',
        toLng: location.state.to?.lng || ''
      }));
    }
    
    // Get farmer's current location
    getFarmerLocation();
    loadBookings();
  }, [location]);

  function getFarmerLocation() {
    if (navigator.geolocation) {
      setLocationStatus(t('gettingLocation'));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            farmerLat: position.coords.latitude,
            farmerLng: position.coords.longitude
          }));
          setLocationStatus(t('locationDetected'));
        },
        (error) => {
          setLocationStatus(t('locationAccessDenied'));
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationStatus(t('geolocationNotSupported'));
    }
  }

  async function loadBookings() {
    try {
      const data = await getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  }

  async function handleAccept(bookingId) {
    try {
      await acceptBooking(bookingId);
      setSuccess('Booking accepted.');
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept booking');
    }
  }

  async function handleReject(bookingId) {
    try {
      await rejectBooking(bookingId);
      setSuccess('Booking rejected.');
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject booking');
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setDrivers([]);

    try {
      // Prepare search data with coordinates
      const searchData = {
        fromMandal: form.fromMandal,
        toMandal: form.toMandal,
        quantityKg: form.quantityKg,
        cropType: form.cropType
      };

      // Add coordinates if available
      if (form.farmerLat && form.farmerLng) {
        searchData.farmerLat = Number(form.farmerLat);
        searchData.farmerLng = Number(form.farmerLng);
      }
      if (form.toLat && form.toLng) {
        searchData.toLat = Number(form.toLat);
        searchData.toLng = Number(form.toLng);
      }

      const data = await findDrivers(searchData);
      setDrivers(data.availableDrivers || []);
      if (data.availableDrivers.length === 0) {
        setError(t('noDriversFound'));
      } else {
        setSuccess(t('foundDrivers', { count: data.availableDrivers.length }));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to find drivers');
    } finally {
      setLoading(false);
    }
  }

  function handleBookDriver(driver) {
    setSelectedDriver(driver);
    setBookingDialogOpen(true);
  }

  async function confirmBooking() {
    if (!selectedDriver) return;

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const bookingData = {
        driverId: selectedDriver.driverId,
        fromMandal: form.fromMandal,
        toMandal: form.toMandal,
        cropType: form.cropType || 'General',
        quantityKg: Number(form.quantityKg)
      };

      // Add coordinates if available
      if (form.farmerLat && form.farmerLng) {
        bookingData.farmerLat = Number(form.farmerLat);
        bookingData.farmerLng = Number(form.farmerLng);
      }
      if (form.toLat && form.toLng) {
        bookingData.toLat = Number(form.toLat);
        bookingData.toLng = Number(form.toLng);
      }

      const data = await createBooking(bookingData);
      setSuccess(`Booking confirmed! Driver ${data.booking.driver.name} has been assigned.`);
      setBookingDialogOpen(false);
      setSelectedDriver(null);
      setDrivers([]); // Clear drivers list
      loadBookings(); // Refresh bookings
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'OnTheWay':
        return 'info';
      case 'Assigned':
        return 'warning';
      case 'Requested':
        return 'default';
      default:
        return 'default';
    }
  }

  return (
    <Box sx={{ minHeight: '80vh', py: 4, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <BackButton />
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsTransitIcon color="primary" />
              {t('transportBooking')}
            </Typography>
            <Button
              variant={showBookings ? 'contained' : 'outlined'}
              onClick={() => setShowBookings(!showBookings)}
            >
              {showBookings ? t('hideMyBookings') : t('viewMyBookings')}
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* My Bookings Section */}
          {showBookings && (
            <Card sx={{ mb: 3, backgroundColor: '#f9f9f9' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('myBookings')}
                </Typography>
                {bookings.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('noBookingsYet')}
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {bookings.map((booking) => (
                      <Grid item xs={12} key={booking._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                              <Box>
                                <Typography variant="h6">{booking.driver?.name || 'Driver'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {booking.driver?.vehicleType} - {booking.driver?.vehicleNumber}
                                </Typography>
                              </Box>
                              <Chip
                                label={booking.status}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>{t('from')}:</strong> {booking.fromMandi}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>{t('to')}:</strong> {booking.toMandi}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>{t('crop')}:</strong> {booking.cropType}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>{t('quantity')}:</strong> {booking.quantityKg} kg
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>{t('estimatedCost')}:</strong> ₹{booking.estimatedCost}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>{t('distance')}:</strong> {booking.distanceKm} km
                                </Typography>
                              </Grid>
                              {booking.driver?.phone && (
                                <Grid item xs={12}>
                                  <Button
                                    size="small"
                                    startIcon={<PhoneIcon />}
                                    href={`tel:${booking.driver.phone}`}
                                  >
                                    {t('callDriver')}: {booking.driver.phone}
                                  </Button>
                                </Grid>
                              )}
                              {/* Accept/Reject for drivers */}
                              {profile?.user?.role === 'driver' && booking.driver && profile.user._id === booking.driver._id &&
                                (booking.status === 'Requested' || booking.status === 'Assigned') && (
                                  <Grid item xs={12} sx={{ mt: 1 }}>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      sx={{ mr: 1 }}
                                      onClick={() => handleAccept(booking._id)}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleReject(booking._id)}
                                    >
                                      Reject
                                    </Button>
                                  </Grid>
                                )}
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search Form */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('findAvailableDrivers')}
              </Typography>
              <Box component="form" onSubmit={handleSearch}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('fromMandal')}
                      value={form.fromMandal}
                      onChange={(e) => setForm({ ...form, fromMandal: e.target.value })}
                      fullWidth
                      required
                      placeholder="e.g., Vijayawada"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('toMandal')}
                      value={form.toMandal}
                      onChange={(e) => setForm({ ...form, toMandal: e.target.value })}
                      fullWidth
                      required
                      placeholder="e.g., Guntur"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('quantityKg')}
                      type="number"
                      value={form.quantityKg}
                      onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                      fullWidth
                      required
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('cropType')}
                      value={form.cropType}
                      onChange={(e) => setForm({ ...form, cropType: e.target.value })}
                      fullWidth
                      placeholder="e.g., Rice, Wheat, Cotton"
                    />
                  </Grid>
                  
                  {/* Location Coordinates Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      {t('locationCoordinates')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('yourLatitude')}
                      type="number"
                      value={form.farmerLat}
                      onChange={(e) => setForm({ ...form, farmerLat: e.target.value })}
                      fullWidth
                      size="small"
                      inputProps={{ step: '0.000001' }}
                      helperText={locationStatus || t('autoDetectedGPS')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('yourLongitude')}
                      type="number"
                      value={form.farmerLng}
                      onChange={(e) => setForm({ ...form, farmerLng: e.target.value })}
                      fullWidth
                      size="small"
                      inputProps={{ step: '0.000001' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('destLatitude')}
                      type="number"
                      value={form.toLat}
                      onChange={(e) => setForm({ ...form, toLat: e.target.value })}
                      fullWidth
                      size="small"
                      inputProps={{ step: '0.000001' }}
                      helperText={t('mandiDestCoords')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('destLongitude')}
                      type="number"
                      value={form.toLng}
                      onChange={(e) => setForm({ ...form, toLng: e.target.value })}
                      fullWidth
                      size="small"
                      inputProps={{ step: '0.000001' }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={getFarmerLocation}
                      sx={{ mb: 1 }}
                    >
                      {t('refreshMyLocation')}
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                      sx={{ py: 1.5 }}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : t('searchDrivers')}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Route Information */}
          {drivers.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>{t('routeCalculation')}:</strong> {t('routeCalcDesc')}{' '}
                {form.farmerLat && form.farmerLng && form.toLat && form.toLng 
                  ? t('usingCoordinates') 
                  : t('provideCoordinatesForBetter')}
              </Typography>
            </Alert>
          )}

          {/* Available Drivers */}
          {drivers.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('availableDrivers')} ({drivers.length})
              </Typography>
              <Grid container spacing={2}>
                {drivers.map((driver) => (
                  <Grid item xs={12} md={6} key={driver.driverId}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {driver.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Rating value={driver.rating} readOnly size="small" precision={0.1} />
                              <Typography variant="body2" color="text.secondary">
                                ({driver.rating.toFixed(1)}) • {driver.totalTrips} trips
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              {t('vehicleType')}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {driver.vehicleType}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              {t('vehicleNumber')}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {driver.vehicleNumber}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              {t('capacity')}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {driver.vehicleCapacityKg} kg
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              {t('costPerKm')}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              ₹{driver.costPerKm}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              {t('currentLocation')}
                            </Typography>
                            <Typography variant="body2">
                              {driver.locationName || driver.currentMandal}
                            </Typography>
                            {driver.driverLocation && (
                              <Typography variant="caption" color="text.secondary">
                                Coordinates: {driver.driverLocation.lat.toFixed(4)}, {driver.driverLocation.lng.toFixed(4)}
                              </Typography>
                            )}
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('estimatedCost')}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            ₹{driver.estimatedCost}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Distance: ~{driver.estimatedDistance} km
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleBookDriver(driver)}
                          startIcon={<CheckCircleIcon />}
                        >
                          {t('bookThisDriver')}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Booking Confirmation Dialog */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('confirmBookingTitle')}</DialogTitle>
        <DialogContent>
          {selectedDriver && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('areYouSureBook')} <strong>{selectedDriver.name}</strong>?
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">{t('from')}</Typography>
                  <Typography variant="body1">{form.fromMandal}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">{t('to')}</Typography>
                  <Typography variant="body1">{form.toMandal}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">{t('quantity')}</Typography>
                  <Typography variant="body1">{form.quantityKg} kg</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">{t('estimatedCost')}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>₹{selectedDriver.estimatedCost}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)} disabled={bookingLoading}>
            {t('cancel')}
          </Button>
          <Button
            onClick={confirmBooking}
            variant="contained"
            disabled={bookingLoading}
            startIcon={bookingLoading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            {bookingLoading ? t('booking') : t('confirmBooking')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
