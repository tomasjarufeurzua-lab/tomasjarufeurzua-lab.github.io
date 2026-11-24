// MÓDULO 1 — Presupuestos.
// Solo contenido. Convenciones de texto: **negrita**, {{numerador // denominador}} = fracción, HTML simple.
// En cada ejercicio, "datos" guarda los números crudos del enunciado: de ahí recalcula el script de verificación.
// Las trampas con "propia: true" no vienen del encargo: salen de aplicar un error que la lección describe.
(function (g) {
  'use strict';

  // Tabla de datos dentro de un enunciado (misma apariencia que las demás tablas de datos).
  function tabla(cols, filas) {
    return '<div class="tabla-scroll"><table class="t-datos"><thead><tr>' + cols.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      filas.map(function (f) { return '<tr>' + f.map(function (c, i) { return i ? '<td>' + c + '</td>' : '<th scope="row">' + c + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div><p class="desliza">Desliza la tabla hacia el lado para ver todas las columnas →</p>';
  }

  g.ICOFI_C3.modulos.push({
    id: 'presupuestos',
    n: 1,
    titulo: 'Presupuestos',
    corto: 'Presupuestos',
    meta: 'Para qué se planifica: cómo se traduce un plan a números, cuánto producir o comprar y cuánta plata habrá en caja.',
    bloques: [

      // ------------------------------------------------------------------ L1.1
      {
        tipo: 'leccion',
        id: 'planificacion',
        teorica: true,
        sinAb: ['II'],
        titulo: 'La planificación estratégica y dónde entra el presupuesto',
        idea: 'El presupuesto no es la estrategia: es la herramienta que la traduce a números.',
        partes: [
          { k: 'practica', h: 'Una cadena de cafeterías detecta barrios universitarios sin oferta (<b>diagnóstico</b>), se propone abrir 3 locales (<b>formulación</b>), el presupuesto dice cuánto cuesta y cuánto se espera vender (<b>implementación</b>) y en junio compara lo vendido con lo presupuestado y corrige (<b>control</b>).' },
          { k: 'p', h: 'La gestión de una empresa se ordena como un proceso de **planificación estratégica** con cuatro fases. El presupuesto aparece recién en la tercera.' },
          { k: 'diagrama', id: 'fases-planificacion' },
          { k: 'pasos', items: [
            { t: 'Fase I · Diagnóstico', h: 'Se hace el análisis FODA (fortalezas, oportunidades, debilidades y amenazas). El <b>medio externo</b> tiene variables incontrolables: oportunidades y amenazas. El <b>medio interno</b> tiene variables controlables: fortalezas y debilidades.' },
            { t: 'Fase II · Formulación', h: 'Se definen la misión, los objetivos, las estrategias y las políticas, considerando a los grupos de interés: clientes, proveedores, trabajadores, bancos, dueños y Estado.' },
            { t: 'Fase III · Implementación', h: 'Los planes son genéricos; los programas, específicos; y los <b>presupuestos</b> son la cuantificación de esos planes y programas.' },
            { t: 'Fase IV · Evaluación y control', h: 'Se fijan parámetros, se mide, se compara lo real con lo presupuestado, se calculan las desviaciones, se buscan sus causas y se toman <b>acciones correctivas</b>. Lo aprendido vuelve a la fase I (retroalimentación).' }
          ] },
          { k: 'formula', h: 'Presupuesto = expresión cuantitativa de los objetivos gerenciales y medio para controlar el avance hacia ellos' },
          { k: 'trampa', h: '«El presupuesto corresponde a la fase de formulación» es <b>falso</b>: corresponde a la fase de implementación.' },
          { k: 'asi', items: [
            'Verdadero o falso sobre la fase a la que pertenece el presupuesto: es la <b>implementación</b>, no la formulación.'
          ] }
        ],
        porque: {
          pregunta: '¿Por qué el presupuesto pertenece a la fase de implementación y no a la de formulación?',
          opciones: [
            'Porque en la formulación todavía no se conoce el medio externo.',
            'Porque el presupuesto solo sirve para controlar lo que ya pasó.',
            'Porque cuantifica planes y programas ya definidos: la formulación decide qué se quiere lograr y el presupuesto lo traduce a números.',
            'Porque los objetivos se fijan después de hacer el presupuesto.'
          ],
          correcta: 2,
          porque: 'En la formulación se definen la misión, los objetivos, las estrategias y las políticas. Recién en la implementación esos planes y programas se cuantifican: eso es el presupuesto. Después, en la fase de control, sirve de vara para comparar con lo real.'
        }
      },

      // ------------------------------------------------------------------ L1.2
      {
        tipo: 'leccion',
        id: 'ventajas-objetivos',
        teorica: true,
        titulo: 'Ventajas, objetivos y proceso del presupuesto',
        idea: 'Presupuestar obliga a conocer la empresa, coordina a todas las áreas y deja una vara para medir lo que pasó.',
        partes: [
          { k: 'practica', h: 'Al armar el presupuesto, una empresa descubre que nadie es responsable de cobrar a los clientes morosos (conocimiento de la empresa); a fin de año compara lo gastado en marketing con lo presupuestado y pide explicaciones (control); y a cada vendedor le asigna una meta mensual (motivación).' },
          { k: 'sub', h: 'Las cinco ventajas' },
          { k: 'lista', items: [
            'Obliga al <b>estudio y conocimiento</b> de la empresa.',
            'Permite la <b>planificación y coordinación</b> entre áreas.',
            'Es un <b>instrumento de gestión</b>.',
            'Permite la <b>evaluación y el control</b>.',
            'Sirve de <b>motivación</b>.'
          ] },
          { k: 'sub', h: 'Los objetivos' },
          { k: 'lista', items: [
            'Analizar y planificar el futuro.',
            'Coordinar las áreas.',
            'Asignar recursos a departamentos y productos.',
            'Establecer bases de comparación.'
          ] },
          { k: 'p', h: '**No** son objetivos del presupuesto: proyectar el monto exacto de impuestos ni servir de respaldo del Libro Diario.' },
          { k: 'sub', h: 'El proceso' },
          { k: 'p', h: 'El proceso presupuestario anual **involucra a todas las áreas**, cada una con sus responsables (no solo a Contabilidad). Sus fases: normas orientadoras → presupuestos operacionales y de inversión → negociación → revisión y coordinación → estados financieros proyectados → aprobación.' },
          { k: 'trampa', h: 'Basarse <b>solo</b> en la información histórica. El presupuesto cambia si cambian el plan comercial o la macroeconomía.' },
          { k: 'asi', items: [
            '«¿Cuáles son objetivos del presupuesto?» → proyectar impuestos y respaldar el Libro Diario <b>no son</b> objetivos del presupuesto: elimina las alternativas que los incluyan. Sí son objetivos: analizar y planificar el futuro, coordinar las áreas, asignar recursos y establecer bases de comparación.',
            '«¿Cuál es una ventaja de los presupuestos?» → la alternativa correcta es una de las cinco ventajas: conocer la empresa, planificar y coordinar, ser instrumento de gestión, evaluar y controlar, o motivar.',
            'Verdadero o falso: «el proceso presupuestario involucra solo al área contable» → es falso: participan todas las áreas, cada una con sus responsables.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ MC1.A + MC1.B
      {
        tipo: 'mc',
        id: 'mc-objetivos',
        sinAb: ['II'],
        titulo: 'Selección múltiple: objetivos y ventajas',
        items: [
          {
            id: 'm1',
            enunciado: '¿Cuál de las siguientes afirmaciones son objetivos del presupuesto?<br>i. Analizar y planificar el futuro.<br>ii. Hacer la proyección de impuestos del próximo periodo.<br>iii. Asignar recursos a los diferentes departamentos y productos de la empresa.<br>iv. Establecer bases de comparación para evaluar resultados.',
            opciones: ['Solo I y II', 'I, II y III', 'I, III y IV', 'Solo II y IV'],
            correcta: 2,
            porque: 'La proyección de impuestos no es un objetivo del presupuesto. Sí lo son analizar y planificar el futuro, asignar recursos a departamentos y productos, y establecer bases de comparación.',
            fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 2 }
          },
          {
            id: 'm2',
            enunciado: 'Ventaja de los presupuestos, mencione el que corresponde:',
            opciones: [
              'No se basa en mejorar las relaciones entre departamentos.',
              'Instrumento de gestión.',
              'Sirve como respaldo para la contabilización en el Libro Diario.',
              'Libro auxiliar en el sistema operativo.'
            ],
            correcta: 1,
            porque: 'Ser un instrumento de gestión es una de las cinco ventajas. El presupuesto sí busca coordinar a los departamentos, y no es un respaldo del Libro Diario ni un libro auxiliar.',
            fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ L1.3
      {
        tipo: 'leccion',
        id: 'tipos',
        teorica: true,
        titulo: 'Tipos de presupuesto',
        idea: 'Los presupuestos se clasifican según cuánto tiempo cubren, si se ajustan al nivel de actividad, para qué sirven y quién los hace.',
        partes: [
          { k: 'practica', h: 'Una fábrica tiene costos de $ 200.000 fijos + $ 300 por unidad. Su presupuesto <b>estático</b> para 1.000 unidades es $ 500.000. Produce 1.200 unidades y gasta $ 560.000: el estático dice “se gastó $ 60.000 de más”. El <b>flexible</b> calcula lo que debía costar producir 1.200 unidades (200.000 + 300 × 1.200 = $ 560.000) y muestra que no hubo ineficiencia.' },
          { k: 'comparar', cols: ['Criterio', 'Tipos'], filas: [
            ['Período', '<b>Corto plazo:</b> hasta 1 año. <b>Largo plazo:</b> 3 a 5 años o más.'],
            ['Flexibilidad', '<b>Estático:</b> un solo nivel de actividad. <b>Flexible:</b> varios niveles; se recalcula al nivel real. <b>Móvil:</b> se va actualizando período a período.'],
            ['Función', '<b>Operativos o económicos:</b> ventas, producción, compras, materiales, mano de obra (MO), costos indirectos de fabricación (CIF), gastos operacionales (incluidas las comisiones de venta), costo de venta y estado de resultados (EERR) proyectado.<br><b>Financieros:</b> caja o tesorería, inversión o capital y balance proyectado. Definen la aplicación y el uso de fondos, y sí afectan la rentabilidad sobre el patrimonio (ROE).'],
            ['Sector', '<b>Público:</b> se rige por la Ley de Presupuestos. <b>Privado:</b> presupuesta ingresos, costos, gastos e inversiones.']
          ] },
          { k: 'p', h: '**Se construyen en cascada:** ventas → producción o compras → materiales, mano de obra y CIF → costo de venta → gastos → resultado → caja → balance. Todo parte del presupuesto de ventas.' },
          { k: 'asi', items: [
            'Verdadero o falso: «un presupuesto de corto plazo planifica entre 2 y 5 años» → falso: el corto plazo es hasta 1 año.',
            '«¿Cuál no es un presupuesto operativo?» → el de tesorería (caja): es financiero.',
            '«Las comisiones de los vendedores no son parte del presupuesto operativo» → es falso: las comisiones son un gasto operacional, así que <b>sí</b> forman parte del presupuesto operativo.'
          ] }
        ],
        porque: {
          pregunta: 'En el caso de la fábrica, ¿por qué el presupuesto flexible dice que no hubo ineficiencia aunque se gastaron $ 60.000 más que lo presupuestado?',
          opciones: [
            'Porque recalcula lo que debía costar producir las 1.200 unidades reales (200.000 + 300 × 1.200 = $ 560.000), y eso es justo lo que se gastó.',
            'Porque el presupuesto flexible no considera los costos fijos.',
            'Porque en un presupuesto flexible las diferencias con lo real nunca se analizan.',
            'Porque los $ 60.000 corresponden a impuestos, que no se presupuestan.'
          ],
          correcta: 0,
          porque: 'El presupuesto estático compara con un nivel de actividad que no ocurrió (1.000 unidades). El flexible se recalcula al nivel real: producir 200 unidades más cuesta 200 × 300 = $ 60.000 más, así que el gasto adicional se explica por la mayor producción y no por ineficiencia.'
        }
      },

      // ------------------------------------------------------------------ L1.4
      {
        tipo: 'leccion',
        id: 'incremental-base-cero',
        titulo: 'Presupuesto incremental y presupuesto base cero',
        idea: 'El incremental parte del año anterior y lo ajusta; el base cero obliga a justificar cada peso desde cero.',
        partes: [
          { k: 'practica', h: 'Un municipio que cada año repite el presupuesto anterior más un 5 % usa el <b>incremental</b>. Si en cambio exige justificar cada actividad desde cero y financia solo las mejor rankeadas, usa el <b>base cero</b>.' },
          { k: 'p', h: 'Hay dos formas de armar el presupuesto de un año: el **incremental** (también llamado tradicional) y el **presupuesto base cero (PBC)**.' },
          { k: 'comparar', cols: ['', 'Incremental', 'Base cero'], filas: [
            ['Punto de partida', 'El presupuesto del año anterior, al que se le suman o restan cambios.', 'No parte del año anterior: cada peso se justifica desde cero.'],
            ['Qué examina', 'Solo lo nuevo.', 'Todas las actividades.'],
            ['En qué se concentra', 'En el gasto.', 'Busca nuevas formas de acción y suprime las actividades de baja prioridad.'],
            ['En qué termina', 'En aceptar o rechazar.', 'En opciones: unidades de decisión → paquetes unitarios de decisión (PUD) → ranking → punto de corte.']
          ] },
          { k: 'asi', items: [
            'Verdadero o falso: «el base cero toma como referente el año anterior y suma incrementos o decrementos» → falso: eso es el incremental.',
            'Verdadero o falso: «la presupuestación incremental se concentra en el cambio respecto del año anterior» → verdadero.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ VF1.A
      {
        tipo: 'vf',
        id: 'vf-presupuestos',
        titulo: 'Verdadero o falso: qué es y cómo se arma un presupuesto',
        items: [
          { id: 'a1', af: 'El presupuesto es una herramienta de gestión que corresponde a la fase de formulación en un proceso de planificación estratégica.', r: false, porque: 'Corresponde a la fase de implementación: el presupuesto cuantifica los planes y programas que ya se formularon.', fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 1 } },
          { id: 'a2', af: 'Cuando se habla de un presupuesto de corto plazo es aquel en que se planifican ingresos, costos y gastos en un periodo mayor a 2 años y menor a 5.', r: false, porque: 'El corto plazo es hasta 1 año. De 3 a 5 años o más es largo plazo.', fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 1 } },
          { id: 'a3', af: 'El presupuesto base cero no toma como punto de partida obligatorio los presupuestos históricos del período anterior.', r: true, porque: 'El base cero no parte del año anterior: cada peso se justifica desde cero.', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1 } },
          { id: 'a4', af: 'La presupuestación base cero toma como referente relevante el presupuesto del año anterior y se agregan los incrementos o bien los decrementos.', r: false, porque: 'Eso describe al presupuesto incremental. El base cero no toma como referencia el año anterior.', fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 1 } },
          { id: 'a5', af: 'La presupuestación tradicional/incremental tiende a concentrarse en el cambio incremental/decremental del año anterior.', r: true, porque: 'El incremental parte del presupuesto anterior y examina solo lo que cambia.', fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 1 } },
          { id: 'a6', af: 'El presupuesto de la empresa no se ve afectado si hay cambios en el plan comercial, pues siempre se mantiene la relación histórica de costos y gastos.', r: false, porque: 'Si cambia el plan comercial (o la macroeconomía), cambia el presupuesto. Basarse solo en lo histórico es un error típico.', fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 1 } },
          { id: 'a7', af: 'El proceso de presupuestación anual involucra solo al área contable, que son los responsables de proyectar los flujos de caja.', r: false, porque: 'El proceso presupuestario involucra a todas las áreas, cada una con sus responsables.', fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 1 } },
          { id: 'a8', af: 'El presupuesto de tesorería es un presupuesto operativo.', r: false, porque: 'El presupuesto de tesorería (caja) es financiero, no operativo.', fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 2, nota: 'adaptada de selección múltiple' } }
        ]
      },

      // ------------------------------------------------------------------ MC1.C + MC1.D
      {
        tipo: 'mc',
        id: 'mc-tipos',
        sinAb: ['II'],
        titulo: 'Selección múltiple: tipos de presupuesto',
        items: [
          {
            id: 'm1',
            enunciado: 'En los presupuestos operativos, ¿cuál de las afirmaciones es <b>incorrecta</b>?',
            opciones: [
              'El presupuesto de producción se basa en el presupuesto de ventas.',
              'Las comisiones de los agentes de ventas no son parte del presupuesto operativo.',
              'Las políticas de stock (inventarios) de productos son consideradas para el presupuesto operativo.',
              'Los CIF son parte de la presupuestación operativa.'
            ],
            correcta: 1,
            porque: 'Las comisiones de los vendedores son gastos operacionales, así que sí forman parte del presupuesto operativo.',
            fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 2 }
          },
          {
            id: 'm2',
            enunciado: 'Las siguientes afirmaciones entre un presupuesto de una empresa pública y una privada son verdaderas:<br>i. La entidad pública se rige por la Ley de Presupuestos.<br>ii. La entidad pública solo presupuesta gastos.<br>iii. La entidad privada presupuesta solo rentabilidades.',
            opciones: ['Solo I', 'II y III', 'I y III', 'I y IV'],
            correcta: 0,
            porque: 'Solo la primera es verdadera: el sector público se rige por la Ley de Presupuestos. El sector privado presupuesta ingresos, costos, gastos e inversiones, no solo rentabilidades. (En el certamen original la última alternativa menciona una afirmación IV que no existe.)',
            fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 2 }
          }
        ]
      },

      // ------------------------------------------------------------------ L1.5
      {
        tipo: 'leccion',
        id: 'formula-bodega',
        titulo: 'La fórmula de bodega: producción y compras',
        idea: 'Lo que tengo al inicio + lo que entra − lo que sale = lo que me queda al final. Todo presupuesto de producción o de compras es esa cuenta despejada.',
        partes: [
          { k: 'practica', h: 'Piensa en la bodega de un almacén: lo que había al abrir, más lo que llegó, menos lo que se vendió, es lo que queda al cerrar. Si sabes cuánto vas a vender y cuánto quieres que quede, puedes despejar cuánto tiene que llegar.' },
          { k: 'p', h: 'En símbolos, con saldo inicial (SI) y saldo final (SF):' },
          { k: 'formula', h: 'SI + Entradas − Salidas = SF' },
          { k: 'p', h: 'En un inventario, el SI es el **inventario inicial (II)** y el SF es el **inventario final (IF)**. En una industria, lo que se vende sale de la bodega de productos terminados (PT) y lo que se produce consume materia prima (MP). Lo que hay que presupuestar es la entrada, así que se despeja:' },
          { k: 'formula', h: 'Producción (u) = Ventas (u) + IF deseado de PT − II de PT' },
          { k: 'formula', h: 'Compras (empresa comercial) = Ventas o costo de venta + IF deseado − II' },
          { k: 'formula', h: 'Compras de MP = Producción × consumo por unidad + IF de MP − II de MP' },
          { k: 'p', h: '**Dos claves.** El II de un mes es el IF del mes anterior. Y el “IF deseado” lo fija la política de la empresa, por ejemplo “25 % de las ventas del mes siguiente”, a veces más un stock de seguridad. Por eso los enunciados dan un mes más de ventas que los que preguntan.' },
          { k: 'asi', items: [
            '«¿Compras (o producción) presupuestadas del mes X?» → ventas + IF − II, con el IF según la política.',
            '«¿Inventario final deseado?» → la política aplicada al mes siguiente.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ E1.1
      {
        tipo: 'ejercicio',
        id: 'tik-tok',
        titulo: 'Tik-Tok Bonitos S.A.: presupuesto de producción',
        fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 5, nota: 'en el certamen eran 5 verdadero o falso; aquí calculas los números' },
        datos: { inventario: 150, politica: 0.5, seguridad: 30, mayo: 240, junio: 200, julio: 250, agosto: 180, precio: 80000, utilidadBruta: 0.3, _gastosOp: 0.4 },
        enunciado: '<p>La empresa “Tik-Tok Bonitos S.A.” se dedica a la fabricación de relojes y, debido a su buen desempeño en el primer cuatrimestre del año 2024, se encuentra preparando el presupuesto móvil para el segundo cuatrimestre del año. Para ello cuenta con la siguiente información:</p>' +
          '<ul><li>El inventario al 30 de abril es de <b>150 unidades</b>.</li>' +
          '<li>La política de inventario al final de cada mes corresponde al <b>50 %</b> de las unidades que se estima vender al siguiente mes, y además se considera un inventario de seguridad de <b>30 unidades</b>.</li>' +
          '<li>Las ventas en unidades estimadas del cuatrimestre:</li></ul>' +
          tabla(['', 'Mayo', 'Junio', 'Julio', 'Agosto'], [['Ventas estimadas (unidades)', '240', '200', '250', '180']]) +
          '<ul><li>El precio de venta de cada reloj es de <b>$ 80.000 más IVA</b>.</li></ul>' +
          '<p>Además, la empresa estima que para todos los meses conseguirá una utilidad bruta de <b>30 %</b>.</p>' +
          '<p class="suave">“Más IVA” significa que el precio es neto, es decir, sin el impuesto al valor agregado (IVA) de 19 %.</p>',
        partes: [
          {
            titulo: 'Arma el presupuesto de producción',
            intro: 'Completa junio y julio. Para cada mes: primero el inventario final (IF) deseado según la política, después el inventario inicial (II) y al final la producción.',
            tabla: {
              id: 'plan',
              cols: ['Mes', 'Ventas (u)', 'IF deseado (u)', 'II (u)', 'Producción (u)'],
              filas: [
                { id: 'mayo', modelo: 'Mayo va hecho como modelo: IF = 50 % × 200 (ventas de junio) + 30 = 130; II = 150 (el inventario al 30 de abril); producción = 240 + 130 − 150 = 220.', celdas: [{ t: 'Mayo' }, { f: 240, tipo: 'unidades' }, { m: 130, tipo: 'unidades' }, { m: 150, tipo: 'unidades' }, { m: 220, tipo: 'unidades' }] },
                { id: 'junio', celdas: [{ t: 'Junio' }, { f: 200, tipo: 'unidades' },
                  { r: 155, tipo: 'unidades', s: '50 % × 250 (ventas de julio) + 30 = 155', trampas: [
                    { valor: 125, propia: true, msg: 'Te faltó el inventario de seguridad: al 50 % de las ventas del mes siguiente se le suman 30 unidades.' },
                    { valor: 130, propia: true, msg: 'Usaste las ventas de junio. La política mira las ventas del mes siguiente (julio): 50 % × 250 + 30.' }
                  ] },
                  { r: 130, tipo: 'unidades', s: 'El II de junio es el IF de mayo: 130', trampas: [
                    { valor: 150, propia: true, msg: 'Ese es el inventario al 30 de abril. El II de junio es el IF de mayo: 130.' }
                  ] },
                  { r: 225, tipo: 'unidades', s: '200 + 155 − 130 = 225' }] },
                { id: 'julio', celdas: [{ t: 'Julio' }, { f: 250, tipo: 'unidades' },
                  { r: 120, tipo: 'unidades', s: '50 % × 180 (ventas de agosto) + 30 = 120', trampas: [
                    { valor: 180, msg: '180 son las ventas de agosto; el IF es 50 % de ellas + 30.' }
                  ] },
                  { r: 155, tipo: 'unidades', s: 'El II de julio es el IF de junio: 155' },
                  { r: 215, tipo: 'unidades', s: '250 + 120 − 155 = 215' }] }
              ]
            }
          },
          {
            titulo: 'Responde lo que preguntaba el certamen',
            intro: 'Cada pregunta corresponde a una de las cinco afirmaciones del certamen.',
            preguntas: [
              {
                id: 'p1', texto: '¿Cuántos relojes se deben fabricar en junio?', tipo: 'unidades', respuesta: 225,
                pista: 'Producción = ventas + IF deseado − II. El II de junio es el IF de mayo.',
                trampas: [{ valor: 205, propia: true, msg: 'restaste el inventario del 30 de abril (150). El inventario inicial de junio es el final de mayo: 130.' }],
                sol: { d: 'Ventas de junio: 200. IF deseado de junio: 50 % × 250 + 30 = 155. II de junio = IF de mayo = 50 % × 200 + 30 = 130.', f: 'Producción = ventas + IF deseado − II', c: '200 + 155 − 130 = 225 u' }
              },
              {
                id: 'p2', texto: '¿Cuál es el inventario final proyectado para julio?', tipo: 'unidades', respuesta: 120,
                pista: 'Aplica la política a las ventas del mes siguiente (agosto) y suma el inventario de seguridad.',
                trampas: [{ valor: 180, msg: '180 son las ventas de agosto; el IF es 50 % de ellas + 30.' }],
                sol: { d: 'Ventas de agosto: 180. Política: 50 % de las ventas del mes siguiente + 30 unidades de seguridad.', f: 'IF deseado = 50 % × ventas del mes siguiente + inventario de seguridad', c: '50 % × 180 + 30 = 120 u' }
              },
              {
                id: 'p3', texto: '¿Cuál es el saldo de inventario en bodega a fines de julio, valorizado al costo?', tipo: 'pesos', respuesta: 6720000,
                pista: 'Si la utilidad bruta es 30 % del precio neto, el costo es el 70 % restante.',
                trampas: [{ valor: 9600000, propia: true, msg: 'valorizaste al precio de venta. El inventario se valoriza al costo, que es el 70 % del precio neto.' }],
                sol: { d: 'IF de julio: 120 unidades. Precio neto: $ 80.000. Utilidad bruta 30 %, así que el costo es 70 % del precio neto.', f: 'Inventario = unidades × costo unitario', c: '70 % × 80.000 = $ 56.000 por reloj; 120 × 56.000 = $ 6.720.000' }
              },
              {
                id: 'p4', texto: '¿A cuánto ascienden los ingresos por venta netos presupuestados de julio?', tipo: 'pesos', respuesta: 20000000,
                pista: 'Netos significa sin IVA: unidades por el precio neto.',
                trampas: [{ valor: 23800000, msg: 'esa es la venta con IVA; piden los ingresos netos.' }],
                sol: { d: 'Ventas de julio: 250 unidades. Precio: $ 80.000 más IVA (neto).', f: 'Ingresos netos = unidades vendidas × precio neto', c: '250 × 80.000 = $ 20.000.000' }
              },
              {
                id: 'p5', texto: 'Si la empresa estima sus gastos operacionales de julio en un 40 % del margen bruto, ¿cuál es el resultado operacional?', tipo: 'pesos', respuesta: 3600000,
                pista: 'Margen bruto = 30 % de los ingresos netos. Si los gastos son 40 % del margen, queda el 60 %.',
                trampas: [{ valor: 2400000, propia: true, msg: 'esos son los gastos operacionales (40 % del margen bruto). El resultado operacional es lo que queda: el 60 %.' }],
                sol: { d: 'Ingresos netos de julio: $ 20.000.000. Utilidad bruta: 30 %. Gastos operacionales: 40 % del margen bruto.', f: 'Resultado operacional = margen bruto − gastos operacionales', c: '30 % × 20.000.000 = $ 6.000.000 de margen bruto; 6.000.000 × (1 − 40 %) = $ 3.600.000' }
              }
            ]
          }
        ],
        cierre: '<h3>Así venía en el certamen (verdadero o falso)</h3>' +
          '<ul><li>«La cantidad de relojes que se deben fabricar en junio es de 225 unidades.» → <b>Verdadero</b>.</li>' +
          '<li>«El inventario final proyectado para julio es de 180 unidades.» → <b>Falso</b>: son 120.</li>' +
          '<li>«El saldo de inventario en bodega a fines de julio es de $ 6.720.000.» → <b>Verdadero</b>.</li>' +
          '<li>«Si la empresa estima sus gastos operacionales para el mes de julio en un 40 % del margen bruto, el resultado operacional es de $ 3.600.000.» → <b>Verdadero</b>.</li>' +
          '<li>«Los ingresos por venta netos presupuestados en el mes de julio ascienden a $ 20.000.000.» → <b>Verdadero</b>.</li></ul>' +
          '<p>Para responder un verdadero o falso con números hay que hacer el mismo cálculo y comparar.</p>'
      },

      // ------------------------------------------------------------------ E1.2 (extra, simulacro)
      {
        tipo: 'ejercicio',
        id: 'tecno-mundo',
        rol: 'extra',
        simulacro: true,
        area: 'presupuesto',
        titulo: 'Tecno-Mundo Azul S.A.: compras e inventario en pesos',
        fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 4 },
        datos: { inventarioInicial: 220000000, politica: 0.35, seguridad: 40000000, costoVenta: 0.7, octubre: 450000000, noviembre: 520000000, diciembre: 600000000, enero: 480000000 },
        enunciado: '<p>La empresa “Tecno-Mundo Azul S.A.”, un reconocido distribuidor de componentes electrónicos de alta gama para el ensamblaje de servidores y equipos gaming, se enfrenta a la creciente volatilidad de la cadena de suministro global. La gerencia de operaciones y la encargada de presupuestos trabajan en conjunto para optimizar la planificación de inventarios y compras. Están preparando el presupuesto de compras y costo de venta para el cuarto trimestre del año (octubre - diciembre). La correcta gestión es crítica para evitar quiebres de stock y asegurar la disponibilidad de componentes a sus clientes corporativos.</p>' +
          '<p>A continuación, se presenta la información clave para el análisis:</p>' +
          '<ul><li><b>Inventario inicial (1 de octubre):</b> el inventario inicial de componentes del cuarto trimestre (al 30 de septiembre) se valora en <b>$ 220.000.000</b>.</li>' +
          '<li><b>Política de inventario final:</b> para garantizar la continuidad operativa y mitigar riesgos de suministro, Tecno-Mundo mantiene una política de inventario final deseado para cada mes que equivale al <b>35 %</b> del costo de ventas proyectado para el mes siguiente. Adicionalmente, se mantiene un stock de seguridad mínimo de <b>$ 40.000.000</b> en inventario final de producto terminado.</li>' +
          '<li><b>Costo de venta estimado:</b> el costo de venta corresponde a un <b>70 %</b> de las ventas netas proyectadas del mes.</li></ul>' +
          '<p>Proyección de ventas netas (en valores monetarios) para el cuarto trimestre y enero del año siguiente:</p>',
        tablaDatos: {
          cols: ['Mes', 'Ventas netas'],
          filas: [['Octubre', '$ 450.000.000'], ['Noviembre', '$ 520.000.000'], ['Diciembre', '$ 600.000.000'], ['Enero (del año siguiente)', '$ 480.000.000']]
        },
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿A cuánto asciende el costo de venta estimado para el mes de noviembre?', tipo: 'pesos', respuesta: 364000000,
                trampas: [{ valor: 315000000, propia: true, msg: 'ese es el costo de venta de octubre; piden el de noviembre.' }],
                sol: { d: 'Ventas netas de noviembre: $ 520.000.000. El costo de venta es 70 % de las ventas netas del mes.', f: 'Costo de venta = 70 % × ventas netas del mes', c: '70 % × 520.000.000 = $ 364.000.000' }
              },
              {
                id: 'p2', texto: '¿Cuál es el valor del inventario final deseado para el mes de octubre?', tipo: 'pesos', respuesta: 167400000,
                trampas: [
                  { valor: 127400000, propia: true, msg: 'te faltó sumar el stock de seguridad que la empresa mantiene en el inventario final.' },
                  { valor: 222000000, propia: true, msg: 'aplicaste el porcentaje a las ventas de noviembre; la política es sobre el costo de venta del mes siguiente.' }
                ],
                sol: { d: 'Costo de venta de noviembre (el mes siguiente): $ 364.000.000. Política: 35 % de ese costo + $ 40.000.000 de stock de seguridad.', f: 'IF deseado = 35 % × costo de venta del mes siguiente + stock de seguridad', c: '35 % × 364.000.000 + 40.000.000 = 127.400.000 + 40.000.000 = $ 167.400.000' }
              },
              {
                id: 'p3', texto: '¿A cuánto ascienden las compras presupuestadas para el mes de octubre?', tipo: 'pesos', respuesta: 262400000,
                trampas: [{ valor: 397400000, propia: true, msg: 'usaste las ventas de octubre. Lo que sale de la bodega es el costo de venta (70 % de las ventas).' }],
                sol: { d: 'Costo de venta de octubre: 70 % × 450.000.000 = $ 315.000.000. IF deseado de octubre: $ 167.400.000. II al 1 de octubre: $ 220.000.000.', f: 'Compras = costo de venta + IF deseado − II', c: '315.000.000 + 167.400.000 − 220.000.000 = $ 262.400.000' }
              },
              {
                id: 'p4', texto: '¿En qué monto ($) se incrementa o disminuye el inventario final entre octubre y noviembre?', tipo: 'pesos', respuesta: 19600000,
                clasif: {
                  texto: '¿Incremento o decremento?',
                  opciones: ['Incremento', 'Decremento'],
                  correcta: 0,
                  porque: 'El inventario final de noviembre ($ 187.000.000) es mayor que el de octubre ($ 167.400.000): se incrementa.'
                },
                trampas: [{ valor: 187000000, propia: true, msg: 'ese es el inventario final de noviembre. Piden cuánto cambia respecto del de octubre.' }],
                sol: { d: 'IF de octubre: $ 167.400.000. Costo de venta de diciembre: 70 % × 600.000.000 = $ 420.000.000, así que IF de noviembre = 35 % × 420.000.000 + 40.000.000 = $ 187.000.000.', f: 'Variación = IF de noviembre − IF de octubre', c: '187.000.000 − 167.400.000 = $ 19.600.000 de incremento' }
              },
              {
                id: 'p5', texto: '¿Cuál es el costo de venta estimado para el mes de diciembre?', tipo: 'pesos', respuesta: 420000000,
                sol: { d: 'Ventas netas de diciembre: $ 600.000.000. El costo de venta es 70 % de las ventas netas del mes.', f: 'Costo de venta = 70 % × ventas netas del mes', c: '70 % × 600.000.000 = $ 420.000.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Fíjate en el orden:</b> para el inventario final de un mes necesitas el costo de venta del mes <b>siguiente</b>. Por eso el enunciado da las ventas de enero aunque el presupuesto llegue hasta diciembre.</p>'
      },

      // ------------------------------------------------------------------ E1.3 (extra)
      {
        tipo: 'ejercicio',
        id: 'presupuesto-2022',
        rol: 'extra',
        titulo: 'Empresa “Presupuesto 2022”: producción y compras de materia prima',
        fuente: { k: 'certamen', sem: 1, anio: 2022, preg: 4 },
        datos: { octubre: 10800, noviembre: 15600, diciembre: 12200, enero: 10000, politicaPT: 0.25, inventarioPT: 2700, aaCantidad: 4, aaPrecio: 25, zzCantidad: 5, zzPrecio: 30, conversion: 450, _politicaMP: 0.5 },
        enunciado: '<p>La empresa “Presupuesto 2022” muestra las ventas proyectadas para el 4to. trimestre 2022:</p>' +
          tabla(['Presupuesto de ventas', 'Octubre 2022', 'Noviembre 2022', 'Diciembre 2022', 'Enero 2023'], [['Unidades', '10.800', '15.600', '12.200', '10.000']]) +
          '<p>El inventario final de “Productos Terminados” de cada mes debe ser igual al <b>25 %</b> de las ventas estimadas para el próximo mes. Al 01 de octubre de 2022 habría disponibles <b>2.700 unidades</b> de “Productos Terminados”. No existen “Productos en Proceso” al final de cada mes.</p>' +
          '<p>Cada unidad del producto requiere dos tipos de materia prima en las siguientes cantidades:</p>' +
          '<ul><li>Materia Prima AA = <b>4 unidades</b> a <b>$ 25 + IVA</b> por unidad.</li><li>Materia Prima ZZ = <b>5 unidades</b> a <b>$ 30 + IVA</b> por unidad.</li></ul>' +
          '<p>El costo de conversión para cada producto terminado es de <b>$ 450</b> por unidad.</p>' +
          '<p>La materia prima es igual a la mitad de los requerimientos del próximo mes y debe estar al final de cada mes. Este requisito se cumplió al 01 de octubre de 2022.</p>' +
          '<p class="suave">El costo de conversión es lo que cuesta transformar la materia prima en producto terminado (mano de obra y otros costos de fábrica).</p>',
        partes: [
          {
            titulo: 'Prepara los presupuestos de octubre 2022',
            preguntas: [
              {
                id: 'p1', texto: 'Presupuesto de producción de octubre 2022, en unidades físicas', tipo: 'unidades', respuesta: 12000,
                trampas: [{ valor: 14700, propia: true, msg: 'te faltó restar el inventario inicial de 2.700 unidades de productos terminados.' }],
                sol: { d: 'Ventas de octubre: 10.800 u. IF deseado de PT: 25 % × 15.600 (ventas de noviembre) = 3.900 u. II de PT al 1 de octubre: 2.700 u.', f: 'Producción = ventas + IF deseado de PT − II de PT', c: '10.800 + 3.900 − 2.700 = 12.000 u' }
              },
              {
                id: 'p2', texto: 'Presupuesto de producción de octubre 2022, en unidades monetarias ($)', tipo: 'pesos', respuesta: 8400000,
                trampas: [
                  { valor: 8970000, propia: true, msg: 'le sumaste el IVA a la materia prima. El costo de producción se calcula con valores netos.' },
                  { valor: 3000000, propia: true, msg: 'te faltó el costo de conversión de cada unidad: el costo de producción es materia prima más conversión.' }
                ],
                sol: { d: 'Producción de octubre: 12.000 u. Cada unidad usa 4 u de AA a $ 25 y 5 u de ZZ a $ 30 (netos), más $ 450 de costo de conversión.', f: 'Costo de producción = unidades × (materia prima + costo de conversión por unidad)', c: '4 × 25 + 5 × 30 + 450 = $ 700 por unidad; 12.000 × 700 = $ 8.400.000' }
              },
              {
                id: 'p3', texto: 'Presupuesto de compras de materia prima “AA” de octubre 2022, en unidades físicas', tipo: 'unidades', respuesta: 53500,
                trampas: [{ valor: 48000, propia: true, msg: 'eso es lo que se consume en octubre. Para las compras falta ajustar por los inventarios: + IF − II.' }],
                sol: { d: 'Producción de octubre: 12.000 u; producción de noviembre: 15.600 + 25 % × 12.200 − 3.900 = 14.750 u. Cada producto usa 4 u de AA. El inventario de MP es la mitad del requerimiento del mes siguiente.', f: 'Compras de MP = requerimiento del mes + IF de MP − II de MP', c: 'Requerimiento de octubre: 12.000 × 4 = 48.000. IF = 50 % × 14.750 × 4 = 29.500. II = 50 % × 48.000 = 24.000. Compras = 48.000 + 29.500 − 24.000 = 53.500 u' }
              },
              {
                id: 'p4', texto: 'Presupuesto de compras de materia prima “AA” de octubre 2022, en unidades monetarias (valor bruto)', tipo: 'pesos', respuesta: 1591625,
                trampas: [{ valor: 1337500, propia: true, msg: 'ese es el valor neto. Piden el valor bruto: con IVA (× 1,19).' }],
                sol: { d: 'Compras de AA en octubre: 53.500 u. Precio: $ 25 + IVA por unidad.', f: 'Valor bruto = unidades × precio neto × 1,19', c: '53.500 × 25 × 1,19 = $ 1.591.625' }
              }
            ]
          }
        ],
        cierre: '<p><b>Dos niveles de la misma fórmula:</b> primero se usa en productos terminados (para saber cuánto producir) y después en materia prima (para saber cuánto comprar). Para el inventario final de materia prima de octubre hay que calcular antes la producción de noviembre.</p>'
      },

      // ------------------------------------------------------------------ E1.4 (extra)
      {
        tipo: 'ejercicio',
        id: 'bicicletas',
        rol: 'extra',
        titulo: 'Bicicletas: presupuesto de una empresa comercial',
        fuente: { k: 'certamen', sem: 2, anio: 2022, preg: 4 },
        datos: { inventarioInicial: 1200, costoInicial: 50000, ventas: 4000, precio: 75000, politica: 0.25, costoCompra: 55000 },
        enunciado: '<p>Se tienen los siguientes antecedentes para preparar el presupuesto:</p>' +
          '<ol><li>El inventario inicial de las mercaderías corresponde a <b>1.200 bicicletas</b> con un costo unitario de <b>$ 50.000</b> cada una.</li>' +
          '<li>Se proyecta vender <b>4.000 bicicletas</b> a un precio neto de <b>$ 75.000 + IVA</b>, al contado 60 %, resto al crédito. La política de inventario es tener un inventario final igual al <b>25 %</b> de los productos vendidos del período.</li>' +
          '<li>Se proyecta cobrar el 70 % de las cuentas por cobrar.</li>' +
          '<li>El precio neto proyectado de compra por bicicleta es <b>$ 55.000</b>. La empresa utiliza el método FIFO para valorizar inventarios. La política de pagos por compras es 50 % al contado y el resto a crédito.</li>' +
          '<li>Se planea rescatar el depósito a plazo más intereses del 2 %.</li>' +
          '<li>Se estima que los valores negociables suban un 10 % durante el mes.</li>' +
          '<li>Se planea pagar el saldo de proveedores y el total de cuentas por pagar.</li>' +
          '<li>Los gastos operacionales se estiman en un 20 % del valor de las ventas. La política de pago de los gastos es 60 % al contado y 40 % a 30 días.</li></ol>' +
          '<p class="suave">FIFO significa “primero en entrar, primero en salir”: se venden primero las unidades más antiguas. Varios antecedentes hablan de cuentas que este enunciado no detalla (depósito a plazo, valores negociables, proveedores): no se necesitan para las cinco preguntas.</p>',
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Cuál es la venta bruta proyectada?', tipo: 'pesos', respuesta: 357000000,
                trampas: [{ valor: 300000000, propia: true, msg: 'esa es la venta neta. Piden la venta bruta: con IVA (× 1,19).' }],
                sol: { d: 'Ventas: 4.000 bicicletas a $ 75.000 + IVA.', f: 'Venta bruta = unidades × precio neto × 1,19', c: '4.000 × 75.000 × 1,19 = $ 357.000.000' }
              },
              {
                id: 'p2', texto: '¿A cuánto asciende la compra proyectada para el período a valor neto?', tipo: 'pesos', respuesta: 209000000,
                trampas: [
                  { valor: 220000000, propia: true, msg: 'compraste lo mismo que se vende. Falta ajustar por los inventarios: + IF deseado − II.' },
                  { valor: 248710000, propia: true, msg: 'le sumaste el IVA. Piden la compra a valor neto.' }
                ],
                sol: { d: 'Ventas: 4.000 u. IF deseado: 25 % × 4.000 = 1.000 u. II: 1.200 u. Precio neto de compra: $ 55.000.', f: 'Compras = ventas + IF deseado − II', c: '4.000 + 1.000 − 1.200 = 3.800 bicicletas; 3.800 × 55.000 = $ 209.000.000' }
              },
              {
                id: 'p3', texto: '¿Cuál es el margen bruto que se proyecta obtener?', tipo: 'pesos', respuesta: 86000000,
                trampas: [{ valor: 143000000, propia: true, msg: 'usaste la venta con IVA. El margen bruto se calcula con valores netos.' }],
                sol: { d: 'Venta neta: 4.000 × 75.000 = $ 300.000.000. Costo de venta por FIFO: 1.200 × 50.000 + 2.800 × 55.000 = $ 214.000.000.', f: 'Margen bruto = ventas netas − costo de venta', c: '300.000.000 − 214.000.000 = $ 86.000.000' }
              },
              {
                id: 'p4', texto: '¿Cuál sería el costo de venta que se proyecta por FIFO?', tipo: 'pesos', respuesta: 214000000,
                trampas: [{ valor: 220000000, propia: true, msg: 'costeaste todo al precio de la compra nueva. Con FIFO salen primero las 1.200 bicicletas del inventario inicial, a su costo.' }],
                sol: { d: 'Se venden 4.000 bicicletas. Inventario inicial: 1.200 a $ 50.000. Compras del período a $ 55.000.', f: 'FIFO: primero sale el inventario inicial; el resto, de las compras', c: '1.200 × 50.000 + 2.800 × 55.000 = 60.000.000 + 154.000.000 = $ 214.000.000' }
              },
              {
                id: 'p5', texto: 'El saldo inicial del IVA es cero. ¿Cuál sería la situación del IVA por pagar del período?', tipo: 'pesos', respuesta: 17290000,
                trampas: [{ valor: 57000000, propia: true, msg: 'ese es solo el IVA de las ventas (débito). Falta restar el IVA de las compras (crédito).' }],
                sol: { d: 'Ventas netas: $ 300.000.000. Compras netas: $ 209.000.000. IVA: 19 %.', f: 'IVA por pagar = IVA débito (ventas) − IVA crédito (compras)', c: '19 % × 300.000.000 − 19 % × 209.000.000 = 57.000.000 − 39.710.000 = $ 17.290.000' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ L1.6
      {
        tipo: 'leccion',
        id: 'relaciones-historicas',
        titulo: 'Proyección por relaciones históricas',
        idea: 'Para proyectar el año que viene, los ingresos crecen según el dato que entregan y los costos se calculan como un porcentaje de esos ingresos.',
        partes: [
          { k: 'p', h: 'Algunos ejercicios entregan los resultados de varios años y piden proyectar el siguiente. Siempre son los mismos tres pasos:' },
          { k: 'pasos', items: [
            { t: 'Ingresos', h: 'Calcula el crecimiento con el dato dado (“2 veces el PIB”, “1 % por cada punto del PIB”) y aplícalo a los ingresos del último año. El PIB es el producto interno bruto.' },
            { t: 'Costos y gastos', h: 'Calcúlalos con su proporción histórica sobre los ingresos, o con la nueva proporción si el enunciado la cambia.' },
            { t: 'Resultado', h: 'Ingresos − costos − gastos da la utilidad antes de impuesto. La utilidad neta es esa utilidad × (1 − tasa de impuesto).' }
          ] },
          { k: 'formula', h: 'Ingresos proyectados = Ingresos del último año × (1 + crecimiento)' },
          { k: 'p', h: '**El incobrable es un gasto aparte:** no cambia los ingresos por venta.' },
          { k: 'asi', items: [
            '«¿Utilidad neta proyectada?» → ingresos proyectados − costos − gastos y, al final, × (1 − tasa de impuesto).',
            '«Si se proyecta incobrabilidad, ¿cambian los ingresos por ventas?» → no cambian: el incobrable es un gasto aparte y los ingresos por venta quedan igual.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ E1.5
      {
        tipo: 'ejercicio',
        id: 'abc-2025',
        titulo: 'Empresa “ABC”: proyección 2025',
        fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 2 },
        datos: { ingresos2024: 94875, costos2024: 47438, gadm2024: 9488, vecesPib: 2, pib: 0.025, costosNuevo: 0.4, impuesto: 0.27, _incobrable: 0.05 },
        enunciado: '<p>El directorio de la empresa “ABC” revisó los resultados del año 2024 y pidió una proyección de presupuesto a su equipo gerencial.</p>' +
          '<p><b>Información histórica</b> (M$ = miles de pesos)</p>' +
          tabla(['Ítems', '2021', '2022', '2023', '2024'], [
            ['Variación de ingresos', '', '10,0 %', '15,0 %', '25,0 %'],
            ['Ingresos (M$)', '60.000', '66.000', '75.900', '94.875'],
            ['Costos (M$)', '30.000', '33.000', '37.950', '47.438'],
            ['Gastos de administración (M$)', '6.000', '6.600', '7.590', '9.488'],
            ['Utilidad (M$)', '24.000', '26.400', '30.360', '37.950'],
            ['Impuestos (27 %) (M$)', '6.480', '7.128', '8.197', '10.247'],
            ['Utilidad neta (M$)', '17.520', '19.272', '22.163', '27.704']
          ]) +
          '<p><b>Proyecciones 2025:</b></p>' +
          '<ul><li>Se ha encargado un estudio a una consultora, la que indica que el crecimiento esperado en el año 2025 será equivalente a <b>2 veces</b> la variación del PIB (producto interno bruto) proyectado.</li>' +
          '<li>Variación del PIB proyectado 2025: <b>2,5 %</b>.</li>' +
          '<li>Reorganización de la empresa: se ha hecho una reorganización de los procesos, y se espera que los costos se mantengan el año 2025 en un <b>40 %</b> de los ingresos.</li>' +
          '<li>Los gastos de administración se mantienen en igual proporción que los años anteriores.</li>' +
          '<li>Tasa de impuestos: <b>27 %</b>.</li></ul>',
        partes: [
          {
            titulo: 'Paso 1 · Ingresos proyectados y proporciones históricas',
            modelo: 'Crecimiento = 2 × 2,5 % = 5 %. Ingresos 2025 = 94.875 × 1,05 = 99.618,75 ≈ <b>M$ 99.619</b>.<br>Proporciones históricas: costos 47.438 ÷ 94.875 = 50 %; gastos de administración 9.488 ÷ 94.875 = 10 %.',
            nota: 'Este primer paso va hecho como modelo. Cada línea del estado proyectado se anota como entero de M$, pero calcula con todos los decimales.'
          },
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Cuánto es la utilidad neta proyectada 2025?', tipo: 'pesos', moneda: 'M$', respuesta: 36361,
                pista: 'Ingresos − costos (40 %) − gastos de administración (10 %), y al resultado quítale el 27 % de impuesto.',
                trampas: [{ valor: 49809, propia: true, msg: 'esa es la utilidad antes de impuesto. Falta descontar el impuesto: × (1 − 27 %).' }],
                sol: { d: 'Ingresos 2025: M$ 99.619. Costos: 40 % de los ingresos. Gastos de administración: 10 % de los ingresos. Impuesto: 27 %.', f: 'Utilidad neta = (ingresos − costos − gastos) × (1 − tasa de impuesto)', c: '99.619 − 39.848 − 9.962 = 49.809; 49.809 × 0,73 = M$ 36.361' }
              },
              {
                id: 'p2', texto: '¿A cuánto ascienden los costos proyectados 2025?', tipo: 'pesos', moneda: 'M$', respuesta: 39848,
                pista: 'Con la reorganización los costos pasan a ser el 40 % de los ingresos proyectados.',
                trampas: [
                  { valor: 49809, propia: true, msg: 'usaste la proporción histórica de costos. Con la reorganización bajan a 40 % de los ingresos.' },
                  { valor: 38899, propia: true, msg: 'hiciste crecer los ingresos solo 2,5 %. El crecimiento es 2 veces la variación del PIB.' }
                ],
                sol: { d: 'Ingresos 2025: 94.875 × 1,05 = 99.618,75. Con la reorganización, los costos son 40 % de los ingresos.', f: 'Costos proyectados = % de costos × ingresos proyectados', c: '40 % × 99.618,75 = 39.847,5 ≈ M$ 39.848' }
              },
              {
                id: 'p3', texto: '¿A cuánto equivalen los gastos de administración proyectados 2025?', tipo: 'pesos', moneda: 'M$', respuesta: 9962,
                pista: 'Mantienen su proporción histórica sobre los ingresos: 10 %.',
                trampas: [{ valor: 9725, propia: true, msg: 'hiciste crecer los ingresos solo 2,5 %. El crecimiento es 2 veces la variación del PIB.' }],
                sol: { d: 'Ingresos 2025: 99.618,75. Los gastos de administración mantienen su proporción histórica: 10 % de los ingresos.', f: 'Gastos proyectados = % histórico × ingresos proyectados', c: '10 % × 99.618,75 = 9.961,875 ≈ M$ 9.962' }
              },
              {
                id: 'p4', texto: 'Si no se hubiese hecho la reorganización, ¿cuál hubiera sido la utilidad proyectada 2025?', tipo: 'pesos', moneda: 'M$', respuesta: 29089,
                pista: 'Sin la reorganización, los costos siguen en su proporción histórica de 50 %. La pauta pide la utilidad neta.',
                trampas: [{ valor: 39848, propia: true, msg: 'esa es la utilidad antes de impuesto. La pauta considera la utilidad neta: × (1 − 27 %).' }],
                sol: { d: 'Sin la reorganización, los costos mantienen su proporción histórica: 50 % de los ingresos = M$ 49.809. Gastos de administración: M$ 9.962.', f: 'Utilidad neta = (ingresos − costos − gastos) × (1 − tasa de impuesto)', c: '99.619 − 49.809 − 9.962 = 39.848; 39.848 × 0,73 = M$ 29.089' }
              },
              {
                id: 'p5', texto: 'Si se hubiere proyectado que la incobrabilidad de las ventas es de un 5 %, ¿cambian los ingresos por ventas proyectados 2025?', tipo: 'opcion',
                opciones: ['Sí', 'No'], correcta: 1,
                porque: 'El incobrable es un gasto (una pérdida) aparte: no rebaja los ingresos por venta. La venta se registra completa cuando se factura.'
              }
            ]
          }
        ],
        cierre: '<p><b>Lo que se lleva la reorganización:</b> bajar los costos de 50 % a 40 % de los ingresos sube la utilidad neta de M$ 29.089 a M$ 36.361.</p>'
      },

      // ------------------------------------------------------------------ E1.6 (extra)
      {
        tipo: 'ejercicio',
        id: 'abc-2023',
        rol: 'extra',
        titulo: 'Empresa “ABC”: proyección 2023',
        fuente: { k: 'certamen', sem: 2, anio: 2023, preg: 5 },
        datos: { ingresos2022: 180000, costos2022: 90000, gadm2022: 18000, pib: 0.035, costosNuevo: 0.55, impuesto: 0.27, _caida: 0.2 },
        enunciado: '<p>El directorio de la empresa “ABC” revisó los resultados del año 2022 y pidió una proyección de presupuesto a su equipo gerencial.</p>' +
          '<p><b>Información histórica</b></p>' +
          tabla(['Ítems', 'Año 2019', 'Año 2020', 'Año 2021', 'Año 2022'], [
            ['Variación de ingresos', '', '−10 %', '15 %', '3 %'],
            ['Variación del PIB', '', '−6 %', '12 %', '2 %'],
            ['Ingresos', '$ 168.848', '$ 151.963', '$ 174.757', '$ 180.000'],
            ['Costos', '$ 84.424', '$ 75.981', '$ 87.379', '$ 90.000'],
            ['Gastos administrativos', '$ 16.885', '$ 15.196', '$ 17.476', '$ 18.000']
          ]) +
          '<p><b>Proyecciones 2023:</b></p>' +
          '<ul><li>Se ha encargado un estudio a una consultora, la que indica que, por cada punto porcentual de subida en el PIB (producto interno bruto), los ingresos subirán un 1 %.</li>' +
          '<li>Variación del PIB: <b>3,5 %</b>.</li>' +
          '<li>La subida de costos laborales generará un incremento en los costos, pasando a ser un <b>55 %</b> de los ingresos.</li>' +
          '<li>Tasa de impuesto a la renta: <b>27 %</b>.</li>' +
          '<li>Se espera que se mantenga la relación histórica de ingresos y gastos.</li></ul>' +
          '<p><b>Importante:</b> la respuesta debe ser aproximada a un número entero.</p>',
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Cuánto es la utilidad neta proyectada para el año 2023?', tipo: 'pesos', respuesta: 47600,
                trampas: [{ valor: 65205, propia: true, msg: 'esa es la utilidad antes de impuesto. Falta descontar el impuesto: × (1 − 27 %).' }],
                sol: { d: 'Ingresos 2023: 180.000 × 1,035 = $ 186.300. Costos: 55 % de los ingresos. Gastos administrativos: mantienen su relación histórica, 18.000 ÷ 180.000 = 10 %. Impuesto: 27 %.', f: 'Utilidad neta = (ingresos − costos − gastos) × (1 − tasa de impuesto)', c: '186.300 − 102.465 − 18.630 = 65.205; 65.205 × 0,73 = 47.599,65 ≈ $ 47.600' }
              },
              {
                id: 'p2', texto: '¿Cuánto son los costos proyectados para el período 2023?', tipo: 'pesos', respuesta: 102465,
                trampas: [{ valor: 93150, propia: true, msg: 'usaste la relación histórica de costos. Por los costos laborales pasan a 55 % de los ingresos.' }],
                sol: { d: 'Ingresos 2023: $ 186.300. Los costos pasan a ser 55 % de los ingresos.', f: 'Costos proyectados = % de costos × ingresos proyectados', c: '55 % × 186.300 = $ 102.465' }
              },
              {
                id: 'p3', texto: 'Si no se hubiese dado el incremento de costos laborales y se mantiene su relación histórica, ¿a cuánto asciende la utilidad neta proyectada para el año 2023?', tipo: 'pesos', respuesta: 54400,
                trampas: [{ valor: 74520, propia: true, msg: 'esa es la utilidad antes de impuesto. Falta descontar el impuesto: × (1 − 27 %).' }],
                sol: { d: 'Relación histórica de costos: 90.000 ÷ 180.000 = 50 %. Ingresos 2023: $ 186.300. Gastos administrativos: $ 18.630.', f: 'Utilidad neta = (ingresos − costos − gastos) × (1 − tasa de impuesto)', c: '186.300 − 93.150 − 18.630 = 74.520; 74.520 × 0,73 = 54.399,6 ≈ $ 54.400' }
              },
              {
                id: 'p4', texto: 'La empresa en el primer trimestre del año 2023 tiene una fuga de clientes producto de la entrada al mercado de un nuevo competidor, lo que hace caer sus ingresos anuales proyectados en un 20 %, sin alterar los demás supuestos. ¿Cuál es la utilidad bruta proyectada (resultado antes de impuestos) para el año 2023?', tipo: 'pesos', respuesta: 52164,
                tambien: [{ valor: 59616, pauta: true, nota: 'La pauta del certamen también acepta este valor, que sale de dejar los costos en su relación histórica de 50 %: 149.040 × (1 − 50 % − 10 %).' }],
                trampas: [{ valor: 38080, propia: true, msg: 'le aplicaste el impuesto. Piden el resultado antes de impuestos.' }],
                sol: { d: 'Ingresos con la caída: 186.300 × (1 − 20 %) = $ 149.040. Los demás supuestos no cambian: costos 55 % y gastos administrativos 10 % de los ingresos.', f: 'Resultado antes de impuestos = ingresos − costos − gastos', c: '149.040 − 55 % × 149.040 − 10 % × 149.040 = 149.040 − 81.972 − 14.904 = $ 52.164' }
              },
              {
                id: 'p5', texto: '¿A cuánto ascienden los gastos administrativos proyectados para el año 2023?', tipo: 'pesos', respuesta: 18630,
                trampas: [{ valor: 18000, propia: true, msg: 'ese es el gasto del año 2022. Para 2023 se mantiene la proporción (10 %), pero sobre los ingresos proyectados.' }],
                sol: { d: 'Ingresos 2023: $ 186.300. Los gastos administrativos mantienen su relación histórica: 10 % de los ingresos.', f: 'Gastos proyectados = % histórico × ingresos proyectados', c: '10 % × 186.300 = $ 18.630' }
              }
            ]
          }
        ]
      },

      // ------------------------------------------------------------------ L1.7
      {
        tipo: 'leccion',
        id: 'caja',
        titulo: 'El presupuesto de caja: devengado versus percibido',
        idea: 'El resultado cuenta lo que se facturó; la caja, lo que de verdad se cobró y se pagó. Por eso se puede ganar plata y quedarse sin caja.',
        partes: [
          { k: 'practica', h: 'Vender $ 1.000.000 en marzo a 30 días da ingreso en marzo, pero la caja lo recibe en abril. Por eso se puede ganar plata y quedarse sin caja.' },
          { k: 'p', h: 'El **presupuesto de caja** resume las entradas y salidas de efectivo de cada mes. Sirve para anticipar **excedentes** (invertirlos, aprovechar descuentos) y **déficits** (financiarlos con crédito o postergando pagos), y da una base para pedir créditos. Se arma con lo disponible en caja, bancos y valores de fácil realización.' },
          { k: 'p', h: 'El resultado registra las ventas cuando se facturan (**devengado**); la caja, cuando se cobran (**percibido**). Lo que todavía no se cobra queda en **cuentas por cobrar (CxC)**.' },
          { k: 'comparar', cols: ['', 'En el resultado', 'En la caja'], filas: [
            ['Venta a crédito', 'Cuenta en el mes en que se factura.', 'Entra cuando se cobra.'],
            ['Depreciación', 'Sí: es gasto.', '<b>No</b> sale de caja.'],
            ['Incobrable', 'Es gasto (una pérdida).', '<b>Nunca</b> entra a caja.'],
            ['IVA (impuesto al valor agregado, 19 %)', 'No se considera: el resultado va siempre con valores <b>netos</b>.', 'Si el precio es neto, el cliente paga el <b>bruto</b> (× 1,19), salvo que el enunciado diga omitir el IVA.']
          ] },
          { k: 'formula', h: 'Cobranzas del mes = % al contado × venta del mes + % a crédito × venta del mes anterior' },
          { k: 'asi', items: [
            '«¿Cobranzas del mes?» → % al contado del mes + % del mes anterior, <b>con IVA</b> si el precio es neto.',
            '«¿Cuentas por cobrar al cierre?» → es lo vendido que todavía no se cobra: normalmente, la parte a crédito de las ventas del último mes.',
            '«¿Resultado neto?» → estado de resultados con valores netos, con los incobrables y la depreciación como gasto, × (1 − tasa de impuesto).',
            'Verdadero o falso: «la depreciación es una salida de efectivo en el presupuesto de caja» → es falso: la depreciación es un gasto, pero no sale plata de la caja.'
          ] }
        ]
      },

      // ------------------------------------------------------------------ E1.7 (simulacro)
      {
        tipo: 'ejercicio',
        id: 'rubbermaid',
        simulacro: true,
        area: 'presupuesto',
        titulo: 'Rubbermaid Ltda.: presupuesto, caja y resultado',
        etiqueta: 'Ejercicio completo',
        fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 4 },
        datos: {
          precio: 15000, costo: 9000, julio: 2000, agosto: 2400, septiembre: 2200, octubre: 2500,
          contado: 0.55, credito: 0.35, incobrable: 0.1, cxcInicial: 9500000,
          politica: 0.25, inventarioInicial: 600, pagoContado: 0.6, pagoCredito: 0.4, cxpInicial: 7200000,
          sueldos: 2400000, arriendo: 1100000, publicidad: 750000, depreciacion: 500000, impuesto: 0.27
        },
        enunciado: '<p>La empresa comercial Rubbermaid Ltda. se dedica a la compra y venta de un único producto. La administración está preparando el presupuesto correspondiente al trimestre julio, agosto y septiembre de 2026. La empresa utiliza presupuestos operativos y financieros para proyectar sus ventas, compras, resultado y posición de caja.</p>' +
          '<p>Para efectos del ejercicio, considere un impuesto a la renta de <b>27 %</b>, el cual se calcula sobre el resultado acumulado del trimestre, no mensualmente.</p>' +
          '<p><b>Antecedentes:</b></p>' +
          tabla(['Mes', 'Ventas presupuestadas (unidades)'], [['Julio', '2.000'], ['Agosto', '2.400'], ['Septiembre', '2.200'], ['Octubre', '2.500']]) +
          tabla(['Gastos mensuales', 'Monto'], [['Sueldos administrativos', '$ 2.400.000'], ['Arriendo', '$ 1.100.000'], ['Publicidad', '$ 750.000'], ['Depreciación', '$ 500.000']]) +
          '<p>El precio de venta unitario es de <b>$ 15.000 neto</b>. La política de cobranza es la siguiente:</p>' +
          '<ul><li><b>55 %</b> de las ventas se cobra al contado.</li><li><b>35 %</b> se cobra al mes siguiente.</li><li><b>10 %</b> se considera incobrable.</li></ul>' +
          '<p>Al 30 de junio existe un saldo de cuentas por cobrar de <b>$ 9.500.000</b>, el cual se cobrará íntegramente durante julio.</p>' +
          '<ol><li><b>Política de inventarios:</b> la empresa desea mantener como inventario final de cada mes un stock equivalente al <b>25 %</b> de las ventas presupuestadas del mes siguiente. El inventario inicial al 1 de julio es de <b>600 unidades</b>.</li>' +
          '<li><b>Política de compras:</b> el costo de compra unitario del producto es de <b>$ 9.000 neto</b>. La política de pago a proveedores es: 60 % de las compras se paga al contado y 40 % se paga al mes siguiente. Al 30 de junio existe una cuenta por pagar a proveedores de $ 7.200.000, la cual debe pagarse durante julio.</li>' +
          '<li><b>Política de cuentas incobrables:</b> las cuentas incobrables se castigan en el mes de la venta, lo que significa que se reconoce la pérdida en dicho mes.</li></ol>',
        partes: [
          {
            titulo: 'Primer paso (hecho, como modelo)',
            modelo: 'Ventas netas de julio = 2.000 × 15.000 = <b>$ 30.000.000</b>. Lo que el cliente paga por esa venta es el valor con IVA: 30.000.000 × 1,19 = <b>$ 35.700.000</b>.',
            nota: 'Ese es el patrón de todo el ejercicio: el resultado se calcula con valores netos; la caja, con valores brutos.'
          },
          {
            titulo: 'Preguntas 1 a 4 · Ventas, compras y caja',
            preguntas: [
              {
                id: 'p1', texto: '¿Cuál es el monto de las ventas netas presupuestadas de agosto 2026?', tipo: 'pesos', respuesta: 36000000,
                pista: 'Unidades de agosto por el precio neto.',
                trampas: [{ valor: 42840000, msg: 'esa es la venta bruta (con IVA); piden las ventas netas.' }],
                sol: { d: 'Ventas de agosto: 2.400 unidades. Precio: $ 15.000 neto.', f: 'Ventas netas = unidades × precio neto', c: '2.400 × 15.000 = $ 36.000.000' }
              },
              {
                id: 'p2', texto: '¿Cuál es el monto total de compras netas presupuestadas de julio 2026?', tipo: 'pesos', respuesta: 18000000,
                pista: 'Compras = ventas + IF deseado − II. El IF de julio es 25 % de las ventas de agosto.',
                trampas: [
                  { valor: 23400000, propia: true, msg: 'te faltó restar el inventario inicial de 600 unidades.' },
                  { valor: 21420000, propia: true, msg: 'le sumaste el IVA. Piden las compras netas.' }
                ],
                sol: { d: 'Ventas de julio: 2.000 u. IF deseado de julio: 25 % × 2.400 (ventas de agosto) = 600 u. II al 1 de julio: 600 u. Costo de compra: $ 9.000 neto.', f: 'Compras = ventas + IF deseado − II', c: '2.000 + 600 − 600 = 2.000 u; 2.000 × 9.000 = $ 18.000.000' }
              },
              {
                id: 'p3', texto: '¿Cuál es el monto de cuentas por cobrar al 30 de septiembre de 2026?', tipo: 'pesos', respuesta: 13744500,
                pista: 'Al cierre de septiembre solo queda por cobrar el 35 % de la venta de septiembre, y el cliente debe la factura con IVA.',
                trampas: [
                  { valor: 11550000, msg: 'falta el IVA: el cliente debe la factura completa, con IVA.' },
                  { valor: 17671500, msg: 'el incobrable ya se castigó en el mes de la venta: ese 10 % no queda por cobrar.' }
                ],
                sol: { d: 'Ventas netas de septiembre: 2.200 × 15.000 = $ 33.000.000. Se cobra 35 % al mes siguiente. El 10 % incobrable ya se castigó.', f: 'CxC = % a crédito × venta bruta del último mes', c: '35 % × 33.000.000 × 1,19 = $ 13.744.500' }
              },
              {
                id: 'p4', texto: '¿Cuál es la entrada de efectivo total de agosto 2026 por concepto de cobranzas?', tipo: 'pesos', respuesta: 36057000,
                pista: 'En agosto entra el 55 % de la venta de agosto y el 35 % de la venta de julio, las dos con IVA.',
                trampas: [
                  { valor: 30300000, msg: 'calculaste sin IVA; el cliente paga la factura con IVA.' },
                  { valor: 23562000, propia: true, msg: 'te faltó lo que se cobra en agosto de la venta de julio (35 %).' }
                ],
                sol: { d: 'Venta bruta de agosto: 36.000.000 × 1,19 = $ 42.840.000. Venta bruta de julio: 30.000.000 × 1,19 = $ 35.700.000. Cobranza: 55 % al contado y 35 % al mes siguiente.', f: 'Cobranzas del mes = % al contado × venta bruta del mes + % a crédito × venta bruta del mes anterior', c: '55 % × 42.840.000 + 35 % × 35.700.000 = 23.562.000 + 12.495.000 = $ 36.057.000' }
              }
            ]
          },
          {
            titulo: 'Pregunta 5 · Estado de resultados del trimestre',
            intro: 'Arma el estado de resultados de julio a septiembre con valores netos. Todos los montos se escriben en positivo; el signo lo indica cada fila.',
            tabla: {
              id: 'eerr',
              cols: ['Estado de resultados del trimestre', 'Monto'],
              filas: [
                { id: 'ventas', celdas: [{ t: 'Ventas netas' }, { r: 99000000, tipo: 'pesos', s: '(2.000 + 2.400 + 2.200) × 15.000 = 6.600 × 15.000 = $ 99.000.000', trampas: [{ valor: 117810000, propia: true, msg: 'El resultado se calcula con ventas netas, sin IVA.' }] }] },
                { id: 'costo', celdas: [{ t: '− Costo de venta' }, { r: 59400000, tipo: 'pesos', s: '6.600 × 9.000 = $ 59.400.000' }] },
                { id: 'mb', total: true, celdas: [{ t: '= Margen bruto' }, { r: 39600000, tipo: 'pesos', s: '99.000.000 − 59.400.000 = $ 39.600.000' }] },
                { id: 'incob', celdas: [{ t: '− Incobrables' }, { r: 9900000, tipo: 'pesos', s: '10 % × 99.000.000 = $ 9.900.000' }] },
                { id: 'gastos', celdas: [{ t: '− Gastos del trimestre' }, { r: 14250000, tipo: 'pesos', s: '(2.400.000 + 1.100.000 + 750.000 + 500.000) × 3 = $ 14.250.000 (incluye la depreciación)', trampas: [{ valor: 12750000, propia: true, msg: 'Te faltó la depreciación: no sale de caja, pero sí es gasto en el resultado.' }] }] },
                { id: 'rai', total: true, celdas: [{ t: '= Resultado antes de impuesto' }, { r: 15450000, tipo: 'pesos', s: '39.600.000 − 9.900.000 − 14.250.000 = $ 15.450.000', trampas: [{ valor: 16950000, propia: true, msg: 'Te faltó la depreciación: no sale de caja, pero sí es gasto en el resultado.' }] }] },
                { id: 'imp', celdas: [{ t: '− Impuesto a la renta (27 %)' }, { r: 4171500, tipo: 'pesos', s: '27 % × 15.450.000 = $ 4.171.500' }] },
                { id: 'neto', total: true, celdas: [{ t: '= Resultado neto' }, { r: 11278500, tipo: 'pesos', s: '15.450.000 − 4.171.500 = $ 11.278.500', trampas: [{ valor: 12373500, msg: 'La depreciación sí es gasto en el resultado, aunque no salga de caja.' }] }] }
              ]
            },
            preguntas: [
              {
                id: 'p5', texto: '¿Cuál es el resultado neto proyectado del trimestre julio-septiembre 2026, considerando impuesto a la renta de 27 %?', tipo: 'pesos', respuesta: 11278500,
                pista: 'Es la última línea del estado de resultados que armaste.',
                trampas: [
                  { valor: 12373500, msg: 'la depreciación sí es gasto en el resultado, aunque no salga de caja.' },
                  { valor: 15450000, propia: true, msg: 'ese es el resultado antes de impuesto. Falta descontar el impuesto a la renta.' }
                ],
                sol: { d: 'Ventas netas del trimestre: $ 99.000.000. Costo de venta: $ 59.400.000. Incobrables: 10 % de las ventas = $ 9.900.000. Gastos: $ 4.750.000 por mes (con la depreciación) = $ 14.250.000. Impuesto: 27 %.', f: 'Resultado neto = (ventas − costo de venta − incobrables − gastos) × (1 − tasa de impuesto)', c: '99.000.000 − 59.400.000 − 9.900.000 − 14.250.000 = 15.450.000; 15.450.000 × 0,73 = $ 11.278.500' }
              }
            ]
          }
        ],
        cierre: '<h3>Tres diferencias entre el resultado y la caja</h3>' +
          '<ul><li><b>IVA:</b> las ventas del resultado van netas ($ 36.000.000 en agosto), pero el cliente paga la factura con IVA ($ 42.840.000).</li>' +
          '<li><b>Incobrable:</b> es gasto en el resultado ($ 9.900.000 en el trimestre) y nunca entra a la caja.</li>' +
          '<li><b>Depreciación:</b> es gasto en el resultado ($ 500.000 por mes) y no sale de la caja.</li></ul>'
      },

      // ------------------------------------------------------------------ E1.8 (extra)
      {
        tipo: 'ejercicio',
        id: 'tesla',
        rol: 'extra',
        titulo: 'Tesla Inc.: presupuesto de caja con ventas brutas',
        fuente: { k: 'certamen', sem: 2, anio: 2024, preg: 5, nota: 'preguntas 2 a 5' },
        datos: {
          cxcInicial: 11900000, cxcEnero: 0.85, cxcFebrero: 0.15,
          enero: 23800000, eneroMes: 0.65, eneroSiguiente: 0.25,
          febrero: 9520000, marzo: 14280000, marzoAbril: 0.5,
          abril: 17850000, abrilPago: 16065000, descuento: 0.1, _costoVenta: 0.5
        },
        enunciado: '<p>La empresa “Tesla Inc.”, que vende autos eléctricos en miniatura, se encuentra preparando el presupuesto de efectivo (caja) para el primer cuatrimestre del año 2025. La información de saldos, ventas proyectadas y formas de pago sería la siguiente:</p>' +
          '<p>Saldo de cuentas por cobrar (clientes) al 31 de diciembre de 2024: <b>$ 11.900.000</b>, las cuales se espera sean pagadas un <b>85 %</b> en el mes siguiente, y el <b>15 %</b> restante, en el mes de febrero 2025.</p>' +
          '<p>Las ventas <b>brutas</b> de cada mes y sus respectivos pagos sucederían de la siguiente forma:</p>' +
          '<ul><li><b>Enero: $ 23.800.000.</b> El cliente pagará por transferencia el 65 % en el mismo mes y 25 % al mes siguiente. El resto se espera sea incobrable.</li>' +
          '<li><b>Febrero: $ 9.520.000.</b> El cliente paga la totalidad de la factura al mes siguiente.</li>' +
          '<li><b>Marzo: $ 14.280.000.</b> El cliente paga el 50 % de la factura en abril y el resto lo pagará en mayo.</li>' +
          '<li><b>Abril: $ 17.850.000.</b> El cliente paga $ 16.065.000, ya que le hacen un descuento por pronto pago de 10 %.</li></ul>',
        partes: [
          {
            titulo: 'Responde las preguntas del certamen',
            preguntas: [
              {
                id: 'p1', texto: '¿Cuál es el saldo de incobrable al final de abril 2025?', tipo: 'pesos', respuesta: 2380000,
                trampas: [{ valor: 4165000, propia: true, msg: 'sumaste el descuento por pronto pago de abril. Ese descuento no es un incobrable: es una rebaja acordada con el cliente.' }],
                sol: { d: 'Venta bruta de enero: $ 23.800.000. Se cobra 65 % en enero y 25 % en febrero; el resto (10 %) es incobrable.', f: 'Incobrable = % incobrable × venta', c: '(100 % − 65 % − 25 %) × 23.800.000 = 10 % × 23.800.000 = $ 2.380.000' }
              },
              {
                id: 'p2', texto: '¿A cuánto ascienden las facturas de venta pendientes, sin considerar los incobrables, al cierre de abril 2025?', tipo: 'pesos', respuesta: 7140000,
                trampas: [{ valor: 9520000, propia: true, msg: 'incluiste el incobrable de enero. La pregunta pide las facturas pendientes sin considerarlo.' }],
                sol: { d: 'Venta de marzo: $ 14.280.000; el 50 % se paga en abril y el resto en mayo. Las ventas de enero, febrero y abril ya se cobraron (salvo el incobrable).', f: 'Pendiente = lo que se cobrará después del cierre', c: '50 % × 14.280.000 = $ 7.140.000 (la mitad de marzo, que se cobra en mayo)' }
              },
              {
                id: 'p3', texto: 'Al cierre de abril 2025, ¿a cuánto asciende el flujo de efectivo total recaudado?', tipo: 'pesos', respuesta: 66045000,
                trampas: [{ valor: 54145000, propia: true, msg: 'te faltó lo cobrado de las cuentas por cobrar que venían del 31 de diciembre.' }],
                sol: { d: 'Enero: 85 % × 11.900.000 + 65 % × 23.800.000 = $ 25.585.000. Febrero: 15 % × 11.900.000 + 25 % × 23.800.000 = $ 7.735.000. Marzo: la venta de febrero, $ 9.520.000. Abril: 50 % × 14.280.000 + 16.065.000 = $ 23.205.000.', f: 'Efectivo recaudado = suma de lo cobrado cada mes', c: '25.585.000 + 7.735.000 + 9.520.000 + 23.205.000 = $ 66.045.000' }
              },
              {
                id: 'p4', texto: 'Si el costo de venta es el 50 % de las ventas, ¿cuál es el resultado bruto del período enero a abril 2025?', tipo: 'pesos', respuesta: 27500000,
                trampas: [{ valor: 32725000, propia: true, msg: 'usaste las ventas brutas. El resultado se calcula con ventas netas: divide por 1,19.' }],
                sol: { d: 'Ventas brutas de enero a abril: 23.800.000 + 9.520.000 + 14.280.000 + 17.850.000 = $ 65.450.000. Costo de venta: 50 % de las ventas.', f: 'Resultado bruto = ventas netas − costo de venta', c: 'Ventas netas: 65.450.000 ÷ 1,19 = $ 55.000.000; 55.000.000 − 50 % × 55.000.000 = $ 27.500.000' }
              }
            ]
          }
        ],
        cierre: '<p><b>Ojo con la palabra “brutas”:</b> aquí las ventas ya vienen con IVA, así que para la caja se usan tal cual, y para el resultado hay que sacarles el IVA (÷ 1,19).</p>'
      },

      // ------------------------------------------------------------------ VF1.B
      {
        tipo: 'vf',
        id: 'vf-caja',
        titulo: 'Verdadero o falso: presupuesto de caja',
        items: [
          { id: 'a1', af: 'La depreciación debe considerarse como una salida de efectivo dentro del presupuesto de caja.', r: false, porque: 'La depreciación es gasto en el resultado, pero no sale dinero de la caja.', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1 } },
          { id: 'a2', af: 'El presupuesto de efectivo (caja) permite proyectar los excedentes o déficits de caja para determinar cómo invertir los excedentes o financiar los faltantes de caja dentro de un periodo.', r: true, porque: 'Para eso sirve: ver con anticipación si sobrará o faltará efectivo y decidir qué hacer.', fuente: { k: 'certamen', sem: 2, anio: 2025, preg: 1, tb: '2º semestre 2024' } },
          { id: 'a3', af: 'Un presupuesto de caja en el largo plazo permite ahorrar cuando existan déficits y definir cuándo es necesario financiar con recursos de terceros cuando hay superávits de caja.', r: false, porque: 'Está invertido: los déficits se financian y los excedentes (superávits) se invierten.', fuente: { k: 'certamen', sem: 1, anio: 2026, preg: 1 } },
          { id: 'a4', af: 'El presupuesto de caja o tesorería se formula con las estimaciones previstas de fondos disponibles en caja, bancos y valores de fácil realización.', r: true, porque: 'Se arma con lo disponible en caja, bancos y valores de fácil realización.', fuente: { k: 'certamen', sem: 1, anio: 2024, preg: 1, tb: '1er semestre 2022' } },
          { id: 'a5', af: 'El presupuesto de caja se prepara con el propósito de planear y controlar los flujos financieros de efectivo y detectar los períodos que requieran de fuentes de financiamiento.', r: true, porque: 'Planear y controlar el efectivo, y detectar cuándo habrá que buscar financiamiento, es justamente su propósito.', fuente: { k: 'certamen', sem: 1, anio: 2025, preg: 1 } }
        ]
      },

      // ------------------------------------------------------------------ Resumen
      {
        tipo: 'resumen',
        id: 'resumen',
        titulo: 'Resumen del módulo 1',
        formulas: [
          'Producción o compras = ventas + IF deseado − II.',
          'El II de un mes es el IF del mes anterior; el IF deseado sale de la política aplicada al mes siguiente.',
          'Caja = solo lo cobrado y lo pagado.',
          'La depreciación y el incobrable no son flujo de caja (pero sí son gasto en el resultado).',
          'Cobranzas con IVA si el precio es neto; el resultado, siempre con valores netos.',
          'Incremental: parte del año anterior. Base cero: parte desde cero.'
        ],
        asi: [
          'Verdadero o falso sobre la fase del presupuesto, corto y largo plazo, incremental versus base cero y la depreciación en la caja.',
          '«¿Compras o producción presupuestadas del mes X?» → ventas + IF − II, con el IF según la política.',
          '«¿Inventario final deseado?» → la política aplicada al mes siguiente.',
          '«¿Cobranzas del mes?» → % al contado del mes + % del mes anterior, <b>con IVA</b> si el precio es neto.',
          '«¿Cuentas por cobrar al cierre?» → es lo vendido que todavía no se cobra: normalmente, la parte a crédito de las ventas del último mes.',
          '«¿Resultado neto?» → estado de resultados con valores netos, con los incobrables y la depreciación como gasto, × (1 − tasa de impuesto).'
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
