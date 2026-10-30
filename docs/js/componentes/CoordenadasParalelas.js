// CoordenadasParalelas.js — cada piloto es una línea que cruza cinco ejes verticales (una métrica por eje).
// Se puede arrastrar sobre un eje para filtrar los pilotos que quedan dentro de ese rango.

// Definición de los ejes. `valorDe` extrae la métrica de un piloto.
// La posición media usa valores negativos para que "mejor" (número más bajo) quede arriba.
const EJES = [
  {
    etiqueta: "Puntos",
    valorDe: (p) => p.puntos,
    minimo: 0,
    maximo: 1000,
    marcas: [0, 200, 400, 600, 800, 1000],
  },
  {
    etiqueta: "Victorias",
    valorDe: (p) => p.victorias,
    minimo: 0,
    maximo: 25,
    marcas: [0, 5, 10, 15, 20, 25],
  },
  {
    etiqueta: "Podios",
    valorDe: (p) => p.podios,
    minimo: 0,
    maximo: 30,
    marcas: [0, 5, 10, 15, 20, 25, 30],
  },
  {
    etiqueta: "Salidas desde pole",
    valorDe: (p) => p.poles,
    minimo: 0,
    maximo: 25,
    marcas: [0, 5, 10, 15, 20, 25],
  },
  {
    etiqueta: "Posición media",
    valorDe: (p) => -p.posicionMedia,
    minimo: -25,
    maximo: -1,
    marcas: [-24, -18, -12, -6],
    formatoMarca: (valor) => -valor, // se muestra en positivo
  },
];

// Medidas del dibujo SVG.
const ANCHO_SVG = 900;
const ALTO_SVG = 520;
const MARGEN_X = 60;
const MARGEN_ARRIBA = 70;
const MARGEN_ABAJO = 40;
const ALTO_EJE = ALTO_SVG - MARGEN_ARRIBA - MARGEN_ABAJO;
const SEPARACION_EJES = (ANCHO_SVG - 2 * MARGEN_X) / (EJES.length - 1);

// Convierte un valor de un eje en coordenada vertical (y), y al revés.
function yDeValor(eje, valor) {
  const proporcion = (valor - eje.minimo) / (eje.maximo - eje.minimo);
  return MARGEN_ARRIBA + (1 - proporcion) * ALTO_EJE;
}
function valorDeY(eje, y) {
  const proporcion = 1 - (y - MARGEN_ARRIBA) / ALTO_EJE;
  return eje.minimo + proporcion * (eje.maximo - eje.minimo);
}

