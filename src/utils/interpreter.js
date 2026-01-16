// utils/interpreter.js
import { calculateAspectsToNatal, getZodiacSign } from './ephemeris';

/**
 * Genera lettura oracolare completa
 */
export function generateOracleReading(natal, transits, periodType = 'day') {
  // Calcola aspetti transiti → natale
  const aspects = calculateAspectsToNatal(transits, natal);
  
  // Filtra solo aspetti significativi
  const significantAspects = aspects.filter(a => a.orb < 8);
  
  let reading = {
    header: generateHeader(natal, transits, periodType),
    narrative: '',
    aspects: significantAspects,
    dignities: analyzeDignities(transits.planets),
    recommendations: { do: [], avoid: [] },
    timing: '',
    conclusion: ''
  };
  
  // Genera narrativa principale
  reading.narrative = generateNarrative(significantAspects, transits, natal, periodType);
  
  // Genera raccomandazioni
  reading.recommendations = generateRecommendations(significantAspects, transits.planets);
  
  // Timing preciso
  reading.timing = generateTiming(significantAspects, periodType);
  
  // Conclusione
  reading.conclusion = generateConclusion(significantAspects, transits);
  
  return reading;
}

/**
 * Header oracolo
 */
function generateHeader(natal, transits, periodType) {
  const dateStr = transits.date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return {
    title: `ORACOLO PER ${dateStr.toUpperCase()}`,
    subtitle: `Nato sotto il Sole di ${natal.metadata.sunSign}, Luna in ${natal.metadata.moonSign}`,
    periodType
  };
}

/**
 * Genera narrativa principale
 */
function generateNarrative(aspects, transits, natal, periodType) {
  let narrative = '';
  
  if (aspects.length === 0) {
    narrative += "I cieli sono quieti oggi. Nessun aspetto maggiore disturba le acque.\n\n";
    narrative += "Questo è un giorno per CONSOLIDARE, non per iniziare.\n";
    narrative += "Lavora con ciò che già hai. Le stelle osservano in silenzio.\n\n";
    return narrative;
  }
  
  // Prendi i 3 aspetti più forti
  const topAspects = aspects.slice(0, 3);
  
  topAspects.forEach((aspect, index) => {
    narrative += interpretAspectNarrative(aspect, index === 0);
    narrative += '\n───────────────────────────────────────\n\n';
  });
  
  // Analisi energia generale
  narrative += '═══ ENERGIA GENERALE ═══\n\n';
  narrative += analyzeGeneralEnergy(transits.planets);
  narrative += '\n\n';
  
  return narrative;
}

/**
 * Interpreta singolo aspetto in forma narrativa
 */
function interpretAspectNarrative(aspect, isPrimary) {
  const { transitPlanet, natalPlanet, type, orb, symbol, transitData, natalData } = aspect;
  
  let text = '';
  
  if (isPrimary) {
    text += '✧ ASPETTO DOMINANTE ✧\n\n';
  }
  
  // Intro
  text += `${getPlanetFullName(transitPlanet)} transita al ${Math.floor(transitData.degree)}° di ${transitData.sign},\n`;
  text += `e forma un ${getAspectItalianName(type)} (${symbol}) con il tuo ${getPlanetFullName(natalPlanet)} natale.\n\n`;
  
  // Descrizione aspetto
  text += interpretAspectType(type, transitPlanet, natalPlanet);
  text += '\n\n';
  
  // Significato specifico pianeti
  text += interpretPlanetCombination(transitPlanet, natalPlanet, type);
  text += '\n\n';
  
  // Timing
  if (orb < 1) {
    text += `⚠️ ASPETTO ESATTO (orbe ${orb.toFixed(1)}°)\n`;
    text += `Questo è il MOMENTO DI MASSIMA POTENZA.\n`;
    text += `La finestra è di 6-12 ore. Agisci ora, o l'opportunità si dissolve.\n`;
  } else if (orb < 3) {
    text += `Aspetto stretto (orbe ${orb.toFixed(1)}°). Molto attivo.\n`;
    text += `Finestra operativa: 24-48 ore.\n`;
  } else {
    text += `Aspetto largo (orbe ${orb.toFixed(1)}°).\n`;
    text += `Energia di sottofondo. Finestra: 3-5 giorni.\n`;
  }
  
  return text;
}

