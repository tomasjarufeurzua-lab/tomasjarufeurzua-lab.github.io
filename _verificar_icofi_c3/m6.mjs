// Recálculos del Módulo 6 (relación costo–volumen–utilidad).
// Cada función recibe SOLO los "datos" del enunciado y devuelve los valores con todos los decimales.
// En CVU el precio "+ IVA" se usa neto: el IVA solo aparece en las trampas (el error de usar el precio bruto).
import { IVA } from './util.mjs';

export const CALC = {};

// ---------- Capacitación S.A. (C3 1S-2026 P3) ----------
function capacitacion(d) {
  const cv = d.certificado + d.plataforma;            // "por estudiante" = variable
  const cf = d.relator + d.zoom + d.gestion;          // "por diploma" = fijo
  const mcu = d.precio - cv;
  const pe = cf / mcu;
  return { cv, cf, mcu, pe };
}
CALC['cvu/capacitacion'] = {
  md: '**E6.1 Capacitación S.A., diplomado',
  pauta: 'LA EMPRESA “CAPACITACIÓN S.A.”',
  f(d) {
    const c = capacitacion(d);
    return {
      v: { p1: c.mcu, p2: c.cf, p3: c.pe, p4: c.pe * d.precio },
      tr: {
        p2: [c.cf + c.cv],                            // sumar también los costos por estudiante
        p4: [c.cf]                                    // igualar la venta de equilibrio a los costos fijos
      }
    };
  }
};
CALC['cvu/capacitacion-margen'] = {
  md: '**E6.7 Capacitación S.A. — pregunta 5',
  pauta: 'LA EMPRESA “CAPACITACIÓN S.A.”',
  f(d) {
    const c = capacitacion(d);
    const uai = d._ms * c.mcu;                        // las unidades sobre el equilibrio dejan su mcu completo
    return {
      v: { p5: uai * (1 - d._t) },
      tr: { p5: [uai] }                               // olvidar el impuesto
    };
  }
};

// ---------- Velas de tulipán (C3 1S-2023 P5) ----------
function velas(d) {
  const cv = d.mp + d.mo + d.gf;
  const cf = d.cfProduccion + d.cfAdministracion + d.cfVenta;
  const mcu = d.precio - cv;
  return { cv, cf, mcu, rr: cv / d.precio, rc: mcu / d.precio };
}
CALC['cvu/velas-equilibrio'] = {
  md: '**E6.2 Velas de tulipán',
  pauta: 'UNA EMPRESA QUE FABRICA “VELAS DE TULIPÁN”',
  f(d) {
    const c = velas(d);
    return {
      v: { p1: c.cf / c.mcu, p2: (c.cf / c.mcu) * d.precio },
      tr: {
        p1: [d.cfProduccion / c.mcu],                 // solo los fijos de producción
        p2: [c.cf / c.rr]                             // dividir por la razón de recuperación
      }
    };
  }
};
CALC['cvu/velas-utilidad'] = {
  md: '**E6.6 Velas de tulipán — parte 2',
  pauta: 'UNA EMPRESA QUE FABRICA “VELAS DE TULIPÁN”',
  f(d) {
    const c = velas(d);
    const q3 = (c.cf + d._utilidad) / c.mcu;                                  // 32.000
    const costos = c.cv * d.capacidad + c.cf + d._publicidad;                 // costos + publicidad a capacidad completa
    const p4 = costos / ((1 - d._margen) * d.capacidad);                      // utilidad = 20 % de las ventas
    const ociosa = d.capacidad - q3;                                          // 8.000
    return {
      v: { p3: q3, p4: p4, p5: (d.precio * (1 - d._descuento) - c.cv) * ociosa },
      tr: {
        p3: [d._utilidad / c.mcu],                    // sin sumar los costos fijos
        p4: [costos / d.capacidad],                   // sin el margen de utilidad
        p5: [(d.precio - c.cv) * ociosa]              // sin el descuento
      }
    };
  }
};