function CoordenadasParalelas({
  seleccionado,
  alSeleccionar,
  alMostrarTooltip,
}) {
  // filtros: { indiceDelEje: [valorMinimo, valorMaximo] }. Vacío = sin filtro.
  const [filtros, setFiltros] = useState({});
  const svgRef = useRef(null);
  const arrastre = useRef(null); // { indiceEje, yInicial } mientras se arrastra

  // Posición vertical del ratón dentro del SVG, limitada a la zona de los ejes.
  function yDelRaton(evento) {
    const caja = svgRef.current.getBoundingClientRect();
    const y = ((evento.clientY - caja.top) * ALTO_SVG) / caja.height;
    return Math.max(MARGEN_ARRIBA, Math.min(MARGEN_ARRIBA + ALTO_EJE, y));
  }

  function empezarFiltro(indiceEje, evento) {
    evento.currentTarget.setPointerCapture(evento.pointerId);
    arrastre.current = { indiceEje, yInicial: yDelRaton(evento) };
    // Un clic sin arrastrar quita el filtro de ese eje.
    setFiltros((actuales) => {
      const nuevos = { ...actuales };
      delete nuevos[indiceEje];
      return nuevos;
    });
  }

  function moverFiltro(evento) {
    if (!arrastre.current) return;
    const { indiceEje, yInicial } = arrastre.current;
    const y = yDelRaton(evento);
    if (Math.abs(y - yInicial) < 4) return; // ignora movimientos mínimos

    const eje = EJES[indiceEje];
    const rango = [valorDeY(eje, yInicial), valorDeY(eje, y)].sort(
      (a, b) => a - b,
    );
    setFiltros((actuales) => ({ ...actuales, [indiceEje]: rango }));
  }

  // Un piloto pasa el filtro si está dentro del rango de todos los ejes filtrados.
  function pasaFiltros(piloto) {
    return EJES.every((eje, i) => {
      const rango = filtros[i];
      if (!rango) return true;
      const valor = eje.valorDe(piloto);
      return valor >= rango[0] && valor <= rango[1];
    });
  }

  const pilotosFiltrados = PILOTOS.filter(pasaFiltros);
  const hayFiltros = Object.keys(filtros).length > 0;

  // Orden de dibujo: primero los descartados, luego los filtrados y al final el seleccionado (queda encima).
  const ordenDeDibujo = [
    ...PILOTOS.filter((p) => !pilotosFiltrados.includes(p)),
    ...pilotosFiltrados.filter((p) => p.nombre !== seleccionado),
    ...pilotosFiltrados.filter((p) => p.nombre === seleccionado),
  ];

  function dibujarLinea(piloto) {
    const puntos = EJES.map(
      (eje, i) =>
        `${MARGEN_X + i * SEPARACION_EJES},${yDeValor(eje, eje.valorDe(piloto))}`,
    ).join(" ");

    const dentro = pilotosFiltrados.includes(piloto);
    const esSeleccionado = piloto.nombre === seleccionado;
    const grosor = dentro ? (esSeleccionado ? 4.5 : 2) : 1;
    const opacidad = !dentro ? 0.1 : seleccionado && !esSeleccionado ? 0.3 : 1;
    const textoTooltip = [
      piloto.nombre,
      piloto.equipo,
      piloto.puntos + " puntos",
      `${piloto.victorias} victorias, ${piloto.podios} podios`,
      "Posición media " + formatearDecimal(piloto.posicionMedia),
    ];

    return html`
      <g
        key=${piloto.nombre}
        style=${{ cursor: dentro ? "pointer" : "default" }}
        onClick=${() => dentro && alSeleccionar(piloto.nombre)}
        onMouseMove=${(e) =>
          dentro &&
          alMostrarTooltip({
            x: e.clientX,
            y: e.clientY,
            lineas: textoTooltip,
          })}
        onMouseLeave=${() => alMostrarTooltip(null)}
      >
        ${dentro &&
        html`<polyline
          points=${puntos}
          fill="none"
          stroke="transparent"
          strokeWidth="12"
        />`}
        <polyline
          points=${puntos}
          fill="none"
          stroke=${colorDeEquipo(piloto.equipo)}
          strokeWidth=${grosor}
          strokeLinejoin="round"
          opacity=${opacidad}
          pointerEvents="none"
        />
      </g>
    `;
  }

  const filtroRapidoGanadores = filtros[1] && filtros[1][0] === 1;
  const filtroRapidoPuntos = filtros[0] && filtros[0][0] === 350;

  return html`
    <${Fragment}>
      <div className="ctl">
        <${Boton} activo=${!hayFiltros} onClick=${() => setFiltros({})}
          >Todos<//
        >
        <${Boton}
          activo=${filtroRapidoGanadores}
          onClick=${() => setFiltros({ 1: [1, 25] })}
        >
          Ganadores de GP
        <//>
        <${Boton}
          activo=${filtroRapidoPuntos}
          onClick=${() => setFiltros({ 0: [350, 1000] })}
        >
          Más de 350 puntos
        <//>
      </div>

      <div className="chips">
        ${hayFiltros
          ? pilotosFiltrados.map(
              (piloto) => html`
                <button
                  key=${piloto.nombre}
                  className=${seleccionado === piloto.nombre ? "on" : ""}
                  onClick=${() => alSeleccionar(piloto.nombre)}
                >
                  <i style=${{ background: colorDeEquipo(piloto.equipo) }}></i
                  >${piloto.nombre}
                </button>
              `,
            )
          : html`<span>
              Arrastra sobre un eje para filtrar. Haz clic en una línea para
              seguir a un piloto.
            </span>`}
      </div>

      <svg
        ref=${svgRef}
        viewBox=${`0 0 ${ANCHO_SVG} ${ALTO_SVG}`}
        role="img"
        aria-label="Coordenadas paralelas de pilotos de la temporada actual"
        onPointerMove=${moverFiltro}
        onPointerUp=${() => (arrastre.current = null)}
      >
        ${EJES.map((eje, i) => {
          const x = MARGEN_X + i * SEPARACION_EJES;
          return html`
            <g key=${eje.etiqueta}>
              <line
                x1=${x}
                x2=${x}
                y1=${MARGEN_ARRIBA}
                y2=${MARGEN_ARRIBA + ALTO_EJE}
                stroke="var(--mut)"
              />
              <text className="axt" x=${x} y=${MARGEN_ARRIBA - 26}
                >${eje.etiqueta}</text
              >
              ${eje.marcas.map(
                (marca) => html`
                  <text
                    key=${marca}
                    className="mut"
                    x=${x - 8}
                    y=${yDeValor(eje, marca) + 4}
                    textAnchor="end"
                  >
                    ${eje.formatoMarca ? eje.formatoMarca(marca) : marca}
                  </text>
                `,
              )}
            </g>
          `;
        })}
        ${ordenDeDibujo.map(dibujarLinea)}
        ${EJES.map((eje, i) => {
          const x = MARGEN_X + i * SEPARACION_EJES;
          const rango = filtros[i];
          return html`
            <g key=${"filtro-" + eje.etiqueta}>
              ${rango &&
              html`<rect
                x=${x - 7}
                width="14"
                y=${yDeValor(eje, rango[1])}
                height=${yDeValor(eje, rango[0]) - yDeValor(eje, rango[1])}
                fill="rgba(225,6,0,.18)"
                stroke="#E10600"
                pointerEvents="none"
              />`}
              <rect
                x=${x - 14}
                width="28"
                y=${MARGEN_ARRIBA}
                height=${ALTO_EJE}
                fill="transparent"
                style=${{ cursor: "ns-resize", touchAction: "none" }}
                onPointerDown=${(e) => empezarFiltro(i, e)}
              />
            </g>
          `;
        })}
      </svg>
    <//>
  `;
}
