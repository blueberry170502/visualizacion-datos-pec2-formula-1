// Tooltip.js — cuadro de información que sigue al cursor.
// `info` tiene la forma { x, y, lineas: [titulo, linea2, linea3...] } o es null si no hay que mostrarlo.
function Tooltip({ info }) {
  if (!info) return null;

  const [titulo, ...lineas] = info.lineas;
  return html`
    <div className="tip" style=${{ left: info.x, top: info.y }}>
      <b>${titulo}</b>
      ${lineas.map((linea, i) => html`<div key=${i}>${linea}</div>`)}
    </div>
  `;
}
