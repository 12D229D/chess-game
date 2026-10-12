# Ajedrez

Juego de ajedrez en el navegador con reglas completas, modo local 2 jugadores y modo contra IA.

## Características

- Reglas completas: enroque, captura al paso, promoción, jaque, mate, ahogado
- Tablas por material insuficiente, regla de 50 movimientos y triple repetición
- IA con minimax y poda alfa-beta (3 niveles de dificultad)
- Historial de movimientos, piezas capturadas y coordenadas del tablero
- Deshacer jugada (`Ctrl+Z` o botón)
- Sonidos opcionales y diseño responsive

## Cómo jugar

1. Haz clic en una pieza para seleccionarla; las casillas legales se resaltan.
2. Haz clic en una casilla resaltada para mover.
3. Usa el toggle **vs IA** para jugar contra la computadora.
4. Elige tu color y la dificultad cuando juegues contra la IA.

## Ejecución

### Opción A — Abrir directamente

Abre `index.html` en tu navegador. No requiere instalación.

### Opción B — Servidor Node

```bash
cd chess-game
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

## Controles

| Acción | Control |
|--------|---------|
| Mover pieza | Clic en casilla |
| Nueva partida | Botón "Nueva partida" |
| Deshacer | Botón "Deshacer" o `Ctrl+Z` |
| Activar IA | Toggle "vs IA" |
| Promoción | Diálogo al llegar el peón a la última fila |

## Estructura

```
chess-game/
├── index.html   # Interfaz
├── script.js    # Motor de reglas, IA y UI
├── style.css    # Estilos
├── server.js    # Servidor estático (puerto 3000)
└── package.json
```

## Tecnologías

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Node.js (servidor estático opcional)
- Minimax con tablas de posición (PST)

## Casos de prueba manuales

1. **Enroque corto** — Blancas: rey e1 → g1 sin jaque previo.
2. **En passant** — Peón avanza 2 casillas; el rival captura en diagonal al paso.
3. **Promoción** — Llevar un peón a la 8ª fila y elegir pieza.
4. **Mate** — Rey sin movimientos legales en jaque → victoria del atacante.
5. **Ahogado** — Rey sin movimientos legales sin jaque → tablas.
6. **50 movimientos** — 50 jugadas sin peón ni captura → tablas.
7. **vs IA** — Activar IA, jugar e4; las negras responden automáticamente.
