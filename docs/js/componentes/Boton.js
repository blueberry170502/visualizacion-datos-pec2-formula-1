// Boton.js — botón redondeado de los controles. `activo` lo deja marcado (aria-pressed).
function Boton({ activo, ...resto }) {
  return html`<button className="pill" aria-pressed=${activo} ...${resto} />`;
}
