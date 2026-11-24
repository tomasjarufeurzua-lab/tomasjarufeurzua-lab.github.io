// Recálculos del Módulo 0 (repaso de lo anterior).
import { IVA } from './util.mjs';

export const CALC = {
  'inicio/repaso-rapido': {
    md: '**L0.1 Lo que necesitas de antes',
    f(d) {
      return {
        v: { neto: d.bruto / (1 + IVA), neta: d.uai * (1 - d.t) },
        tr: {
          neto: [d.bruto * (1 - IVA), d.bruto * (1 + IVA)],   // restar 19 % al bruto · sumar IVA otra vez
          neta: [d.uai * d.t]                                  // el impuesto en vez de la utilidad neta
        }
      };
    }
  }
};
export const TEORIA = {};
