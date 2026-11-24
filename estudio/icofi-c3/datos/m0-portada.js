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

})(typeof window !== 'undefined' ? window : globalThis);
