// utils/ephemeris.js
import * as Astronomy from 'astronomy-engine';

/**
 * Calcola carta natale completa
 */
export function calculateNatalChart(birthData) {
  const { date, time, latitude, longitude, locationName } = birthData;
  
  // Combina data e ora
  const birthDateTime = new Date(`${date}T${time}`);
  
  // Calcola posizioni planetarie
  const planets = calculatePlanetaryPositions(birthDateTime);
  
  // Calcola case (Placidus)
  const houses = calculateHouses(birthDateTime, latitude, longitude);
  
  // Calcola aspetti natali
  const aspects = calculateNatalAspects(planets);
  
  return {
    birthDateTime,
    location: { latitude, longitude, name: locationName },
    planets,
    houses,
    aspects,
    metadata: {
      sunSign: getZodiacSign(planets.sun.longitude),
      moonSign: getZodiacSign(planets.moon.longitude),
      ascendant: getZodiacSign(houses[1].cusp)
    }
  };
}

/**
 * Calcola transiti per una data specifica
 */
export function calculateTransits(date) {
  const transitDate = new Date(date);
  const planets = calculatePlanetaryPositions(transitDate);
  
  return {
    date: transitDate,
    planets
  };
}

/**
 * Calcola posizioni planetarie per una data
 */
function calculatePlanetaryPositions(date) {
  const planets = {};

  // Sole - usa SunPosition che restituisce direttamente coordinate eclittiche
  const sunPos = Astronomy.SunPosition(date);
  planets.sun = {
    name: 'Sun',
    symbol: '☉',
    longitude: normalizeAngle(sunPos.elon),
    latitude: sunPos.elat,
    ...getPlanetDetails(normalizeAngle(sunPos.elon))
  };

  // Luna - usa EclipticGeoMoon che restituisce coordinate sferiche
  const moon = Astronomy.EclipticGeoMoon(date);
  planets.moon = {
    name: 'Moon',
    symbol: '☽',
    longitude: normalizeAngle(moon.lon),
    latitude: moon.lat,
    ...getPlanetDetails(normalizeAngle(moon.lon))
  };

  // Funzione helper per ottenere coordinate eclittiche di un pianeta
  const getPlanetEcliptic = (bodyName) => {
    const geoVector = Astronomy.GeoVector(Astronomy.Body[bodyName], date, true);
    return Astronomy.Ecliptic(geoVector);
  };

  // Pianeti interni
  ['Mercury', 'Venus', 'Mars'].forEach(planetName => {
    const ecliptic = getPlanetEcliptic(planetName);
    const longitude = normalizeAngle(ecliptic.elon);

    planets[planetName.toLowerCase()] = {
      name: planetName,
      symbol: getPlanetSymbol(planetName),
      longitude,
      latitude: ecliptic.elat,
      ...getPlanetDetails(longitude)
    };
  });

  // Pianeti esterni
  ['Jupiter', 'Saturn'].forEach(planetName => {
    const ecliptic = getPlanetEcliptic(planetName);
    const longitude = normalizeAngle(ecliptic.elon);

    planets[planetName.toLowerCase()] = {
      name: planetName,
      symbol: getPlanetSymbol(planetName),
      longitude,
      latitude: ecliptic.elat,
      ...getPlanetDetails(longitude)
    };
  });

  // Pianeti transpersonali
  ['Uranus', 'Neptune', 'Pluto'].forEach(planetName => {
    try {
      const ecliptic = getPlanetEcliptic(planetName);
      const longitude = normalizeAngle(ecliptic.elon);

      planets[planetName.toLowerCase()] = {
        name: planetName,
        symbol: getPlanetSymbol(planetName),
        longitude,
        latitude: ecliptic.elat,
        ...getPlanetDetails(longitude)
      };
    } catch (e) {
      // Ignora se non supportato
      console.warn(`Pianeta ${planetName} non supportato:`, e.message);
    }
  });

  return planets;
}

/**
 * Normalizza angolo a 0-360°
 */
function normalizeAngle(angle) {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Dettagli pianeta da longitudine
 */
function getPlanetDetails(longitude) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  
  return {
    sign: signs[signIndex],
    signIndex,
    degree: degreeInSign,
    displayDegree: `${Math.floor(degreeInSign)}°${signs[signIndex]}`
  };
}

/**
 * Ottieni simbolo pianeta
 */
function getPlanetSymbol(name) {
  const symbols = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
  };
  return symbols[name] || '●';
}

/**
 * Ottieni segno zodiacale da longitudine
 */
export function getZodiacSign(longitude) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[Math.floor(longitude / 30)];
}

/**
 * Calcola case (semplificato - Equal House per ora)
 */
