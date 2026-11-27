// Recálculos del Módulo 1 (presupuestos).
// Cada función recibe SOLO los "datos" del enunciado y devuelve los valores con todos los decimales.
// En "tr" va, para cada trampa, el resultado de cometer el error que su mensaje describe.
import { IVA, entero } from './util.mjs';

export const CALC = {};

// ---------- E1.1 Tik-Tok Bonitos (C3 1S-2024 P5) ----------
CALC['presupuestos/tik-tok'] = {
  md: '**E1.1 Tik-Tok Bonitos',
  pauta: 'TIK-TOK BONITOS S.A.',
  // En el certamen la afirmación 2 era falsa ("el IF de julio es 180"): el 120 no aparece escrito en la pauta.
  sinPauta: ['p2'],
  f(d) {
    const ifDe = (ventasSiguiente) => d.politica * ventasSiguiente + d.seguridad;
    const ifMayo = ifDe(d.junio), ifJunio = ifDe(d.julio), ifJulio = ifDe(d.agosto);
    const prodMayo = d.mayo + ifMayo - d.inventario;
    const prodJunio = d.junio + ifJunio - ifMayo;
    const prodJulio = d.julio + ifJulio - ifJunio;
    const costoUnit = (1 - d.utilidadBruta) * d.precio;       // utilidad bruta 30 % => costo 70 % del precio neto
    const ventasJulio = d.julio * d.precio;                    // netas (precio "más IVA")
    const margenJulio = d.utilidadBruta * ventasJulio;
    return {
      v: {
        'plan:junio|2': ifJunio, 'plan:junio|3': ifMayo, 'plan:junio|4': prodJunio,
        'plan:julio|2': ifJulio, 'plan:julio|3': ifJunio, 'plan:julio|4': prodJulio,
        p1: prodJunio, p2: ifJulio, p3: ifJulio * costoUnit, p4: ventasJulio, p5: margenJulio * (1 - d._gastosOp)
      },
      tr: {
        'plan:junio|2': [d.politica * d.julio, ifDe(d.junio)],   // sin inventario de seguridad · con las ventas del propio mes
        'plan:junio|3': [d.inventario],                          // usar el inventario del 30 de abril
        'plan:julio|2': [d.agosto],                              // las ventas de agosto, sin aplicar la política
        p1: [d.junio + ifJunio - d.inventario],                  // restar el inventario de abril en vez del IF de mayo
        p2: [d.agosto],
        p3: [ifJulio * d.precio],                                // valorizar al precio de venta
        p4: [ventasJulio * (1 + IVA)],                           // venta con IVA
        p5: [margenJulio * d._gastosOp]                          // los gastos, no el resultado
      },
      fijos: { 'plan:mayo|1': d.mayo, 'plan:junio|1': d.junio, 'plan:julio|1': d.julio },
      modelo: { 'plan:mayo|2': ifMayo, 'plan:mayo|3': d.inventario, 'plan:mayo|4': prodMayo }
    };
  }
};

// ---------- E1.2 Tecno-Mundo Azul (C3 2S-2025 P4) ----------
CALC['presupuestos/tecno-mundo'] = {
  md: '**E1.2 Tecno-Mundo Azul',
  pauta: 'TECNO-MUNDO AZUL S.A.',
  pautaLineas: 90,
  f(d) {
    const cv = (ventas) => d.costoVenta * ventas;
    const ifOct = d.politica * cv(d.noviembre) + d.seguridad;
    const ifNov = d.politica * cv(d.diciembre) + d.seguridad;
    return {
      v: { p1: cv(d.noviembre), p2: ifOct, p3: cv(d.octubre) + ifOct - d.inventarioInicial, p4: Math.abs(ifNov - ifOct), p5: cv(d.diciembre) },
      cl: { p4: ifNov > ifOct ? 0 : 1 },                         // 0 = incremento, 1 = decremento
      tr: {
        p1: [cv(d.octubre)],                                     // costo de venta del mes equivocado
        p2: [d.politica * cv(d.noviembre), d.politica * d.noviembre + d.seguridad], // sin stock de seguridad · 35 % sobre las ventas
        p3: [d.octubre + ifOct - d.inventarioInicial],           // ventas en vez de costo de venta
        p4: [ifNov]                                              // el IF de noviembre, no la variación
      }
    };
  }
};

