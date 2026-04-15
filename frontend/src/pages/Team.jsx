import React from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, CardMedia, Button, Stack, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';
import monikaImg from '../components/TeamImages/monika.jpeg';
import dhanalaxmiImg from '../components/TeamImages/dhanalaxmi.jpeg';
import srinivasImg from '../components/TeamImages/srinivas.jpeg';
import joshiImg from '../components/TeamImages/joshi.jpeg';

export default function Team() {
  const { t } = useLanguage();

  const teamMembers = [
    {
      name: 'Killamsetti Monika',
      role: 'Full Stack Developer',
      image: monikaImg,
      github: 'https://github.com/KillamsettiMonika',
      linkedin: 'https://www.linkedin.com/in/monika-killamsetti-760518288'
    },
    {
      name: 'Sanapala Dhanalaxmi',
      role: 'Backend Developer',
      image: dhanalaxmiImg,
      github: 'https://github.com/DhanalaxmiSanapala2005',
      linkedin: 'https://www.linkedin.com/in/dhanalaxmi-sanapala-2877b9315/'
    },
    {
      name: 'Sai Srinivas Panda',
      role: 'ML Engineer',
      image: srinivasImg,
      github: 'https://github.com/saisrinivas04',
      linkedin: 'https://www.linkedin.com/in/saisrinivaspanda'
    },
    {
      name: 'Ijjina Joshi Kumar',
      role: 'Frontend Developer',
      image: joshiImg,
      github: 'https://github.com/warriorjosh',
      linkedin: 'https://www.linkedin.com/in/joshi-kumar/'
    }
  ];

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <BackButton />
      </Container>

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        color: '#fff',
        py: { xs: 8, md: 12 },
        backgroundImage: `linear-gradient(rgba(4,64,14,0.75), rgba(4,64,14,0.75)), url(https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=60)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, letterSpacing: -0.5 }}>
            {t('ourTeam')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, color: 'rgba(255,255,255,0.9)' }}>
            {t('teamDescription')}
          </Typography>
        </Container>
      </Box>

      {/* Team Members Grid */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}>
                {/* Team Member Image */}
                <CardMedia
                  component="img"
                  height="300"
                  image={member.image}
                  alt={member.name}
                  sx={{
                    objectFit: 'cover',
                    backgroundColor: '#f0f0f0'
                  }}
                />

                {/* Team Member Info */}
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {member.role}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Social Links */}
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GitHubIcon />}
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        textTransform: 'none',
                        flex: 1,
                        color: '#333',
                        borderColor: '#ddd',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          borderColor: '#333'
                        }
                      }}
                    >
                      GitHub
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LinkedInIcon />}
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        textTransform: 'none',
                        flex: 1,
                        color: '#0A66C2',
                        borderColor: '#0A66C2',
                        '&:hover': {
                          backgroundColor: '#f0f7ff',
                          borderColor: '#0A66C2'
                        }
                      }}
                    >
                      LinkedIn
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer Message */}
      
    </Box>
  );
}
