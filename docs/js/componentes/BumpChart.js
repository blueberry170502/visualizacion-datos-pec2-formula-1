// BumpChart.js — posición final en el campeonato de cada piloto, de 2021 a 2025.
// El eje vertical es el puesto (1 arriba): una línea que sube es un piloto que mejora.

let TEMPORADAS = [2021, 2022, 2023, 2024, 2025];
let PUESTOS_MAXIMOS = 22;

const ANCHO_BUMP = 900;
const ALTO_BUMP = 620;
const MARGEN_IZQ = 50;
const MARGEN_DER = 120; // espacio para el apellido al final de cada línea
const MARGEN_SUP = 20;
const MARGEN_INF = 40;

// Coordenadas: temporada (0 a 4) -> x, puesto (1 a 18) -> y.
function xDeTemporada(indice) {
  return (
    MARGEN_IZQ +
    (indice * (ANCHO_BUMP - MARGEN_IZQ - MARGEN_DER)) / (TEMPORADAS.length - 1)
  );
}
function yDePuesto(puesto) {
  return (
    MARGEN_SUP +
    ((puesto - 1) * (ALTO_BUMP - MARGEN_SUP - MARGEN_INF)) /
      (PUESTOS_MAXIMOS - 1)
  );
}

// Hamilton y Stroll comparten color con su compañero de equipo: se distinguen con línea de puntos.
function usaLineaPunteada(nombre) {
  return nombre === "Lewis Hamilton" || nombre === "Lance Stroll";
}

function BumpChart({ seleccionado, alSeleccionar, alMostrarTooltip }) {
  // Piloto sobre el que está el cursor (null si ninguno).
  const [pilotoBajoCursor, setPilotoBajoCursor] = useState(null);

  const seleccionadoEstaEnElGrafico = EVOLUCION_2021_2025.some(
    (p) => p.nombre === seleccionado,
  );

  // Piloto destacado: el del cursor o, si no hay, el seleccionado (si aparece en este gráfico).
  const destacado =
    pilotoBajoCursor || (seleccionadoEstaEnElGrafico ? seleccionado : null);

  function dibujarPiloto(piloto) {
    const color = colorDeEquipo(piloto.equipos[piloto.equipos.length - 1]); // color del equipo en la última temporada
    const puntos = piloto.posiciones
      .map((puesto, i) => Number.isFinite(puesto) ? `${xDeTemporada(i)},${yDePuesto(puesto)}` : null)
      .filter(Boolean)
      .join(" ");

    const estaDestacado = destacado === piloto.nombre;
    const puestoFinal = piloto.posiciones[TEMPORADAS.length - 1] ?? piloto.posiciones.filter(Number.isFinite).at(-1);
    const apellido = piloto.nombre.split(" ").pop();

    return html`
      <g
        key=${piloto.nombre}
        opacity=${destacado && !estaDestacado ? 0.15 : 1}
        style=${{ cursor: "pointer" }}
        onMouseEnter=${() => setPilotoBajoCursor(piloto.nombre)}
        onMouseLeave=${() => {
          setPilotoBajoCursor(null);
          alMostrarTooltip(null);
        }}
        onClick=${() => alSeleccionar(piloto.nombre)}
      >
        <polyline
          points=${puntos}
          fill="none"
          stroke="transparent"
          strokeWidth="14"
        />
        <polyline
          points=${puntos}
          fill="none"
          stroke=${color}
          strokeWidth=${estaDestacado ? 5 : 2.5}
          strokeDasharray=${usaLineaPunteada(piloto.nombre) ? "2 6" : "none"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        ${piloto.posiciones.map(
          (puesto, i) => Number.isFinite(puesto) && html`
            <circle
              key=${i}
              cx=${xDeTemporada(i)}
              cy=${yDePuesto(puesto)}
              r=${estaDestacado ? 7 : 5}
              fill=${color}
              onMouseMove=${(e) =>
                alMostrarTooltip({
                  x: e.clientX,
                  y: e.clientY,
                  lineas: [
                    piloto.nombre,
                    `${TEMPORADAS[i]}: puesto ${puesto}`,
                    `${piloto.puntos[i]} puntos, ${piloto.victorias[i]} victorias`,
                    piloto.equipos[i],
                  ],
                })}
            />
          `,
        )}
        <text
          className="lbl"
          x=${xDeTemporada(TEMPORADAS.length - 1) + 14}
          y=${yDePuesto(puestoFinal) + 4}
          fontWeight=${estaDestacado ? 700 : 400}
        >
          ${apellido}
        </text>
      </g>
    `;
  }

  const mensaje =
    seleccionado && !seleccionadoEstaEnElGrafico
      ? `${seleccionado} no está entre los 10 pilotos de este gráfico (no compitió las cinco temporadas).`
      : "Pasa el cursor o haz clic en una línea para seguir a un piloto.";

  return html`
    <${Fragment}>
      <div className="ctl"><span className="mut">${mensaje}</span></div>
      <svg
        viewBox=${`0 0 ${ANCHO_BUMP} ${ALTO_BUMP}`}
        role="img"
        aria-label="Bump chart de la clasificación final 2021 a 2025"
      >
        ${Array.from({ length: PUESTOS_MAXIMOS }, (_, i) => i + 1).map(
          (puesto) => html`
            <g key=${puesto}>
              <line
                className="grd"
                x1=${MARGEN_IZQ}
                x2=${ANCHO_BUMP - MARGEN_DER}
                y1=${yDePuesto(puesto)}
                y2=${yDePuesto(puesto)}
              />
              ${puesto % 2 === 1 &&
              html`<text
                className="mut"
                x=${MARGEN_IZQ - 12}
                y=${yDePuesto(puesto) + 4}
                textAnchor="end"
              >
                ${puesto}
              </text>`}
            </g>
          `,
        )}
        ${TEMPORADAS.map(
          (temporada, i) => html`
            <text
              key=${temporada}
              className="lbl"
              x=${xDeTemporada(i)}
              y=${ALTO_BUMP - 12}
              textAnchor="middle"
            >
              ${temporada}
            </text>
          `,
        )}
        ${EVOLUCION_2021_2025.map(dibujarPiloto)}
      </svg>
    <//>
  `;
}
