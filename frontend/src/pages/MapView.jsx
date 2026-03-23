import React from 'react';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function MapView(){
  const { t } = useLanguage();
  // Placeholder map view. Integrate Leaflet/Google Maps later.
  return (
    <div>
      <BackButton />
      <h2>{t('mapViewTitle')}</h2>
      <div className="card">{t('mapViewDesc')}</div>
    </div>
  );
}
