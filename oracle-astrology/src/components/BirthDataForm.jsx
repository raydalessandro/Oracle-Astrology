// components/BirthDataForm.jsx
import { useState } from 'react';

export default function BirthDataForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '12:00',
    locationName: '',
    latitude: '',
    longitude: ''
  });

  const [errors, setErrors] = useState({});

  // Città pre-definite per quick select
  const cities = [
    { name: 'Milano', lat: 45.4642, lon: 9.1900 },
    { name: 'Roma', lat: 41.9028, lon: 12.4964 },
    { name: 'Napoli', lat: 40.8518, lon: 14.2681 },
    { name: 'Torino', lat: 45.0703, lon: 7.6869 },
    { name: 'Firenze', lat: 43.7696, lon: 11.2558 },
    { name: 'Bologna', lat: 44.4949, lon: 11.3426 },
    { name: 'Venezia', lat: 45.4408, lon: 12.3155 },
    { name: 'Genova', lat: 44.4056, lon: 8.9463 }
  ];

  const handleCitySelect = (e) => {
    const city = cities.find(c => c.name === e.target.value);
    if (city) {
      setFormData({
        ...formData,
        locationName: city.name,
        latitude: city.lat,
        longitude: city.lon
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.date) newErrors.date = 'Data di nascita richiesta';
    if (!formData.time) newErrors.time = 'Ora di nascita richiesta';
    if (!formData.locationName) newErrors.locationName = 'Luogo di nascita richiesto';
    if (!formData.latitude || !formData.longitude) newErrors.location = 'Coordinate non valide';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });
    }
  };

  return (
    <form className="birth-data-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Quando sei nato?</h3>
        
        <div className="form-group">
          <label htmlFor="date">Data di Nascita</label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          {errors.date && <span className="error">{errors.date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="time">Ora di Nascita</label>
          <input
            type="time"
            id="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
          {errors.time && <span className="error">{errors.time}</span>}
          <small>Se non conosci l'ora esatta, usa 12:00</small>
        </div>
      </div>

      <div className="form-section">
        <h3>Dove sei nato?</h3>
        
        <div className="form-group">
          <label htmlFor="city-select">Selezione Rapida (Italia)</label>
          <select id="city-select" onChange={handleCitySelect} defaultValue="">
            <option value="">-- Seleziona città --</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="locationName">Nome Località</label>
            <input
              type="text"
              id="locationName"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              placeholder="Es: Milano"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitudine</label>
            <input
              type="number"
              id="latitude"
              step="0.0001"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              placeholder="45.4642"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitudine</label>
            <input
              type="number"
              id="longitude"
              step="0.0001"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              placeholder="9.1900"
              required
            />
          </div>
        </div>

        {errors.location && <span className="error">{errors.location}</span>}
        <small>Usa la selezione rapida oppure inserisci coordinate manualmente</small>
      </div>

      <button type="submit" className="btn-primary">
        Calcola Carta Natale →
      </button>
    </form>
  );
}
