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
      },

      // ------------------------------------------------------------------ L0.1
      {
        tipo: 'leccion',
        id: 'lo-de-antes',
        titulo: 'Lo que necesitas de antes',
        idea: 'Cinco ideas de los certámenes anteriores que se usan en todo lo que viene. Si las tienes claras, lo nuevo se apoya en ellas.',
        partes: [
          { k: 'sub', h: '1. El estado de resultados (EERR)' },
          { k: 'datos', cols: ['', ''], filas: [
            ['Ingresos por venta', ''],
            ['− Costo de venta', ''],
            ['<b>= Margen bruto</b>', ''],
            ['− Gastos operacionales', 'administración y ventas'],
            ['<b>= Resultado operacional</b>', ''],
            ['− Impuesto a la renta', ''],
            ['<b>= Resultado (utilidad) neto</b>', '']
          ] },
          { k: 'sub', h: '2. El balance' },
          { k: 'p', h: 'Activos = pasivos + patrimonio. Los **inventarios** (mercaderías, materias primas, productos) son activo corriente.' },
          { k: 'sub', h: '3. El impuesto al valor agregado (IVA), 19 %' },
          { k: 'p', h: 'Precio “+ IVA” o “neto” quiere decir **sin** impuesto. “Bruto” o “IVA incluido” quiere decir **con** impuesto. Los resultados se calculan **siempre con valores netos**.' },
          { k: 'formula', h: 'Neto = {{Bruto // 1,19}}' },
          { k: 'sub', h: '4. Devengado' },
          { k: 'p', h: 'Una venta se registra cuando se factura, aunque se cobre después. Lo que todavía no se cobra queda como **cuenta por cobrar**.' },
          { k: 'sub', h: '5. El impuesto a la renta' },
          { k: 'formula', h: 'Utilidad neta = Utilidad antes de impuesto × (1 − t)' },
          { k: 'p', h: 'La letra t es la tasa de impuesto. Por ejemplo, con t = 27 %, de cada $ 100 antes de impuesto quedan $ 73.' }
        ]
      },
      {
        tipo: 'ejercicio',
        id: 'repaso-rapido',
        titulo: 'Ejercicio rápido de repaso',
        fuente: { k: 'ejemplo' },
        datos: { bruto: 297500, uai: 3000000, t: 0.27 },
        enunciado: '<p>Un producto se vende a <b>$ 297.500 IVA incluido</b>. Aparte, una empresa tiene una utilidad antes de impuesto de <b>$ 3.000.000</b> y la tasa de impuesto a la renta es <b>27 %</b>.</p>',
        partes: [
          {
            titulo: 'Dos cálculos que vas a repetir muchas veces',
            preguntas: [
              {
                id: 'neto', texto: 'Precio neto del producto (sin IVA)', tipo: 'pesos', respuesta: 250000,
                pista: 'El bruto es el neto más 19 %: bruto = neto × 1,19.',
                trampas: [
                  { valor: 240975, propia: true, msg: 'le restaste 19 % al precio bruto. El IVA se calcula sobre el neto, así que se divide por 1,19.' },
                  { valor: 354025, propia: true, msg: 'le sumaste IVA a un precio que ya lo traía. “IVA incluido” es el bruto: para llegar al neto se divide por 1,19.' }
                ],
                sol: { d: 'Precio con IVA incluido (bruto): $ 297.500. IVA: 19 %.', f: 'Neto = bruto ÷ 1,19', c: '297.500 ÷ 1,19 = $ 250.000' }
              },
              {
                id: 'neta', texto: 'Utilidad neta (después de impuesto)', tipo: 'pesos', respuesta: 2190000,
                pista: 'Si el impuesto se lleva el 27 %, a la empresa le queda el 73 %.',
                trampas: [
                  { valor: 810000, propia: true, msg: 'ese es el impuesto (27 % de $ 3.000.000). Piden lo que queda después de pagarlo.' }
                ],
                sol: { d: 'Utilidad antes de impuesto: $ 3.000.000. Tasa de impuesto: t = 27 %.', f: 'Utilidad neta = utilidad antes de impuesto × (1 − t)', c: '3.000.000 × (1 − 0,27) = 3.000.000 × 0,73 = $ 2.190.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Para recordar:</b> en todo lo que sigue, los resultados se calculan con precios netos, y cuando pidan una utilidad “neta” o “después de impuesto” hay que fijarse en la tasa t.</p>'
      }
    ]
  });

})(typeof window !== 'undefined' ? window : globalThis);
