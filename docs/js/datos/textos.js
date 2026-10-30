// textos.js — textos de la página para cada técnica de visualización.
// Edita aquí cualquier explicación sin tocar el código de los gráficos.

const TEXTOS = {
  heatmap: {
    nombre: "Heatmap",
    subtitulo: "¿Cuándo puntuó cada piloto?",
    pregunta: "¿En qué Grandes Premios puntuó cada piloto en 2025?",
    queEs:
      "Una matriz donde cada celda cruza una fila con una columna y su color codifica un valor numérico.",
    origen:
      "Toussaint Loua usó una matriz coloreada en 1873 para comparar distritos de París. El término «heat map» se atribuye a Cormac Kinney (1991).",
    datosAdmitidos:
      "Dos dimensiones categóricas u ordenadas (piloto × carrera) y una medida cuantitativa (puntos). Rinde bien de decenas a cientos de filas; con pocos valores, una tabla es mejor.",
    limitaciones:
      "El color se compara peor que la longitud. Necesita una escala bien elegida y distinguir las celdas vacías de los ceros.",
    comoLeerlo:
      "Una fila intensa y constante indica regularidad; una celda aislada intensa, un resultado puntual. Las celdas sin color son carreras en las que el piloto no figura: Doohan solo aparece en 6. Haz clic en el nombre de un piloto para seguirlo en los tres gráficos.",
    hallazgos:
      "Norris (394), Verstappen (389) y Piastri (381) quedan a 13 puntos sumando solo los Grandes Premios. Verstappen suma 159 en las primeras 12 carreras y 230 en las últimas 12; Piastri hace lo contrario: 220 y 161.",
    nota: "Solo cuentan los Grandes Premios, sin sprints. Por eso los totales difieren de la clasificación oficial.",
  },
  pcp: {
    nombre: "Coordenadas paralelas",
    subtitulo: "¿Qué perfil tiene cada piloto?",
    pregunta: "¿Qué perfiles estadísticos distinguen a los pilotos en 2025?",
    queEs:
      "Cada variable es un eje vertical y cada observación, una línea que los atraviesa. Se filtra arrastrando sobre un eje.",
    origen:
      "Maurice d’Ocagne usó ejes paralelos en nomogramas (1885). Alfred Inselberg la desarrolló como técnica para datos multidimensionales (1985).",
    datosAdmitidos:
      "De 4 a unas 15 variables numéricas por observación, con decenas o pocos cientos de líneas. Cada eje conserva su propia escala.",
    limitaciones:
      "Se satura con muchas líneas, el orden de los ejes cambia lo que se ve y solo los ejes contiguos se comparan bien. Identificar una línea cuesta.",
    comoLeerlo:
      "Arrastra sobre cualquier eje para seleccionar un rango y observa dónde caen esas líneas en los demás. En «Posición media» arriba es mejor.",
    hallazgos:
      "Verstappen marca el máximo en victorias (8), salidas desde pole (8) y posición media (3,67), pero Norris lidera puntos (394) y podios (18). Hamilton suma 135 puntos sin ningún podio en Grandes Premios.",
    nota: "Los ejes usan sus valores reales y el color de cada línea es el de su equipo.",
  },
  bump: {
    nombre: "Bump chart",
    subtitulo: "¿Quién subió y quién cayó?",
    pregunta:
      "¿Cómo evolucionó la posición final de los pilotos entre 2021 y 2025?",
    queEs:
      "Un gráfico de líneas que traza posiciones en lugar de valores: el eje vertical es el puesto y las líneas se cruzan cuando dos elementos se adelantan.",
    origen:
      "Su nombre se asocia a las «bumps», regatas de remo de Cambridge y Oxford donde cada barco persigue al de delante. Hoy es un formato habitual para rankings a lo largo del tiempo.",
    datosAdmitidos:
      "Una categoría (piloto), un orden o tiempo (temporada) y un ranking entero. Ideal con 5–15 elementos y 3 o más momentos.",
    limitaciones:
      "Descarta la magnitud: pasar de 1.º a 2.º se ve igual con 2 puntos de diferencia que con 200. Con más de 15 líneas se vuelve ilegible.",
    comoLeerlo:
      "Una línea que sube mejora de puesto, porque el 1.º está arriba. Pasa el cursor por una línea para aislarla y ver puntos, victorias y equipo.",
    hallazgos:
      "Verstappen fue 1.º de 2021 a 2024 y baja a 2.º en 2025. Norris escala de 6.º a campeón. Hamilton pasa de 2.º a 6.º y Gasly de 9.º a 18.º.",
    nota: "Se muestran los 10 pilotos presentes en las cinco temporadas. Los puestos son los de la clasificación oficial completa.",
  },
};
