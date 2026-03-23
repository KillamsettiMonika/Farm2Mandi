import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Slide,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useLanguage } from '../context/LanguageContext';

export default function InstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iphone|ipad|ipod/.test(
      window.navigator.userAgent.toLowerCase()
    );
    setIsIOS(ios);

    // Check if user dismissed before (respect for 3 days)
    const dismissed = localStorage.getItem('farm2mandi_install_dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < threeDays) return;
    }

    // For Android/Chrome - listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay so page loads first
      setTimeout(() => setShowPrompt(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // For iOS - show custom prompt after delay if on mobile
    if (ios && !standalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('farm2mandi_install_dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) return null;
  // Don't show if no prompt available and not iOS
  if (!showPrompt) return null;

  return (
    <Slide direction="up" in={showPrompt} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
          color: '#fff',
          mx: { xs: 0, sm: 'auto' },
          maxWidth: { sm: 480 },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          {/* Close button */}
          <IconButton
            onClick={handleDismiss}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'rgba(255,255,255,0.7)',
              '&:hover': { color: '#fff' },
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Content */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '12px',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isIOS ? (
                <IosShareIcon sx={{ fontSize: 28 }} />
              ) : (
                <GetAppIcon sx={{ fontSize: 28 }} />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {t('addToHomeScreen')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.3 }}>
                {t('installAppDesc')}
              </Typography>
            </Box>
          </Box>

          {/* iOS instructions */}
          {isIOS && !deferredPrompt && (
            <Box sx={{ mb: 2, pl: 1 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                1. {t('iosInstallStep1')} <IosShareIcon sx={{ fontSize: 16 }} />
              </Typography>
              <Typography variant="body2">
                2. {t('iosInstallStep2')}
              </Typography>
            </Box>
          )}

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button
              onClick={handleDismiss}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {t('notNow')}
            </Button>
            {isIOS ? (
              <Button
                variant="contained"
                onClick={handleDismiss}
                sx={{
                  bgcolor: '#fff',
                  color: '#2e7d32',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  '&:hover': { bgcolor: '#e8f5e9' },
                }}
              >
                {t('gotIt')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleInstall}
                startIcon={<GetAppIcon />}
                sx={{
                  bgcolor: '#fff',
                  color: '#2e7d32',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  '&:hover': { bgcolor: '#e8f5e9' },
                }}
              >
                {t('install')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
}