// ---------- E1.3 Presupuesto 2022 (C3 1S-2022 P4) ----------
CALC['presupuestos/presupuesto-2022'] = {
  md: '**E1.3 Presupuesto 2022',
  pauta: 'LA EMPRESA “PRESUPUESTO 2022”',
  f(d) {
    const ifPT = (ventasSiguiente) => d.politicaPT * ventasSiguiente;
    const prodOct = d.octubre + ifPT(d.noviembre) - d.inventarioPT;
    const prodNov = d.noviembre + ifPT(d.diciembre) - ifPT(d.noviembre);
    const costoUnit = d.aaCantidad * d.aaPrecio + d.zzCantidad * d.zzPrecio + d.conversion;
    const reqOct = prodOct * d.aaCantidad, reqNov = prodNov * d.aaCantidad;
    const comprasAA = reqOct + d._politicaMP * reqNov - d._politicaMP * reqOct; // el requisito se cumplía al 1 de octubre
    return {
      v: { p1: prodOct, p2: prodOct * costoUnit, p3: comprasAA, p4: comprasAA * d.aaPrecio * (1 + IVA) },
      tr: {
        p1: [d.octubre + ifPT(d.noviembre)],                     // sin restar el inventario inicial
        p2: [
          prodOct * ((d.aaCantidad * d.aaPrecio + d.zzCantidad * d.zzPrecio) * (1 + IVA) + d.conversion), // materia prima con IVA
          prodOct * (d.aaCantidad * d.aaPrecio + d.zzCantidad * d.zzPrecio)                                // sin costo de conversión
        ],
        p3: [reqOct],                                            // solo el consumo del mes
        p4: [comprasAA * d.aaPrecio]                             // valor neto
      }
    };
  }
};

// ---------- E1.4 Bicicletas (C3 2S-2022 P4) ----------
CALC['presupuestos/bicicletas'] = {
  md: '**E1.4 Bicicletas',
  pauta: '1.200 BICICLETAS',
  f(d) {
    const ventaNeta = d.ventas * d.precio;
    const ifU = d.politica * d.ventas;
    const comprasU = d.ventas + ifU - d.inventarioInicial;
    const comprasNetas = comprasU * d.costoCompra;
    const costoFifo = d.inventarioInicial * d.costoInicial + (d.ventas - d.inventarioInicial) * d.costoCompra;
    return {
      v: { p1: ventaNeta * (1 + IVA), p2: comprasNetas, p3: ventaNeta - costoFifo, p4: costoFifo, p5: IVA * ventaNeta - IVA * comprasNetas },
      tr: {
        p1: [ventaNeta],                                         // venta neta
        p2: [d.ventas * d.costoCompra, comprasNetas * (1 + IVA)], // sin ajustar inventarios · con IVA
        p3: [ventaNeta * (1 + IVA) - costoFifo],                 // margen con la venta bruta
        p4: [d.ventas * d.costoCompra],                          // todo al costo de la compra nueva
        p5: [IVA * ventaNeta]                                    // solo el débito
      }
    };
  }
};

