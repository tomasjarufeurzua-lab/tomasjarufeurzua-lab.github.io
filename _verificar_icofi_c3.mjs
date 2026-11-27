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
import { fileURLToPath, pathToFileURL } from 'node:url';

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

let MD = null, PAUTAS = null, TRANS = null;
try { TRANS = fs.readFileSync(path.join(MATERIAL, 'Transcripcion_clases_ICOFI_C3.md'), 'utf8'); } catch (e) { /* sin material */ }
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
  if (tipo === 'unitario') return M.num(v, M.decimales(v, 2));
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
// Sección de la transcripción de clases: desde el ancla hasta la nota de verificación (que no es del profesor)
function seccionTrans(ancla) {
  if (!TRANS) return null;
  const i = TRANS.indexOf(ancla);
  if (i < 0) return undefined;
  const resto = TRANS.slice(i);
  const fin = resto.indexOf('*Nota de verificación');
  return fin < 0 ? resto : resto.slice(0, fin);
}
function seccionPauta(ancla, lineas) {
  if (!PAUTAS) return null;
  const i = PAUTAS.indexOf(ancla);
  if (i < 0) return undefined;
  return PAUTAS.slice(i).split('\n').slice(0, lineas || 70).join('\n');
}

// =====================================================================================
// RECÁLCULOS: están en _verificar_icofi_c3/mN.mjs, una función por ejercicio.
// Cada una recibe solo los "datos" del enunciado y devuelve:
//   v:   { idPregunta | 'tabla:fila|col' : valor con todos los decimales }
//        (en una pregunta de opción, el índice de la opción correcta)
//   alt: { misma clave : [valores alternativos por redondeo] }
//   tr:  { misma clave : [valores de las trampas: el resultado de cometer el error que describe cada una] }
//   cl:  { idPregunta : índice correcto de la clasificación (sub/sobreaplicación, etc.) }
//   fijos, modelo: celdas dadas de las tablas · suma: controles de cuadre · partidas: unidades físicas
// y, para cotejar: md (título de la sección en el encargo), pauta (texto ancla en el PDF),
// sinMd / sinPauta: ids que no se buscan en esa fuente (con el motivo en un comentario).
// =====================================================================================
const CALC = {};
const TEORIA = {};
for (const f of fs.readdirSync(path.join(RAIZ, '_verificar_icofi_c3')).filter((x) => /^m\d.*\.mjs$/.test(x)).sort()) {
  const mod = await import(pathToFileURL(path.join(RAIZ, '_verificar_icofi_c3', f)).href);
  Object.assign(CALC, mod.CALC || {});
  Object.assign(TEORIA, mod.TEORIA || {});
}

