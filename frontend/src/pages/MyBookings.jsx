import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getMyBookings, acceptBooking, rejectBooking, cancelBooking, getProfile } from '../api';

export default function MyBookings() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
    loadBookings();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(bookingId) {
    try {
      await acceptBooking(bookingId);
      setSuccess('Booking accepted successfully!');
      setError('');
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept booking');
      setSuccess('');
    }
  }

  async function handleReject(bookingId) {
    try {
      await rejectBooking(bookingId);
      setSuccess('Booking rejected successfully!');
      setError('');
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject booking');
      setSuccess('');
    }
  }

  async function handleFarmerCancel(bookingId) {
    try {
      await cancelBooking(bookingId);
      setSuccess('Booking cancelled successfully!');
      setError('');
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
      setSuccess('');
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Requested':
      case 'Assigned':
        return 'warning';
      case 'Accepted':
        return 'success';
      case 'Rejected':
      case 'Cancelled':
        return 'error';
      case 'OnTheWay':
        return 'info';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton />
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <DirectionsTransitIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight="bold">
            My Bookings
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {loading ? (
          <Typography>Loading bookings...</Typography>
        ) : bookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No bookings yet
            </Typography>
            {profile?.user?.role === 'farmer' && (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/transport')}
              >
                Book Transport
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {bookings.map((booking) => (
              <Grid item xs={12} key={booking._id}>
                <Card variant="outlined" sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        {profile?.user?.role === 'driver' && booking.farmerId && (
                          <Typography variant="h6">
                            Farmer: {booking.farmerId.name || 'Unknown'}
                          </Typography>
                        )}
                        {profile?.user?.role === 'farmer' && booking.driver && (
                          <Typography variant="h6">
                            Driver: {booking.driver.name || 'Unknown'}
                          </Typography>
                        )}
                        {booking.driver?.vehicleType && (
                          <Typography variant="body2" color="text.secondary">
                            {booking.driver.vehicleType} - {booking.driver.vehicleNumber}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="medium"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>From:</strong> {booking.fromMandi}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>To:</strong> {booking.toMandi}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Crop:</strong> {booking.cropType}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Quantity:</strong> {booking.quantityKg} kg
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Estimated Cost:</strong> ₹{booking.estimatedCost}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Distance:</strong> {booking.distanceKm} km
                        </Typography>
                      </Grid>
                      
                      {/* Phone numbers */}
                      {profile?.user?.role === 'driver' && booking.farmerId?.phone && (
                        <Grid item xs={12}>
                          <Button
                            size="small"
                            startIcon={<PhoneIcon />}
                            href={`tel:${booking.farmerId.phone}`}
                          >
                            Call Farmer: {booking.farmerId.phone}
                          </Button>
                        </Grid>
                      )}
                      {profile?.user?.role === 'farmer' && booking.driver?.phone && (
                        <Grid item xs={12}>
                          <Button
                            size="small"
                            startIcon={<PhoneIcon />}
                            href={`tel:${booking.driver.phone}`}
                          >
                            Call Driver: {booking.driver.phone}
                          </Button>
                        </Grid>
                      )}

                      {/* Accept/Reject buttons for drivers */}
                      {profile?.user?.role === 'driver' &&
                        (booking.status === 'Requested' || booking.status === 'Assigned') && (
                          <Grid item xs={12} sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleAccept(booking._id)}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleReject(booking._id)}
                              >
                                Reject
                              </Button>
                            </Box>
                          </Grid>
                        )}

                      {profile?.user?.role === 'farmer' &&
                        !['Rejected', 'Cancelled', 'Delivered'].includes(booking.status) && (
                          <Grid item xs={12} sx={{ mt: 1 }}>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleFarmerCancel(booking._id)}
                            >
                              Cancel Booking
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
      </Paper>
    </Container>
  );
}
