// Cabecera.js — titular y clasificación final de 2025 (los puntos incluyen sprints).
const TEMPORADA_ACTUAL = 2025;
const CLASIFICACION_ACTUAL = [...PILOTOS]
  .sort((a, b) => b.puntos - a.puntos)
  .slice(0, 5)
  .map((p, i, lista) => ({
    nombre: p.nombre,
    equipo: p.equipo,
    puntos: p.puntos,
    diferencia: i === 0 ? "" : `−${lista[0].puntos - p.puntos}`,
  }));

function Cabecera({ seleccionado, alSeleccionar }) {
  return html`
    <header>
      <div className="wrap">
        <div>
          <h1>
            Temporada ${TEMPORADA_ACTUAL}: ¿cómo está evolucionando el campeonato?
          </h1>
          <p>
            Tres técnicas de visualización sobre los mismos resultados de
            Fórmula 1. Elige una y explora los datos.
          </p>
        </div>
        <div>
          <ol className="tower">
            ${CLASIFICACION_ACTUAL.map(
              (fila, i) => html`
                <li
                  key=${fila.nombre}
                  tabindex="0"
                  className=${seleccionado === fila.nombre ? "on" : ""}
                  onClick=${() => alSeleccionar(fila.nombre)}
                  onKeyDown=${(e) =>
                    e.key === "Enter" && alSeleccionar(fila.nombre)}
                >
                  <span>${i + 1}</span>
                  <i style=${{ background: colorDeEquipo(fila.equipo) }}></i>
                  <span>${fila.nombre} <small>${fila.equipo}</small></span>
                  <small>${fila.diferencia}</small>
                  <b>${fila.puntos}</b>
                </li>
              `,
            )}
          </ol>
          <div className="cap">
            Clasificación según los puntos de Grandes Premios de ${TEMPORADA_ACTUAL} (sin sprints).
            Haz clic en un piloto para seguirlo.
          </div>
        </div>
      </div>
    </header>
  `;
}
