import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  TextField,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Button
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import SearchIcon from '@mui/icons-material/Search';
import { getDistricts, getMarkets, getMarketDetails } from '../api';

export default function Browse() {
  const { t } = useLanguage();
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [markets, setMarkets] = useState([]);
  const [marketsByDistrict, setMarketsByDistrict] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [marketsLoading, setMarketsLoading] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [marketDetails, setMarketDetails] = useState(null);

  useEffect(() => {
    loadDistricts();
    loadMarkets();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      loadMarkets(selectedDistrict);
    } else {
      loadMarkets();
    }
  }, [selectedDistrict]);

  async function loadDistricts() {
    try {
      const data = await getDistricts();
      setDistricts(data.districts || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMarkets(district = null) {
    setMarketsLoading(true);
    try {
      const data = await getMarkets(district);
      setMarkets(data.markets || []);
      setMarketsByDistrict(data.marketsByDistrict || {});
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setMarketsLoading(false);
    }
  }

  async function handleMarketClick(marketName) {
    try {
      const data = await getMarketDetails(marketName);
      setSelectedMarket(marketName);
      setMarketDetails(data);
    } catch (error) {
      console.error('Error loading market details:', error);
    }
  }

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = searchTerm === '' || 
      market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.district.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredMarketsByDistrict = {};
  Object.keys(marketsByDistrict).forEach(district => {
    const districtMarkets = marketsByDistrict[district].filter(market => {
      return searchTerm === '' || 
        market.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    if (districtMarkets.length > 0) {
      filteredMarketsByDistrict[district] = districtMarkets;
    }
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#4caf50' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f1f8f4', 
      py: 6
    }}>
      <Container maxWidth="lg">
        <BackButton />
        {/* Header */}
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
            {t('browseTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('browseDesc')}
          </Typography>
        </Box>

        {/* Filters */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            mb: 4, 
            bgcolor: '#ffffff',
            borderRadius: 3
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="district-select-label">{t('selectDistrict')}</InputLabel>
                <Select
                  labelId="district-select-label"
                  value={selectedDistrict}
                  label={t('selectDistrict')}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4caf50',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2e7d32',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2e7d32',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>{t('allDistricts')}</em>
                  </MenuItem>
                  {districts.map((district, idx) => (
                    <MenuItem key={idx} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <TextField
                fullWidth
                placeholder={t('searchMarkets')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#4caf50', mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#4caf50',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2e7d32',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2e7d32',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Market Details Modal */}
        {selectedMarket && marketDetails && (
          <Paper
            elevation={8}
            sx={{
              p: 4,
              mb: 4,
              bgcolor: '#ffffff',
              borderRadius: 3,
              border: '2px solid #4caf50'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 700, mb: 1 }}>
                  {marketDetails.market.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#66bb6a', mb: 2 }}>
                  <LocationOnIcon />
                  <Typography variant="body1">
                    {marketDetails.market.district}, Andhra Pradesh
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={() => {
                  setSelectedMarket(null);
                  setMarketDetails(null);
                }}
                sx={{ color: '#666' }}
              >
                {t('close')}
              </Button>
            </Box>
            <Divider sx={{ my: 2, bgcolor: '#c8e6c9' }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2 }}>
                {t('availableCommodities')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {marketDetails.market.commodities.map((commodity, idx) => (
                  <Chip
                    key={idx}
                    label={commodity}
                    sx={{
                      bgcolor: '#e8f5e9',
                      color: '#2e7d32',
                      fontWeight: 500
                    }}
                  />
                ))}
              </Box>
            </Box>
            {marketDetails.latestPrices && marketDetails.latestPrices.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2 }}>
                  {t('recentPrices')}
                </Typography>
                <Grid container spacing={2}>
                  {marketDetails.latestPrices.map((price, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor: '#f1f8f4',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                          {price.commodity}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#4caf50', mt: 1 }}>
                          ₹{price.modalPrice}/kg
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(price.priceDate).toLocaleDateString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        )}

        {/* Markets Display */}
        {marketsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#4caf50' }} />
          </Box>
        ) : selectedDistrict ? (
          // Show markets for selected district
          <Box>
            <Typography variant="h5" sx={{ color: '#2e7d32', mb: 3, fontWeight: 600 }}>
              {t('marketsIn')} {selectedDistrict} ({filteredMarkets.length})
            </Typography>
            <Grid container spacing={3}>
              {filteredMarkets.map((market, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 3,
                      border: '2px solid #c8e6c9',
                      bgcolor: '#ffffff',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                        borderColor: '#4caf50'
                      }
                    }}
                    onClick={() => handleMarketClick(market.name)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                        <StoreIcon sx={{ color: '#4caf50', fontSize: 32, mr: 1.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#2e7d32', 
                              fontWeight: 700,
                              mb: 1
                            }}
                          >
                            {market.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#66bb6a' }}>
                            <LocationOnIcon fontSize="small" />
                            <Typography variant="body2">
                              {market.district}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      {market.commodities && market.commodities.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                          {market.commodities.slice(0, 3).map((commodity, cIdx) => (
                            <Chip
                              key={cIdx}
                              label={commodity}
                              size="small"
                              sx={{
                                bgcolor: '#e8f5e9',
                                color: '#2e7d32',
                                fontSize: '0.7rem'
                              }}
                            />
                          ))}
                          {market.commodities.length > 3 && (
                            <Chip
                              label={`+${market.commodities.length - 3} more`}
                              size="small"
                              sx={{
                                bgcolor: '#f5f5f5',
                                color: '#666',
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          // Show markets grouped by district
          <Box>
            <Typography variant="h5" sx={{ color: '#2e7d32', mb: 3, fontWeight: 600 }}>
              {t('allMarkets')} ({filteredMarkets.length})
            </Typography>
            {Object.keys(filteredMarketsByDistrict).length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#ffffff' }}>
                <Typography variant="body1" color="text.secondary">
                  {t('noMarketsMatchSearch')}
                </Typography>
              </Paper>
            ) : (
              Object.keys(filteredMarketsByDistrict).map((district) => (
                <Box key={district} sx={{ mb: 5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#2e7d32', 
                      mb: 2, 
                      fontWeight: 600,
                      pb: 1,
                      borderBottom: '2px solid #c8e6c9'
                    }}
                  >
                    {district} ({filteredMarketsByDistrict[district].length} {t('markets')})
                  </Typography>
                  <Grid container spacing={3}>
                    {filteredMarketsByDistrict[district].map((market, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card
                          elevation={4}
                          sx={{
                            borderRadius: 3,
                            border: '2px solid #c8e6c9',
                            bgcolor: '#ffffff',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 8,
                              borderColor: '#4caf50'
                            }
                          }}
                          onClick={() => handleMarketClick(market.name)}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                              <StoreIcon sx={{ color: '#4caf50', fontSize: 32, mr: 1.5 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    color: '#2e7d32', 
                                    fontWeight: 700,
                                    mb: 1
                                  }}
                                >
                                  {market.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#66bb6a' }}>
                                  <LocationOnIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {market.district}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            {market.commodities && market.commodities.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                                {market.commodities.slice(0, 3).map((commodity, cIdx) => (
                                  <Chip
                                    key={cIdx}
                                    label={commodity}
                                    size="small"
                                    sx={{
                                      bgcolor: '#e8f5e9',
                                      color: '#2e7d32',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                ))}
                                {market.commodities.length > 3 && (
                                  <Chip
                                    label={`+${market.commodities.length - 3} more`}
                                    size="small"
                                    sx={{
                                      bgcolor: '#f5f5f5',
                                      color: '#666',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
