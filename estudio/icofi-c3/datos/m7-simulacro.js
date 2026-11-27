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
        // Formato probable: verdadero o falso + alternativas + 3 problemas de desarrollo.
        // Puntajes como en los certámenes 2022–2024, que traían estas mismas tres partes: 20 puntos cada pregunta.
        // Todo sale de certámenes reales: los V/F y las alternativas al azar de las rondas, sin repetir entre simulacros.
        vf: { n: 10, puntos: 2 },
        mc: { n: 10, puntos: 2 },
        // Un ejercicio de certamen por área (4 o 5 preguntas), distinto en cada simulacro mientras queden.
        ejercicio: { puntos: 20 },
        areas: [
          { id: 'presupuesto', titulo: 'Presupuestos', modulos: ['presupuestos'] },
          { id: 'costos', titulo: 'Contabilidad de costos', modulos: ['costos', 'ordenes', 'procesos', 'total-directo'] },
          { id: 'cvu', titulo: 'Relación costo–volumen–utilidad', modulos: ['cvu'] }
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