// =====================================================================================
// Revisión
// =====================================================================================
function revisarPregunta(key, q, calc, secMd, secPauta, esCertamen, enPauta) {
  const tipo = q.tipo || 'pesos';
  if (tipo === 'opcion') {
    if (!(key in calc.v)) { falla(key + ': no tiene recálculo'); return; }
    chk(calc.v[key] === q.correcta, key + ': la opción correcta recalculada (' + calc.v[key] + ') ≠ guardada (' + q.correcta + ')');
    chk(q.correcta >= 0 && q.correcta < q.opciones.length && !!q.porque, key + ': pregunta de opción incompleta');
    return;
  }
  const rot = key + ' (' + M.formatear(q.respuesta, q) + ')';
  if (q.clasif) chk(calc.cl && calc.cl[key] === q.clasif.correcta, rot + ': la clasificación recalculada (' + (calc.cl || {})[key] + ') ≠ guardada (' + q.clasif.correcta + ')');
  if (q.signo) chk(q.respuesta < 0 || q.signo.pos, rot + ': signo mal definido');
  // 1. Recalculado == guardado
  if (!(key in calc.v)) { falla(key + ': no tiene recálculo'); return; }
  const esperado = redondeoTipo(calc.v[key], tipo);
  chk(igual(esperado, q.respuesta), rot + ': recalculado ' + esperado + ' ≠ guardado ' + q.respuesta);
  // 2. El corrector acepta el valor principal escrito en formato chileno
  const escrito = M.formatear(q.respuesta, q);
  chk(M.corregir(q, escrito).estado === 'correcta', rot + ': el corrector no acepta «' + escrito + '»');
  chk(M.corregir(q, String(q.respuesta).replace('.', ',')).estado === 'correcta', rot + ': el corrector no acepta el número sin formato');
  // 3. Tolerancia 0: un valor apenas distinto NO se acepta
  const paso = tipo === 'unitario' ? 0.01 : tipo === 'razon' ? 0.001 : tipo === 'porcentaje' ? 0.1 : 1;
  [q.respuesta + paso, q.respuesta - paso].forEach((v) => {
    if ((q.tambien || []).some((a) => igual(a.valor, v))) return; // salvo que sea el otro valor de la pauta
    chk(!M.esAcierto(M.corregir(q, String(M.redondear(v, 5)).replace('.', ',')).estado), rot + ': acepta ' + v + ', que no es la respuesta exacta');
  });
  // 3b. Otro valor que la misma pauta acepta ("$ X o $ Y")
  const altsCalc = ((calc.alt || {})[key] || []).map((v) => redondeoTipo(v, tipo));
  (q.tambien || []).forEach((a) => {
    chk(!!(a.pauta || a.equivalente), rot + ': la alternativa ' + a.valor + ' no está marcada como de la pauta (pauta / equivalente)');
    chk(altsCalc.some((v) => igual(v, a.valor)), rot + ': la alternativa ' + a.valor + ' no sale del camino alternativo (' + altsCalc.join(', ') + ')');
    const e = M.corregir(q, String(a.valor).replace('.', ',')).estado;
    chk(e === 'alternativa', rot + ': el corrector no acepta la alternativa de la pauta ' + a.valor + ' (' + e + ')');
    chk(!!a.nota, rot + ': la alternativa ' + a.valor + ' no tiene nota');
    if (a.pauta) { if (secPauta) chk(aparece(secPauta, comoTexto(a.valor, tipo, true)), rot + ': la alternativa ' + comoTexto(a.valor, tipo, true) + ' no aparece en la pauta'); }
    else if (secMd) chk(aparece(secMd, comoTexto(a.valor, tipo, true)), rot + ': la alternativa ' + comoTexto(a.valor, tipo, true) + ' no aparece en el .md');
  });
  altsCalc.forEach((v) => chk((q.tambien || []).some((a) => igual(a.valor, v)), rot + ': la alternativa recalculada ' + v + ' no está cargada'));
  // 3c. Valores cercanos conocidos: se reconocen y se rechazan con su explicación
  const casiCalc = ((calc.casi || {})[key] || []).map((v) => redondeoTipo(v, tipo));
  (q.casi || []).forEach((c) => {
    chk(casiCalc.some((v) => igual(v, c.valor)), rot + ': el valor cercano ' + c.valor + ' no sale del camino que describe (' + casiCalc.join(', ') + ')');
    const r = M.corregir(q, String(c.valor).replace('.', ','));
    chk(r.estado === 'casi' && r.casi === c, rot + ': el corrector no marca como "casi" el valor ' + c.valor + ' (' + r.estado + ')');
    chk(!!c.nota, rot + ': el valor cercano ' + c.valor + ' no tiene explicación');
    chk(!igual(c.valor, q.respuesta), rot + ': el valor cercano ' + c.valor + ' es igual a la respuesta');
    if (actual) actual.casis++;
  });
  casiCalc.forEach((v) => chk((q.casi || []).some((c) => igual(c.valor, v)), rot + ': el valor cercano recalculado ' + v + ' no está cargado'));
  // 4. Trampas
  const trCalc = ((calc.tr || {})[key] || []).map((v) => redondeoTipo(v, tipo));
  (q.trampas || []).forEach((t) => {
    chk(trCalc.some((v) => igual(v, t.valor)), rot + ': la trampa ' + t.valor + ' no sale del error que describe (' + trCalc.join(', ') + ')');
    const r = M.corregir(q, String(t.valor).replace('.', ','));
    chk(r.estado === 'trampa' && r.trampa === t, rot + ': el corrector no muestra el mensaje de la trampa ' + t.valor + ' (' + r.estado + ')');
    chk(!igual(t.valor, q.respuesta) && !(q.tambien || []).some((a) => igual(a.valor, t.valor)), rot + ': la trampa ' + t.valor + ' coincide con una respuesta aceptada');
    chk(!!t.msg, rot + ': trampa sin mensaje');
    if (secMd && !t.propia) chk(aparece(secMd, comoTexto(t.valor, tipo)), rot + ': la trampa ' + comoTexto(t.valor, tipo) + ' no aparece en el .md (si es una trampa derivada de la lección, márcala con propia: true)');
    if (actual) { if (t.propia) actual.propias++; }
  });
  trCalc.forEach((v) => chk((q.trampas || []).some((t) => igual(t.valor, v)), rot + ': la trampa recalculada ' + v + ' no está cargada en la página'));
  // 5. Aparece en el .md y en la pauta
  const idCorto = key.indexOf(':') < 0 ? key : null;
  if (q.respuesta !== 0) {
    if (secMd && !(calc.sinMd || []).includes(key)) chk(aparece(secMd, comoTexto(q.respuesta, tipo)), rot + ': «' + comoTexto(q.respuesta, tipo) + '» no aparece en la sección del .md');
    if (secPauta && esCertamen && enPauta && !(calc.sinPauta || []).includes(key)) chk(aparece(secPauta, comoTexto(q.respuesta, tipo)), rot + ': «' + comoTexto(q.respuesta, tipo) + '» no aparece en la pauta del certamen');
  }
}

