// components/PeriodSelector.jsx
import { useState } from 'react';

export default function PeriodSelector({ value, onChange }) {
  const [customDate, setCustomDate] = useState('');

  const handleTypeChange = (type) => {
    let date = new Date();
    
    if (type === 'day') {
      // Oggi
    } else if (type === 'week') {
      // Prossima settimana
      date.setDate(date.getDate() + 7);
    } else if (type === 'month') {
      // Prossimo mese
      date.setMonth(date.getMonth() + 1);
    }
    
    onChange({ type, date });
  };

  const handleCustomDateChange = (e) => {
    const dateStr = e.target.value;
    setCustomDate(dateStr);
    if (dateStr) {
      onChange({ type: 'custom', date: new Date(dateStr) });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="period-selector">
      <h3>Seleziona Periodo</h3>
      
      <div className="period-buttons">
        <button
          type="button"
          className={`period-btn ${value.type === 'day' ? 'active' : ''}`}
          onClick={() => handleTypeChange('day')}
        >
          <span className="period-icon">☉</span>
          <span className="period-label">Oggi</span>
          <span className="period-date">{formatDate(new Date())}</span>
        </button>

        <button
          type="button"
          className={`period-btn ${value.type === 'week' ? 'active' : ''}`}
          onClick={() => handleTypeChange('week')}
        >
          <span className="period-icon">☽</span>
          <span className="period-label">Settimana</span>
          <span className="period-date">Prossimi 7 giorni</span>
        </button>

        <button
          type="button"
          className={`period-btn ${value.type === 'month' ? 'active' : ''}`}
          onClick={() => handleTypeChange('month')}
        >
          <span className="period-icon">♄</span>
          <span className="period-label">Mese</span>
          <span className="period-date">Prossimi 30 giorni</span>
        </button>
      </div>

      <div className="custom-date-section">
        <label htmlFor="custom-date">Oppure scegli una data specifica:</label>
        <input
          type="date"
          id="custom-date"
          value={customDate}
          onChange={handleCustomDateChange}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {value.type === 'custom' && customDate && (
        <div className="selected-period">
          <p>Data selezionata: <strong>{formatDate(value.date)}</strong></p>
        </div>
      )}
    </div>
  );
}