function calculateHouses(date, latitude, longitude) {
  // Per ora usiamo Equal House (ogni casa = 30°)
  // In futuro possiamo implementare Placidus
  
  const ascendant = calculateAscendant(date, latitude, longitude);
  const houses = [];
  
  for (let i = 0; i < 12; i++) {
    houses.push({
      number: i + 1,
      cusp: normalizeAngle(ascendant + (i * 30)),
      sign: getZodiacSign(normalizeAngle(ascendant + (i * 30)))
    });
  }
  
  return houses;
}

/**
 * Calcola Ascendente (semplificato)
 */
function calculateAscendant(date, latitude, longitude) {
  // Usiamo la formula semplificata
  // Per ora ritorna un valore approssimativo
  // In produzione, usare algoritmo preciso
  
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const hor = Astronomy.Horizon(date, observer, 0, 0, 'normal');
  
  // Approssimazione: Ascendente ≈ RAMC + longitudine
  const ramc = Astronomy.SiderealTime(date) * 15; // Converti ore in gradi
  const asc = normalizeAngle(ramc + longitude);
  
  return asc;
}

/**
 * Calcola aspetti natali (pianeti tra loro nella carta natale)
 */
function calculateNatalAspects(planets) {
  const aspects = [];
  const planetNames = Object.keys(planets);
  
  const aspectTypes = [
    { name: 'Conjunction', angle: 0, orb: 8, symbol: '☌' },
    { name: 'Sextile', angle: 60, orb: 6, symbol: '⚹' },
    { name: 'Square', angle: 90, orb: 8, symbol: '□' },
    { name: 'Trine', angle: 120, orb: 8, symbol: '△' },
    { name: 'Opposition', angle: 180, orb: 8, symbol: '☍' }
  ];
  
  // Compara ogni pianeta con gli altri
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const p1 = planets[planetNames[i]];
      const p2 = planets[planetNames[j]];
      
      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      
      // Trova aspetto
      for (let aspectType of aspectTypes) {
        const orb = Math.abs(angle - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planet1: planetNames[i],
            planet2: planetNames[j],
            type: aspectType.name.toLowerCase(),
            symbol: aspectType.symbol,
            angle: aspectType.angle,
            orb,
            isExact: orb < 1,
            isStrong: orb < 3
          });
          break;
        }
      }
    }
  }
  
  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Calcola aspetti tra transiti e natale
 */
export function calculateAspectsToNatal(transits, natal) {
  const aspects = [];
  
  const aspectTypes = [
    { name: 'Conjunction', angle: 0, orb: 8, symbol: '☌' },
    { name: 'Sextile', angle: 60, orb: 6, symbol: '⚹' },
    { name: 'Square', angle: 90, orb: 8, symbol: '□' },
    { name: 'Trine', angle: 120, orb: 8, symbol: '△' },
    { name: 'Opposition', angle: 180, orb: 8, symbol: '☍' }
  ];
  
  const transitPlanets = Object.keys(transits.planets);
  const natalPlanets = Object.keys(natal.planets);
  
  transitPlanets.forEach(tName => {
    natalPlanets.forEach(nName => {
      const t = transits.planets[tName];
      const n = natal.planets[nName];
      
      const diff = Math.abs(t.longitude - n.longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      
      for (let aspectType of aspectTypes) {
        const orb = Math.abs(angle - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            transitPlanet: tName,
            natalPlanet: nName,
            type: aspectType.name.toLowerCase(),
            symbol: aspectType.symbol,
            angle: aspectType.angle,
            orb,
            isExact: orb < 1,
            isStrong: orb < 3,
            transitData: t,
            natalData: n
          });
          break;
        }
      }
    });
  });
  
  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Calcola fase lunare
 */
export function calculateMoonPhase(date) {
  const illumination = Astronomy.Illumination('Moon', date);
  return {
    illumination: illumination.phase_fraction * 100,
    phaseName: getMoonPhaseName(illumination.phase_fraction)
  };
}

function getMoonPhaseName(fraction) {
  if (fraction < 0.05) return 'New Moon';
  if (fraction < 0.20) return 'Waxing Crescent';
  if (fraction < 0.30) return 'First Quarter';
  if (fraction < 0.45) return 'Waxing Gibbous';
  if (fraction < 0.55) return 'Full Moon';
  if (fraction < 0.70) return 'Waning Gibbous';
  if (fraction < 0.80) return 'Last Quarter';
  return 'Waning Crescent';
}

/**
 * Verifica se Mercurio è retrogrado
 */
export function isMercuryRetrograde(date) {
  // Calcola velocità apparente di Mercurio
  const date1 = new Date(date);
  const date2 = new Date(date);
  date2.setDate(date2.getDate() + 1);

  const getEclipticLon = (d) => {
    const geoVec = Astronomy.GeoVector(Astronomy.Body.Mercury, d, true);
    return Astronomy.Ecliptic(geoVec).elon;
  };

  const pos1 = getEclipticLon(date1);
  const pos2 = getEclipticLon(date2);

  let diff = pos2 - pos1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return diff < 0; // Retrogrado se movimento negativo
}