/**
 * Interpreta tipo di aspetto
 */
function interpretAspectType(type, transitPlanet, natalPlanet) {
  const aspects = {
    conjunction: `CONGIUNZIONE = FUSIONE ALCHEMICA\n\nL'energia di ${getPlanetFullName(transitPlanet)} si fonde completamente con la tua natura ${getPlanetFullName(natalPlanet)}. Non puoi separarle. Non puoi ignorarne una.\n\nSono UNA COSA SOLA oggi. Tutto ciò che fai passa attraverso questo filtro.\n\nNon resistere. Non puoi. Cavalca l'onda.`,
    
    trine: `TRIGONO = IL FLUSSO DELL'ARMONIA\n\n${getPlanetFullName(transitPlanet)} e ${getPlanetFullName(natalPlanet)} danzano insieme in perfetta armonia. Entrambi segni dello stesso elemento - parlano la stessa lingua.\n\nCiò che oggi ti sembra FACILE non è un inganno. È la verità.\nCiò che SCORRE senza sforzo è ciò che l'universo vuole da te.\n\nNon cercare difficoltà dove non ce ne sono. Lascia che accada.`,
    
    square: `QUADRATURA = LA TENSIONE CREATRICE\n\n${getPlanetFullName(transitPlanet)} SFIDA il tuo ${getPlanetFullName(natalPlanet)}.\nL'angolo di 90° è l'angolo della CRISI e dell'AZIONE.\n\nQualcosa DEVE cambiare. Non puoi restare dove sei.\nLa quadratura non è punizione - è ATTRITO CREATIVO.\n\nDal conflitto nasce la forma. Decidi tu quale forma dare.`,
    
    opposition: `OPPOSIZIONE = L'INTEGRAZIONE DEGLI OPPOSTI\n\n${getPlanetFullName(transitPlanet)} sta dall'altra parte del cielo rispetto al tuo ${getPlanetFullName(natalPlanet)}. 180° di separazione.\n\nNon è guerra. È POLARITÀ.\nDue facce della stessa medaglia. Devi trovare il punto MEDIO.\n\nNon scegliere uno e distruggi l'altro. INTEGRA.\nL'opposizione ti obbliga a essere completo.`,
    
    sextile: `SESTILE = L'OPPORTUNITÀ VELATA\n\n${getPlanetFullName(transitPlanet)} offre supporto al tuo ${getPlanetFullName(natalPlanet)}.\nMa l'angolo di 60° è PASSIVO. Non ti cade in grembo.\n\nL'opportunità c'è, ma devi VEDERLA e COGLIERLA.\nIl sestile è la porta socchiusa. Devi spingerla tu.\n\nAgisci. Oppure l'opportunità passa oltre.`
  };
  
  return aspects[type] || 'Aspetto non standard.';
}

/**
 * Interpreta combinazione specifica di pianeti
 */
function interpretPlanetCombination(transit, natal, aspectType) {
  // Combinazioni chiave
  const combinations = {
    'sun-sun': 'Sole su Sole = TU OGGI SEI PIÙ TE STESSO DEL SOLITO. La tua essenza è amplificata.',
    'moon-sun': 'Luna su Sole = Emozione incontra Identità. Ciò che senti È ciò che sei.',
    'moon-moon': 'Luna su Luna = Memoria emotiva attivata. Il passato bussa alla porta del presente.',
    'mercury-sun': 'Mercurio su Sole = La tua mente esprime la tua essenza. Parla chi sei.',
    'mercury-mercury': 'Mercurio su Mercurio = Comunicazione potenziata. La tua voce è amplificata.',
    'venus-sun': 'Venere su Sole = Bellezza e Identità si fondono. Sei magnetico oggi.',
    'mars-sun': 'Marte su Sole = Azione e Volontà unite. Sei una freccia scagliata.',
    'jupiter-sun': 'Giove su Sole = Espansione dell\'IO. Oggi sei più grande di te.',
    'saturn-sun': 'Saturno su Sole = Struttura e Identità. Oggi costruisci chi sei.',
  };
  
  const key = `${transit}-${natal}`;
  const reverseKey = `${natal}-${transit}`;
  
  let interpretation = combinations[key] || combinations[reverseKey];
  
  if (!interpretation) {
    interpretation = `${getPlanetFullName(transit)} influenza il tuo ${getPlanetFullName(natal)}. `;
    interpretation += aspectType === 'trine' || aspectType === 'sextile' 
      ? 'Flusso armonico.' 
      : 'Tensione creativa.';
  }
  
  return `∴ SIGNIFICATO: ${interpretation}`;
}

