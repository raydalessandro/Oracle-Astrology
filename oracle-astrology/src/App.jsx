// App.jsx
import { useState } from 'react';
import './styles/oracle.css';
import BirthDataForm from './components/BirthDataForm';
import PeriodSelector from './components/PeriodSelector';
import OracleReading from './components/OracleReading';
import { calculateNatalChart, calculateTransits } from './utils/ephemeris';
import { generateOracleReading } from './utils/interpreter';

function App() {
  const [step, setStep] = useState('input'); // 'input', 'select', 'reading'
  const [birthData, setBirthData] = useState(null);
  const [natalChart, setNatalChart] = useState(null);
  const [period, setPeriod] = useState({ type: 'day', date: new Date() });
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBirthDataSubmit = (data) => {
    setLoading(true);
    
    try {
      // Calcola carta natale
      const natal = calculateNatalChart(data);
      
      setBirthData(data);
      setNatalChart(natal);
      setStep('select');
    } catch (error) {
      console.error('Error calculating natal chart:', error);
      alert('Errore nel calcolo della carta natale. Verifica i dati inseriti.');
    } finally {
      setLoading(false);
    }
  };

  const handleConsultOracle = () => {
    setLoading(true);
    
    try {
      // Calcola transiti per data selezionata
      const transits = calculateTransits(period.date);
      
      // Genera lettura oracolare
      const oracleReading = generateOracleReading(natalChart, transits, period.type);
      
      setReading(oracleReading);
      setStep('reading');
    } catch (error) {
      console.error('Error generating reading:', error);
      alert('Errore nella generazione della lettura. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setBirthData(null);
    setNatalChart(null);
    setReading(null);
  };

  const handleNewReading = () => {
    setStep('select');
    setReading(null);
  };

  return (
    <div className="oracle-app">
      <header className="oracle-header">
        <div className="header-decoration">✧ ═══════════════════ ✧</div>
        <h1 className="oracle-title">🔮 ORACLE</h1>
        <p className="oracle-subtitle">Astrological Divination System</p>
        <div className="header-decoration">✧ ═══════════════════ ✧</div>
      </header>

      <main className="oracle-main">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">⟳</div>
            <p>Consultando le stelle...</p>
          </div>
        )}

        {step === 'input' && (
          <div className="step-container">
            <div className="step-intro">
              <p>Per consultare l'Oracolo, è necessario conoscere</p>
              <p>le coordinate celesti del tuo ingresso nel mondo.</p>
            </div>
            <BirthDataForm onSubmit={handleBirthDataSubmit} />
          </div>
        )}

        {step === 'select' && (
          <div className="step-container">
            <div className="natal-summary">
              <h3>Carta Natale Calcolata</h3>
              <p>☉ Sole in {natalChart.metadata.sunSign}</p>
              <p>☽ Luna in {natalChart.metadata.moonSign}</p>
              <p>↑ Ascendente in {natalChart.metadata.ascendant}</p>
            </div>
            
            <div className="step-intro">
              <p>Per quale periodo desideri consultare l'Oracolo?</p>
            </div>
            
            <PeriodSelector value={period} onChange={setPeriod} />
            
            <div className="action-buttons">
              <button className="btn-secondary" onClick={handleReset}>
                ← Modifica Dati Nascita
              </button>
              <button className="btn-primary" onClick={handleConsultOracle}>
                Consulta l'Oracolo →
              </button>
            </div>
          </div>
        )}

        {step === 'reading' && reading && (
          <div className="step-container">
            <OracleReading reading={reading} natal={natalChart} transits={period} />
            
            <div className="action-buttons">
              <button className="btn-secondary" onClick={handleNewReading}>
                ← Nuova Lettura
              </button>
              <button className="btn-tertiary" onClick={handleReset}>
                Cambia Carta Natale
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="oracle-footer">
        <div className="footer-decoration">═══════════════════</div>
        <p>Oracle v1.0 • Astrologia Classica</p>
        <p className="footer-note">
          Le stelle inclinano, ma non obbligano.
        </p>
      </footer>
    </div>
  );
}

export default App;
