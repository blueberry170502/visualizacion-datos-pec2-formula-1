// FichaPiloto.js — resumen del piloto seleccionado (se ve en las tres pestañas).
function FichaPiloto({ seleccionado, alSeleccionar }) {
  const piloto = PILOTOS.find((p) => p.nombre === seleccionado);

  if (!piloto) {
    return html`<p className="hint">
      Haz clic en un piloto de cualquier gráfico: quedará destacado en los tres.
    </p>`;
  }

  // Solo los 10 pilotos del bump chart tienen datos de 2021 a 2025.
  const evolucion = EVOLUCION_2021_2026.find((p) => p.nombre === seleccionado);

  return html`
    <div
      className="dcard"
      style=${{ borderLeftColor: colorDeEquipo(piloto.equipo) }}
    >
      <header>
        <b>${piloto.nombre}</b>
        <${Boton} onClick=${() => alSeleccionar(piloto.nombre)}>Quitar<//>
      </header>
      <p>${piloto.equipo}, ${piloto.puntos} puntos en Grandes Premios</p>
      <p>
        ${piloto.victorias} victorias, ${piloto.podios} podios, ${piloto.poles}
        salidas desde pole
      </p>
      <p>
        Posición media de llegada: ${formatearDecimal(piloto.posicionMedia)}
      </p>
      ${evolucion &&
      html`<p>Posiciones 2021–2026: ${evolucion.posiciones.join(", ")}</p>`}
    </div>
  `;
}
