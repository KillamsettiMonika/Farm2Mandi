import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Forgot from './pages/Forgot';
import Welcome2 from './pages/Welcome2';
import InputPage from './pages/InputPage';
import Prediction from './pages/Prediction';
import Recommendation from './pages/Recommendation';
import MapView from './pages/MapView';
import Transport from './pages/Transport';
import Tracking from './pages/Tracking';
import MyBookings from './pages/MyBookings';
import About from './pages/About';
import Contact from './pages/Contact';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Browse from './pages/Browse';
import DriverLocation from './pages/DriverLocation';
import DriverBookings from './pages/DriverBookings';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import RequireAuth from './components/RequireAuth';
import { LanguageProvider } from './context/LanguageContext';
import InstallPrompt from './components/InstallPrompt';

import Loader from './components/Loader';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000); // show loader for 3s
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Loader />;

  return (
    <LanguageProvider>
    <div className="app">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/welcome2" element={<Welcome2 />} />
          <Route path="/input" element={<RequireAuth><InputPage /></RequireAuth>} />
          <Route path="/prediction" element={<RequireAuth><Prediction /></RequireAuth>} />
          <Route path="/recommendation" element={<RequireAuth><Recommendation /></RequireAuth>} />
          <Route path="/map" element={<RequireAuth><MapView /></RequireAuth>} />
          <Route path="/transport" element={<RequireAuth><Transport /></RequireAuth>} />
          <Route path="/transport/my-bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
          <Route path="/tracking" element={<RequireAuth><Tracking /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/driver-location" element={<RequireAuth><DriverLocation /></RequireAuth>} />
          <Route path="/driver-bookings" element={<RequireAuth><DriverBookings /></RequireAuth>} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
      <InstallPrompt />
    </div>
    </LanguageProvider>
  );
}
