import React, { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Alert } from '@mui/material';
import { forgotOtp, resetWithOtp } from '../api';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function Forgot(){
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState('send'); // send -> verify
  const [loading, setLoading] = useState(false);

  async function sendOtp(e){
    e.preventDefault();
    setMsg(''); setLoading(true);
    try{
  const res = await forgotOtp({ email });
  setMsg(res.message || 'If an account exists, an OTP was sent to the email.');
      setStage('verify');
    }catch(e){
      setMsg(e.response?.data?.error || e.message || 'Failed to request OTP');
    }finally{ setLoading(false); }
  }

  async function verify(e){
    e.preventDefault();
    setMsg(''); setLoading(true);
    try{
      await resetWithOtp({ email, otp, newPassword });
      // After backend sets auth cookie, fetch profile to populate client state
      try{
        const profile = await (await import('../api')).getProfile();
        if (profile?.user) localStorage.setItem('user', JSON.stringify(profile.user));
      }catch(err){
        // ignore - user may still be logged in via cookie
      }
      setMsg('Password reset successful. You are now logged in.');
      // navigate to home (dashboard) so NavBar re-renders and protected routes work
      setTimeout(()=> window.location.href = '/', 700);
    }catch(e){
      setMsg(e.response?.data?.error || e.message || 'Failed to reset password');
    }finally{ setLoading(false); }
  }

  return (
    <Box sx={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Container maxWidth="sm">
        <BackButton />
        <Paper sx={{ p:4 }} elevation={8}>
          <Typography variant="h5" sx={{ mb:2 }}>{t('forgotTitle')}</Typography>

          {msg && <Alert severity="info" sx={{ mb:2 }}>{msg}</Alert>}

          {stage === 'send' ? (
            <Box component="form" onSubmit={sendOtp} sx={{ display:'grid', gap:2 }}>
              <TextField label={t('emailLabel')} value={email} onChange={e=>setEmail(e.target.value)} required fullWidth />
              <Box sx={{ display:'flex', justifyContent:'flex-end' }}>
                <Button type="submit" variant="contained" disabled={loading}>{loading ? t('sending') : t('sendOtp')}</Button>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={verify} sx={{ display:'grid', gap:2 }}>
              <TextField label={t('emailLabel')} value={email} onChange={e=>setEmail(e.target.value)} required fullWidth />
              <TextField label={t('otp')} value={otp} onChange={e=>setOtp(e.target.value)} fullWidth />
              <TextField label={t('newPassword')} type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} fullWidth required />
              <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                <Button variant="text" onClick={()=>setStage('send')}>{t('back')}</Button>
                <Button type="submit" variant="contained" disabled={loading}>{loading ? t('resetting') : t('resetPassword')}</Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
