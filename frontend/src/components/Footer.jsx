import React from 'react';
import { Box, Container, Grid, Typography, TextField, Button, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function Footer(){
  return (
    <Box component="footer" sx={{ bgcolor:'grey.100', py:6, mt:0 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight:700, mb:1 }}>Farm2Mandi</Typography>
            <Typography variant="body2" color="text.secondary">AI-powered mandi recommendations, transport options and tracking to help farmers get better prices.</Typography>
            <Box sx={{ mt:2 }}>
              <IconButton aria-label="facebook"><FacebookIcon /></IconButton>
              <IconButton aria-label="twitter"><TwitterIcon /></IconButton>
              <IconButton aria-label="instagram"><InstagramIcon /></IconButton>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight:700, mb:1 }}>Quick links</Typography>
            <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
              <Link href="/" underline="none">Home</Link>
              <Link href="/input" underline="none">Get recommendation</Link>
              <Link href="/transport" underline="none">Transport</Link>
              <Link href="/about" underline="none">About</Link>
              <Link href="/contact" underline="none">Contact</Link>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight:700, mb:1 }}>Contact</Typography>
            <Typography variant="body2" color="text.secondary">support@farm2mandi.example</Typography>
            <Typography variant="body2" color="text.secondary">+91 98765 43210</Typography>
            <Typography variant="body2" color="text.secondary">Office: Hyderabad, India</Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight:700, mb:1 }}>Newsletter</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb:1 }}>Get short market updates by email.</Typography>
            <Box component="form" onSubmit={(e)=>e.preventDefault()} sx={{ display:'flex', gap:1 }}>
              <TextField placeholder="Email address" size="small" sx={{ flex:1 }} />
              <Button variant="contained" type="submit">Subscribe</Button>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt:4, borderTop:1, borderColor:'grey.200', pt:2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} Farm2Mandi — All rights reserved</Typography>
          <Typography variant="caption" color="text.secondary">Built for farmers • Privacy • Terms</Typography>
        </Box>
      </Container>
    </Box>
  );
}
