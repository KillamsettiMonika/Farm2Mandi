import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function Welcome2() {
  const { t } = useLanguage();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "Farmer";

  const backgroundStyle = {
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundImage: `
      linear-gradient(rgba(4,64,14,0.65), rgba(4,64,14,0.65)), 
      url(https://media.istockphoto.com/id/824796632/photo/tractor-spraying-pesticides-on-soybean-field-with-sprayer-at-spring.jpg?s=612x612&w=0&k=20&c=51i6Kw2bSv0EIrxv8iAR7QeEaXm8evFecYc0LX3v4Z8=)
    `
  };

  return (
    <div style={backgroundStyle}>
      <BackButton />

      <div
        style={{
          textAlign: "center",
          color: "white",
          maxWidth: "700px",
          padding: "30px"
        }}
      >
        <h2 style={{ fontSize: "2.8rem", marginBottom: "20px" }}>
          Welcome, {userName} 
        </h2>

        <p
          style={{
            fontSize: "1.3rem",
            marginBottom: "45px",
            lineHeight: "1.6"
          }}
        >
          {t('farm2mandiDesc')}
        </p>

        <Link
          to="/input"
          style={{
            padding: "14px 28px",
            background: "#16a34a",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "1rem",
            transition: "0.3s ease"
          }}
        >
          {t('goToInput')}
        </Link>
      </div>
    </div>
  );
}