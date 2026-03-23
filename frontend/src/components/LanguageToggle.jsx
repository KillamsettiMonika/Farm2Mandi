import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button, Box, Typography } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

export default function LanguageToggle({ compact = false }) {
  const { language, toggleLanguage, t } = useLanguage();

  if (compact) {
    return (
      <Button
        onClick={toggleLanguage}
        size="small"
        startIcon={<TranslateIcon />}
        sx={{
          color: '#2e7d32',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 'auto',
          border: '1px solid #2e7d32',
          borderRadius: '20px',
          px: 1.5,
          py: 0.5,
          fontSize: '0.8rem',
          '&:hover': {
            backgroundColor: '#e8f5e9',
          }
        }}
      >
        {language === 'en' ? 'తెలుగు' : 'English'}
      </Button>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <TranslateIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
      <Button
        onClick={toggleLanguage}
        size="small"
        sx={{
          color: '#2e7d32',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 'auto',
          px: 1,
          '&:hover': {
            backgroundColor: '#e8f5e9',
          }
        }}
      >
        {language === 'en' ? 'తెలుగు' : 'English'}
      </Button>
    </Box>
  );
}
