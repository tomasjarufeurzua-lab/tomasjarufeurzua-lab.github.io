// MÓDULO 5 — Costeo total (absorción) vs costeo directo (variable).
// Solo contenido. Convenciones de texto: **negrita**, {{numerador // denominador}} = fracción, HTML simple.
// En cada ejercicio, "datos" guarda los números crudos del enunciado: de ahí recalcula el script de verificación.
// Las claves de "datos" que empiezan con "_" son datos que el certamen entrega dentro de la pregunta (no en el enunciado).
(function (g) {
  'use strict';

  var NOTA_075_TOTAL = 'Ese valor sale de multiplicar directo por 0,75 (27.350 × 0,75 = 20.512,5 → 20.513). En la resolución del profesor se redondea primero el impuesto ($ 6.838) y después se resta: 27.350 − 6.838 = 20.512.';
  var NOTA_075_DIRECTO = 'Ese valor sale de multiplicar directo por 0,75 (17.750 × 0,75 = 13.312,5 → 13.313). En la resolución del profesor se redondea primero el impuesto ($ 4.438) y después se resta: 17.750 − 4.438 = 13.312.';

  var UEFA_TABLA = {
    cols: ['Ítems', 'Montos unitarios por balón (USD)'],
    filas: [
      ['Precio', '250'],
      ['Costo variable de producción', '100'],
      ['Gastos de administración y ventas', '50']
    ],
    pie: 'Otros datos de octubre 2023: ventas 5.000 unidades · costos fijos USD 45.000 · tasa de impuesto a la renta 27 %. Se pide omitir el IVA.'
  };

  g.ICOFI_C3.modulos.push({
    id: 'total-directo',
    n: 5,
    titulo: 'Costeo total (absorción) vs costeo directo (variable)',
    corto: 'Costeo total vs directo',
    meta: 'Dos formas de armar el estado de resultados. Lo único que cambia es qué se hace con los costos fijos de producción.',
    bloques: [

      // ------------------------------------------------------------------ L5.1
      {
        tipo: 'leccion',
        id: 'la-diferencia',
        titulo: 'La única diferencia: qué pasa con los costos fijos de producción',
        idea: 'En costeo total, los costos fijos de producción se guardan en el inventario hasta que el producto se vende. En costeo directo, se van completos al resultado del mes.',
        partes: [
          { k: 'practica', h: 'Una fábrica paga $ 1.000.000 de arriendo de planta. Produce 100 mesas y vende 60. Con <b>costeo total</b>, $ 400.000 del arriendo quedan “guardados” en las 40 mesas que siguen en bodega. Con <b>costeo directo</b>, el millón completo va al resultado del período.' },
          { k: 'comparar', cols: ['', 'Costeo total (absorción)', 'Costeo directo (variable)'], filas: [
            ['¿Qué costos lleva el producto?', 'Todos los de producción: fijos y variables.', 'Solo los variables de producción.'],
            ['¿Y los costos fijos de producción?', 'Quedan en el inventario hasta que el producto se vende.', 'Van completos al resultado del período.'],
            ['¿Qué margen muestra?', '<b>Margen bruto</b> = ventas − costo de venta.', '<b>Margen de contribución</b> = ventas − costos variables.'],
            ['¿Dónde se usa?', 'Es el exigido para los estados financieros y para efectos tributarios.', 'Es la base del análisis costo–volumen–utilidad (módulo 6).']
          ] },
          { k: 'sub', h: 'Los dos formatos de estado de resultados (EERR)' },
          { k: 'datos', cols: ['Costeo total', 'Costeo directo'], filas: [
            ['Ventas', 'Ventas'],
            ['− Costo de venta', '− Costos variables (de producción y de otras áreas)'],
            ['= Margen bruto', '= Margen de contribución'],
            ['− Gastos operacionales', '− Costos fijos (de producción y de otras áreas)'],
            ['= Resultado operacional', '= Resultado operacional']
          ] },
          { k: 'p', h: '**¿Cuándo dan lo mismo?** Si se vende todo lo producido, los dos resultados coinciden. Si queda inventario, el costeo total muestra más resultado, porque guarda costos fijos en bodega.' },
          { k: 'formula', h: 'Diferencia de resultados = unidades que quedan en inventario × costo fijo de producción por unidad' },
          { k: 'asi', items: [
            'Verdadero o falso de definición: ¿cuál de los dos usa solo la parte variable del costo para el costo de venta? → el <b>costeo directo</b>.',
            '«¿Resultado operacional por costeo directo?» → margen de contribución − <b>todos</b> los costos fijos (también los de producción).',
            '«¿Valor del inventario por costeo directo?» → unidades × costo <b>variable</b> de producción.'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué el costeo total muestra más resultado que el directo cuando queda inventario sin vender?',
          opciones: [
            'Porque en costeo total los gastos de administración y ventas no se restan.',
            'Porque guarda en el inventario los costos fijos de producción de las unidades no vendidas, en vez de llevarlos al resultado del período.',
            'Porque en costeo total las ventas se registran con IVA.',
            'Porque en costeo directo los costos variables se restan dos veces.'
          ],
          correcta: 1,
          porque: 'Los costos fijos de producción de las unidades que siguen en bodega quedan en el inventario (un activo) hasta que se vendan. En costeo directo esos mismos costos fijos se restan completos en el período, por eso su resultado es menor.'
        }
      },

      // ------------------------------------------------------------------ E5.1
      {
        tipo: 'ejercicio',
        id: 'palitos-venta',
        titulo: 'Palitos: la venta del trabajo 101, por los dos métodos',
        fuente: { k: 'taller', ej: 1, nota: 'partes C y D' },
        datos: { cuota: 3.5, mp101: 8000, mod101: 12000, mp202: 6000, mod202: 8000, u101: 500, u202: 800, cifReales: 42000, adm: 10000, gastoVenta: 0.15, vendidas: 300, precioBruto: 297.5, impuesto: 0.25 },
        enunciado: '<p>La compañía manufacturera “Palitos” usa un sistema de costos por órdenes específicas y completó dos hojas de costos en octubre de 2026. Su cuota de asignación predeterminada de costos indirectos de fabricación (CIF) es de <b>3,5 veces el costo de la materia prima</b>.</p>',
        tablaDatos: {
          cols: ['', 'Trabajo 101', 'Trabajo 202'],
          filas: [
            ['Costo de la materia prima (MP)', '$ 8.000', '$ 6.000'],
            ['Costo de la mano de obra directa (MOD)', '$ 12.000', '$ 8.000'],
            ['Horas de MOD', '8.000', '6.000'],
            ['Horas máquina', '2.500', '1.500'],
            ['Unidades producidas', '500', '800']
          ],
          pie: 'CIF reales del mes: $ 42.000 (todos fijos). Para el trabajo 101: gastos administrativos $ 10.000 (fijos) y gastos de ventas de 15 % de la venta. Del trabajo 101 se venden 300 unidades a $ 297,5 IVA incluido cada una, antes de conocer los CIF reales. La diferencia entre CIF aplicados y CIF reales se ajusta al costo de venta. Impuesto a la renta: 25 %.'
        },
        partes: [
          {
            titulo: 'Punto de partida: el costo unitario del trabajo 101',
            modelo: 'MP: 8.000 ÷ 500 = <b>$ 16</b> · MOD: 12.000 ÷ 500 = <b>$ 24</b> · CIF aplicado: 3,5 × 16 = <b>$ 56</b> → costo aplicado <b>$ 96</b> por unidad.<br>Cuota real: 42.000 ÷ (8.000 + 6.000) = 3 veces → CIF real: 3 × 16 = <b>$ 48</b> por unidad → se aplicaron $ 8 de más por unidad (sobreaplicación).<br>Precio neto: 297,5 ÷ 1,19 = <b>$ 250</b>.',
            nota: 'Este paso va hecho como modelo (es la hoja de costos del módulo 3). Con esos unitarios armas los dos estados de resultados.'
          },
          {
            titulo: 'Estado de resultados real por costeo total',
            intro: 'Octubre 2026, nivel de actividad: 300 unidades vendidas. Todos los montos se escriben en positivo; el signo lo indica el nombre de la fila.',
            tabla: {
              id: 'total',
              cols: ['Costeo total', 'Monto'],
              filas: [
                { id: 'ventas', modelo: 'La primera fila (en verde) va hecha como modelo: 300 u × $ 250 de precio neto.', celdas: [{ t: 'Ventas' }, { m: 75000, tipo: 'pesos' }] },
                { id: 'cvapl', celdas: [{ t: '− Costo de venta con CIF aplicados' }, { r: 28800, tipo: 'pesos', s: '300 u × $ 96 = $ 28.800', trampas: [{ valor: 48000, propia: true, msg: 'Usaste las 500 unidades producidas. El costo de venta es solo de las 300 vendidas; el costo de las otras 200 queda en inventario.' }] }] },
                { id: 'ajuste', celdas: [{ t: 'Ajuste por sobreaplicación de CIF (se resta al costo de venta)' }, { r: 2400, tipo: 'pesos', s: '300 u × $ 8 = $ 2.400' }] },
                { id: 'cvreal', celdas: [{ t: '= Costo de venta real' }, { r: 26400, tipo: 'pesos', s: '28.800 − 2.400 = $ 26.400' }] },
                { id: 'mb', total: true, celdas: [{ t: '= Margen bruto' }, { r: 48600, tipo: 'pesos', s: '75.000 − 26.400 = $ 48.600' }] },
                { id: 'adm', celdas: [{ t: '− Gastos de administración' }, { f: 10000, tipo: 'pesos' }] },
                { id: 'gv', celdas: [{ t: '− Gastos de venta (15 % de la venta)' }, { r: 11250, tipo: 'pesos', s: '15 % × 75.000 = $ 11.250 ($ 37,5 por unidad)', trampas: [{ valor: 13388, propia: true, msg: 'Calculaste el 15 % sobre el precio con IVA. En el estado de resultados todo va con valores netos: 15 % de $ 75.000.' }] }] },
                { id: 'ro', total: true, celdas: [{ t: '= Resultado operacional' }, { r: 27350, tipo: 'pesos', s: '48.600 − 10.000 − 11.250 = $ 27.350' }] },
                { id: 'imp', celdas: [{ t: '− Impuesto a la renta (25 %)' }, { r: 6838, tipo: 'pesos', s: '25 % × 27.350 = 6.837,5 → $ 6.838' }] },
                { id: 'rdi', total: true, celdas: [{ t: '= Resultado después de impuesto' }, { r: 20512, tipo: 'pesos', s: '27.350 − 6.838 = $ 20.512', casi: [{ valor: 20513, nota: NOTA_075_TOTAL }] }] }
              ]
            }
          },
          {
            titulo: 'Estado de resultados real por costeo directo',
            intro: 'Ahora el producto lleva solo los costos variables: MP + MOD = $ 40 por unidad. Los CIF son todos fijos, así que van como costo fijo del período.',
            tabla: {
              id: 'directo',
              cols: ['Costeo directo', 'Monto'],
              filas: [
                { id: 'ventas', celdas: [{ t: 'Ventas' }, { f: 75000, tipo: 'pesos' }] },
                { id: 'cvp', celdas: [{ t: '− Costos variables de producción' }, { r: 12000, tipo: 'pesos', s: '300 u × $ 40 = $ 12.000', trampas: [{ valor: 28800, propia: true, msg: 'Usaste el costo completo de $ 96. En costeo directo el producto lleva solo los costos variables: MP + MOD = $ 40 por unidad.' }] }] },
                { id: 'cvv', celdas: [{ t: '− Costos variables de venta (15 % de la venta)' }, { r: 11250, tipo: 'pesos', s: '15 % × 75.000 = $ 11.250' }] },
                { id: 'mc', total: true, celdas: [{ t: '= Margen de contribución' }, { r: 51750, tipo: 'pesos', s: '75.000 − 12.000 − 11.250 = $ 51.750 ($ 172,5 por unidad)' }] },
                { id: 'cif', celdas: [{ t: '− Costos fijos de producción (CIF reales)' }, { r: 24000, tipo: 'pesos', s: '500 u producidas × $ 48 = $ 24.000', trampas: [
                  { valor: 14400, propia: true, msg: 'Cargaste los CIF fijos solo por las 300 unidades vendidas. En costeo directo van completos, por las 500 unidades producidas.' },
                  { valor: 28000, propia: true, msg: 'Esos son los CIF aplicados ($ 56 × 500). En el estado de resultados real van los CIF reales: $ 48 × 500.' }
                ] }] },
                { id: 'adm', celdas: [{ t: '− Costos fijos de administración' }, { f: 10000, tipo: 'pesos' }] },
                { id: 'ro', total: true, celdas: [{ t: '= Resultado operacional' }, { r: 17750, tipo: 'pesos', s: '51.750 − 24.000 − 10.000 = $ 17.750' }] },
                { id: 'imp', celdas: [{ t: '− Impuesto a la renta (25 %)' }, { r: 4438, tipo: 'pesos', s: '25 % × 17.750 = 4.437,5 → $ 4.438' }] },
                { id: 'rdi', total: true, celdas: [{ t: '= Resultado después de impuesto' }, { r: 13312, tipo: 'pesos', s: '17.750 − 4.438 = $ 13.312', casi: [{ valor: 13313, nota: NOTA_075_DIRECTO }] }] }
              ]
            }
          },
          {
            titulo: 'La pregunta clave',
            preguntas: [
              {
                id: 'dif', texto: '¿En cuánto difieren los dos resultados operacionales reales?', tipo: 'pesos', respuesta: 9600,
                pista: 'Resta los dos resultados operacionales y piensa qué pasó con las 200 unidades que no se vendieron.',
                clasif: {
                  texto: '¿De dónde sale esa diferencia?',
                  opciones: [
                    'De los CIF fijos de las 200 unidades no vendidas, que en costeo total quedan en inventario',
                    'De los gastos de venta, que solo se restan en costeo directo',
                    'Del impuesto, que se calcula distinto en cada método',
                    'Del ajuste por sobreaplicación, que solo existe en costeo total'
                  ],
                  correcta: 0,
                  porque: 'Quedaron 200 unidades en bodega y cada una lleva $ 48 de CIF fijos: 200 × 48 = $ 9.600. En costeo total ese monto queda en el inventario; en costeo directo va completo al resultado.'
                },
                sol: { d: 'Resultado operacional real: $ 27.350 por costeo total y $ 17.750 por costeo directo. No se vendieron 200 de las 500 unidades; CIF fijo real: $ 48 por unidad.', f: 'Diferencia = unidades en inventario × costo fijo de producción por unidad', c: '27.350 − 17.750 = $ 9.600, que es lo mismo que 200 × 48 = $ 9.600' }
              }
            ]
          },
          {
            titulo: 'Al momento de la venta (antes de conocer los CIF reales)',
            intro: 'Es la parte C del taller. Cuando se vende, todavía no se conocen los CIF reales: se trabaja con los CIF aplicados ($ 56 por unidad) y sin ajuste.',
            preguntas: [
              {
                id: 'ctotal', texto: 'Resultado operacional al momento de la venta, por <b>costeo total</b>', tipo: 'pesos', respuesta: 24950,
                pista: 'El costo de venta es el aplicado ($ 96 por unidad), sin el ajuste de $ 8.',
                sol: { d: 'Ventas $ 75.000. Costo de venta aplicado: 300 × 96 = $ 28.800. Gastos de administración $ 10.000 y de venta $ 11.250.', f: 'Resultado operacional = ventas − costo de venta − gastos operacionales', c: '75.000 − 28.800 = 46.200 de margen bruto ($ 154 por unidad); 46.200 − 10.000 − 11.250 = $ 24.950' }
              },
              {
                id: 'cdirecto', texto: 'Resultado operacional al momento de la venta, por <b>costeo directo</b>', tipo: 'pesos', respuesta: 13750,
                pista: 'Los CIF fijos aplicados se cargan por todas las unidades producidas, no por las vendidas.',
                trampas: [{ valor: 24950, propia: true, msg: 'Cargaste los CIF fijos solo por las 300 unidades vendidas ($ 56 × 300), y por eso te dio lo mismo que el costeo total. En costeo directo van por las 500 unidades producidas.' }],
                sol: { d: 'Margen de contribución $ 51.750 ($ 172,5 por unidad). CIF fijos aplicados: $ 56 por unidad, por las 500 unidades producidas. Administración $ 10.000.', f: 'Resultado operacional = margen de contribución − costos fijos de producción − costos fijos de administración', c: '51.750 − 56 × 500 − 10.000 = 51.750 − 28.000 − 10.000 = $ 13.750' }
              }
            ]
          }
        ],
        cierre: '<h3>Los dos estados de resultados reales, lado a lado</h3>' +
          '<div class="tabla-scroll"><table class="t-datos"><thead><tr><th>Octubre 2026 · 300 unidades vendidas</th><th>Costeo total</th><th>Costeo directo</th></tr></thead><tbody>' +
          '<tr><th scope="row">Ventas</th><td>75.000</td><td>75.000</td></tr>' +
          '<tr><th scope="row">− Costo de venta real / − Costos variables</th><td>(26.400)</td><td>(23.250)</td></tr>' +
          '<tr><th scope="row">= Margen bruto / = Margen de contribución</th><td>48.600</td><td>51.750</td></tr>' +
          '<tr><th scope="row">− Gastos operacionales / − Costos fijos</th><td>(21.250)</td><td>(34.000)</td></tr>' +
          '<tr class="total"><th scope="row">= Resultado operacional</th><td>27.350</td><td>17.750</td></tr>' +
          '<tr><th scope="row">− Impuesto a la renta (25 %)</th><td>(6.838)</td><td>(4.438)</td></tr>' +
          '<tr class="total"><th scope="row">= Resultado después de impuesto</th><td>20.512</td><td>13.312</td></tr>' +
          '</tbody></table></div>' +
          '<p>La diferencia de $ 9.600 en el resultado operacional son los CIF fijos de las 200 unidades no vendidas (200 × $ 48): en costeo total quedan en el inventario; en costeo directo van al resultado. En costeo directo, los CIF fijos siempre se cargan por las <b>500 unidades producidas</b>, no por las 300 vendidas.</p>' +
          '<h3>Sobre el redondeo del impuesto</h3>' +
          '<p>Como en la resolución de clase, primero se redondea el impuesto a pesos enteros y después se resta: 27.350 − 6.838 = $ 20.512. Si multiplicas directo por 0,75 obtienes 20.512,5 → $ 20.513, que queda cerca pero no es la respuesta: vale la del profesor, $ 20.512 (lo mismo con $ 13.312 y no $ 13.313).</p>'
      },

      // ------------------------------------------------------------------ E5.2 (extra)
      {
        tipo: 'ejercicio',
        id: 'sixpa',
        rol: 'extra',
        titulo: 'Sixpa SpA: absorción y costeo directo',
        fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 3, nota: 'caso 2' },
        datos: { mp: 25000000, mo: 45000000, cif: 14000000, cifFijo: 0.5, gav: 10000000, gavFijo: 0.4, _producidas: 10000, _ventas: 100000000, _vendidas: 5000 },
        enunciado: '<p>La empresa “Sixpa SpA” presenta la siguiente información de costos del primer semestre 2024:</p>' +
          '<ul><li>Materia prima: <b>$ 25.000.000</b></li>' +
          '<li>Mano de obra: <b>$ 45.000.000</b></li>' +
          '<li>Costos indirectos de fabricación (CIF): <b>$ 14.000.000</b> (50 % fijo y 50 % variable)</li>' +
          '<li>Gastos de administración y ventas: <b>$ 10.000.000</b> (40 % fijo y 60 % variable)</li></ul>',
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Cuál es el costo primo de la empresa?', tipo: 'pesos', respuesta: 70000000,
                trampas: [{ valor: 59000000, propia: true, msg: 'Sumaste mano de obra más CIF: ese es el costo de conversión. El costo primo es materia prima + mano de obra.' }],
                sol: { d: 'Materia prima $ 25.000.000. Mano de obra $ 45.000.000.', f: 'Costo primo = materia prima directa + mano de obra directa', c: '25.000.000 + 45.000.000 = $ 70.000.000' }
              },
              {
                id: 'p2', texto: '¿Cuál es el costo unitario de producción si las unidades producidas son 10.000 y la empresa utiliza costeo por absorción total?', tipo: 'pesos', respuesta: 8400,
                trampas: [
                  { valor: 9400, propia: true, msg: 'Incluiste los gastos de administración y ventas. No son costo de producción: van como gasto del período.' },
                  { valor: 7700, propia: true, msg: 'Dejaste fuera los CIF fijos: eso es costeo directo. En absorción total el producto lleva todos los costos de producción, fijos y variables.' }
                ],
                sol: { d: 'Costos de producción: materia prima $ 25.000.000, mano de obra $ 45.000.000 y CIF $ 14.000.000 (completos, fijos y variables). Unidades producidas: 10.000.', f: 'Costo unitario por absorción = (MP + MO + CIF) ÷ unidades producidas', c: '(25.000.000 + 45.000.000 + 14.000.000) ÷ 10.000 = 84.000.000 ÷ 10.000 = $ 8.400' }
              },
              {
                id: 'p3', texto: 'Si los ingresos por venta son de $ 100.000.000 por la mitad de la producción. ¿Cuál es el resultado operacional de la venta de las 5.000 unidades, si la empresa utiliza costeo directo?', tipo: 'pesos', respuesta: 44500000,
                trampas: [{ valor: 48000000, propia: true, msg: 'Ese es el resultado por costeo total (100.000.000 − 5.000 × 8.400 − 10.000.000). En costeo directo los CIF fijos van completos al resultado, no solo los de las unidades vendidas.' }],
                sol: { d: 'Costo variable de producción por unidad: (25.000.000 + 45.000.000 + 7.000.000) ÷ 10.000 = $ 7.700. Gastos variables de administración y ventas: 60 % × 10.000.000 = $ 6.000.000. Costos fijos: CIF 7.000.000 + administración y ventas 4.000.000.', f: 'Resultado operacional = ventas − costos variables − costos fijos', c: '100.000.000 − 7.700 × 5.000 − 6.000.000 = 55.500.000 de margen de contribución; 55.500.000 − (7.000.000 + 4.000.000) = $ 44.500.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Fíjate en la diferencia:</b> por costeo total el resultado sería 100.000.000 − 5.000 × 8.400 − 10.000.000 = $ 48.000.000. Los $ 3.500.000 de diferencia son los CIF fijos de las 5.000 unidades no vendidas (5.000 × $ 700), que en costeo total quedan en el inventario.</p>'
      },

      // ------------------------------------------------------------------ E5.3 (extra)
      {
        tipo: 'ejercicio',
        id: 'logos-directo',
        rol: 'extra',
        titulo: 'Logos USM: margen operacional por costeo directo',
        fuente: { k: 'certamen', sem: 1, anio: 2022, preg: 5, nota: 'pregunta 1' },
        datos: { ventas: 1000000, mp: 100000, mod: 160000, cif: 350000, cifVariable: 0.4, gVentas: 120000, gAdm: 80000, gGenerales: 40000 },
        enunciado: '<p>La empresa de logos “USM” presenta los siguientes datos relacionados con las operaciones de junio del 2022:</p>' +
          '<ul><li>Ventas del período: <b>$ 1.000.000</b>.</li>' +
          '<li>Costos de unidades producidas y vendidas: materia prima <b>$ 100.000</b>; mano de obra directa <b>$ 160.000</b>; costos indirectos de fabricación <b>$ 350.000</b> (40 % variables; 60 % fijos).</li></ul>' +
          '<p>Además, se incurrió en los siguientes gastos operacionales fijos en el período: ventas <b>$ 120.000</b>, administrativos <b>$ 80.000</b> y generales <b>$ 40.000</b>.</p>',
        partes: [
          {
            titulo: 'Responde la pregunta del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿A cuánto asciende el margen operacional por costeo directo de junio 2022?', tipo: 'pesos', respuesta: 150000,
                trampas: [
                  { valor: 600000, propia: true, msg: 'Ese es el margen de contribución. Para llegar al resultado operacional falta restar todos los costos fijos.' },
                  { valor: 390000, propia: true, msg: 'Restaste solo los CIF fijos. También son costos fijos del período los gastos operacionales de ventas, administrativos y generales ($ 240.000).' }
                ],
                sol: { d: 'Costos variables: materia prima 100.000 + mano de obra directa 160.000 + CIF variables 40 % × 350.000 = 140.000 → $ 400.000. Costos fijos: CIF fijos 60 % × 350.000 = 210.000 + gastos operacionales 120.000 + 80.000 + 40.000 = 240.000 → $ 450.000.', f: 'Resultado operacional (costeo directo) = ventas − costos variables − costos fijos', c: '1.000.000 − 400.000 = 600.000 de margen de contribución; 600.000 − 450.000 = $ 150.000' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ E5.4 (extra)
      {
        tipo: 'ejercicio',
        id: 'uefa-inventario',
        rol: 'extra',
        titulo: 'UEFA: el inventario por costeo directo',
        fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 4, nota: 'pregunta 4' },
        datos: { precio: 250, cvProduccion: 100, gav: 50, ventas: 5000, cf: 45000, t: 0.27, _inventario: 1500 },
        enunciado: '<p>La empresa “UEFA”, que vende balones de fútbol, tiene la siguiente información:</p>',
        tablaDatos: UEFA_TABLA,
        partes: [
          {
            titulo: 'Responde la pregunta del certamen',
            preguntas: [
              {
                id: 'p4', texto: 'Si en el inventario de existencias quedan 1.500 balones. ¿Cuál es el costo total de las existencias en inventario por costeo directo?', tipo: 'pesos', moneda: 'USD', respuesta: 150000,
                trampas: [{ valor: 225000, propia: true, msg: 'Sumaste los gastos de administración y ventas. No son costo del producto: por costeo directo el inventario lleva solo el costo variable de producción (USD 100).' }],
                sol: { d: 'Balones en inventario: 1.500. Costo variable de producción: USD 100 por balón.', f: 'Inventario por costeo directo = unidades × costo variable de producción', c: '1.500 × 100 = USD 150.000' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ VF5.A
      {
        tipo: 'vf',
        id: 'vf-total-directo',
        titulo: 'Verdadero o falso: costeo total y costeo directo',
        items: [
          { id: 'a1', af: 'El costeo por absorción total establece que, para determinar el costo de venta, solo se considerará la parte variable del costo.', r: false, porque: 'Eso describe al costeo directo. En absorción total el costo de venta lleva todos los costos de producción, fijos y variables.', fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 1, tb: '1er semestre 2023' } },
          { id: 'a2', af: 'El costeo directo o variable establece que, para determinar el costo de venta, solo se considerará la parte variable del costo.', r: true, porque: 'En costeo directo el producto lleva solo los costos variables; los costos fijos de producción van al resultado del período.', fuente: { k: 'certamen', sem: 1, anio: 2022, preg: 1 } },
          { id: 'a3', af: 'El costeo por absorción total es aquel método que requiere diferenciar los costos variables de los costos fijos.', r: false, porque: 'El que exige separar fijos de variables es el costeo directo. En absorción total todos los costos de producción van al producto, sin distinguirlos.', fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 1 } },
          { id: 'a4', af: 'En el costeo por absorción total, el costo fijo se lleva a resultado en el período, no formando parte del costo de venta.', r: false, porque: 'Es al revés: en absorción total el costo fijo de producción forma parte del costo del producto (y del costo de venta cuando se vende). Llevarlo al resultado del período es propio del costeo directo.', fuente: { k: 'certamen', sem: 1, anio: 2022, preg: 1 } }
        ]
      },

      // ------------------------------------------------------------------ Resumen
      {
        tipo: 'resumen',
        id: 'resumen',
        titulo: 'Resumen del módulo 5',
        formulas: [
          'Costeo total (absorción): los costos fijos de producción van al inventario y pasan a resultado cuando el producto se vende.',
          'Costeo directo (variable): el producto lleva solo costos variables; los costos fijos de producción van completos al período.',
          'Total: ventas − costo de venta = margen bruto; − gastos operacionales = resultado operacional.',
          'Directo: ventas − costos variables = margen de contribución; − costos fijos = resultado operacional.',
          'Si se vende todo lo producido, los dos resultados son iguales. Si queda inventario, el costeo total muestra más resultado.',
          'El margen de contribución es propio del costeo directo.'
        ],
        asi: [
          'Verdadero o falso de definición: ¿cuál usa solo la parte variable del costo? (el costeo directo).',
          '«¿Resultado operacional por costeo directo?» → margen de contribución − todos los costos fijos, incluidos los de producción.',
          '«¿Valor del inventario por costeo directo?» → unidades × costo variable de producción.'
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
