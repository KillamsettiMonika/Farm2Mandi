import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, Grid, Card, CardContent, Divider, Avatar } from '@mui/material';
import BackButton from '../components/BackButton';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MapIcon from '@mui/icons-material/Map';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import Rating from '@mui/material/Rating';
import { useLanguage } from '../context/LanguageContext';
// Using existing icons to avoid potential resolution issues with some icon names
// (if you prefer these specific icons, ensure @mui/icons-material is installed and Vite restarted)


export default function Home(){
  const phrases = ['price signals', 'market demand', 'distance & transport', 'estimated net profit'];
  const [display, setDisplay] = useState('price signals');
  const [videoError, setVideoError] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      setDisplay(phrases[idx]);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
    
    
      {/* Hero with video loop in a small card and animated subtitle */}
      <Box sx={{ bgcolor: 'background.paper', py: { xs:6, md:12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, lineHeight:1.05 }}>
                {t('heroTitle')}
                <Typography component="span" color="primary.main" sx={{ display:'block', fontSize:20, mt:1, fontWeight:600 }}>
                  {t('heroSubtitle')}
                </Typography>
              </Typography>

              <Typography variant="h6" color="text.secondary" paragraph sx={{ minHeight:56 }}>
                {t('predict')} {""}
                <Box component="span" sx={{ color:'primary.main', fontWeight:700 }}>{display}</Box>
                {" "}{t('andGetMandiSuggestions')}
              </Typography>

              <Box sx={{ mt:3, display:'flex', gap:2 }}>
                <Button href="/input" variant="contained" size="large">{t('getRecommendation')}</Button>
                <Button href="/about" variant="outlined" size="large">{t('learnMore')}</Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ p:0, overflow:'hidden', boxShadow:3 }}>
                <Box sx={{ position:'relative' }}>
                  {!videoError ? (
                    <video
                      src={'/hero.mp4'}
                      poster={'/hero-banner.avif'}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={() => setVideoError(true)}
                      style={{ width: '100%', height: 220, objectFit: 'cover', display:'block' }}
                    />
                  ) : (
                    // Unsplash random farm image as fallback
                    <img
                      src={`https://source.unsplash.com/1200x800/?farm,field,agriculture`}
                      alt="Farm scene"
                      style={{ width: '100%', height: 220, objectFit: 'cover', display:'block' }}
                    />
                  )}
                  <Box sx={{ position:'absolute', bottom:12, left:12, bgcolor:'rgba(0,0,0,0.5)', color:'#fff', px:2, py:1, borderRadius:1 }}>
                    <Typography variant="subtitle1">{t('liveMarketSnapshots')}</Typography>
                    <Typography variant="caption">{t('quickGlance')}</Typography>
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="h6">{t('quickSummary')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('quickSummaryDesc')}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

     

      {/* About / Vision - improved layout */}
      <Box sx={{ py:8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight:700 }}>{t('ourMission')}</Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                {t('ourMissionDesc')}
              </Typography>

              <Grid container spacing={2} sx={{ mt:2 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display:'flex', gap:2, alignItems:'flex-start' }}>
                    <MonetizationOnIcon color="primary" sx={{ fontSize:36 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight:600 }}>{t('sustainableChoices')}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('sustainableDesc')}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display:'flex', gap:2, alignItems:'flex-start' }}>
                    <MapIcon color="primary" sx={{ fontSize:36 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight:600 }}>{t('dataDriven')}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('dataDrivenDesc')}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display:'flex', gap:2, alignItems:'flex-start' }}>
                    <LocalShippingIcon color="primary" sx={{ fontSize:36 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight:600 }}>{t('transparentTimelines')}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('transparentDesc')}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display:'flex', gap:2, alignItems:'flex-start' }}>
                    <SupportAgentIcon color="primary" sx={{ fontSize:36 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight:600 }}>{t('communityFirst')}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('communityDesc')}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display:'flex', gap:2, mt:4 }}>
                <Button href="/input" variant="contained">{t('startNow')}</Button>
                <Button href="/about" variant="outlined">{t('readWhitepaper')}</Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ borderRadius:2, overflow:'hidden', boxShadow:3 }}>
                <img src={'/about.jpg'} alt="Agriculture" style={{ width:'100%', height: 360, objectFit:'cover', display:'block' }} />
              </Box>

              <Grid container spacing={2} sx={{ mt:2 }}>
                <Grid item xs={4}>
                  <Card sx={{ textAlign:'center', p:2 }}>
                    <Typography variant="h6" sx={{ fontWeight:700 }}>+120%</Typography>
                    <Typography variant="caption" color="text.secondary">{t('avgPriceImprovement')}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ textAlign:'center', p:2 }}>
                    <Typography variant="h6" sx={{ fontWeight:700 }}>500+</Typography>
                    <Typography variant="caption" color="text.secondary">{t('mandisIndexed')}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ textAlign:'center', p:2 }}>
                    <Typography variant="h6" sx={{ fontWeight:700 }}>24/7</Typography>
                    <Typography variant="caption" color="text.secondary">{t('transportOptions')}</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ bgcolor:'grey.50', py:8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ textAlign:'center', fontWeight:600 }}>{t('coreFeatures')}</Typography>
          <Grid container spacing={3} sx={{ mt:2 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Avatar sx={{ bgcolor:'primary.main', mb:2 }}><MapIcon /></Avatar>
                  <Typography variant="h6">{t('mandiRankingFeature')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('mandiRankingDesc')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Avatar sx={{ bgcolor:'primary.main', mb:2 }}><LocalShippingIcon /></Avatar>
                  <Typography variant="h6">{t('logistics')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('logisticsFeatureDesc')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Avatar sx={{ bgcolor:'primary.main', mb:2 }}><SupportAgentIcon /></Avatar>
                  <Typography variant="h6">{t('support')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('supportFeatureDesc')}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it works - Roadmap */}
      <Box sx={{ py:8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight:700, mb:4, textAlign:'center' }}>{t('howItWorksRoadmap')}</Typography>

          {/* Responsive roadmap: horizontal on md+, vertical on xs */}
          <Box sx={{ display:'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs:4, md:2 } }}>
            {/** Step 1 */}
            <Box sx={{ flex:1, textAlign:{ xs:'left', md:'center' } }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:2, justifyContent:{ md:'center' } }}>
                <Box sx={{ bgcolor:'primary.main', color:'#fff', width:64, height:64, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:2 }}>
                  <HourglassBottomIcon sx={{ fontSize:32 }} />
                </Box>
                <Box sx={{ display:{ xs:'block', md:'none' } }}>
                  <Typography variant="h6">{t('step1')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('enterDetails')}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt:2, display:{ xs:'none', md:'block' } }}>
                <Typography variant="h6">{t('enterYourDetails')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('enterDetailsDesc')}</Typography>
              </Box>
            </Box>

            {/* connector */}
            <Box sx={{ display:{ xs:'none', md:'flex' }, alignItems:'center', width:80, justifyContent:'center' }}>
              <Box sx={{ height:4, bgcolor:'grey.300', width:'80%' }} />
            </Box>

            {/** Step 2 */}
            <Box sx={{ flex:1, textAlign:{ xs:'left', md:'center' } }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:2, justifyContent:{ md:'center' } }}>
                <Box sx={{ bgcolor:'secondary.main', color:'#fff', width:64, height:64, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:2 }}>
                  <TrendingUpIcon sx={{ fontSize:32 }} />
                </Box>
                <Box sx={{ display:{ xs:'block', md:'none' } }}>
                  <Typography variant="h6">{t('step2')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('getPredictions')}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt:2, display:{ xs:'none', md:'block' } }}>
                <Typography variant="h6">{t('pricePredictionRanking')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('pricePredictionDesc')}</Typography>
              </Box>
            </Box>

            {/* connector */}
            <Box sx={{ display:{ xs:'none', md:'flex' }, alignItems:'center', width:80, justifyContent:'center' }}>
              <Box sx={{ height:4, bgcolor:'grey.300', width:'80%' }} />
            </Box>

            {/** Step 3 */}
            <Box sx={{ flex:1, textAlign:{ xs:'left', md:'center' } }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:2, justifyContent:{ md:'center' } }}>
                <Box sx={{ bgcolor:'#4caf50', color:'#fff', width:64, height:64, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:2 }}>
                  <LocalShippingIcon sx={{ fontSize:32 }} />
                </Box>
                <Box sx={{ display:{ xs:'block', md:'none' } }}>
                  <Typography variant="h6">{t('step3')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('chooseTransport')}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt:2, display:{ xs:'none', md:'block' } }}>
                <Typography variant="h6">{t('selectTransport')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('selectTransportDesc')}</Typography>
              </Box>
            </Box>

            {/* connector */}
            <Box sx={{ display:{ xs:'none', md:'flex' }, alignItems:'center', width:80, justifyContent:'center' }}>
              <Box sx={{ height:4, bgcolor:'grey.300', width:'80%' }} />
            </Box>

            {/** Step 4 */}
            <Box sx={{ flex:1, textAlign:{ xs:'left', md:'center' } }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:2, justifyContent:{ md:'center' } }}>
                <Box sx={{ bgcolor:'primary.main', color:'#fff', width:64, height:64, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:2 }}>
                  <CheckCircleIcon sx={{ fontSize:32 }} />
                </Box>
                <Box sx={{ display:{ xs:'block', md:'none' } }}>
                  <Typography variant="h6">{t('step4')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('completeAndTrack')}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt:2, display:{ xs:'none', md:'block' } }}>
                <Typography variant="h6">{t('completeTrack')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('completeTrackDesc')}</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>



       {/* Testimonials */}
      <Box sx={{ py:8, bgcolor:'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight:700, mb:4, textAlign:'center' }}>{t('whatFarmersSay')}</Typography>
          <Grid container spacing={3}>
            {[
              { text: t('testimonial1'), name: 'Ramesh Kumar', place: 'Andhra Pradesh', rating: 5 },
              { text: t('testimonial2'), name: 'Sita Devi', place: 'Uttar Pradesh', rating: 4 },
              { text: t('testimonial3'), name: 'Vikram Singh', place: 'Punjab', rating: 5 }
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card sx={{ minHeight:200, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <CardContent>
                    <Box sx={{ display:'flex', gap:1, alignItems:'center', mb:1 }}>
                      <FormatQuoteIcon color="primary" />
                      <Typography variant="body1" sx={{ fontWeight:600 }}>{t('farmerFeedback')}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>{item.text}</Typography>
                  </CardContent>
                  <CardContent sx={{ pt:0 }}>
                    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight:700 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.place}</Typography>
                      </Box>
                      <Rating value={item.rating} readOnly size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Transport CTA */}
      <Box sx={{ bgcolor:'primary.main', color:'primary.contrastText', py:6 }}>
        <Container maxWidth="lg" sx={{ textAlign:'center' }}>
          <Typography variant="h5" sx={{ fontWeight:600 }}>{t('needTransport')}</Typography>
          <Typography variant="body1" sx={{ mb:2 }}>{t('findTrucksDesc')}</Typography>
          <Button href="/transport" variant="contained" color="secondary">{t('findTrucks')}</Button>
        </Container>
      </Box>

      {/* Footer is now a shared component rendered by App */}
    </div>
  );
}
