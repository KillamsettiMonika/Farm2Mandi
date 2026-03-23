import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackButton({ label = 'Back', sx = {} }) {
  const navigate = useNavigate();

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(-1)}
      sx={{
        color: '#2e7d32',
        fontWeight: 600,
        textTransform: 'none',
        mb: 2,
        '&:hover': {
          backgroundColor: '#e8f5e9',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
}
