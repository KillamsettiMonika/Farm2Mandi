import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Button,
  Paper,
  Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MapIcon from '@mui/icons-material/Map';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useLanguage } from '../context/LanguageContext';

export default function Recommendation(){
  const data = JSON.parse(localStorage.getItem('lastPrediction') || 'null');
  const { t } = useLanguage();
  
  if (!data) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f1f8f4', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            {t('noRecommendationData')}
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  const result = data.result || {};
  const mandis = result.mandis || [];
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f1f8f4', 
      py: 6,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Container maxWidth="lg" sx={{ width: '100%' }}>
        <BackButton />
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: '#2e7d32', 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            {t('marketRecommendations')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('bestMarkets')}
          </Typography>
        </Box>

        {/* Summary Card */}
        {result.predictedPrice && (
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              mb: 4, 
              bgcolor: '#ffffff',
              borderRadius: 3,
              border: '2px solid #4caf50',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">{t('commodity')}</Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                  {result.commodity || data.input?.commodity}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">{t('predictedPrice')}</Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                  ₹{result.predictedPrice}/Quintal
                </Typography>
              </Grid>
              {result.quantity && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">{t('quantity')}</Typography>
                  <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    {result.quantity} Quintal
                  </Typography>
                </Grid>
              )}
              
              {/* Enhanced Prediction Info */}
              
              
              {mandis.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('totalMarketsFound')}: <strong style={{ color: '#2e7d32' }}>{result.allMandisCount || mandis.length}</strong>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Markets Display */}
        {mandis.length === 0 ? (
          <Paper 
            elevation={2}
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: '#ffffff',
              borderRadius: 3,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            <Typography variant="h5" sx={{ color: '#f57c00', mb: 2, fontWeight: 600 }}>
              {'🔍 ' + t('noMarketsFound')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {t('noMarketsDesc', { commodity: result.commodity || data.input?.commodity })}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('noMarketsReasons')}
            </Typography>
            <Box sx={{ textAlign: 'left', mb: 3, maxWidth: '400px', mx: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • {t('reason1')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • {t('reason2')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • {t('reason3')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                component={Link} 
                to="/input" 
                variant="contained" 
                sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
              >
                {t('tryAgain')}
              </Button>
              <Button 
                component={Link} 
                to="/browse" 
                variant="outlined"
                sx={{ borderColor: '#4caf50', color: '#2e7d32' }}
              >
                {t('browseAllMarkets')}
              </Button>
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {mandis.map((m, idx) => (
              <Grid item xs={12} sm={10} md={8} lg={7} key={idx}>
                <Card 
                  elevation={idx === 0 ? 8 : 4}
                  sx={{ 
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: idx === 0 ? '3px solid #4caf50' : '2px solid #c8e6c9',
                    bgcolor: '#ffffff',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 12
                    },
                    position: 'relative'
                  }}
                >
                  {idx === 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1
                      }}
                    >
                      <Chip
                        icon={<EmojiEventsIcon />}
                        label={t('bestChoice')}
                        sx={{
                          bgcolor: '#4caf50',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 32
                        }}
                      />
                    </Box>
                  )}
                  
                  <CardContent sx={{ p: 4 }}>
                    {/* Market Name */}
                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#2e7d32',
                          mb: 1,
                          fontSize: { xs: '1.5rem', md: '1.75rem' }
                        }}
                      >
                        {m.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#66bb6a' }}>
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="body1" color="text.secondary">
                          {m.district}, Andhra Pradesh
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3, bgcolor: '#c8e6c9' }} />

                    {/* Stats Grid */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <LocalShippingIcon sx={{ color: '#4caf50', fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {t('distance')}
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                            {m.distance_km} km
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {t('pricePerKg')}
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                            ₹{m.predicted_price}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <DirectionsTransitIcon sx={{ color: '#ff9800', fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {t('transport')}
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 600 }}>
                            ₹{m.transport_cost}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <AttachMoneyIcon sx={{ color: idx === 0 ? '#4caf50' : '#66bb6a', fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {t('profit')}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: idx === 0 ? '#2e7d32' : '#388e3c', 
                              fontWeight: 700,
                              fontSize: '1.25rem'
                            }}
                          >
                            ₹{m.estimated_profit}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {m.revenue && (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          mb: 3, 
                          bgcolor: '#e8f5e9', 
                          borderRadius: 2,
                          border: '1px solid #c8e6c9'
                        }}
                      >
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>{t('totalRevenue')}:</strong> ₹{m.revenue} 
                              <span style={{ color: '#666', fontSize: '0.9em' }}>
                                {' '}(₹{m.predicted_price} × {result.quantity || 10} Quintal)
                              </span>
                            </Typography>
                          </Grid>
                          
                        </Grid>
                      </Paper>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                      <Button
                        component={Link}
                        to="/map"
                        state={{ mandi: m, farmerLocation: result.farmerLocation }}
                        variant="outlined"
                        startIcon={<MapIcon />}
                        sx={{
                          flex: { xs: '1 1 100%', sm: '1 1 auto' },
                          borderColor: '#4caf50',
                          color: '#2e7d32',
                          '&:hover': {
                            borderColor: '#2e7d32',
                            bgcolor: '#e8f5e9'
                          },
                          fontWeight: 600
                        }}
                      >
                        {t('viewOnMap')}
                      </Button>
                      <Button
                        component={Link}
                        to="/transport"
                        state={{ 
                          from: result.farmerLocation, 
                          to: { lat: m.latitude, lng: m.longitude }, 
                          quantity: result.quantity || 1000 
                        }}
                        variant="contained"
                        startIcon={<DirectionsTransitIcon />}
                        sx={{
                          flex: { xs: '1 1 100%', sm: '1 1 auto' },
                          bgcolor: '#4caf50',
                          '&:hover': {
                            bgcolor: '#2e7d32'
                          },
                          fontWeight: 600
                        }}
                      >
                        {t('transportOptionsBtn')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Query Details */}
        {data.input && (
          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              mt: 4, 
              bgcolor: '#ffffff',
              borderRadius: 3,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
              {t('queryDetails')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>{t('commodity')}:</strong> {data.input.commodity || data.input.crop}<br/>
              <strong>{t('date')}:</strong> {data.input.date}<br/>
              <strong>{t('location')}:</strong> {data.input.lat && data.input.lng ? `${data.input.lat}, ${data.input.lng}` : data.input.location}
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
