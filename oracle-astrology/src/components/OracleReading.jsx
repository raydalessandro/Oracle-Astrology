// components/OracleReading.jsx

export default function OracleReading({ reading, natal, transits }) {
  if (!reading) return null;

  const { header, narrative, aspects, dignities, recommendations, timing, conclusion } = reading;

  return (
    <div className="oracle-reading">
      {/* Header */}
      <div className="reading-header">
        <div className="header-ornament">✧ ✧ ✧</div>
        <h2>{header.title}</h2>
        <p className="reading-subtitle">{header.subtitle}</p>
        <div className="header-ornament">✧ ✧ ✧</div>
      </div>

      {/* Narrative principale */}
      <section className="reading-section narrative-section">
        <h3>✦ LETTURA ORACOLARE ✦</h3>
        <div className="narrative-text">
          {narrative.split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </section>

      {/* Aspetti attivi */}
      {aspects && aspects.length > 0 && (
        <section className="reading-section aspects-section">
          <h3>✦ ASPETTI ATTIVI ✦</h3>
          <div className="aspects-grid">
            {aspects.slice(0, 5).map((aspect, idx) => (
              <div 
                key={idx} 
                className={`aspect-card ${aspect.isExact ? 'exact' : ''} ${aspect.isStrong ? 'strong' : ''}`}
              >
                <div className="aspect-symbol">{aspect.symbol}</div>
                <div className="aspect-planets">
                  {getPlanetSymbol(aspect.transitPlanet)} → {getPlanetSymbol(aspect.natalPlanet)}
                </div>
                <div className="aspect-type">
                  {getAspectItalianName(aspect.type)}
                </div>
                <div className="aspect-orb">
                  orbe: {aspect.orb.toFixed(1)}°
                </div>
                {aspect.isExact && <div className="exact-badge">ESATTO</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dignità planetarie */}
      {dignities && dignities.length > 0 && (
        <section className="reading-section dignities-section">
          <h3>✦ DIGNITÀ PLANETARIE ✦</h3>
          <div className="dignities-list">
            {dignities.map((d, idx) => (
              <div key={idx} className={`dignity-item ${d.type}`}>
                <span className="dignity-planet">{getPlanetSymbol(d.planet)}</span>
                <span className="dignity-sign">{d.sign}</span>
                <span className="dignity-status">{d.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Raccomandazioni */}
      <section className="reading-section recommendations-section">
        <h3>✦ RACCOMANDAZIONI ✦</h3>
        
        <div className="recommendations-grid">
          <div className="rec-column do-column">
            <h4>✓ DA FARE</h4>
            <ul>
              {recommendations.do.slice(0, 5).map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
          
          <div className="rec-column avoid-column">
            <h4>✗ DA EVITARE</h4>
            <ul>
              {recommendations.avoid.slice(0, 5).map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Timing */}
      {timing && (
        <section className="reading-section timing-section">
          <h3>✦ TIMING ✦</h3>
          <div className="timing-text">
            {timing.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </section>
      )}

      {/* Conclusione */}
      <section className="reading-section conclusion-section">
        <div className="conclusion-ornament">═══════════════════</div>
        <p className="conclusion-text">{conclusion}</p>
        <div className="conclusion-ornament">═══════════════════</div>
      </section>

      {/* Disclaimer */}
      <div className="reading-disclaimer">
        <p>Le stelle inclinano, ma non obbligano.</p>
        <p>Usa questa guida con saggezza e libero arbitrio.</p>
      </div>
    </div>
  );
}

// Helper functions
function getPlanetSymbol(planet) {
  const symbols = {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇'
  };
  return symbols[planet] || '●';
}

function getAspectItalianName(aspect) {
  const names = {
    conjunction: 'Congiunzione',
    sextile: 'Sestile',
    square: 'Quadratura',
    trine: 'Trigono',
    opposition: 'Opposizione'
  };
  return names[aspect] || aspect;
}
