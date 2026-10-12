# Plan: chess-game

## Resumen
Juego de ajedrez en el navegador con reglas completas FIDE, modo local 2 jugadores y modo contra IA (minimax con poda alfa-beta), soporte de arrastrar y soltar piezas (drag & drop), sintetizador de sonido y servidor estático Node opcional.

## Objetivos
- [x] Tablero 8×8 con reglas FIDE básicas jugables de punta a punta.
- [x] Dos modos: **2 jugadores** (mismo dispositivo) y **vs IA** (negras/blancas).
- [x] Feedback visual claro: movimientos legales, jaque, último movimiento, fin de partida.
- [x] IA con evaluación material + tablas de posición (PST), profundidad configurable (1, 3, 5).
- [x] Experiencia responsive en escritorio y móvil con soporte Drag & Drop.

---

## 🏗️ Arquitectura

```text
chess-game/
├── index.html      # UI: tablero con coordenadas, panel lateral, modales
├── script.js       # Motor de reglas FIDE, render, Drag & Drop, IA minimax
├── style.css       # Layout flex/grid, tema oscuro, media queries
├── server.js       # Servidor HTTP estático (puerto 3000)
├── package.json    # npm start
├── README.md       # Documentación
└── plan.md
```

---

## 🧠 Paradigma de Programación

- **Híbrido: Orientado a Objetos (OOP) + Event-Driven + Funcional**:
  - `state` y evaluación de tablero con funciones inmutables y puras.
  - IA minimax con poda alfa-beta y ordenamiento de capturas.
  - Event-driven: clicks, teclas de atajo (`Ctrl+Z`), y eventos de arrastre HTML5 Drag & Drop.

---

## 🌐 Propósito de Visibilidad y Destino Remoto

- **Visibilidad**: `Público (Open Source / Portafolio)`.
- **Plataforma Remota Asignada**: `GitHub`.
- **Plataforma de Despliegue CI/CD**: `GitHub Pages` / `Cloudflare Pages`.
- **Justificación**: Motor de ajedrez completo con reglas FIDE, IA Minimax y soporte Drag & Drop ejecutable íntegramente en el cliente web sin backend obligatorio; ideal para GitHub Pages.

---

## Estado actual
- Estado: ✅ **Completado**
- Todas las reglas FIDE implementadas: Enroque corto/largo, Captura al paso (*En Passant*), Promoción de peón, Jaque, Jaque Mate, Ahogado, Tablas por material insuficiente, Regla de 50 movimientos y Triple repetición.
- Drag & Drop interactivo para mover piezas arrastrándolas con el ratón.

## Tareas realizadas
- [x] Tablero inicial y render con piezas Unicode y coordenadas a-h / 1-8.
- [x] Movimiento legal de todas las piezas (filtrado por jaque).
- [x] **Enroque** corto y largo (con casillas intermedias no atacadas).
- [x] **Captura al paso** (`enPassant`).
- [x] **Promoción de peón** con diálogo de elección interactivo.
- [x] **Jaque** (resaltado del rey) y **jaque mate**.
- [x] **Ahogado** (sin movimientos legales sin jaque).
- [x] **Tablas por material insuficiente** y **regla de 50 movimientos**.
- [x] **Detección de triple repetición**.
- [x] **Deshacer jugada** (`Ctrl+Z` o botón) con historial completo.
- [x] **Arrastrar y soltar piezas (drag & drop)** además del clic directo.
- [x] **Sonidos opcionales** (mover, capturar, jaque, mate, tablas).
- [x] IA minimax con poda alfa-beta y dificultad seleccionable.