// ---------- Viña XYZ (C3 2S-2025 P3) ----------
CALC['cvu/vina'] = {
  md: '**E6.3 Viña XYZ',
  pauta: 'LA EMPRESA “XYZ” ES UNA VIÑA',
  f(d) {
    const mcu = d.precio - d.cv;                      // precio neto
    const cf = d.pe * mcu;
    const uai = d._udi / (1 - d.t);
    return {
      v: { p1: cf, p2: d.pe * d.precio, p3: (d.ventas - d.pe) / d.ventas * 100, p4: (cf + uai) / mcu, p5: uai - d._udi },
      // La pauta del certamen acepta también 27 % aplicado directo a la utilidad dada ("$ 810.000 o $ 591.300")
      alt: { p5: [d.t * d._udi] },
      tr: {
        p1: [d.pe * (d.precio * (1 + IVA) - d.cv)],   // precio con IVA
        p2: [d.pe * d.precio * (1 + IVA)],            // precio con IVA
        p3: [d.pe / d.ventas * 100],                  // peso del equilibrio en las ventas
        p4: [(cf + d._udi) / mcu]                     // utilidad neta sin dividir por (1 − t): 3.219 (trampa del encargo)
      }
    };
  }
};

// ---------- Tablets XYZ (C3 2S-2024 P4) ----------
CALC['cvu/tablets'] = {
  md: '**E6.4 Tablets XYZ',
  pauta: 'LA EMPRESA “XYZ” QUE VENDE TABLET',
  f(d) {
    const mcu = d.precio - d.cv;
    const cf = d.pe * mcu;
    const uai = d._udi / (1 - d.t);
    const sinImpuesto = (cf + d._udi) / mcu;          // 314,6
    return {
      v: { p1: cf, p2: d.pe * d.precio, p3: 0, p4: (cf + uai) / mcu, p5: uai - d._udi },
      alt: { p2: [d.pe] },                            // la pauta acepta "$ 60.000.000 o 300 unidades"
      tr: { p4: [sinImpuesto, Math.ceil(sinImpuesto)] } // utilidad neta sin dividir por (1 − t), exacta o redondeada hacia arriba
    };
  }
};

// ---------- Loy-Loy (C3 1S-2025 P4) ----------
CALC['cvu/loy-loy'] = {
  md: '**E6.5 Loy-Loy',
  pauta: 'LA EMPRESA “LOY-LOY LTDA.”',
  // En esta pauta las respuestas están escritas con una tipografía matemática que el PDF entrega como
  // símbolos (𝟎, 𝟕𝟎; 𝟔𝟎𝟎. 𝟎𝟎𝟎; 𝟏𝟕. 𝟎𝟎𝟎), así que no se pueden buscar como texto. Cotejadas a mano: 0,70 · 0,30 · $ 600.000 · 17.000 unidades · $ 60.
  sinPauta: ['p1', 'p2', 'p3', 'p4', 'p5'],
  f(d) {
    const cv = d.mp + d.mo + d.gf;
    const cf = d.cfProduccion + d.cfAdministracion + d.cfVentas;
    const mcu = d.precio - cv;
    const rr = cv / d.precio, rc = mcu / d.precio;
    const precioNuevo = (cv + d._aumento) / rr;       // mantener rr (y por lo tanto rc)
    return {
      v: { p1: rr, p2: rc, p3: cf / rc, p4: (cf + d._utilidad) / mcu, p5: precioNuevo },
      tr: {
        p1: [rc], p2: [rr],                           // confundir una razón con la otra
        p3: [cf / rr],                                // dividir por la razón de recuperación
        p4: [d._utilidad / mcu],                      // sin sumar los costos fijos
        p5: [d.precio + d._aumento, precioNuevo - d.precio] // subir el precio en los mismos $ 7; responder el aumento en vez del precio
      }
    };
  }
};

// ---------- Sentarse Bien (C3 1S-2024 P4) ----------
CALC['cvu/sentarse-bien'] = {
  md: '**E6.8 Sentarse Bien — preguntas de CVU',
  pauta: 'LA EMPRESA “SENTARSE BIEN S.A.”',
  f(d) {
    const cv = d.espuma + d.madera + d.moVariable + d.elecVariable;
    const cfProduccion = d.moFijo + d.elecFijo;
    const cf = cfProduccion + d.gavFijo;
    const mcu = d.precio - cv;
    const pe = cf / mcu;
    return {
      v: { p2: pe, p3: d._ventas - pe, p4: mcu },
      tr: {
        p2: [Math.round(cfProduccion / mcu)],                       // solo los fijos de producción (166,7 → 167)
        p4: [d.precio - (cv + cfProduccion / d._ventas)]            // restar el costo de producción unitario completo
      }
    };
  }
};

