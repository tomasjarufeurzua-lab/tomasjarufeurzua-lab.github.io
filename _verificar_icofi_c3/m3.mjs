// Recálculos del Módulo 3 (órdenes específicas y CIF aplicados versus reales).
// Cada función recibe SOLO los "datos" del enunciado y devuelve los valores con todos los decimales.
// cl = índice correcto de la clasificación: 0 subaplicación, 1 sobreaplicación.
// tr = resultado de cometer el error que describe cada trampa.
import { IVA } from './util.mjs';

export const CALC = {};

const subOSobre = (aplicado, real) => (aplicado > real ? 1 : 0);

CALC['ordenes/palitos-101-202'] = {
  md: '**E3.1 Palitos',
  f(d) {
    const ap101 = d.cuota * d.mp101, ap202 = d.cuota * d.mp202;      // CIF aplicados
    const cuotaReal = d.cifReal / (d.mp101 + d.mp202);              // cuota real sobre el costo de MP de ambos
    const re101 = cuotaReal * d.mp101, re202 = cuotaReal * d.mp202; // CIF reales por trabajo
    const cu = (x) => x / d.u101;                                   // costo unitario del trabajo 101
    const aplicado = d.mp101 + d.mod101 + ap101;
    const var101 = ap101 - re101;                                   // > 0: sobreaplicación
    return {
      v: {
        'hoja:mod|1': cu(d.mod101), 'hoja:cif|1': cu(ap101), 'hoja:cif|3': ap101, 'hoja:tot|1': cu(aplicado), 'hoja:tot|3': aplicado,
        p1: ap101,
        cuota: cuotaReal,
        cifreal: re101,
        var101: Math.abs(var101),
        var202: Math.abs(ap202 - re202),
        vartotal: Math.abs(ap101 + ap202 - d.cifReal),
        'real:aj|1': cu(Math.abs(var101)), 'real:aj|3': Math.abs(var101),
        'real:real|1': cu(aplicado - var101), 'real:real|3': aplicado - var101
      },
      cl: { var101: subOSobre(ap101, re101), var202: subOSobre(ap202, re202), vartotal: subOSobre(ap101 + ap202, d.cifReal) },
      tr: {
        'hoja:cif|3': [d.cuota * d.mod101],                         // aplicar la cuota sobre la MOD (coincide con los CIF reales)
        p1: [d.cuota * d.mod101],
        cuota: [d.cuota, d.cifReal / d.mp101],                      // dar la cuota aplicada · dividir solo por la MP del 101
        cifreal: [d.cifReal],                                       // dar los CIF reales de todo el mes
        'real:real|1': [cu(aplicado + var101)],                     // sumar la sobreaplicación en vez de restarla
        'real:real|3': [aplicado + var101]
      },
      fijos: {
        'hoja:mp|2': d.u101, 'hoja:mp|3': d.mp101, 'hoja:mod|2': d.u101, 'hoja:mod|3': d.mod101, 'hoja:cif|2': d.u101, 'hoja:tot|2': d.u101,
        'real:aj|2': d.u101, 'real:real|2': d.u101
      },
      modelo: { 'hoja:mp|1': cu(d.mp101) }
    };
  }
};

CALC['ordenes/hunter'] = {
  md: '**E3.2 Hunter Ltda.',
  pauta: '"HUNTER LTDA."',
  sinPauta: ['p4'], // la pauta trae una errata de tipeo en esa respuesta: "SUBAPLICACIÓN: $ 60.0000" (un cero de más)
  f(d) {
    const mod = d.mod701 + d.mod702, mpd = d.mpd701 + d.mpd702;
    const aplicado = d.tasa * mod;
    return {
      v: {
        p1: d.tasa * d.mod702,
        p2: mod + aplicado,
        p3: mpd + mod + d.cifReal,
        p4: Math.abs(aplicado - d.cifReal)
      },
      cl: { p4: subOSobre(aplicado, d.cifReal) },
      tr: {
        p1: [d.tasa * d.mpd702],                  // aplicar la tasa sobre la MPD
        p2: [mod + d.cifReal, aplicado],          // usar los CIF reales · olvidar la MOD
        p3: [mpd + mod + aplicado]                // usar los CIF aplicados
      }
    };
  }
};

