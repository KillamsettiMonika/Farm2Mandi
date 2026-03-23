import React, { useState } from 'react';
import { track } from '../api';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

export default function Tracking(){
  const { t } = useLanguage();
  const [id, setId] = useState('');
  const [timeline, setTimeline] = useState(null);
  const [err, setErr] = useState('');

  async function submit(e){
    e.preventDefault();
    try{
      const res = await track(id);
      setTimeline(res.timeline);
    }catch(e){
      setErr(e.response?.data?.error || e.message);
    }
  }

  return (
    <div className="form card">
      <BackButton />
      <h2>{t('trackVehicle')}</h2>
      <form onSubmit={submit}>
        <input placeholder={t('vehicleId')} value={id} onChange={e=>setId(e.target.value)} />
        <button type="submit">{t('track')}</button>
      </form>
      {err && <div className="card">{err}</div>}
      {timeline && timeline.map((t,i)=> (
        <div key={i} className="card">{new Date(t.timestamp).toLocaleString()} — {t.lat}, {t.lon}</div>
      ))}
    </div>
  );
}