/**
 * Analizza dignità planetarie
 */
function analyzeDignities(planets) {
  const dignities = [];
  
  Object.entries(planets).forEach(([name, data]) => {
    const dignity = analyzePlanetDignity(name, data.sign);
    if (dignity.type !== 'peregrine') {
      dignities.push({
        planet: name,
        sign: data.sign,
        ...dignity
      });
    }
  });
  
  return dignities;
}

/**
 * Analizza dignità singolo pianeta
 */
function analyzePlanetDignity(planet, sign) {
  const rulerships = {
    sun: { domicile: 'Leo', exaltation: 'Aries', detriment: 'Aquarius', fall: 'Libra' },
    moon: { domicile: 'Cancer', exaltation: 'Taurus', detriment: 'Capricorn', fall: 'Scorpio' },
    mercury: { domicile: ['Gemini', 'Virgo'], exaltation: 'Virgo', detriment: ['Sagittarius', 'Pisces'], fall: 'Pisces' },
    venus: { domicile: ['Taurus', 'Libra'], exaltation: 'Pisces', detriment: ['Scorpio', 'Aries'], fall: 'Virgo' },
    mars: { domicile: ['Aries', 'Scorpio'], exaltation: 'Capricorn', detriment: ['Libra', 'Taurus'], fall: 'Cancer' },
    jupiter: { domicile: ['Sagittarius', 'Pisces'], exaltation: 'Cancer', detriment: ['Gemini', 'Virgo'], fall: 'Capricorn' },
    saturn: { domicile: ['Capricorn', 'Aquarius'], exaltation: 'Libra', detriment: ['Cancer', 'Leo'], fall: 'Aries' }
  };
  
  const rules = rulerships[planet.toLowerCase()];
  if (!rules) return { type: 'peregrine', strength: 'neutral' };
  
  const checkSign = (value) => Array.isArray(value) ? value.includes(sign) : value === sign;
  
  if (checkSign(rules.domicile)) {
    return { type: 'domicile', strength: 'very strong', description: 'in THRONE - Maximum power' };
  }
  if (checkSign(rules.exaltation)) {
    return { type: 'exaltation', strength: 'strong', description: 'EXALTED - Honored guest' };
  }
  if (checkSign(rules.detriment)) {
    return { type: 'detriment', strength: 'weak', description: 'in EXILE - Weakened' };
  }
  if (checkSign(rules.fall)) {
    return { type: 'fall', strength: 'very weak', description: 'in FALL - Debilitated' };
  }
  
  return { type: 'peregrine', strength: 'neutral', description: 'Wanderer - Neutral' };
}

/**
 * Analizza energia generale
 */
function analyzeGeneralEnergy(planets) {
  const sun = planets.sun;
  const moon = planets.moon;
  
  let text = `Il Sole, Signore del Giorno, si trova al ${Math.floor(sun.degree)}° di ${sun.sign}.\n`;
  text += interpretSunSign(sun.sign);
  text += '\n\n';
  
  text += `La Luna, Signora delle Maree, transita al ${Math.floor(moon.degree)}° di ${moon.sign}.\n`;
  text += interpretMoonSign(moon.sign);
  
  return text;
}

