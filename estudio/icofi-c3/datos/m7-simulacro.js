// MÓDULO 7 — Simulacro final. Solo la configuración: las preguntas salen del banco de los otros módulos.
(function (g) {
  'use strict';

  g.ICOFI_C3.modulos.push({
    id: 'simulacro',
    n: 7,
    titulo: 'Simulacro final',
    corto: 'Simulacro final',
    bloques: [
      {
        tipo: 'simulacro',
        id: 'certamen',
        titulo: 'Simulacro final',
        minutos: 70,
        // Parte 1: verdadero o falso, tomados al azar de todas las rondas (primero los que no has respondido)
        vf: { n: 10, puntos: 3 },
        // Parte 2: un ejercicio por área. Primero los marcados con simulacro: true en los datos;
        // si ya se usaron todos, uno al azar de certamen de esa área.
        puntosEjercicios: 70,
        areas: [
          { id: 'presupuesto', titulo: 'Presupuestos', modulos: ['presupuestos'] },
          { id: 'costos', titulo: 'Contabilidad de costos', modulos: ['costos', 'ordenes', 'procesos', 'total-directo'] },
          { id: 'cvu', titulo: 'Relación costo–volumen–utilidad', modulos: ['cvu'] }
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
