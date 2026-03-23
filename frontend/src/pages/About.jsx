import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Button, Card, CardContent, Avatar, Divider, Stack, Chip, Grow } from '@mui/material';
import BackButton from '../components/BackButton';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MapIcon from '@mui/icons-material/Map';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PeopleIcon from '@mui/icons-material/People';
import { useLanguage } from '../context/LanguageContext';

export default function About(){
  const { t } = useLanguage();
  const statsInit = [ {label:'Avg price uplift', value:120, key:'avgPriceUplift'}, {label:'Mandis indexed', value:500, key:'mandisIndexed'}, {label:'Transport partners', value:24, key:'transportPartners'} ];
  const [counts, setCounts] = useState(statsInit.map(()=>0));

  useEffect(()=>{
    const durations = [900, 1000, 900];
    const timers = statsInit.map((s, idx)=>{
      const step = Math.max(1, Math.round(s.value / (durations[idx] / 30)));
      return setInterval(()=>{
        setCounts(prev => {
          const next = [...prev];
          if(next[idx] < s.value) next[idx] = Math.min(s.value, next[idx] + step);
          return next;
        });
      }, 30);
    });
    return ()=> timers.forEach(t=>clearInterval(t));
  }, []);

  const features = [
    { title: t('accurateForecasts'), desc: t('forecastDesc'), icon: <ShowChartIcon /> },
    { title: t('mandiRanking'), desc: t('mandiRankingDesc'), icon: <MapIcon /> },
    { title: t('optimizedLogistics'), desc: t('optimizedLogisticsDesc'), icon: <LocalShippingIcon /> },
    { title: t('farmerFirstSupport'), desc: t('farmerFirstSupportDesc'), icon: <PeopleIcon /> }
  ];

  return (
    <Box sx={{ pb:8 }}>
      <Container maxWidth="lg" sx={{ pt: 2 }}><BackButton /></Container>
      {/* Hero */}
      <Box sx={{
        position:'relative',
        color:'#fff',
        py:{ xs:8, md:14 },
        backgroundImage: `linear-gradient(rgba(4,64,14,0.65), rgba(4,64,14,0.65)), url(https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=60)`,
        backgroundSize:'cover',
        backgroundPosition:'center'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight:800, mb:2, letterSpacing: -0.5 }}>{t('aboutTitle')}</Typography>
                </Box>
              </Grow>

              <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={900}>
                <Box>
                  <Typography variant="h6" sx={{ mb:3, color:'rgba(255,255,255,0.9)' }}>
                    {t('aboutDesc')}
                  </Typography>
                </Box>
              </Grow>

              <Stack direction="row" spacing={2} sx={{ mt:3 }}>
                <Button variant="contained" size="large" href="/input">{t('getRecommendationBtn')}</Button>
                <Button variant="outlined" size="large" href="/contact" sx={{ color:'#fff', borderColor:'rgba(255,255,255,0.3)' }}>{t('contactSales')}</Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ bgcolor:'rgba(255,255,255,0.9)', color:'text.primary', boxShadow:6 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight:700, mb:1 }}>{t('whyFarmersLoveIt')}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('whyFarmersLoveItDesc')}
                  </Typography>

                  <Grid container spacing={1}>
                    {features.slice(0,3).map((f,i)=> (
                      <Grid item xs={12} key={i}>
                        <Box sx={{ display:'flex', gap:2, alignItems:'center' }}>
                          <Avatar sx={{ bgcolor:'primary.main' }}>{f.icon}</Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight:700 }}>{f.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{f.desc}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Container maxWidth="lg" sx={{ mt:6 }}>
        <Typography variant="h4" sx={{ fontWeight:700, mb:3, textAlign:'center' }}>{t('whatWeProvide')}</Typography>
        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700 + i*150}>
                <Card sx={{ p:2, height:'100%' }}>
                  <CardContent>
                    <Avatar sx={{ bgcolor:'primary.main', mb:2 }}>{f.icon}</Avatar>
                    <Typography variant="h6" sx={{ fontWeight:700 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works timeline */}
      <Box sx={{ py:8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight:700, mb:3, textAlign:'center' }}>{t('howItWorksAbout')}</Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
                {[
                  {title:t('tellUsAboutCrop'), text:t('tellUsAboutCropDesc')},
                  {title:t('weRunForecasts'), text:t('weRunForecastsDesc')},
                  {title:t('mandiRankingStep'), text:t('mandiRankingStepDesc')},
                  {title:t('bookTransportTrack'), text:t('bookTransportTrackDesc')}
                ].map((s, idx) => (
                  <Box key={idx} sx={{ display:'flex', gap:2, alignItems:'flex-start' }}>
                    <Chip label={s.title} color="primary" sx={{ minWidth:140, fontWeight:700 }} />
                    <Typography variant="body2" color="text.secondary">{s.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ borderRadius:2, overflow:'hidden', boxShadow:3 }}>
                <img src={'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1200&q=60'} alt="how it works" style={{ width:'100%', height:360, objectFit:'cover', display:'block' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Impact counters */}
      <Container maxWidth="lg" sx={{ mt:2 }}>
        <Divider sx={{ mb:4 }} />
        <Grid container spacing={3}>
          {statsInit.map((s, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ textAlign:'center', p:3 }}>
                <Typography variant="h4" sx={{ fontWeight:800 }}>{counts[i]}{i===0?'%':''}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight:700 }}>{t(s.key)}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ mt:6 }}>
        <Typography variant="body2" color="text.secondary" align="center">{t('aboutFooter')}</Typography>
      </Container>
    </Box>
  );
}
