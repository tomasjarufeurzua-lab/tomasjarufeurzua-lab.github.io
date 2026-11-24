// Recálculos del Módulo 2 (fundamentos de costos).
// Cada función recibe SOLO los "datos" del enunciado y devuelve los valores con todos los decimales.
// tr = resultado de cometer el error que describe cada trampa.
import { IVA } from './util.mjs';

export const CALC = {};

// Separa material y mano de obra en su parte directa e indirecta con los % del enunciado
function separar(d) {
  const mpd = d.material * d.pctDirectoMat;
  const moi = d.mo * d.pctIndirectaMo;
  return { mpd, mpi: d.material - mpd, mod: d.mo - moi, moi };
}

CALC['costos/mm-tazas'] = {
  md: '**E2.1 MM Ltda.',
  pauta: '“MM LTDA.”',
  f(d) {
    const s = separar(d);
    const cif = s.mpi + s.moi + d.cif;            // gastos de fabricación: lo indirecto se suma al CIF
    const prod = s.mpd + s.mod + cif;             // costo de producción (sin venta ni administración)
    const unit = prod / d.unidades;
    return {
      v: {
        'clasif:mo|2': s.mod, 'clasif:mo|3': s.moi,
        p1: s.mpd + s.mod,
        p2: cif,
        p3: s.mod + cif,
        p4: unit,
        p5: d.precio - unit                        // el precio "+ IVA" es neto
      },
      alt: { p2: [cif / d.unidades] },             // la pauta acepta "$ 148 x unidad"
      tr: {
        'clasif:mo|2': [s.moi],                    // confundir el % indirecto con el directo
        'clasif:mo|3': [s.mod],
        p1: [d.material + d.mo],                   // sumar todo, no solo lo directo
        p2: [d.cif],                               // no sumar MPI ni MOI
        p3: [s.mod + d.cif],                       // usar solo el CIF del enunciado
        p4: [(prod + d.gVenta + d.gAdm) / d.unidades], // meter venta y administración
        p5: [d.precio * (1 + IVA) - unit]          // sumarle IVA al precio
      },
      fijos: { 'clasif:mat|1': d.material, 'clasif:mo|1': d.mo },
      modelo: { 'clasif:mat|2': s.mpd, 'clasif:mat|3': s.mpi }
    };
  }
};

CALC['costos/souvenirs'] = {
  md: '**E2.2 Souvenirs',
  pauta: 'SOUVENIRS PARA EL CAMPEONATO',
  f(d) {
    const s = separar(d);
    const cif = s.mpi + s.moi + d.cif;
    const prod = d.material + d.mo + d.cif;        // = MPD + MOD + CIF total
    return {
      v: { p1: cif, p2: s.mod + cif, p3: s.mpd + s.mod, p4: prod / d.unidades },
      tr: {
        p1: [d.cif],                               // no sumar MPI ni MOI
        p2: [s.mod + d.cif],                       // usar solo el CIF del enunciado
        p3: [d.material + d.mo],                   // sumar todo, no solo lo directo
        p4: [(prod + d.gVenta + d.gAdm) / d.unidades] // meter venta y administración
      },
      suma: [[['p3', 'p1'], prod]]
    };
  }
};

CALC['costos/zapatos-xyx'] = {
  md: '**E2.3 Zapatos XYZ',
  pauta: 'LA EMPRESA “XYX”',
  f(d) {
    const cvSinAlza = d.cuero + d.suela + d.plantillas + d.mod;
    const cv = d.cuero + d.suela + d.plantillas + d.mod * (1 + d._alza);
    const fijos = (n) => d.jefe + d.arriendo + (n > d.umbral ? d.bono : 0);
    return {
      v: { p1: cv + fijos(d._n1) / d._n1, p2: cv + fijos(d._n2) / d._n2 },
      tr: {
        p1: [
          cvSinAlza + fijos(d._n1) / d._n1,                     // sin el alza de 25 %
          cv + (d.jefe + d.arriendo + d.bono) / d._n1           // con bono, aunque no se superan las 90 u
        ],
        p2: [cv + (d.jefe + d.arriendo) / d._n2]                // sin el bono (coincide con "sin el alza")
      }
    };
  }
};

CALC['costos/table-mesas'] = {
  md: '**E2.4 Table S.A.',
  pauta: '“TABLE S.A.”',
  f(d) {
    const neto = d.precioBruto / (1 + IVA);
    const cv = d.madera + d.clavos + d.mo + d.elecVar;          // costo variable de producción por unidad
    const unit = cv + d.elecFijo / d.unidades;
    const moTot = d.mo * d.unidades;
    const cifTot = (d.clavos + d.elecVar) * d.unidades + d.elecFijo;
    return {
      v: {
        p1: unit,
        p2: moTot + cifTot,
        p3: neto - unit,
        p4: neto - cv,
        p5: (d.madera + d.mo) * d.unidades
      },
      alt: { p5: [(d.madera + d.mo) * d._unidades2] },          // la pauta acepta también con 1.000 u
      tr: {
        p1: [unit + d.gav / d.unidades],                        // meter administración y ventas
        p2: [moTot + d.elecVar * d.unidades + d.elecFijo],      // olvidar clavos, pegamento y barniz
        p3: [d.precioBruto - unit],                             // no sacar el IVA
        p4: [d.precioBruto - cv, neto - cv - d.elecFijo / d._unidades2], // no sacar el IVA · restar el fijo unitario
        p5: [(d.madera + d.clavos + d.mo) * d.unidades]         // meter el material indirecto
      }
    };
  }
};

CALC['costos/sentarse-bien'] = {
  md: '**E2.5 Sentarse Bien',
  pauta: '“SENTARSE BIEN S.A.”',
  f(d) {
    const cv = d.espuma + d.madera + d.moVar + d.elecVar;
    const cfProd = d.moFijo + d.elecFijo;
    const conv = (n) => d.moVar * n + d.moFijo + d.elecVar * n + d.elecFijo;
    return {
      v: { p1: cv + cfProd / d._n1, p5: conv(d._n5) },
      tr: {
        p1: [cv + (cfProd + d.gav) / d._n1],                    // meter administración y ventas
        p5: [conv(d._n5) + (d.espuma + d.madera) * d._n5,       // meter la materia prima
          (d.moVar + d.elecVar) * d._n5]                        // olvidar la parte fija
      }
    };
  }
};

// V/F y alternativas: a qué ronda y número del .md corresponde cada ítem de la página
export const TEORIA = {
  'costos/vf-costos': { md: '**VF2.A**', items: { a1: 1, a2: 2, a3: 3, a4: 4, a5: 5, a6: 6, a7: 7, a8: 8, a9: 9, a10: 10, a11: 11, a12: 12, a13: 13, a14: 14 } },
  'costos/mc-costos': { mc: { m1: '**MC2.A**', m2: '**MC2.B**', m3: '**MC2.C**', m4: '**MC2.D**', m5: '**MC2.E**' } }
};
