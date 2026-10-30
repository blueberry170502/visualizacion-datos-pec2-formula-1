// Heatmap.js — puntos de cada piloto (filas) en cada Gran Premio (columnas), 2025.
// El color de cada celda indica los puntos; una celda sin color es una carrera en la que el piloto no figura.

// Medidas del dibujo SVG (en píxeles del propio SVG, que luego se escala a la pantalla).
const MARGEN_IZQUIERDO = 165; // espacio para los nombres de los pilotos
const MARGEN_SUPERIOR = 96; // espacio para los nombres de las carreras, girados
const MARGEN_DERECHO = 45;
const ANCHO_CELDA = 30;
const ALTO_FILA = 24;

// Devuelve una copia de la lista de pilotos ordenada por puntos o por equipo.
function ordenarPilotos(criterio) {
  const copia = [...PILOTOS];
  if (criterio === "puntos") {
    return copia.sort((a, b) => b.puntos - a.puntos);
  }
  return copia.sort(
    (a, b) => a.equipo.localeCompare(b.equipo) || b.puntos - a.puntos,
  );
}

function Heatmap({ seleccionado, alSeleccionar, alMostrarTooltip }) {
  const [mostrarValores, setMostrarValores] = useState(false);
  const [criterioOrden, setCriterioOrden] = useState("puntos");

  const filas = useMemo(() => ordenarPilotos(criterioOrden), [criterioOrden]);

  const anchoSvg =
    MARGEN_IZQUIERDO + ANCHO_CELDA * CARRERAS.length + MARGEN_DERECHO;
  const altoSvg = MARGEN_SUPERIOR + ALTO_FILA * filas.length + 6;

  // Dibuja las celdas de un piloto. `y` es la posición vertical de su fila.
  function dibujarCeldas(piloto, y) {
    return piloto.puntosPorCarrera.map((puntos, numeroCarrera) => {
      if (puntos === null) return null; // no participó: celda vacía

      const x = MARGEN_IZQUIERDO + numeroCarrera * ANCHO_CELDA;
      const textoTooltip = [
        piloto.nombre,
        CARRERAS[numeroCarrera],
        puntos + " puntos",
      ];

      return html`
        <g key=${numeroCarrera}>
          <rect
            x=${x + 1}
            y=${y + 1}
            width=${ANCHO_CELDA - 2}
            height=${ALTO_FILA - 2}
            rx="2"
            fill=${colorCalor(puntos)}
            style=${{ cursor: "pointer" }}
            onClick=${() => alSeleccionar(piloto.nombre)}
            onMouseMove=${(e) =>
              alMostrarTooltip({
                x: e.clientX,
                y: e.clientY,
                lineas: textoTooltip,
              })}
            onMouseLeave=${() => alMostrarTooltip(null)}
          />
          ${mostrarValores &&
          puntos > 0 &&
          html`
            <text
              x=${x + ANCHO_CELDA / 2}
              y=${y + ALTO_FILA / 2 + 3.5}
              textAnchor="middle"
              pointerEvents="none"
              style=${{ font: "10px var(--bd)" }}
              fill=${puntos >= 15 ? "#fff" : "#222"}
            >
              ${puntos}
            </text>
          `}
        </g>
      `;
    });
  }

  return html`
    <${Fragment}>
      <div className="ctl">
        <${Boton}
          activo=${mostrarValores}
          onClick=${() => setMostrarValores(!mostrarValores)}
        >
          Mostrar puntos en las celdas
        <//>
        <${Boton}
          activo=${criterioOrden === "puntos"}
          onClick=${() => setCriterioOrden("puntos")}
        >
          Ordenar por puntos
        <//>
        <${Boton}
          activo=${criterioOrden === "equipo"}
          onClick=${() => setCriterioOrden("equipo")}
        >
          Ordenar por equipo
        <//>
        <span className="mut leyenda"
          >0 <i className="legend"></i> 25 puntos</span
        >
      </div>

      <div className="scroll">
        <svg
          viewBox=${`0 0 ${anchoSvg} ${altoSvg}`}
          role="img"
          aria-label="Heatmap de puntos por piloto y Gran Premio, temporada actual"
        >
          ${CARRERAS.map(
            (carrera, i) => html`
              <text
                key=${carrera}
                className="lbl"
                transform=${`translate(${MARGEN_IZQUIERDO + i * ANCHO_CELDA + ANCHO_CELDA / 2},${
                  MARGEN_SUPERIOR - 8
                }) rotate(-55)`}
              >
                ${carrera}
              </text>
            `,
          )}
          ${filas.map((piloto, i) => {
            const y = MARGEN_SUPERIOR + i * ALTO_FILA;
            const esSeleccionado = seleccionado === piloto.nombre;
            const hayOtroSeleccionado = seleccionado && !esSeleccionado;

            return html`
              <g key=${piloto.nombre} opacity=${hayOtroSeleccionado ? 0.4 : 1}>
                ${esSeleccionado &&
                html`<rect
                  x="0"
                  y=${y - 1}
                  width=${anchoSvg}
                  height=${ALTO_FILA}
                  rx="3"
                  fill="none"
                  stroke=${colorDeEquipo(piloto.equipo)}
                  strokeWidth="2"
                />`}
                <circle
                  cx="8"
                  cy=${y + ALTO_FILA / 2 - 1}
                  r="4"
                  fill=${colorDeEquipo(piloto.equipo)}
                />
                <text
                  x=${MARGEN_IZQUIERDO - 8}
                  y=${y + ALTO_FILA / 2 + 3}
                  textAnchor="end"
                  className=${"lbl rowl" + (esSeleccionado ? " on" : "")}
                  onClick=${() => alSeleccionar(piloto.nombre)}
                >
                  ${piloto.nombre}
                </text>
                ${dibujarCeldas(piloto, y)}
              </g>
            `;
          })}
        </svg>
      </div>
    <//>
  `;
}
