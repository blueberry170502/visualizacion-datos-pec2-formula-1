// api.js — obtiene los datos directamente de Jolpica cada vez que se abre la página.
const API_F1 = "https://api.jolpi.ca/ergast/f1";
const TEMPORADA_EN_CURSO = new Date().getFullYear();
const TEMPORADAS_BUMP = [2021, 2022, 2023, 2024, 2025, TEMPORADA_EN_CURSO];
let EVOLUCION_2021_2026 = EVOLUCION_2021_2025;

// Cola global: todas las peticiones (temporada actual y bump chart) comparten
// el mismo limitador para no superar el máximo de Jolpica.
const INTERVALO_API_MS = 450; // ~2,2 peticiones/segundo (límite publicado: 4/s)
const CACHE_API_MS = 10 * 60 * 1000; // 10 minutos
let ultimaPeticionApi = 0;
let colaApi = Promise.resolve();

async function esperarTurnoApi() {
  const anterior = colaApi;
  let liberar;
  colaApi = new Promise(resolve => { liberar = resolve; });
  await anterior;
  const espera = Math.max(0, INTERVALO_API_MS - (Date.now() - ultimaPeticionApi));
  if (espera) await pausa(espera);
  ultimaPeticionApi = Date.now();
  return liberar;
}

async function apiJson(ruta) {
  const url = `${API_F1}/${ruta}`;
  const cacheKey = `jolpica:${url}`;
  // Caché breve compartida entre visitas para evitar repetir consultas y
  // agotar el límite horario. Al caducar, se vuelve a consultar la API.
  try {
    const guardado = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (guardado && Date.now() - guardado.timestamp < CACHE_API_MS) return guardado.data;
  } catch (_) { /* Caché inválida: se vuelve a consultar la API. */ }

  let ultimoError;
  for (let intento = 0; intento < 3; intento++) {
    const liberar = await esperarTurnoApi();
    try {
      const respuesta = await fetch(url, { headers: { Accept: 'application/json' } });
      if (respuesta.status === 429) {
        ultimoError = new Error(`Jolpica ha limitado temporalmente las consultas (429) en ${ruta}`);
        await pausa(5000 * (intento + 1));
        continue;
      }
      if (!respuesta.ok) throw new Error(`Jolpica respondió ${respuesta.status} en ${ruta}`);
      const data = await respuesta.json();
      try { localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data })); } catch (_) { /* Caché no disponible o llena. */ }
      return data;
    } catch (error) {
      ultimoError = error;
      // Un 429 sin cabeceras CORS puede presentarse en el navegador como
      // TypeError: Failed to fetch. Aplicamos espera también en ese caso.
      if (intento < 2) await pausa(3000 * (intento + 1));
    } finally {
      liberar();
    }
  }
  throw ultimoError || new Error(`No se pudo consultar Jolpica: ${ruta}`);
}
function nombrePiloto(d) { return `${d.givenName} ${d.familyName}`; }
function pausa(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function cargarTemporadaActual() {
  const calendario = (await apiJson(`${TEMPORADA_EN_CURSO}.json?limit=100`)).MRData.RaceTable.Races || [];
  const hoy = new Date().toISOString().slice(0, 10);
  const carrerasDisputadas = calendario.filter(c => c.date <= hoy);
  const resultados = [];
  const clasificaciones = [];
  // Consultas espaciadas para respetar el límite de peticiones de la API.
  for (const carrera of carrerasDisputadas) {
    const ronda = carrera.round;
    const data = await apiJson(`${TEMPORADA_EN_CURSO}/${ronda}/results.json?limit=100`);
    const lista = data.MRData.RaceTable.Races?.[0]?.Results || [];
    resultados.push({ carrera, lista });
    await pausa(270);
    try {
      const quali = await apiJson(`${TEMPORADA_EN_CURSO}/${ronda}/qualifying.json?limit=100`);
      clasificaciones.push(...(quali.MRData.RaceTable.Races?.[0]?.QualifyingResults || []));
    } catch (_) { /* Si falta la clasificación, el contador de poles queda parcial. */ }
    await pausa(270);
  }
  const mapa = new Map();
  for (const {carrera, lista} of resultados) {
    for (const r of lista) {
      const nombre = nombrePiloto(r.Driver);
      if (!mapa.has(nombre)) mapa.set(nombre, { nombre, equipo: r.Constructor?.name || "Desconocido", puntos: 0, victorias: 0, podios: 0, poles: 0, posiciones: [], puntosPorCarrera: Array(carrerasDisputadas.length).fill(null), equipoActual: r.Constructor?.name || "Desconocido" });
      const p = mapa.get(nombre); p.equipo = r.Constructor?.name || p.equipo;
      const idx = resultados.findIndex(x => x.carrera.round === carrera.round);
      const puntos = Number(r.points || 0); p.puntos += puntos; p.puntosPorCarrera[idx] = puntos;
      if (r.position === "1") p.victorias++;
      if (["1","2","3"].includes(r.position)) p.podios++;
      if (r.position) p.posiciones.push(Number(r.position));
    }
  }
  for (const q of clasificaciones) {
    if (q.position === "1") { const n = nombrePiloto(q.Driver); if (mapa.has(n)) mapa.get(n).poles++; }
  }
  const pilotos = [...mapa.values()].map(p => ({ ...p, posicionMedia: p.posiciones.length ? p.posiciones.reduce((a,b)=>a+b,0)/p.posiciones.length : 0 }));
  pilotos.sort((a,b)=>b.puntos-a.puntos);
  return { carreras: carrerasDisputadas.map(c => c.raceName.replace(/ Grand Prix$/i, "")), pilotos };
}

async function cargarEvolucion() {
  const temporadas = [...new Set(TEMPORADAS_BUMP)];
  const porPiloto = new Map();
  for (const temporada of temporadas) {
    try {
      const data = await apiJson(`${temporada}/driverStandings.json?limit=100`);
      const lista = data.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
      lista.forEach((d, i) => {
        const nombre = nombrePiloto(d.Driver);
        if (!porPiloto.has(nombre)) porPiloto.set(nombre, { nombre, posiciones: Array(temporadas.length).fill(null), puntos: Array(temporadas.length).fill(null), victorias: Array(temporadas.length).fill(0), equipos: Array(temporadas.length).fill("Desconocido") });
        const p = porPiloto.get(nombre), ix = temporadas.indexOf(temporada);
        p.posiciones[ix] = Number(d.position || i+1); p.puntos[ix] = Number(d.points || 0);
        p.victorias[ix] = Number(d.wins || 0); p.equipos[ix] = d.Constructors?.at(-1)?.name || "Desconocido";
      });
    } catch (e) { console.warn(`No se pudo recuperar la clasificación ${temporada}`, e); }
    await pausa(270);
  }
  // Para que el bump chart no omita a pilotos que han competido en parte del periodo,
  // conservamos los que tienen al menos dos temporadas con clasificación.
  return [...porPiloto.values()].filter(p => p.posiciones.filter(Number.isFinite).length >= 2)
    .sort((a,b) => (a.posiciones.at(-1) || 99) - (b.posiciones.at(-1) || 99)).slice(0, 15);
}

async function cargarDatosF1() {
  const [actual, evolucion] = await Promise.all([cargarTemporadaActual(), cargarEvolucion()]);
  if (!actual.pilotos.length) throw new Error(`La API todavía no ofrece resultados de Grandes Premios de ${TEMPORADA_EN_CURSO}.`);
  CARRERAS = actual.carreras;
  PILOTOS = actual.pilotos;
  EVOLUCION_2021_2026 = evolucion;
  TEMPORADAS = [...new Set(TEMPORADAS_BUMP)];
  PUESTOS_MAXIMOS = Math.max(20, ...evolucion.flatMap(p => p.posiciones.filter(Number.isFinite)));
  TEMPORADA_ACTUAL = TEMPORADA_EN_CURSO;
  TEXTOS.heatmap.pregunta = `¿En qué Grandes Premios puntuó cada piloto en ${TEMPORADA_EN_CURSO}?`;
  TEXTOS.pcp.pregunta = `¿Qué perfiles estadísticos distinguen a los pilotos en ${TEMPORADA_EN_CURSO}?`;
  TEXTOS.bump.pregunta = `¿Cómo evolucionó la posición de los pilotos entre 2021 y ${TEMPORADA_EN_CURSO}?`;
  TEXTOS.bump.nota = `Se muestran hasta 15 pilotos con clasificación disponible en al menos dos temporadas. ${TEMPORADA_EN_CURSO} refleja la clasificación actual y puede cambiar hasta el final del campeonato.`;
  TEXTOS.heatmap.hallazgos = `El gráfico se construye con los puntos obtenidos en las carreras disputadas de ${TEMPORADA_EN_CURSO}. Los resultados se actualizan en cada visita; los Grandes Premios todavía no disputados no aparecen.`;
  TEXTOS.pcp.hallazgos = `Las métricas se calculan a partir de los resultados de los Grandes Premios disputados en ${TEMPORADA_EN_CURSO}. La posición media considera las posiciones de llegada registradas por la API.`;
  TEXTOS.bump.hallazgos = `Permite comparar cómo cambia la posición de cada piloto a lo largo de las temporadas. La última temporada corresponde a la clasificación provisional disponible en el momento de la consulta.`;
  CLASIFICACION_ACTUAL = [...actual.pilotos].sort((a,b)=>b.puntos-a.puntos).slice(0,5).map(p=>({nombre:p.nombre,equipo:p.equipo,puntos:Math.round(p.puntos),diferencia:""}));
  return { temporada: TEMPORADA_EN_CURSO, carreras: actual.carreras.length, pilotos: actual.pilotos.length };
}
