// app.js — componente principal. Guarda el estado que comparten los tres gráficos:
//   · pestaña activa (técnica que se está viendo)
//   · piloto seleccionado (se destaca en todos los gráficos)
//   · información del tooltip

// Claves de las tres técnicas (coinciden con las de TEXTOS) y el componente que dibuja cada una.
const TECNICAS = ["heatmap", "pcp", "bump"];
const GRAFICO_DE = {
  heatmap: Heatmap,
  pcp: CoordenadasParalelas,
  bump: BumpChart,
};

// La pestaña activa se guarda en la URL (#heatmap, #pcp, #bump) para poder enlazar cada una.
function tecnicaDeLaUrl() {
  const clave = location.hash.slice(1);
  return TECNICAS.includes(clave) ? clave : "heatmap";
}

function App() {
  const [tecnica, setTecnica] = useState(tecnicaDeLaUrl);
  const [seleccionado, setSeleccionado] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // Cuando cambia el # de la URL, cambiamos de pestaña.
  useEffect(() => {
    function alCambiarLaUrl() {
      setTecnica(tecnicaDeLaUrl());
      setTooltip(null);
    }
    addEventListener("hashchange", alCambiarLaUrl);
    return () => removeEventListener("hashchange", alCambiarLaUrl);
  }, []);

  // Clic en un piloto: lo selecciona; otro clic sobre el mismo lo deselecciona.
  function alternarSeleccion(nombre) {
    setSeleccionado((actual) => (actual === nombre ? null : nombre));
  }

  const texto = TEXTOS[tecnica];
  const Grafico = GRAFICO_DE[tecnica];

  return html`
    <${Fragment}>
      <${Cabecera}
        seleccionado=${seleccionado}
        alSeleccionar=${alternarSeleccion}
      />

      <main className="wrap">
        <div className="api-status" role="status">
          Datos históricos de Jolpica F1 API preparados en el notebook · Temporada 2025 · ${CARRERAS.length} Grandes Premios · ${PILOTOS.length} pilotos
        </div>
        <nav role="tablist">
          ${TECNICAS.map(
            (clave) => html`
              <button
                key=${clave}
                role="tab"
                aria-selected=${tecnica === clave}
                onClick=${() => (location.hash = clave)}
              >
                <b>${TEXTOS[clave].nombre}</b>
                <span>${TEXTOS[clave].subtitulo}</span>
              </button>
            `,
          )}
        </nav>

        <div className="grid">
          <aside>
            <h2>${texto.nombre}</h2>
            <p className="q">${texto.pregunta}</p>
            <dl>
              <dt>Qué es</dt>
              <dd>${texto.queEs}</dd>
              <dt>Origen</dt>
              <dd>${texto.origen}</dd>
              <dt>Datos que admite</dt>
              <dd>${texto.datosAdmitidos}</dd>
              <dt>Limitaciones</dt>
              <dd>${texto.limitaciones}</dd>
            </dl>
            <${FichaPiloto}
              seleccionado=${seleccionado}
              alSeleccionar=${alternarSeleccion}
            />
          </aside>

          <div className="chart">
            <${Grafico}
              key=${tecnica}
              seleccionado=${seleccionado}
              alSeleccionar=${alternarSeleccion}
              alMostrarTooltip=${setTooltip}
            />
          </div>
        </div>

        <div className="find">
          <div>
            <h3>Cómo leerlo</h3>
            <p>${texto.comoLeerlo}</p>
          </div>
          <div>
            <h3>Qué muestran los datos</h3>
            <p>${texto.hallazgos}</p>
          </div>
        </div>
        <p className="note">${texto.nota}</p>
      </main>

      <footer>
        <div className="wrap">
          Datos:${" "}
          <a href="https://github.com/jolpica/jolpica-f1">Jolpica F1 API</a>. Datos descargados y preparados previamente en el notebook. Heatmap y coordenadas paralelas: temporada 2025; bump chart: temporadas 2021–2025.
        </div>
      </footer>

      <${Tooltip} info=${tooltip} />
    <//>
  `;
}

ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
