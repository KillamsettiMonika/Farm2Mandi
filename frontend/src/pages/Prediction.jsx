import React from 'react';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function Prediction(){
  const { t } = useLanguage();
  const data = JSON.parse(localStorage.getItem('lastPrediction') || 'null');
  if (!data) return <div className="card"><BackButton />{t('noPredictionData')}</div>;
  return (
    <div>
      <BackButton />
      <h2>{t('predictionTitle')}</h2>
      <div className="card">Crop: {data.input.crop}</div>
      <div className="card">Predicted Price: {data.result.predictedPrice}</div>
    </div>
  );
}
