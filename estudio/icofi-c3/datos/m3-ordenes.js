// MÓDULO 3 — Sistemas de costeo: órdenes específicas y el problema de los CIF.
// Solo contenido. Convenciones de texto: **negrita**, {{numerador // denominador}} = fracción, HTML simple.
// En cada ejercicio, "datos" guarda los números crudos del enunciado: de ahí recalcula el script de verificación
// (las claves que empiezan con "_" son datos que el certamen entrega dentro de las preguntas, no en el enunciado).
// Las trampas con "propia: true" no vienen del encargo: salen de errores que la propia lección describe.
(function (g) {
  'use strict';

  var SUB_SOBRE = ['Subaplicación', 'Sobreaplicación'];

  g.ICOFI_C3.modulos.push({
    id: 'ordenes',
    n: 3,
    titulo: 'Sistemas de costeo: órdenes específicas y el problema de los CIF',
    corto: 'Órdenes específicas y CIF',
    meta: 'Cómo se costea cuando se fabrica a pedido, y qué hacer con los costos indirectos que se conocen recién a fin de mes.',
    bloques: [

      // ------------------------------------------------------------------ L3.1
      {
        tipo: 'leccion',
        id: 'ordenes-vs-procesos',
        titulo: 'Órdenes específicas versus procesos',
        idea: 'Si se fabrica a pedido, el costo se junta por pedido. Si se fabrica en serie, se junta por departamento.',
        partes: [
          { k: 'practica', h: 'Una imprenta sabe qué papel y cuántas horas usó en cada pedido, porque cada pedido es distinto. Una fábrica de cemento no puede distinguir un saco de otro: todos salen iguales del mismo proceso.' },
          { k: 'p', h: 'Por eso hay dos sistemas para acumular el costo de producción, según cómo se produce:' },
          { k: 'comparar', cols: ['', 'Órdenes específicas', 'Por procesos'], filas: [
            ['Producción', 'Discontinua, a pedido del cliente.', 'Continua o en serie.'],
            ['Productos', 'Heterogéneos (distintos entre sí).', 'Homogéneos (todos iguales).'],
            ['¿Dónde se acumula el costo?', 'Por orden, en una <b>hoja de costos</b>.', 'Por <b>departamento o centro de costo</b>; se pierde la identidad del producto.'],
            ['Ejemplos', 'Imprenta, maquinaria a pedido.', 'Harina, champú, cemento.']
          ] },
          { k: 'p', h: 'Este módulo trata las órdenes específicas. El sistema por procesos se ve en el módulo 4.' },
          { k: 'asi', items: [
            'Verdadero o falso y alternativas del tipo «mencione la que no corresponde». En órdenes: la producción parte con un pedido, los costos van a una hoja de costos y los productos son heterogéneos. «En serie o en masa» es de procesos.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ MC3.A
      {
        tipo: 'mc',
        id: 'mc-ordenes',
        titulo: 'Selección múltiple: órdenes específicas',
        items: [
          {
            id: 'm1',
            enunciado: 'Sistema de costo por órdenes específicas de fabricación, mencione el que <b>no</b> corresponde:',
            opciones: [
              'La producción solo comienza con un pedido expreso de un cliente.',
              'Los costos se acumulan y controlan por pedidos en hojas de costo.',
              'Se aplica en aquellas empresas que producen en serie o en masa.',
              'Los productos tienden a ser heterogéneos.'
            ],
            correcta: 2,
            porque: '«En serie o en masa» describe el sistema por procesos. En órdenes específicas la producción parte con un pedido, los costos van a una hoja de costos y los productos son heterogéneos.',
            fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ L3.2
      {
        tipo: 'leccion',
        id: 'cuota-cif',
        titulo: 'El problema de los CIF y la cuota de asignación',
        idea: 'Los costos indirectos reales se conocen a fin de mes, pero el costo de la orden se necesita antes. Por eso se aplican con una cuota estimada y después se compara con lo real.',
        partes: [
          { k: 'practica', h: 'Una imprenta tiene dos pedidos y una sola cuenta de luz, que llega a fin de mes. Pero el cliente pidió el precio el día 3.' },
          { k: 'p', h: 'La materia prima directa (MPD) y la mano de obra directa (MOD) se cargan directo a cada orden. Los costos indirectos de fabricación (CIF) no se pueden cargar así, por dos razones:' },
          { k: 'lista', items: [
            'Cuando hay dos o más productos, hay que <b>repartirlos</b> entre ellos.',
            'Los CIF reales se conocen recién <b>al final del período</b>, pero el costo de la orden se necesita antes, para cotizar o fijar el precio.'
          ] },
          { k: 'p', h: '**La solución** es una **cuota de asignación** calculada por adelantado, con los CIF presupuestados:' },
          { k: 'formula', h: 'Cuota de asignación = {{CIF presupuestados // Base de asignación}}' },
          { k: 'formula', h: 'CIF aplicado = Cuota × Base de la orden' },
          { k: 'p', h: 'La base debe ser común a todos los productos y medible: horas de MOD, horas máquina, costo de la MOD, costo de la materia prima (MP) o unidades.' },
          { k: 'p', h: 'Al final del período se conocen los CIF reales y se comparan con los aplicados:' },
          { k: 'comparar', cols: ['Si…', 'Se llama', 'Ajuste al costo de venta'], filas: [
            ['CIF aplicado <b>mayor</b> que CIF real', '<b>Sobreaplicación</b> (se aplicó de más)', 'Se <b>resta</b>.'],
            ['CIF aplicado <b>menor</b> que CIF real', '<b>Subaplicación</b> (se aplicó de menos)', 'Se <b>suma</b>.']
          ] },
          { k: 'asi', items: [
            '«¿CIF aplicados a la orden X?» → tasa × base de esa orden.',
            '«¿Costos de conversión aplicados?» → MOD + CIF aplicado.',
            '«¿Costo total real?» → MPD + MOD + CIF <b>real</b>.',
            '«¿Variación del CIF?» → aplicado versus real, indicando si es sub o sobreaplicación.',
            '«¿Margen bruto con el ajuste al costo de venta?» → ventas − (costo aplicado − sobreaplicación, o + subaplicación).'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué no se espera a conocer los CIF reales para costear una orden?',
          opciones: [
            'Porque los CIF reales nunca llegan a conocerse.',
            'Porque los CIF no forman parte del costo del producto.',
            'Porque los CIF reales se conocen al final del período y el costo de la orden se necesita antes, para cotizar o fijar el precio.',
            'Porque los CIF reales son siempre iguales a los aplicados.'
          ],
          correcta: 2,
          porque: 'Los CIF sí son costo del producto y sí se llegan a conocer, pero tarde. La cuota de asignación permite costear la orden a tiempo; la diferencia con lo real (sub o sobreaplicación) se ajusta después.'
        }
      },

      // ------------------------------------------------------------------ E3.1
      {
        tipo: 'ejercicio',
        id: 'palitos-101-202',
        titulo: 'Palitos: trabajos 101 y 202',
        fuente: { k: 'taller', ej: 1 },
        datos: { cuota: 3.5, mp101: 8000, mod101: 12000, u101: 500, mp202: 6000, mod202: 8000, u202: 800, cifReal: 42000 },
        enunciado: '<p>La compañía manufacturera “Palitos” usa un sistema de costos por órdenes específicas. En octubre de 2026 completó dos hojas de costos. La cuota de asignación predeterminada de los CIF es de <b>3,5 veces el costo de la materia prima (MP)</b>.</p>',
        tablaDatos: {
          cols: ['', 'Trabajo 101', 'Trabajo 202'],
          filas: [
            ['Costo de la MP', '$ 8.000', '$ 6.000'],
            ['Costo de la MOD', '$ 12.000', '$ 8.000'],
            ['Horas de MOD', '8.000', '6.000'],
            ['Horas máquina', '2.500', '1.500'],
            ['Producción', '500 unidades', '800 unidades']
          ],
          pie: 'CIF reales del mes: $ 42.000 (todos fijos). Se pide: A. la hoja de costos del trabajo 101; B. la sub o sobreaplicación de los CIF.'
        },
        partes: [
          {
            titulo: 'A · Hoja de costos del trabajo 101',
            intro: 'Nivel de actividad: 500 unidades. Cada fila tiene su costo unitario y su total.',
            tabla: {
              id: 'hoja',
              cols: ['Elemento', 'Costo unitario', 'Unidades', 'Total'],
              filas: [
                { id: 'mp', modelo: 'La primera fila (en verde) va hecha como modelo: costo unitario = total ÷ unidades = 8.000 ÷ 500 = $ 16.', celdas: [{ t: 'MP' }, { m: 16, tipo: 'unitario' }, { f: 500, tipo: 'unidades' }, { f: 8000, tipo: 'pesos' }] },
                { id: 'mod', celdas: [{ t: 'MOD' }, { r: 24, tipo: 'unitario', s: '12.000 ÷ 500 = $ 24' }, { f: 500, tipo: 'unidades' }, { f: 12000, tipo: 'pesos' }] },
                { id: 'cif', celdas: [{ t: 'CIF aplicado (3,5 veces el costo de la MP)' }, { r: 56, tipo: 'unitario', s: '3,5 × 16 = $ 56' }, { f: 500, tipo: 'unidades' },
                  { r: 28000, tipo: 'pesos', s: '3,5 × 8.000 = $ 28.000', trampas: [{ valor: 42000, propia: true, msg: 'Aquí va el CIF aplicado al trabajo 101: la cuota (3,5) por su costo de MP. No uses la MOD ni los CIF reales del mes.' }] }] },
                { id: 'tot', total: true, celdas: [{ t: '= Costo de producción aplicado' }, { r: 96, tipo: 'unitario', s: '16 + 24 + 56 = $ 96' }, { f: 500, tipo: 'unidades' }, { r: 48000, tipo: 'pesos', s: '8.000 + 12.000 + 28.000 = $ 48.000' }] }
              ]
            }
          },
          {
            titulo: 'B · Sub o sobreaplicación',
            intro: 'Al cierre del mes se conocen los CIF reales. Con ellos se calcula la cuota real y se compara con lo aplicado.',
            preguntas: [
              {
                id: 'p1', texto: 'CIF aplicados al trabajo 101', tipo: 'pesos', respuesta: 28000,
                pista: 'CIF aplicado = cuota × base del trabajo. Aquí la base es el costo de la MP.',
                trampas: [{ valor: 42000, propia: true, msg: 'Piden el CIF aplicado al trabajo 101: la cuota (3,5) por su costo de MP. No uses la MOD ni los CIF reales del mes.' }],
                sol: { d: 'Cuota de asignación predeterminada: 3,5 veces el costo de la MP. MP del trabajo 101: $ 8.000.', f: 'CIF aplicado = cuota × base de la orden', c: '3,5 × 8.000 = $ 28.000' }
              },
              {
                id: 'cuota', texto: 'Cuota de asignación real (cuántas veces el costo de la MP)', tipo: 'numero', unidad: 'veces', respuesta: 3,
                pista: 'Ahora usa los CIF reales y la base real: el costo de MP de los dos trabajos.',
                trampas: [
                  { valor: 3.5, propia: true, msg: 'Esa es la cuota aplicada (la predeterminada). La real se calcula con los CIF reales del mes.' },
                  { valor: 5.25, propia: true, msg: 'La base es el costo de MP de los dos trabajos, no solo el del trabajo 101.' }
                ],
                sol: { d: 'CIF reales: $ 42.000. Base: costo de MP de los dos trabajos = 8.000 + 6.000 = $ 14.000.', f: 'Cuota real = total de CIF reales ÷ base de asignación', c: '42.000 ÷ 14.000 = 3 veces' }
              },
              {
                id: 'cifreal', texto: 'CIF real del trabajo 101', tipo: 'pesos', respuesta: 24000,
                pista: 'Aplica la cuota real al costo de MP del trabajo 101.',
                trampas: [{ valor: 42000, propia: true, msg: 'Esos son los CIF reales de todo el mes. Al trabajo 101 le toca su parte: la cuota real por su costo de MP.' }],
                sol: { d: 'Cuota real: 3 veces el costo de la MP. MP del trabajo 101: $ 8.000.', f: 'CIF real de la orden = cuota real × base de la orden', c: '3 × 8.000 = $ 24.000' }
              },
              {
                id: 'var101', texto: 'Variación del CIF en el trabajo 101', tipo: 'pesos', respuesta: 4000,
                pista: 'Compara lo aplicado con lo real. Si se aplicó más de lo que realmente costó, es sobreaplicación.',
                clasif: { texto: '¿Sub o sobreaplicación?', opciones: SUB_SOBRE, correcta: 1, porque: 'El CIF aplicado ($ 28.000) es mayor que el real ($ 24.000): se aplicó de más, así que es una sobreaplicación.' },
                sol: { d: 'CIF aplicado al trabajo 101: $ 28.000. CIF real: $ 24.000.', f: 'Variación = CIF aplicado − CIF real (aplicado mayor que real: sobreaplicación)', c: '28.000 − 24.000 = $ 4.000 de sobreaplicación ($ 8 por unidad)' }
              },
              {
                id: 'var202', texto: 'Variación del CIF en el trabajo 202', tipo: 'pesos', respuesta: 3000,
                pista: 'Repite el cálculo con la MP del trabajo 202: cuota aplicada 3,5 y cuota real 3.',
                clasif: { texto: '¿Sub o sobreaplicación?', opciones: SUB_SOBRE, correcta: 1, porque: 'El CIF aplicado ($ 21.000) es mayor que el real ($ 18.000): sobreaplicación.' },
                sol: { d: 'Trabajo 202: MP $ 6.000. Cuota aplicada: 3,5 veces. Cuota real: 3 veces.', f: 'Variación = CIF aplicado − CIF real', c: '3,5 × 6.000 − 3 × 6.000 = 21.000 − 18.000 = $ 3.000 de sobreaplicación' }
              },
              {
                id: 'vartotal', texto: 'Variación total del CIF en el período', tipo: 'pesos', respuesta: 7000,
                pista: 'Suma lo aplicado a los dos trabajos y compáralo con los CIF reales del mes.',
                clasif: { texto: '¿Sub o sobreaplicación?', opciones: SUB_SOBRE, correcta: 1, porque: 'Se aplicaron $ 49.000 y los CIF reales fueron $ 42.000: sobreaplicación.' },
                sol: { d: 'CIF aplicados: 28.000 + 21.000 = $ 49.000. CIF reales del período: $ 42.000.', f: 'Variación total = total de CIF aplicados − total de CIF reales', c: '49.000 − 42.000 = $ 7.000 de sobreaplicación (= 4.000 + 3.000)' }
              }
            ]
          },
          {
            titulo: 'Cierra la hoja de costos del trabajo 101',
            intro: 'Con la variación del trabajo 101 se pasa del costo aplicado al costo real.',
            tabla: {
              id: 'real',
              cols: ['Elemento', 'Costo unitario', 'Unidades', 'Total'],
              filas: [
                { id: 'aj', celdas: [{ t: 'Sobreaplicación (se resta)' }, { r: 8, tipo: 'unitario', s: '4.000 ÷ 500 = $ 8 por unidad' }, { f: 500, tipo: 'unidades' }, { r: 4000, tipo: 'pesos', s: 'CIF aplicado 28.000 − CIF real 24.000 = $ 4.000' }] },
                { id: 'real', total: true, celdas: [{ t: '= Costo de producción real' },
                  { r: 88, tipo: 'unitario', s: '96 − 8 = $ 88', trampas: [{ valor: 104, propia: true, msg: 'La sobreaplicación se resta: se aplicó de más, así que el costo real es menor que el aplicado.' }] },
                  { f: 500, tipo: 'unidades' },
                  { r: 44000, tipo: 'pesos', s: '48.000 − 4.000 = $ 44.000', trampas: [{ valor: 52000, propia: true, msg: 'La sobreaplicación se resta: se aplicó de más, así que el costo real es menor que el aplicado.' }] }] }
              ]
            }
          }
        ],
        cierre: '<p><b>La hoja de costos completa del trabajo 101:</b> costo de producción aplicado $ 96 por unidad ($ 48.000) − sobreaplicación $ 8 por unidad ($ 4.000) = costo de producción real $ 88 por unidad ($ 44.000).</p>' +
          '<p>La venta de este trabajo y su estado de resultados siguen en el módulo 5.</p>'
      },

      // ------------------------------------------------------------------ E3.2 (extra, simulacro)
      {
        tipo: 'ejercicio',
        id: 'hunter',
        rol: 'extra',
        simulacro: true,
        area: 'costos',
        titulo: 'Hunter Ltda.: piezas metálicas a pedido',
        fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 2 },
        datos: { u701: 5500, v701: 5500, mpd701: 3500000, mod701: 2800000, p701: 22000, u702: 4500, v702: 3375, mpd702: 5200000, mod702: 4000000, p702: 20000, tasa: 0.8, cifReal: 5500000, baseUnidades: 10000 },
        enunciado: '<p>La empresa "Hunter Ltda." fabrica piezas metálicas especiales bajo pedido, utilizando el sistema de costeo por órdenes de trabajo (órdenes específicas). Durante el mes de mayo de 2026 se procesaron dos órdenes de producción, cuyos antecedentes se presentan a continuación:</p>' +
          '<div class="tabla-scroll"><table class="t-datos"><thead><tr><th scope="col">Detalle</th><th scope="col">Orden N° 701</th><th scope="col">Orden N° 702</th></tr></thead><tbody>' +
          '<tr><th scope="row">Unidades producidas</th><td>5.500 unidades</td><td>4.500 unidades</td></tr>' +
          '<tr><th scope="row">Unidades vendidas</th><td>5.500 unidades (100 %)</td><td>3.375 unidades (75 %)</td></tr>' +
          '<tr><th scope="row">Materia prima directa (MPD)</th><td>$ 3.500.000</td><td>$ 5.200.000</td></tr>' +
          '<tr><th scope="row">Mano de obra directa (MOD)</th><td>$ 2.800.000</td><td>$ 4.000.000</td></tr>' +
          '<tr><th scope="row">Precio de venta unitario neto</th><td>$ 22.000</td><td>$ 20.000</td></tr>' +
          '</tbody></table></div>' +
          '<p>Información adicional del período mayo 2026:</p>' +
          '<ul><li>Tasa predeterminada de CIF: <b>80 %</b> del costo de la mano de obra directa (MOD).</li>' +
          '<li>CIF reales del período (total): <b>$ 5.500.000</b>.</li>' +
          '<li>Método de valorización de inventarios: FIFO.</li>' +
          '<li>Base de asignación, unidades producidas: 10.000 unidades.</li></ul>',
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'CIF aplicados orden N° 702:', tipo: 'pesos', respuesta: 3200000,
                trampas: [{ valor: 4160000, propia: true, msg: 'La tasa se aplica sobre el costo de la MOD, no sobre la MPD.' }],
                sol: { d: 'Tasa predeterminada: 80 % del costo de la MOD. MOD de la orden 702: $ 4.000.000.', f: 'CIF aplicado = tasa × base de la orden', c: '80 % × 4.000.000 = $ 3.200.000' }
              },
              {
                id: 'p2', texto: 'Costos de conversión aplicados totales del período:', tipo: 'pesos', respuesta: 12240000, tolerancia: 1,
                trampas: [
                  { valor: 12300000, propia: true, msg: 'Usaste los CIF reales. Piden la conversión aplicada: va con los CIF aplicados.' },
                  { valor: 5440000, propia: true, msg: 'Ese es solo el CIF aplicado. Al costo de conversión le falta la MOD.' }
                ],
                sol: { d: 'MOD total: 2.800.000 + 4.000.000 = $ 6.800.000. CIF aplicados: 80 % × 6.800.000 = $ 5.440.000.', f: 'Costo de conversión aplicado = MOD + CIF aplicado', c: '6.800.000 + 5.440.000 = $ 12.240.000' }
              },
              {
                id: 'p3', texto: 'Costo total real de producción:', tipo: 'pesos', respuesta: 21000000, tolerancia: 1,
                trampas: [{ valor: 20940000, propia: true, msg: 'Usaste los CIF aplicados. El costo real se arma con los CIF reales.' }],
                sol: { d: 'MPD total: 3.500.000 + 5.200.000 = $ 8.700.000. MOD total: $ 6.800.000. CIF reales: $ 5.500.000.', f: 'Costo total real = MPD + MOD + CIF real', c: '8.700.000 + 6.800.000 + 5.500.000 = $ 21.000.000' }
              },
              {
                id: 'p4', texto: 'Variación del CIF:', tipo: 'pesos', respuesta: 60000,
                clasif: { texto: '¿Sub o sobreaplicación?', opciones: SUB_SOBRE, correcta: 0, porque: 'Los CIF aplicados ($ 5.440.000) son menores que los reales ($ 5.500.000): se aplicó de menos, así que es una subaplicación.' },
                sol: { d: 'CIF aplicados: 80 % × 6.800.000 = $ 5.440.000. CIF reales: $ 5.500.000.', f: 'Variación = CIF aplicado − CIF real (aplicado menor que real: subaplicación)', c: '5.500.000 − 5.440.000 = $ 60.000 de subaplicación' }
              }
            ]
          }
        ],
        cierre: '<p><b>Ojo con los datos que sobran:</b> las unidades, los precios, el método FIFO y la base de 10.000 unidades no se usan en estas cuatro preguntas. La tasa de CIF está definida sobre el costo de la MOD, y eso es lo que manda.</p>'
      },

      // ------------------------------------------------------------------ E3.4 (extra)
      {
        tipo: 'ejercicio',
        id: 'san-san',
        rol: 'extra',
        titulo: 'San-San Ltda.: imprenta',
        fuente: { k: 'certamen', sem: 1, anio: 2023, preg: 3 },
        datos: { mpdU21: 15, mod21: 232100, otros21: 25155, mpdU22: 14, mod22: 58000, otros22: 22840, tasaCif: 0.2, margen: 0.2, cifReal: 155000, mpdDisp: 40, mpdBruto: 15946 },
        enunciado: '<p>El taller imprenta “San-San Ltda.” posee 2 órdenes de trabajo (OT), cada una con su hoja de costos, durante el primer semestre de 2023, las cuales tienen los siguientes requerimientos:</p>' +
          '<div class="tabla-scroll"><table class="t-datos"><thead><tr><th scope="col">OT (hoja de costos)</th><th scope="col">Materia prima directa</th><th scope="col">Mano de obra directa</th><th scope="col">Otros costos directos</th></tr></thead><tbody>' +
          '<tr><th scope="row">21</th><td>15 unidades</td><td>$ 232.100</td><td>$ 25.155</td></tr>' +
          '<tr><th scope="row">22</th><td>14 unidades</td><td>$ 58.000</td><td>$ 22.840</td></tr>' +
          '</tbody></table></div>' +
          '<p>Datos:</p>' +
          '<ul><li>Se venden las OT 21 y 22. Los CIF aplicados corresponden al <b>20 %</b> de los costos directos.</li>' +
          '<li>El precio por unidad es más 20 % del costo total aplicado.</li>' +
          '<li>CIF reales: <b>$ 155.000</b>.</li>' +
          '<li>De materia prima directa (MPD) hay 40 unidades disponibles, que fueron adquiridas a valor bruto de <b>$ 15.946</b> cada una.</li></ul>',
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Costos indirectos aplicados en el primer semestre de 2023?', tipo: 'pesos', respuesta: 145339,
                trampas: [{ valor: 160106, propia: true, msg: 'Usaste el valor bruto de la MPD. Al costo va el valor neto: el bruto dividido por 1,19.' }],
                sol: { d: 'MPD a valor neto: 15.946 ÷ 1,19 = $ 13.400 por unidad. Costos directos de la OT 21: 15 × 13.400 + 232.100 + 25.155 = $ 458.255. OT 22: 14 × 13.400 + 58.000 + 22.840 = $ 268.440. Total: $ 726.695.', f: 'CIF aplicado = 20 % × costos directos', c: '20 % × 726.695 = $ 145.339' }
              },
              {
                id: 'p2', texto: '¿CIF reales?', tipo: 'pesos', respuesta: 155000,
                trampas: [{ valor: 145339, propia: true, msg: 'Esos son los CIF aplicados. Los reales son los efectivamente incurridos: los entrega el enunciado.' }],
                sol: { d: 'El enunciado los entrega directamente: CIF reales $ 155.000.', f: 'Los CIF reales no se calculan: son los efectivamente incurridos en el período', c: '$ 155.000 (mayores que los aplicados, $ 145.339)' }
              },
              {
                id: 'p3', texto: '¿Ingresos por ventas (valor neto)?', tipo: 'pesos', respuesta: 1046441,
                tambien: [{ valor: 1046440, nota: 'La pauta acepta los dos valores: $ 1.046.441 (redondeando 1.046.440,8) o $ 1.046.440 (sin los decimales).' }],
                sol: { d: 'Costo total aplicado: costos directos 726.695 + CIF aplicados 145.339 = $ 872.034. El precio es el costo total aplicado más 20 %.', f: 'Ingresos netos = costo total aplicado × 1,20', c: '872.034 × 1,20 = 1.046.440,8 → $ 1.046.441' }
              },
              {
                id: 'p4', texto: '¿Margen bruto del semestre?', tipo: 'pesos', respuesta: 164746,
                tambien: [{ valor: 164745, nota: 'La pauta acepta los dos valores: $ 164.745 sale de usar ingresos de $ 1.046.440.' }],
                trampas: [{ valor: 174407, propia: true, msg: 'Te faltó el ajuste. Hay subaplicación (CIF reales mayores que los aplicados) y se suma al costo de venta.' }],
                sol: { d: 'Ingresos netos: $ 1.046.441. Costo de venta real (se vendió todo): costos directos 726.695 + CIF reales 155.000 = $ 881.695. Es el costo aplicado ($ 872.034) más la subaplicación ($ 9.661).', f: 'Margen bruto = ingresos netos − costo de venta ajustado (aplicado + subaplicación)', c: '1.046.441 − 881.695 = $ 164.746' }
              },
              {
                id: 'p5', texto: '¿Costo real de producción del semestre?', tipo: 'pesos', respuesta: 881695,
                trampas: [{ valor: 872034, propia: true, msg: 'Ese es el costo aplicado. El costo real usa los CIF reales, no los aplicados.' }],
                sol: { d: 'Costos directos: $ 726.695. CIF reales: $ 155.000.', f: 'Costo real de producción = costos directos + CIF reales', c: '726.695 + 155.000 = $ 881.695' }
              }
            ]
          }
        ],
        cierre: '<p><b>Dos detalles de este ejercicio:</b> la MPD se compró a valor bruto, así que primero hay que sacarle el IVA (15.946 ÷ 1,19 = $ 13.400). Y como los CIF reales ($ 155.000) son mayores que los aplicados ($ 145.339), hay una subaplicación de $ 9.661 que se suma al costo de venta.</p>'
      },

      // ------------------------------------------------------------------ E3.3 (extra, difícil)
      {
        tipo: 'ejercicio',
        id: 'six-spa',
        rol: 'extra',
        etiqueta: 'Ejercicio difícil',
        titulo: 'Six SpA: máquinas de gimnasio',
        fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 3 },
        datos: { u1: 500, mpU1: 1000, mo1: 15000000, cifReal1: 60000000, u2: 200, mpU2: 500, mo2: 12000000, cifReal2: 20000000, tasa1: 2.5, tasa2: 2, siU: 500, siP: 20000, c1U: 700, c1P: 24000, c2U: 500, c2P: 23000, _ventas: 250000000 },
        enunciado: '<p>La empresa “Six SpA” se dedica a la elaboración de máquinas de gimnasio de acuerdo con requerimientos de clientes. Durante el mes de octubre se recibieron dos requerimientos, cuyas hojas de costo se detallan a continuación:</p>' +
          '<div class="tabla-scroll"><table class="t-datos"><thead><tr><th scope="col"></th><th scope="col">Orden 1</th><th scope="col">Orden 2</th></tr></thead><tbody>' +
          '<tr><th scope="row">Unidades producidas y vendidas</th><td>500</td><td>200</td></tr>' +
          '<tr><th scope="row">Materia prima utilizada</th><td>1.000 unidades</td><td>500 unidades</td></tr>' +
          '<tr><th scope="row">Mano de obra utilizada</th><td>$ 15.000.000</td><td>$ 12.000.000</td></tr>' +
          '<tr><th scope="row">CIF aplicados</th><td>¿?</td><td>¿?</td></tr>' +
          '<tr><th scope="row">CIF reales</th><td>$ 60.000.000</td><td>$ 20.000.000</td></tr>' +
          '</tbody></table></div>' +
          '<p>Los CIF se aplican en una proporción de <b>$ 2,5 por cada $ 1</b> de materia prima utilizada para la orden 1 y de <b>$ 2 por cada $ 1</b> de materia prima utilizada para la orden 2.</p>' +
          '<p>Adicionalmente se tiene la siguiente información del inventario de materias primas:</p>' +
          '<ul><li>Saldo inicial: 500 unidades a un valor de $ 20.000 cada unidad.</li>' +
          '<li>Compra del 05 de octubre: 700 unidades a $ 24.000 cada unidad más IVA.</li>' +
          '<li>Compra del 10 de octubre: 500 unidades a $ 23.000 cada unidad más IVA.</li></ul>' +
          '<p>Nota: el método de valorización de existencias de la empresa es LIFO (último en entrar, primero en salir). La orden 1 es previa a la orden 2.</p>',
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Determinar el valor de la variación entre los CIF aplicados y CIF reales de la orden 1:', tipo: 'pesos', respuesta: 1250000,
                clasif: { texto: '¿Sub o sobreaplicación?', opciones: SUB_SOBRE, correcta: 0, porque: 'Los CIF aplicados a la orden 1 ($ 58.750.000) son menores que los reales ($ 60.000.000): subaplicación.' },
                trampas: [{ valor: 5000000, propia: true, msg: 'Usaste FIFO. Con LIFO sale primero lo último que entró: las compras más recientes.' }],
                sol: { d: 'Las compras son “más IVA”: al costo va el valor neto. Con LIFO, la orden 1 (1.000 unidades de MP) consume lo último que entró: 500 a $ 23.000 y 500 a $ 24.000 = $ 23.500.000. CIF reales de la orden 1: $ 60.000.000.', f: 'CIF aplicado = $ 2,5 × costo de la MP utilizada; variación = aplicado versus real', c: '2,5 × 23.500.000 = 58.750.000; 60.000.000 − 58.750.000 = $ 1.250.000 de subaplicación' }
              },
              {
                id: 'p2', texto: 'Determinar el valor de la variación entre los CIF aplicados y CIF reales del período:', tipo: 'pesos', respuesta: 350000,
                clasif: { texto: '¿Sub o sobreaplicación?', opciones: SUB_SOBRE, correcta: 1, porque: 'En el período se aplicaron $ 80.350.000 y los CIF reales fueron $ 80.000.000: sobreaplicación.' },
                sol: { d: 'MP de la orden 2 (500 unidades, LIFO sobre lo que queda): 200 a $ 24.000 + 300 a $ 20.000 = $ 10.800.000. CIF aplicados: orden 1 $ 58.750.000; orden 2: 2 × 10.800.000 = $ 21.600.000. CIF reales: 60.000.000 + 20.000.000 = $ 80.000.000.', f: 'Variación del período = total de CIF aplicados − total de CIF reales', c: '58.750.000 + 21.600.000 = 80.350.000; 80.350.000 − 80.000.000 = $ 350.000 de sobreaplicación' }
              },
              {
                id: 'p3', texto: '¿Cuál es el costo de producción aplicado del período?', tipo: 'pesos', respuesta: 141650000, tolerancia: 1,
                trampas: [{ valor: 141300000, propia: true, msg: 'Usaste los CIF reales. Piden el costo aplicado: va con los CIF aplicados.' }],
                sol: { d: 'MP utilizada: 23.500.000 + 10.800.000 = $ 34.300.000. Mano de obra: 15.000.000 + 12.000.000 = $ 27.000.000. CIF aplicados: $ 80.350.000.', f: 'Costo de producción aplicado = MP + mano de obra + CIF aplicados', c: '34.300.000 + 27.000.000 + 80.350.000 = $ 141.650.000' }
              },
              {
                id: 'p4', texto: '¿Cuál es el valor del inventario de materias primas al final del período?', tipo: 'pesos', respuesta: 4000000,
                trampas: [{ valor: 4600000, propia: true, msg: 'Eso sale con FIFO. Con LIFO lo que queda en bodega es lo más antiguo: unidades del saldo inicial.' }],
                sol: { d: 'Había 500 + 700 + 500 = 1.700 unidades y se usaron 1.000 + 500 = 1.500: quedan 200. Con LIFO queda lo más antiguo, es decir, unidades del saldo inicial a $ 20.000.', f: 'Inventario final de MP = unidades que quedan × su costo', c: '200 × 20.000 = $ 4.000.000' }
              },
              {
                id: 'p5', texto: 'Si la sub aplicación o la sobre aplicación se ajusta al costo de venta, ¿cuál es el margen bruto del período, si la suma de la venta de ambas órdenes es de $ 250.000.000?', tipo: 'pesos', respuesta: 108700000, tolerancia: 1,
                trampas: [
                  { valor: 108350000, propia: true, msg: 'Te faltó el ajuste. La sobreaplicación del período se resta al costo de venta.' },
                  { valor: 108000000, propia: true, msg: 'La sobreaplicación se resta al costo de venta, no se suma: se había aplicado de más.' }
                ],
                sol: { d: 'Ventas: $ 250.000.000. Costo de producción aplicado (todo se vendió): $ 141.650.000. Sobreaplicación del período: $ 350.000.', f: 'Margen bruto = ventas − (costo de venta aplicado − sobreaplicación)', c: '250.000.000 − (141.650.000 − 350.000) = 250.000.000 − 141.300.000 = $ 108.700.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>El orden que conviene seguir:</b> primero la materia prima de cada orden con LIFO (orden 1: $ 23.500.000; orden 2: $ 10.800.000), después los CIF aplicados de cada una y recién entonces las variaciones. El inventario final sale de lo que quedó sin usar: 200 unidades del saldo inicial.</p>'
      },

      // ------------------------------------------------------------------ VF3.A
      {
        tipo: 'vf',
        id: 'vf-ordenes',
        titulo: 'Verdadero o falso: órdenes específicas y CIF',
        items: [
          { id: 'a1', af: 'En el costeo por órdenes de trabajo (órdenes específicas), los costos pueden acumularse e identificarse para cada pedido o lote específico solicitado por un cliente.', r: true, porque: 'En órdenes específicas cada pedido tiene su hoja de costos, donde se acumula lo que costó.', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1 } },
          { id: 'a2', af: 'En el sistema de costeo por órdenes específicas u órdenes de trabajo, los costos indirectos de fabricación reales se conocen completamente antes de finalizar el período.', r: false, porque: 'Los CIF reales se conocen recién al final del período. Por eso se usan CIF aplicados, calculados con una cuota predeterminada.', fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 1, tb: '2º semestre 2024' } },
          { id: 'a3', af: 'Cuando los costos indirectos de fabricación reales son mayores que los costos indirectos aplicados, se produce una sobreaplicación.', r: false, porque: 'Real mayor que aplicado significa que se aplicó de menos: es una subaplicación.', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1 } },
          { id: 'a4', af: 'La sobreaplicación del costo indirecto de fabricación ocurre cuando la estimación (predeterminación) del costo es inferior al costo resultante o real.', r: false, porque: 'Si la estimación (lo aplicado) es inferior al costo real, hay subaplicación. La sobreaplicación es al revés: aplicado mayor que real.', fuente: { k: 'certamen', sem: 1, anio: 2022, preg: 1 } },
          { id: 'a5', af: 'Los costos por orden de fabricación son propios de aquellas empresas cuyos costos se pueden identificar con el producto en cada orden de trabajo (hoja de costos) en particular.', r: true, porque: 'Esa es la característica del sistema: cada orden de trabajo tiene su propia hoja de costos.', fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 1, tb: '2º semestre 2022' } }
        ]
      },

      // ------------------------------------------------------------------ MC3.B
      {
        tipo: 'mc',
        id: 'mc-resultado',
        titulo: 'Selección múltiple: resultado con sobreaplicación',
        items: [
          {
            id: 'm1',
            enunciado: 'Si una empresa realiza costeo por órdenes de trabajo y vende la orden solicitada por el cliente en $ 10.000.000, el costo de producción aplicado es de $ 5.000.000 y al final del ejercicio se determina una sobreaplicación de los CIF de $ 1.000.000, ¿cuál es el resultado del ejercicio?',
            opciones: ['$ 5.000.000', '$ 4.000.000', '$ 10.000.000', '$ 6.000.000'],
            correcta: 3,
            porque: 'La sobreaplicación se resta al costo: costo real = 5.000.000 − 1.000.000 = $ 4.000.000. Resultado = 10.000.000 − 4.000.000 = $ 6.000.000.',
            fuente: { k: 'certamen', sem: 1, anio: 2022, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ Resumen
      {
        tipo: 'resumen',
        id: 'resumen',
        titulo: 'Resumen del módulo 3',
        formulas: [
          'Cuota de asignación = CIF presupuestados ÷ base de asignación',
          'CIF aplicado = cuota × base de la orden',
          'Aplicado mayor que real: sobreaplicación (se resta al costo de venta).',
          'Aplicado menor que real: subaplicación (se suma al costo de venta).'
        ],
        asi: [
          '«¿CIF aplicados a la orden X?» → tasa × base de esa orden.',
          '«¿Costos de conversión aplicados?» → MOD + CIF aplicado.',
          '«¿Costo total real?» → MPD + MOD + CIF <b>real</b>.',
          '«¿Variación del CIF?» → aplicado versus real, indicando si es sub o sobreaplicación.',
          '«¿Margen bruto con el ajuste al costo de venta?» → ventas − (costo aplicado − sobreaplicación, o + subaplicación).'
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
