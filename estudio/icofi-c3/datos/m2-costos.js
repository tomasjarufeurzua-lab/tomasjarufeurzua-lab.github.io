// MÓDULO 2 — Fundamentos de costos.
// Solo contenido. Convenciones de texto: **negrita**, {{numerador // denominador}} = fracción, HTML simple.
// En cada ejercicio, "datos" guarda los números crudos del enunciado: de ahí recalcula el script de verificación
// (las claves que empiezan con "_" son datos que el certamen entrega dentro de las preguntas, no en el enunciado).
// Las trampas con "propia: true" no vienen del encargo: salen de errores que la propia lección describe.
(function (g) {
  'use strict';

  g.ICOFI_C3.modulos.push({
    id: 'costos',
    n: 2,
    titulo: 'Fundamentos de costos',
    corto: 'Fundamentos de costos',
    meta: 'Qué es un costo, de qué está hecho el costo de un producto y cómo llega al estado de resultados.',
    bloques: [

      // ------------------------------------------------------------------ L2.1
      {
        tipo: 'leccion',
        id: 'costo-vs-gasto',
        titulo: 'Costo versus gasto',
        idea: 'El costo se guarda en el producto y espera en bodega hasta que se vende. El gasto se consume en el período, se venda o no.',
        partes: [
          { k: 'practica', h: 'En una panadería, la harina, el panadero y la luz del horno son <b>costo</b>. Si hace 100 panes y vende 70, el costo de los 70 va a costo de venta y el de los otros 30 queda en inventario. La secretaria y la publicidad son <b>gastos</b> del mes, se venda o no.' },
          { k: 'p', h: 'Los dos son **recursos** que la empresa usa. Lo que cambia es para qué se usan y dónde quedan anotados:' },
          { k: 'comparar', cols: ['', 'Costo', 'Gasto'], filas: [
            ['¿Qué es?', 'Recurso para producir o comprar lo que se venderá.', 'Recurso consumido para operar en el período (administrar, vender).'],
            ['Propósito', 'Generar beneficios futuros.', 'Generar los ingresos del período.'],
            ['¿Dónde queda?', 'En el balance, como inventario: es un costo <b>no expirado</b>.', 'Directo en el resultado del período.'],
            ['¿Cuándo llega al resultado?', 'Cuando se vende, como <b>costo de venta</b>: es un costo <b>expirado</b>.', 'En el mismo período en que se consume.']
          ] },
          { k: 'trampa', h: '«El gasto, a diferencia del costo, se almacena en inventario.» Es <b>falso</b>: es al revés. Lo que se almacena en inventario es el costo.' },
          { k: 'asi', items: [
            'Verdadero o falso sobre costo versus gasto: cae en casi todos los certámenes. Pregúntate si eso se guarda en inventario (costo) o se consume en el período (gasto).'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué el costo de los 30 panes que no se vendieron todavía no aparece en el estado de resultados (EERR)?',
          opciones: [
            'Porque los panes que no se venden no tuvieron costo.',
            'Porque es un costo no expirado: queda en el balance como inventario hasta que esos panes se vendan.',
            'Porque es un gasto de administración del mes.',
            'Porque el estado de resultados solo registra gastos, nunca costos.'
          ],
          correcta: 1,
          porque: 'El costo se “guarda” en el producto. Mientras el pan está en bodega es un activo (inventario); cuando se vende, ese costo expira y pasa al resultado como costo de venta.'
        }
      },

      // ------------------------------------------------------------------ L2.2
      {
        tipo: 'leccion',
        id: 'tipos-de-empresa',
        titulo: 'Tipos de empresa e inventarios',
        idea: 'Según lo que hace la empresa, cambia cuántos inventarios tiene y qué significa su costo de venta.',
        partes: [
          { k: 'comparar', cols: ['', 'Industrial', 'Comercial', 'Servicios'], filas: [
            ['Qué hace', 'Compra materia prima (MP) y la transforma en producto.', 'Compra productos y los vende tal como los compró.', 'Presta un servicio.'],
            ['Recorrido', 'MP → bodega de MP → producción → bodega de productos terminados → venta.', 'Compra → bodega → venta.', 'No pasa por bodega de productos.'],
            ['Inventarios', '<b>Tres:</b> MP, productos en proceso (PenP) y productos terminados (PT).', '<b>Uno:</b> existencias.', 'Sin inventario de productos.'],
            ['Costo de venta', 'Costo de los PT vendidos.', 'Costo de lo comprado y vendido.', 'Costos principalmente de mano de obra e indirectos.']
          ] },
          { k: 'diagrama', id: 'flujo-costos' },
          { k: 'p', h: 'En la producción, a la materia prima se le agregan dos cosas más: el trabajo de quienes la transforman y los demás costos de la fábrica. Eso se ve en la lección siguiente.' },
          { k: 'p', h: '**Valorización de inventarios.** La norma de inventarios (NIC 2) contempla métodos para decidir a qué costo sale lo que se vende:' },
          { k: 'lista', items: [
            '<b>FIFO</b>: primero en entrar, primero en salir.',
            '<b>LIFO</b>: último en entrar, primero en salir.',
            '<b>PPP</b>: precio promedio ponderado.'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué una empresa industrial tiene tres inventarios y una comercial solo uno?',
          opciones: [
            'Porque la industrial siempre vende más que la comercial.',
            'Porque la norma de inventarios obliga a las comerciales a tener un solo inventario.',
            'Porque la industrial transforma: puede tener materia prima sin usar, productos a medio hacer y productos terminados. La comercial vende lo mismo que compra.',
            'Porque la empresa comercial no tiene costo de venta.'
          ],
          correcta: 2,
          porque: 'Cada inventario corresponde a una etapa del recorrido. La empresa comercial compra y vende el mismo producto, así que tiene una sola etapa (existencias); la industrial tiene tres.'
        }
      },

      // ------------------------------------------------------------------ L2.3
      {
        tipo: 'leccion',
        id: 'elementos-del-costo',
        titulo: 'Los elementos del costo de producción',
        idea: 'Fabricar un producto cuesta tres cosas: el material, el trabajo de quien lo transforma y todo lo demás que pasa dentro de la fábrica.',
        partes: [
          { k: 'practica', h: 'En una silla, la madera y el tapiz son el material; el carpintero es el trabajo; los clavos, el pegamento, la lija, el supervisor y la luz de la planta son “todo lo demás”.' },
          { k: 'comparar', cols: ['Elemento', 'Qué es', 'Cómo es y cómo se calcula'], filas: [
            ['Materia prima directa (MPD)', 'El material identificable en cada unidad. Ejemplo: madera y tapiz de una silla.', 'Directo y variable. Costo MP = precio de la MP × cantidad usada.'],
            ['Mano de obra directa (MOD)', 'Quien transforma el producto. Ejemplo: el carpintero.', 'Directa; normalmente variable, pero puede ser fija. Costo MOD = tarifa por hora hombre (HH) × horas hombre usadas.'],
            ['Costos indirectos de fabricación (CIF)', 'Todo lo de la fábrica que no es MPD ni MOD. También se llaman gastos de fabricación (GF).', 'Indirectos; pueden ser fijos o variables.']
          ] },
          { k: 'p', h: '**¿Qué entra en los CIF?** Materiales indirectos (clavos, pegamento, lija, lubricantes), mano de obra indirecta (supervisor, mantención, bodeguero), luz, agua y gas de la planta, arriendo de la planta, seguros de la planta y la depreciación de la planta productiva (costo fijo si es lineal; variable si es por rendimiento, es decir, por unidades producidas).' },
          { k: 'p', h: 'Los gastos de administración y de venta **no** son CIF: no ocurren en la fábrica.' },
          { k: 'formula', h: 'Costo primo = MPD + MOD' },
          { k: 'formula', h: 'Costo de conversión = MOD + CIF' },
          { k: 'formula', h: 'Costo de producción = MPD + MOD + CIF = MPD + Costo de conversión' },
          { k: 'p', h: 'Lo **indirecto** del material (materia prima indirecta, MPI) y de la mano de obra (mano de obra indirecta, MOI) se **suma al CIF**.' },
          { k: 'p', h: 'Directo no es lo mismo que variable: son clasificaciones distintas. Y “costeo directo” significa costeo variable, que es otra cosa (se ve en el módulo 5).' },
          { k: 'asi', items: [
            '«¿Costos primos totales?», «¿gastos de fabricación?», «¿costos de conversión?» → primero separa lo directo de lo indirecto con los % del enunciado.',
            '«¿Costo unitario de producción (costeo total)?» → (MPD + MOD + CIF) ÷ unidades, sin administración ni ventas.',
            '«¿Margen bruto unitario?» → precio <b>neto</b> − costo unitario.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ E2.1
      {
        tipo: 'ejercicio',
        id: 'mm-tazas',
        titulo: 'MM Ltda.: tazas',
        fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 3 },
        datos: { material: 60000, pctDirectoMat: 0.2, mo: 30000, pctIndirectaMo: 0.2, cif: 20000, gVenta: 30000, gAdm: 30000, unidades: 500, precio: 400 },
        enunciado: '<p>Una empresa que fabrica tazas de monitos, “MM Ltda.”, tiene los siguientes antecedentes de las operaciones de mayo 2025:</p>',
        tablaDatos: {
          cols: ['Detalle', 'Monto', 'Composición'],
          filas: [
            ['Material', '$ 60.000', 'Directo 20 %'],
            ['Mano de obra', '$ 30.000', 'Indirecto 20 %'],
            ['Costo indirecto de fabricación', '$ 20.000', '20 % fijo · 80 % variable'],
            ['Gastos de venta', '$ 30.000', '100 % fijos'],
            ['Gastos de administración', '$ 30.000', '100 % fijos']
          ],
          pie: 'Además, se cuenta con la siguiente información: número de unidades producidas: 500 unidades. Precio de venta unitario: $ 400 + IVA.'
        },
        partes: [
          {
            titulo: 'Paso 1 · Separa lo directo de lo indirecto',
            intro: 'El enunciado entrega el material y la mano de obra mezclados. Antes de responder cualquier pregunta, sepáralos.',
            tabla: {
              id: 'clasif',
              cols: ['Concepto', 'Total', 'Parte directa', 'Parte indirecta'],
              filas: [
                { id: 'mat', modelo: 'La primera fila (en verde) va hecha como modelo: el 20 % del material es directo (MPD) y el 80 % restante es indirecto (MPI).', celdas: [{ t: 'Material' }, { f: 60000, tipo: 'pesos' }, { m: 12000, tipo: 'pesos' }, { m: 48000, tipo: 'pesos' }] },
                { id: 'mo', celdas: [{ t: 'Mano de obra' }, { f: 30000, tipo: 'pesos' },
                  { r: 24000, tipo: 'pesos', s: 'El 20 % es indirecta, así que la directa (MOD) es el 80 %: 30.000 × 80 % = $ 24.000', trampas: [{ valor: 6000, propia: true, msg: 'Ojo: el 20 % de la mano de obra es la parte indirecta. La directa es el 80 %.' }] },
                  { r: 6000, tipo: 'pesos', s: 'Mano de obra indirecta (MOI): 30.000 × 20 % = $ 6.000', trampas: [{ valor: 24000, propia: true, msg: 'Ojo: la parte indirecta de la mano de obra es el 20 %, no el 80 %.' }] }] }
              ]
            }
          },
          {
            titulo: 'Paso 2 · Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Costos primos totales:', tipo: 'pesos', respuesta: 36000,
                pista: 'Costo primo = MPD + MOD. Usa solo la parte directa del material y de la mano de obra.',
                trampas: [{ valor: 90000, propia: true, msg: 'Sumaste todo el material y toda la mano de obra. El costo primo usa solo la parte directa: MPD + MOD.' }],
                sol: { d: 'Material $ 60.000, 20 % directo → MPD = $ 12.000. Mano de obra $ 30.000, 20 % indirecta → MOD = 80 % = $ 24.000.', f: 'Costo primo = MPD + MOD', c: '12.000 + 24.000 = $ 36.000' }
              },
              {
                id: 'p2', texto: 'Gastos de fabricación:', tipo: 'pesos', respuesta: 74000,
                pista: 'Gastos de fabricación es otro nombre de los CIF. No son solo los $ 20.000 del enunciado.',
                tambien: [{ valor: 148, equivalente: true, nota: 'La pauta también acepta el valor por unidad: 74.000 ÷ 500 = $ 148 por unidad.' }],
                trampas: [{ valor: 20000, msg: 'Falta sumar MPI y MOI: lo indirecto del material y de la mano de obra también es gasto de fabricación.' }],
                sol: { d: 'MPI = 80 % de $ 60.000 = $ 48.000. MOI = 20 % de $ 30.000 = $ 6.000. CIF del enunciado: $ 20.000.', f: 'Gastos de fabricación (CIF) = MPI + MOI + CIF', c: '48.000 + 6.000 + 20.000 = $ 74.000 (74.000 ÷ 500 = $ 148 por unidad)' }
              },
              {
                id: 'p3', texto: 'Costos de conversión totales:', tipo: 'pesos', respuesta: 98000,
                pista: 'Conversión = MOD + CIF, con el CIF total de la pregunta anterior.',
                trampas: [{ valor: 44000, propia: true, msg: 'Usaste solo el CIF del enunciado. A los gastos de fabricación se suman MPI y MOI.' }],
                sol: { d: 'MOD = $ 24.000. Gastos de fabricación (CIF) totales = $ 74.000.', f: 'Costo de conversión = MOD + CIF', c: '24.000 + 74.000 = $ 98.000' }
              },
              {
                id: 'p4', texto: 'Si la empresa valoriza por sistema de costeo total, ¿a cuánto asciende el costo unitario de producción?', tipo: 'unitario', respuesta: 220,
                pista: 'Suma solo los tres elementos del costo de producción y divide por las unidades producidas.',
                trampas: [{ valor: 340, msg: 'Venta y administración no son costo de producción: no entran al costo unitario.' }],
                sol: { d: 'MPD $ 12.000, MOD $ 24.000, CIF $ 74.000. Producción: 500 unidades.', f: 'Costo unitario de producción = (MPD + MOD + CIF) ÷ unidades', c: '(12.000 + 24.000 + 74.000) ÷ 500 = 110.000 ÷ 500 = $ 220' }
              },
              {
                id: 'p5', texto: '¿A cuánto asciende el margen bruto unitario?', tipo: 'unitario', respuesta: 180,
                pista: 'En resultados siempre se usa el precio neto (sin IVA).',
                trampas: [{ valor: 256, msg: 'El precio es neto; no le sumes IVA. Los resultados se calculan con valores netos.' }],
                sol: { d: 'Precio de venta: $ 400 + IVA, es decir, $ 400 neto. Costo unitario de producción: $ 220.', f: 'Margen bruto unitario = precio neto − costo unitario de producción', c: '400 − 220 = $ 180' }
              }
            ]
          }
        ],
        cierre: '<p><b>Comprobación:</b> el costo de producción total es MPD 12.000 + MOD 24.000 + CIF 74.000 = $ 110.000, lo mismo que material 60.000 + mano de obra 30.000 + CIF 20.000: todo lo que pasa en la fábrica. Los gastos de venta y de administración quedan fuera, porque son gastos del período.</p>'
      },

      // ------------------------------------------------------------------ E2.2 (extra)
      {
        tipo: 'ejercicio',
        id: 'souvenirs',
        rol: 'extra',
        titulo: 'Souvenirs del campeonato',
        fuente: { k: 'certamen', sem: 1, anio: 2022, preg: 3 },
        datos: { material: 120000, pctDirectoMat: 0.83, mo: 90000, pctIndirectaMo: 0.25, cif: 40000, gVenta: 50000, gAdm: 60000, unidades: 10000, precio: 100 },
        enunciado: '<p>Una empresa que fabrica souvenirs para el Campeonato Nacional de Baloncesto presenta los siguientes antecedentes de las operaciones de junio 2022:</p>',
        tablaDatos: {
          cols: ['Detalle', 'Monto', 'Composición'],
          filas: [
            ['Material', '$ 120.000', 'Directo 83 %'],
            ['Mano de obra', '$ 90.000', 'Indirecto 25 %'],
            ['Costo indirecto de fabricación', '$ 40.000', '40 % fijo · 60 % variable'],
            ['Gastos de venta', '$ 50.000', 'Fijos'],
            ['Gastos de administración', '$ 60.000', 'Fijos']
          ],
          pie: 'Además, se cuenta con la siguiente información: número de unidades producidas = 10.000 unidades. Precio de venta unitario (neto) = $ 100.'
        },
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Costos indirectos de fabricación total:', tipo: 'pesos', respuesta: 82900,
                trampas: [{ valor: 40000, propia: true, msg: 'Falta sumar la parte indirecta del material (MPI) y de la mano de obra (MOI): lo indirecto se suma al CIF.' }],
                sol: { d: 'Material $ 120.000, 83 % directo → MPI = 17 % = $ 20.400. Mano de obra $ 90.000, 25 % indirecta → MOI = $ 22.500. CIF del enunciado: $ 40.000.', f: 'CIF total = MPI + MOI + CIF', c: '20.400 + 22.500 + 40.000 = $ 82.900' }
              },
              {
                id: 'p2', texto: 'Costo de conversión total:', tipo: 'pesos', respuesta: 150400,
                trampas: [{ valor: 107500, propia: true, msg: 'Usaste solo el CIF del enunciado. El CIF total incluye además MPI y MOI.' }],
                sol: { d: 'MOD = 75 % de $ 90.000 = $ 67.500. CIF total = $ 82.900.', f: 'Costo de conversión = MOD + CIF', c: '67.500 + 82.900 = $ 150.400' }
              },
              {
                id: 'p3', texto: 'Costo primo total:', tipo: 'pesos', respuesta: 167100,
                trampas: [{ valor: 210000, propia: true, msg: 'Sumaste todo el material y toda la mano de obra. El costo primo usa solo la parte directa: MPD + MOD.' }],
                sol: { d: 'MPD = 83 % de $ 120.000 = $ 99.600. MOD = 75 % de $ 90.000 = $ 67.500.', f: 'Costo primo = MPD + MOD', c: '99.600 + 67.500 = $ 167.100' }
              },
              {
                id: 'p4', texto: 'Costo de producción unitario:', tipo: 'unitario', respuesta: 25,
                trampas: [{ valor: 36, propia: true, msg: 'Venta y administración no son costo de producción: no entran al costo unitario.' }],
                sol: { d: 'Costo de producción = MPD 99.600 + MOD 67.500 + CIF 82.900 = $ 250.000. Producción: 10.000 unidades.', f: 'Costo de producción unitario = costo de producción ÷ unidades producidas', c: '250.000 ÷ 10.000 = $ 25' }
              }
            ]
          }
        ],
        cierre: '<p><b>Comprobación:</b> costo primo 167.100 + CIF total 82.900 = $ 250.000, que es todo lo que pasa en la fábrica (material 120.000 + mano de obra 90.000 + CIF 40.000).</p>'
      },

      // ------------------------------------------------------------------ L2.4
      {
        tipo: 'leccion',
        id: 'clasificaciones',
        titulo: 'Clasificaciones de costos',
        idea: 'Un mismo costo se puede mirar de varias formas: cómo se comporta, si se identifica con el producto, en qué área ocurre, cuándo se calcula y si importa para una decisión.',
        partes: [
          { k: 'practica', h: 'Una pizzería paga $ 1.000.000 de arriendo. Con 1.000 pizzas son $ 1.000 por pizza; con 2.000 pizzas son $ 500. El arriendo total no cambió, pero por unidad sí. La masa de cada pizza, en cambio, cuesta lo mismo por pizza y el total sube con cada una.' },
          { k: 'sub', h: 'Por comportamiento' },
          { k: 'comparar', cols: ['Tipo', 'Costo total', 'Costo unitario', 'Ejemplo'], filas: [
            ['Variable', 'Cambia con la actividad.', '<b>Constante.</b>', 'La masa de cada pizza.'],
            ['Fijo', 'Constante dentro de un rango.', '<b>Baja</b> si sube la actividad.', 'El arriendo.'],
            ['Semivariable', 'Una parte fija y una variable.', '–', 'Sueldo más comisión.'],
            ['Escalonado', 'Sube por tramos.', '–', 'Un supervisor cada 20 operarios.']
          ] },
          { k: 'sub', h: 'Las otras clasificaciones' },
          { k: 'lista', items: [
            '<b>Por identificación:</b> directos e indirectos.',
            '<b>Por función:</b> de producción, de administración y de comercialización (esta última puede ser fija, variable, directa o indirecta).',
            '<b>Por momento del cálculo:</b> <b>históricos o reales</b> (resultantes: se calculan después de producir, evalúan el pasado y sirven para órdenes y para procesos) versus <b>predeterminados</b>, que pueden ser estimados (lo que <i>puede</i> costar) o estándar (lo que <i>debe</i> costar).',
            '<b>Para tomar decisiones:</b> incrementales (por un aumento de actividad) y decrementales (por una disminución), ambos diferenciales; de <b>oportunidad</b> (lo que se renuncia: es hipotético y <b>no se registra</b> en la contabilidad); <b>hundidos o sumergidos</b> (ya incurridos: no cambian con la decisión); relevantes; evitables e inevitables.'
          ] },
          { k: 'asi', items: [
            'Verdadero o falso: «el costo fijo unitario no varía con el nivel de producción» (falso) y «el costo de oportunidad se registra en la contabilidad» (falso).',
            '«¿Cuál es el costo unitario si se producen N unidades?» → costo variable por unidad + costos fijos ÷ N. Revisa si a ese nivel cambia algún costo fijo.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ E2.3
      {
        tipo: 'ejercicio',
        id: 'zapatos-xyx',
        titulo: 'Empresa “XYX”: zapatos',
        fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 3, nota: 'caso 1' },
        datos: { cuero: 10, suela: 20, plantillas: 5, mod: 20, jefe: 1000, arriendo: 3000, bono: 500, umbral: 90, _alza: 0.25, _n1: 50, _n2: 100 },
        enunciado: '<p>La empresa “XYX” tiene la siguiente estructura de costos para sus zapatos:</p>',
        tablaDatos: {
          cols: ['Detalle', 'Valor'],
          filas: [
            ['Cuero', '10 USD por par'],
            ['Suela', '20 USD por par'],
            ['Plantillas', '5 USD por par'],
            ['Mano de obra directa', '20 USD por par'],
            ['Jefe de taller', '1.000 USD fijos']
          ],
          pie: 'Arriendos de la planta productiva por mes: USD 3.000. El jefe de taller tiene un bono adicional de USD 500 cuando se producen sobre 90 unidades al mes.'
        },
        partes: [
          {
            titulo: 'Primer paso (hecho, como modelo)',
            modelo: 'Costo variable por par, con el alza de 25 % en la mano de obra directa: 10 + 20 + 5 + 20 × 1,25 = 10 + 20 + 5 + 25 = <b>60 USD</b>',
            nota: 'Lo variable no cambia por par. Lo que cambia con el nivel de producción es cuánto costo fijo le toca a cada par.'
          },
          {
            titulo: 'Calcula el costo unitario en cada nivel de producción',
            preguntas: [
              {
                id: 'p1', texto: 'Por negociación colectiva la remuneración de la mano de obra directa se incrementa en un 25 %. Si el nivel de producción es de 50 zapatos por mes, ¿cuál es el costo unitario por zapatos?', tipo: 'unitario', moneda: 'USD', respuesta: 140,
                pista: 'Reparte los costos fijos del mes entre las 50 unidades y súmale el costo variable por par. ¿Corresponde el bono con 50 unidades?',
                trampas: [
                  { valor: 135, propia: true, msg: 'Te faltó el alza de la mano de obra directa: con el 25 % pasa de 20 a 25 USD por par.' },
                  { valor: 150, propia: true, msg: 'Con este nivel de producción no se superan las 90 unidades: todavía no corresponde el bono del jefe de taller.' }
                ],
                sol: { d: 'Costo variable: 60 USD por par. Costos fijos: jefe de taller 1.000 + arriendo 3.000 = 4.000 USD (con 50 unidades no hay bono).', f: 'Costo unitario = costo variable unitario + costos fijos ÷ unidades', c: '60 + 4.000 ÷ 50 = 60 + 80 = 140 USD' }
              },
              {
                id: 'p2', texto: 'Por negociación colectiva la remuneración de la mano de obra directa se incrementa en un 25 %. Si el nivel de producción es de 100 zapatos por mes, ¿cuál es el costo unitario por zapatos?', tipo: 'unitario', moneda: 'USD', respuesta: 105,
                pista: 'Con 100 unidades se superan las 90: revisa qué pasa con los costos fijos.',
                trampas: [
                  { valor: 100, propia: true, msg: 'Revisa dos cosas: el alza de la mano de obra directa (de 20 a 25 USD por par) y el bono de USD 500, que corresponde al superar las 90 unidades.' }
                ],
                sol: { d: 'Costo variable: 60 USD por par. Con 100 unidades se superan las 90: jefe de taller 1.000 + bono 500 + arriendo 3.000 = 4.500 USD.', f: 'Costo unitario = costo variable unitario + costos fijos ÷ unidades', c: '60 + 4.500 ÷ 100 = 60 + 45 = 105 USD' }
              }
            ]
          }
        ],
        cierre: '<p><b>Fíjate en el efecto:</b> al duplicar la producción, el costo fijo por par baja de 80 a 45 USD, aunque el jefe de taller reciba el bono. Por eso el costo fijo unitario sí varía con el nivel de producción, mientras que el costo variable unitario se mantiene en 60 USD.</p>'
      },

      // ------------------------------------------------------------------ E2.4 (extra)
      {
        tipo: 'ejercicio',
        id: 'table-mesas',
        rol: 'extra',
        titulo: 'Table S.A.: mesas de madera',
        fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 3 },
        datos: { madera: 100000, clavos: 12000, mo: 30000, elecVar: 10000, elecFijo: 3000000, gav: 25000000, precioBruto: 297500, unidades: 600, _unidades2: 1000 },
        enunciado: '<p>La empresa “Table S.A.” se dedica a la fabricación de mesas de madera. Su estructura de costos mensuales se muestra a continuación como costos fijos y variables:</p>',
        tablaDatos: {
          cols: ['Tipo de costo', 'Producción', 'Costo fijo', 'Costo variable'],
          filas: [
            ['Madera', 'Directo', '–', '$ 100.000 por unidad'],
            ['Clavos, pegamento y barniz', 'Indirecto', '–', '$ 12.000 por unidad'],
            ['Mano de obra', 'Directo', '–', '$ 30.000 por unidad'],
            ['Electricidad y mantención de maquinarias', 'Indirecto', '$ 3.000.000', '$ 10.000 por unidad'],
            ['Gastos de administración y ventas', '50 % directo', '$ 25.000.000', '–']
          ],
          pie: 'El precio de venta es de $ 297.500 con IVA incluido por unidad. Nivel de actividad de producción y ventas = 600 unidades. (La pregunta 4 usa el margen de contribución unitario, que es el precio neto menos los costos variables por unidad; se estudia en detalle en el módulo 6.)'
        },
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Calcular el costo de producción unitario:', tipo: 'pesos', respuesta: 157000,
                trampas: [{ valor: 198667, msg: 'Administración y ventas no son costo de producción: esos gastos no entran al costo unitario.' }],
                sol: { d: 'Costos variables de producción por unidad: madera 100.000 + clavos, pegamento y barniz 12.000 + mano de obra 30.000 + electricidad y mantención 10.000 = $ 152.000. Costo fijo de producción: $ 3.000.000. Producción: 600 unidades.', f: 'Costo de producción unitario = costo variable unitario + costo fijo de producción ÷ unidades', c: '152.000 + 3.000.000 ÷ 600 = 152.000 + 5.000 = $ 157.000' }
              },
              {
                id: 'p2', texto: '¿A cuánto ascienden los costos de conversión totales?', tipo: 'pesos', respuesta: 34200000,
                trampas: [{ valor: 27000000, propia: true, msg: 'Clavos, pegamento y barniz son materiales indirectos: también son CIF y entran al costo de conversión.' }],
                sol: { d: 'Mano de obra: 30.000 × 600 = $ 18.000.000. CIF: (12.000 + 10.000) × 600 + 3.000.000 = $ 16.200.000.', f: 'Costo de conversión = MOD + CIF', c: '18.000.000 + 16.200.000 = $ 34.200.000' }
              },
              {
                id: 'p3', texto: '¿Cuál es el margen bruto unitario?', tipo: 'pesos', respuesta: 93000,
                trampas: [{ valor: 140500, msg: 'Saca el IVA: el precio viene con IVA incluido y hay que dividirlo por 1,19 para llegar al neto.' }],
                sol: { d: 'Precio con IVA incluido: $ 297.500 → precio neto = 297.500 ÷ 1,19 = $ 250.000. Costo de producción unitario: $ 157.000.', f: 'Margen bruto unitario = precio neto − costo de producción unitario', c: '250.000 − 157.000 = $ 93.000' }
              },
              {
                id: 'p4', texto: 'Si la empresa produce y vende 1.000 unidades, ¿cuál es su margen de contribución unitario?', tipo: 'pesos', respuesta: 98000,
                trampas: [
                  { valor: 145500, propia: true, msg: 'Saca el IVA antes de restar: el precio viene con IVA incluido y hay que dividirlo por 1,19.' },
                  { valor: 95000, propia: true, msg: 'Restaste también el costo fijo por unidad. El margen de contribución resta solo los costos variables.' }
                ],
                sol: { d: 'Precio neto: $ 250.000. Costos variables por unidad: $ 152.000 (no cambian con el nivel de producción).', f: 'Margen de contribución unitario = precio neto − costo variable unitario', c: '250.000 − 152.000 = $ 98.000' }
              },
              {
                id: 'p5', texto: '¿A cuánto ascienden los costos primos totales?', tipo: 'pesos', respuesta: 78000000,
                tambien: [{ valor: 130000000, equivalente: true, nota: 'La pauta también acepta el valor con las 1.000 unidades de la pregunta anterior: 130.000 × 1.000 = $ 130.000.000.' }],
                trampas: [{ valor: 85200000, propia: true, msg: 'Clavos, pegamento y barniz son material indirecto: no son costo primo, van al CIF.' }],
                sol: { d: 'Costo primo por unidad: madera 100.000 + mano de obra 30.000 = $ 130.000. Nivel de actividad: 600 unidades.', f: 'Costo primo total = (MPD + MOD) por unidad × unidades', c: '130.000 × 600 = $ 78.000.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Lo que hay que mirar en este ejercicio:</b> la columna “Producción” dice qué es directo y qué es indirecto, y las otras dos dicen qué es fijo y qué es variable. Son dos clasificaciones distintas del mismo costo. Los gastos de administración y ventas no entran al costo de producción.</p>'
      },

      // ------------------------------------------------------------------ E2.5 (extra)
      {
        tipo: 'ejercicio',
        id: 'sentarse-bien',
        rol: 'extra',
        titulo: 'Sentarse Bien S.A.: sillas',
        fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 4, nota: 'preguntas 1 y 5' },
        datos: { espuma: 10000, madera: 10000, moVar: 30000, moFijo: 10000000, elecVar: 10000, elecFijo: 5000000, gav: 30000000, precio: 150000, _n1: 600, _n5: 100 },
        enunciado: '<p>La empresa “Sentarse Bien S.A.” se dedica a la fabricación de sillas de escritorio. Su estructura de costos mensuales es la que se muestra a continuación:</p>',
        tablaDatos: {
          cols: ['Tipo de costo', 'Costo fijo', 'Costo variable'],
          filas: [
            ['Espuma', '–', '$ 10.000 por unidad'],
            ['Madera', '–', '$ 10.000 por unidad'],
            ['Mano de obra', '$ 10.000.000', '$ 30.000 por unidad'],
            ['Electricidad y mantención de maquinaria', '$ 5.000.000', '$ 10.000 por unidad'],
            ['Gastos de administración y ventas', '$ 30.000.000', '–']
          ],
          pie: 'El precio de venta neto es de $ 150.000 por unidad. (Las preguntas 2 a 4 de este ejercicio son de punto de equilibrio y margen de seguridad: se resuelven en el módulo 6.)'
        },
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Calcular el costo de producción unitario si la empresa produce 600 unidades en el período:', tipo: 'pesos', respuesta: 85000,
                trampas: [{ valor: 135000, propia: true, msg: 'Administración y ventas no son costo de producción: esos gastos no entran al costo unitario.' }],
                sol: { d: 'Costo variable de producción: espuma 10.000 + madera 10.000 + mano de obra 30.000 + electricidad y mantención 10.000 = $ 60.000 por unidad. Costos fijos de producción: 10.000.000 + 5.000.000 = $ 15.000.000.', f: 'Costo de producción unitario = costo variable unitario + costos fijos de producción ÷ unidades', c: '60.000 + 15.000.000 ÷ 600 = 60.000 + 25.000 = $ 85.000' }
              },
              {
                id: 'p5', texto: '¿A cuánto ascienden los costos de conversión si la empresa produce y vende 100 unidades mensuales?', tipo: 'pesos', respuesta: 19000000,
                trampas: [
                  { valor: 21000000, propia: true, msg: 'Espuma y madera son materia prima: no forman parte del costo de conversión.' },
                  { valor: 4000000, propia: true, msg: 'Te faltó la parte fija de la mano de obra y de la electricidad y mantención.' }
                ],
                sol: { d: 'Mano de obra: 30.000 × 100 + 10.000.000 = $ 13.000.000. CIF (electricidad y mantención): 10.000 × 100 + 5.000.000 = $ 6.000.000.', f: 'Costo de conversión = mano de obra + CIF (cada uno con su parte variable y su parte fija)', c: '13.000.000 + 6.000.000 = $ 19.000.000' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ L2.5
      {
        tipo: 'leccion',
        id: 'estado-de-costos',
        titulo: 'Del costo de producción al costo de venta',
        idea: 'Cada inventario funciona como una bodega: lo que había, más lo que entra, menos lo que sale, es lo que queda. Encadenando las tres bodegas se llega al costo de venta.',
        partes: [
          { k: 'p', h: 'Cada inventario cumple la misma regla, con saldo inicial (SI) y saldo final (SF):' },
          { k: 'formula', h: 'SI + Entradas − Salidas = SF' },
          { k: 'p', h: 'En una empresa industrial hay tres inventarios seguidos. Recorriéndolos en orden se arma el **estado de costos**. Aquí el saldo inicial se llama inventario inicial (II) y el saldo final, inventario final (IF):' },
          { k: 'pasos', items: [
            { t: 'Materia prima utilizada', h: 'II de MP + compras − IF de MP.' },
            { t: 'Costo puesto en producción', h: 'MP utilizada + mano de obra directa (MOD) + costos indirectos de fabricación (CIF).' },
            { t: 'Costo de los productos terminados (PT)', h: 'Costo puesto en producción + II de productos en proceso (PenP) − IF de PenP.' },
            { t: 'Costo de venta', h: 'Costo de PT + II de PT − IF de PT.' }
          ] },
          { k: 'diagrama', id: 'flujo-costos' },
          { k: 'formula', h: 'Ventas − Costo de venta = Margen bruto' },
          { k: 'formula', h: 'Margen bruto − Gastos operacionales = Resultado operacional' },
          { k: 'p', h: '**Ciclo contable:** la MP, la MOD y los CIF se cargan a productos en proceso; lo que se termina pasa a productos terminados; y al vender, ese costo pasa a costo de venta.' },
          { k: 'asi', items: [
            'Verdadero o falso: «el costo de venta de una industria son los productos terminados y no vendidos» (falso: eso es el inventario de PT; el costo de venta es lo terminado <b>y vendido</b>).',
            'Verdadero o falso: «los componentes del costo de producción son materia prima más costos de conversión» (verdadero).'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué, para llegar al costo de los productos terminados, se suma el inventario inicial de productos en proceso y se resta el final?',
          opciones: [
            'Porque lo que estaba a medio hacer al inicio también se termina en el período, y lo que queda a medio hacer al final todavía no es producto terminado.',
            'Porque los productos en proceso son un gasto del período.',
            'Porque el inventario final de productos en proceso ya se vendió.',
            'Porque así se elimina el IVA de las compras.'
          ],
          correcta: 0,
          porque: 'Es la regla de la bodega aplicada a productos en proceso: saldo inicial + lo que entra (costo puesto en producción) − lo que sale (lo terminado) = saldo final. Despejando lo que sale: lo terminado = costo puesto en producción + inventario inicial − inventario final.'
        }
      },

      // ------------------------------------------------------------------ VF2.A
      {
        tipo: 'vf',
        id: 'vf-costos',
        titulo: 'Verdadero o falso: fundamentos de costos',
        items: [
          { id: 'a1', af: 'En el proceso de producción, los costos primos son la mano de obra directa y los costos indirectos de fabricación.', r: false, porque: 'Los costos primos son materia prima directa (MPD) + mano de obra directa (MOD). MOD + costos indirectos de fabricación (CIF) es el costo de conversión.', fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 1, nota: 'en el 2º semestre 2024 apareció la variante «materiales directos y CIF», también falsa' } },
          { id: 'a2', af: 'En el proceso de producción, los costos de conversión son la mano de obra directa y los gastos de fabricación.', r: true, porque: 'Costo de conversión = MOD + CIF, y los gastos de fabricación son otro nombre de los CIF.', fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 1 } },
          { id: 'a3', af: 'Los costos primos corresponden a los costos variables que maneja la empresa.', r: false, porque: 'Primo no significa variable: el costo primo es MPD + MOD. Directo o indirecto y fijo o variable son clasificaciones distintas.', fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 1 } },
          { id: 'a4', af: 'Los costos primos corresponden a los costos relacionados con transformar la materia prima en productos terminados.', r: false, porque: 'Transformar la materia prima en producto terminado es justamente la conversión: MOD + CIF. Los costos primos son MPD + MOD.', fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 1, tb: '1er semestre 2023 y 1er semestre 2022' } },
          { id: 'a5', af: 'Los componentes del costo de producción son: materia prima más los costos de conversión.', r: true, porque: 'Costo de producción = MPD + MOD + CIF, que es lo mismo que materia prima directa + costo de conversión.', fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 1 } },
          { id: 'a6', af: 'Los elementos del costo son: materia prima, mano de obra y costos indirectos de fabricación.', r: true, porque: 'Son los tres elementos del costo de producción.', fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 1 } },
          { id: 'a7', af: 'En términos unitarios, el costo fijo permanece constante aunque cambie el nivel de actividad (producción).', r: false, porque: 'El costo fijo total es constante, pero por unidad baja cuando sube la producción y sube cuando baja.', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1, tb: '1er semestre 2022' } },
          { id: 'a8', af: 'El costo variable unitario no varía en función del número de unidades producidas.', r: true, porque: 'El costo variable total cambia con la producción, pero por unidad se mantiene constante.', fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 1 } },
          { id: 'a9', af: 'Los costos indirectos de fabricación son aquellos que no pueden identificarse directamente con la fabricación de un producto terminado.', r: true, porque: 'Por eso son “indirectos”: no se pueden identificar con cada unidad y hay que repartirlos.', fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 1, tb: '2º semestre 2024' } },
          { id: 'a10', af: 'El costo de oportunidad se debe registrar en la contabilidad.', r: false, porque: 'El costo de oportunidad es lo que se renuncia al elegir una alternativa: es hipotético y no se registra en la contabilidad.', fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 1 } },
          { id: 'a11', af: 'Los costos históricos no sirven para evaluar acciones pasadas.', r: false, porque: 'Los costos históricos o reales se calculan después de producir y sirven precisamente para evaluar lo que ya pasó.', fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 1 } },
          { id: 'a12', af: 'El costo de ventas en la industria productiva corresponde a los costos de productos terminados y no vendidos.', r: false, porque: 'El costo de venta es el costo de los productos terminados y vendidos. Los terminados y no vendidos quedan en el inventario de productos terminados.', fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 1 } },
          { id: 'a13', af: 'Los gastos de administración y venta son costos indirectos de fabricación variables.', r: false, porque: 'Los gastos de administración y venta no son CIF: no son costo de producción, son gastos del período.', fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 2, nota: 'adaptada de una alternativa de selección múltiple' } },
          { id: 'a14', af: 'Los costos decrementales son aquellos en que se incurre cuando las variaciones de los costos son ocasionadas por un aumento de las actividades u operaciones de la empresa.', r: false, porque: 'Los decrementales se originan por una disminución de la actividad. Los que nacen de un aumento son los incrementales.', fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 1 } }
        ]
      },

      // ------------------------------------------------------------------ MC2.A – MC2.E
      {
        tipo: 'mc',
        id: 'mc-costos',
        titulo: 'Selección múltiple: fundamentos de costos',
        items: [
          {
            id: 'm1',
            enunciado: 'Los costos de conversión corresponden a la suma de:',
            opciones: ['Mano de obra indirecta más CIF.', 'Materia prima directa más mano de obra directa.', 'Mano de obra directa más CIF.', 'Materia prima indirecta más costos primos.'],
            correcta: 2,
            porque: 'Costo de conversión = mano de obra directa + CIF: es lo que cuesta transformar la materia prima. Materia prima directa + mano de obra directa es el costo primo.',
            fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 2 }
          },
          {
            id: 'm2',
            enunciado: 'Primero se consume y luego se determina el costo en virtud de los insumos reales. Puede utilizarse tanto en costos por órdenes como en costos por procesos. La definición anterior corresponde al costeo:',
            opciones: ['Por órdenes de trabajo.', 'Directo o variable.', 'Histórico o resultante.', 'Predeterminado.'],
            correcta: 2,
            porque: 'Es el costo histórico o resultante (real): se determina después de consumir los insumos y sirve tanto en órdenes como en procesos. Lo contrario es el predeterminado, que se calcula antes de producir.',
            fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 2 }
          },
          {
            id: 'm3',
            enunciado: 'Los costos de comercialización pueden ser:',
            opciones: ['Costos variables.', 'Costos fijos.', 'Costos directos e indirectos.', 'Todas las anteriores.'],
            correcta: 3,
            porque: 'Los costos de comercialización se pueden clasificar de todas esas formas: fijos o variables, directos o indirectos.',
            fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 2 }
          },
          {
            id: 'm4',
            enunciado: '¿Cuál de las siguientes aseveraciones <b>no</b> tiene relación con el costo indirecto de fabricación?',
            opciones: ['Pueden ser variables y/o fijos.', 'Los materiales que sirven de apoyo en la fabricación pueden entrar en esta categoría.', 'La depreciación de las maquinarias son costos indirectos fijos.', 'Los gastos de administración y venta son costos indirectos variables.'],
            correcta: 3,
            porque: 'Los gastos de administración y venta no son CIF. Las otras tres sí describen a los costos indirectos de fabricación.',
            fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 2 }
          },
          {
            id: 'm5',
            enunciado: 'Indique cuál de las siguientes aseveraciones es <b>falsa</b>:',
            opciones: ['Los costos fijos no varían dentro del nivel establecido de operación.', 'Los costos incrementales nacen cuando las variaciones de los costos son ocasionadas por un cambio de las actividades u operaciones de la empresa.', 'Los costos semivariables varían solo cuando se incrementa la mano de obra.', 'El costo de oportunidad es un costo hipotético dado que no se refleja en la contabilidad.'],
            correcta: 2,
            porque: 'Un costo semivariable tiene una parte fija y una parte variable (por ejemplo, sueldo más comisión); no depende solo de la mano de obra.',
            fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ Resumen
      {
        tipo: 'resumen',
        id: 'resumen',
        titulo: 'Resumen del módulo 2',
        formulas: [
          'El costo se guarda en inventario; el gasto va directo a resultado.',
          'Costo primo = MPD + MOD',
          'Costo de conversión = MOD + CIF',
          'MPI y MOI se suman al CIF.',
          'Administración y ventas no son costo de producción.'
        ],
        asi: [
          'Verdadero o falso sobre costo primo, costo de conversión y costo versus gasto: cae en casi todos los certámenes.',
          '«¿Costos primos totales?», «¿gastos de fabricación?», «¿costos de conversión?» → primero separa lo directo de lo indirecto con los % del enunciado.',
          '«¿Costo unitario de producción (costeo total)?» → (MPD + MOD + CIF) ÷ unidades, sin administración ni ventas.',
          '«¿Margen bruto unitario?» → precio <b>neto</b> − costo unitario.'
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
