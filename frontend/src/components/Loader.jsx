import React from 'react';

export default function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="spinner" />
        <div className="loader-text">Loading…</div>
      </div>
    </div>
  );
}
