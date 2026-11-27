// Recálculos del Módulo 4 (procesos, unidades equivalentes y mermas).
// Cada función recibe SOLO los "datos" del enunciado y devuelve los valores con todos los decimales.
import { r1 } from './util.mjs';

export const CALC = {};

CALC['procesos/ejemplo-base'] = {
  md: '**E4.1 Ejemplo base',
  f(d) {
    const ue = d.terminadas + d.enProceso * d.avance;
    const unit = d.costo / ue;
    return {
      v: { unitario: unit, pt: d.terminadas * unit, penp: d.enProceso * d.avance * unit },
      tr: {
        unitario: [d.costo / d.iniciadas],        // dividir por las unidades físicas
        penp: [d.enProceso * unit]                // no aplicar el % de avance
      },
      suma: [[['pt', 'penp'], d.costo]]
    };
  }
};
CALC['procesos/lean-harina'] = {
  md: '**E4.2 Lean Ltda.',
  pauta: 'LEAN LIMITADA',
  f(d) {
    const enp = d.recibidos - d.terminados;
    const uePrimo = d.terminados + enp * d.avancePrimo, ueCif = d.terminados + enp * d.avanceCif;
    const uPrimo = d.costosPrimos / uePrimo, uCif = d.cif / ueCif;
    return {
      v: {
        'ue:tt|2': d.terminados, 'ue:tt|3': d.terminados, 'ue:enp|1': enp, 'ue:enp|2': enp * d.avancePrimo, 'ue:enp|3': enp * d.avanceCif,
        'ue:tot|2': uePrimo, 'ue:tot|3': ueCif, 'ue:unit|2': uPrimo, 'ue:unit|3': uCif,
        p1: enp * d.avancePrimo * uPrimo + enp * d.avanceCif * uCif,
        p2: d.terminados * (uPrimo + uCif),
        p3: enp * d.avancePrimo,
        p4: uPrimo + uCif
      },
      tr: {
        'ue:enp|2': [enp], 'ue:enp|3': [enp],                 // no aplicar el % de avance
        p1: [enp * (uPrimo + uCif)],                           // en proceso como si estuviera terminado
        p3: [enp]                                              // kg físicos en vez de equivalentes
      },
      fijos: { 'ue:tt|1': d.terminados, 'ue:tot|1': d.recibidos, 'ue:costo|2': d.costosPrimos, 'ue:costo|3': d.cif },
      suma: [[['p1', 'p2'], d.costosPrimos + d.cif]]
    };
  }
};
CALC['procesos/abon-champu'] = {
  md: '**E4.3 ABON S.A.',
  pauta: '“ABON S.A.”',
  f(d) {
    const enp = d.iniciadas - d.transferidas;
    const mo = d.mod + d.moi;
    const ueMpd = d.transferidas + enp * d.avMpd, ueMo = d.transferidas + enp * d.avMo, ueMpi = d.transferidas + enp * d.avMpi;
    const uMpd = d.mpd / ueMpd, uMo = mo / ueMo, uMpi = d.mpi / ueMpi;
    const unit = uMpd + uMo + uMpi;
    return {
      v: {
        'ue:mpd|2': ueMpd, 'ue:mpd|3': uMpd, 'ue:mo|1': mo, 'ue:mo|2': ueMo, 'ue:mo|3': uMo, 'ue:mpi|2': ueMpi, 'ue:mpi|3': uMpi, 'ue:tot|3': unit,
        p1: enp * d.avMpd * uMpd + enp * d.avMo * uMo + enp * d.avMpi * uMpi,
        p2: d.transferidas * unit,
        p3: ueMo,
        p4: unit
      },
      tr: {
        p1: [enp * unit],                                      // en proceso como si estuviera terminado
        p3: [ueMpd],                                           // UE de la MPD en vez de las de MOD y MOI
        p4: [(d.mpd + mo + d.mpi) / d.iniciadas]               // costo total ÷ unidades iniciadas
      },
      fijos: { 'ue:mpd|1': d.mpd, 'ue:mpi|1': d.mpi, 'ue:tot|1': d.mpd + mo + d.mpi },
      suma: [[['p1', 'p2'], d.mpd + mo + d.mpi]]
    };
  }
};
CALC['procesos/mermas-dos-casos'] = {
  md: '**E4.1b Mermas',
  f(d) {
    const uNormal = d.costo / d.buenas;                 // la merma normal no se cuenta
    const uAnormal = d.costo / (d.buenas + d.malas);    // la merma anormal sí se cuenta
    return {
      v: { normal: uNormal, anormal: uAnormal, perdida: d.malas * uAnormal },
      tr: { normal: [uAnormal], anormal: [uNormal], perdida: [d.malas * uNormal] }  // confundir un caso con el otro
    };
  }
};
CALC['procesos/etc-dos-departamentos'] = {
  md: '**E4.4 Producto "ETC"',
  trans: '### Ejercicio Nº 2 del taller', // la respuesta se coteja con la transcripción de la clase
  f(d) {
    const a = d.d1, b = d.d2;
    // --- Depto. 1 (merma normal: no entra a las UE)
    const ue1mp = a.terminadas + a.enProceso * a.avMat, ue1cc = a.terminadas + a.enProceso * a.avConv;
    const u1mp = a.materiales / ue1mp, u1cc = a.conversion / ue1cc, u1 = u1mp + u1cc;
    const tt = a.terminadas * u1, pmp = a.enProceso * a.avMat * u1mp, pcc = a.enProceso * a.avConv * u1cc;
    const costo1 = a.materiales + a.conversion;
    // --- Depto. 2 (costo transferido = MP1 al 100 %; merma anormal terminada: entra a las UE)
    const ue2mp1 = b.terminadas + b.enProceso + b.mermaAnormal;
    const ue2mp = b.terminadas + b.enProceso * b.avMat + b.mermaAnormal, ue2cc = b.terminadas + b.enProceso * b.avConv + b.mermaAnormal;
    const u2mp1 = tt / ue2mp1, u2mp = b.materiales / ue2mp, u2cc = b.conversion / ue2cc, u2 = u2mp1 + u2mp + u2cc;
    const pt = b.terminadas * u2, qmp1 = b.enProceso * u2mp1, qmp = b.enProceso * b.avMat * u2mp, qcc = b.enProceso * b.avConv * u2cc, ma = b.mermaAnormal * u2;
    const costo2 = tt + b.materiales + b.conversion;
    // --- Camino de la resolución de clase: costos unitarios redondeados a UN decimal
    const c1mp = r1(u1mp), c1cc = r1(u1cc), c1 = r1(c1mp + c1cc);
    const ctt = a.terminadas * c1, cpmp = a.enProceso * a.avMat * c1mp;
    const cpenp1 = costo1 - ctt;                       // en clase el depto. 1 cuadra en 244.000
    const cpcc = cpenp1 - cpmp;
    const c2mp1 = r1(ctt / ue2mp1), c2mp = r1(u2mp), c2cc = r1(u2cc), c2 = r1(c2mp1 + c2mp + c2cc);
    const cpt = b.terminadas * c2, cqmp1 = b.enProceso * c2mp1, cqmp = b.enProceso * b.avMat * c2mp, cqcc = b.enProceso * b.avConv * c2cc;
    const cpenp2 = cqmp1 + cqmp + cqcc;
    const ccosto2 = ctt + b.materiales + b.conversion;
    const cmaDif = ccosto2 - cpt - cpenp2;             // merma anormal por diferencia (clase)
    const cmaDir = b.mermaAnormal * c2;                // merma anormal = 100 × 508,1
    // Tolerancia 0: la respuesta es la de la RESOLUCIÓN DEL PROFESOR (costos unitarios con un decimal).
    // El depto. 1 se cierra en su costo total (el costo de conversión en proceso sale por diferencia)
    // y la merma anormal del depto. 2 también se obtiene por diferencia.
    return {
      v: {
        'd1-ue:enp|2': a.enProceso * a.avMat, 'd1-ue:enp|3': a.enProceso * a.avConv, 'd1-ue:mn|2': 0, 'd1-ue:mn|3': 0, 'd1-ue:tot|2': ue1mp, 'd1-ue:tot|3': ue1cc,
        'd1-unit:mp|2': c1mp, 'd1-unit:cc|2': c1cc, 'd1-unit:tot|2': c1,
        'd1-dist:tt|1': ctt, 'd1-dist:pmp|1': cpmp, 'd1-dist:pcc|1': cpcc, 'd1-dist:penp|1': cpenp1, 'd1-dist:mn|1': 0,
        'd2-ue:tt|2': b.terminadas, 'd2-ue:tt|3': b.terminadas, 'd2-ue:tt|4': b.terminadas,
        'd2-ue:enp|2': b.enProceso, 'd2-ue:enp|3': b.enProceso * b.avMat, 'd2-ue:enp|4': b.enProceso * b.avConv,
        'd2-ue:ma|2': b.mermaAnormal, 'd2-ue:ma|3': b.mermaAnormal, 'd2-ue:ma|4': b.mermaAnormal,
        'd2-ue:tot|2': ue2mp1, 'd2-ue:tot|3': ue2mp, 'd2-ue:tot|4': ue2cc,
        'd2-unit:mp1|1': ctt, 'd2-unit:mp1|2': c2mp1, 'd2-unit:mp|2': c2mp, 'd2-unit:cc|2': c2cc, 'd2-unit:tot|1': ccosto2, 'd2-unit:tot|2': c2,
        'd2-dist:pt|1': cpt, 'd2-dist:pmp1|1': cqmp1, 'd2-dist:pmp|1': cqmp, 'd2-dist:pcc|1': cqcc, 'd2-dist:penp|1': cpenp2, 'd2-dist:ma|1': cmaDif,
        p1: c2, p2: a.enProceso + b.enProceso, p3: cpenp1 + cpenp2, p4: 0, p5: cmaDif
      },
      // Cerca, pero mal: lo que sale con todos los decimales, o multiplicando donde el profesor cierra por diferencia
      casi: {
        'd1-unit:mp|2': [u1mp], 'd1-unit:tot|2': [u1],
        'd1-dist:tt|1': [tt], 'd1-dist:pmp|1': [pmp], 'd1-dist:pcc|1': [a.enProceso * a.avConv * c1cc, pcc], 'd1-dist:penp|1': [pmp + pcc, cpmp + a.enProceso * a.avConv * c1cc],
        'd2-unit:mp1|1': [tt], 'd2-unit:mp1|2': [u2mp1], 'd2-unit:mp|2': [u2mp], 'd2-unit:cc|2': [u2cc], 'd2-unit:tot|1': [costo2], 'd2-unit:tot|2': [u2],
        'd2-dist:pt|1': [pt], 'd2-dist:pmp1|1': [qmp1], 'd2-dist:pmp|1': [qmp], 'd2-dist:pcc|1': [qcc], 'd2-dist:penp|1': [qmp1 + qmp + qcc], 'd2-dist:ma|1': [cmaDir, ma],
        p1: [u2], p3: [pmp + pcc + qmp1 + qmp + qcc], p5: [cmaDir, ma]
      },
      fijos: {
        'd1-ue:tt|1': a.terminadas, 'd1-ue:enp|1': a.enProceso, 'd1-ue:mn|1': a.mermaNormal, 'd1-ue:tot|1': a.puestas,
        'd1-unit:mp|1': a.materiales, 'd1-unit:cc|1': a.conversion, 'd1-unit:tot|1': costo1, 'd1-dist:tot|1': costo1,
        'd2-ue:tt|1': b.terminadas, 'd2-ue:enp|1': b.enProceso, 'd2-ue:ma|1': b.mermaAnormal, 'd2-ue:tot|1': a.terminadas,
        'd2-unit:mp|1': b.materiales, 'd2-unit:cc|1': b.conversion, 'd2-dist:tot|1': ccosto2
      },
      tr: {
        'd1-ue:enp|3': [a.enProceso],                                             // no aplicar el 70 %
        'd1-ue:mn|2': [a.mermaNormal], 'd1-ue:mn|3': [a.mermaNormal],             // contar la merma normal
        'd1-ue:tot|2': [ue1mp + a.mermaNormal], 'd1-ue:tot|3': [ue1cc + a.mermaNormal],
        'd1-unit:mp|2': [a.materiales / a.puestas],                               // dividir por las unidades puestas en proceso
        'd1-dist:mn|1': [a.mermaNormal * c1],                                     // costear la merma normal
        'd2-ue:enp|4': [b.enProceso],                                             // no aplicar el 60 %
        'd2-ue:ma|2': [0], 'd2-ue:ma|3': [0], 'd2-ue:ma|4': [0],                  // no contar la merma anormal
        'd2-ue:tot|2': [ue2mp1 - b.mermaAnormal], 'd2-ue:tot|3': [ue2mp - b.mermaAnormal], 'd2-ue:tot|4': [ue2cc - b.mermaAnormal],
        p1: [c1],                                                                 // unitario del depto. 1
        p3: [cpenp1, cpenp2],                                                     // un solo departamento
        p4: [a.mermaNormal * c1]                                                  // costear la merma normal
      },
      cl: { p5: 1 }, // la merma anormal va al estado de resultados como pérdida no operacional (opción 1)
      modelo: { 'd1-ue:tt|2': a.terminadas, 'd1-ue:tt|3': a.terminadas },
      suma: [
        [['d1-dist:tt|1', 'd1-dist:penp|1', 'd1-dist:mn|1'], costo1],
        [['d1-dist:pmp|1', 'd1-dist:pcc|1'], cpenp1],
        [['d2-dist:pt|1', 'd2-dist:penp|1', 'd2-dist:ma|1'], ccosto2],
        [['d2-dist:pmp1|1', 'd2-dist:pmp|1', 'd2-dist:pcc|1'], cpenp2]
      ],
      partidas: [a.puestas === a.terminadas + a.enProceso + a.mermaNormal + a.mermaAnormal, a.terminadas === b.terminadas + b.enProceso + b.mermaNormal + b.mermaAnormal]
    };
  }
};

// V/F y alternativas: a qué ronda y número del .md corresponde cada ítem de la página
export const TEORIA = {
  'procesos/vf-procesos': { md: '**VF4.A**', items: { a1: 1, a2: 2, a3: 3, a4: 4, a5: 5 } },
  'procesos/mc-procesos': { mc: { m1: '**MC4.A**' } }
};

