// Guía interactiva ICOFI · Certamen 3 — datos base.
// Aquí solo hay contenido (sin lógica): las abreviaturas de los tooltips y la lista de módulos.
// Cada módulo vive en su propio archivo (m0-…, m1-…) y se agrega con ICOFI_C3.modulos.push({...}).
(function (g) {
  'use strict';

  g.ICOFI_C3 = {
    titulo: 'Estudio ICOFI interactivo',
    subtitulo: 'Certamen 3 · Presupuestos, Costos y Relación Costo–Volumen–Utilidad',
    credito: 'Hecho por Tomás Jarufe · tjarufe@usm.cl · https://tomasjarufe.site/',

    // Significado de cada abreviatura (tooltip al pasar el mouse o tocar).
    // En el texto de las lecciones se definen además la primera vez que aparecen.
    abreviaturas: {
      'SI': 'saldo inicial',
      'SF': 'saldo final',
      'II': 'inventario inicial',
      'IF': 'inventario final',
      'MP': 'materia prima',
      'MP₁': 'costo transferido desde el departamento 1 (se trata como una materia prima más)',
      'PT': 'productos terminados',
      'PenP': 'productos en proceso',
      'CxC': 'cuentas por cobrar',
      'CxP': 'cuentas por pagar',
      'IVA': 'impuesto al valor agregado (19 %)',
      'PIB': 'producto interno bruto',
      'PBC': 'presupuesto base cero',
      'PUD': 'paquete unitario de decisión',
      'FODA': 'fortalezas, oportunidades, debilidades y amenazas',
      'EERR': 'estado de resultados',
      'ROE': 'rentabilidad sobre el patrimonio',
      'MPD': 'materia prima directa',
      'MPI': 'materia prima indirecta',
      'MOD': 'mano de obra directa',
      'MOI': 'mano de obra indirecta',
      'MO': 'mano de obra',
      'CIF': 'costos indirectos de fabricación',
      'GF': 'gastos de fabricación (lo mismo que los CIF)',
      'CC': 'costo de conversión (MOD + CIF)',
      'HH': 'horas hombre',
      'UE': 'unidades equivalentes',
      'FIFO': 'primero en entrar, primero en salir',
      'LIFO': 'último en entrar, primero en salir',
      'PPP': 'precio promedio ponderado',
      'NIC 2': 'norma internacional de contabilidad sobre inventarios',
      'cvᵤ': 'costo variable unitario',
      'cfᵤ': 'costo fijo unitario',
      'mcᵤ': 'margen de contribución unitario',
      'CV': 'costos variables totales',
      'CF': 'costos fijos totales',
      'MC': 'margen de contribución total',
      'CVU': 'relación costo–volumen–utilidad',
      'rc': 'razón de contribución (mcᵤ / precio)',
      'rr': 'razón de recuperación (cvᵤ / precio)',
      'PE': 'punto de equilibrio',
      'MS': 'margen de seguridad',
      'UAI': 'utilidad antes de impuesto',
      'UDI': 'utilidad después de impuesto',
      'OT': 'orden de trabajo',
      'M$': 'miles de pesos',
      'USD': 'dólares de Estados Unidos'
    },

    // Los módulos se agregan desde sus archivos; la página los ordena por "n".
    modulos: []
  };
})(typeof window !== 'undefined' ? window : globalThis);
