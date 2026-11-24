#!/usr/bin/env node
// Verificación de la guía interactiva ICOFI · Certamen 3.
//
// Recalcula, desde los "datos" de cada enunciado, TODAS las respuestas numéricas guardadas
// (preguntas y celdas de tabla), los valores alternativos de redondeo y las trampas, y las compara con:
//   1. lo guardado en estudio/icofi-c3/datos/*.js,
//   2. el encargo (.md), si está la carpeta material_icofi/ (no se publica),
//   3. las pautas de los certámenes (PDF), si está la carpeta material_icofi/ y existe pdftotext.
// Además revisa que el corrector acepte la respuesta principal y las alternativas, que reconozca las trampas,
// que las tablas cuadren y que los V/F y alternativas coincidan con el .md.
//
// Uso: node _verificar_icofi_c3.mjs        (el "_" inicial evita que el archivo se publique en el sitio)

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(RAIZ, 'estudio', 'icofi-c3');
const MATERIAL = path.join(RAIZ, 'material_icofi', 'ICOFI_C3_material');

// ---------------------------------------------------------------- carga
function cargar(rel) { vm.runInThisContext(fs.readFileSync(path.join(DIR, rel), 'utf8'), { filename: rel }); }
cargar('motor.js');
cargar('datos/base.js');
fs.readdirSync(path.join(DIR, 'datos')).filter((f) => /^m\d.*\.js$/.test(f)).sort().forEach((f) => cargar('datos/' + f));
const M = globalThis.ICOFI_MOTOR;
const C = globalThis.ICOFI_C3;

