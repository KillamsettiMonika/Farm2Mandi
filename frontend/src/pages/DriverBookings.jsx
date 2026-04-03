import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DirectionsIcon from '@mui/icons-material/Directions';
import PhoneIcon from '@mui/icons-material/Phone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getDriverBookings, acceptBooking, rejectBooking, completeBooking } from '../api';
import { useLanguage } from '../context/LanguageContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function DriverBookings() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogAction, setDialogAction] = useState(null); // 'accept', 'reject', or 'complete'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError('');
      const data = await getDriverBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load bookings';
      setError(errorMsg);
      console.error('Load bookings error:', err);
    } finally {
      setLoading(false);
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

  function openActionDialog(booking, action) {
    setSelectedBooking(booking);
    setDialogAction(action);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setSelectedBooking(null);
    setDialogAction(null);
  }

  async function handleAcceptBooking() {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      setError('');
      await acceptBooking(selectedBooking._id);
      setSuccess(`Booking from ${selectedBooking.farmerName} accepted!`);
      closeDialog();
      await loadBookings();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to accept booking';
      setError(errorMsg);
      console.error('Accept booking error:', err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectBooking() {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      setError('');
      await rejectBooking(selectedBooking._id);
      setSuccess(`Booking from ${selectedBooking.farmerName} rejected`);
      closeDialog();
      await loadBookings();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to reject booking';
      setError(errorMsg);
      console.error('Reject booking error:', err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCompleteBooking() {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      setError('');
      await completeBooking(selectedBooking._id);
      setSuccess(`✓ Delivery completed! You are now Idle.`);
      closeDialog();
      await loadBookings();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to complete booking';
      setError(errorMsg);
      console.error('Complete booking error:', err);
    } finally {
      setActionLoading(false);
    }
  }

  function handleConfirmAction() {
    if (dialogAction === 'accept') {
      handleAcceptBooking();
    } else if (dialogAction === 'reject') {
      handleRejectBooking();
    } else if (dialogAction === 'complete') {
      handleCompleteBooking();
    }
  }

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => ['Requested', 'Assigned'].includes(b.status));
  const acceptedBookings = bookings.filter(b => ['Accepted', 'OnTheWay', 'Delivered'].includes(b.status));
  const rejectedBookings = bookings.filter(b => b.status === 'Rejected' || b.status === 'Cancelled');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '80vh', py: 4, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <BackButton />
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsIcon color="primary" />
            {t('bookingHistoryManagement')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('manageTransportationBookings')}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {bookings.length === 0 ? (
            <Alert severity="info">
              {t('noBookingsYet')}. When farmers book your transportation service, they will appear here.
            </Alert>
          ) : (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={(e, newValue) => setTabValue(newValue)}
                  aria-label="booking tabs"
                >
                  <Tab 
                    label={`Pending (${pendingBookings.length})`} 
                    id="booking-tab-0"
                  />
                  <Tab 
                    label={`Accepted (${acceptedBookings.length})`} 
                    id="booking-tab-1"
                  />
                  <Tab 
                    label={`Rejected (${rejectedBookings.length})`} 
                    id="booking-tab-2"
                  />
                </Tabs>
              </Box>

              {/* Pending Bookings Tab */}
              <TabPanel value={tabValue} index={0}>
                {pendingBookings.length === 0 ? (
                  <Alert severity="info">No pending bookings</Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Farmer</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Crop</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Quantity (kg)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Route</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Est. Cost</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pendingBookings.map((booking) => (
                          <TableRow key={booking._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {booking.farmerName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <PhoneIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="caption">{booking.farmerPhone}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{booking.cropType}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{booking.quantityKg}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {booking.fromMandi} → {booking.toMandi}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ₹{booking.estimatedCost?.toFixed(2) || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => openActionDialog(booking, 'accept')}
                                  sx={{ textTransform: 'none' }}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<CancelIcon />}
                                  onClick={() => openActionDialog(booking, 'reject')}
                                  sx={{ textTransform: 'none' }}
                                >
                                  Reject
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              {/* Accepted Bookings Tab */}
              <TabPanel value={tabValue} index={1}>
                {acceptedBookings.length === 0 ? (
                  <Alert severity="info">No accepted bookings</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {acceptedBookings.map((booking) => (
                      <Grid item xs={12} md={6} key={booking._id}>
                        <Card sx={{ height: '100%', backgroundColor: '#f0f8ff' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {booking.farmerName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <PhoneIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="body2">{booking.farmerPhone}</Typography>
                                </Box>
                              </Box>
                              <Chip
                                label={booking.status}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                            </Box>

                            <Box sx={{ backgroundColor: '#ffffff', p: 2, borderRadius: 1, mb: 2 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Crop Type
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {booking.cropType}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Quantity
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {booking.quantityKg} kg
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="caption" color="text.secondary">
                                    Route
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {booking.fromMandi} → {booking.toMandi}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Distance
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {booking.distanceKm?.toFixed(2)} km
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Cost
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                    ₹{booking.estimatedCost?.toFixed(2) || 'N/A'}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>

                            <Typography variant="caption" color="text.secondary">
                              Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </Typography>

                            {booking.status !== 'Delivered' && (
                              <Box sx={{ mt: 2 }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  fullWidth
                                  startIcon={<DoneAllIcon />}
                                  onClick={() => openActionDialog(booking, 'complete')}
                                  sx={{ textTransform: 'none' }}
                                >
                                  ✓ Booking Successful (Delivered)
                                </Button>
                              </Box>
                            )}
                            {booking.status === 'Delivered' && (
                              <Box sx={{ mt: 2 }}>
                                <Chip 
                                  label="✓ Completed" 
                                  color="success" 
                                  variant="outlined"
                                  fullWidth
                                  icon={<DoneAllIcon />}
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>

              {/* Rejected Bookings Tab */}
              <TabPanel value={tabValue} index={2}>
                {rejectedBookings.length === 0 ? (
                  <Alert severity="info">No rejected bookings</Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#fff3e0' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Farmer</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Crop</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rejectedBookings.map((booking) => (
                          <TableRow key={booking._id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {booking.farmerName}
                              </Typography>
                            </TableCell>
                            <TableCell>{booking.cropType}</TableCell>
                            <TableCell>
                              <Chip
                                label={booking.status}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(booking.updatedAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            </>
          )}
        </Paper>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {dialogAction === 'accept' ? 'Accept Booking' : dialogAction === 'reject' ? 'Reject Booking' : 'Mark Delivery Complete'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedBooking && (
              <>
                {dialogAction === 'accept' && (
                  <>
                    Are you sure you want to <strong>accept</strong> the booking from{' '}
                    <strong>{selectedBooking.farmerName}</strong> for{' '}
                    <strong>{selectedBooking.quantityKg} kg</strong> of{' '}
                    <strong>{selectedBooking.cropType}</strong>?
                    <br />
                    <br />
                    Route: {selectedBooking.fromMandi} → {selectedBooking.toMandi}
                    <br />
                    Estimated Cost: ₹{selectedBooking.estimatedCost?.toFixed(2) || 'N/A'}
                  </>
                )}
                {dialogAction === 'reject' && (
                  <>
                    Are you sure you want to <strong>reject</strong> the booking from{' '}
                    <strong>{selectedBooking.farmerName}</strong> for{' '}
                    <strong>{selectedBooking.quantityKg} kg</strong> of{' '}
                    <strong>{selectedBooking.cropType}</strong>?
                    <br />
                    <br />
                    Route: {selectedBooking.fromMandi} → {selectedBooking.toMandi}
                    <br />
                    Estimated Cost: ₹{selectedBooking.estimatedCost?.toFixed(2) || 'N/A'}
                  </>
                )}
                {dialogAction === 'complete' && (
                  <>
                    Have you successfully delivered the goods to <strong>{selectedBooking.toMandi}</strong>?
                    <br />
                    <br />
                    Farmer: <strong>{selectedBooking.farmerName}</strong>
                    <br />
                    Crop: <strong>{selectedBooking.cropType}</strong> ({selectedBooking.quantityKg} kg)
                    <br />
                    <br />
                    After marking complete:
                    <br />
                    ✓ Booking status will be set to "Delivered"
                    <br />
                    ✓ Your status will return to "Idle"
                    <br />
                    ✓ Location updates will go back to 60-second intervals
                  </>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={dialogAction === 'accept' ? 'success' : dialogAction === 'reject' ? 'error' : 'primary'}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionLoading ? 'Processing...' : dialogAction === 'accept' ? 'Accept' : dialogAction === 'reject' ? 'Reject' : 'Confirm Delivery'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