function interpretSunSign(sign) {
  const interpretations = {
    Aries: 'Fuoco cardinale. Energia di INIZIO, CONQUISTA, GUERRA.',
    Taurus: 'Terra fissa. Energia di RADICAMENTO, POSSESSO, COSTRUZIONE.',
    Gemini: 'Aria mutevole. Energia di CONNESSIONE, COMUNICAZIONE, MOVIMENTO.',
    Cancer: 'Acqua cardinale. Energia di PROTEZIONE, FAMIGLIA, RADICI.',
    Leo: 'Fuoco fisso. Energia di CREAZIONE, ESPRESSIONE, REGALITÀ.',
    Virgo: 'Terra mutevole. Energia di ANALISI, PERFEZIONAMENTO, SERVIZIO.',
    Libra: 'Aria cardinale. Energia di EQUILIBRIO, RELAZIONE, ARMONIA.',
    Scorpio: 'Acqua fissa. Energia di TRASFORMAZIONE, PROFONDITÀ, POTERE.',
    Sagittarius: 'Fuoco mutevole. Energia di ESPANSIONE, VISIONE, VERITÀ.',
    Capricorn: 'Terra cardinale. Energia di STRUTTURA, AMBIZIONE, TEMPO.',
    Aquarius: 'Aria fissa. Energia di RIVOLUZIONE, INNOVAZIONE, LIBERTÀ.',
    Pisces: 'Acqua mutevole. Energia di DISSOLUZIONE, COMPASSIONE, UNITÀ.'
  };
  return interpretations[sign] || 'Energia neutra.';
}

function interpretMoonSign(sign) {
  const interpretations = {
    Aries: 'Luna in Ariete = Emozioni RAPIDE, IMPULSIVE. Agisci prima di pensare.',
    Taurus: 'Luna in Toro = Emozioni STABILI, SENSUALI. Cerchi sicurezza fisica.',
    Gemini: 'Luna in Gemelli = Emozioni MENTALI, CURIOSE. Parli per capire come ti senti.',
    Cancer: 'Luna in Cancro = Emozioni PROFONDE, NUTRIENTI. Cerchi casa e protezione.',
    Leo: 'Luna in Leone = Emozioni DRAMMATICHE, CREATIVE. Vuoi essere visto.',
    Virgo: 'Luna in Vergine = Emozioni ANALIZZATE, ORDINATE. Organizzi i sentimenti.',
    Libra: 'Luna in Bilancia = Emozioni RELAZIONALI, ARMONICHE. Cerchi pace.',
    Scorpio: 'Luna in Scorpione = Emozioni INTENSE, TRASFORMATIVE. Tutto o niente.',
    Sagittarius: 'Luna in Sagittario = Emozioni OTTIMISTE, AVVENTUROSE. Cerchi significato.',
    Capricorn: 'Luna in Capricorno = Emozioni CONTROLLATE, PRAGMATICHE. Strutturi i sentimenti.',
    Aquarius: 'Luna in Acquario = Emozioni DISTACCATE, UNIVERSALI. Osservi più che senti.',
    Pisces: 'Luna in Pesci = Emozioni OSMOTICHE, COMPASSIONEVOLI. Assorbi tutto.'
  };
  return interpretations[sign] || 'Luna neutra.';
}

/**
 * Genera raccomandazioni
 */