let MD = null, PAUTAS = null;
try { MD = fs.readFileSync(path.join(MATERIAL, 'ICOFI_C3_interactivo_para_Claude_Code.md'), 'utf8'); } catch (e) { /* sin material */ }
try {
  PAUTAS = execFileSync('pdftotext', ['-layout', path.join(MATERIAL, 'Certamenes3_pasados_2022-2026_con_pautas.pdf'), '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
} catch (e) { /* sin PDF o sin pdftotext */ }

// ---------------------------------------------------------------- utilidades
const res = { ok: 0, fallas: [], avisos: [] };
const porEjercicio = [];
let actual = null;
function ok() { res.ok++; if (actual) actual.ok++; }
function falla(msg) { res.fallas.push((actual ? actual.key + ': ' : '') + msg); if (actual) actual.fallas++; }
function chk(cond, msg) { if (cond) ok(); else falla(msg); }
const entero = M.entero;
const r2 = (v) => M.redondear(v, 2);
const r1 = (v) => M.redondear(v, 1);
const igual = (a, b) => Math.abs(a - b) < 1e-6;
const sinHtml = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

// Redondeo con que se guarda cada tipo (1.4.1): pesos enteros, unitarios a 2 decimales
function redondeoTipo(v, tipo) {
  if (tipo === 'pesos') return entero(v);
  if (tipo === 'unitario') return r2(v);
  if (tipo === 'razon') return M.redondear(v, 5);
  if (tipo === 'porcentaje') return r2(v);
  return v;
}
// Cómo aparece un número en el .md o en la pauta
// (el valor principal de un unitario va con 2 decimales: 111,90; una alternativa, con los que tenga: 166,7)
function comoTexto(v, tipo, esAlt) {
  if (tipo === 'unitario') return M.num(v, Number.isInteger(v) ? 0 : (esAlt ? M.decimales(v, 2) : 2));
  if (tipo === 'razon') { const d = M.decimales(v, 5); return M.num(v, d < 2 ? 2 : d); }
  if (tipo === 'porcentaje') return M.num(v, M.decimales(v, 2));
  return M.num(v, M.decimales(v, 2));
}
function apareceTal(texto, numTxt) {
  const e = numTxt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('−', '[-−–]\\s?');
  return new RegExp('(^|[^\\d.,])' + e + '(?![\\d])(?![.,]\\d)').test(texto);
}
// El .md abrevia los millones: 55.000.000 = "55M", 5.440.000 = "5,44M"
function aparece(texto, numTxt) {
  if (apareceTal(texto, numTxt)) return true;
  const m = numTxt.match(/^(−?)(\d{1,3})\.(\d{3})\.000$/);
  if (!m) return false;
  const dec = m[3].replace(/0+$/, '');
  return apareceTal(texto, m[1] + m[2] + (dec ? ',' + dec : '') + 'M');
}
function seccionMd(ref) {
  if (!MD) return null;
  const i = MD.indexOf(ref);
  if (i < 0) return undefined;
  const resto = MD.slice(i + ref.length);
  const m = resto.search(/\n\*\*(E\d|L\d|VF\d|MC\d|Así lo preguntan|Resumen M)|\n### |\n---/);
  return MD.slice(i, i + ref.length + (m < 0 ? resto.length : m));
}
function seccionPauta(ancla, lineas) {
  if (!PAUTAS) return null;
  const i = PAUTAS.indexOf(ancla);
  if (i < 0) return undefined;
  return PAUTAS.slice(i).split('\n').slice(0, lineas || 70).join('\n');
}

// =====================================================================================
// RECÁLCULOS: una función por ejercicio. Recibe solo los "datos" del enunciado y devuelve
//   v:  { idPregunta | 'tabla:fila|col' : valor con todos los decimales }
//   alt:{ misma clave : [valores alternativos por redondeo] }
//   tr: { misma clave : [valores de las trampas (el error que describe cada una)] }
// y, para cotejar: md (título de la sección en el encargo) y pauta (texto ancla en el PDF).
// =====================================================================================
const CALC = {};

// ---------- Módulo 4 ----------
CALC['procesos/ejemplo-base'] = {
  md: '**E4.1 Ejemplo base',
  f(d) {
    const ue = d.terminadas + d.enProceso * d.avance;
    const unit = d.costo / ue;
    return { v: { unitario: unit, pt: d.terminadas * unit, penp: d.enProceso * d.avance * unit }, extra: { ue }, suma: [[['pt', 'penp'], d.costo]] };
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
    return { v: { normal: uNormal, anormal: uAnormal, perdida: d.malas * uAnormal }, extra: { produccion: d.buenas + d.malas } };
  }
};
CALC['procesos/etc-dos-departamentos'] = {
  md: '**E4.4 Producto "ETC"',
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
    return {
      v: {
        'd1-ue:enp|2': a.enProceso * a.avMat, 'd1-ue:enp|3': a.enProceso * a.avConv, 'd1-ue:mn|2': 0, 'd1-ue:mn|3': 0, 'd1-ue:tot|2': ue1mp, 'd1-ue:tot|3': ue1cc,
        'd1-unit:mp|2': u1mp, 'd1-unit:cc|2': u1cc, 'd1-unit:tot|2': u1,
        'd1-dist:tt|1': tt, 'd1-dist:pmp|1': pmp, 'd1-dist:pcc|1': pcc, 'd1-dist:penp|1': pmp + pcc, 'd1-dist:mn|1': 0,
        'd2-ue:tt|2': b.terminadas, 'd2-ue:tt|3': b.terminadas, 'd2-ue:tt|4': b.terminadas,
        'd2-ue:enp|2': b.enProceso, 'd2-ue:enp|3': b.enProceso * b.avMat, 'd2-ue:enp|4': b.enProceso * b.avConv,
        'd2-ue:ma|2': b.mermaAnormal, 'd2-ue:ma|3': b.mermaAnormal, 'd2-ue:ma|4': b.mermaAnormal,
        'd2-ue:tot|2': ue2mp1, 'd2-ue:tot|3': ue2mp, 'd2-ue:tot|4': ue2cc,
        'd2-unit:mp1|1': tt, 'd2-unit:mp1|2': u2mp1, 'd2-unit:mp|2': u2mp, 'd2-unit:cc|2': u2cc, 'd2-unit:tot|1': costo2, 'd2-unit:tot|2': u2,
        'd2-dist:pt|1': pt, 'd2-dist:pmp1|1': qmp1, 'd2-dist:pmp|1': qmp, 'd2-dist:pcc|1': qcc, 'd2-dist:penp|1': qmp1 + qmp + qcc, 'd2-dist:ma|1': ma,
        p1: u2, p2: a.enProceso + b.enProceso, p3: pmp + pcc + qmp1 + qmp + qcc, p4: 0, p5: ma
      },
      alt: {
        'd1-unit:mp|2': [c1mp], 'd1-unit:tot|2': [c1],
        'd1-dist:tt|1': [ctt], 'd1-dist:pmp|1': [cpmp], 'd1-dist:pcc|1': [cpcc], 'd1-dist:penp|1': [cpenp1],
        'd2-unit:mp1|1': [ctt], 'd2-unit:mp1|2': [c2mp1], 'd2-unit:mp|2': [c2mp], 'd2-unit:cc|2': [c2cc], 'd2-unit:tot|1': [ccosto2], 'd2-unit:tot|2': [c2],
        'd2-dist:pt|1': [cpt], 'd2-dist:pmp1|1': [cqmp1], 'd2-dist:pmp|1': [cqmp], 'd2-dist:pcc|1': [cqcc], 'd2-dist:penp|1': [cpenp2], 'd2-dist:ma|1': [cmaDif, cmaDir],
        p1: [c2], p3: [cpenp1 + cpenp2], p5: [cmaDif, cmaDir]
      },
      fijos: {
        'd1-ue:tt|1': a.terminadas, 'd1-ue:enp|1': a.enProceso, 'd1-ue:mn|1': a.mermaNormal, 'd1-ue:tot|1': a.puestas,
        'd1-unit:mp|1': a.materiales, 'd1-unit:cc|1': a.conversion, 'd1-unit:tot|1': costo1, 'd1-dist:tot|1': costo1,
        'd2-ue:tt|1': b.terminadas, 'd2-ue:enp|1': b.enProceso, 'd2-ue:ma|1': b.mermaAnormal, 'd2-ue:tot|1': a.terminadas,
        'd2-unit:mp|1': b.materiales, 'd2-unit:cc|1': b.conversion, 'd2-dist:tot|1': costo2
      },
      modelo: { 'd1-ue:tt|2': a.terminadas, 'd1-ue:tt|3': a.terminadas },
      suma: [
        [['d1-dist:tt|1', 'd1-dist:penp|1', 'd1-dist:mn|1'], costo1],
        [['d2-dist:pt|1', 'd2-dist:penp|1', 'd2-dist:ma|1'], costo2]
      ],
      partidas: [a.puestas === a.terminadas + a.enProceso + a.mermaNormal + a.mermaAnormal, a.terminadas === b.terminadas + b.enProceso + b.mermaNormal + b.mermaAnormal]
    };
  }
};

// V/F y alternativas: a qué ronda y número del .md corresponde cada ítem de la página
const TEORIA = {
  'procesos/vf-procesos': { md: '**VF4.A**', items: { a1: 1, a2: 2, a3: 3, a4: 4, a5: 5 } },
  'procesos/mc-procesos': { mc: { m1: '**MC4.A**' } }
};

// =====================================================================================
// Revisión
// =====================================================================================
function revisarPregunta(key, q, calc, secMd, secPauta, esCertamen, enPauta) {
  const tipo = q.tipo || 'pesos';
  const rot = key + ' (' + M.formatear(q.respuesta, q) + ')';
  // 1. Recalculado == guardado
  if (!(key in calc.v)) { falla(key + ': no tiene recálculo'); return; }
  const esperado = redondeoTipo(calc.v[key], tipo);
  chk(igual(esperado, q.respuesta), rot + ': recalculado ' + esperado + ' ≠ guardado ' + q.respuesta);
  // 2. El corrector acepta el valor principal escrito en formato chileno
  const escrito = M.formatear(q.respuesta, q);
  chk(M.corregir(q, escrito).estado === 'correcta', rot + ': el corrector no acepta «' + escrito + '»');
  chk(M.corregir(q, String(q.respuesta).replace('.', ',')).estado === 'correcta', rot + ': el corrector no acepta el número sin formato');
  // 3. Alternativas de redondeo
  const altsCalc = ((calc.alt || {})[key] || []).map((v) => redondeoTipo(v, tipo === 'unitario' ? 'unitario' : tipo));
  (q.tambien || []).forEach((a) => {
    chk(altsCalc.some((v) => igual(v, a.valor)), rot + ': la alternativa ' + a.valor + ' no sale del camino alternativo (' + altsCalc.join(', ') + ')');
    const e = M.corregir(q, M.soloNumero(a.valor, { tipo: tipo === 'unitario' ? 'unitario' : tipo }).replace(/\./g, tipo === 'unitario' ? '.' : '')).estado;
    chk(e === 'alternativa' || e === 'correcta', rot + ': el corrector no acepta la alternativa ' + a.valor + ' (' + e + ')');
    chk(!!a.nota, rot + ': la alternativa ' + a.valor + ' no tiene nota');
    if (secMd) chk(aparece(secMd, comoTexto(a.valor, tipo, true)), rot + ': la alternativa ' + comoTexto(a.valor, tipo, true) + ' no aparece en el .md');
  });
  altsCalc.forEach((v) => { if (!igual(v, q.respuesta)) chk((q.tambien || []).some((a) => igual(a.valor, v)) || M.esAcierto(M.corregir(q, String(v).replace('.', ',')).estado), rot + ': el valor alternativo ' + v + ' no se acepta'); });
  // 4. Trampas
  const trCalc = ((calc.tr || {})[key] || []).map((v) => redondeoTipo(v, tipo));
  (q.trampas || []).forEach((t) => {
    chk(trCalc.some((v) => igual(v, t.valor)), rot + ': la trampa ' + t.valor + ' no sale del error que describe (' + trCalc.join(', ') + ')');
    const r = M.corregir(q, String(t.valor).replace('.', ','));
    chk(r.estado === 'trampa' && r.trampa === t, rot + ': el corrector no muestra el mensaje de la trampa ' + t.valor + ' (' + r.estado + ')');
    chk(Math.abs(t.valor - q.respuesta) > M.tolerancia(q), rot + ': la trampa ' + t.valor + ' cae dentro de la tolerancia de la respuesta');
    chk(!!t.msg, rot + ': trampa sin mensaje');
    if (secMd) chk(aparece(secMd, comoTexto(t.valor, tipo)), rot + ': la trampa ' + comoTexto(t.valor, tipo) + ' no aparece en el .md');
  });
  // 5. Aparece en el .md y en la pauta
  if (q.respuesta !== 0) {
    if (secMd) chk(aparece(secMd, comoTexto(q.respuesta, tipo)), rot + ': «' + comoTexto(q.respuesta, tipo) + '» no aparece en la sección del .md');
    if (secPauta && esCertamen && enPauta) chk(aparece(secPauta, comoTexto(q.respuesta, tipo)), rot + ': «' + comoTexto(q.respuesta, tipo) + '» no aparece en la pauta del certamen');
  }
}

function revisarEjercicio(b) {
  actual = { key: b.key, ok: 0, fallas: 0, n: 0, alts: 0, trampas: 0, md: '-', pauta: '-' };
  porEjercicio.push(actual);
  const reg = CALC[b.key];
  if (!reg) { falla('no tiene función de recálculo'); return; }
  chk(!!b.fuente, 'sin fuente');
  chk(!!b.datos, 'sin "datos" del enunciado');
  const calc = reg.f(b.datos);
  const secMd = seccionMd(reg.md);
  if (secMd === undefined) falla('no encuentro la sección «' + reg.md + '» en el .md');
  actual.md = secMd ? 'sí' : (MD ? 'NO' : 'sin material');
  const esCertamen = b.fuente && b.fuente.k === 'certamen';
  let secPauta = null;
  if (esCertamen) {
    chk(!!reg.pauta, 'ejercicio de certamen sin ancla de pauta');
    secPauta = reg.pauta ? seccionPauta(reg.pauta, reg.pautaLineas) : null;
    if (secPauta === undefined) falla('no encuentro «' + reg.pauta + '» en las pautas');
    actual.pauta = secPauta ? 'sí' : (PAUTAS ? 'NO' : 'sin material');
  }
  // Los datos del enunciado deben verse en el enunciado
  const textoEnunciado = sinHtml(b.enunciado + ' ' + JSON.stringify(b.tablaDatos || ''));
  (function recorrer(o, ruta) {
    Object.keys(o).forEach((k) => {
      const v = o[k];
      if (v && typeof v === 'object') return recorrer(v, ruta + k + '.');
      if (typeof v !== 'number' || v === 0) return;
      const txt = v <= 1 ? M.num(v * 100, M.decimales(v * 100, 2)) + ' %' : M.num(v, M.decimales(v, 2));
      chk(textoEnunciado.indexOf(txt) >= 0, 'el dato ' + ruta + k + ' = ' + txt + ' no aparece en el enunciado');
    });
  })(b.datos, '');
  const vistos = {};
  b.partes.forEach((p) => {
    if (p.tabla) {
      p.tabla.filas.forEach((f) => f.celdas.forEach((c, ci) => {
        const key = p.tabla.id + ':' + f.id + '|' + ci;
        if (c.r !== undefined) {
          actual.n++; actual.alts += (c.tambien || []).length; actual.trampas += (c.trampas || []).length;
          vistos[key] = c.r;
          chk(!!c.s, key + ': celda sin explicación');
          revisarPregunta(key, { tipo: c.tipo || 'pesos', respuesta: c.r, tambien: c.tambien, trampas: c.trampas, guion: c.guion }, calc, secMd, null, false, false);
        } else if (c.f !== undefined) {
          chk(calc.fijos && key in calc.fijos && igual(calc.fijos[key], c.f), key + ': dato fijo ' + c.f + ' ≠ ' + (calc.fijos || {})[key] + ' (según los datos)');
        } else if (c.m !== undefined) {
          chk(calc.modelo && key in calc.modelo && igual(calc.modelo[key], c.m), key + ': celda modelo ' + c.m + ' no coincide con el recálculo');
        }
      }));
      if (p.tabla.cuadre) {
        const q = p.tabla.cuadre;
        const suma = q.celdas.reduce((s, fid) => s + p.tabla.filas.find((f) => f.id === fid).celdas[q.col].r, 0);
        chk(suma === q.objetivo, p.tabla.id + ': la tabla no cuadra (' + suma + ' ≠ ' + q.objetivo + ')');
      }
    }
    (p.preguntas || []).forEach((q) => {
      actual.n++; actual.alts += (q.tambien || []).length; actual.trampas += (q.trampas || []).length;
      vistos[q.id] = q.respuesta;
      chk(!!q.sol && !!q.sol.d && !!q.sol.f && !!q.sol.c, q.id + ': falta el desarrollo (dato, fórmula, cálculo)');
      if (q.clasif) chk(q.clasif.correcta >= 0 && q.clasif.correcta < q.clasif.opciones.length && !!q.clasif.porque, q.id + ': clasificación mal definida');
      revisarPregunta(q.id, q, calc, secMd, secPauta, esCertamen, true);
    });
  });
  // Todo lo recalculado está cargado en la página (nada quedó fuera)
  Object.keys(calc.v).forEach((k) => chk(k in vistos, 'el valor recalculado «' + k + '» no está en la página'));
  // Sumas de control con los valores guardados (las tablas y totales cuadran)
  (calc.suma || []).forEach(([claves, total]) => {
    const s = claves.reduce((acc, k) => acc + vistos[k], 0);
    chk(s === total, 'no cuadra: ' + claves.join(' + ') + ' = ' + s + ' ≠ ' + total);
  });
  (calc.partidas || []).forEach((x, i) => chk(x === true, 'las unidades físicas no cuadran (partida ' + (i + 1) + ')'));
}

function revisarTeoria(b) {
  actual = { key: b.key, ok: 0, fallas: 0, n: b.items.length, alts: 0, trampas: 0, md: '-', pauta: '-' };
  porEjercicio.push(actual);
  const reg = TEORIA[b.key];
  if (!reg) { falla('no está en la tabla TEORIA del verificador'); return; }
  if (b.tipo === 'vf') {
    const sec = seccionMd(reg.md);
    if (sec === undefined) { falla('no encuentro ' + reg.md + ' en el .md'); return; }
    actual.md = sec ? 'sí' : 'sin material';
    b.items.forEach((x) => {
      chk(!!x.fuente && !!x.porque && typeof x.r === 'boolean', x.id + ': V/F incompleto');
      const n = reg.items[x.id];
      chk(!!n, x.id + ': sin número del .md');
      if (!sec || !n) return;
      const linea = sec.split('\n').find((l) => new RegExp('^' + n + '\\. ').test(l));
      const m = linea && linea.match(/\*\*(V|F)\*\*/);
      chk(!!m && (m[1] === 'V') === x.r, x.id + ': en el .md es ' + (m ? m[1] : '?') + ' y en la página ' + (x.r ? 'V' : 'F'));
    });
  } else {
    actual.md = MD ? 'sí' : 'sin material';
    b.items.forEach((x) => {
      chk(!!x.fuente && !!x.porque && x.correcta >= 0 && x.correcta < x.opciones.length, x.id + ': alternativa incompleta');
      const ref = reg.mc[x.id];
      chk(!!ref, x.id + ': sin referencia al .md');
      if (!MD || !ref) return;
      const linea = MD.split('\n').find((l) => l.indexOf(ref) >= 0);
      const m = linea && linea.match(/\*\*([a-d])\)/);
      chk(!!m && 'abcd'.indexOf(m[1]) === x.correcta, x.id + ': en el .md la correcta es ' + (m ? m[1] : '?') + ') y en la página ' + 'abcd'.charAt(x.correcta) + ')');
    });
  }
}

// ---------------------------------------------------------------- ejecución
const ids = new Set();
C.modulos.slice().sort((a, b) => a.n - b.n).forEach((mod) => {
  mod.bloques.forEach((b) => {
    b.key = mod.id + '/' + b.id;
    actual = null;
    chk(!ids.has(b.key), b.key + ': id de bloque repetido');
    ids.add(b.key);
    if (b.tipo === 'ejercicio') revisarEjercicio(b);
    else if (b.tipo === 'vf' || b.tipo === 'mc') revisarTeoria(b);
    else if (b.tipo === 'leccion' && b.porque) {
      actual = null;
      chk(b.porque.correcta >= 0 && b.porque.correcta < b.porque.opciones.length && !!b.porque.porque, b.key + ': «¿por qué?» mal definido');
    }
  });
});
actual = null;
Object.keys(CALC).forEach((k) => chk(ids.has(k), 'hay un recálculo para «' + k + '» pero ese ejercicio no existe'));

// Pruebas del corrector (formato chileno, 1.4)
[
  [{ tipo: 'pesos', respuesta: 36000000 }, ['36.000.000', '36000000', '$ 36.000.000', '$36.000.000'], 'correcta'],
  [{ tipo: 'unitario', respuesta: 36.5 }, ['36,5', '36.5', '$ 36,5'], 'correcta'],
  [{ tipo: 'unitario', respuesta: 278.57, tambien: [{ valor: 278.6 }] }, ['278,57', '278.57'], 'correcta'],
  [{ tipo: 'unitario', respuesta: 278.57, tambien: [{ valor: 278.6 }] }, ['278,6', '278.6'], 'alternativa'],
  [{ tipo: 'porcentaje', respuesta: 70 }, ['70', '70%', '70 %', '0,7', '0,70'], 'correcta'],
  [{ tipo: 'razon', respuesta: 0.7 }, ['0,7', '0,70', '70%', '70 %'], 'correcta'],
  [{ tipo: 'pesos', respuesta: 20512, tambien: [{ valor: 20513 }] }, ['20.513'], 'alternativa'],
  [{ tipo: 'unidades', respuesta: 15 }, ['14', '16'], 'incorrecta'],
  [{ tipo: 'pesos', respuesta: 36000000, trampas: [{ valor: 42840000, msg: 'x' }] }, ['42.840.000'], 'trampa']
].forEach(([q, textos, esperado]) => textos.forEach((t) => chk(M.corregir(q, t).estado === esperado, 'corrector: «' + t + '» debería ser ' + esperado + ' y es ' + M.corregir(q, t).estado)));
chk(M.entero(6837.5) === 6838 && M.entero(4437.5) === 4438, 'redondeo: un ,5 debe subir');
chk(M.nota(100) === 7 && M.nota(0) === 1 && M.nota(50) === 4, 'nota: 1 + 6·puntaje/100');

// ---------------------------------------------------------------- informe
const col = (s, n) => String(s).padEnd(n).slice(0, Math.max(n, String(s).length));
console.log('\nVerificación de la guía ICOFI · Certamen 3');
console.log('Encargo (.md): ' + (MD ? 'encontrado' : 'NO disponible (falta material_icofi/)') + ' · Pautas (PDF): ' + (PAUTAS ? 'leídas' : 'NO disponibles') + '\n');
console.log(col('Bloque', 38) + col('Resp.', 7) + col('Altern.', 9) + col('Trampas', 9) + col('.md', 6) + col('Pauta', 7) + 'Resultado');
console.log('-'.repeat(92));
porEjercicio.forEach((e) => console.log(col(e.key, 38) + col(e.n, 7) + col(e.alts, 9) + col(e.trampas, 9) + col(e.md, 6) + col(e.pauta, 7) + (e.fallas ? 'FALLA (' + e.fallas + ')' : 'OK · ' + e.ok + ' comprobaciones')));
console.log('-'.repeat(92));
const tot = porEjercicio.reduce((a, e) => ({ n: a.n + e.n, alts: a.alts + e.alts, tr: a.tr + e.trampas }), { n: 0, alts: 0, tr: 0 });
console.log(col('Total: ' + porEjercicio.length + ' bloques', 38) + col(tot.n, 7) + col(tot.alts, 9) + col(tot.tr, 9));
console.log('\nComprobaciones correctas: ' + res.ok + ' · Fallas: ' + res.fallas.length);
if (res.fallas.length) { console.log('\nFALLAS:'); res.fallas.forEach((f) => console.log('  ✗ ' + f)); process.exit(1); }
console.log('✓ Todo coincide.\n');
