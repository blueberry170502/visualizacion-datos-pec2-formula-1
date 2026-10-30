// utilidades.js — piezas comunes que usan todos los gráficos.

// React se carga desde vendor/ y queda disponible como variable global.
// `html` nos deja escribir la interfaz con etiquetas parecidas a HTML dentro del JavaScript
// (es la librería htm, una alternativa a JSX que no necesita compilar nada).
const { useState, useMemo, useRef, useEffect, Fragment } = React;
const html = htm.bind(React.createElement);

// ---------- Colores de equipo ----------

const COLORES_EQUIPO = {
  McLaren: "#FF8000",
  "Red Bull": "#3671C6",
  Mercedes: "#00A39B",
  Ferrari: "#E8002D",
  Williams: "#0A8FD6",
  "Aston Martin": "#1E8F6B",
  Sauber: "#3BAA3B",
  "Racing Bulls": "#6A7DE0",
  Haas: "#7C838B",
  "Haas F1 Team": "#7C838B",
  Alpine: "#E4569B",
  "Alpine F1 Team": "#E4569B",
  AlphaTauri: "#4F6E8F",
};

function colorDeEquipo(equipo) {
  return COLORES_EQUIPO[equipo] || "#888888";
}

// ---------- Escala de color del heatmap ----------

// Un Gran Premio da como máximo 25 puntos (victoria sin sprint).
const PUNTOS_MAXIMOS_GP = 25;

// Puntos de control de la escala: de gris claro (0 puntos) a granate (25 puntos).
// `posicion` va de 0 a 1 y `rgb` es el color en ese punto.
const ESCALA_CALOR = [
  { posicion: 0, rgb: [237, 239, 242] },
  { posicion: 0.25, rgb: [255, 209, 102] },
  { posicion: 0.55, rgb: [242, 107, 29] },
  { posicion: 0.8, rgb: [215, 20, 26] },
  { posicion: 1, rgb: [122, 10, 18] },
];

// Devuelve el color de una celda interpolando entre los dos puntos de control más cercanos.
function colorCalor(puntos) {
  const t = Math.min(puntos / PUNTOS_MAXIMOS_GP, 1);

  let i = 1;
  while (ESCALA_CALOR[i].posicion < t) i++;
  const anterior = ESCALA_CALOR[i - 1];
  const siguiente = ESCALA_CALOR[i];

  const avance =
    (t - anterior.posicion) / (siguiente.posicion - anterior.posicion);
  const rgb = anterior.rgb.map((canal, j) =>
    Math.round(canal + (siguiente.rgb[j] - canal) * avance),
  );
  return `rgb(${rgb.join(",")})`;
}

// ---------- Formato ----------

// 3.6666 -> "3,67" (coma decimal, como en español)
function formatearDecimal(numero) {
  return numero.toFixed(2).replace(".", ",");
}