function generateRecommendations(aspects, planets) {
  const recommendations = { do: [], avoid: [] };
  
  // Analizza pianeta dominante
  const dominantPlanet = findDominantPlanet(aspects, planets);
  
  // Raccomandazioni base per pianeta dominante
  const planetRecs = {
    sun: {
      do: ['Esprimi la tua identità', 'Sii visibile', 'Prendi iniziativa', 'Crea qualcosa di tuo'],
      avoid: ['Nasconderti', 'Seguire passivamente', 'Negare chi sei', 'Cedere alla mediocrità']
    },
    moon: {
      do: ['Ascolta le emozioni', 'Nutri te stesso', 'Cerca sicurezza', 'Connetti con la famiglia'],
      avoid: ['Ignorare i bisogni', 'Razionalizzare troppo', 'Esporti a instabilità', 'Negare la vulnerabilità']
    },
    mercury: {
      do: ['Comunica chiaramente', 'Impara qualcosa', 'Scrivi', 'Connetti idee'],
      avoid: ['Silenzio forzato', 'Ignorare la logica', 'Dispersione mentale', 'Superficialità']
    },
    mars: {
      do: ['Agisci decisamente', 'Affronta conflitti', 'Usa l\'energia fisica', 'Sii assertivo'],
      avoid: ['Passività', 'Procrastinazione', 'Aggressività cieca', 'Cedere senza lottare']
    },
    jupiter: {
      do: ['Espandi orizzonti', 'Sii generoso', 'Rischia con fiducia', 'Impara', 'Connetti'],
      avoid: ['Limitarti', 'Pessimismo', 'Chiusura', 'Parsimonia eccessiva']
    },
    saturn: {
      do: ['Costruisci strutture', 'Elimina il superfluo', 'Sii disciplinato', 'Prendi responsabilità'],
      avoid: ['Improvvisazione', 'Superficialità', 'Fuggire i doveri', 'Evitare la realtà']
    }
  };
  
  const recs = planetRecs[dominantPlanet] || planetRecs.sun;
  recommendations.do = recs.do;
  recommendations.avoid = recs.avoid;
  
  // Aggiungi raccomandazioni da aspetti difficili
  aspects.filter(a => a.type === 'square' || a.type === 'opposition').forEach(aspect => {
    recommendations.avoid.push(`Forzare ${aspect.transitPlanet}-${aspect.natalPlanet} senza consapevolezza`);
  });
  
  // Aggiungi raccomandazioni da aspetti armonici
  aspects.filter(a => a.type === 'trine' && a.isExact).forEach(aspect => {
    recommendations.do.push(`Seguire intuizioni ${aspect.transitPlanet}-${aspect.natalPlanet} (flusso esatto)`);
  });
  
  return recommendations;
}

/**
 * Trova pianeta dominante
 */
function findDominantPlanet(aspects, planets) {
  const counts = {};
  
  aspects.forEach(aspect => {
    counts[aspect.transitPlanet] = (counts[aspect.transitPlanet] || 0) + 1;
  });
  
  let max = 0;
  let dominant = 'sun';
  
  Object.entries(counts).forEach(([planet, count]) => {
    if (count > max) {
      max = count;
      dominant = planet;
    }
  });
  
  return dominant;
}

/**
 * Genera timing
 */
function generateTiming(aspects, periodType) {
  if (periodType !== 'day') return '';
  
  const exactAspects = aspects.filter(a => a.isExact);
  
  if (exactAspects.length === 0) {
    return 'Nessun aspetto esatto oggi. Energia diffusa su tutto il giorno.';
  }
  
  let text = '⏰ TIMING PRECISO:\n\n';
  exactAspects.forEach(aspect => {
    text += `${aspect.symbol} ${getPlanetFullName(aspect.transitPlanet)} ${getAspectItalianName(aspect.type)} `;
    text += `${getPlanetFullName(aspect.natalPlanet)} (orbe ${aspect.orb.toFixed(1)}°)\n`;
    text += `Finestra ottimale: 12:00-18:00 (giorno) o 00:00-06:00 (notte)\n\n`;
  });
  
  return text;
}

/**
 * Genera conclusione
 */
function generateConclusion(aspects, transits) {
  if (aspects.length === 0) {
    return 'I cieli sono silenziosi. Usa questo spazio per CONSOLIDARE, non per iniziare.';
  }
  
  const strongAspects = aspects.filter(a => a.isStrong);
  
  if (strongAspects.length > 3) {
    return 'Giornata INTENSA. Molte energie in gioco. Scegli con cura su cosa concentrarti.';
  } else if (strongAspects.length > 0) {
    return 'Giornata ATTIVA. Gli aspetti parlano chiaro. Ascolta e agisci.';
  } else {
    return 'Giornata TRANQUILLA. Le energie sono sottili ma presenti. Lavora con grazia.';
  }
}

// === HELPER FUNCTIONS ===

function getPlanetFullName(planet) {
  const names = {
    sun: 'Sole',
    moon: 'Luna',
    mercury: 'Mercurio',
    venus: 'Venere',
    mars: 'Marte',
    jupiter: 'Giove',
    saturn: 'Saturno',
    uranus: 'Urano',
    neptune: 'Nettuno',
    pluto: 'Plutone'
  };
  return names[planet] || planet;
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
