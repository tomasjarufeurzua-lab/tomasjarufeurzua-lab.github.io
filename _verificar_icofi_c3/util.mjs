// Utilidades compartidas por los recálculos.
export const IVA = 0.19;
// Redondeos (un ,5 sube)
export const entero = (v) => Math.floor(v + 0.5 + 1e-9);
export const r1 = (v) => Math.floor(v * 10 + 0.5 + 1e-9) / 10;
export const r2 = (v) => Math.floor(v * 100 + 0.5 + 1e-9) / 100;