function revisarEjercicio(b) {
  actual = { key: b.key, ok: 0, fallas: 0, n: 0, alts: 0, casis: 0, trampas: 0, propias: 0, md: '-', pauta: '-' };
  porEjercicio.push(actual);
  const reg = CALC[b.key];
  if (!reg) { falla('no tiene función de recálculo'); return; }
  chk(!!b.fuente, 'sin fuente');
  chk(!!b.datos, 'sin "datos" del enunciado');
  const calc = reg.f(b.datos);
  calc.sinMd = reg.sinMd; calc.sinPauta = reg.sinPauta;
  const secMd = seccionMd(reg.md);
  if (secMd === undefined) falla('no encuentro la sección «' + reg.md + '» en el .md');
  actual.md = secMd ? 'sí' : (MD ? 'NO' : 'sin material');
  const secTrans = reg.trans ? seccionTrans(reg.trans) : null;
  if (reg.trans && secTrans === undefined) falla('no encuentro «' + reg.trans + '» en la transcripción');
  if (reg.trans) actual.pauta = secTrans ? 'clase' : 'sin material';
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
      if (typeof v !== 'number' || v === 0 || k.charAt(0) === '_') return; // las claves que empiezan con "_" son datos implícitos (no se buscan en el texto)
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
          revisarPregunta(key, { tipo: c.tipo || 'pesos', respuesta: c.r, tambien: c.tambien, casi: c.casi, trampas: c.trampas, guion: c.guion }, calc, secMd, null, false, false);
          if (secTrans && c.r !== 0) chk(aparece(secTrans, comoTexto(c.r, c.tipo || 'pesos')), key + ': «' + comoTexto(c.r, c.tipo || 'pesos') + '» no aparece en la transcripción de la clase');
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
      if (q.tipo !== 'opcion') chk(!!q.sol && !!q.sol.d && !!q.sol.f && !!q.sol.c, q.id + ': falta el desarrollo (dato, fórmula, cálculo)');
      vistos[q.id] = q.tipo === 'opcion' ? q.correcta : q.respuesta;
      if (q.clasif) chk(q.clasif.correcta >= 0 && q.clasif.correcta < q.clasif.opciones.length && !!q.clasif.porque, q.id + ': clasificación mal definida');
      revisarPregunta(q.id, q, calc, secMd, secPauta, esCertamen, true);
      if (secTrans && q.tipo !== 'opcion' && q.respuesta !== 0) chk(aparece(secTrans, comoTexto(q.respuesta, q.tipo || 'pesos')), q.id + ': «' + comoTexto(q.respuesta, q.tipo || 'pesos') + '» no aparece en la transcripción de la clase');
    });
  });
  // Todo lo recalculado está cargado en la página (nada quedó fuera)
  Object.keys(calc.v).forEach((k) => chk(k in vistos, 'el valor recalculado «' + k + '» no está en la página'));
  // Sumas de control con los valores guardados (las tablas y totales cuadran)
  (calc.suma || []).forEach(([claves, total]) => {
    const s = claves.reduce((acc, k) => acc + vistos[k], 0);
    chk(igual(s, Math.round(total)), 'no cuadra: ' + claves.join(' + ') + ' = ' + s + ' ≠ ' + total);
  });
  (calc.partidas || []).forEach((x, i) => chk(x === true, 'las unidades físicas no cuadran (partida ' + (i + 1) + ')'));
}

