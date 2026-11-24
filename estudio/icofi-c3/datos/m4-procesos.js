// MÓDULO 4 — Costeo por procesos, unidades equivalentes y mermas.
// Solo contenido. Convenciones de texto: **negrita**, {{numerador // denominador}} = fracción, HTML simple.
// En cada ejercicio, "datos" guarda los números crudos del enunciado: de ahí recalcula el script de verificación.
(function (g) {
  'use strict';

  var NOTA_CLASE = 'Es el valor de la resolución de clase, que redondeó los costos unitarios a un decimal. En el certamen conviene dejar todos los decimales en la calculadora.';

  g.ICOFI_C3.modulos.push({
    id: 'procesos',
    n: 4,
    titulo: 'Costeo por procesos, unidades equivalentes y mermas',
    corto: 'Procesos y mermas',
    meta: 'Qué hacer cuando al cierre del mes quedan unidades a medio terminar o se pierden unidades en el camino.',
    bloques: [

      // ------------------------------------------------------------------ L4.1
      {
        tipo: 'leccion',
        id: 'unidades-equivalentes',
        titulo: 'Unidades equivalentes (UE)',
        idea: 'Una unidad a medio hacer no cuesta lo mismo que una terminada. Para repartir el costo, todo se convierte a “unidades terminadas equivalentes”.',
        partes: [
          { k: 'practica', h: 'Dos tortas hechas hasta la mitad consumieron, en trabajo, lo mismo que una torta terminada: equivalen a <b>1 torta</b>. Pero si a las dos ya se les puso todo el bizcocho, en materia prima equivalen a <b>2 tortas</b> completas.' },
          { k: 'diagrama', id: 'tortas' },
          { k: 'p', h: 'En el **costeo por procesos** (producción continua de unidades iguales: harina, champú, cemento) el costo se acumula por **departamento**. Al cierre hay unidades terminadas y otras a medio hacer, los **productos en proceso (PenP)**, que consumieron solo una parte del costo. Por eso todo se expresa en **unidades equivalentes (UE)**: cuántas unidades terminadas representa el trabajo hecho.' },
          { k: 'formula', h: 'UE = Unidades terminadas + Unidades en proceso × % de avance' },
          { k: 'p', h: 'Si el avance es distinto según el elemento del costo, se calcula **una UE por elemento**. Por ejemplo, las unidades en proceso pueden tener 100 % de la materia prima (MP) pero solo 70 % del costo de conversión (CC), que es la mano de obra directa (MOD) más los costos indirectos de fabricación (CIF).' },
          { k: 'asi', items: [
            '«¿Cuántas unidades equivalentes se usan para el elemento X?» → terminadas + en proceso × el % de avance <b>de ese elemento</b>.',
            '«¿A cuántas unidades terminadas equivalen los productos en proceso?» → solo en proceso × % de avance.'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué no se puede dividir el costo total por todas las unidades físicas del departamento?',
          opciones: [
            'Porque las unidades en proceso no tienen costo hasta que se terminan.',
            'Porque las unidades en proceso consumieron solo una parte del costo de una unidad terminada.',
            'Porque el costo de las unidades en proceso va directo al estado de resultados.',
            'Porque las unidades terminadas ya se vendieron.'
          ],
          correcta: 1,
          porque: 'Las unidades en proceso sí tienen costo (queda en el inventario de PenP), pero menor que el de una terminada. Las UE permiten repartir el costo en proporción a lo que cada grupo realmente consumió.'
        }
      },

      // ------------------------------------------------------------------ L4.2
      {
        tipo: 'leccion',
        id: 'cuatro-pasos',
        titulo: 'La metodología en 4 pasos',
        idea: 'Todo ejercicio de procesos se resuelve con la misma receta. Si armas la tabla de UE, las preguntas salen solas.',
        partes: [
          { k: 'pasos', items: [
            { t: 'Producción equivalente', h: 'Primero se cuadran las unidades físicas (las “partidas”): saldo inicial (SI) + puestas en proceso = terminadas y transferidas + en proceso + mermas. Después se calculan las UE de cada elemento. <span class="suave">(Las mermas son unidades que se pierden; se ven en la lección que viene.)</span>' },
            { t: 'Costo unitario', h: 'Costo del elemento ÷ UE del elemento. El costo unitario total es la suma de los unitarios de cada elemento.' },
            { t: 'Distribución del costo', h: 'Lo terminado vale: terminadas × costo unitario total. Lo que queda en proceso vale la suma, elemento por elemento, de: unidades en proceso × % de avance × costo unitario del elemento. La suma de todo debe dar el costo total del departamento.' },
            { t: 'Ciclo contable', h: 'Lo terminado pasa a productos terminados (PT) o al departamento siguiente; cuando se vende, pasa a costo de venta.' }
          ] },
          { k: 'formula', h: 'Costo unitario del elemento = {{Costo del elemento // UE del elemento}}' },
          { k: 'formula', h: 'PenP = Σ ( unidades en proceso × % de avance × costo unitario del elemento )' },
          { k: 'asi', items: [
            '«¿Costo del inventario de productos en proceso?» → paso 3, elemento por elemento.',
            '«¿Costo de lo transferido al siguiente departamento?» → terminadas × costo unitario total.',
            '«¿Costo unitario del departamento?» → suma de los unitarios de cada elemento.',
            'Siempre arma la tabla de UE por elemento antes de calcular.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ E4.1
      {
        tipo: 'ejercicio',
        id: 'ejemplo-base',
        titulo: 'Ejemplo base: un solo grado de avance',
        fuente: { k: 'ejemplo' },
        datos: { iniciadas: 1000, terminadas: 800, enProceso: 200, avance: 0.5, costo: 900000 },
        enunciado: '<p>En un departamento se inician <b>1.000 unidades</b> en el mes. Se terminan <b>800</b> y quedan <b>200</b> en proceso con <b>50 %</b> de avance. El costo total del período es <b>$ 900.000</b>.</p>',
        partes: [
          {
            titulo: 'Paso 1 · Producción equivalente',
            modelo: 'UE = terminadas + en proceso × % de avance = 800 + 200 × 50 % = <b>900 UE</b>',
            nota: 'Este primer paso va hecho como modelo. Los que siguen los haces tú.'
          },
          {
            titulo: 'Pasos 2 y 3 · Costo unitario y distribución',
            preguntas: [
              {
                id: 'unitario', texto: 'Costo unitario (por unidad equivalente)', tipo: 'pesos', respuesta: 1000,
                trampas: [{ valor: 900, propia: true, msg: 'dividiste por las 1.000 unidades físicas. Hay que dividir por las 900 UE, porque las que están en proceso consumieron solo una parte.' }],
                pista: 'Divide el costo total por las UE del paso 1, no por las 1.000 unidades físicas.',
                sol: { d: 'Costo total del período: $ 900.000. UE del paso 1: 900.', f: 'Costo unitario = costo total ÷ UE', c: '900.000 ÷ 900 = $ 1.000' }
              },
              {
                id: 'pt', texto: 'Costo de los productos terminados (PT)', tipo: 'pesos', respuesta: 800000,
                pista: 'Las terminadas valen su cantidad por el costo unitario.',
                sol: { d: 'Unidades terminadas: 800. Costo unitario: $ 1.000.', f: 'PT = terminadas × costo unitario', c: '800 × 1.000 = $ 800.000' }
              },
              {
                id: 'penp', texto: 'Costo de los productos en proceso (PenP)', tipo: 'pesos', respuesta: 100000,
                trampas: [{ valor: 200000, propia: true, msg: 'contaste las 200 unidades en proceso como si estuvieran terminadas. Aplica el 50 % de avance: equivalen a 100.' }],
                pista: 'Las 200 unidades en proceso equivalen a 200 × 50 % unidades terminadas.',
                sol: { d: 'En proceso: 200 unidades al 50 % = 100 UE. Costo unitario: $ 1.000.', f: 'PenP = unidades en proceso × % de avance × costo unitario', c: '200 × 50 % × 1.000 = $ 100.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Comprobación:</b> 800.000 + 100.000 = $ 900.000, que es el costo total del período. Si la suma no da el costo total, hay un error en algún paso.</p>'
      },

      // ------------------------------------------------------------------ E4.2 (extra)
      {
        tipo: 'ejercicio',
        id: 'lean-harina',
        rol: 'extra',
        titulo: 'Lean Limitada: harina',
        fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 3 },
        datos: { costosPrimos: 70000000, cif: 20800000, recibidos: 10000, terminados: 4000, avancePrimo: 0.5, avanceCif: 0.2 },
        enunciado: '<p>La empresa “Lean Limitada” se dedica a la fabricación de harina y utiliza un sistema de costeo por procesos. En el departamento de despuntado y descascarillado, los costos mensuales asociados a este proceso son los siguientes:</p>' +
          '<ul><li>Costos primos: <b>$ 70.000.000</b> (variables).</li><li>CIF: <b>$ 20.800.000</b> (50 % fijo y 50 % variable).</li></ul>' +
          '<p>Las unidades recibidas en el departamento son <b>10.000 kilogramos</b>, de las cuales se terminan y se traspasan al departamento de cepillado <b>4.000 kilogramos</b>. Los kilogramos que quedan en proceso lo hacen con un grado de avance de <b>50 %</b> en costos primos y un <b>20 %</b> en CIF.</p>' +
          '<p>La empresa utiliza el sistema de costeo por absorción total.</p>' +
          '<p class="suave">Recuerda: costos primos = materia prima directa (MPD) + mano de obra directa (MOD).</p>',
        partes: [
          {
            titulo: 'Arma la tabla de unidades equivalentes',
            intro: 'Cuadra primero los kilogramos y después calcula las UE y el costo por kilogramo de cada elemento.',
            tabla: {
              id: 'ue',
              cols: ['Partida', 'Kilogramos', 'UE costos primos', 'UE CIF'],
              filas: [
                { id: 'tt', celdas: [{ t: 'Terminados y traspasados' }, { f: 4000, tipo: 'unidades' }, { r: 4000, tipo: 'unidades', s: 'Lo terminado cuenta completo: 4.000' }, { r: 4000, tipo: 'unidades', s: 'Lo terminado cuenta completo: 4.000' }] },
                { id: 'enp', celdas: [{ t: 'En proceso' }, { r: 6000, tipo: 'unidades', s: '10.000 − 4.000 = 6.000' }, { r: 3000, tipo: 'unidades', s: '6.000 × 50 % = 3.000', trampas: [{ valor: 6000, propia: true, msg: 'Esos son los kilogramos físicos en proceso: aplica el 50 % de avance.' }] }, { r: 1200, tipo: 'unidades', s: '6.000 × 20 % = 1.200', trampas: [{ valor: 6000, propia: true, msg: 'Esos son los kilogramos físicos en proceso: aplica el 20 % de avance.' }] }] },
                { id: 'tot', total: true, celdas: [{ t: 'Total' }, { f: 10000, tipo: 'unidades' }, { r: 7000, tipo: 'unidades', s: '4.000 + 3.000 = 7.000' }, { r: 5200, tipo: 'unidades', s: '4.000 + 1.200 = 5.200' }] },
                { id: 'costo', celdas: [{ t: 'Costo del elemento' }, { t: '' }, { f: 70000000, tipo: 'pesos' }, { f: 20800000, tipo: 'pesos' }] },
                { id: 'unit', celdas: [{ t: 'Costo por kilogramo' }, { t: '' }, { r: 10000, tipo: 'pesos', s: '70.000.000 ÷ 7.000 = $ 10.000' }, { r: 4000, tipo: 'pesos', s: '20.800.000 ÷ 5.200 = $ 4.000' }] }
              ]
            }
          },
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Calcular el costo del inventario de productos en proceso?', tipo: 'pesos', respuesta: 34800000,
                trampas: [{ valor: 84000000, propia: true, msg: 'usaste los 6.000 kg completos. En proceso solo cuenta el % de avance de cada elemento (50 % y 20 %).' }],
                sol: { d: 'En proceso: 3.000 kg equivalentes en costos primos y 1.200 en CIF. Costos por kg: $ 10.000 y $ 4.000.', f: 'PenP = Σ (UE en proceso del elemento × costo unitario del elemento)', c: '3.000 × 10.000 + 1.200 × 4.000 = 30.000.000 + 4.800.000 = $ 34.800.000' }
              },
              {
                id: 'p2', texto: '¿A cuánto asciende el costo de los productos transferidos al departamento de cepillado?', tipo: 'pesos', respuesta: 56000000,
                sol: { d: 'Transferidos: 4.000 kg. Costo unitario total: 10.000 + 4.000 = $ 14.000 por kg.', f: 'Transferido = kg terminados × costo unitario total', c: '4.000 × 14.000 = $ 56.000.000' }
              },
              {
                id: 'p3', texto: '¿A cuántos kilogramos terminados equivalen los productos en proceso en relación al costo primo?', tipo: 'unidades', unidad: 'kg', respuesta: 3000,
                trampas: [{ valor: 6000, propia: true, msg: 'esos son los kilogramos físicos en proceso. Piden a cuántos terminados equivalen: aplica el 50 % de avance.' }],
                sol: { d: 'En proceso: 6.000 kg con 50 % de avance en costos primos.', f: 'UE en proceso = kg en proceso × % de avance', c: '6.000 × 50 % = 3.000 kg' }
              },
              {
                id: 'p4', texto: '¿Cuál es el costo de producción unitario del proceso?', tipo: 'pesos', respuesta: 14000,
                sol: { d: 'Costo primo por kg: 70.000.000 ÷ 7.000 = $ 10.000. CIF por kg: 20.800.000 ÷ 5.200 = $ 4.000.', f: 'Costo unitario total = suma de los unitarios de cada elemento', c: '10.000 + 4.000 = $ 14.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Comprobación:</b> 56.000.000 + 34.800.000 = $ 90.800.000, que es el costo total del departamento (70.000.000 + 20.800.000).</p>'
      },

      // ------------------------------------------------------------------ E4.3 (extra, simulacro)
      {
        tipo: 'ejercicio',
        id: 'abon-champu',
        rol: 'extra',
        simulacro: true,
        area: 'costos',
        titulo: 'ABON S.A.: champú',
        fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 2 },
        datos: { mpd: 36000000, mod: 44000000, moi: 11000000, mpi: 10000000, iniciadas: 6000, transferidas: 3500, avMpd: 1, avMo: 0.8, avMpi: 0.6 },
        enunciado: '<p>La empresa de venta de jabones “ABON S.A.” se dedica al procesado y envasado de champú líquido y utiliza sistema de costeo por proceso. En el área de procesado se fabrica el champú, para luego enviar al área de envasado, donde se llenan los envases con el producto, se sellan y etiquetan para luego traspasarlos a la unidad de ventas. Los costos mensuales asociados a este proceso son los siguientes:</p>' +
          '<ul><li>Materia prima directa (MPD): <b>$ 36.000.000</b> (costo variable).</li>' +
          '<li>Mano de obra directa (MOD): <b>$ 44.000.000</b> (costo variable) y mano de obra indirecta (MOI): <b>$ 11.000.000</b> (costo fijo).</li>' +
          '<li>Materia prima indirecta (MPI): <b>$ 10.000.000</b> (costo variable).</li></ul>' +
          '<p>Las unidades iniciadas en la etapa de procesado son <b>6.000 unidades</b>, de las cuales se terminan y se traspasan al área de envasado <b>3.500 unidades</b>. Las unidades que quedan en proceso lo hacen con un grado de avance de <b>100 %</b> en MPD, un <b>80 %</b> en MOD y MOI y <b>60 %</b> en MPI.</p>' +
          '<p>Se sabe que la empresa opera con el sistema de costos por costeo total.</p>',
        partes: [
          {
            titulo: 'Arma la tabla de unidades equivalentes',
            intro: 'Hay tres elementos, cada uno con su propio avance. Quedan 6.000 − 3.500 = 2.500 unidades en proceso.',
            tabla: {
              id: 'ue',
              cols: ['Elemento', 'Costo', 'UE', 'Costo unitario'],
              filas: [
                { id: 'mpd', celdas: [{ t: 'MPD' }, { f: 36000000, tipo: 'pesos' }, { r: 6000, tipo: 'unidades', s: '3.500 + 2.500 × 100 % = 6.000' }, { r: 6000, tipo: 'pesos', s: '36.000.000 ÷ 6.000 = $ 6.000' }] },
                { id: 'mo', celdas: [{ t: 'MOD + MOI' }, { r: 55000000, tipo: 'pesos', s: '44.000.000 + 11.000.000 = $ 55.000.000 (tienen el mismo avance, así que se costean juntas)' }, { r: 5500, tipo: 'unidades', s: '3.500 + 2.500 × 80 % = 5.500' }, { r: 10000, tipo: 'pesos', s: '55.000.000 ÷ 5.500 = $ 10.000' }] },
                { id: 'mpi', celdas: [{ t: 'MPI' }, { f: 10000000, tipo: 'pesos' }, { r: 5000, tipo: 'unidades', s: '3.500 + 2.500 × 60 % = 5.000' }, { r: 2000, tipo: 'pesos', s: '10.000.000 ÷ 5.000 = $ 2.000' }] },
                { id: 'tot', total: true, celdas: [{ t: 'Total' }, { f: 101000000, tipo: 'pesos' }, { t: '' }, { r: 18000, tipo: 'pesos', s: '6.000 + 10.000 + 2.000 = $ 18.000' }] }
              ]
            }
          },
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: 'Costo del inventario de productos en proceso:', tipo: 'pesos', respuesta: 38000000,
                trampas: [{ valor: 45000000, propia: true, msg: 'costeaste las 2.500 unidades en proceso como si estuvieran terminadas. Cada elemento va con su propio % de avance.' }],
                sol: { d: 'En proceso: 2.500 unidades con avance 100 % (MPD), 80 % (MOD y MOI) y 60 % (MPI). Costos unitarios: $ 6.000, $ 10.000 y $ 2.000.', f: 'PenP = Σ (unidades en proceso × % de avance × costo unitario del elemento)', c: '2.500 × 6.000 + 2.000 × 10.000 + 1.500 × 2.000 = 15.000.000 + 20.000.000 + 3.000.000 = $ 38.000.000' }
              },
              {
                id: 'p2', texto: 'Costo de los productos transferidos al área de envasado:', tipo: 'pesos', respuesta: 63000000,
                sol: { d: 'Transferidas: 3.500 unidades. Costo unitario total: 6.000 + 10.000 + 2.000 = $ 18.000.', f: 'Transferido = unidades terminadas × costo unitario total', c: '3.500 × 18.000 = $ 63.000.000' }
              },
              {
                id: 'p3', texto: '¿Cuántas unidades equivalentes totales del área de procesado son utilizadas para determinar el costo del MOI (mano de obra indirecta)?', tipo: 'unidades', unidad: 'unidades', respuesta: 5500,
                trampas: [{ valor: 6000, propia: true, msg: 'esas son las UE de la MPD (100 % de avance). La MOI tiene 80 %.' }],
                sol: { d: 'Terminadas: 3.500. En proceso: 2.500 con 80 % de avance en MOD y MOI.', f: 'UE = terminadas + en proceso × % de avance del elemento', c: '3.500 + 2.500 × 80 % = 5.500 unidades' }
              },
              {
                id: 'p4', texto: '¿Cuál es el costo de producción unitario de departamento?', tipo: 'pesos', respuesta: 18000,
                trampas: [{ valor: 16833, propia: true, msg: 'dividiste el costo total por las 6.000 unidades iniciadas. Cada elemento se divide por sus propias UE y después se suman los unitarios.' }],
                sol: { d: 'Unitarios: MPD 36.000.000 ÷ 6.000 = $ 6.000; MOD + MOI 55.000.000 ÷ 5.500 = $ 10.000; MPI 10.000.000 ÷ 5.000 = $ 2.000.', f: 'Costo unitario total = suma de los unitarios de cada elemento', c: '6.000 + 10.000 + 2.000 = $ 18.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Comprobación:</b> 63.000.000 + 38.000.000 = $ 101.000.000, el costo total del departamento. La MOI, aunque es un costo fijo, entra al costo del producto porque la empresa usa costeo total.</p>'
      },

      // ------------------------------------------------------------------ L4.3
      {
        tipo: 'leccion',
        id: 'mermas',
        titulo: 'Mermas normales y anormales, y el costo transferido',
        idea: 'Si la pérdida es inevitable, la pagan las unidades buenas. Si es un accidente, se saca aparte y va directo a pérdida.',
        partes: [
          { k: 'practica', h: 'Una fábrica de jugo pone 1.000 litros y siempre se evaporan 100: los 900 buenos cargan con todo el costo (merma <b>normal</b>). Si un día se rompe un estanque y se pierden 100 litros más, esa pérdida no se le cobra al jugo bueno: es pérdida del período (merma <b>anormal</b>).' },
          { k: 'p', h: 'Una **merma** es una unidad que entra al proceso y se pierde o se daña.' },
          { k: 'comparar', cols: ['', 'Merma normal', 'Merma anormal'], filas: [
            ['¿Qué es?', 'Inevitable, propia del proceso.', 'Excede lo esperado.'],
            ['¿Se cuenta en las UE?', '<b>No.</b>', '<b>Sí</b>, con su avance.'],
            ['¿Quién paga su costo?', 'Las unidades buenas: sube el costo unitario.', 'Se costea aparte.'],
            ['¿Adónde va?', 'No tiene costo propio: <b>$ 0</b>.', 'Al estado de resultados (EERR) como <b>pérdida no operacional</b>. No al inventario.']
          ] },
          { k: 'formula', h: 'UE = Terminadas + En proceso × % de avance + Mermas anormales × su avance' },
          { k: 'p', h: '**Costo transferido.** Cuando hay dos departamentos, el segundo recibe las unidades del primero junto con su costo. Ese costo se trata como una materia prima más del departamento 2 (se anota MP₁) y siempre tiene **100 % de avance**.' },
          { k: 'p', h: '**Caso de clase para practicar:** nivel de producción 1.000 unidades, 800 buenas y 200 malas, costo total $ 800.000. En el ejercicio que sigue calculas el costo unitario en los dos casos (merma normal y merma anormal) y después los ves lado a lado.' },
          { k: 'asi', items: [
            '«¿Costo de las unidades de pérdida normal?» → <b>$ 0</b>: lo absorben las unidades buenas.',
            '«¿Costo de las unidades de pérdida anormal y adónde va?» → unidades × avance × costo unitario; va al EERR como pérdida no operacional.'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué la merma normal no tiene costo propio?',
          opciones: [
            'Porque las unidades perdidas no consumieron materiales ni trabajo.',
            'Porque su costo se registra en el estado de resultados como pérdida no operacional.',
            'Porque es inevitable y propia del proceso: su costo lo absorben las unidades buenas, que quedan con un costo unitario mayor.',
            'Porque se descuenta del costo total del departamento.'
          ],
          correcta: 2,
          porque: 'Las unidades perdidas sí consumieron recursos, pero como perderlas es parte normal de producir, ese costo se reparte entre las unidades buenas. Por eso no se cuentan en las UE. Ir al estado de resultados como pérdida no operacional es el tratamiento de la merma anormal.'
        }
      },

      // ------------------------------------------------------------------ E4.1b
      {
        tipo: 'ejercicio',
        id: 'mermas-dos-casos',
        titulo: 'La misma merma, dos tratamientos',
        fuente: { k: 'clase' },
        datos: { produccion: 1000, buenas: 800, malas: 200, costo: 800000 },
        enunciado: '<p>Nivel de producción: <b>1.000 unidades</b>. Productos buenos: <b>800 unidades</b>. Productos malos (mermas): <b>200 unidades</b>. Costo total: <b>$ 800.000</b>.</p>',
        partes: [
          {
            titulo: 'Primer paso (hecho, como modelo)',
            modelo: 'Cuadra las unidades: 1.000 puestas en proceso = 800 buenas + 200 malas.',
            nota: 'Lo que cambia entre un caso y otro es si las 200 malas entran o no al divisor.'
          },
          {
            titulo: 'Calcula los dos casos',
            preguntas: [
              {
                id: 'normal', texto: 'Costo unitario si las 200 unidades malas son <b>merma normal</b>', tipo: 'pesos', respuesta: 1000,
                trampas: [{ valor: 800, propia: true, msg: 'dividiste por las 1.000 unidades: ese es el caso de merma anormal. La merma normal no se cuenta, así que se divide por las 800 buenas.' }],
                pista: 'La merma normal no se cuenta: el costo se reparte solo entre las unidades buenas.',
                sol: { d: 'Costo total: $ 800.000. Unidades buenas: 800. La merma normal no se cuenta.', f: 'Costo unitario = costo total ÷ unidades buenas', c: '800.000 ÷ 800 = $ 1.000' }
              },
              {
                id: 'anormal', texto: 'Costo unitario si las 200 unidades malas son <b>merma anormal</b>', tipo: 'pesos', respuesta: 800,
                trampas: [{ valor: 1000, propia: true, msg: 'dividiste solo por las 800 buenas: ese es el caso de merma normal. La merma anormal sí se cuenta, así que se divide por las 1.000.' }],
                pista: 'La merma anormal sí se cuenta: el costo se reparte en todo el nivel de producción.',
                sol: { d: 'Costo total: $ 800.000. Nivel de producción total: 1.000 unidades (buenas + merma anormal).', f: 'Costo unitario = costo total ÷ nivel de producción total', c: '800.000 ÷ 1.000 = $ 800' }
              },
              {
                id: 'perdida', texto: 'Pérdida no operacional en el caso de merma anormal', tipo: 'pesos', respuesta: 160000,
                trampas: [{ valor: 200000, propia: true, msg: 'usaste el costo unitario del caso normal ($ 1.000). La merma anormal se costea al unitario del caso anormal: $ 800.' }],
                pista: 'Las unidades perdidas se costean al mismo costo unitario del caso anormal.',
                sol: { d: 'Merma anormal: 200 unidades. Costo unitario del caso anormal: $ 800.', f: 'Pérdida no operacional = unidades de merma anormal × costo unitario', c: '200 × 800 = $ 160.000' }
              }
            ]
          }
        ],
        cierre: '<div class="dos-casos"><div><h4>Si es merma normal (operacional)</h4><p>Costo unitario = 800.000 ÷ 800 = <b>$ 1.000</b> por unidad buena.</p><p>Las 800 buenas quedan en inventario a $ 800.000 en total. La merma no tiene costo propio.</p></div>' +
          '<div><h4>Si es merma anormal (no operacional)</h4><p>Costo unitario = 800.000 ÷ 1.000 = <b>$ 800</b>.</p><p>Buenas: 800 × 800 = $ 640.000 a inventario. <b>Pérdida no operacional</b> = 200 × 800 = <b>$ 160.000</b>, al EERR.</p></div></div>' +
          '<p>En los dos casos se reparte el mismo costo: 640.000 + 160.000 = $ 800.000.</p>'
      },

      // ------------------------------------------------------------------ E4.4
      {
        tipo: 'ejercicio',
        id: 'etc-dos-departamentos',
        titulo: 'Producto “ETC”: dos departamentos con mermas',
        etiqueta: 'Ejercicio completo del módulo',
        fuente: { k: 'taller', ej: 2 },
        datos: {
          d1: { materiales: 150000, conversion: 94000, terminadas: 700, enProceso: 200, mermaNormal: 100, mermaAnormal: 0, avMat: 1, avConv: 0.7, puestas: 1000 },
          d2: { materiales: 80000, conversion: 76000, terminadas: 500, enProceso: 100, mermaNormal: 0, mermaAnormal: 100, avMat: 1, avConv: 0.6 }
        },
        enunciado: '<p>El producto “ETC” pasa por dos departamentos. Se pide, para cada departamento: la producción equivalente, el costo unitario y la distribución de los costos.</p>',
        tablaDatos: {
          cols: ['', 'Depto. 1', 'Depto. 2'],
          filas: [
            ['Materiales', '$ 150.000', '$ 80.000'],
            ['Costo de conversión (MOD + CIF)', '$ 94.000', '$ 76.000'],
            ['Unidades terminadas y transferidas', '700', '500'],
            ['Unidades en proceso', '200', '100'],
            ['Unidades mermas normales', '100', '–'],
            ['Unidades mermas anormales (terminadas)', '–', '100'],
            ['Grado de avance en proceso: materiales', '100 %', '100 %'],
            ['Grado de avance en proceso: costo de conversión', '70 %', '60 %']
          ],
          pie: 'No hay inventario inicial. El departamento 1 pone en proceso 1.000 unidades; el departamento 2 recibe las 700 que le transfiere el 1.'
        },
        diagrama: 'flujo-etc',
        partes: [
          {
            titulo: 'Depto. 1 · Paso 1: producción equivalente',
            intro: 'Las partidas cuadran: 0 + 1.000 = 700 + 200 + 100. Abrevio materiales como MP y costo de conversión como CC. Si una celda no lleva unidades, escribe 0 o un guion (–).',
            tabla: {
              id: 'd1-ue',
              cols: ['Partida', 'Unidades', 'UE MP', 'UE CC'],
              filas: [
                { id: 'tt', modelo: 'La primera fila (en verde) va hecha como modelo: lo terminado cuenta completo en todos los elementos.', celdas: [{ t: 'Terminadas y transferidas' }, { f: 700, tipo: 'unidades' }, { m: 700, tipo: 'unidades' }, { m: 700, tipo: 'unidades' }] },
                { id: 'enp', celdas: [{ t: 'En proceso' }, { f: 200, tipo: 'unidades' }, { r: 200, tipo: 'unidades', s: '200 × 100 % = 200' }, { r: 140, tipo: 'unidades', s: '200 × 70 % = 140', trampas: [{ valor: 200, propia: true, msg: 'El costo de conversión lleva 70 % de avance: 200 × 70 %.' }] }] },
                { id: 'mn', celdas: [{ t: 'Merma normal' }, { f: 100, tipo: 'unidades' }, { r: 0, guion: true, tipo: 'unidades', s: 'La merma normal no se cuenta en las UE: –', trampas: [{ valor: 100, propia: true, msg: 'La merma normal no se cuenta en las UE: su costo lo absorben las unidades buenas.' }] }, { r: 0, guion: true, tipo: 'unidades', s: 'La merma normal no se cuenta en las UE: –', trampas: [{ valor: 100, propia: true, msg: 'La merma normal no se cuenta en las UE: su costo lo absorben las unidades buenas.' }] }] },
                { id: 'tot', total: true, celdas: [{ t: 'Total producción equivalente' }, { f: 1000, tipo: 'unidades' }, { r: 900, tipo: 'unidades', s: '700 + 200 = 900', trampas: [{ valor: 1000, propia: true, msg: 'Contaste la merma normal: no entra a las UE, la absorben las unidades buenas.' }] }, { r: 840, tipo: 'unidades', s: '700 + 140 = 840', trampas: [{ valor: 940, propia: true, msg: 'Contaste la merma normal: no entra a las UE, la absorben las unidades buenas.' }] }] }
              ]
            }
          },
          {
            titulo: 'Depto. 1 · Paso 2: costos unitarios',
            intro: 'Divide el costo de cada elemento por sus UE. Escribe los unitarios con dos decimales, pero deja todos los decimales en la calculadora para el paso siguiente.',
            tabla: {
              id: 'd1-unit',
              cols: ['Elemento', 'Costo', 'Costo unitario'],
              filas: [
                { id: 'mp', celdas: [{ t: 'MP (materiales)' }, { f: 150000, tipo: 'pesos' }, { r: 166.67, tipo: 'unitario', s: '150.000 ÷ 900 = 166,67', trampas: [{ valor: 150, propia: true, msg: 'Dividiste por las 1.000 unidades puestas en proceso. La merma normal no entra a las UE: son 900.' }], tambien: [{ valor: 166.7, nota: NOTA_CLASE }] }] },
                { id: 'cc', celdas: [{ t: 'CC (conversión)' }, { f: 94000, tipo: 'pesos' }, { r: 111.9, tipo: 'unitario', s: '94.000 ÷ 840 = 111,90' }] },
                { id: 'tot', total: true, celdas: [{ t: 'Total' }, { f: 244000, tipo: 'pesos' }, { r: 278.57, tipo: 'unitario', s: '166,67 + 111,90 = 278,57', tambien: [{ valor: 278.6, nota: NOTA_CLASE }] }] }
              ]
            },
            despues: '<p><b>Así absorben la merma las unidades buenas:</b> sin merma, los $ 150.000 de materiales se repartirían en 1.000 unidades ($ 150 cada una). Como se perdieron 100, las buenas pagan $ 166,67.</p>'
          },
          {
            titulo: 'Depto. 1 · Paso 3: distribución del costo',
            intro: 'Reparte los $ 244.000 del departamento. Los montos van en pesos enteros.',
            tabla: {
              id: 'd1-dist',
              cols: ['Destino del costo', 'Monto'],
              filas: [
                { id: 'tt', celdas: [{ t: 'Terminadas y transferidas al depto. 2' }, { r: 195000, tipo: 'pesos', s: '700 × 278,5714… = $ 195.000', tambien: [{ valor: 195020, nota: NOTA_CLASE }] }] },
                { id: 'pmp', celdas: [{ t: 'En proceso · MP' }, { r: 33333, tipo: 'pesos', s: '200 × 166,666… = $ 33.333', tambien: [{ valor: 33340, nota: NOTA_CLASE }] }] },
                { id: 'pcc', celdas: [{ t: 'En proceso · CC' }, { r: 15667, tipo: 'pesos', s: '140 × 111,904… = $ 15.667', tambien: [{ valor: 15640, nota: 'Es el valor que se anotó en la resolución de clase (con los costos unitarios a un decimal); con él, el departamento cuadra en $ 244.000.' }] }] },
                { id: 'penp', celdas: [{ t: 'Total en proceso (PenP)' }, { r: 49000, tipo: 'pesos', s: '33.333 + 15.667 = $ 49.000', tambien: [{ valor: 48980, nota: NOTA_CLASE }] }] },
                { id: 'mn', celdas: [{ t: 'Merma normal' }, { r: 0, guion: true, tipo: 'pesos', s: 'La merma normal no tiene costo propio: $ 0', trampas: [{ valor: 27857, propia: true, msg: 'La merma normal no se costea: su costo ya está dentro del unitario de las unidades buenas.' }] }] },
                { id: 'tot', total: true, celdas: [{ t: 'Total (= 150.000 + 94.000)' }, { f: 244000, tipo: 'pesos' }] }
              ],
              cuadre: { celdas: ['tt', 'penp', 'mn'], col: 1, objetivo: 244000, texto: 'Transferidas + en proceso + merma normal' }
            }
          },
          {
            titulo: 'Depto. 2 · Paso 1: producción equivalente',
            intro: 'Entran las 700 unidades del depto. 1: 0 + 700 = 500 + 100 + 100. Aparece un tercer elemento: el costo transferido (MP₁). La merma anormal está terminada.',
            tabla: {
              id: 'd2-ue',
              cols: ['Partida', 'Unidades', 'UE MP₁', 'UE MP', 'UE CC'],
              filas: [
                { id: 'tt', celdas: [{ t: 'Terminadas y transferidas' }, { f: 500, tipo: 'unidades' }, { r: 500, tipo: 'unidades', s: 'Terminadas: 500' }, { r: 500, tipo: 'unidades', s: 'Terminadas: 500' }, { r: 500, tipo: 'unidades', s: 'Terminadas: 500' }] },
                { id: 'enp', celdas: [{ t: 'En proceso' }, { f: 100, tipo: 'unidades' }, { r: 100, tipo: 'unidades', s: 'El costo transferido siempre tiene 100 %: 100' }, { r: 100, tipo: 'unidades', s: '100 × 100 % = 100' }, { r: 60, tipo: 'unidades', s: '100 × 60 % = 60', trampas: [{ valor: 100, propia: true, msg: 'El costo de conversión lleva 60 % de avance: 100 × 60 %.' }] }] },
                { id: 'ma', celdas: [{ t: 'Merma anormal' }, { f: 100, tipo: 'unidades' }, { r: 100, tipo: 'unidades', s: 'La merma anormal sí se cuenta; está terminada: 100', trampas: [{ valor: 0, propia: true, msg: 'La merma anormal sí se cuenta en las UE (a diferencia de la normal). Está terminada: 100.' }] }, { r: 100, tipo: 'unidades', s: 'La merma anormal sí se cuenta; está terminada: 100', trampas: [{ valor: 0, propia: true, msg: 'La merma anormal sí se cuenta en las UE (a diferencia de la normal). Está terminada: 100.' }] }, { r: 100, tipo: 'unidades', s: 'La merma anormal sí se cuenta; está terminada: 100', trampas: [{ valor: 0, propia: true, msg: 'La merma anormal sí se cuenta en las UE (a diferencia de la normal). Está terminada: 100.' }] }] },
                { id: 'tot', total: true, celdas: [{ t: 'Total producción equivalente' }, { f: 700, tipo: 'unidades' }, { r: 700, tipo: 'unidades', s: '500 + 100 + 100 = 700', trampas: [{ valor: 600, propia: true, msg: 'Te faltó la merma anormal: esa sí se cuenta en las UE.' }] }, { r: 700, tipo: 'unidades', s: '500 + 100 + 100 = 700', trampas: [{ valor: 600, propia: true, msg: 'Te faltó la merma anormal: esa sí se cuenta en las UE.' }] }, { r: 660, tipo: 'unidades', s: '500 + 60 + 100 = 660', trampas: [{ valor: 560, propia: true, msg: 'Te faltó la merma anormal: esa sí se cuenta en las UE.' }] }] }
              ]
            }
          },
          {
            titulo: 'Depto. 2 · Paso 2: costos unitarios',
            intro: 'El costo de MP₁ es lo que el depto. 1 transfirió.',
            tabla: {
              id: 'd2-unit',
              cols: ['Elemento', 'Costo', 'Costo unitario'],
              filas: [
                { id: 'mp1', celdas: [{ t: 'MP₁ (costo transferido)' }, { r: 195000, tipo: 'pesos', s: 'Lo transferido por el depto. 1: $ 195.000', tambien: [{ valor: 195020, nota: NOTA_CLASE }] }, { r: 278.57, tipo: 'unitario', s: '195.000 ÷ 700 = 278,57', tambien: [{ valor: 278.6, nota: NOTA_CLASE }] }] },
                { id: 'mp', celdas: [{ t: 'MP (materiales del depto. 2)' }, { f: 80000, tipo: 'pesos' }, { r: 114.29, tipo: 'unitario', s: '80.000 ÷ 700 = 114,29', tambien: [{ valor: 114.3, nota: NOTA_CLASE }] }] },
                { id: 'cc', celdas: [{ t: 'CC (conversión del depto. 2)' }, { f: 76000, tipo: 'pesos' }, { r: 115.15, tipo: 'unitario', s: '76.000 ÷ 660 = 115,15', tambien: [{ valor: 115.2, nota: NOTA_CLASE }] }] },
                { id: 'tot', total: true, celdas: [{ t: 'Total' }, { r: 351000, tipo: 'pesos', s: '195.000 + 80.000 + 76.000 = $ 351.000', tambien: [{ valor: 351020, nota: NOTA_CLASE }] }, { r: 508.01, tipo: 'unitario', s: '278,57 + 114,29 + 115,15 = 508,01', tambien: [{ valor: 508.1, nota: NOTA_CLASE }] }] }
              ]
            }
          },
          {
            titulo: 'Depto. 2 · Paso 3: distribución del costo',
            intro: 'Reparte los $ 351.000 del departamento entre productos terminados, productos en proceso y merma anormal.',
            tabla: {
              id: 'd2-dist',
              cols: ['Destino del costo', 'Monto'],
              filas: [
                { id: 'pt', celdas: [{ t: 'Productos terminados (PT)' }, { r: 254004, tipo: 'pesos', s: '500 × 508,00866… = $ 254.004', tambien: [{ valor: 254050, nota: NOTA_CLASE }] }] },
                { id: 'pmp1', celdas: [{ t: 'En proceso · MP₁' }, { r: 27857, tipo: 'pesos', s: '100 × 278,571… = $ 27.857', tambien: [{ valor: 27860, nota: NOTA_CLASE }] }] },
                { id: 'pmp', celdas: [{ t: 'En proceso · MP' }, { r: 11429, tipo: 'pesos', s: '100 × 114,285… = $ 11.429', tambien: [{ valor: 11430, nota: NOTA_CLASE }] }] },
                { id: 'pcc', celdas: [{ t: 'En proceso · CC' }, { r: 6909, tipo: 'pesos', s: '60 × 115,151… = $ 6.909', tambien: [{ valor: 6912, nota: NOTA_CLASE }] }] },
                { id: 'penp', celdas: [{ t: 'Total en proceso (PenP)' }, { r: 46195, tipo: 'pesos', s: '27.857 + 11.429 + 6.909 = $ 46.195', tambien: [{ valor: 46202, nota: NOTA_CLASE }] }] },
                { id: 'ma', celdas: [{ t: 'Merma anormal' }, { r: 50801, tipo: 'pesos', s: '100 × 508,00866… = $ 50.801', tambien: [{ valor: 50768, nota: 'Es el valor de la resolución de clase, que obtuvo la merma anormal por diferencia para cuadrar el total de $ 351.020 (con unitarios a un decimal).' }, { valor: 50810, nota: 'Es 100 × 508,1, con el costo unitario redondeado a un decimal como en clase.' }] }] },
                { id: 'tot', total: true, celdas: [{ t: 'Total (= 195.000 + 80.000 + 76.000)' }, { f: 351000, tipo: 'pesos' }] }
              ],
              cuadre: { celdas: ['pt', 'penp', 'ma'], col: 1, objetivo: 351000, texto: 'Terminados + en proceso + merma anormal' }
            }
          },
          {
            titulo: 'Preguntas',
            intro: 'Así se preguntó en clase. Todo sale de las tablas que armaste.',
            preguntas: [
              {
                id: 'p1', texto: 'Costo unitario del producto terminado (existencia)', tipo: 'unitario', respuesta: 508.01,
                trampas: [{ valor: 278.57, propia: true, msg: 'ese es el costo unitario del depto. 1. El producto terminado sale del depto. 2, que le suma sus materiales y su conversión.' }],
                tambien: [{ valor: 508.1, nota: NOTA_CLASE }],
                sol: { d: 'Unitarios del depto. 2: MP₁ 195.000 ÷ 700 = 278,57; MP 80.000 ÷ 700 = 114,29; CC 76.000 ÷ 660 = 115,15.', f: 'Costo unitario del producto terminado = suma de los unitarios del último departamento', c: '278,57 + 114,29 + 115,15 = $ 508,01' }
              },
              {
                id: 'p2', texto: '¿Cuántas unidades hay en proceso al cierre (entre los dos departamentos)?', tipo: 'unidades', respuesta: 300,
                sol: { d: 'En proceso: 200 unidades en el depto. 1 y 100 en el depto. 2.', f: 'Se suman las unidades físicas (no las equivalentes)', c: '200 + 100 = 300 u' }
              },
              {
                id: 'p3', texto: 'Costo de las unidades en proceso (ambos departamentos)', tipo: 'pesos', respuesta: 95195,
                trampas: [{ valor: 49000, propia: true, msg: 'ese es solo el depto. 1. Piden los dos departamentos: súmale los $ 46.195 del depto. 2.' }, { valor: 46195, propia: true, msg: 'ese es solo el depto. 2. Piden los dos departamentos: súmale los $ 49.000 del depto. 1.' }],
                tambien: [{ valor: 95182, nota: 'Es el valor de la resolución de clase (48.980 + 46.202), con los costos unitarios redondeados a un decimal.' }],
                sol: { d: 'PenP del depto. 1: 33.333 + 15.667 = $ 49.000. PenP del depto. 2: 27.857 + 11.429 + 6.909 = $ 46.195.', f: 'Se suman los productos en proceso de los dos departamentos', c: '49.000 + 46.195 = $ 95.195' }
              },
              {
                id: 'p4', texto: 'Costo de las unidades de pérdida normal', tipo: 'pesos', respuesta: 0, guion: true,
                trampas: [{ valor: 27857, propia: true, msg: 'la merma normal no se costea aparte: su costo lo absorben las unidades buenas. La que sí se costea es la anormal.' }],
                sol: { d: 'Depto. 1: 100 unidades de merma normal.', f: 'La merma normal no se cuenta en las UE ni tiene costo propio', c: 'Su costo lo absorben las unidades buenas (por eso el material sube de $ 150 a $ 166,67 por unidad): $ 0' }
              },
              {
                id: 'p5', texto: 'Costo de las unidades de pérdida anormal', tipo: 'pesos', respuesta: 50801,
                tambien: [
                  { valor: 50768, nota: 'Es el valor de la resolución de clase, que obtuvo la merma anormal por diferencia para cuadrar el total de $ 351.020 (con unitarios a un decimal).' },
                  { valor: 50810, nota: 'Es 100 × 508,1, con el costo unitario redondeado a un decimal como en clase.' }
                ],
                clasif: {
                  texto: '¿Adónde va ese costo?',
                  opciones: ['Al inventario de productos terminados', 'Al estado de resultados, como pérdida no operacional', 'Al costo de las unidades buenas', 'Al inventario de productos en proceso'],
                  correcta: 1,
                  porque: 'La merma anormal no se le carga al producto: va al EERR como pérdida no operacional.'
                },
                sol: { d: 'Depto. 2: 100 unidades de merma anormal, terminadas (100 % de avance). Costo unitario total: 508,00866…', f: 'Merma anormal = unidades × avance × costo unitario', c: '100 × 508,00866… = $ 50.801, que va al EERR como pérdida no operacional' }
              }
            ]
          }
        ],
        cierre: '<h3>Paso 4 · Ciclo contable</h3>' +
          '<p>Los $ 195.000 pasan de PenP del depto. 1 a PenP del depto. 2. Los $ 254.004 pasan a productos terminados (y a costo de venta cuando se vendan). Los $ 50.801 de la merma anormal salen directo al EERR como <b>pérdida no operacional</b>. En PenP quedan $ 49.000 (depto. 1) y $ 46.195 (depto. 2).</p>' +
          '<h3>Sobre el redondeo</h3>' +
          '<p>Con todos los decimales, los totales cuadran exactos ($ 244.000 y $ 351.000): esos son los valores principales. En la resolución de clase los costos unitarios se redondearon a <b>un decimal</b> (166,7; 111,9; 278,6; 114,3; 115,2; 508,1) y se multiplicó con esos valores. Por eso <b>también se aceptan</b> los valores de clase:</p>' +
          '<div class="tabla-scroll"><table class="t-datos"><thead><tr><th>Concepto</th><th>Con todos los decimales (principal)</th><th>Con unitarios a 1 decimal (clase)</th></tr></thead><tbody>' +
          '<tr><td>Costo unitario depto. 1</td><td>278,57</td><td>278,6</td></tr>' +
          '<tr><td>Transferidas al depto. 2</td><td>195.000</td><td>195.020</td></tr>' +
          '<tr><td>PenP depto. 1</td><td>49.000 (33.333 + 15.667)</td><td>48.980 (33.340 + 15.640)</td></tr>' +
          '<tr><td>Costo unitario depto. 2 (PT)</td><td>508,01</td><td>508,1</td></tr>' +
          '<tr><td>PT depto. 2</td><td>254.004</td><td>254.050</td></tr>' +
          '<tr><td>PenP depto. 2</td><td>46.195 (27.857 + 11.429 + 6.909)</td><td>46.202 (27.860 + 11.430 + 6.912)</td></tr>' +
          '<tr><td>Merma anormal</td><td>50.801</td><td>50.768 (por diferencia, para cuadrar 351.020) o 50.810 (100 × 508,1)</td></tr>' +
          '<tr><td>PenP ambos deptos.</td><td>95.195</td><td>95.182</td></tr>' +
          '</tbody></table></div>' +
          '<p><b>Recomendación:</b> en el certamen conviene no redondear los costos unitarios (dejar los decimales en la calculadora), para que los totales cuadren con el costo del departamento.</p>'
      },

      // ------------------------------------------------------------------ VF4.A
      {
        tipo: 'vf',
        id: 'vf-procesos',
        titulo: 'Verdadero o falso: procesos y mermas',
        items: [
          { id: 'a1', af: 'En el costeo por proceso, el costo se acumula por órdenes de trabajo específicas.', r: false, porque: 'Se acumula por departamento o centro de costo. Acumular por orden de trabajo es propio del costeo por órdenes específicas.', fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 1, tb: '1er semestre 2023' } },
          { id: 'a2', af: 'El sistema de costeo por procesos considera las unidades terminadas y las unidades en proceso, convertidas en unidades equivalentes terminadas.', r: true, porque: 'Esa es justamente la idea de las UE: llevar lo que está a medio hacer a su equivalente en unidades terminadas.', fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 1 } },
          { id: 'a3', af: 'El valor contable equivalente de productos en proceso se determina considerando el porcentaje de avance de las unidades en el proceso de producción correspondiente.', r: true, porque: 'PenP = unidades en proceso × % de avance × costo unitario, elemento por elemento.', fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 1 } },
          { id: 'a4', af: 'La merma normal se cuenta en las unidades equivalentes y se costea aparte.', r: false, porque: 'La merma normal no se cuenta en las UE: su costo lo absorben las unidades buenas. La que se cuenta y se costea aparte es la merma anormal.', fuente: { k: 'taller', ej: 2 } },
          { id: 'a5', af: 'El costo de la merma anormal se lleva al inventario de productos terminados.', r: false, porque: 'Va al estado de resultados como pérdida no operacional, no al inventario.', fuente: { k: 'taller', ej: 2 } }
        ]
      },

      // ------------------------------------------------------------------ MC4.A
      {
        tipo: 'mc',
        id: 'mc-procesos',
        titulo: 'Selección múltiple: sistema por procesos',
        items: [
          {
            id: 'm1',
            enunciado: 'Sistema de costos por procesos, mencione la que <b>no</b> corresponde:',
            opciones: [
              'Se pierde la identidad de los productos.',
              'Los costos totales y unitarios y por elementos del costo están referidos a cada proceso.',
              'Nunca se pierde la identidad de los productos.',
              'Los productos tienden a ser homogéneos.'
            ],
            correcta: 2,
            porque: 'En procesos la producción es continua y los productos son homogéneos: no se distingue una unidad de otra, así que la identidad del producto sí se pierde y los costos se refieren a cada proceso.',
            fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ Resumen
      {
        tipo: 'resumen',
        id: 'resumen',
        titulo: 'Resumen del módulo 4',
        formulas: [
          'UE = terminadas + en proceso × % de avance (+ mermas anormales × su avance)',
          'Se calcula una UE por cada elemento del costo.',
          'Costo unitario del elemento = costo del elemento ÷ UE del elemento.',
          'Merma normal: no entra a las UE; la absorben las unidades buenas. Su costo propio es $ 0.',
          'Merma anormal: entra a las UE, se costea aparte y va al EERR como pérdida no operacional.',
          'Costo transferido = MP₁, siempre al 100 % de avance.'
        ],
        asi: [
          '«¿Costo del inventario de productos en proceso?»',
          '«¿Costo de lo transferido al siguiente departamento?»',
          '«¿Cuántas UE se usan para el elemento X?»',
          '«¿Costo unitario del departamento?»',
          '«¿Costo de la merma normal o anormal y adónde va?»',
          'Siempre arma la tabla de UE por elemento antes de calcular.'
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