// ---------- E1.5 ABC, proyección 2025 (C3 1S-2025 P2) ----------
CALC['presupuestos/abc-2025'] = {
  md: '**E1.5 ABC',
  pauta: 'REVISÓ LOS RESULTADOS DEL AÑO 2024',
  f(d) {
    const propCostos = Math.round(100 * d.costos2024 / d.ingresos2024) / 100;   // relación histórica: 50 %
    const propGadm = Math.round(100 * d.gadm2024 / d.ingresos2024) / 100;       // relación histórica: 10 %
    const ingresos = d.ingresos2024 * (1 + d.vecesPib * d.pib);
    const ingresosMal = d.ingresos2024 * (1 + d.pib);                           // crecer solo 2,5 %
    // Cada línea del estado proyectado se anota como entero de M$ (así lo hace la pauta)
    const I = entero(ingresos), C = entero(d.costosNuevo * ingresos), G = entero(propGadm * ingresos), CH = entero(propCostos * ingresos);
    return {
      v: {
        p1: (I - C - G) * (1 - d.impuesto),
        p2: d.costosNuevo * ingresos,
        p3: propGadm * ingresos,
        p4: (I - CH - G) * (1 - d.impuesto),
        p5: 1                                                    // "No": el incobrable es un gasto, no rebaja los ingresos
      },
      tr: {
        p1: [I - C - G],                                         // utilidad antes de impuesto
        p2: [propCostos * ingresos, d.costosNuevo * ingresosMal], // proporción histórica · crecimiento de 2,5 %
        p3: [propGadm * ingresosMal],
        p4: [I - CH - G]                                         // antes de impuesto
      },
      extra: { propCostos, propGadm }
    };
  }
};

// ---------- E1.6 ABC, proyección 2023 (C3 2S-2023 P5) ----------
CALC['presupuestos/abc-2023'] = {
  md: '**E1.6 ABC',
  pauta: 'REVISÓ LOS RESULTADOS DEL AÑO 2022',
  f(d) {
    const propCostos = d.costos2022 / d.ingresos2022;            // relación histórica: 50 %
    const propGadm = d.gadm2022 / d.ingresos2022;                // relación histórica: 10 %
    const ingresos = d.ingresos2022 * (1 + d.pib);               // 1 % por cada punto del PIB
    const uai = ingresos * (1 - d.costosNuevo - propGadm);
    const uaiHist = ingresos * (1 - propCostos - propGadm);
    const ingresosCaida = ingresos * (1 - d._caida);
    const uaiCaida = ingresosCaida * (1 - d.costosNuevo - propGadm);
    return {
      v: { p1: uai * (1 - d.impuesto), p2: d.costosNuevo * ingresos, p3: uaiHist * (1 - d.impuesto), p4: uaiCaida, p5: propGadm * ingresos },
      // La pauta acepta dos valores en la pregunta 4: el segundo deja los costos en su relación histórica (50 %)
      alt: { p4: [ingresosCaida * (1 - propCostos - propGadm)] },
      tr: {
        p1: [uai],                                               // antes de impuesto
        p2: [propCostos * ingresos],                             // relación histórica de costos
        p3: [uaiHist],                                           // antes de impuesto
        p4: [uaiCaida * (1 - d.impuesto)],                       // aplicar impuesto cuando piden antes de impuestos
        p5: [d.gadm2022]                                         // el gasto del año 2022
      }
    };
  }
};

