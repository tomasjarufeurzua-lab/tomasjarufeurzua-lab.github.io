// MÓDULO 6 — Relación Costo–Volumen–Utilidad (CVU).
// Solo contenido. Convenciones de texto: **negrita**, {{numerador // denominador}} = fracción, HTML simple.
// En cada ejercicio, "datos" guarda los números crudos del enunciado: de ahí recalcula el script de verificación.
// Las claves de "datos" que empiezan con "_" son datos que el certamen entrega dentro de la pregunta (no en el enunciado).
(function (g) {
  'use strict';

  // ---- Enunciados que se usan en más de un ejercicio (cada ejercicio trae el suyo completo) ----
  var CAPACITACION_TXT = '<p>La empresa “Capacitación S.A.” se dedica a impartir cursos y diplomados. Se está desarrollando un diplomado en inteligencia artificial online y se busca determinar cuánto es el número mínimo necesario de participantes.</p>' +
    '<p>Su estructura de costos mensuales se muestra a continuación:</p>';
  var CAPACITACION_TABLA = {
    cols: ['Elemento del costo', 'Costo', 'Tipo'],
    filas: [
      ['Remuneración relator', '$ 7.000.000', 'Por diploma'],
      ['1 cuenta Zoom para relator', '$ 375.000', 'Por diploma'],
      ['Gestión administrativa y soporte aula virtual', '$ 2.000.000', 'Por diploma'],
      ['Certificado de diplomado', '$ 50.000', 'Por estudiante'],
      ['Cuenta plataforma online de aprendizaje', '$ 500.000', 'Por estudiante']
    ],
    pie: 'El precio de venta por estudiante matriculado es de $ 1.175.000.'
  };
  var CAPACITACION_DATOS = { relator: 7000000, zoom: 375000, gestion: 2000000, certificado: 50000, plataforma: 500000, precio: 1175000 };

  var VELAS_TXT = '<p>Una empresa que fabrica “velas de tulipán” y utiliza el método variable (costeo directo) para valorizar el costo de sus productos, presenta la siguiente información:</p>';
  var VELAS_TABLA = {
    cols: ['Concepto', 'Por unidad'],
    filas: [
      ['Materia prima', '$ 6'],
      ['Mano de obra', '$ 4'],
      ['Gastos de fabricación', '$ 5'],
      ['Costos fijos', '¿?'],
      ['Margen de contribución unitario', '$ 5'],
      ['Razón de recuperación (rr)', '0,75'],
      ['Razón de margen de contribución (rc)', '¿?']
    ],
    pie: 'Además: capacidad instalada (Q) de 40.000 unidades · precio de venta unitario de $ 20 · costos fijos de producción $ 30.000, de administración $ 20.000 y de venta $ 10.000.'
  };

  var UEFA_TXT = '<p>La empresa “UEFA”, que vende balones de fútbol, tiene la siguiente información:</p>';
  var UEFA_TABLA = {
    cols: ['Ítems', 'Montos unitarios por balón (USD)'],
    filas: [
      ['Precio', '250'],
      ['Costo variable de producción', '100'],
      ['Gastos de administración y ventas', '50']
    ],
    pie: 'Otros datos de octubre 2023: ventas 5.000 unidades · costos fijos USD 45.000 · tasa de impuesto a la renta 27 %. Se pide omitir el IVA.'
  };

  var LOGOS_TXT = '<p>La empresa de logos “USM” presenta los siguientes datos relacionados con las operaciones de junio del 2022:</p>' +
    '<ul><li>Ventas del período: <b>$ 1.000.000</b>.</li>' +
    '<li>Costos de unidades producidas y vendidas: materia prima <b>$ 100.000</b>; mano de obra directa <b>$ 160.000</b>; costos indirectos de fabricación <b>$ 350.000</b> (40 % variables; 60 % fijos).</li></ul>' +
    '<p>Además, se incurrió en los siguientes gastos operacionales fijos en el período: ventas <b>$ 120.000</b>, administrativos <b>$ 80.000</b> y generales <b>$ 40.000</b>.</p>';

  g.ICOFI_C3.modulos.push({
    id: 'cvu',
    n: 6,
    titulo: 'Relación Costo–Volumen–Utilidad (CVU)',
    corto: 'Costo–Volumen–Utilidad',
    meta: 'Cuánto hay que vender para no perder, para ganar lo que se quiere, y cuánto margen queda antes de entrar en pérdida.',
    bloques: [

      // ------------------------------------------------------------------ L6.1
      {
        tipo: 'leccion',
        id: 'que-es-cvu',
        titulo: 'Qué es la relación costo–volumen–utilidad',
        idea: 'Cada unidad vendida deja un margen. Ese margen primero paga los costos fijos; cuando ya están pagados, todo lo que sigue es utilidad.',
        partes: [
          { k: 'practica', h: 'Un carrito de completos paga $ 300.000 al mes entre arriendo y permiso. Vende cada completo a $ 2.500 y gasta $ 1.000 en ingredientes: cada completo deja $ 1.500. Los primeros 200 completos del mes solo pagan el arriendo; desde el 201, cada uno deja $ 1.500 de ganancia.' },
          { k: 'p', h: 'La **relación costo–volumen–utilidad (CVU)** es una herramienta de gestión de corto plazo. Separa los costos en fijos y variables para responder una pregunta: **¿qué nivel de actividad (ventas) se necesita para lograr un resultado?**' },
          { k: 'lista', items: [
            '<b>Costo:</b> no expirado mientras está en el balance (inventario); expirado cuando pasa al estado de resultados (EERR).',
            '<b>Volumen:</b> el nivel de actividad. En CVU es lo mismo que las ventas, porque se supone que se vende todo lo que se produce.',
            '<b>Utilidad:</b> ingresos − gastos. Puede ser ganancia o pérdida.'
          ] },
          { k: 'sub', h: 'La base de datos: el estado de resultados por costeo directo' },
          { k: 'p', h: 'Todo sale de un EERR por costeo directo. Se anota **p** = precio unitario, **q** = unidades vendidas y **t** = tasa de impuesto. El costo variable unitario se anota cvᵤ y el margen de contribución unitario, mcᵤ.' },
          { k: 'datos', cols: ['EERR por costeo directo', 'Cómo se calcula', 'Como proporción de la venta'], filas: [
            ['Ventas', 'p × q', '100 %'],
            ['− Costos variables (producción y otras áreas)', 'cvᵤ × q', 'Razón de recuperación (rr)'],
            ['= Margen de contribución', 'mcᵤ × q', 'Razón de contribución (rc)'],
            ['− Costos fijos (producción y otras áreas)', 'CF', ''],
            ['= Resultado antes de impuesto', '', ''],
            ['− Impuesto a la renta', 'resultado × t', ''],
            ['= Resultado después de impuesto', '', '']
          ] },
          { k: 'formula', h: 'mcᵤ = p − cvᵤ' },
          { k: 'formula', h: 'rr = {{cvᵤ // p}} &nbsp;&nbsp;·&nbsp;&nbsp; rc = {{mcᵤ // p}} &nbsp;&nbsp;·&nbsp;&nbsp; rr + rc = 1' },
          { k: 'p', h: 'La **razón de recuperación (rr)** es la parte de cada peso vendido que se va en costo variable. La **razón de contribución (rc)** es la parte que queda para pagar los costos fijos totales (CF) y, después, para la utilidad.' },
          { k: 'formula', h: 'Utilidad = mcᵤ × q − CF' },
          { k: 'p', h: 'En el carrito: mcᵤ = 2.500 − 1.000 = $ 1.500; rr = 1.000 ÷ 2.500 = 0,40 y rc = 1.500 ÷ 2.500 = 0,60. De cada $ 100 vendidos, $ 40 recuperan los ingredientes y $ 60 quedan para el arriendo y la ganancia.' },
          { k: 'asi', items: [
            '«¿Margen de contribución unitario?» → precio − costo variable unitario. Si el precio dice “+ IVA”, se usa el <b>neto</b>.',
            '«¿Razón de recuperación?» → costo variable ÷ venta. «¿Razón de contribución?» → margen de contribución ÷ venta.',
            'Fíjate siempre si piden el margen <b>unitario</b> (mcᵤ) o el <b>total</b> (mcᵤ × q).'
          ] }
        ]
      },

      // ------------------------------------------------------------------ MC6.A
      {
        tipo: 'mc',
        id: 'mc-contribucion',
        titulo: 'Selección múltiple: margen de contribución',
        items: [
          {
            id: 'm1',
            enunciado: 'El precio de venta unitario es $ 200.000 y los costos variables son $ 60.000, entonces:',
            opciones: [
              'Margen de contribución es $ 140.000.',
              'Su EBIT es de un 70 %.',
              'Sus costos indirectos de fabricación son $ 140.000.',
              'Su utilidad neta es de $ 140.000.'
            ],
            correcta: 0,
            porque: 'mcᵤ = 200.000 − 60.000 = $ 140.000. Sobre la utilidad o el resultado operacional (EBIT, por su sigla en inglés) no se puede decir nada sin conocer los costos fijos.',
            fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ L6.2
      {
        tipo: 'leccion',
        id: 'punto-equilibrio',
        titulo: 'Punto de equilibrio',
        idea: 'El punto de equilibrio es el nivel de ventas donde no se gana ni se pierde: los ingresos alcanzan justo para cubrir todos los costos.',
        partes: [
          { k: 'practica', h: 'El carrito de completos tiene costos fijos de $ 300.000 y cada completo deja $ 1.500. Necesita vender 300.000 ÷ 1.500 = <b>200 completos</b> para quedar en cero. Con menos, pierde; con más, gana.' },
          { k: 'p', h: 'El **punto de equilibrio (PE)**, o punto crítico, es el nivel de actividad donde los ingresos totales son iguales a los costos totales. Dicho de otra forma: donde el **resultado es cero**.' },
          { k: 'diagrama', id: 'punto-equilibrio' },
          { k: 'formula', h: 'q<sub>PE</sub> = {{CF // mcᵤ}} &nbsp;&nbsp;(en unidades)' },
          { k: 'formula', h: 'V<sub>PE</sub> = {{CF // rc}} = p × q<sub>PE</sub> &nbsp;&nbsp;(en pesos)' },
          { k: 'p', h: '**El impuesto no interviene en el punto de equilibrio:** si la utilidad es cero, el impuesto también es cero.' },
          { k: 'p', h: '**Atajo inverso:** si el enunciado da el punto de equilibrio y pide los costos fijos, se despeja: CF = q<sub>PE</sub> × mcᵤ.' },
          { k: 'p', h: 'En los costos fijos entran **todos**: los de producción, los de administración y los de venta. En el costo variable unitario también entran todos los que se pagan por cada unidad.' },
          { k: 'asi', items: [
            '«¿Punto de equilibrio en unidades?» → CF ÷ mcᵤ. «¿En pesos?» → CF ÷ rc, o el precio por las unidades de equilibrio.',
            '«¿Costos fijos?» → a veces hay que sumarlos; otras veces salen del punto de equilibrio: CF = q<sub>PE</sub> × mcᵤ.',
            '«¿Impuesto en el punto de equilibrio?» → <b>$ 0</b>.'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué el impuesto a la renta no interviene en el cálculo del punto de equilibrio?',
          opciones: [
            'Porque el impuesto es un costo fijo y ya está sumado en los costos fijos.',
            'Porque en el punto de equilibrio la utilidad es cero, y sin utilidad no hay impuesto.',
            'Porque el impuesto se paga con el margen de seguridad.',
            'Porque el impuesto es un costo variable que ya se restó en el margen de contribución.'
          ],
          correcta: 1,
          porque: 'El impuesto a la renta se calcula sobre la utilidad. En el punto de equilibrio la utilidad es cero, así que el impuesto también es cero: por eso no aparece en la fórmula.'
        }
      },

      // ------------------------------------------------------------------ E6.1
      {
        tipo: 'ejercicio',
        id: 'capacitacion',
        titulo: 'Capacitación S.A.: el diplomado',
        fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 3, nota: 'preguntas 1 a 4' },
        datos: CAPACITACION_DATOS,
        enunciado: CAPACITACION_TXT,
        tablaDatos: CAPACITACION_TABLA,
        partes: [
          {
            titulo: 'Primer paso: separar fijos de variables',
            modelo: 'Lo que se paga “por diploma” no cambia con el número de estudiantes: es <b>costo fijo</b>. Lo que se paga “por estudiante” es <b>costo variable</b>: cvᵤ = 50.000 + 500.000 = <b>$ 550.000</b> por estudiante.',
            nota: 'Este primer paso va hecho como modelo. Los que siguen los haces tú.'
          },
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Determinar el margen de contribución unitario:', tipo: 'pesos', respuesta: 625000,
                pista: 'Precio por estudiante menos el costo variable por estudiante del paso modelo.',
                sol: { d: 'Precio por estudiante: $ 1.175.000. Costo variable por estudiante: 50.000 + 500.000 = $ 550.000.', f: 'mcᵤ = p − cvᵤ', c: '1.175.000 − 550.000 = $ 625.000' }
              },
              {
                id: 'p2', texto: 'Determinar los costos fijos:', tipo: 'pesos', respuesta: 9375000,
                pista: 'Suma solo los costos que son “por diploma”.',
                trampas: [{ valor: 9925000, propia: true, msg: 'Sumaste también el certificado y la plataforma. Esos se pagan por estudiante: son costos variables, no fijos.' }],
                sol: { d: 'Costos por diploma: relator $ 7.000.000, cuenta Zoom $ 375.000, gestión y soporte $ 2.000.000.', f: 'CF = suma de los costos que no dependen del número de estudiantes', c: '7.000.000 + 375.000 + 2.000.000 = $ 9.375.000' }
              },
              {
                id: 'p3', texto: 'Determinar el punto de equilibrio en matriculados:', tipo: 'unidades', unidad: 'matriculados', respuesta: 15,
                pista: 'Divide los costos fijos por lo que deja cada estudiante.',
                sol: { d: 'Costos fijos: $ 9.375.000. Margen de contribución unitario: $ 625.000.', f: 'q<sub>PE</sub> = CF ÷ mcᵤ', c: '9.375.000 ÷ 625.000 = 15 matriculados' }
              },
              {
                id: 'p4', texto: 'Determinar el punto de equilibrio en valores monetarios:', tipo: 'pesos', respuesta: 17625000,
                pista: 'Es lo que se vende con las unidades de equilibrio.',
                trampas: [{ valor: 9375000, propia: true, msg: 'Esos son los costos fijos. En el equilibrio las ventas cubren los fijos y también los variables: V = p × q de equilibrio.' }],
                sol: { d: 'Punto de equilibrio: 15 matriculados. Precio: $ 1.175.000.', f: 'V<sub>PE</sub> = p × q<sub>PE</sub> (o CF ÷ rc)', c: '15 × 1.175.000 = $ 17.625.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Comprobación:</b> con 15 matriculados, las ventas son $ 17.625.000; los costos variables, 15 × 550.000 = $ 8.250.000; y los fijos, $ 9.375.000. Resultado: 17.625.000 − 8.250.000 − 9.375.000 = $ 0.</p>'
      },

      // ------------------------------------------------------------------ E6.2 (extra)
      {
        tipo: 'ejercicio',
        id: 'velas-equilibrio',
        rol: 'extra',
        titulo: 'Velas de tulipán: punto de equilibrio',
        fuente: { k: 'certamen', sem: 1, anio: 2023, preg: 5, nota: 'preguntas 1 y 2' },
        datos: { mp: 6, mo: 4, gf: 5, capacidad: 40000, precio: 20, cfProduccion: 30000, cfAdministracion: 20000, cfVenta: 10000 },
        enunciado: VELAS_TXT,
        tablaDatos: VELAS_TABLA,
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Calcular el punto de equilibrio o nivelación en unidades?', tipo: 'unidades', respuesta: 12000,
                trampas: [{ valor: 6000, propia: true, msg: 'Usaste solo los costos fijos de producción. En el punto de equilibrio entran todos los fijos: producción, administración y venta.' }],
                sol: { d: 'Costos fijos: 30.000 + 20.000 + 10.000 = $ 60.000. Costo variable unitario: 6 + 4 + 5 = $ 15. Precio: $ 20, así que mcᵤ = 20 − 15 = $ 5.', f: 'q<sub>PE</sub> = CF ÷ mcᵤ', c: '60.000 ÷ 5 = 12.000 unidades' }
              },
              {
                id: 'p2', texto: '¿Determinar el punto de equilibrio en valores monetarios?', tipo: 'pesos', respuesta: 240000,
                trampas: [{ valor: 80000, propia: true, msg: 'Dividiste por la razón de recuperación (0,75). El punto de equilibrio en pesos es CF ÷ razón de contribución (0,25).' }],
                sol: { d: 'Punto de equilibrio: 12.000 unidades. Precio: $ 20. Razón de contribución: 5 ÷ 20 = 0,25.', f: 'V<sub>PE</sub> = p × q<sub>PE</sub> = CF ÷ rc', c: '12.000 × 20 = $ 240.000 (o 60.000 ÷ 0,25 = $ 240.000)' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ MC6.B–MC6.E
      {
        tipo: 'mc',
        id: 'mc-equilibrio',
        titulo: 'Selección múltiple: punto de equilibrio',
        items: [
          {
            id: 'm1',
            enunciado: 'Una compañía sabe que sus costos variables por unidad son de $ 1, que su precio de venta por unidad es de $ 9 y que los costos fijos totales ascienden a $ 30.000. Calcular una cantidad de unidades para que la utilidad sea igual a cero:',
            opciones: ['3.000 u.', '2.100 u.', '3.750 u.', '2.650 u.'],
            correcta: 2,
            porque: 'Utilidad cero es el punto de equilibrio: mcᵤ = 9 − 1 = $ 8, y 30.000 ÷ 8 = 3.750 unidades.',
            fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 2 }
          },
          {
            id: 'm2',
            enunciado: 'El costo fijo anual es de $ 30.000, el costo variable por unidad es igual a $ 1 y el precio de venta es de $ 9; el costo variable es 11,1111 % de las ventas. Por lo tanto, el coeficiente del margen de contribución es:',
            opciones: ['0,88889.', '1.', '0,111111.', '3,333333.'],
            correcta: 0,
            porque: 'El coeficiente (razón) del margen de contribución es mcᵤ ÷ p = 8 ÷ 9 = 0,88889. También sale como 1 − 0,11111, porque rr + rc = 1.',
            fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 2 }
          },
          {
            id: 'm3',
            enunciado: 'Si el punto de equilibrio de un producto es de 50.000 unidades, y los costos fijos son de $ 10.000.000. ¿A cuánto equivale el margen de contribución unitario?',
            opciones: ['$ 200', '$ 20', '$ 0,05', '$ 5'],
            correcta: 0,
            porque: 'Del punto de equilibrio se despeja: mcᵤ = CF ÷ q de equilibrio = 10.000.000 ÷ 50.000 = $ 200.',
            fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 2 }
          },
          {
            id: 'm4',
            enunciado: 'Si hacemos la utilidad igual a cero, es donde se produce el punto de equilibrio, es decir, la empresa no tiene pérdidas ni ganancias. Ahí veremos que las ventas o el precio de venta es igual a los:',
            opciones: ['Costos fijos.', 'Costos hundidos.', 'Costos totales.', 'Costos variables.'],
            correcta: 2,
            porque: 'En el punto de equilibrio los ingresos totales igualan a los costos totales (fijos más variables): por eso el resultado es cero.',
            fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ L6.3
      {
        tipo: 'leccion',
        id: 'utilidad-deseada',
        titulo: 'Vender para una utilidad deseada, antes y después de impuesto',
        idea: 'Para ganar una utilidad, las ventas tienen que cubrir los costos variables, los costos fijos y además esa utilidad. Si la utilidad que piden es después de impuesto, primero hay que llevarla a antes de impuesto.',
        partes: [
          { k: 'practica', h: 'Con una tasa de impuesto de 27 %, de cada $ 100 ganados antes de impuesto quedan $ 73. Al revés: para que queden $ 73 después de impuesto, hay que ganar 73 ÷ 0,73 = <b>$ 100</b> antes de impuesto.' },
          { k: 'p', h: 'La relación básica es: **ventas = costos totales + utilidad deseada**. Con V = ventas, CV = costos variables totales, CF = costos fijos totales y U = utilidad deseada:' },
          { k: 'formula', h: 'V = CV + CF + U &nbsp;&nbsp;(antes de impuesto)' },
          { k: 'p', h: 'Si la utilidad que se pide es la **utilidad después de impuesto (UDI)**, también llamada utilidad neta, hay que convertirla en **utilidad antes de impuesto (UAI)** dividiendo por (1 − t):' },
          { k: 'formula', h: 'UAI = {{UDI // 1 − t}}' },
          { k: 'formula', h: 'V = CV + CF + {{UDI // 1 − t}} &nbsp;&nbsp;(después de impuesto)' },
          { k: 'p', h: 'En unidades, la utilidad buscada se suma a los costos fijos: es como si hubiera que “pagar” un costo fijo más.' },
          { k: 'formula', h: 'q = {{CF + UAI // mcᵤ}}' },
          { k: 'sub', h: 'La misma relación, por unidad (sirve para fijar precios)' },
          { k: 'p', h: 'Precio = costo variable unitario + costo fijo unitario + utilidad unitaria deseada. El **costo fijo unitario (cfᵤ)** es CF ÷ q, así que depende del volumen planeado.' },
          { k: 'formula', h: 'p = cvᵤ + cfᵤ + u &nbsp;&nbsp;·&nbsp;&nbsp; p = cvᵤ + cfᵤ + {{udiᵤ // 1 − t}}' },
          { k: 'asi', items: [
            '«¿Unidades para una utilidad neta de $ X?» → primero divide por (1 − t); después q = (CF + UAI) ÷ mcᵤ.',
            '«¿Impuesto a pagar?» → UAI − UDI.',
            '«¿Precio para mantener la razón de contribución?» → el costo variable debe seguir siendo la misma proporción del precio.',
            'Fíjate siempre si la utilidad que dan es <b>antes</b> o <b>después</b> de impuesto, y si piden <b>unidades</b> o <b>pesos</b>.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ E6.3
      {
        tipo: 'ejercicio',
        id: 'vina',
        simulacro: true,
        area: 'cvu',
        titulo: 'Viña XYZ',
        fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 3 },
        datos: { precio: 15000, cv: 5000, ventas: 10000, pe: 3000, t: 0.27, _udi: 2190000 },
        enunciado: '<p>La empresa “XYZ” es una viña y tiene la siguiente información:</p>',
        tablaDatos: {
          cols: ['Ítems', 'Montos ($)'],
          filas: [
            ['Precio botella 750 cc. Reserva', '15.000 + IVA'],
            ['Costo variable de producción', '5.000']
          ],
          pie: 'Información a noviembre 2025: ventas a la fecha 10.000 unidades · punto de equilibrio 3.000 unidades · tasa de impuesto 27 %.'
        },
        partes: [
          {
            titulo: 'Primer paso: el precio y el margen',
            modelo: 'El precio es “15.000 + IVA”, o sea, $ 15.000 es el valor neto, y en CVU siempre se usa el neto. Entonces mcᵤ = 15.000 − 5.000 = <b>$ 10.000</b> por botella.',
            nota: 'Este primer paso va hecho como modelo. Los que siguen los haces tú.'
          },
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Costos fijos:', tipo: 'pesos', respuesta: 30000000,
                pista: 'No te dan los costos fijos, pero sí el punto de equilibrio: despéjalos.',
                trampas: [{ valor: 38550000, propia: true, msg: 'Usaste el precio con IVA ($ 17.850). En CVU se usa el precio neto: $ 15.000.' }],
                sol: { d: 'Punto de equilibrio: 3.000 unidades. Margen de contribución unitario: $ 10.000.', f: 'CF = q<sub>PE</sub> × mcᵤ', c: '3.000 × 10.000 = $ 30.000.000' }
              },
              {
                id: 'p2', texto: 'Venta de equilibrio en pesos:', tipo: 'pesos', respuesta: 45000000,
                pista: 'Unidades de equilibrio por el precio neto.',
                trampas: [{ valor: 53550000, propia: true, msg: 'Multiplicaste por el precio con IVA. La venta de equilibrio va con el precio neto: $ 15.000.' }],
                sol: { d: 'Punto de equilibrio: 3.000 unidades. Precio neto: $ 15.000.', f: 'V<sub>PE</sub> = p × q<sub>PE</sub>', c: '3.000 × 15.000 = $ 45.000.000' }
              },
              {
                id: 'p3', texto: 'Margen de seguridad en porcentaje:', tipo: 'porcentaje', respuesta: 70,
                pista: 'Compara lo que se vende por sobre el equilibrio con lo que se vende en total.',
                trampas: [{ valor: 30, propia: true, msg: 'Ese es el peso del punto de equilibrio en las ventas (3.000 ÷ 10.000). El margen de seguridad es lo que queda por sobre él.' }],
                sol: { d: 'Ventas a la fecha: 10.000 unidades. Punto de equilibrio: 3.000 unidades.', f: 'MS % = (venta real − venta de equilibrio) ÷ venta real', c: '(10.000 − 3.000) ÷ 10.000 = 0,70 = 70 %' }
              },
              {
                id: 'p4', texto: '¿Cuántas unidades se deben vender para alcanzar una utilidad después de impuestos (utilidad neta) de $ 2.190.000?', tipo: 'unidades', unidad: 'unidades', respuesta: 3300,
                pista: 'La utilidad pedida es neta: llévala primero a antes de impuesto.',
                trampas: [{ valor: 3219, msg: 'La utilidad pedida es después de impuesto: divídela por 0,73 antes de sumarla a los costos fijos.' }],
                sol: { d: 'Utilidad neta pedida: $ 2.190.000, con t = 27 %. Costos fijos: $ 30.000.000. mcᵤ: $ 10.000.', f: 'UAI = UDI ÷ (1 − t) y q = (CF + UAI) ÷ mcᵤ', c: '2.190.000 ÷ 0,73 = 3.000.000; (30.000.000 + 3.000.000) ÷ 10.000 = 3.300 unidades' }
              },
              {
                id: 'p5', texto: 'Si se logra una utilidad de $ 2.190.000. ¿Cuánto es el impuesto a la renta a pagar?', tipo: 'pesos', respuesta: 810000,
                pista: 'El impuesto es la diferencia entre la utilidad antes y después de impuesto.',
                tambien: [{ valor: 591300, pauta: true, nota: 'La pauta del certamen también acepta $ 591.300, que es aplicar el 27 % directamente a los $ 2.190.000 (leyéndolos como utilidad antes de impuesto).' }],
                sol: { d: 'Utilidad después de impuesto: $ 2.190.000. Utilidad antes de impuesto: 2.190.000 ÷ 0,73 = $ 3.000.000.', f: 'Impuesto = UAI − UDI (o UAI × t)', c: '3.000.000 − 2.190.000 = $ 810.000 (lo mismo que 3.000.000 × 27 %)' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ E6.4 (extra, simulacro)
      {
        tipo: 'ejercicio',
        id: 'tablets',
        rol: 'extra',
        simulacro: true,
        area: 'cvu',
        titulo: 'Tablets XYZ',
        fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 4 },
        datos: { precio: 200000, cv: 50000, ventas: 5000, pe: 300, t: 0.27, _udi: 2190000 },
        enunciado: '<p>La empresa “XYZ”, que vende tablets, tiene la siguiente información:</p>',
        tablaDatos: {
          cols: ['Ítems', 'Montos ($)'],
          filas: [
            ['Precio unitario', '200.000'],
            ['Costo variable de producción unitario', '50.000']
          ],
          pie: 'Información a octubre 2024: ventas a la fecha 5.000 unidades · punto de equilibrio 300 unidades · tasa de impuesto 27 %. Se pide calcular al mes de octubre 2024.'
        },
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Costos fijos:', tipo: 'pesos', respuesta: 45000000,
                sol: { d: 'Punto de equilibrio: 300 unidades. mcᵤ = 200.000 − 50.000 = $ 150.000.', f: 'CF = q<sub>PE</sub> × mcᵤ', c: '300 × 150.000 = $ 45.000.000' }
              },
              {
                id: 'p2', texto: 'Ventas en equilibrio:', tipo: 'pesos', respuesta: 60000000,
                tambien: [{ valor: 300, nota: 'La pauta también acepta la respuesta en unidades: 300 unidades, que es el punto de equilibrio del enunciado.' }],
                sol: { d: 'Punto de equilibrio: 300 unidades. Precio: $ 200.000.', f: 'V<sub>PE</sub> = p × q<sub>PE</sub>', c: '300 × 200.000 = $ 60.000.000' }
              },
              {
                id: 'p3', texto: 'Impuesto a la renta en el punto de equilibrio:', tipo: 'pesos', respuesta: 0, guion: true,
                sol: { d: 'En el punto de equilibrio el resultado es cero.', f: 'Impuesto = utilidad antes de impuesto × t', c: '0 × 27 % = $ 0: sin utilidad no hay impuesto' }
              },
              {
                id: 'p4', texto: '¿Cuántas unidades se deben vender para alcanzar una utilidad neta (utilidad después de impuestos) de $ 2.190.000?', tipo: 'unidades', unidad: 'unidades', respuesta: 320,
                trampas: [
                  { valor: 314.6, propia: true, msg: 'Sumaste la utilidad neta sin llevarla a antes de impuesto. Divídela primero por 0,73.' },
                  { valor: 315, propia: true, msg: 'Sumaste la utilidad neta sin llevarla a antes de impuesto. Divídela primero por 0,73.' }
                ],
                sol: { d: 'Utilidad neta pedida: $ 2.190.000, con t = 27 %. Costos fijos: $ 45.000.000. mcᵤ: $ 150.000.', f: 'UAI = UDI ÷ (1 − t) y q = (CF + UAI) ÷ mcᵤ', c: '2.190.000 ÷ 0,73 = 3.000.000; (45.000.000 + 3.000.000) ÷ 150.000 = 320 unidades' }
              },
              {
                id: 'p5', texto: 'Si se logra una utilidad neta (utilidad después de impuestos) de $ 2.190.000. ¿Cuánto es el impuesto a pagar?', tipo: 'pesos', respuesta: 810000,
                sol: { d: 'Utilidad después de impuesto: $ 2.190.000. Utilidad antes de impuesto: 2.190.000 ÷ 0,73 = $ 3.000.000.', f: 'Impuesto = UAI − UDI (o UAI × t)', c: '3.000.000 − 2.190.000 = $ 810.000' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ E6.5 (extra)
      {
        tipo: 'ejercicio',
        id: 'loy-loy',
        rol: 'extra',
        titulo: 'Loy-Loy Ltda.',
        fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 4 },
        datos: { mp: 15, mo: 12, gf: 8, cfProduccion: 60000, cfAdministracion: 40000, cfVentas: 80000, capacidad: 20000, precio: 50, _utilidad: 75000, _aumento: 7 },
        enunciado: '<p>La empresa “Loy-Loy Ltda.” presupuesta un producto para fabricar y utilizará el método variable para valorizar sus inventarios. Estima la siguiente información:</p>',
        tablaDatos: {
          cols: ['Concepto', 'Monto'],
          filas: [
            ['Costo variable unitario: materia prima', '$ 15'],
            ['Costo variable unitario: mano de obra', '$ 12'],
            ['Costo variable unitario: gastos de fábrica', '$ 8'],
            ['Total costo variable unitario', '$ 35'],
            ['Costos fijos de producción', '$ 60.000'],
            ['Costos fijos de administración', '$ 40.000'],
            ['Costos fijos de ventas', '$ 80.000'],
            ['Total costos fijos', '$ 180.000']
          ],
          pie: 'Capacidad instalada (Q): 20.000 unidades. Precio de venta unitario = $ 50 (valor neto).'
        },
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Razón de recuperación:', tipo: 'razon', respuesta: 0.7,
                trampas: [{ valor: 0.3, propia: true, msg: 'Esa es la razón de contribución. La de recuperación es costo variable ÷ precio.' }],
                sol: { d: 'Costo variable unitario: $ 35. Precio neto: $ 50.', f: 'rr = cvᵤ ÷ p', c: '35 ÷ 50 = 0,70 (70 %)' }
              },
              {
                id: 'p2', texto: 'Razón de margen de contribución:', tipo: 'razon', respuesta: 0.3,
                trampas: [{ valor: 0.7, propia: true, msg: 'Esa es la razón de recuperación. La de contribución es margen de contribución ÷ precio.' }],
                sol: { d: 'Margen de contribución unitario: 50 − 35 = $ 15. Precio neto: $ 50.', f: 'rc = mcᵤ ÷ p (o 1 − rr)', c: '15 ÷ 50 = 0,30 (30 %)' }
              },
              {
                id: 'p3', texto: 'Punto de equilibrio en valores ($):', tipo: 'pesos', respuesta: 600000,
                trampas: [{ valor: 257143, propia: true, msg: 'Dividiste por la razón de recuperación (0,70). El punto de equilibrio en pesos es CF ÷ razón de contribución (0,30).' }],
                sol: { d: 'Costos fijos totales: $ 180.000. Razón de contribución: 0,30.', f: 'V<sub>PE</sub> = CF ÷ rc', c: '180.000 ÷ 0,30 = $ 600.000' }
              },
              {
                id: 'p4', texto: 'La cantidad en unidades que debe producir y vender para obtener una utilidad de $ 75.000:', tipo: 'unidades', unidad: 'unidades', respuesta: 17000,
                trampas: [{ valor: 5000, propia: true, msg: 'Te faltó sumar los costos fijos: q = (CF + utilidad) ÷ mcᵤ.' }],
                sol: { d: 'Costos fijos: $ 180.000. Utilidad deseada: $ 75.000. mcᵤ: $ 15.', f: 'q = (CF + U) ÷ mcᵤ', c: '(180.000 + 75.000) ÷ 15 = 17.000 unidades' }
              },
              {
                id: 'p5', texto: 'Si los costos variables unitarios aumentan en $ 7. ¿A cuánto debería aumentar el precio de venta si se desea mantener la razón de contribución?', tipo: 'pesos', respuesta: 60,
                trampas: [
                  { valor: 57, propia: true, msg: 'Subir el precio en los mismos $ 7 baja la razón de contribución (15 ÷ 57 = 0,26). Para mantener 0,30, el costo variable debe seguir siendo el 70 % del precio.' },
                  { valor: 10, propia: true, msg: 'Eso es cuánto sube el precio. La pauta pide el nuevo precio: 50 + 10 = $ 60.' }
                ],
                sol: { d: 'Nuevo costo variable unitario: 35 + 7 = $ 42. Para mantener rc = 0,30, la razón de recuperación debe seguir en 0,70.', f: 'rr = cvᵤ ÷ p → p = cvᵤ ÷ rr', c: '42 ÷ 0,70 = $ 60 (el precio debe subir de $ 50 a $ 60)' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ E6.6 (extra)
      {
        tipo: 'ejercicio',
        id: 'velas-utilidad',
        rol: 'extra',
        titulo: 'Velas de tulipán: utilidad, precio y capacidad ociosa',
        fuente: { k: 'certamen', sem: 1, anio: 2023, preg: 5, nota: 'preguntas 3 a 5' },
        datos: { mp: 6, mo: 4, gf: 5, capacidad: 40000, precio: 20, cfProduccion: 30000, cfAdministracion: 20000, cfVenta: 10000, _utilidad: 100000, _margen: 0.2, _publicidad: 940000, _descuento: 0.15 },
        enunciado: VELAS_TXT,
        tablaDatos: VELAS_TABLA,
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p3', texto: '¿Determinar la cantidad que debe producir y vender para obtener una utilidad de $ 100.000?', tipo: 'unidades', unidad: 'unidades', respuesta: 32000,
                trampas: [{ valor: 20000, propia: true, msg: 'Te faltó sumar los costos fijos: q = (CF + utilidad) ÷ mcᵤ.' }],
                sol: { d: 'Costos fijos: 30.000 + 20.000 + 10.000 = $ 60.000. Utilidad deseada: $ 100.000. mcᵤ = 20 − 15 = $ 5.', f: 'q = (CF + U) ÷ mcᵤ', c: '(60.000 + 100.000) ÷ 5 = 32.000 unidades' }
              },
              {
                id: 'p4', texto: '¿Calcular a qué precio se debe vender toda la producción que permite su capacidad instalada, para obtener un margen de utilidad de un 20 % y financiar, además, una campaña de publicidad de $ 940.000?', tipo: 'pesos', respuesta: 50,
                trampas: [{ valor: 40, propia: true, msg: 'Ese precio solo cubre los costos y la publicidad. Falta el margen de utilidad de 20 % sobre las ventas.' }],
                sol: { d: 'Capacidad: 40.000 unidades. Costo variable: $ 15 por unidad. Costos fijos: $ 60.000. Publicidad: $ 940.000. La utilidad pedida es 20 % de las ventas.', f: 'Ventas = costos variables + costos fijos + publicidad + utilidad', c: '40.000p = 15 × 40.000 + 60.000 + 940.000 + 0,2 × 40.000p → 32.000p = 1.600.000 → p = $ 50' }
              },
              {
                id: 'p5', texto: 'Se ofrece comprar la capacidad ociosa del punto 3 anterior, a un precio con un descuento de 15 %. ¿Cuál es la utilidad marginal?', tipo: 'pesos', respuesta: 16000,
                trampas: [{ valor: 40000, propia: true, msg: 'Te faltó aplicar el 15 % de descuento al precio: se vende a $ 17, no a $ 20.' }],
                sol: { d: 'Capacidad ociosa: 40.000 − 32.000 = 8.000 unidades. Precio con descuento: 20 × 0,85 = $ 17. Costo variable: $ 15. Los costos fijos ya están cubiertos.', f: 'Utilidad marginal = (precio con descuento − cvᵤ) × unidades', c: '(17 − 15) × 8.000 = $ 16.000' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ L6.4
      {
        tipo: 'leccion',
        id: 'margen-seguridad',
        titulo: 'Margen de seguridad',
        idea: 'El margen de seguridad dice cuánto pueden caer las ventas antes de entrar en pérdida.',
        partes: [
          { k: 'practica', h: 'Una empresa vende $ 10.000 (1.000 unidades a $ 10). Su equilibrio está en 800 unidades, es decir, $ 8.000. Puede perder hasta 200 unidades de venta ($ 2.000, el 20 % de lo que vende) sin entrar en pérdida.' },
          { k: 'p', h: 'El **margen de seguridad (MS)** es el nivel de actividad que está por **sobre** el punto de equilibrio.' },
          { k: 'formula', h: 'MS % = {{Venta real o presupuestada − Venta de equilibrio // Venta real o presupuestada}}' },
          { k: 'p', h: 'Se puede expresar de tres formas. Con el ejemplo:' },
          { k: 'lista', items: [
            '<b>En porcentaje:</b> (10.000 − 8.000) ÷ 10.000 = 0,2 = <b>20 %</b>.',
            '<b>En pesos:</b> venta × MS % = 10.000 × 20 % = <b>$ 2.000</b>.',
            '<b>En unidades:</b> q × MS % = 1.000 × 20 % = <b>200 u</b>.'
          ] },
          { k: 'formula', h: 'UAI = MS (en unidades) × mcᵤ' },
          { k: 'p', h: 'Este atajo funciona porque las unidades del punto de equilibrio ya pagaron los costos fijos: cada unidad del margen de seguridad deja su margen de contribución completo como utilidad antes de impuesto (UAI).' },
          { k: 'asi', items: [
            '«¿Margen de seguridad?» → revisa si lo piden en <b>porcentaje</b>, en <b>pesos</b> o en <b>unidades</b>.',
            '«Si el margen de seguridad es de N unidades, ¿cuál es la utilidad?» → N × mcᵤ; si la piden después de impuesto, multiplica por (1 − t).'
          ] }
        ]
      },

      // ------------------------------------------------------------------ E6.7
      {
        tipo: 'ejercicio',
        id: 'capacitacion-margen',
        titulo: 'Capacitación S.A.: la utilidad desde el margen de seguridad',
        fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 3, nota: 'pregunta 5' },
        datos: { relator: 7000000, zoom: 375000, gestion: 2000000, certificado: 50000, plataforma: 500000, precio: 1175000, _ms: 5, _t: 0.27 },
        enunciado: CAPACITACION_TXT,
        tablaDatos: CAPACITACION_TABLA,
        partes: [
          {
            titulo: 'Lo que ya se sabe del diplomado',
            modelo: 'Costo variable por estudiante: 50.000 + 500.000 = $ 550.000, así que mcᵤ = 1.175.000 − 550.000 = <b>$ 625.000</b>. Costos fijos: $ 9.375.000. Punto de equilibrio: 9.375.000 ÷ 625.000 = <b>15 matriculados</b>.',
            nota: 'Va hecho como modelo (es el ejercicio del punto de equilibrio). Un margen de seguridad de 5 estudiantes significa 5 matriculados por sobre esos 15.'
          },
          {
            titulo: 'Responde la pregunta del certamen',
            preguntas: [
              {
                id: 'p5', texto: 'Si el margen de seguridad es de 5 estudiantes. Además, tasa de impuesto sobre la renta igual a 27 %. ¿Cuál es la utilidad después de impuestos del diplomado?', tipo: 'pesos', respuesta: 2281250,
                pista: 'Cada estudiante sobre el equilibrio deja su margen de contribución completo. Después aplica el impuesto.',
                trampas: [{ valor: 3125000, propia: true, msg: 'Esa es la utilidad antes de impuesto (5 × 625.000). Piden después de impuesto: multiplícala por (1 − 0,27).' }],
                sol: { d: 'Margen de seguridad: 5 estudiantes. mcᵤ: $ 625.000. Tasa de impuesto: 27 %.', f: 'UAI = MS (en unidades) × mcᵤ y UDI = UAI × (1 − t)', c: '5 × 625.000 = 3.125.000; 3.125.000 × 0,73 = $ 2.281.250' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ E6.8 (extra)
      {
        tipo: 'ejercicio',
        id: 'sentarse-bien',
        rol: 'extra',
        titulo: 'Sentarse Bien S.A.: equilibrio y margen de seguridad',
        fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 4, nota: 'preguntas 2 a 4' },
        datos: { espuma: 10000, madera: 10000, moFijo: 10000000, moVariable: 30000, elecFijo: 5000000, elecVariable: 10000, gavFijo: 30000000, precio: 150000, _ventas: 600 },
        enunciado: '<p>La empresa “Sentarse Bien S.A.” se dedica a la fabricación de sillas de escritorio. Su estructura de costos mensuales es la que se muestra a continuación:</p>',
        tablaDatos: {
          cols: ['Tipo de costo', 'Costo fijo ($)', 'Costo variable ($)'],
          filas: [
            ['Espuma', '–', '10.000 por unidad'],
            ['Madera', '–', '10.000 por unidad'],
            ['Mano de obra', '10.000.000', '30.000 por unidad'],
            ['Electricidad y mantención de maquinaria', '5.000.000', '10.000 por unidad'],
            ['Gastos de administración y ventas', '30.000.000', '–']
          ],
          pie: 'El precio de venta neto es de $ 150.000 por unidad.'
        },
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p2', texto: 'Calcular el punto de equilibrio en unidades físicas de acuerdo a la estructura de costos presentada:', tipo: 'unidades', unidad: 'unidades', respuesta: 500,
                trampas: [{ valor: 167, propia: true, msg: 'Usaste solo los costos fijos de producción (15.000.000). También son fijos los gastos de administración y ventas: en total, $ 45.000.000.' }],
                sol: { d: 'Costos fijos: 10.000.000 + 5.000.000 + 30.000.000 = $ 45.000.000. Costo variable unitario: 10.000 + 10.000 + 30.000 + 10.000 = $ 60.000. mcᵤ = 150.000 − 60.000 = $ 90.000.', f: 'q<sub>PE</sub> = CF ÷ mcᵤ', c: '45.000.000 ÷ 90.000 = 500 unidades' }
              },
              {
                id: 'p3', texto: 'Si la empresa vende mensualmente 600 unidades. ¿Cuántas unidades representa el margen de seguridad?', tipo: 'unidades', unidad: 'unidades', respuesta: 100,
                sol: { d: 'Ventas: 600 unidades. Punto de equilibrio: 500 unidades.', f: 'MS (en unidades) = ventas − punto de equilibrio', c: '600 − 500 = 100 unidades' }
              },
              {
                id: 'p4', texto: 'Calcular el margen de contribución unitario si el nivel de actividad es de 600 unidades:', tipo: 'pesos', respuesta: 90000,
                trampas: [{ valor: 65000, propia: true, msg: 'Restaste el costo de producción unitario completo ($ 85.000), que incluye costos fijos. El margen de contribución usa solo el costo variable: $ 60.000.' }],
                sol: { d: 'Precio neto: $ 150.000. Costo variable unitario: $ 60.000. El margen de contribución unitario no depende del nivel de actividad.', f: 'mcᵤ = p − cvᵤ', c: '150.000 − 60.000 = $ 90.000' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ E6.9 (extra)
      {
        tipo: 'ejercicio',
        id: 'uefa-balones',
        rol: 'extra',
        titulo: 'UEFA: balones',
        fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 4, nota: 'preguntas 1, 2, 3 y 5' },
        datos: { precio: 250, cvProduccion: 100, gav: 50, ventas: 5000, cf: 45000, t: 0.27, _udi: 18250 },
        enunciado: UEFA_TXT,
        tablaDatos: UEFA_TABLA,
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Calcular el punto de equilibrio en unidades físicas:', tipo: 'unidades', unidad: 'unidades', respuesta: 450,
                trampas: [{ valor: 300, msg: 'Los gastos de administración y ventas por unidad también son variables: el margen de contribución es 250 − 100 − 50.' }],
                sol: { d: 'Precio: USD 250. Costos variables por balón: producción 100 + administración y ventas 50 = USD 150. Costos fijos: USD 45.000.', f: 'q<sub>PE</sub> = CF ÷ mcᵤ', c: 'mcᵤ = 250 − 150 = 100; 45.000 ÷ 100 = 450 unidades' }
              },
              {
                id: 'p2', texto: 'Calcular el margen de seguridad en unidades monetarias (ventas USD):', tipo: 'pesos', moneda: 'USD', respuesta: 1137500,
                sol: { d: 'Ventas: 5.000 unidades. Punto de equilibrio: 450 unidades. Precio: USD 250.', f: 'MS (en ventas) = (unidades vendidas − unidades de equilibrio) × precio', c: '(5.000 − 450) × 250 = USD 1.137.500' }
              },
              {
                id: 'p3', texto: 'Si se logra una utilidad neta de USD 18.250 aumentando las ventas. ¿A cuánto ascienden los ingresos por ventas?', tipo: 'pesos', moneda: 'USD', respuesta: 175000,
                trampas: [{ valor: 158125, propia: true, msg: 'Sumaste la utilidad neta sin llevarla a antes de impuesto. Divídela primero por 0,73.' }],
                sol: { d: 'Utilidad neta: USD 18.250, con t = 27 %. Costos fijos: USD 45.000. mcᵤ: USD 100. Se resuelve como cálculo independiente: cuántas unidades se necesitan para esa utilidad.', f: 'UAI = UDI ÷ (1 − t); q = (CF + UAI) ÷ mcᵤ; ingresos = p × q', c: '18.250 ÷ 0,73 = 25.000; (45.000 + 25.000) ÷ 100 = 700 unidades; 700 × 250 = USD 175.000' }
              },
              {
                id: 'p5', texto: '¿A cuánto se debe aumentar el número de unidades vendidas para alcanzar una utilidad neta de USD 18.250?', tipo: 'unidades', unidad: 'unidades', respuesta: 700,
                sol: { d: 'Utilidad neta: USD 18.250, con t = 27 %. Costos fijos: USD 45.000. mcᵤ: USD 100.', f: 'UAI = UDI ÷ (1 − t) y q = (CF + UAI) ÷ mcᵤ', c: '18.250 ÷ 0,73 = 25.000; (45.000 + 25.000) ÷ 100 = 700 unidades' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ E6.11 (extra)
      {
        tipo: 'ejercicio',
        id: 'logos-cvu',
        rol: 'extra',
        titulo: 'Logos USM: margen de seguridad y ventas para una utilidad',
        fuente: { k: 'certamen', sem: 1, anio: 2022, preg: 5, nota: 'preguntas 2 y 3' },
        datos: { ventas: 1000000, mp: 100000, mod: 160000, cif: 350000, cifVariable: 0.4, gVentas: 120000, gAdm: 80000, gGenerales: 40000, _unidades: 10000, _udiSobreVenta: 0.12, _t: 0.2 },
        enunciado: LOGOS_TXT,
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p2', texto: 'Asuma que el nivel de actividad son 10.000 unidades vendidas. ¿Cuál fue el margen de seguridad durante junio 2022?', tipo: 'porcentaje', respuesta: 25,
                trampas: [{ valor: 75, propia: true, msg: 'Ese es el peso de la venta de equilibrio en las ventas (750.000 ÷ 1.000.000). El margen de seguridad es lo que queda por sobre ella.' }],
                sol: { d: 'Ventas: $ 1.000.000. Costos variables: 100.000 + 160.000 + 140.000 = $ 400.000. Costos fijos: 210.000 + 240.000 = $ 450.000.', f: 'rc = margen de contribución ÷ ventas; V<sub>PE</sub> = CF ÷ rc; MS % = (ventas − V<sub>PE</sub>) ÷ ventas', c: 'rc = 600.000 ÷ 1.000.000 = 0,6; 450.000 ÷ 0,6 = 750.000; (1.000.000 − 750.000) ÷ 1.000.000 = 25 %' }
              },
              {
                id: 'p3', texto: 'Si el nivel de actividad son 10.000 unidades. ¿Cuál es el nivel de ventas para alcanzar una utilidad después de impuestos de 12 % de la venta? (t = 20 %)', tipo: 'pesos', respuesta: 1000000,
                trampas: [{ valor: 937500, propia: true, msg: 'Usaste el 12 % como utilidad antes de impuesto. Es después de impuesto: antes de impuesto equivale a 12 % ÷ 0,8 = 15 % de la venta.' }],
                sol: { d: 'Razón de contribución: 0,6. Costos fijos: $ 450.000. Utilidad después de impuesto pedida: 12 % de la venta, con t = 20 %.', f: 'UAI = UDI ÷ (1 − t); margen de contribución − costos fijos = UAI', c: 'UAI = 0,12V ÷ 0,8 = 0,15V; 0,6V − 450.000 = 0,15V → 0,45V = 450.000 → V = $ 1.000.000' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ L6.5
      {
        tipo: 'leccion',
        id: 'sensibilidad',
        titulo: 'Sensibilidad y supuestos del modelo',
        idea: 'Si cambia un dato, se mueve el punto de equilibrio. Y el modelo solo funciona bajo ciertos supuestos, que también se preguntan.',
        partes: [
          { k: 'practica', h: 'Si al carrito de completos le suben el arriendo, tiene que vender más completos para quedar en cero. Si le suben los ingredientes, cada completo deja menos, y también tiene que vender más.' },
          { k: 'sub', h: 'Qué mueve el punto de equilibrio' },
          { k: 'comparar', cols: ['Si cambia…', 'Efecto (lo demás constante)'], filas: [
            ['Suben los costos fijos', 'El punto de equilibrio sube.'],
            ['Sube el costo variable unitario', 'El margen de contribución unitario baja, el punto de equilibrio sube y el margen de seguridad baja.'],
            ['Baja el costo variable unitario', 'El punto de equilibrio baja.'],
            ['Sube el precio', 'El punto de equilibrio baja.'],
            ['Se compra una máquina (costo fijo)', 'El margen de contribución no cambia; la utilidad sí.']
          ] },
          { k: 'sub', h: 'Supuestos' },
          { k: 'lista', items: [
            'Los ingresos y los costos se comportan de forma lineal.',
            'Los costos se pueden separar en fijos y variables.',
            'Los precios de venta y de los insumos son constantes.',
            'Hay <b>sincronización perfecta</b> entre producción y ventas: se vende todo lo que se produce.',
            'La mezcla de productos y la eficiencia son constantes; la inflación es estable.',
            'El cambio de una variable no afecta a las demás.'
          ] },
          { k: 'sub', h: 'Limitaciones' },
          { k: 'p', h: 'El modelo no considera los cambios de eficiencia y productividad, el costo de mantener inventarios, los descuentos ni la reacción de la competencia.' },
          { k: 'sub', h: 'Para qué sirve' },
          { k: 'p', h: 'Para saber cuántas unidades vender para una utilidad, cuánto vender para no perder, decidir precios y ajustes de costos, evaluar el cierre de una planta, o decidir entre hacer y comprar.' },
          { k: 'asi', items: [
            'Verdadero o falso: «si suben los costos fijos, el punto de equilibrio disminuye» (falso), y parecidos.',
            '«¿Cuál no es un supuesto?» o «¿cuál es una limitante?» → repasa las dos listas.',
            '«¿Qué escenario conviene?» → calcula el resultado de cada escenario y compáralos.'
          ] }
        ],
        porque: {
          pregunta: 'Si sube el costo variable unitario y todo lo demás se mantiene, ¿por qué baja el margen de seguridad?',
          opciones: [
            'Porque suben los costos fijos de la empresa.',
            'Porque cada unidad deja menos margen de contribución, el punto de equilibrio sube y queda menos distancia entre las ventas y el equilibrio.',
            'Porque las ventas reales disminuyen automáticamente.',
            'Porque el impuesto a la renta aumenta.'
          ],
          correcta: 1,
          porque: 'Con un costo variable mayor, el mcᵤ baja; se necesitan más unidades para pagar los mismos costos fijos, así que el punto de equilibrio sube. Como las ventas son las mismas, el tramo por sobre el equilibrio (el margen de seguridad) se achica.'
        }
      },

      // ------------------------------------------------------------------ E6.10
      {
        tipo: 'ejercicio',
        id: 'dieyn',
        titulo: 'DIEYN S.A.: comparar escenarios',
        fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 5 },
        datos: { unidades: 17500, precio: 2200, cv: 1800, cf: 8000000, _aumentoVentas: 0.3, _factorCostoVariable: 0.85 },
        enunciado: '<p>Un producto de la empresa “DIEYN” S.A. se ha logrado vender en el mercado nacional, pero el resultado operacional ha sido negativo. El año pasado se produjeron y vendieron <b>17.500 unidades</b>. El precio de venta fue de <b>$ 2.200 más IVA</b> por unidad, el costo variable de <b>$ 1.800</b> y el costo fijo de <b>$ 8.000.000</b>.</p>',
        partes: [
          {
            titulo: 'Primer paso: el margen de cada unidad',
            modelo: 'El precio es “$ 2.200 más IVA”: en CVU se usa el neto, $ 2.200. Entonces mcᵤ = 2.200 − 1.800 = <b>$ 400</b> por unidad.',
            nota: 'Este primer paso va hecho como modelo. Los que siguen los haces tú.'
          },
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Cuál fue el resultado operacional?', tipo: 'pesos', respuesta: -1000000,
                signo: { pos: 'Utilidad', neg: 'Pérdida' },
                pista: 'Margen de contribución total menos costos fijos. Fíjate si alcanza a cubrirlos.',
                sol: { d: 'Unidades vendidas: 17.500. mcᵤ: $ 400. Costo fijo: $ 8.000.000.', f: 'Resultado operacional = mcᵤ × q − CF', c: '17.500 × 400 − 8.000.000 = 7.000.000 − 8.000.000 = −$ 1.000.000 (pérdida)' }
              },
              {
                id: 'p2', texto: '¿A cuánto asciende el margen de contribución total del producto?', tipo: 'pesos', respuesta: 7000000,
                pista: 'Lo que deja cada unidad, por las unidades vendidas.',
                trampas: [{ valor: 14315000, propia: true, msg: 'Usaste el precio con IVA ($ 2.618). En CVU se usa el precio neto: $ 2.200.' }],
                sol: { d: 'Unidades vendidas: 17.500. mcᵤ: $ 400.', f: 'Margen de contribución total = mcᵤ × q', c: '17.500 × 400 = $ 7.000.000' }
              },
              {
                id: 'p3', texto: '¿Cuál es la cantidad en unidades en la que el producto alcanza el punto de equilibrio?', tipo: 'unidades', unidad: 'unidades', respuesta: 20000,
                pista: 'Costos fijos divididos por el margen de contribución unitario.',
                sol: { d: 'Costo fijo: $ 8.000.000. mcᵤ: $ 400.', f: 'q<sub>PE</sub> = CF ÷ mcᵤ', c: '8.000.000 ÷ 400 = 20.000 unidades' }
              },
              {
                id: 'p4', tipo: 'opcion',
                texto: 'La empresa, al tomar conocimiento del resultado, está evaluando la forma de aumentar los volúmenes de ventas o de reducir los costos variables. Se tienen dos escenarios a elegir: escenario 1, incrementar las ventas en 30 %; y escenario 2, reducir el costo variable al 85 % de su nivel actual. ¿Cuál es el mejor escenario, asumiendo que el costo de implementación es el mismo?',
                opciones: ['Escenario 1', 'Escenario 2'],
                correcta: 1,
                pista: 'Calcula el resultado operacional de cada escenario y compara.',
                porque: 'El escenario 2 deja un resultado de +$ 3.725.000, contra +$ 1.100.000 del escenario 1.',
                sol: { d: 'Escenario 1: se venden 17.500 × 1,30 = 22.750 unidades con mcᵤ de $ 400. Escenario 2: el costo variable baja a 1.800 × 0,85 = $ 1.530 y el mcᵤ sube a 2.200 − 1.530 = $ 670, con 17.500 unidades.', f: 'Resultado operacional = mcᵤ × q − CF, en cada escenario', c: 'Escenario 1: 22.750 × 400 − 8.000.000 = +$ 1.100.000. Escenario 2: 17.500 × 670 − 8.000.000 = +$ 3.725.000' }
              },
              {
                id: 'p5', texto: '¿Cuál es el cambio porcentual de la contribución a las utilidades por unidad, generado por la mejor opción según la pregunta anterior?', tipo: 'porcentaje', respuesta: 67.5,
                pista: 'Compara el margen de contribución unitario nuevo con el original.',
                trampas: [{ valor: 15, propia: true, msg: 'El 15 % es lo que baja el costo variable. Lo que piden es cuánto cambia el margen de contribución unitario: pasa de $ 400 a $ 670.' }],
                sol: { d: 'mcᵤ original: $ 400. mcᵤ del escenario 2: 2.200 − 1.530 = $ 670.', f: 'Cambio % = (mcᵤ nuevo − mcᵤ original) ÷ mcᵤ original', c: '(670 − 400) ÷ 400 = 0,675 = 67,5 %' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ MC6.F–MC6.I
      {
        tipo: 'mc',
        id: 'mc-supuestos',
        titulo: 'Selección múltiple: supuestos, límites y sensibilidad',
        sinAb: ['II'],
        items: [
          {
            id: 'm1',
            enunciado: 'El modelo costo–volumen–utilidad considera los siguientes supuestos:<br>i. Tanto la función de ingresos como la de costos tienen un comportamiento lineal.<br>ii. No se pueden diferenciar perfectamente los costos fijos y los costos variables.<br>iii. Existe sincronización perfecta entre el volumen de ventas y el de producción.<br>iv. El cambio de alguna variable no afecta a las constantes.',
            opciones: ['Solo I y II', 'Solo IV', 'I, III y IV', 'Solo III y IV'],
            correcta: 2,
            porque: 'La afirmación ii es falsa: el modelo supone justamente que los costos sí se pueden separar en fijos y variables. Las otras tres son supuestos del modelo.',
            fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 2 }
          },
          {
            id: 'm2',
            enunciado: 'De los siguientes costos, ¿cuál no se considera para determinar el punto de equilibrio?',
            opciones: ['Costos de producción.', 'Gastos de administración.', 'Gastos de ventas.', 'Gastos por impuestos.'],
            correcta: 3,
            porque: 'En el punto de equilibrio la utilidad es cero, así que no hay impuesto a la renta. Los costos de producción, de administración y de ventas sí entran, como fijos o como variables.',
            fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 2 }
          },
          {
            id: 'm3',
            enunciado: '¿Qué efectos sobre el margen de seguridad tiene un aumento en los costos variables unitarios de la empresa?',
            opciones: ['El margen de seguridad debe ser menor.', 'El margen de seguridad debe ser mayor.', 'Depende del sistema de costeo utilizado por la empresa.', 'El margen de seguridad se mantiene.'],
            correcta: 0,
            porque: 'Si sube el costo variable unitario, baja el margen de contribución unitario y sube el punto de equilibrio. Con las mismas ventas, el margen de seguridad se achica.',
            fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 2 }
          },
          {
            id: 'm4',
            enunciado: '¿Cuál de las siguientes aseveraciones corresponde a una limitante de la relación costo–volumen–utilidad?',
            opciones: ['Considera un comportamiento variable de las ventas.', 'No considera la variación en la eficiencia y productividad de los procesos.', 'Toma de manera real el costo del mantenimiento de los inventarios.', 'Considera los posibles descuentos en los precios de compra y venta.'],
            correcta: 1,
            porque: 'El modelo supone eficiencia constante: no recoge los cambios de eficiencia y productividad. Tampoco considera el costo de mantener inventarios ni los descuentos, por eso las alternativas c) y d) no son correctas.',
            fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ VF6.A
      {
        tipo: 'vf',
        id: 'vf-cvu',
        titulo: 'Verdadero o falso: costo–volumen–utilidad',
        items: [
          { id: 'a1', af: 'El margen de contribución total se obtiene restando los costos fijos totales a las ventas totales.', r: false, porque: 'Se obtiene restando los costos variables. Los costos fijos se restan después, para llegar al resultado.', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1, tb: '2º semestre 2025 y 1er semestre 2022' } },
          { id: 'a2', af: 'El margen de contribución unitario se determina por ingresos por venta menos costo variable total.', r: false, porque: 'Eso es el margen de contribución total. El unitario es el precio menos el costo variable unitario: mcᵤ = p − cvᵤ.', fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 1, tb: '1er semestre 2023 y 1er semestre 2022' } },
          { id: 'a3', af: 'Si los costos fijos aumentan y las demás variables permanecen constantes, el punto de equilibrio disminuye.', r: false, porque: 'Aumenta: hay más costos fijos que pagar con el mismo margen por unidad (q de equilibrio = CF ÷ mcᵤ).', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1 } },
          { id: 'a4', af: 'El punto de equilibrio disminuye cuando los costos fijos se mantienen, el precio unitario se mantiene y el costo variable disminuye.', r: true, porque: 'Si baja el costo variable, cada unidad deja más margen de contribución y se necesitan menos unidades para pagar los mismos costos fijos.', fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 1 } },
          { id: 'a5', af: 'El punto de equilibrio de una empresa es aquel nivel de actividad de ventas donde los ingresos totales igualan a los costos totales.', r: true, porque: 'Es la definición: ingresos totales = costos totales, es decir, resultado igual a cero.', fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 1 } },
          { id: 'a6', af: 'En el punto de equilibrio los ingresos totales son mayores a los costos totales.', r: false, porque: 'Son iguales. Si los ingresos fueran mayores, habría utilidad, y eso ya es estar por sobre el punto de equilibrio.', fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 1 } },
          { id: 'a7', af: 'El punto de equilibrio en una empresa es aquel nivel de actividad (ventas) en que se cumple el margen de rentabilidad neta (ROS) esperado por el accionista (dueño).', r: false, porque: 'En el punto de equilibrio el resultado es cero: no hay ganancia ni pérdida. La rentabilidad que espera el dueño se logra vendiendo por sobre ese nivel.', fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 1, tb: '2º semestre 2022' } },
          { id: 'a8', af: 'El margen de seguridad representa el exceso de ventas reales o presupuestadas por sobre el punto de equilibrio.', r: true, porque: 'Es la definición: lo que se vende (o se presupuesta vender) por sobre la venta de equilibrio.', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1, tb: '1er semestre 2024' } },
          { id: 'a9', af: 'El margen de seguridad es la cantidad de ventas por sobre el punto de equilibrio, en cuyo margen indica que la empresa genera un resultado operacional igual a cero.', r: false, porque: 'El resultado es cero justo en el punto de equilibrio. Por sobre él, en el margen de seguridad, la empresa ya genera utilidad.', fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 1, tb: '2º semestre 2024' } },
          { id: 'a10', af: 'La razón de recuperación es la razón del costo variable dividido por la venta.', r: true, porque: 'rr = costo variable ÷ venta (o cvᵤ ÷ p): la parte de cada peso vendido que recupera el costo variable.', fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 1 } },
          { id: 'a11', af: 'La razón de recuperación es equivalente al cuociente entre el costo fijo de venta y las ventas.', r: false, porque: 'Es el cuociente entre el costo variable y las ventas. Los costos fijos no entran en esa razón.', fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 1 } },
          { id: 'a12', af: 'La razón de contribución es la proporción de las ventas destinadas a financiar los costos fijos y posteriormente a la obtención de utilidades.', r: true, porque: 'rc = margen de contribución ÷ ventas: lo que queda de cada peso vendido, después del costo variable, para pagar los fijos y luego ganar.', fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 1 } },
          { id: 'a13', af: 'El análisis de la relación costo–volumen–utilidad se aplica solamente para realizar las proyecciones de ingresos.', r: false, porque: 'Sirve para mucho más: cuánto vender para no perder o para una utilidad, decisiones de precios, ajustes de costos, cierre de planta, hacer o comprar.', fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 1 } }
        ]
      },

      // ------------------------------------------------------------------ Resumen
      {
        tipo: 'resumen',
        id: 'resumen',
        titulo: 'Resumen del módulo 6',
        formulas: [
          'mcᵤ = p − cvᵤ',
          'rc = mcᵤ ÷ p · rr = cvᵤ ÷ p · rr + rc = 1',
          'Punto de equilibrio en unidades: q = CF ÷ mcᵤ. En pesos: V = CF ÷ rc.',
          'Unidades para una utilidad: q = (CF + UAI) ÷ mcᵤ',
          'UAI = UDI ÷ (1 − t)',
          'MS % = (V − V de equilibrio) ÷ V',
          'UAI = MS (en unidades) × mcᵤ'
        ],
        asi: [
          '«¿Costos fijos?» (a veces desde el punto de equilibrio: CF = q de equilibrio × mcᵤ).',
          '«¿Punto de equilibrio en unidades y en pesos?»',
          '«¿Margen de seguridad en %, en pesos o en unidades?»',
          '«¿Unidades para una utilidad neta de $ X?» → divide por (1 − t) primero.',
          '«¿Impuesto a pagar?» → UAI − UDI. «¿Impuesto en el punto de equilibrio?» → $ 0.',
          '«¿Precio para mantener la razón de contribución?»',
          '«¿Qué escenario conviene?» → compara resultados.'
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
