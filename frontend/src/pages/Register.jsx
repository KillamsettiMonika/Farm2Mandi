import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grow,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { register, requestOtp } from '../api';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const { t } = useLanguage();
  const [role, setRole] = useState('farmer');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    otp: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    aadhar: '',
    farm_size: '',
    crops: '',
    driverId: '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleCapacityKg: '',
    currentMandal: '',
    costPerKm: ''
  });
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const nav = useNavigate();

  async function handleSendOtp() {
    setErr('');
    setInfo('');
    setSendingOtp(true);
    try {
      const data = await requestOtp({ phone: form.phone, purpose: 'register' });
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
      const submitData = {
        role,
        name: form.name,
        phone: form.phone,
        otp: form.otp
      };

      if (role === 'farmer') {
        submitData.village = form.village;
        submitData.district = form.district;
        submitData.state = form.state;
        submitData.pincode = form.pincode;
        submitData.aadhar = form.aadhar;
        submitData.farm_size = form.farm_size ? Number(form.farm_size) : null;
        submitData.crops = form.crops;
      } else {
        submitData.driverId = form.driverId;
        submitData.vehicleType = form.vehicleType;
        submitData.vehicleNumber = form.vehicleNumber;
        submitData.vehicleCapacityKg = Number(form.vehicleCapacityKg);
        submitData.currentMandal = form.currentMandal;
        submitData.costPerKm = Number(form.costPerKm);
      }

      const data = await register(submitData);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/welcome2');
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Registration failed');
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
                  <PersonAddIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {t('createNewAccount')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Register with your mobile number and OTP
                </Typography>
              </Grid>
            </Grid>

            {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
            {info && <Alert severity="success" sx={{ mt: 2 }}>{info}</Alert>}
            {devOtp && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Dev OTP: {devOtp}
              </Alert>
            )}

            <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>{t('iAmA')}</Typography>
                <ToggleButtonGroup
                  value={role}
                  exclusive
                  onChange={(e, newRole) => newRole && setRole(newRole)}
                  fullWidth
                >
                  <ToggleButton value="farmer" sx={{ py: 1.5, fontWeight: 600 }}>
                    {t('farmer')}
                  </ToggleButton>
                  <ToggleButton value="driver" sx={{ py: 1.5, fontWeight: 600 }}>
                    {t('driver')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TextField
                label={t('fullName')}
                name="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                fullWidth
                required
                margin="normal"
              />

              <TextField
                label="Mobile Number"
                name="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                fullWidth
                required
                margin="normal"
              />

              {otpSent && (
                <TextField
                  label={t('otp')}
                  name="otp"
                  value={form.otp}
                  onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))}
                  fullWidth
                  required
                  margin="normal"
                />
              )}

              {role === 'driver' && (
                <>
                  <TextField
                    label={t('driverId')}
                    name="driverId"
                    value={form.driverId}
                    onChange={(e) => setForm((f) => ({ ...f, driverId: e.target.value }))}
                    fullWidth
                    required
                    margin="normal"
                  />

                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>{t('vehicleType')}</InputLabel>
                    <Select
                      value={form.vehicleType}
                      onChange={(e) => setForm((f) => ({ ...f, vehicleType: e.target.value }))}
                      label={t('vehicleType')}
                    >
                      <MenuItem value="Mini Truck">Mini Truck</MenuItem>
                      <MenuItem value="Pickup Van">Pickup Van</MenuItem>
                      <MenuItem value="Tractor">Tractor</MenuItem>
                      <MenuItem value="Lorry">Lorry</MenuItem>
                      <MenuItem value="Container">Container</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label={t('vehicleNumber')}
                    name="vehicleNumber"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))}
                    fullWidth
                    required
                    margin="normal"
                  />

                  <TextField
                    label={t('vehicleCapacity')}
                    name="vehicleCapacityKg"
                    value={form.vehicleCapacityKg}
                    onChange={(e) => setForm((f) => ({ ...f, vehicleCapacityKg: e.target.value }))}
                    fullWidth
                    required
                    type="number"
                    margin="normal"
                  />

                  <TextField
                    label={t('currentMandalLabel')}
                    name="currentMandal"
                    value={form.currentMandal}
                    onChange={(e) => setForm((f) => ({ ...f, currentMandal: e.target.value }))}
                    fullWidth
                    required
                    margin="normal"
                  />

                  <TextField
                    label={t('costPerKmLabel')}
                    name="costPerKm"
                    value={form.costPerKm}
                    onChange={(e) => setForm((f) => ({ ...f, costPerKm: e.target.value }))}
                    fullWidth
                    required
                    type="number"
                    margin="normal"
                  />
                </>
              )}

              {role === 'farmer' && (
                <>
                  <TextField
                    label={t('village')}
                    name="village"
                    value={form.village}
                    onChange={(e) => setForm((f) => ({ ...f, village: e.target.value }))}
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label={t('district')}
                    name="district"
                    value={form.district}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label={t('state')}
                    name="state"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label={t('pincode')}
                    name="pincode"
                    value={form.pincode}
                    onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label={t('aadhar')}
                    name="aadhar"
                    value={form.aadhar}
                    onChange={(e) => setForm((f) => ({ ...f, aadhar: e.target.value }))}
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label={t('farmSize')}
                    name="farm_size"
                    value={form.farm_size}
                    onChange={(e) => setForm((f) => ({ ...f, farm_size: e.target.value }))}
                    fullWidth
                    type="number"
                    margin="normal"
                  />

                  <TextField
                    label={t('crops')}
                    name="crops"
                    value={form.crops}
                    onChange={(e) => setForm((f) => ({ ...f, crops: e.target.value }))}
                    fullWidth
                    margin="normal"
                  />
                </>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  disabled={sendingOtp || !form.phone}
                  onClick={handleSendOtp}
                >
                  {sendingOtp ? <CircularProgress size={20} color="inherit" /> : t('sendOtp')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !otpSent || !form.otp}
                  sx={{ backgroundColor: '#2e7d32', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : t('signUp')}
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'primary.main' }}>
                {t('alreadyHaveAccount')}
              </Link>
            </Box>
          </Paper>
        </Container>
      </Grow>
    </Box>
  );
}
