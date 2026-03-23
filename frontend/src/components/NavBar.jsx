import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import logo from './farm2mandi1.png';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

export default function NavBar(){
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isDriver = user && user.role === 'driver';
  const { t } = useLanguage();

  const pages = [
    { label: t('home'), to: '/' },
    { label: t('about'), to: '/about' },
    { label: t('contact'), to: '/contact' }
  ];

  function handleLogout(){
    import('../api').then(m=>m.logout()).catch(()=>{}).finally(()=>{
      localStorage.removeItem('user');
      nav('/');
    });
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'inherit', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} elevation={3}>
      <Toolbar sx={{ minHeight: '64px !important', height: '64px' }}>
        <Box sx={{ display:'flex', alignItems:'center', cursor:'pointer' }} onClick={()=>nav('/') }>
          <img src={logo} alt="Farm2Mandi" style={{ height:105, marginRight:12, objectFit: 'contain', maxWidth: '400px' }} />
          
        </Box>

        <Box sx={{ flexGrow:1 }} />

        {isMobile ? (
          <>
            <IconButton edge="end" sx={{ color: '#333' }} onClick={()=>setOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={open} onClose={()=>setOpen(false)}>
              <Box sx={{ width:260 }} role="presentation" onClick={()=>setOpen(false)}>
                <List>
                  {pages.map(p=> (
                    <ListItem key={p.to} disablePadding>
                      <ListItemButton component={RouterLink} to={p.to}>
                        <ListItemText primary={p.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {user && !isDriver && (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={'/input'}>
                          <ListItemText primary={t('input')} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={'/transport'}>
                          <ListItemText primary={t('transport')} />
                        </ListItemButton>
                      </ListItem>
                    </>
                  )}
                  {user && isDriver && (
                    <ListItem disablePadding>
                      <ListItemButton component={RouterLink} to={'/driver-location'}>
                        <ListItemText primary={t('locationTracking')} />
                      </ListItemButton>
                    </ListItem>
                  )}
                  {!user ? (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={'/login'}>
                          <ListItemText primary={t('login')} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={'/register'}>
                          <ListItemText primary={t('register')} />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => { nav('/profile'); setOpen(false); }}>
                          <ListItemText primary={user.name} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                          <ListItemText primary={t('logout')} />
                        </ListItemButton>
                      </ListItem>
                    </>
                  )}
                  <ListItem disablePadding sx={{ mt: 1 }}>
                    <ListItemButton>
                      <LanguageToggle compact />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
            {pages.map(p=> (
              <Button key={p.to} sx={{ color: '#333', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }} component={RouterLink} to={p.to}>{p.label}</Button>
            ))}
            {user && !isDriver && (
              <>
                <Button sx={{ color: '#333', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }} component={RouterLink} to={'/input'}>{t('input')}</Button>
                <Button sx={{ color: '#333', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }} component={RouterLink} to={'/transport'}>{t('transport')}</Button>
              </>
            )}
            {user && isDriver && (
              <Button sx={{ color: '#333', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }} component={RouterLink} to={'/driver-location'}>{t('locationTracking')}</Button>
            )}
            <LanguageToggle compact />
            {user ? (
              <>
                <Typography 
                  sx={{ ml:1, mr:2, color: '#333', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }} 
                  onClick={() => nav('/profile')}
                >
                  {user.name}
                </Typography>
                <Button sx={{ color: '#333', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }} onClick={handleLogout}>{t('logout')}</Button>
              </>
            ) : (
              <>
                <Button sx={{ color: '#333', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }} component={RouterLink} to={'/login'}>{t('login')}</Button>
                <Button color="primary" variant="contained" component={RouterLink} to={'/register'} sx={{ ml:1 }}>{t('register')}</Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
