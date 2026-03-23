import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Grid, Paper, TextField, Typography, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getProfile, updateProfile, changePassword } from '../api';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function Profile() {
  const { t } = useLanguage();
  const [userRole, setUserRole] = useState('farmer');
  const [form, setForm] = useState({ 
    name:'', email:'', phone:'', 
    // Farmer fields
    village:'', district:'', state:'', pincode:'', aadhar:'', farm_size:'', crops:'',
    // Driver fields
    driverId:'', vehicleType:'', vehicleNumber:'', vehicleCapacityKg:'', currentMandal:'', costPerKm:''
  });
  const [originalForm, setOriginalForm] = useState({ 
    name:'', email:'', phone:'', 
    village:'', district:'', state:'', pincode:'', aadhar:'', farm_size:'', crops:'',
    driverId:'', vehicleType:'', vehicleNumber:'', vehicleCapacityKg:'', currentMandal:'', costPerKm:''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pwForm, setPwForm] = useState({ oldPassword:'', newPassword:'' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        // Get role from localStorage first
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        const role = stored?.role || 'farmer';
        setUserRole(role);

        const data = await getProfile();
        const u = data.user;
        
        let initialForm;
        if (role === 'driver') {
          // Driver profile fields
          initialForm = {
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            driverId: u.driverId || '',
            vehicleType: u.vehicleType || '',
            vehicleNumber: u.vehicleNumber || '',
            vehicleCapacityKg: u.vehicleCapacityKg || '',
            currentMandal: u.currentMandal || '',
            costPerKm: u.costPerKm || '',
            // Clear farmer fields
            village: '', district: '', state: '', pincode: '', aadhar: '', farm_size: '', crops: ''
          };
        } else {
          // Farmer profile fields
          initialForm = {
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            village: u.village || '',
            district: u.district || '',
            state: u.state || '',
            pincode: u.pincode || '',
            aadhar: u.aadhar || '',
            farm_size: u.farm_size || '',
            crops: Array.isArray(u.crops) ? u.crops.join(', ') : (u.crops || ''),
            // Clear driver fields
            driverId: '', vehicleType: '', vehicleNumber: '', vehicleCapacityKg: '', currentMandal: '', costPerKm: ''
          };
        }
        setForm(initialForm);
        setOriginalForm(initialForm);
      }catch(e){
        setErr(e.response?.data?.error || e.message || 'Failed to load profile');
      }finally{ setLoading(false); }
    }
    load();
  },[]);

  async function save(e){
    e.preventDefault();
    setErr(''); setMsg(''); setSaving(true);
    try{
      let payload;
      if (userRole === 'driver') {
        // Only send driver-specific fields
        payload = {
          name: form.name,
          phone: form.phone,
          vehicleType: form.vehicleType,
          vehicleCapacityKg: form.vehicleCapacityKg ? Number(form.vehicleCapacityKg) : '',
          currentMandal: form.currentMandal,
          costPerKm: form.costPerKm ? Number(form.costPerKm) : ''
        };
      } else {
        // Only send farmer-specific fields
        payload = {
          name: form.name,
          phone: form.phone,
          village: form.village,
          district: form.district,
          state: form.state,
          pincode: form.pincode,
          aadhar: form.aadhar,
          farm_size: form.farm_size ? Number(form.farm_size) : '',
          crops: form.crops
        };
      }
      
      const res = await updateProfile(payload);
      setMsg(t('profileSaved'));
      setOriginalForm({ ...form });
      setIsEditing(false);
      // update stored user name if changed
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (stored && res.user?.name && res.user.name !== stored.name) {
        localStorage.setItem('user', JSON.stringify({ ...stored, name: res.user.name }));
      }
    }catch(e){
      setErr(e.response?.data?.error || e.message || 'Failed to save');
    }finally{ setSaving(false); }
  }

  function handleEdit(){
    setIsEditing(true);
    setErr('');
    setMsg('');
  }

  function handleCancel(){
    setForm({ ...originalForm });
    setIsEditing(false);
    setErr('');
    setMsg('');
  }

  async function changePwd(e){
    e.preventDefault();
    setErr(''); setMsg(''); setPwLoading(true);
    try{
      await changePassword(pwForm);
      setMsg(t('passwordChanged'));
      setPwForm({ oldPassword:'', newPassword:'' });
    }catch(e){
      setErr(e.response?.data?.error || e.message || 'Failed to change password');
    }finally{ setPwLoading(false); }
  }

  if (loading) return (
    <Box sx={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}><CircularProgress /></Box>
  );

  return (
    <Box sx={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', py:6 }}>
      <Container maxWidth="md">
        <BackButton />
        <Paper sx={{ p:4 }} elevation={8}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
            <Typography variant="h5" sx={{ fontWeight:700 }}>{t('myProfile')}</Typography>
            {!isEditing && (
              <Button variant="outlined" color="primary" onClick={handleEdit}>{t('edit')}</Button>
            )}
          </Box>

          {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}
          {msg && <Alert severity="success" sx={{ mb:2 }}>{msg}</Alert>}

          <Box component="form" onSubmit={save}>
            <Grid container spacing={2}>
              {/* Common Fields */}
              <Grid item xs={12} sm={6}>
                <TextField label={t('fullName')} value={form.name} onChange={e=>setForm(f=>({ ...f, name:e.target.value }))} fullWidth required disabled={!isEditing} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t('emailLabel')} value={form.email} fullWidth disabled />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label={t('phone')} value={form.phone} onChange={e=>setForm(f=>({ ...f, phone:e.target.value }))} fullWidth disabled={!isEditing} />
              </Grid>

              {/* Driver-Specific Fields */}
              {userRole === 'driver' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField label={t('driverId')} value={form.driverId} fullWidth disabled />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>{t('vehicleType')}</InputLabel>
                      <Select
                        value={form.vehicleType}
                        onChange={e=>setForm(f=>({ ...f, vehicleType:e.target.value }))}
                        label={t('vehicleType')}
                      >
                        <MenuItem value="Mini Truck">Mini Truck</MenuItem>
                        <MenuItem value="Pickup Van">Pickup Van</MenuItem>
                        <MenuItem value="Tractor">Tractor</MenuItem>
                        <MenuItem value="Lorry">Lorry</MenuItem>
                        <MenuItem value="Container">Container</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField label={t('vehicleNumber')} value={form.vehicleNumber} fullWidth disabled />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label={t('vehicleCapacity')} 
                      value={form.vehicleCapacityKg} 
                      onChange={e=>setForm(f=>({ ...f, vehicleCapacityKg:e.target.value }))} 
                      fullWidth 
                      type="number"
                      disabled={!isEditing} 
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label={t('currentMandalLabel')} 
                      value={form.currentMandal} 
                      onChange={e=>setForm(f=>({ ...f, currentMandal:e.target.value }))} 
                      fullWidth 
                      disabled={!isEditing} 
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label={t('costPerKmLabel')} 
                      value={form.costPerKm} 
                      onChange={e=>setForm(f=>({ ...f, costPerKm:e.target.value }))} 
                      fullWidth 
                      type="number"
                      disabled={!isEditing} 
                    />
                  </Grid>
                </>
              )}

              {/* Farmer-Specific Fields */}
              {userRole === 'farmer' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField label={t('aadhar')} value={form.aadhar} onChange={e=>setForm(f=>({ ...f, aadhar:e.target.value }))} fullWidth disabled={!isEditing} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField label={t('village')} value={form.village} onChange={e=>setForm(f=>({ ...f, village:e.target.value }))} fullWidth disabled={!isEditing} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField label={t('district')} value={form.district} onChange={e=>setForm(f=>({ ...f, district:e.target.value }))} fullWidth disabled={!isEditing} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField label={t('state')} value={form.state} onChange={e=>setForm(f=>({ ...f, state:e.target.value }))} fullWidth disabled={!isEditing} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField label={t('pincode')} value={form.pincode} onChange={e=>setForm(f=>({ ...f, pincode:e.target.value }))} fullWidth disabled={!isEditing} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField label={t('farmSize')} value={form.farm_size} onChange={e=>setForm(f=>({ ...f, farm_size:e.target.value }))} fullWidth type="number" disabled={!isEditing} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField label={t('crops')} value={form.crops} onChange={e=>setForm(f=>({ ...f, crops:e.target.value }))} fullWidth disabled={!isEditing} />
                  </Grid>
                </>
              )}

              {isEditing && (
                <Grid item xs={12} sx={{ display:'flex', justifyContent:'flex-end', gap:2 }}>
                  <Button variant="outlined" onClick={handleCancel} disabled={saving}>{t('cancel')}</Button>
                  <Button type="submit" variant="contained" color="primary" disabled={saving}>{saving ? <CircularProgress size={20} color="inherit"/> : t('saveProfile')}</Button>
                </Grid>
              )}
            </Grid>
          </Box>

          <Box sx={{ mt:4 }}>
            <Typography variant="h6" sx={{ mb:1 }}>{t('changePassword')}</Typography>
            <Box component="form" onSubmit={changePwd} sx={{ display:'grid', gap:2 }}>
              <TextField label={t('oldPassword')} value={pwForm.oldPassword} type="password" onChange={e=>setPwForm(p=>({ ...p, oldPassword:e.target.value }))} fullWidth />
              <TextField label={t('newPassword')} value={pwForm.newPassword} type="password" onChange={e=>setPwForm(p=>({ ...p, newPassword:e.target.value }))} fullWidth />
              <Box sx={{ display:'flex', justifyContent:'flex-end' }}>
                <Button type="submit" variant="outlined" disabled={pwLoading}>{pwLoading ? <CircularProgress size={18} /> : t('changePassword')}</Button>
              </Box>
            </Box>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}