function revisarTeoria(b) {
  actual = { key: b.key, ok: 0, fallas: 0, n: b.items.length, alts: 0, casis: 0, trampas: 0, propias: 0, md: '-', pauta: '-' };
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

// Pruebas del corrector: formato chileno y tolerancia 0
[
  [{ tipo: 'pesos', respuesta: 36000000 }, ['36.000.000', '36000000', '$ 36.000.000', '$36.000.000'], 'correcta'],
  [{ tipo: 'pesos', respuesta: 36000000 }, ['36.000.001', '35.999.999', '36.100.000'], 'casi'],
  [{ tipo: 'pesos', respuesta: 36000000 }, ['40.000.000'], 'incorrecta'],
  [{ tipo: 'unitario', respuesta: 36.5 }, ['36,5', '36.5', '$ 36,5', '36,50'], 'correcta'],
  [{ tipo: 'unitario', respuesta: 166.7, casi: [{ valor: 166.67, nota: 'x' }] }, ['166,7', '166.7', '166,70'], 'correcta'],
  [{ tipo: 'unitario', respuesta: 166.7, casi: [{ valor: 166.67, nota: 'x' }] }, ['166,67', '166,6667', '167', '166'], 'casi'],
  [{ tipo: 'porcentaje', respuesta: 70 }, ['70', '70%', '70 %', '0,7', '0,70'], 'correcta'],
  [{ tipo: 'porcentaje', respuesta: 70 }, ['69,8'], 'casi'],
  [{ tipo: 'razon', respuesta: 0.7 }, ['0,7', '0,70', '70%', '70 %'], 'correcta'],
  [{ tipo: 'pesos', respuesta: 20512, casi: [{ valor: 20513, nota: 'x' }] }, ['20.513'], 'casi'],
  [{ tipo: 'pesos', respuesta: 1046441, tambien: [{ valor: 1046440, pauta: true, nota: 'x' }] }, ['1.046.440'], 'alternativa'],
  [{ tipo: 'unidades', respuesta: 15 }, ['14', '16'], 'casi'],
  [{ tipo: 'unidades', respuesta: 15 }, ['20'], 'incorrecta'],
  [{ tipo: 'pesos', respuesta: 36000000, trampas: [{ valor: 42840000, msg: 'x' }] }, ['42.840.000'], 'trampa']
].forEach(([q, textos, esperado]) => textos.forEach((t) => chk(M.corregir(q, t).estado === esperado, 'corrector: «' + t + '» debería ser ' + esperado + ' y es ' + M.corregir(q, t).estado)));
chk(!M.esAcierto('casi') && M.esAcierto('correcta') && M.esAcierto('alternativa'), 'solo cuentan como acierto la respuesta exacta y la alternativa de la pauta');
chk(M.entero(6837.5) === 6838 && M.entero(4437.5) === 4438, 'redondeo: un ,5 debe subir');

// ---------------------------------------------------------------- informe
const col = (s, n) => String(s).padEnd(n).slice(0, Math.max(n, String(s).length));
console.log('\nVerificación de la guía ICOFI · Certamen 3');
console.log('Encargo (.md): ' + (MD ? 'encontrado' : 'NO disponible (falta material_icofi/)') + ' · Pautas (PDF): ' + (PAUTAS ? 'leídas' : 'NO disponibles') + '\n');
console.log(col('Bloque', 38) + col('Resp.', 7) + col('Pauta 2', 8) + col('Casi', 6) + col('Trampas', 9) + col('.md', 6) + col('Pauta', 7) + 'Resultado');
console.log(col('', 38) + col('', 7) + col('', 8) + col('', 6) + col('(propias)', 9));
console.log('-'.repeat(92));
porEjercicio.forEach((e) => console.log(col(e.key, 38) + col(e.n, 7) + col(e.alts, 8) + col(e.casis, 6) + col(e.trampas + (e.propias ? ' (' + e.propias + ')' : ''), 9) + col(e.md, 6) + col(e.pauta, 7) + (e.fallas ? 'FALLA (' + e.fallas + ')' : 'OK · ' + e.ok + ' comprobaciones')));
console.log('-'.repeat(92));
const tot = porEjercicio.reduce((a, e) => ({ n: a.n + e.n, alts: a.alts + e.alts, casis: a.casis + e.casis, tr: a.tr + e.trampas }), { n: 0, alts: 0, casis: 0, tr: 0 });
console.log(col('Total: ' + porEjercicio.length + ' bloques', 38) + col(tot.n, 7) + col(tot.alts, 8) + col(tot.casis, 6) + col(tot.tr, 9));
console.log('Regla: tolerancia 0. "Pauta 2" = segundo valor que la misma pauta acepta · "Casi" = valores cercanos que se rechazan con explicación.');
console.log('\nComprobaciones correctas: ' + res.ok + ' · Fallas: ' + res.fallas.length);
if (res.fallas.length) { console.log('\nFALLAS:'); res.fallas.forEach((f) => console.log('  ✗ ' + f)); process.exit(1); }
console.log('✓ Todo coincide.\n');
