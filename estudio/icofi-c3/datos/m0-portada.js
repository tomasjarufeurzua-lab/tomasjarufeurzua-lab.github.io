// MÓDULO 0 — Cómo es el Certamen 3 (portada).
(function (g) {
  'use strict';

  g.ICOFI_C3.modulos.push({
    id: 'inicio',
    n: 0,
    titulo: 'Cómo es el Certamen 3',
    corto: 'Cómo es el Certamen 3',
    bloques: [
      {
        tipo: 'portada',
        id: 'portada',
        titulo: 'Cómo es el Certamen 3',
        bajada: 'Una guía para aprender desde cero presupuestos, contabilidad de costos y la relación costo–volumen–utilidad. Siempre igual: un poco de materia, un ejercicio, y la página te corrige y te explica.',
        ficha: [
          { rot: 'Fecha', valor: 'Sábado 28 de noviembre de 2026', extra: '08:15 hrs · presencial (teoría y ejercicios)' },
          { rot: 'Formato', valor: '10 V/F + 3 ejercicios', extra: 'V/F: 30 puntos · ejercicios de 4–5 preguntas, 20–25 puntos cada uno' },
          { rot: 'Tiempo', valor: '70 minutos', extra: 'Con calculadora simple' }
        ],
        contenidos: [
          '<b>Presupuestos:</b> operacionales y financieros.',
          '<b>Contabilidad de costos:</b> costo del producto y sistemas de costos.',
          '<b>Relación costo–volumen–utilidad:</b> relación costo–volumen–utilidad, punto de equilibrio y margen de seguridad.'
        ],
        repiten: [
          'Presupuesto de compras o producción, y presupuesto de caja.',
          'Costos: elementos del costo, órdenes con costos indirectos aplicados versus reales, o procesos con unidades equivalentes.',
          'Costo–volumen–utilidad: costos fijos, punto de equilibrio, margen de seguridad y unidades para una utilidad neta.'
        ],
        mapa: [
          { t: 'Presupuestos', h: 'Para qué se planifica' },
          { t: 'Costos', h: 'Cuánto cuesta producir y vender' },
          { t: 'Costo–volumen–utilidad', h: 'Cuánto hay que vender para ganar' }
        ]
      }
    ]
  });

  // Módulos todavía no cargados (prototipo: por ahora solo está completo el Módulo 4).
  [
    { id: 'presupuestos', n: 1, titulo: 'Presupuestos', corto: 'Presupuestos' },
    { id: 'costos', n: 2, titulo: 'Fundamentos de costos', corto: 'Fundamentos de costos' },
    { id: 'ordenes', n: 3, titulo: 'Sistemas de costeo: órdenes específicas y el problema de los CIF', corto: 'Órdenes específicas y CIF' },
    { id: 'total-directo', n: 5, titulo: 'Costeo total (absorción) vs costeo directo (variable)', corto: 'Costeo total vs directo' },
    { id: 'cvu', n: 6, titulo: 'Relación Costo–Volumen–Utilidad (CVU)', corto: 'Costo–Volumen–Utilidad' },
    { id: 'simulacro', n: 7, titulo: 'Simulacro final', corto: 'Simulacro final' },
    { id: 'formulas', n: 8, titulo: 'Hoja de fórmulas', corto: 'Hoja de fórmulas' }
  ].forEach(function (m) { m.pendiente = true; m.bloques = []; g.ICOFI_C3.modulos.push(m); });
})(typeof window !== 'undefined' ? window : globalThis);
