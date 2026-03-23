import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { getProfile } from '../api';

export default function RequireAuth({ children }){
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(()=>{
    // quick local check first
    const stored = localStorage.getItem('user');
    if (stored) {
      setAuthed(true);
      setChecked(true);
      return;
    }

    // verify session cookie with backend
    getProfile().then(()=>{
      setAuthed(true);
    }).catch(()=>{
      setAuthed(false);
    }).finally(()=> setChecked(true));
  }, []);

  if (!checked) return (
    <Box sx={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <CircularProgress />
    </Box>
  );

  if (!authed) {
    // redirect to login and include original path
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}
