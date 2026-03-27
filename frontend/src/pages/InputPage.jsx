import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Grid, Alert } from '@mui/material';
import { predict } from '../api';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function InputPage(){
  const { t } = useLanguage();
  const nav = useNavigate();

  const [form, setForm] = useState({
    commodity: 'Rice',
    date: new Date().toISOString().split('T')[0],
    lat: '',
    lng: '',
    quantity: '10'
  });

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus(t('gettingLocation'));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          }));
          setLocationStatus(t('locationDetected'));
        },
        () => {
          setLocationStatus(t('enterCoordinates'));
        }
      );
    }
  }, []);

  function handleChange(e){
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e){
    e.preventDefault();
    setErr('');
    setLoading(true);

    if (!form.lat || !form.lng) {
      setErr(t('provideCoordinates'));
      setLoading(false);
      return;
    }

    try {
      const data = await predict({
        commodity: form.commodity,
        date: form.date,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        quantity: form.quantity
      });

      localStorage.setItem('lastPrediction', JSON.stringify({
        input: form,
        result: data
      }));

      nav('/recommendation');

    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'An error occurred');
      setLoading(false);
    }
  }

  return (
    <Box sx={{ py:8 }}>
      <Container maxWidth="md">
        <BackButton />

        <Typography variant="h4" sx={{ fontWeight:700, mb:2 }}>
          {t('inputTitle')}
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Enter crop details to get price prediction.
        </Typography>

        {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}
        {locationStatus && <Alert severity="info" sx={{ mb:2 }}>{locationStatus}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label={t('commodity')}
                name="commodity"
                value={form.commodity}
                onChange={handleChange}
                fullWidth
                required
                SelectProps={{ native: true }}
              >
                
            <option value="Rice">{t('Rice')}</option>
            <option value="Banana">{t('Banana')}</option>
            <option value="Cotton">{t('Cotton')}</option>
            <option value="Tomato">{t('Tomato')}</option>
            <option value="Groundnut">{t('Groundnut')}</option>
            <option value="Maize">{t('Maize')}</option>
            <option value="Mango">{t('Mango')}</option>
            <option value="Turmeric">{t('Turmeric')}</option>
            <option value="Onion">{t('Onion')}</option>
            <option value="Green Chilli">{t('Green Chilli')}</option>
            <option value="Brinjal">{t('Brinjal')}</option>
            <option value="Papaya">{t('Papaya')}</option>
            <option value="Jowar">{t('Jowar')}</option>
            <option value="Red Gram">{t('Red Gram')}</option>
            <option value="Bajra">{t('Bajra')}</option>
            <option value="Black Gram Dal">{t('Black Gram Dal')}</option>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label={t('date')}
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label={t('quantityLabel')}
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label={t('latitude')}
                type="number"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label={t('longitude')}
                type="number"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? t('predicting') : t('predictButton')}
              </Button>
            </Grid>

          </Grid>
        </Box>
      </Container>
    </Box>
  );
}