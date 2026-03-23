import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function Welcome1() {
  const { t } = useLanguage();
  return (
    <div>
      <BackButton />
      <h1>{t('farm2mandiTitle')}</h1>
      <p>{t('farm2mandiDesc')}</p>
      <p>
        <Link to="/register">{t('register')}</Link> | <Link to="/login">{t('login')}</Link>
      </p>
    </div>
  );
}
