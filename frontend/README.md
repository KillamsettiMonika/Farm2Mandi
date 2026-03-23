# Farm2Mandi Frontend

This is a Vite + React frontend scaffold for Farm2Mandi.

## Run (Windows PowerShell)

    cd frontend
    npm install
    npm run dev

## Notes

- The app uses `localStorage` to store the most recent prediction (`lastPrediction`). Replace with a global state or more robust client storage as needed.
- Map view is a placeholder. Integrate `react-leaflet` or Google Maps API in `src/pages/MapView.jsx`.
- API base is `http://localhost:5000/api` by default. Add a `.env` file with `VITE_API_BASE` to change it.
