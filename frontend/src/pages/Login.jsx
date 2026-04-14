import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grow
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login, requestOtp } from '../api';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  const qs = new URLSearchParams(location.search);
  const nextPath = qs.get('next');

  async function handleSendOtp() {
    setErr('');
    setInfo('');
    setSendingOtp(true);
    try {
      const data = await requestOtp({ phone, purpose: 'login' });
      setOtpSent(true);
      setInfo('OTP sent to your mobile number.');
      setDevOtp(data.devOtp || '');
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setInfo('');
    setLoading(true);
    try {
      const data = await login({ phone, otp });
      localStorage.setItem('user', JSON.stringify(data.user));
      if (nextPath && nextPath.startsWith('/')) nav(nextPath);
      else nav('/');
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        backgroundColor: '#ecf9ef',
        backgroundImage:
          'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}
    >
      <Grow in timeout={600}>
        <Container maxWidth="sm">
          <BackButton sx={{ mb: 1 }} />
          <Paper elevation={12} sx={{ p: 5, borderRadius: 2, boxShadow: '0 18px 40px rgba(8,30,15,0.18)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <LockOutlinedIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {t('welcomeBack')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in securely with mobile OTP
                </Typography>
              </Grid>
            </Grid>

            {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
            {info && <Alert severity="success" sx={{ mt: 2 }}>{info}</Alert>}


            <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
              <TextField
                label="Mobile Number"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                required
                margin="normal"
              />

              {otpSent && (
                <TextField
                  label={t('otp')}
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
              )}

              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  disabled={sendingOtp || !phone}
                  onClick={handleSendOtp}
                >
                  {sendingOtp ? <CircularProgress size={20} color="inherit" /> : t('sendOtp')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !otpSent || !otp}
                  sx={{ backgroundColor: '#2e7d32', color: '#fff', fontWeight: 700 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : t('signIn')}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'primary.main' }}>
                  {t('createAccount')}
                </Link>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Grow>
    </Box>
  );
}