// ---------- E1.7 Rubbermaid (C3 1S-2026 P4) ----------
CALC['presupuestos/rubbermaid'] = {
  md: '**E1.7 Rubbermaid',
  pauta: 'RUBBERMAID LTDA.',
  pautaLineas: 90,
  // El .md calcula el resultado neto como 15,45M × 0,73, sin escribir el monto del impuesto.
  sinMd: ['eerr:imp|1'],
  f(d) {
    const bruto = (netas) => netas * (1 + IVA);
    const vJul = d.julio * d.precio, vAgo = d.agosto * d.precio, vSep = d.septiembre * d.precio;
    const uTrim = d.julio + d.agosto + d.septiembre;
    const ventas = uTrim * d.precio, costo = uTrim * d.costo;
    const ifJul = d.politica * d.agosto;
    const comprasJulU = d.julio + ifJul - d.inventarioInicial;
    const incob = d.incobrable * ventas;
    const gastosMes = d.sueldos + d.arriendo + d.publicidad + d.depreciacion;
    const gastos = 3 * gastosMes, gastosSinDep = 3 * (gastosMes - d.depreciacion);
    const rai = ventas - costo - incob - gastos;
    const raiSinDep = ventas - costo - incob - gastosSinDep;
    const imp = d.impuesto * rai;
    const neto = rai - imp;
    return {
      v: {
        p1: vAgo,
        p2: comprasJulU * d.costo,
        p3: d.credito * bruto(vSep),
        p4: d.contado * bruto(vAgo) + d.credito * bruto(vJul),
        p5: neto,
        'eerr:ventas|1': ventas, 'eerr:costo|1': costo, 'eerr:mb|1': ventas - costo, 'eerr:incob|1': incob,
        'eerr:gastos|1': gastos, 'eerr:rai|1': rai, 'eerr:imp|1': imp, 'eerr:neto|1': neto
      },
      tr: {
        p1: [bruto(vAgo)],                                       // venta bruta
        p2: [(d.julio + ifJul) * d.costo, bruto(comprasJulU * d.costo)], // sin restar el II · con IVA
        p3: [d.credito * vSep, (d.credito + d.incobrable) * bruto(vSep)], // sin IVA · contando el incobrable como por cobrar
        p4: [d.contado * vAgo + d.credito * vJul, d.contado * bruto(vAgo)], // sin IVA · sin lo de julio
        p5: [raiSinDep * (1 - d.impuesto), rai],                 // sin depreciación · antes de impuesto
        'eerr:ventas|1': [bruto(ventas)],                        // ventas con IVA
        'eerr:gastos|1': [gastosSinDep],                         // sin depreciación
        'eerr:rai|1': [raiSinDep],
        'eerr:neto|1': [raiSinDep * (1 - d.impuesto)]
      },
      suma: [
        [['eerr:costo|1', 'eerr:mb|1'], ventas],
        [['eerr:incob|1', 'eerr:gastos|1', 'eerr:rai|1'], ventas - costo],
        [['eerr:imp|1', 'eerr:neto|1'], rai]
      ]
    };
  }
};

// ---------- E1.8 Tesla Inc. (C3 2S-2024 P5, preguntas 2 a 5) ----------
CALC['presupuestos/tesla'] = {
  md: '**E1.8 Tesla Inc.',
  pauta: 'TESLA INC.',
  f(d) {
    const incobrable = (1 - d.eneroMes - d.eneroSiguiente) * d.enero;
    const pendiente = (1 - d.marzoAbril) * d.marzo;              // la mitad de marzo, que se cobra en mayo
    const cobEne = d.cxcEnero * d.cxcInicial + d.eneroMes * d.enero;
    const cobFeb = d.cxcFebrero * d.cxcInicial + d.eneroSiguiente * d.enero;
    const cobMar = d.febrero;
    const cobAbr = d.marzoAbril * d.marzo + d.abrilPago;
    const recaudado = cobEne + cobFeb + cobMar + cobAbr;
    const brutas = d.enero + d.febrero + d.marzo + d.abril;
    const netas = brutas / (1 + IVA);
    return {
      v: { p1: incobrable, p2: pendiente, p3: recaudado, p4: netas * (1 - d._costoVenta) },
      tr: {
        p1: [incobrable + (d.abril - d.abrilPago)],              // sumar el descuento por pronto pago
        p2: [pendiente + incobrable],                            // incluir el incobrable
        p3: [recaudado - d.cxcInicial],                          // olvidar las cuentas por cobrar iniciales
        p4: [brutas * (1 - d._costoVenta)]                       // con ventas brutas
      },
      partidas: [Math.abs(d.abril * (1 - d.descuento) - d.abrilPago) < 1e-6]   // el pago de abril es la venta menos 10 %
    };
  }
};

// V/F y alternativas: a qué ronda y número del .md corresponde cada ítem de la página
export const TEORIA = {
  'presupuestos/vf-presupuestos': { md: '**VF1.A**', items: { a1: 1, a2: 2, a3: 3, a4: 4, a5: 5, a6: 6, a7: 7, a8: 8 } },
  'presupuestos/vf-caja': { md: '**VF1.B**', items: { a1: 1, a2: 2, a3: 3, a4: 4, a5: 5 } },
  'presupuestos/mc-objetivos': { mc: { m1: '**MC1.A**', m2: '**MC1.B**' } },
  'presupuestos/mc-tipos': { mc: { m1: '**MC1.C**', m2: '**MC1.D**' } }
};
