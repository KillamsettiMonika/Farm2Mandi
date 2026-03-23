import React, { useState, useEffect, useRef } from 'react';
import BackButton from '../components/BackButton';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import UpdateIcon from '@mui/icons-material/Update';
import { updateDriverLocation, getMyLocation } from '../api';
import { getProfile } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function DriverLocation() {
  const { t } = useLanguage();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [driverStatus, setDriverStatus] = useState('Idle');
  const intervalRef = useRef(null);

  // Load current location and status on mount
  useEffect(() => {
    loadLocation();
    loadDriverStatus();
  }, []);

  // Auto-update logic
  useEffect(() => {
    if (autoUpdate) {
      // Determine update interval based on status
      const interval = driverStatus === 'OnTrip' ? 5000 : 60000; // 5s for OnTrip, 60s otherwise
      
      // Update immediately
      updateLocation();
      
      // Set up interval
      intervalRef.current = setInterval(() => {
        updateLocation();
      }, interval);
    } else {
      // Clear interval when auto-update is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoUpdate, driverStatus]);

  // Update interval when status changes
  useEffect(() => {
    if (autoUpdate && intervalRef.current) {
      clearInterval(intervalRef.current);
      const interval = driverStatus === 'OnTrip' ? 5000 : 60000;
      intervalRef.current = setInterval(() => {
        updateLocation();
      }, interval);
    }
  }, [driverStatus, autoUpdate]);

  async function loadLocation() {
    try {
      const data = await getMyLocation();
      setLocation(data.location);
      setDriverStatus(data.location.status || 'Idle');
    } catch (err) {
      console.error('Failed to load location:', err);
    }
  }

  async function loadDriverStatus() {
    try {
      const profile = await getProfile();
      if (profile.user && profile.user.status) {
        setDriverStatus(profile.user.status);
      }
    } catch (err) {
      console.error('Failed to load driver status:', err);
    }
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  async function updateLocation() {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const position = await getCurrentPosition();
      const data = await updateDriverLocation(position.latitude, position.longitude);
      
      setLocation(data.location);
      setSuccess(`Location updated: ${data.location.locationName}`);
      
      // Update driver status if available
      if (data.location.status) {
        setDriverStatus(data.location.status);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to update location';
      setError(errorMsg);
      console.error('Update location error:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatTimeAgo(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`;
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }

  function getStatusColor(status) {
    switch (status) {
      case 'OnTrip':
        return 'error';
      case 'Assigned':
        return 'warning';
      case 'Idle':
        return 'success';
      default:
        return 'default';
    }
  }

  return (
    <Box sx={{ minHeight: '80vh', py: 4, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="md">
        <BackButton />
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="primary" />
              {t('locationTracking')}
            </Typography>
            {driverStatus && (
              <Chip 
                label={driverStatus} 
                color={getStatusColor(driverStatus)}
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Current Location Card */}
          <Card sx={{ mb: 3, backgroundColor: '#f9f9f9' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('currentLocationTitle')}
              </Typography>
              
              {location && location.latitude ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Location:</strong> {location.locationName || 'Loading...'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('latitude')}:</strong> {location.latitude.toFixed(6)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('longitude')}:</strong> {location.longitude.toFixed(6)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('lastUpdated')}:</strong> {formatTimeAgo(location.lastUpdate)}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('noLocationData')}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UpdateIcon />}
                  onClick={updateLocation}
                  disabled={loading}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : t('updateLocation')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('autoUpdate')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {driverStatus === 'OnTrip' 
                          ? t('updatesEvery5s') 
                          : t('updatesEvery60s')}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>
          </Box>

          {/* Info Box */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>{t('howItWorksDriver')}</strong>
              <br />
              • {t('driverLocationHelp1')}
              <br />
              • {t('driverLocationHelp2')}
              <br />
              • {t('driverLocationHelp3')}
              <br />
              • {t('driverLocationHelp4')}
              <br />
              • {t('driverLocationHelp5')}
            </Typography>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
}