// ---------- UEFA (C3 2S-2023 P4) ----------
CALC['cvu/uefa-balones'] = {
  md: '**E6.9 UEFA, balones',
  pauta: 'LA EMPRESA “UEFA”',
  f(d) {
    const mcu = d.precio - d.cvProduccion - d.gav;    // los gastos de adm. y ventas por unidad también son variables
    const pe = d.cf / mcu;
    const uai = d._udi / (1 - d.t);
    const q = (d.cf + uai) / mcu;
    return {
      v: { p1: pe, p2: (d.ventas - pe) * d.precio, p3: q * d.precio, p5: q },
      tr: {
        p1: [d.cf / (d.precio - d.cvProduccion)],     // 300: ignorar los gastos variables de adm. y ventas (trampa del encargo)
        p3: [(d.cf + d._udi) / mcu * d.precio]        // utilidad neta sin dividir por (1 − t)
      }
    };
  }
};

// ---------- Logos USM (C3 1S-2022 P5) ----------
CALC['cvu/logos-cvu'] = {
  md: '**E6.11 Logos USM — preguntas de CVU',
  pauta: 'LA EMPRESA DE LOGOS “U S M”',
  f(d) {
    const cv = d.mp + d.mod + d.cif * d.cifVariable;
    const cf = d.cif * (1 - d.cifVariable) + d.gVentas + d.gAdm + d.gGenerales;
    const rc = (d.ventas - cv) / d.ventas;
    const vpe = cf / rc;
    const uaiSobreVenta = d._udiSobreVenta / (1 - d._t);            // 0,15 de la venta
    return {
      v: { p2: (d.ventas - vpe) / d.ventas * 100, p3: cf / (rc - uaiSobreVenta) },
      tr: {
        p2: [vpe / d.ventas * 100],                   // peso de la venta de equilibrio
        p3: [cf / (rc - d._udiSobreVenta)]            // 12 % tomado como antes de impuesto
      }
    };
  }
};

// ---------- DIEYN (C3 2S-2022 P5) ----------
CALC['cvu/dieyn'] = {
  md: '**E6.10 DIEYN',
  pauta: 'UN PRODUCTO DE LA EMPRESA “DIEYN” S.A.',
  // El encargo escribe el resultado como "−$ 1.000.000" (signo antes del "$"), que el buscador de números no reconoce.
  // La pauta lo trae como "$ -1.000.000" y ahí sí se coteja.
  sinMd: ['p1'],
  f(d) {
    const mcu = d.precio - d.cv;                      // precio neto
    const ro = d.unidades * mcu - d.cf;
    const r1 = d.unidades * (1 + d._aumentoVentas) * mcu - d.cf;    // escenario 1: +30 % de ventas
    const mcu2 = d.precio - d.cv * d._factorCostoVariable;          // escenario 2: costo variable al 85 %
    const r2 = d.unidades * mcu2 - d.cf;
    return {
      v: { p1: ro, p2: d.unidades * mcu, p3: d.cf / mcu, p4: r2 > r1 ? 1 : 0, p5: (mcu2 - mcu) / mcu * 100 },
      tr: {
        p2: [d.unidades * (d.precio * (1 + IVA) - d.cv)],           // precio con IVA
        p5: [(1 - d._factorCostoVariable) * 100]                    // responder la baja del costo variable
      }
    };
  }
};

// V/F y alternativas: a qué ronda y número del .md corresponde cada ítem de la página
export const TEORIA = {
  'cvu/mc-contribucion': { mc: { m1: '**MC6.A**' } },
  'cvu/mc-equilibrio': { mc: { m1: '**MC6.B**', m2: '**MC6.C**', m3: '**MC6.D**', m4: '**MC6.E**' } },
  'cvu/mc-supuestos': { mc: { m1: '**MC6.F**', m2: '**MC6.G**', m3: '**MC6.H**', m4: '**MC6.I**' } },
  'cvu/vf-cvu': { md: '**VF6.A**', items: { a1: 1, a2: 2, a3: 3, a4: 4, a5: 5, a6: 6, a7: 7, a8: 8, a9: 9, a10: 10, a11: 11, a12: 12, a13: 13 } }
};
