# PEC 2 — Visualizaciones de Fórmula 1

## Archivos
- `pec2_formula1_visualizaciones.ipynb`: notebook con descarga de datos, preparación, tres gráficos y exportación HTML.
- `requirements.txt`: dependencias.
- `docs/`: destino de los HTML generados al ejecutar el notebook.

## Página web (React, sin compilar)
`docs/index.html` es la página interactiva. Está escrita con React, pero **no necesita compilación ni instalar nada**: el código de `docs/` es el que se publica tal cual, y se puede abrir con doble clic.

```
docs/
├── index.html                  Carga las librerías y los scripts, en orden
├── css/styles.css              Estilos (variables de color al principio)
├── vendor/                     React, ReactDOM y htm (copias locales de las librerías)
└── js/
    ├── datos/pilotos.js        Datos del notebook: pilotos 2025 y clasificaciones 2021-2025
    ├── datos/textos.js         Textos de cada técnica (edítalos aquí)
    ├── utilidades.js           Colores, escala del heatmap, formato de números
    ├── componentes/
    │   ├── Heatmap.js
    │   ├── CoordenadasParalelas.js
    │   ├── BumpChart.js
    │   ├── FichaPiloto.js      Ficha del piloto seleccionado
    │   ├── Cabecera.js         Titular y clasificación final
    │   ├── Boton.js
    │   └── Tooltip.js
    └── app.js                  Componente principal: pestañas y estado compartido
```

Idea clave: el piloto seleccionado es un estado que vive en `app.js` y se pasa a los tres gráficos, por eso al hacer clic en un piloto se destaca en todos.

**Aviso:** si vuelves a ejecutar la última celda del notebook (sección 9), sobrescribirá `docs/index.html` con la página sencilla antigua. Elimina o comenta esa celda.

## Ejecución
```bash
python -m pip install -r requirements.txt
jupyter lab
```
Abre el notebook y ejecuta todas las celdas en orden. Requiere internet para consultar Jolpica F1 API.

## Publicación
1. Ejecuta el notebook para generar `docs/index.html`, `docs/heatmap.html`, `docs/parallel-coordinates.html` y `docs/bump-chart.html`.
2. Sube el repositorio a GitHub.
3. En Settings → Pages, elige desplegar desde la rama principal y la carpeta `/docs`.
4. Prueba la URL pública y los tres enlaces sin iniciar sesión.

Fuente: [Jolpica F1 API](https://github.com/jolpica/jolpica-f1). Consulta su documentación y respeta sus términos de uso.


## Datos en directo

La web consulta Jolpica F1 API al abrirse. Los resultados de la temporada actual alimentan el heatmap y las coordenadas paralelas; las clasificaciones 2021–temporada actual alimentan el bump chart. No se necesita backend: las peticiones se hacen desde el navegador. La API limita el acceso sin autenticación a 4 peticiones por segundo y 500 por hora; el código espacía las consultas. Si la API no responde, se muestra un aviso.
