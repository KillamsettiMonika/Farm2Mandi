import { createTheme } from '@mui/material/styles';

// Friendly, earthy color palette for agriculture
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // green
      contrastText: '#fff'
    },
    secondary: {
      main: '#ffb300' // amber for CTA
    },
    background: {
      default: '#f7faf7',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: 'Inter, Arial, Helvetica, sans-serif'
  }
});

export default theme;