CALC['ordenes/san-san'] = {
  md: '**E3.4 San-San',
  pauta: 'SAN-SAN LTDA.',
  f(d) {
    const neto = d.mpdBruto / (1 + IVA);                              // la MPD se compró a valor bruto
    const directos = (p) => d.mpdU21 * p + d.mod21 + d.otros21 + d.mpdU22 * p + d.mod22 + d.otros22;
    const dir = directos(neto);
    const cifAp = d.tasaCif * dir;
    const aplicado = dir + cifAp;
    const ingresos = aplicado * (1 + d.margen);                       // precio = costo total aplicado + 20 %
    const real = dir + d.cifReal;
    return {
      v: { p1: cifAp, p2: d.cifReal, p3: ingresos, p4: ingresos - real, p5: real },
      alt: { p3: [Math.floor(ingresos)], p4: [Math.floor(ingresos) - real] }, // la pauta acepta también sin los decimales
      tr: {
        p1: [d.tasaCif * directos(d.mpdBruto)],   // usar el valor bruto de la MPD
        p2: [cifAp],                              // dar los CIF aplicados
        p4: [ingresos - aplicado],                // no ajustar la subaplicación
        p5: [aplicado]                            // dar el costo aplicado
      }
    };
  }
};

CALC['ordenes/six-spa'] = {
  md: '**E3.3 Six SpA',
  pauta: '“SIX SPA”',
  f(d) {
    // Capas del inventario de MP, de la más antigua a la más nueva (las compras "más IVA" van a valor neto)
    const capas = () => [{ u: d.siU, p: d.siP }, { u: d.c1U, p: d.c1P }, { u: d.c2U, p: d.c2P }];
    const consumir = (cs, n, lifo) => {
      let costo = 0;
      for (const c of (lifo ? cs.slice().reverse() : cs)) {
        const t = Math.min(c.u, n);
        costo += t * c.p; c.u -= t; n -= t;
        if (!n) break;
      }
      return costo;
    };
    const queda = (cs) => cs.reduce((s, c) => s + c.u * c.p, 0);
    const L = capas();
    const mp1 = consumir(L, d.mpU1, true), mp2 = consumir(L, d.mpU2, true); // la orden 1 es previa a la 2
    const F = capas();
    const mp1Fifo = consumir(F, d.mpU1, false); consumir(F, d.mpU2, false);
    const ap1 = d.tasa1 * mp1, ap2 = d.tasa2 * mp2;
    const aplicados = ap1 + ap2, reales = d.cifReal1 + d.cifReal2;
    const mo = d.mo1 + d.mo2;
    const costoAplicado = mp1 + mp2 + mo + aplicados;
    const variacion = aplicados - reales;                                   // > 0: sobreaplicación
    return {
      v: {
        p1: Math.abs(ap1 - d.cifReal1),
        p2: Math.abs(variacion),
        p3: costoAplicado,
        p4: queda(L),
        p5: d._ventas - (costoAplicado - variacion)                         // la sobreaplicación se resta al costo de venta
      },
      cl: { p1: subOSobre(ap1, d.cifReal1), p2: subOSobre(aplicados, reales) },
      tr: {
        p1: [Math.abs(d.tasa1 * mp1Fifo - d.cifReal1)],                     // valorizar con FIFO
        p3: [mp1 + mp2 + mo + reales],                                      // usar los CIF reales
        p4: [queda(F)],                                                     // inventario final con FIFO
        p5: [d._ventas - costoAplicado, d._ventas - (costoAplicado + variacion)] // sin ajuste · ajuste al revés
      }
    };
  }
};

// V/F y alternativas: a qué ronda y número del .md corresponde cada ítem de la página
export const TEORIA = {
  'ordenes/mc-ordenes': { mc: { m1: '**MC3.A**' } },
  'ordenes/vf-ordenes': { md: '**VF3.A**', items: { a1: 1, a2: 2, a3: 3, a4: 4, a5: 5 } },
  'ordenes/mc-resultado': { mc: { m1: '**MC3.B**' } }
};
