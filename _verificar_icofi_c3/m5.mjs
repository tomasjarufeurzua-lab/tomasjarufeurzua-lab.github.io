// Recálculos del Módulo 5 (costeo total vs costeo directo).
// Cada función recibe SOLO los "datos" del enunciado y devuelve los valores con todos los decimales.
import { IVA, entero } from './util.mjs';

export const CALC = {};

CALC['total-directo/palitos-venta'] = {
  md: '**E5.1 Palitos, venta del trabajo 101',
  f(d) {
    // Hoja de costos del trabajo 101 (por unidad)
    const mpU = d.mp101 / d.u101, modU = d.mod101 / d.u101;        // 16 y 24
    const cifAplU = d.cuota * mpU;                                  // 56
    const cuotaReal = d.cifReales / (d.mp101 + d.mp202);            // 3 veces
    const cifRealU = cuotaReal * mpU;                               // 48
    const aplicadoU = mpU + modU + cifAplU;                         // 96
    const precio = d.precioBruto / (1 + IVA);                       // 250 neto
    const ventas = precio * d.vendidas;                             // 75.000
    // --- EERR real por costeo total
    const cvApl = aplicadoU * d.vendidas;                           // 28.800
    const ajuste = (cifAplU - cifRealU) * d.vendidas;               // 2.400 (sobreaplicación: se resta)
    const cvReal = cvApl - ajuste;
    const mb = ventas - cvReal;
    const gv = d.gastoVenta * ventas;                               // 11.250
    const roT = mb - d.adm - gv;                                    // 27.350
    const impT = entero(roT * d.impuesto);                          // primero se redondea el impuesto
    const rdiT = roT - impT;
    // --- EERR real por costeo directo (variables: MP + MOD; los CIF son todos fijos)
    const cvp = (mpU + modU) * d.vendidas;                          // 12.000
    const mc = ventas - cvp - gv;                                   // 51.750
    const cifFijo = cifRealU * d.u101;                              // 24.000: por las unidades PRODUCIDAS
    const roD = mc - cifFijo - d.adm;                               // 17.750
    const impD = entero(roD * d.impuesto);
    const rdiD = roD - impD;
    // --- Parte C: al momento de la venta (CIF aplicados, sin ajuste)
    const cTotal = ventas - cvApl - d.adm - gv;                     // 24.950
    const cDirecto = mc - cifAplU * d.u101 - d.adm;                 // 13.750
    return {
      v: {
        'total:cvapl|1': cvApl, 'total:ajuste|1': ajuste, 'total:cvreal|1': cvReal, 'total:mb|1': mb, 'total:gv|1': gv,
        'total:ro|1': roT, 'total:imp|1': impT, 'total:rdi|1': rdiT,
        'directo:cvp|1': cvp, 'directo:cvv|1': gv, 'directo:mc|1': mc, 'directo:cif|1': cifFijo,
        'directo:ro|1': roD, 'directo:imp|1': impD, 'directo:rdi|1': rdiD,
        dif: roT - roD, ctotal: cTotal, cdirecto: cDirecto
      },
      casi: {
        // multiplicar directo por (1 − t) y redondear al final: queda cerca, pero no es la resolución del profesor
        'total:rdi|1': [entero(roT * (1 - d.impuesto))],
        'directo:rdi|1': [entero(roD * (1 - d.impuesto))]
      },
      tr: {
        'total:cvapl|1': [aplicadoU * d.u101],                      // usar las 500 producidas
        'total:gv|1': [d.gastoVenta * d.precioBruto * d.vendidas],  // 15 % sobre el precio con IVA
        'directo:cvp|1': [aplicadoU * d.vendidas],                  // usar el costo completo (96) en vez del variable (40)
        'directo:cif|1': [cifRealU * d.vendidas, cifAplU * d.u101], // CIF por las vendidas; CIF aplicados en vez de reales
        cdirecto: [mc - cifAplU * d.vendidas - d.adm]               // CIF fijos por las 300 vendidas
      },
      // La diferencia son los CIF fijos de las unidades no vendidas (opción 0)
      cl: { dif: Math.abs((roT - roD) - (d.u101 - d.vendidas) * cifRealU) < 1e-6 ? 0 : -1 },
      fijos: { 'total:adm|1': d.adm, 'directo:ventas|1': ventas, 'directo:adm|1': d.adm },
      modelo: { 'total:ventas|1': ventas }
    };
  }
};

CALC['total-directo/sixpa'] = {
  md: '**E5.2 Sixpa SpA',
  pauta: 'LA EMPRESA “SIXPA SPA”',
  f(d) {
    const cifFijo = d.cif * d.cifFijo, cifVar = d.cif - cifFijo;
    const gavFijo = d.gav * d.gavFijo, gavVar = d.gav - gavFijo;
    const unitTotal = (d.mp + d.mo + d.cif) / d._producidas;        // 8.400
    const unitVar = (d.mp + d.mo + cifVar) / d._producidas;         // 7.700
    const mc = d._ventas - unitVar * d._vendidas - gavVar;          // 55.500.000
    return {
      v: { p1: d.mp + d.mo, p2: unitTotal, p3: mc - cifFijo - gavFijo },
      tr: {
        p1: [d.mo + d.cif],                                         // costo de conversión
        p2: [(d.mp + d.mo + d.cif + d.gav) / d._producidas, unitVar], // con gastos de adm. y ventas; solo variable
        p3: [d._ventas - unitTotal * d._vendidas - d.gav]           // resultado por costeo total
      }
    };
  }
};

CALC['total-directo/logos-directo'] = {
  md: '**E5.3 Logos USM',
  pauta: 'LA EMPRESA DE LOGOS “U S M”',
  f(d) {
    const cv = d.mp + d.mod + d.cif * d.cifVariable;                // 400.000
    const cifFijo = d.cif * (1 - d.cifVariable);                    // 210.000
    const gastos = d.gVentas + d.gAdm + d.gGenerales;               // 240.000
    const mc = d.ventas - cv;
    return {
      v: { p1: mc - cifFijo - gastos },
      tr: { p1: [mc, mc - cifFijo] }                                // margen de contribución; sin restar los gastos operacionales
    };
  }
};

CALC['total-directo/uefa-inventario'] = {
  md: '**E5.4 UEFA, pregunta de inventario',
  pauta: 'LA EMPRESA “UEFA”',
  f(d) {
    return {
      v: { p4: d._inventario * d.cvProduccion },
      tr: { p4: [d._inventario * (d.cvProduccion + d.gav)] }        // sumar los gastos de administración y ventas
    };
  }
};

// V/F: número de cada afirmación en la ronda VF5.A del encargo
export const TEORIA = {
  'total-directo/vf-total-directo': { md: '**VF5.A**', items: { a1: 1, a2: 2, a3: 3, a4: 4 } }
};
