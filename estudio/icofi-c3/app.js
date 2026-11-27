// Guía interactiva ICOFI · Certamen 3 — interfaz.
// Todo el contenido viene de datos/*.js (window.ICOFI_C3) y la corrección de motor.js (window.ICOFI_MOTOR).
// El progreso se guarda en localStorage; si falla, la página funciona igual sin guardar.
(function () {
  'use strict';

  const C = window.ICOFI_C3;
  const M = window.ICOFI_MOTOR;
  const DG = window.ICOFI_DIAGRAMAS || {};
  const app = document.getElementById('app');
  const indice = document.getElementById('indice');
  const tip = document.getElementById('tip');
  const CLAVE = 'icofi-c3-progreso-v1';
  const RONDA = 5; // máximo de V/F o alternativas por ronda en el flujo

  // =====================================================================
  // Contenido: módulos, bloques e ítems
  // =====================================================================
  const MODS = C.modulos.slice().sort((a, b) => a.n - b.n);
  const BLOQUES = new Map(); // "modulo/bloque" -> bloque
  const FLUJO = [];          // bloques del camino recomendado (sin los ejercicios extra)
  const ITEMS = new Map();   // id de ítem -> { id, k, b, ref, parte }

  function itemsDe(b) {
    if (b._items) return b._items;
    const out = [];
    if (b.tipo === 'leccion' && b.porque) out.push({ id: b.key + '#porque', k: 'pq', b: b, ref: b.porque });
    if (b.tipo === 'ejercicio') {
      b.partes.forEach((p) => {
        if (p.tabla) out.push({ id: b.key + '#' + p.tabla.id, k: 'tabla', b: b, ref: p.tabla, parte: p });
        (p.preguntas || []).forEach((q) => out.push({ id: b.key + '#' + q.id, k: 'preg', b: b, ref: q, parte: p }));
      });
    }
    if (b.tipo === 'vf') b.items.forEach((x) => out.push({ id: b.key + '#' + x.id, k: 'vf', b: b, ref: x }));
    if (b.tipo === 'mc') b.items.forEach((x) => out.push({ id: b.key + '#' + x.id, k: 'mc', b: b, ref: x }));
    b._items = out;
    return out;
  }

  MODS.forEach((mod) => {
    let principal = null;
    mod.bloques.forEach((b) => {
      b.mod = mod;
      b.key = mod.id + '/' + b.id;
      if (b.rol === 'extra' && principal) {
        b.de = principal;
        (principal.extras = principal.extras || []).push(b);
      } else {
        b.rol = 'principal';
        FLUJO.push(b);
        if (b.tipo === 'ejercicio') principal = b;
      }
      BLOQUES.set(b.key, b);
      itemsDe(b).forEach((it) => ITEMS.set(it.id, it));
    });
  });

  // =====================================================================
  // Progreso (localStorage)
  // =====================================================================
  const VACIO = () => ({ v: 1, vistos: {}, hechos: {}, it: {}, err: {}, r: {}, ult: null, dias: [], ses: { dia: '', n: 0 }, pts: 0, ptd: {}, ptsListo: 0 });
  let S = VACIO();
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE));
    if (g && g.v === 1) S = Object.assign(VACIO(), g);
  } catch (e) { /* sin almacenamiento: se sigue sin guardar */ }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) { /* nada */ }
  }
  function hoy() {
    const d = new Date();
    const p = (n) => (n < 10 ? '0' : '') + n;
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  // ¿Es la primera visita de hoy habiendo estado otro día? (para ofrecer el repaso primero)
  const DIA_ANTERIOR = S.dias.length > 0 && S.dias[S.dias.length - 1] !== hoy();
  if (S.dias[S.dias.length - 1] !== hoy()) { S.dias.push(hoy()); if (S.dias.length > 60) S.dias.shift(); }
  if (S.ses.dia !== hoy()) S.ses = { dia: hoy(), n: 0 };

  function estadoItem(id) {
    const x = S.it[id];
    if (!x) return 'n';
    if (x.u === 1) return 'ok';
    if (x.n > 0) return 'mal';
    return x.s ? 'sol' : 'n';
  }
  // Ítems que cuentan para el avance del bloque (en V/F y alternativas, solo la primera ronda)
  function itemsFlujo(b) {
    const its = itemsDe(b);
    return (b.tipo === 'vf' || b.tipo === 'mc') ? its.slice(0, RONDA) : its;
  }
  function hecho(b) {
    if (b.tipo === 'ejercicio' || b.tipo === 'vf' || b.tipo === 'mc') return itemsFlujo(b).every((it) => estadoItem(it.id) !== 'n');
    return !!S.vistos[b.key];
  }
  // 'n' sin ver/intentar · 'visto' · 'ok' todo correcto · 'err' con errores · 'parcial' a medias
  function estadoBloque(b) {
    if (b.tipo !== 'ejercicio' && b.tipo !== 'vf' && b.tipo !== 'mc') return S.vistos[b.key] ? 'visto' : 'n';
    const es = itemsFlujo(b).map((it) => estadoItem(it.id));
    if (es.every((e) => e === 'n')) return 'n';
    if (es.every((e) => e === 'ok')) return 'ok';
    if (es.some((e) => e === 'mal' || e === 'sol')) return 'err';
    return 'parcial';
  }
  function completo(b) {
    const e = estadoBloque(b);
    return e === 'visto' || e === 'ok';
  }
  function marcarAvance(b) {
    if (hecho(b) && !S.hechos[b.key]) { S.hechos[b.key] = 1; S.ses.n++; }
  }

  // ---------------------------------------------------------------------
  // Rango: se sube acertando y se baja fallando.
  //  · Acierto al primer intento (sin haber visto la respuesta): +10 (V/F, alternativa), +15 (pregunta), +25 (tabla).
  //  · Respuesta incorrecta, o ver la solución sin intentar: −5.
  //  · Cada pregunta suma una vez al día y resta una vez al día: repetirla no infla el puntaje.
  // ---------------------------------------------------------------------
  const RANGOS = ['Bronce', 'Plata', 'Oro', 'Platino', 'Diamante', 'Élite', 'Unreal'];
  const RANGO_COLOR = ['#d08a4e', '#cfd6dd', '#f0c84a', '#8fe3dc', '#7cc4ff', '#c79bff', '#ff7a8a'];
  const RANGO_OSCURO = ['#7a4a22', '#7d8791', '#a8801c', '#3f9b95', '#2f73b8', '#7448c4', '#b3283c'];
  // Insignia de cada rango (dibujo propio): un escudo del color del rango con una marca que crece con el nivel.
  function hInsignia(i, px) {
    const estrella = (R, r) => { let d = ''; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r : R; d += (k ? 'L' : 'M') + (16 + q * Math.cos(a)).toFixed(2) + ' ' + (16.4 + q * Math.sin(a)).toFixed(2); } return d + 'Z'; };
    const galon = (y) => '<path d="M10 ' + y + 'L16 ' + (y - 4.5) + 'L22 ' + y + 'V' + (y + 2.7) + 'L16 ' + (y - 1.8) + 'L10 ' + (y + 2.7) + 'Z"/>';
    let marca;
    if (i === 0) marca = galon(17.5);
    else if (i === 1) marca = galon(15) + galon(20);
    else if (i === 2) marca = galon(12.8) + galon(17.2) + galon(21.6);
    else if (i === 3) marca = '<path d="M16 8.5L23.5 16L16 23.5L8.5 16Z"/>';
    else if (i === 4) marca = '<path d="M10.5 9.5H21.5L25 14L16 24.5L7 14Z"/><path d="M7 14H25M12.5 14L16 24.5L19.5 14L16 9.5Z" fill="none" stroke="' + RANGO_OSCURO[i] + '" stroke-width="0.9"/>';
    else if (i === 5) marca = '<path d="' + estrella(8.2, 3.5) + '"/>';
    else {
      let rayos = '';
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 8; rayos += 'M' + (16 + 8.6 * Math.cos(a)).toFixed(2) + ' ' + (16.4 + 8.6 * Math.sin(a)).toFixed(2) + 'L' + (16 + 10.8 * Math.cos(a)).toFixed(2) + ' ' + (16.4 + 10.8 * Math.sin(a)).toFixed(2); }
      marca = '<path d="' + estrella(7, 3) + '"/><path d="' + rayos + '" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>';
    }
    return '<svg class="insignia" viewBox="0 0 32 32" width="' + px + '" height="' + px + '" aria-hidden="true"><defs><linearGradient id="ins' + i + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + RANGO_COLOR[i] + '"/><stop offset="1" stop-color="' + RANGO_OSCURO[i] + '"/></linearGradient></defs>' +
      '<path d="M16 1.8L28.5 8.3V21.2L16 30.4L3.5 21.2V8.3Z" fill="url(#ins' + i + ')" stroke="rgba(255,255,255,0.6)" stroke-width="1.1"/>' +
      '<path d="M16 5.2L25.4 10.2V19.8L16 26.7L6.6 19.8V10.2Z" fill="rgba(0,0,0,0.3)"/><g fill="#fff" fill-opacity="0.95">' + marca + '</g></svg>';
  }
  const hNombreRango = (i) => '<b class="rango-n" style="color:' + RANGO_COLOR[i] + '">' + RANGOS[i] + '</b>';

  // Rango secreto: 10 toques seguidos en la insignia (o en el rango de la barra) lo activan; otros 10 lo quitan.
  const GLOBAL = { nombre: 'Global de Icofi', color: '#ff4d4d', oscuro: '#8f1020', toques: 10 };
  const esGlobal = () => !!S.global;
  // Escudo rojo con un mundo que gira (los meridianos se abren y se cierran)
  function hInsigniaGlobal(px) {
    const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gira = (desde) => (quieto ? '' : '<animate attributeName="rx" values="' + desde + '" dur="2.6s" repeatCount="indefinite"/>');
    return '<svg class="insignia global" viewBox="0 0 32 32" width="' + px + '" height="' + px + '" aria-hidden="true"><defs><linearGradient id="insG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + GLOBAL.color + '"/><stop offset="1" stop-color="' + GLOBAL.oscuro + '"/></linearGradient></defs>' +
      '<path d="M16 1.8L28.5 8.3V21.2L16 30.4L3.5 21.2V8.3Z" fill="url(#insG)" stroke="rgba(255,255,255,0.7)" stroke-width="1.1"/>' +
      '<path d="M16 5.2L25.4 10.2V19.8L16 26.7L6.6 19.8V10.2Z" fill="rgba(0,0,0,0.3)"/>' +
      '<g fill="none" stroke="#fff" stroke-width="1.15" stroke-linecap="round">' +
      '<circle cx="16" cy="16" r="7.4"/><path d="M8.6 16H23.4M10 12.2H22M10 19.8H22"/>' +
      '<ellipse cx="16" cy="16" rx="3.4" ry="7.4">' + gira('7.4;0.3;7.4') + '</ellipse>' +
      '<ellipse cx="16" cy="16" rx="0.3" ry="7.4">' + gira('0.3;7.4;0.3') + '</ellipse></g></svg>';
  }
  const hInsigniaActual = (px) => (esGlobal() ? hInsigniaGlobal(px) : hInsignia(rangoDe(S.pts), px));
  const hNombreActual = () => (esGlobal() ? '<b class="rango-n" style="color:' + GLOBAL.color + '">' + GLOBAL.nombre + '</b>' : hNombreRango(rangoDe(S.pts)));
  let toques = 0, tToques = 0;
  function tocarInsignia() {
    clearTimeout(tToques);
    tToques = setTimeout(() => { toques = 0; }, 2500);
    if (++toques < GLOBAL.toques) return;
    toques = 0;
    S.global = S.global ? 0 : 1;
    guardar();
    const el = document.getElementById('aviso-pts');
    if (el) {
      el.innerHTML = S.global
        ? '<span class="con-ins">' + hInsigniaGlobal(30) + '<span>Rango secreto desbloqueado: <b style="color:' + GLOBAL.color + '">' + GLOBAL.nombre + '</b></span></span><b>Tienes puntos infinitos</b>'
        : '<span>Volviste a tu rango normal.</span>';
      el.className = 'aviso-pts cambio' + (S.global ? ' es-global' : '');
      el.hidden = false;
      clearTimeout(tOcultar);
      tOcultar = setTimeout(() => { el.hidden = true; }, 4200);
    }
    if (VISTA.bloque && VISTA.bloque.tipo === 'portada') pintar(); else { pintarProgreso(); pintarIndice(); }
  }
  const CORTES = [0, 0.03, 0.09, 0.17, 0.27, 0.39, 0.55]; // fracción del puntaje del camino principal: el rango más alto se alcanza con poco más de la mitad
  const PENAL = 5;
  const valorItem = (it) => (it.k === 'tabla' ? 25 : it.k === 'preg' ? 15 : 10);
  let PTS_MAX = 0;
  FLUJO.forEach((b) => itemsDe(b).forEach((it) => { PTS_MAX += valorItem(it); }));
  const UMBRAL = CORTES.map((c) => Math.round(c * PTS_MAX / 10) * 10);
  function rangoDe(pts) {
    let i = 0;
    UMBRAL.forEach((u, k) => { if (pts >= u) i = k; });
    return i;
  }
  // Quien ya tenía avance antes de que existiera el rango parte con los puntos de lo que tiene correcto
  if (!S.ptsListo) {
    S.pts = 0;
    Object.keys(S.it).forEach((id) => { const it = ITEMS.get(id); if (it && S.it[id].u === 1) S.pts += valorItem(it); });
    S.ptd = {};
    S.ptsListo = 1;
  }
  let ptsPend = 0, rangoAntes = null, tAviso = 0, tOcultar = 0;
  function puntuar(id, gana) {
    const it = ITEMS.get(id);
    if (!it) return;
    const clave = id + (gana ? '+' : '-');
    if (S.ptd[clave] === hoy()) return;
    S.ptd[clave] = hoy();
    if (rangoAntes === null) rangoAntes = rangoDe(S.pts);
    const d = gana ? valorItem(it) : -Math.min(PENAL, S.pts); // nunca baja de cero
    S.pts += d;
    ptsPend += d;
    clearTimeout(tAviso);
    tAviso = setTimeout(avisarPuntos, 40); // junta varios cambios seguidos (por ejemplo, al entregar el simulacro)
  }
  function avisarPuntos() {
    const el = document.getElementById('aviso-pts');
    const ahora = rangoDe(S.pts);
    const cambio = !esGlobal() && rangoAntes !== null && ahora !== rangoAntes;
    let h = '<b>' + (ptsPend > 0 ? '+' : ptsPend < 0 ? '−' : '') + Math.abs(ptsPend) + ' puntos</b>';
    if (cambio && ahora > rangoAntes) h += '<span class="con-ins">' + hInsignia(ahora, 26) + '<span>Subiste de rango: <b style="color:' + RANGO_COLOR[ahora] + '">' + RANGOS[ahora] + '</b></span></span>';
    else if (cambio) h += '<span>Bajaste a <b style="color:' + RANGO_COLOR[ahora] + '">' + RANGOS[ahora] + '</b>. Con las próximas correctas lo recuperas.</span>';
    if (el && (ptsPend !== 0 || cambio)) {
      el.innerHTML = h;
      el.className = 'aviso-pts ' + (ptsPend >= 0 ? 'sube' : 'baja') + (cambio ? ' cambio' : '');
      el.hidden = false;
      clearTimeout(tOcultar);
      tOcultar = setTimeout(() => { el.hidden = true; }, cambio ? 3800 : 2000);
    }
    ptsPend = 0;
    rangoAntes = null;
    pintarProgreso();
    pintarIndice();
  }
  function hRango() {
    if (esGlobal()) return { i: -1, nombre: GLOBAL.nombre, pct: 100, falta: 0, sig: null, global: true };
    const i = rangoDe(S.pts);
    const sig = i + 1 < RANGOS.length ? UMBRAL[i + 1] : null;
    const pct = sig === null ? 100 : Math.round(100 * (S.pts - UMBRAL[i]) / (sig - UMBRAL[i]));
    return { i: i, nombre: RANGOS[i], pct: pct, falta: sig === null ? 0 : sig - S.pts, sig: sig === null ? null : RANGOS[i + 1] };
  }

  // Registra un intento. o.limpio: respondió sin haber visto la respuesta.
  function registrar(id, ok, o) {
    o = o || {};
    const x = S.it[id] || (S.it[id] = { n: 0, u: null, p: null, s: 0, h: [] });
    if (x.p === null) x.p = ok && !x.s ? 1 : 0;
    x.n++;
    x.u = ok ? 1 : 0;
    x.h.push([hoy(), ok ? 1 : 0]);
    if (x.h.length > 10) x.h.shift();
    let salio = false;
    if (!ok) {
      // Falló: entra (o vuelve a empezar) en la lista de repaso
      S.err[id] = { desde: S.err[id] ? S.err[id].desde : hoy(), d: [] };
    } else if (S.err[id] && o.limpio) {
      const e = S.err[id];
      if (e.d.indexOf(hoy()) < 0) e.d.push(hoy());
      if (e.d.length >= 2) { delete S.err[id]; salio = true; } // dos aciertos en días distintos
    }
    if (o.limpio) puntuar(id, ok);
    const it = ITEMS.get(id);
    if (it) marcarAvance(it.b);
    guardar();
    return { salio: salio };
  }
  function marcarSolucionVista(id) {
    const x = S.it[id] || (S.it[id] = { n: 0, u: null, p: null, s: 0, h: [] });
    if (!x.n && !x.s) puntuar(id, false); // ver la solución sin intentar resta igual que fallar
    x.s = 1;
    if (x.u !== 1 && !S.err[id]) S.err[id] = { desde: hoy(), d: [] };
    const it = ITEMS.get(id);
    if (it) marcarAvance(it.b);
    guardar();
  }
  const nErrores = () => Object.keys(S.err).filter((id) => ITEMS.has(id)).length;

  // =====================================================================
  // Texto
  // =====================================================================
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // **negrita** y {{numerador // denominador}}
  function tx(s) {
    return String(s == null ? '' : s)
      .replace(/\{\{(.+?)\s*\/\/\s*(.+?)\}\}/g, '<span class="frac"><span>$1</span><span>$2</span></span>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }
  // Primera letra en minúscula (tras "Casi: ") o en mayúscula (inicio de frase); no toca siglas como "IVA"
  const minus = (s) => (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ ]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const sinHtml = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\*\*/g, '');
  const corto = (s, n) => { s = sinHtml(s); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; };

  function fuenteTxt(f) {
    if (!f) return '';
    if (f.k === 'certamen') return 'Certamen 3 · ' + (f.sem === 1 ? '1er' : '2º') + ' semestre ' + f.anio + ' · Pregunta ' + f.preg;
    if (f.k === 'taller') return 'Taller de clases' + (f.ej ? ' · Ejercicio ' + f.ej : '');
    if (f.k === 'clase') return 'Ejemplo de clase';
    if (f.k === 'comprension') return 'Pregunta de comprensión';
    return 'Ejemplo';
  }
  function hFuente(f, mini) {
    if (!f) return '';
    return '<div class="fuente' + (mini ? ' mini' : '') + '">' + fuenteTxt(f) +
      (f.tb ? ' <small>· también ' + f.tb + '</small>' : '') + (f.nota ? ' <small>· ' + f.nota + '</small>' : '') + '</div>';
  }
  const href = (b) => '#/' + b.mod.id + '/' + b.id;
  const TIPO_TXT = { leccion: 'Lección', ejercicio: 'Ejercicio', vf: 'Verdadero o falso', mc: 'Selección múltiple', resumen: 'Resumen', portada: 'Inicio', simulacro: 'Simulacro', formulas: 'Fórmulas' };

  // ---- Abreviaturas con tooltip ----
  const AB = C.abreviaturas || {};
  const LETRA = 'A-Za-zÁÉÍÓÚáéíóúñÑ0-9₁ᵤ$';
  const AB_RE = new RegExp('(^|[^' + LETRA + '])(' + Object.keys(AB).sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![' + LETRA + '])', 'g');

  function abreviar(raiz, omitir) {
    if (!omitir && VISTA && VISTA.bloque) omitir = VISTA.bloque.sinAb;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && n.parentElement.closest('abbr, input, textarea, svg, button, a, .sin-ab, script, style')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    const nodos = [];
    while (w.nextNode()) nodos.push(w.currentNode);
    nodos.forEach((n) => {
      // "$ 36.000.000" y "70 %" no se cortan entre líneas
      if (/\$ \d|\d %/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/\$ (?=\d)/g, '$\u00a0').replace(/(\d) %/g, '$1\u00a0%');
      const s = n.nodeValue;
      AB_RE.lastIndex = 0;
      if (!AB_RE.test(s)) return;
      AB_RE.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let pos = 0, m;
      while ((m = AB_RE.exec(s))) {
        if (omitir && omitir.indexOf(m[2]) >= 0) continue;
        const ini = m.index + m[1].length;
        frag.appendChild(document.createTextNode(s.slice(pos, ini)));
        const a = document.createElement('abbr');
        a.className = 'ab';
        a.tabIndex = 0;
        a.dataset.ab = m[2];
        a.textContent = m[2];
        frag.appendChild(a);
        pos = ini + m[2].length;
        AB_RE.lastIndex = pos;
      }
      if (pos === 0) return;
      frag.appendChild(document.createTextNode(s.slice(pos)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  function mostrarTip(el) {
    const k = el.dataset.ab;
    tip.innerHTML = '<b>' + esc(k) + '</b>: ' + esc(AB[k] || '');
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    let x = r.left + r.width / 2 - t.width / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - t.width - 8));
    let y = r.top - t.height - 8;
    if (y < 8) y = r.bottom + 8;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  const ocultarTip = () => { tip.hidden = true; };
  document.addEventListener('pointerover', (e) => { const a = e.target.closest && e.target.closest('abbr.ab'); if (a) mostrarTip(a); });
  document.addEventListener('pointerout', (e) => { if (e.target.closest && e.target.closest('abbr.ab')) ocultarTip(); });
  document.addEventListener('focusin', (e) => { const a = e.target.closest && e.target.closest('abbr.ab'); if (a) mostrarTip(a); });
  document.addEventListener('focusout', (e) => { if (e.target.closest && e.target.closest('abbr.ab')) ocultarTip(); });
  window.addEventListener('scroll', ocultarTip, { passive: true });

  // =====================================================================
  // Unidades interactivas de la vista actual
  // =====================================================================
  // uid -> { uid, item, k, modo: 'flujo' | 'repaso', revelado, conf, d (borrador si no se guarda) }
  let U = new Map();
  let SES = null; // sesión de repaso en curso

  function unidad(item, o) {
    const uid = (o.ns || '') + item.id;
    const u = { uid: uid, item: item, k: item.k, modo: o.modo || 'flujo', revelado: false, d: null, nuevo: true };
    U.set(uid, u);
    return u;
  }
  // Borrador de la unidad: en el flujo se guarda; en el repaso vive solo en memoria.
  function borr(u) {
    if (u.modo === 'flujo') return S.r[u.item.id] || (S.r[u.item.id] = {});
    return u.d || (u.d = {});
  }
  const cajaDe = (u) => app.querySelector('[data-u="' + u.uid + '"]');

  const ANIMO = [
    'Equivocarse intentando es la forma más rápida de aprenderlo.',
    'Este error es de los más comunes en el certamen; ahora ya lo conoces.',
    'Mejor que pase aquí y no en el certamen: quedó anotado para repasarlo.'
  ];
  let animoI = 0;
  const animo = () => ANIMO[(animoI++) % ANIMO.length];

  // ---------- Pregunta numérica ----------
  function adornos(q) {
    const tipo = q.tipo || 'pesos';
    return {
      pre: (tipo === 'pesos' || tipo === 'unitario') ? (q.moneda || '$') : '',
      suf: tipo === 'unidades' ? (q.unidad || 'u') : tipo === 'porcentaje' ? '%' : (tipo === 'razon' ? '' : (q.unidad || ''))
    };
  }
  function hPreg(item, o) {
    const q = item.ref;
    const u = unidad(item, o);
    const ad = adornos(q);
    let h = '<div class="preg" data-u="' + u.uid + '">' +
      '<label class="preg-t" for="in-' + u.uid + '">' + (o.num ? '<span class="preg-n">' + o.num + '</span>' : '') + '<span>' + tx(q.texto) + '</span></label>';
    if (q.tipo === 'opcion') {
      // Pregunta que se responde eligiendo una opción (sin número)
      h += '<div class="chips">' + q.opciones.map((op, i) => '<button type="button" class="chip" data-a="clasif" data-v="' + i + '" aria-pressed="false">' + tx(op) + '</button>').join('') + '</div>';
    } else {
      h += '<div class="campo">' + (ad.pre ? '<span class="ad">' + ad.pre + '</span>' : '') +
        '<input id="in-' + u.uid + '" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Tu respuesta" data-t="' + (q.tipo || 'pesos') + '">' +
        (ad.suf ? '<span class="ad">' + esc(ad.suf) + '</span>' : '') + '<span class="marca" aria-hidden="true"></span></div>';
    }
    if (q.signo) {
      // Resultado que puede ser negativo: se elige el signo (el teclado numérico del celular no trae "−")
      h += '<div class="clasif"><span>¿Qué es?</span><div class="chips">' +
        '<button type="button" class="chip" data-a="signo" data-v="0" aria-pressed="false">' + tx(q.signo.pos) + '</button>' +
        '<button type="button" class="chip" data-a="signo" data-v="1" aria-pressed="false">' + tx(q.signo.neg) + '</button></div></div>';
    }
    if (q.clasif) {
      h += '<div class="clasif"><span>' + tx(q.clasif.texto) + '</span><div class="chips">' +
        q.clasif.opciones.map((op, i) => '<button type="button" class="chip" data-a="clasif" data-v="' + i + '" aria-pressed="false">' + tx(op) + '</button>').join('') + '</div></div>';
    }
    h += '<div class="preg-a"><button type="button" class="btn principal" data-a="revisar">Revisar</button>' +
      (q.pista ? '<button type="button" class="btn-l" data-a="pista">Ver pista</button>' : '') +
      '<button type="button" class="btn-l" data-a="sol">Ver solución</button></div>' +
      '<div class="fb" role="status" aria-live="polite"></div></div>';
    return h;
  }
  function hSol(q) {
    const s = q.sol;
    if (!s) return '';
    return '<ol class="sol"><li><b>Dato:</b> ' + tx(s.d) + '</li><li><b>Fórmula:</b> ' + tx(s.f) + '</li><li><b>Cálculo:</b> ' + tx(s.c) + '</li><li><b>Resultado:</b> ' + M.formatear(q.respuesta, q) + '</li></ol>';
  }
  // Tolerancia 0: solo vale la respuesta exacta. Una "alternativa" es el otro valor que la misma pauta acepta.
  function notaRedondeo(q, res) {
    return '<p class="nota-red">Tu respuesta también es válida. Valor principal: <b>' + M.formatear(q.respuesta, q) + '</b>. ' + tx(res.alt.nota) + '</p>';
  }
  // Texto para una respuesta que quedó cerca: no se acepta, y se explica por qué
  const CASI_GENERAL = 'Tu valor está cerca, pero la respuesta tiene que ser exacta, como en la pauta. Revisa el redondeo: no redondees los pasos intermedios.';
  const textoCasi = (res) => (res.casi && res.casi.nota ? res.casi.nota : CASI_GENERAL);
  // Pinta el resultado de una pregunta ya corregida. okC: null si no hay clasificación.
  function pintarOpcion(u, sel) {
    const q = u.item.ref;
    const caja = cajaDe(u);
    const fb = caja.querySelector('.fb');
    const ok = sel === q.correcta;
    caja.querySelectorAll('[data-a="clasif"]').forEach((b, i) => {
      b.setAttribute('aria-pressed', String(i === sel));
      b.classList.toggle('ok', i === sel && ok);
      b.classList.toggle('mal', i === sel && !ok);
    });
    fb.className = 'fb ' + (ok ? 'ok' : 'mal');
    fb.innerHTML = '<p class="fb-h"><span class="ic">' + (ok ? '✓' : '✗') + '</span><span>' + (ok ? 'Correcto: ' : 'Todavía no. La respuesta correcta es: ') + '<b>' + tx(q.opciones[q.correcta]) + '</b></span></p>' +
      '<p>' + (ok ? '<b>Por qué:</b> ' : '') + tx(q.porque) + '</p>' + (q.sol ? hSolOpcion(q) : '') +
      (ok ? '' : '<p class="animo">' + animo() + ' Puedes cambiar tu respuesta y revisar de nuevo.</p>');
    abreviar(fb);
    u.revelado = true;
  }
  function hSolOpcion(q) {
    const s = q.sol;
    return '<ol class="sol"><li><b>Dato:</b> ' + tx(s.d) + '</li><li><b>Fórmula:</b> ' + tx(s.f) + '</li><li><b>Cálculo:</b> ' + tx(s.c) + '</li></ol>';
  }
  // Texto del campo con el signo elegido aplicado
  function textoConSigno(q, valor, d) {
    if (!q.signo || d.s !== 1 || /^\s*[-−–(]/.test(valor) || !valor.trim()) return valor;
    return '-' + valor.trim();
  }
  function pintarPreg(u, res, okC, selC) {
    const q = u.item.ref;
    const caja = cajaDe(u);
    const campo = caja.querySelector('.campo');
    const fb = caja.querySelector('.fb');
    const okNum = M.esAcierto(res.estado);
    const ok = okNum && okC !== false;
    campo.classList.toggle('ok', okNum);
    campo.classList.toggle('mal', !okNum);
    if (q.clasif) {
      caja.querySelectorAll('[data-a="clasif"]').forEach((b, i) => {
        b.classList.toggle('ok', i === q.clasif.correcta && selC === i);
        b.classList.toggle('mal', selC === i && i !== q.clasif.correcta);
      });
    }
    const correcta = '<b>' + M.formatear(q.respuesta, q) + '</b>';
    let h;
    if (ok) {
      h = '<p class="fb-h"><span class="ic">✓</span><span>Correcto: ' + correcta + (q.clasif ? ' · ' + tx(q.clasif.opciones[q.clasif.correcta]) : '') + '</span></p>';
      if (res.estado !== 'correcta') h += notaRedondeo(q, res);
      if (q.sol) h += '<p><b>Por qué:</b> ' + tx(q.sol.c) + '</p>';
      fb.className = 'fb ok';
    } else if (okNum) {
      // El número está bien y falta la clasificación
      h = '<p class="fb-h"><span class="ic">✗</span><span>El monto está bien (' + correcta + '). Lo que falta corregir es la opción que elegiste.</span></p>' +
        '<p>' + tx(q.clasif.porque) + '</p>';
      if (res.estado !== 'correcta') h += notaRedondeo(q, res);
      fb.className = 'fb mal';
    } else {
      const soloSigno = q.signo && res.estado === 'incorrecta' && Math.abs(Math.abs(res.valor) - Math.abs(q.respuesta)) <= M.tolerancia(q);
      h = '<p class="fb-h"><span class="ic">✗</span><span>' + (res.estado === 'trampa' ? 'Casi: ' + tx(minus(res.trampa.msg)) : res.estado === 'casi' ? 'Casi, pero está mal.' : (soloSigno ? 'Casi: el monto está bien, pero es ' + tx((q.respuesta < 0 ? q.signo.neg : q.signo.pos).toLowerCase()) + '.' : 'Todavía no.')) + '</span></p>' +
        (res.estado === 'casi' ? '<p class="nota-red">' + tx(textoCasi(res)) + '</p>' : '') +
        '<p>La respuesta correcta es ' + correcta + (q.clasif ? ' · ' + tx(q.clasif.opciones[q.clasif.correcta]) : '') + '.</p>' + hSol(q) +
        (q.clasif && okC === false ? '<p>' + tx(q.clasif.porque) + '</p>' : '') +
        '<p class="animo">' + animo() + ' Puedes corregir tu respuesta y revisar de nuevo.</p>';
      fb.className = 'fb mal';
    }
    fb.innerHTML = h;
    abreviar(fb);
    u.revelado = true;
  }
  function revisarPreg(u) {
    const q = u.item.ref;
    const caja = cajaDe(u);
    const inp = caja.querySelector('input');
    const fb = caja.querySelector('.fb');
    const d = borr(u);
    if (q.tipo === 'opcion') {
      if (typeof d.c !== 'number') { fb.className = 'fb aviso'; fb.innerHTML = '<p>Elige una opción antes de revisar.</p>'; return; }
      const limpioO = !u.revelado;
      const okO = d.c === q.correcta;
      d.e = 1;
      const rO = registrar(u.item.id, okO, { limpio: limpioO });
      pintarOpcion(u, d.c);
      despuesDeResponder(u, okO, rO, limpioO);
      return;
    }
    if (q.signo && typeof d.s !== 'number' && !/^\s*[-−–(]/.test(inp.value) && inp.value.trim()) {
      fb.className = 'fb aviso';
      fb.innerHTML = '<p>Te falta indicar si es ' + tx(q.signo.pos.toLowerCase()) + ' o ' + tx(q.signo.neg.toLowerCase()) + '.</p>';
      return;
    }
    const res = M.corregir(q, textoConSigno(q, inp.value, d));
    if (res.estado === 'vacia' || res.estado === 'invalida') {
      fb.className = 'fb aviso';
      fb.innerHTML = res.estado === 'vacia'
        ? '<p>Escribe tu respuesta antes de revisar.</p>'
        : '<p>No pude leer ese número. Ejemplos válidos: <b>36.000.000</b> · <b>36,5</b> · <b>70 %</b>.</p>';
      inp.focus();
      return;
    }
    let okC = null;
    if (q.clasif) {
      if (typeof d.c !== 'number') {
        fb.className = 'fb aviso';
        fb.innerHTML = '<p>Te falta elegir una opción en «' + sinHtml(q.clasif.texto) + '».</p>';
        return;
      }
      okC = d.c === q.clasif.correcta;
    }
    const ok = M.esAcierto(res.estado) && okC !== false;
    const limpio = !u.revelado;
    d.t = inp.value;
    d.e = 1;
    const r = registrar(u.item.id, ok, { limpio: limpio });
    pintarPreg(u, res, okC, d.c);
    despuesDeResponder(u, ok, r, limpio);
  }
  function verPista(u) {
    const fb = cajaDe(u).querySelector('.fb');
    fb.className = 'fb aviso';
    fb.innerHTML = '<p><b>Pista:</b> ' + tx(u.item.ref.pista) + '</p>';
    abreviar(fb);
  }
  function verSolucion(u, confirmado) {
    const caja = cajaDe(u);
    const fb = caja.querySelector('.fb');
    const intentado = u.revelado || (S.it[u.item.id] && S.it[u.item.id].n > 0);
    if (!intentado && !confirmado) {
      fb.className = 'fb aviso';
      fb.innerHTML = '<p><b>¿Seguro que quieres verla sin intentar?</b> Equivocarse intentando enseña más que leer la respuesta.</p>' +
        '<div class="preg-a"><button type="button" class="btn chico" data-a="sol-no">Voy a intentarlo</button><button type="button" class="btn-l" data-a="sol-si">Sí, ver la solución</button></div>';
      return;
    }
    marcarSolucionVista(u.item.id);
    u.revelado = true;
    if (u.k === 'tabla') {
      fb.className = 'fb';
      fb.innerHTML = '<p><b>Solución de la tabla</b></p><ul class="sol-celdas">' + lineasTabla(u.item.ref, null).join('') + '</ul>';
    } else {
      const q = u.item.ref;
      fb.className = 'fb';
      if (q.tipo === 'opcion') fb.innerHTML = '<p><b>Solución:</b> ' + tx(q.opciones[q.correcta]) + '</p><p>' + tx(q.porque) + '</p>' + (q.sol ? hSolOpcion(q) : '');
      else fb.innerHTML = '<p><b>Solución:</b> ' + M.formatear(q.respuesta, q) + (q.clasif ? ' · ' + tx(q.clasif.opciones[q.clasif.correcta]) : '') + '</p>' + hSol(q) +
        (q.tambien && q.tambien.length ? '<p class="suave">La pauta también acepta: ' + q.tambien.map((a) => M.formatear(a.valor, q)).join(' · ') + '.</p>' : '');
    }
    abreviar(fb);
    despuesDeResponder(u, false, {}, false, true);
  }

  // ---------- Tabla editable ----------
  const celdaQ = (c) => ({ tipo: c.tipo || 'pesos', respuesta: c.r, tambien: c.tambien, casi: c.casi, trampas: c.trampas, guion: c.guion, unidad: c.unidad });
  function fijo(v, tipo) {
    if (tipo === 'pesos' || tipo === 'unitario') return '$ ' + M.soloNumero(v, { tipo: tipo });
    return M.soloNumero(v, { tipo: tipo || 'unidades' });
  }
  function editables(t) {
    const out = [];
    t.filas.forEach((f) => f.celdas.forEach((c, ci) => { if (c.r !== undefined) out.push(f.id + '|' + ci); }));
    return out;
  }
  function hTabla(item, o) {
    const t = item.ref;
    const u = unidad(item, o);
    let h = '<div class="tabla-ed" data-u="' + u.uid + '">' +
      t.filas.filter((f) => f.modelo).map((f) => '<p class="nota-modelo">' + tx(f.modelo) + '</p>').join('') +
      '<div class="tabla-scroll"><table><thead><tr>' +
      t.cols.map((c, i) => '<th scope="col"' + (i ? ' class="num"' : '') + '>' + tx(c) + '</th>').join('') + '<th><span class="sr">Revisar</span></th></tr></thead><tbody>';
    t.filas.forEach((f) => {
      const tieneR = f.celdas.some((c) => c.r !== undefined);
      h += '<tr' + (f.total ? ' class="total"' : '') + '>';
      f.celdas.forEach((c, ci) => {
        if (c.t !== undefined) h += ci === 0 ? '<th scope="row">' + tx(c.t) + '</th>' : '<td class="num">' + tx(c.t) + '</td>';
        else if (c.f !== undefined) h += '<td class="num">' + fijo(c.f, c.tipo) + '</td>';
        else if (c.m !== undefined) h += '<td class="num modelo">' + fijo(c.m, c.tipo) + '</td>';
        else {
          const pesos = c.tipo === 'pesos' || c.tipo === 'unitario' || !c.tipo;
          h += '<td class="c-in' + (pesos ? '' : ' corta') + '"><div class="campo chico">' + (pesos ? '<span class="ad">$</span>' : '') +
            '<input type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" data-c="' + f.id + '|' + ci + '" data-f="' + f.id + '" data-t="' + (c.tipo || 'pesos') + '"' +
            ' aria-label="' + esc(sinHtml(f.celdas[0].t) + ' · ' + sinHtml(t.cols[ci])) + '"' + (c.guion ? ' placeholder="0 o –"' : '') + '>' +
            '<span class="marca" aria-hidden="true"></span></div><div class="c-fb"></div></td>';
        }
      });
      h += '<td class="c-a">' + (tieneR ? '<button type="button" class="btn chico" data-a="fila" data-f="' + f.id + '" aria-label="Revisar la fila ' + esc(sinHtml(f.celdas[0].t)) + '">Revisar</button>' : '') + '</td></tr>';
    });
    h += '</tbody></table></div><p class="desliza">Desliza la tabla hacia el lado para ver todas las columnas →</p>';
    if (t.cuadre) h += '<div class="cuadre" data-cuadre></div>';
    h += '<div class="tabla-a"><button type="button" class="btn principal" data-a="tabla-todo">Revisar todo</button>' +
      '<button type="button" class="btn-l" data-a="sol">Ver solución</button>' +
      '<button type="button" class="btn-l" data-a="tabla-reset">Borrar y reintentar</button></div>' +
      '<div class="fb" role="status" aria-live="polite"></div></div>';
    return h;
  }
  const rotCelda = (t, f, ci) => '<b>' + tx(f.celdas[0].t) + (t.cols.length > 2 ? ' · ' + tx(t.cols[ci]) : '') + '</b>';
  // Líneas de solución (una por celda). resPorCelda: resultados de la corrección, o null para mostrar solo la solución.
  function lineasTabla(t, resPorCelda, soloFila) {
    const out = [];
    t.filas.forEach((f) => {
      if (soloFila && f.id !== soloFila) return;
      f.celdas.forEach((c, ci) => {
        if (c.r === undefined) return;
        const key = f.id + '|' + ci;
        const q = celdaQ(c);
        const valor = c.guion && c.r === 0 && c.tipo !== 'pesos' ? '–' : fijo(c.r, c.tipo);
        if (!resPorCelda) { out.push('<li class="info">' + rotCelda(t, f, ci) + ': <b>' + valor + '</b>' + (c.s ? ' → ' + tx(c.s) : '') + '</li>'); return; }
        const res = resPorCelda[key];
        if (!res) return;
        if (M.esAcierto(res.estado)) {
          out.push('<li class="ok">' + rotCelda(t, f, ci) + ': ' + (c.s ? tx(c.s) : valor) +
            (res.estado !== 'correcta' ? ' <span class="nota-red">Tu respuesta también es válida. Valor principal: ' + valor + '.' + (res.alt && res.alt.nota ? ' ' + tx(res.alt.nota) : '') + '</span>' : '') + '</li>');
        } else {
          out.push('<li class="mal">' + rotCelda(t, f, ci) + ': ' + (res.estado === 'casi' ? 'casi, pero está mal. La respuesta es <b>' : 'la respuesta es <b>') + valor + '</b>.' +
            (res.estado === 'trampa' ? ' ' + tx(mayus(res.trampa.msg)) : res.estado === 'casi' ? ' <span class="nota-red">' + tx(textoCasi(res)) + '</span>' : '') + (c.s ? ' → ' + tx(c.s) : '') + '</li>');
        }
      });
    });
    return out;
  }
  function marcarCelda(inp, ok, c, res) {
    const campo = inp.closest('.campo');
    const nota = inp.closest('td').querySelector('.c-fb');
    campo.classList.toggle('ok', ok === true);
    campo.classList.toggle('mal', ok === false);
    nota.className = 'c-fb' + (ok ? ' ok' : '');
    if (ok === null) nota.textContent = '';
    else if (ok) nota.textContent = res.estado === 'correcta' ? '' : 'también vale';
    else nota.textContent = (res && res.estado === 'casi' ? 'casi: es ' : 'es ') + (c.guion && c.r === 0 && c.tipo !== 'pesos' ? '–' : fijo(c.r, c.tipo));
  }
  function revisarTabla(u, filaId) {
    const t = u.item.ref;
    const caja = cajaDe(u);
    const fb = caja.querySelector('.fb');
    const d = borr(u);
    d.c = d.c || {}; d.e = d.e || {}; d.f = d.f || {};
    const limpio = !u.revelado;
    const res = {};
    let faltan = 0, revisadas = 0;
    t.filas.forEach((f) => {
      if (filaId && f.id !== filaId) return;
      f.celdas.forEach((c, ci) => {
        if (c.r === undefined) return;
        const key = f.id + '|' + ci;
        const inp = caja.querySelector('input[data-c="' + key + '"]');
        const r = M.corregir(celdaQ(c), inp.value);
        if (r.estado === 'vacia' || r.estado === 'invalida') { faltan++; marcarCelda(inp, null); return; }
        const ok = M.esAcierto(r.estado);
        if (d.f[key] === undefined) d.f[key] = ok ? 1 : 0;
        d.e[key] = ok ? 1 : 0;
        d.c[key] = inp.value;
        res[key] = r;
        revisadas++;
        marcarCelda(inp, ok, c, r);
      });
    });
    if (!revisadas) {
      fb.className = 'fb aviso';
      fb.innerHTML = '<p>Completa las celdas ' + (filaId ? 'de esa fila ' : '') + 'antes de revisar. Si una celda no lleva nada, escribe 0 o un guion (–).</p>';
      guardar();
      return;
    }
    const todas = editables(t);
    const bien = Object.keys(res).every((k) => M.esAcierto(res[k].estado));
    fb.className = 'fb ' + (bien ? 'ok' : 'mal');
    fb.innerHTML = '<ul class="sol-celdas">' + lineasTabla(t, res, filaId).join('') + '</ul>' +
      (faltan ? '<p class="suave">Te faltan ' + faltan + ' celda' + (faltan > 1 ? 's' : '') + ' por completar.</p>' : '') +
      (!bien ? '<p class="animo">' + animo() + ' Corrige las celdas marcadas y revisa de nuevo.</p>' : '');
    abreviar(fb);
    u.revelado = true;
    let r = {}, registrado = false, ok = false;
    if (!d.reg && todas.every((k) => d.f[k] !== undefined)) {
      ok = todas.every((k) => d.f[k] === 1);
      // Una tabla cuenta como resuelta "en limpio" si cada celda estuvo bien la primera vez que se revisó
      // (aunque se haya revisado fila por fila) y no se había visto antes su solución.
      const enLimpio = !u.visto && !(S.it[u.item.id] && S.it[u.item.id].s);
      r = registrar(u.item.id, ok, { limpio: enLimpio });
      d.reg = ok ? 2 : 1;
      registrado = true;
    } else if (d.reg === 1 && todas.every((k) => d.e[k] === 1)) {
      ok = true;
      r = registrar(u.item.id, true, {});
      d.reg = 2;
      registrado = true;
    }
    guardar();
    pintarCuadre(u);
    if (registrado) despuesDeResponder(u, ok, r, limpio);
  }
  function pintarCuadre(u) {
    const t = u.item.ref;
    if (!t.cuadre) return;
    const caja = cajaDe(u);
    const el = caja.querySelector('[data-cuadre]');
    let suma = 0, listo = true;
    t.cuadre.celdas.forEach((fid) => {
      const inp = caja.querySelector('input[data-c="' + fid + '|' + t.cuadre.col + '"]');
      const L = M.leer(inp.value);
      if (L.guion) return;
      if (!L.ok) { listo = false; return; }
      suma += L.cands[0];
    });
    const obj = t.cuadre.objetivo;
    if (!listo) { el.className = 'cuadre'; el.innerHTML = tx(t.cuadre.texto) + ' debe sumar <b>$ ' + M.num(obj, 0) + '</b>.'; return; }
    const dif = Math.abs(suma - obj);
    if (dif <= 1) { el.className = 'cuadre ok'; el.innerHTML = '✓ Cuadra: ' + tx(t.cuadre.texto) + ' = $ ' + M.num(suma, 0) + '.'; }
    else if (dif <= Math.max(2, obj * 0.0005)) { el.className = 'cuadre aviso'; el.innerHTML = 'Casi: suma $ ' + M.num(suma, 0) + ' y debe dar $ ' + M.num(obj, 0) + '. Revisa con qué decimales multiplicaste.'; }
    else { el.className = 'cuadre'; el.innerHTML = tx(t.cuadre.texto) + ' suma $ ' + M.num(suma, 0) + '; debe dar <b>$ ' + M.num(obj, 0) + '</b>. Todavía no cuadra.'; }
  }
  function reiniciarTabla(u) {
    const caja = cajaDe(u);
    u.visto = u.visto || u.revelado; // ya vio respuestas: rehacerla no vuelve a sumar puntos
    if (u.modo === 'flujo') delete S.r[u.item.id]; else u.d = null;
    caja.querySelectorAll('input').forEach((inp) => { inp.value = ''; marcarCelda(inp, null); delete inp.dataset.manual; });
    const fb = caja.querySelector('.fb');
    fb.className = 'fb';
    fb.innerHTML = '';
    u.revelado = false;
    guardar();
    pintarCuadre(u);
  }

  // ---------- Verdadero / Falso ----------
  function hVF(item, o) {
    const x = item.ref;
    const u = unidad(item, o);
    return '<div class="vf" data-u="' + u.uid + '">' + hFuente(x.fuente, true) +
      '<p class="vf-af">' + (o.num ? '<b>' + o.num + '.</b> ' : '') + tx(x.af) + '</p>' +
      '<div class="vf-b" style="margin-top:12px"><button type="button" class="btn" data-a="vf" data-v="1">Verdadero</button><button type="button" class="btn" data-a="vf" data-v="0">Falso</button></div>' +
      '<div class="fb" role="status" aria-live="polite"></div></div>';
  }
  function pintarVF(u, v) {
    const x = u.item.ref;
    const caja = cajaDe(u);
    const ok = (v === 1) === x.r;
    caja.querySelectorAll('[data-a="vf"]').forEach((b) => {
      const bv = Number(b.dataset.v);
      b.disabled = true;
      b.classList.toggle('es-ok', (bv === 1) === x.r);
      b.classList.toggle('es-mal', bv === v && !ok);
      if (bv === v) b.classList.add('elegido');
    });
    const fb = caja.querySelector('.fb');
    fb.className = 'fb ' + (ok ? 'ok' : 'mal');
    fb.innerHTML = '<p class="fb-h"><span class="ic">' + (ok ? '✓' : '✗') + '</span><span>' + (ok ? 'Correcto: es ' : 'Era ') + (x.r ? 'verdadero' : 'falso') + '.</span></p>' +
      '<p>' + tx(x.porque) + '</p>' + (ok ? '' : '<p class="animo">' + animo() + '</p>');
    abreviar(fb);
    u.revelado = true;
    return ok;
  }
  function responderVF(u, v) {
    if (u.revelado) return;
    const limpio = true;
    const ok = pintarVF(u, v);
    borr(u).v = v;
    const r = registrar(u.item.id, ok, { limpio: limpio });
    despuesDeResponder(u, ok, r, limpio);
  }

  // ---------- Selección múltiple (y "¿por qué?" de las lecciones) ----------
  function hMC(item, o) {
    const x = item.ref;
    const u = unidad(item, o);
    return '<div class="mc" data-u="' + u.uid + '">' + hFuente(x.fuente || (item.k === 'pq' ? { k: 'comprension' } : null), true) +
      '<p class="mc-en">' + (o.num ? '<b>' + o.num + '.</b> ' : '') + tx(x.enunciado || x.pregunta) + '</p>' +
      '<div class="mc-ops">' + x.opciones.map((op, i) => '<button type="button" class="mc-op" data-a="mc" data-v="' + i + '"><span class="letra">' + 'abcdef'.charAt(i) + '</span><span>' + tx(op) + '</span><span class="res" aria-hidden="true"></span></button>').join('') + '</div>' +
      '<div class="fb" role="status" aria-live="polite"></div></div>';
  }
  function pintarMC(u, v) {
    const x = u.item.ref;
    const caja = cajaDe(u);
    const ok = v === x.correcta;
    caja.querySelectorAll('[data-a="mc"]').forEach((b, i) => {
      b.disabled = true;
      if (i === x.correcta) { b.classList.add('es-ok'); b.querySelector('.res').textContent = '✓'; }
      else if (i === v) { b.classList.add('es-mal'); b.querySelector('.res').textContent = '✗'; }
    });
    const fb = caja.querySelector('.fb');
    fb.className = 'fb ' + (ok ? 'ok' : 'mal');
    fb.innerHTML = '<p class="fb-h"><span class="ic">' + (ok ? '✓' : '✗') + '</span><span>' + (ok ? 'Correcto.' : 'La correcta es la ' + 'abcdef'.charAt(x.correcta) + ').') + '</span></p>' +
      '<p>' + tx(x.porque) + '</p>' + (ok ? '' : '<p class="animo">' + animo() + '</p>');
    abreviar(fb);
    u.revelado = true;
    return ok;
  }
  function responderMC(u, v) {
    if (u.revelado) return;
    const ok = pintarMC(u, v);
    borr(u).o = v;
    const r = registrar(u.item.id, ok, { limpio: true });
    despuesDeResponder(u, ok, r, true);
  }

  // Devuelve una unidad a su estado sin responder (para "otra vuelta")
  function limpiarUnidad(u) {
    if (u.modo === 'flujo') delete S.r[u.item.id];
    u.d = null;
    u.revelado = false;
  }

  // ---------- Restaurar lo ya respondido al volver a un bloque ----------
  function restaurar() {
    U.forEach((u) => {
      const caja = cajaDe(u);
      if (!caja) return;
      const d = u.modo === 'flujo' ? S.r[u.item.id] : u.d;
      if (u.k === 'tabla') {
        if (d && d.c) {
          const res = {};
          Object.keys(d.c).forEach((key) => {
            const inp = caja.querySelector('input[data-c="' + key + '"]');
            if (!inp) return;
            inp.value = d.c[key];
            if (d.e && d.e[key] !== undefined) {
              const p = key.split('|');
              const c = u.item.ref.filas.find((f) => f.id === p[0]).celdas[Number(p[1])];
              const r = M.corregir(celdaQ(c), inp.value);
              if (r.estado !== 'vacia' && r.estado !== 'invalida') { marcarCelda(inp, M.esAcierto(r.estado), c, r); res[key] = r; u.revelado = true; }
            }
          });
          if (Object.keys(res).length) {
            const fb = caja.querySelector('.fb');
            const bien = Object.keys(res).every((k) => M.esAcierto(res[k].estado));
            fb.className = 'fb ' + (bien ? 'ok' : 'mal');
            fb.innerHTML = '<ul class="sol-celdas">' + lineasTabla(u.item.ref, res).join('') + '</ul>';
          }
        }
        pintarCuadre(u);
        return;
      }
      if (!d) return;
      if (u.k === 'preg') {
        const q0 = u.item.ref;
        if (typeof d.c === 'number') caja.querySelectorAll('[data-a="clasif"]').forEach((b, i) => b.setAttribute('aria-pressed', i === d.c ? 'true' : 'false'));
        if (typeof d.s === 'number') caja.querySelectorAll('[data-a="signo"]').forEach((b, i) => b.setAttribute('aria-pressed', i === d.s ? 'true' : 'false'));
        if (q0.tipo === 'opcion') { if (d.e && typeof d.c === 'number') pintarOpcion(u, d.c); return; }
        const inp = caja.querySelector('input');
        if (d.t !== undefined) inp.value = d.t;
        if (d.e) {
          const q = u.item.ref;
          const res = M.corregir(q, textoConSigno(q, inp.value, d));
          if (res.estado !== 'vacia' && res.estado !== 'invalida') pintarPreg(u, res, q.clasif ? d.c === q.clasif.correcta : null, d.c);
        }
      } else if (u.k === 'vf') {
        if (d.v === 0 || d.v === 1) pintarVF(u, d.v);
      } else if (typeof d.o === 'number') {
        pintarMC(u, d.o);
      }
    });
  }

  // =====================================================================
  // Bloques
  // =====================================================================
  function hParteLeccion(p) {
    if (p.k === 'p') return '<p>' + tx(p.h) + '</p>';
    if (p.k === 'practica') return '<div class="caja practica"><span class="rot">En la práctica</span><p>' + tx(p.h) + '</p></div>';
    if (p.k === 'trampa') return '<div class="caja trampa"><span class="rot">Trampa típica</span><p>' + tx(p.h) + '</p></div>';
    if (p.k === 'formula') return '<div class="formula">' + tx(p.h) + '</div>';
    // "Así lo preguntan": plegado, para que la lección se vea corta; se abre con un toque
    if (p.k === 'asi') return '<details class="caja asi plegable"><summary><span class="rot">Así lo preguntan en el certamen</span><span class="cuantas">' + p.items.length + '</span></summary><ul>' + p.items.map((x) => '<li>' + tx(x) + '</li>').join('') + '</ul></details>';
    if (p.k === 'lista') return '<ul>' + p.items.map((x) => '<li>' + tx(x) + '</li>').join('') + '</ul>';
    if (p.k === 'pasos') return '<ol class="pasos">' + p.items.map((x) => '<li><b class="t">' + tx(x.t) + '</b>' + tx(x.h) + '</li>').join('') + '</ol>';
    if (p.k === 'diagrama') return hDiagrama(p.id);
    if (p.k === 'html') return p.h;
    if (p.k === 'sub') return '<h2 class="sub">' + tx(p.h) + '</h2>';
    if (p.k === 'datos') return hTablaDatos(p);
    if (p.k === 'comparar') {
      // En celular cada fila se apila (ver CSS): por eso cada celda lleva el nombre de su columna
      return '<div class="tabla-scroll apilable"><table class="t-comparar' + (p.cols.length === 2 ? ' dos' : '') + '"><thead><tr>' + p.cols.map((c) => '<th scope="col">' + tx(c) + '</th>').join('') + '</tr></thead><tbody>' +
        p.filas.map((f) => '<tr>' + f.map((c, i) => (i ? '<td data-l="' + esc(sinHtml(p.cols[i])) + '">' + tx(c) + '</td>' : '<th scope="row">' + tx(c) + '</th>')).join('') + '</tr>').join('') + '</tbody></table></div>';
    }
    return '';
  }
  function hDiagrama(id) {
    const d = DG[id];
    if (!d) return '';
    return '<figure class="diagrama">' + d.svg + (d.pie ? '<figcaption>' + tx(d.pie) + '</figcaption>' : '') + '</figure>';
  }
  const migas = (b, extra) => '<p class="migas">' + (b.mod.n ? 'Módulo ' + b.mod.n + ' · ' : '') + (extra || TIPO_TXT[b.tipo] || '') + '</p>';

  function hLeccion(b) {
    const sig = vecinos(b).sig;
    let h = '<article class="bloque leccion">' + migas(b) +
      (b.teorica ? '<div class="aviso-teo"><p><b>Sección más bien teórica.</b> No es fundamental para el certamen: no se necesita para resolver los ejercicios y, si aparece, es en el verdadero o falso.</p>' +
        (sig ? '<a class="btn chico" href="' + href(sig) + '">Saltar esta sección →</a>' : '') + '</div>' : '') +
      '<h1 tabindex="-1">' + tx(b.titulo) + '</h1>' +
      (b.idea ? '<p class="idea"><span>La idea en una frase</span>' + tx(b.idea) + '</p>' : '') +
      (b.partes || []).map(hParteLeccion).join('');
    if (b.porque) {
      const hecha = !!(S.r[b.key + '#porque'] && typeof S.r[b.key + '#porque'].o === 'number');
      h += '<details class="porque-sec"' + (hecha ? ' open' : '') + '><summary>Pregunta de comprensión <span class="suave">(opcional)</span></summary>' + hMC(itemsDe(b)[0], { modo: 'flujo' }) + '</details>';
    }
    return h + '<div id="zona-nav"></div></article>';
  }

  function hTablaDatos(td) {
    if (!td) return '';
    return '<div class="tabla-scroll"><table class="t-datos"><thead><tr>' + td.cols.map((c) => '<th scope="col">' + tx(c) + '</th>').join('') + '</tr></thead><tbody>' +
      td.filas.map((f) => '<tr>' + f.map((c, i) => (i ? '<td>' + tx(c) + '</td>' : '<th scope="row">' + tx(c) + '</th>')).join('') + '</tr>').join('') + '</tbody></table></div>' +
      (td.pie ? '<p class="tabla-pie">' + tx(td.pie) + '</p>' : '');
  }
  function hEnunciado(b) {
    return '<section class="enunciado"><span class="rot">Enunciado</span>' + b.enunciado + hTablaDatos(b.tablaDatos) + (b.diagrama ? hDiagrama(b.diagrama) : '') + '</section>';
  }
  function hEjercicio(b) {
    let n = 0;
    let h = '<article class="bloque ejercicio ancho">' + migas(b, b.rol === 'extra' ? 'Ejercicio extra' : 'Ejercicio') +
      hFuente(b.fuente) + (b.etiqueta ? '<span class="etiqueta">' + tx(b.etiqueta) + '</span>' : '') +
      '<h1 tabindex="-1">' + tx(b.titulo) + '</h1>' + hEnunciado(b);
    b.partes.forEach((p, pi) => {
      h += '<section class="parte" data-parte="' + pi + '"><h2>' + tx(p.titulo) + '</h2>' + (p.intro ? '<p class="intro">' + tx(p.intro) + '</p>' : '');
      if (p.modelo) h += '<div class="modelo-caja"><span class="rot">Paso hecho como modelo</span>' + tx(p.modelo) + (p.nota ? '<small>' + tx(p.nota) + '</small>' : '') + '</div>';
      if (p.tabla) h += hTabla(ITEMS.get(b.key + '#' + p.tabla.id), { modo: 'flujo' });
      (p.preguntas || []).forEach((q) => { n++; h += hPreg(ITEMS.get(b.key + '#' + q.id), { modo: 'flujo', num: n }); });
      if (p.despues) h += '<div class="despues" data-despues hidden>' + p.despues + '</div>';
      h += '</section>';
    });
    if (b.cierre) h += '<section class="cierre" id="zona-cierre" hidden>' + b.cierre + '</section>';
    return h + '<div id="zona-fin"></div><div id="zona-nav"></div></article>';
  }

  // Ronda actual de un bloque de V/F o alternativas (grupos de RONDA)
  function ronda(b) {
    const its = itemsDe(b);
    const total = Math.ceil(its.length / RONDA);
    const i = Math.min((S.r[b.key + '@ronda'] || 0), total - 1);
    return { i: i, total: total, items: its.slice(i * RONDA, i * RONDA + RONDA) };
  }
  function hRonda(b) {
    const r = ronda(b);
    const comp = b.tipo === 'vf' ? hVF : hMC;
    return '<article class="bloque">' + migas(b) + '<h1 tabindex="-1">' + tx(b.titulo) + '</h1>' +
      '<p>' + (b.tipo === 'vf'
        ? 'Decide si cada afirmación es verdadera o falsa. Apenas respondes, ves la justificación.'
        : 'Elige una alternativa. Apenas respondes, ves la justificación.') +
      (r.total > 1 ? ' <span class="suave">Ronda ' + (r.i + 1) + ' de ' + r.total + '.</span>' : '') + '</p>' +
      r.items.map((it, k) => comp(it, { modo: 'flujo', num: r.i * RONDA + k + 1 })).join('') +
      '<div id="zona-fin"></div><div id="zona-nav"></div></article>';
  }

  // Resultado del módulo: aciertos al primer intento y qué repasar
  function resultadoModulo(mod) {
    let resp = 0, bien = 0;
    const repasar = [];
    mod.bloques.forEach((b) => {
      if (b.rol === 'extra') return;
      let flojo = false;
      itemsFlujo(b).forEach((it) => {
        const x = S.it[it.id];
        if (!x || (!x.n && !x.s)) return;
        resp++;
        if (x.p === 1) bien++; else flojo = true;
      });
      if (flojo) repasar.push(b);
    });
    return { resp: resp, bien: bien, repasar: repasar };
  }
  function hCierreSesion(mod) {
    const i = MODS.indexOf(mod);
    const sig = MODS.slice(i + 1).find((m) => m.bloques.length);
    const e = nErrores();
    return '<p><b>Hoy avanzaste ' + S.ses.n + ' bloque' + (S.ses.n === 1 ? '' : 's') + '.</b> ' +
      (sig ? 'Siguiente: Módulo ' + sig.n + ' (' + tx(sig.corto) + '). ' : '') +
      (e ? 'Tienes ' + e + ' error' + (e === 1 ? '' : 'es') + ' para repasar.' : 'No tienes errores pendientes.') + '</p>';
  }
  function hResumen(b) {
    const r = resultadoModulo(b.mod);
    let h = '<article class="bloque resumen">' + migas(b) + '<h1 tabindex="-1">' + tx(b.titulo) + '</h1>' +
      '<div class="res-mod">' + (r.resp
        ? '<p><b>Acertaste ' + r.bien + ' de ' + r.resp + ' al primer intento.</b></p>' +
          (r.repasar.length ? '<p>Repasa: ' + r.repasar.map((x) => '<a href="' + href(x) + '">' + tx(x.titulo) + '</a>').join(' · ') + '</p>' : '<p>No quedó nada pendiente en este módulo.</p>')
        : '<p>Todavía no respondes ejercicios de este módulo. Cuando lo hagas, aquí verás cuántos acertaste y qué conviene repasar.</p>') +
      hCierreSesion(b.mod) + '</div>' +
      '<h2>Fórmulas clave</h2><ul class="claves">' + b.formulas.map((f) => '<li>' + tx(f) + '</li>').join('') + '</ul>';
    if (b.asi) h += '<div class="caja asi"><span class="rot">Así lo preguntan en este módulo</span><ul>' + b.asi.map((x) => '<li>' + tx(x) + '</li>').join('') + '</ul></div>';
    return h + '<div id="zona-nav"></div></article>';
  }

  function hPortada(b) {
    const e = nErrores();
    const ult = S.ult && BLOQUES.get(S.ult);
    const primero = FLUJO.find((x) => x !== b);
    let h = '<article class="bloque portada">' + '<p class="migas">ICOFI · Certamen 3</p><h1 tabindex="-1">' + tx(C.titulo) + '</h1>' +
      '<p class="sub">' + tx(b.bajada) + '</p>';
    if (e && DIA_ANTERIOR) {
      h += '<div class="aviso-rep"><p><b>Antes de seguir:</b> tienes ' + e + ' error' + (e === 1 ? '' : 'es') + ' de otro día para repasar. Volver a intentarlos ahora es lo que más ayuda a que no se repitan.</p>' +
        '<a class="btn principal" href="#/repaso/errores">Repasar mis errores</a></div>';
    }
    h += '<div class="acciones">' +
      (ult ? '<a class="btn principal" href="' + href(ult) + '">Continuar donde quedaste →</a>' : (primero ? '<a class="btn principal" href="' + href(primero) + '">Empezar →</a>' : '')) +
      (e && !DIA_ANTERIOR ? '<a class="btn" href="#/repaso/errores">Repasar mis errores (' + e + ')</a>' : '') + '</div>' +
      (ult ? '<p class="suave" style="margin:-14px 0 22px">Quedaste en: ' + tx(ult.titulo) + ' (Módulo ' + ult.mod.n + ').</p>' : '') +
      '<div class="datos-cert">' + b.ficha.map((f) => '<div><span class="rot">' + tx(f.rot) + '</span><b>' + tx(f.valor) + '</b><span class="suave">' + tx(f.extra) + '</span></div>').join('') + '</div>' +
      '<h2>Qué entra</h2><ul>' + b.contenidos.map((x) => '<li>' + tx(x) + '</li>').join('') + '</ul>' +
      '<h2>Los ejercicios que más se repiten</h2><ol>' + b.repiten.map((x) => '<li>' + tx(x) + '</li>').join('') + '</ol>' +
      '<h2>El mapa del curso</h2><ol class="pasos">' + b.mapa.map((x) => '<li><b class="t">' + tx(x.t) + '</b>' + tx(x.h) + '</li>').join('') + '</ol>' +
      '<h2>Tu rango</h2><p>Vas en ' + hNombreActual() + ' con <b>' + (esGlobal() ? 'puntos infinitos' : M.num(S.pts, 0) + ' puntos') + '</b>. Se sube acertando y se baja fallando:</p>' +
      '<ul><li><b>Aciertas al primer intento:</b> +10 en verdadero o falso y alternativas, +15 en una pregunta de ejercicio y +25 en una tabla completa.</li>' +
      '<li><b>Fallas, o miras la solución sin intentar:</b> −5. Intentar siempre conviene: un acierto vale más que lo que cuesta un error.</li>' +
      '<li>Cada pregunta suma una sola vez por día, así que repetir la misma no sube el puntaje; repasarla otro día, sí.</li></ul>' +
      '<ol class="escalera">' + RANGOS.map((r, i) => '<li class="' + (esGlobal() ? 'pasado' : i === rangoDe(S.pts) ? 'actual' : i < rangoDe(S.pts) ? 'pasado' : '') + '" style="border-left: 4px solid ' + RANGO_COLOR[i] + '">' + hInsignia(i, 34) + '<b style="color:' + RANGO_COLOR[i] + '">' + r + '</b><span>' + M.num(UMBRAL[i], 0) + ' pts</span></li>').join('') +
      (esGlobal() ? '<li class="actual es-global" style="border-left: 4px solid ' + GLOBAL.color + '">' + hInsigniaGlobal(34) + '<b style="color:' + GLOBAL.color + '">' + GLOBAL.nombre + '</b><span>∞ pts</span></li>' : '') + '</ol>' +
      '<h2>Cómo usar esta guía</h2><ul>' +
      '<li>Sigue el orden del índice, o salta al tema que quieras: no hay bloqueos.</li>' +
      '<li>Responde antes de mirar la solución. Equivocarse intentando enseña más que leer la respuesta.</li>' +
      '<li>Lo que falles queda en «Mis errores para repasar». Sale de ahí cuando lo aciertas dos veces en días distintos.</li>' +
      '<li>Los números se escriben como en Chile: <b>36.000.000</b>, <b>36,5</b>, <b>70 %</b>.</li>' +
      '<li>La respuesta tiene que ser <b>exacta</b>, igual a la pauta del certamen (o a la resolución del profesor en los talleres). Si quedas cerca, la página te avisa que casi, pero cuenta como incorrecta.</li></ul>';
    return h + '<div id="zona-nav"></div></article>';
  }

  function hBloque(b) {
    if (b.tipo === 'leccion') return hLeccion(b);
    if (b.tipo === 'ejercicio') return hEjercicio(b);
    if (b.tipo === 'vf' || b.tipo === 'mc') return hRonda(b);
    if (b.tipo === 'resumen') return hResumen(b);
    if (b.tipo === 'portada') return hPortada(b);
    if (b.tipo === 'simulacro') return hSimulacro(b);
    if (b.tipo === 'formulas') return hFormulas(b);
    return '<article class="bloque"><h1 tabindex="-1">' + tx(b.titulo) + '</h1></article>';
  }

  // ---------- Navegación entre bloques ----------
  function vecinos(b) {
    const base = b.rol === 'extra' ? b.de : b;
    const i = FLUJO.indexOf(base);
    return { ant: b.rol === 'extra' ? base : (FLUJO[i - 1] || null), sig: FLUJO[i + 1] || null, base: base };
  }
  function hNav(b) {
    const v = vecinos(b);
    let h = '<div class="nav">';
    if (v.ant) h += '<a class="btn" href="' + href(v.ant) + '">← Anterior</a>';
    let sinMas = false;
    if (b.tipo === 'ejercicio') {
      const extras = (v.base.extras || []).filter((x) => x !== b);
      const otro = extras.find((x) => !hecho(x));
      if (otro) h += '<a class="btn" href="' + href(otro) + '">¿Hacer otro ejercicio de lo mismo?</a>';
      else if ((v.base.extras || []).length) sinMas = true;
    }
    if ((b.tipo === 'vf' || b.tipo === 'mc')) {
      const r = ronda(b);
      if (r.total > 1) h += '<button type="button" class="btn" data-a="otra-ronda">' + (r.i + 1 < r.total ? 'Otra ronda' : 'Volver a la primera ronda') + '</button>';
    }
    if (v.sig) h += '<a class="btn principal sig" href="' + href(v.sig) + '">' + (b.tipo === 'ejercicio' ? 'Seguir con el siguiente contenido →' : 'Siguiente →') + '</a>';
    if (sinMas) h += '<p class="sin-mas">Ya hiciste todos los ejercicios de este tema. Puedes seguir con el siguiente contenido.</p>';
    return h + '</div>';
  }
  function hFin(b) {
    if (b.tipo !== 'ejercicio' && b.tipo !== 'vf' && b.tipo !== 'mc') return '';
    const its = b.tipo === 'ejercicio' ? itemsDe(b) : ronda(b).items;
    const resp = its.filter((it) => estadoItem(it.id) !== 'n').length;
    if (!resp) return '';
    const bien = its.filter((it) => S.it[it.id] && S.it[it.id].p === 1).length;
    const pend = its.filter((it) => S.err[it.id]).length;
    let h = '<div class="fin">';
    if (resp < its.length) h += '<p>Llevas ' + resp + ' de ' + its.length + ' respondidas.</p>';
    else {
      h += '<p><b>Acertaste ' + bien + ' de ' + its.length + ' al primer intento.</b></p>';
      if (pend) h += '<p>' + (pend === 1 ? 'La que falló quedó' : 'Las que fallaron quedaron') + ' en <a href="#/repaso/errores">Mis errores para repasar</a>, para volver a intentarlas otro día.</p>';
      else if (bien === its.length) h += '<p>Este tema está dominado. Sigue con el siguiente.</p>';
      if (b.tipo !== 'ejercicio') h += '<p><button type="button" class="btn-l" data-a="reintentar-ronda">Responder esta ronda otra vez</button></p>';
    }
    return h + '</div>';
  }
  // Actualiza lo que depende del avance dentro del bloque visible
  function refrescarBloque() {
    const b = VISTA.bloque;
    if (!b) return;
    const zn = document.getElementById('zona-nav');
    if (zn) zn.innerHTML = hNav(b);
    const zf = document.getElementById('zona-fin');
    if (zf) zf.innerHTML = hFin(b);
    if (b.tipo === 'ejercicio') {
      b.partes.forEach((p, pi) => {
        if (!p.despues) return;
        const el = app.querySelector('[data-parte="' + pi + '"] [data-despues]');
        const its = itemsDe(b).filter((it) => it.parte === p);
        if (el && its.every((it) => estadoItem(it.id) !== 'n')) { if (el.hidden) { el.hidden = false; abreviar(el); } }
      });
      const zc = document.getElementById('zona-cierre');
      if (zc && zc.hidden && hecho(b)) { zc.hidden = false; abreviar(zc); }
    }
  }
  function despuesDeResponder(u, ok, r, limpio, soloSolucion) {
    if (u.modo === 'repaso') sesionRespondida(u, ok, r, limpio, soloSolucion);
    else refrescarBloque();
    pintarIndice();
    pintarProgreso();
  }

  // =====================================================================
  // Repaso: "Mis errores para repasar" y "Repaso mixto"
  // =====================================================================
  function rotuloItem(it) {
    const r = it.ref;
    if (it.k === 'vf') return corto(r.af, 90);
    if (it.k === 'mc') return corto(r.enunciado, 90);
    if (it.k === 'pq') return corto(r.pregunta, 90);
    if (it.k === 'tabla') return 'Tabla: ' + corto(it.parte.titulo, 70);
    return corto(r.texto, 90);
  }
  function hItem(it, ns) {
    const b = it.b;
    const o = { ns: ns, modo: 'repaso' };
    let h = '<p class="ctx">Módulo ' + b.mod.n + ' · ' + tx(b.titulo) + ' · <a href="' + href(b) + '">ver en su contexto</a></p>';
    if (it.k === 'vf') return h + hVF(it, o);
    if (it.k === 'mc' || it.k === 'pq') return h + hMC(it, o);
    h += hFuente(b.fuente) + hEnunciado(b);
    if (it.k === 'tabla') return h + '<section class="parte"><h2>' + tx(it.parte.titulo) + '</h2>' + (it.parte.intro ? '<p class="intro">' + tx(it.parte.intro) + '</p>' : '') + hTabla(it, o) + '</section>';
    return h + hPreg(it, o);
  }
  function mezclar(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function modulosVistos() {
    return MODS.filter((m) => m.n > 0 && m.bloques.some((b) => S.vistos[b.key] || itemsDe(b).some((it) => S.it[it.id])));
  }
  function iniciarSesion(tipo) {
    let cola;
    if (tipo === 'errores') cola = Object.keys(S.err).filter((id) => ITEMS.has(id));
    else {
      const pool = [];
      modulosVistos().forEach((m) => m.bloques.forEach((b) => itemsDe(b).forEach((it) => { if (it.k !== 'tabla') pool.push(it.id); })));
      cola = mezclar(pool).slice(0, 10);
    }
    SES = { tipo: tipo, cola: cola, i: 0, res: [], salieron: 0, n: (SES ? SES.n : 0) + 1 };
    pintar();
  }
  function sesionRespondida(u, ok, r, limpio, soloSolucion) {
    if (!SES) return;
    const id = u.item.id;
    if (!SES.res.some((x) => x.id === id)) {
      SES.res.push({ id: id, ok: ok && limpio && !soloSolucion });
      if (r && r.salio) SES.salieron++;
    }
    const z = document.getElementById('zona-ses');
    if (z) {
      const ultimo = SES.i >= SES.cola.length - 1;
      z.innerHTML = '<div class="nav">' + (r && r.salio ? '<p class="sin-mas" style="color:var(--ok)">✓ Dos aciertos en días distintos: este ítem salió de tu lista de errores.</p>' : '') +
        '<button type="button" class="btn principal sig" data-a="ses-sig">' + (ultimo ? 'Ver el resultado →' : 'Siguiente →') + '</button></div>';
    }
  }
  function hSesion() {
    const titulo = SES.tipo === 'errores' ? 'Mis errores para repasar' : 'Repaso mixto';
    if (SES.i >= SES.cola.length) {
      const bien = SES.res.filter((x) => x.ok).length;
      const quedan = nErrores();
      let h = '<article class="bloque"><p class="migas">Repaso</p><h1 tabindex="-1">' + titulo + ': resultado</h1>' +
        '<div class="res-mod"><p><b>Acertaste ' + bien + ' de ' + SES.cola.length + '.</b></p>' +
        (SES.salieron ? '<p>' + SES.salieron + ' ítem' + (SES.salieron === 1 ? ' salió' : 's salieron') + ' de tu lista de errores.</p>' : '') +
        '<p>' + (quedan ? 'Te quedan ' + quedan + ' para repasar. Un ítem sale de la lista cuando lo aciertas dos veces en días distintos, así que conviene volver otro día.' : 'No te quedan errores pendientes.') + '</p></div>' +
        '<ul class="lista-res">' + SES.cola.map((id) => { const it = ITEMS.get(id); const r = SES.res.find((x) => x.id === id); return '<li class="' + (r && r.ok ? 'ok' : 'mal') + '"><a href="' + href(it.b) + '">' + esc(rotuloItem(it)) + '</a></li>'; }).join('') + '</ul>' +
        '<div class="nav"><button type="button" class="btn" data-a="ses-fin">Volver</button>' +
        (SES.tipo === 'mixto' ? '<button type="button" class="btn principal sig" data-a="mixto-iniciar">Otro repaso mixto →</button>' : '') + '</div></article>';
      return h;
    }
    const it = ITEMS.get(SES.cola[SES.i]);
    return '<article class="bloque ancho"><p class="migas">Repaso</p><h1 tabindex="-1">' + titulo + '</h1>' +
      '<div class="ses-cab"><span>' + (SES.i + 1) + ' de ' + SES.cola.length + '</span><div class="prog"><i style="width:' + Math.round(100 * SES.i / SES.cola.length) + '%"></i></div>' +
      '<button type="button" class="btn-l" data-a="ses-fin">Salir</button></div>' +
      hItem(it, 'rep' + SES.n + ':') + '<div id="zona-ses"></div></article>';
  }
  function hErrores() {
    const ids = Object.keys(S.err).filter((id) => ITEMS.has(id));
    let h = '<article class="bloque"><p class="migas">Repaso</p><h1 tabindex="-1">Mis errores para repasar</h1>' +
      '<p>Aquí queda todo lo que fallaste. Un ítem sale de la lista cuando lo aciertas <b>dos veces en días distintos</b>: repasar con días de por medio es lo que hace que se quede.</p>';
    if (!ids.length) return h + '<div class="res-mod"><p><b>No tienes errores pendientes.</b></p><p>Cuando falles un ejercicio, un verdadero o falso o una alternativa, aparecerá aquí.</p></div><div class="nav"><a class="btn" href="#/">← Volver al inicio</a></div></article>';
    h += '<div class="acciones"><button type="button" class="btn principal" data-a="errores-iniciar">Repasar ahora (' + ids.length + ')</button></div><ul class="lista-err">' +
      ids.map((id) => {
        const it = ITEMS.get(id);
        const e = S.err[id];
        return '<li><a href="' + href(it.b) + '">' + esc(rotuloItem(it)) + '</a><small>Módulo ' + it.b.mod.n + ' · ' + sinHtml(it.b.titulo) + ' · ' +
          (e.d.length ? '1 de 2 aciertos' + (e.d[0] === hoy() ? ' (hoy)' : '') : '0 de 2 aciertos') + '</small></li>';
      }).join('') + '</ul></article>';
    return h;
  }
  function hMixto() {
    const vistos = modulosVistos();
    let h = '<article class="bloque"><p class="migas">Repaso</p><h1 tabindex="-1">Repaso mixto</h1>' +
      '<p>10 preguntas al azar de todos los módulos que ya viste, mezcladas. En el certamen nadie te dice de qué tema es cada pregunta: reconocerlo es parte de lo que hay que practicar.</p>';
    if (!vistos.length) return h + '<div class="res-mod"><p><b>Todavía no hay módulos vistos.</b></p><p>Avanza en algún módulo y vuelve: el repaso mixto toma preguntas solo de lo que ya estudiaste.</p></div><div class="nav"><a class="btn" href="#/">← Volver al inicio</a></div></article>';
    return h + '<p class="suave">Módulos incluidos: ' + vistos.map((m) => m.n + '. ' + sinHtml(m.corto)).join(' · ') + '</p>' +
      '<div class="acciones"><button type="button" class="btn principal" data-a="mixto-iniciar">Empezar repaso mixto →</button></div></article>';
  }

  // =====================================================================
  // Simulacro final (formato del certamen, con tiempo y sin ayuda) y hoja de fórmulas
  // =====================================================================
  let simReloj = 0;
  const preguntasDe = (b) => itemsDe(b).filter((it) => it.k === 'preg');
  function areaDe(b, cfg) {
    if (b.area) return b.area;
    const a = cfg.areas.find((x) => x.modulos.indexOf(b.mod.id) >= 0);
    return a ? a.id : null;
  }
  function armarSimulacro(cfg) {
    // V/F: primero los que nunca se han respondido
    const vfs = [];
    ITEMS.forEach((it) => { if (it.k === 'vf') vfs.push(it); });
    const vf = mezclar(vfs.filter((it) => !S.it[it.id])).concat(mezclar(vfs.filter((it) => S.it[it.id]))).slice(0, cfg.vf.n).map((it) => it.id);
    // Un ejercicio de certamen por área: primero los reservados (simulacro: true) que no se han usado
    const previos = S.simPrev || [];
    const ej = [];
    cfg.areas.forEach((a) => {
      const banco = [];
      BLOQUES.forEach((b) => {
        const n = b.tipo === 'ejercicio' ? preguntasDe(b).length : 0;
        if (n >= 4 && n <= 5 && b.fuente && b.fuente.k === 'certamen' && areaDe(b, cfg) === a.id) banco.push(b);
      });
      const sinUsar = banco.filter((b) => b.simulacro && !preguntasDe(b).some((it) => S.it[it.id]));
      let pool = sinUsar.length ? sinUsar : banco;
      const distintos = pool.filter((b) => previos.indexOf(b.key) < 0);
      if (distintos.length) pool = distintos;
      if (pool.length) ej.push(mezclar(pool)[0].key);
    });
    return { vf: vf, ej: ej, r: {}, acum: 0, t0: Date.now(), pausa: false };
  }
  function simItems(sim) {
    const out = sim.vf.map((id) => ITEMS.get(id));
    sim.ej.forEach((k) => preguntasDe(BLOQUES.get(k)).forEach((it) => out.push(it)));
    return out.filter(Boolean);
  }
  function simRespondida(sim, it) {
    const r = sim.r[it.id];
    if (!r) return false;
    if (it.k === 'vf') return r.v === 0 || r.v === 1;
    if (it.ref.tipo === 'opcion') return typeof r.c === 'number';
    return !!(r.t && r.t.trim());
  }
  const simUsado = (sim) => Math.floor(sim.acum + (sim.t0 ? (Date.now() - sim.t0) / 1000 : 0));
  const mmss = (s) => { s = Math.max(0, s); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); };

  // Corrige un simulacro. Si "registrar" es true, cada respuesta cuenta como intento (y lo fallado va a repaso).
  function corregirSimulacro(cfg, sim, conRegistro) {
    const det = [];
    let pts = 0;
    sim.vf.forEach((id) => {
      const it = ITEMS.get(id);
      if (!it) return;
      const resp = simRespondida(sim, it);
      const ok = resp && ((sim.r[id].v === 1) === it.ref.r);
      if (resp && conRegistro) registrar(id, ok, { limpio: true });
      if (ok) pts += cfg.vf.puntos;
      det.push({ it: it, resp: resp, ok: ok, pts: ok ? cfg.vf.puntos : 0, max: cfg.vf.puntos });
    });
    const nPreg = sim.ej.reduce((s, k) => s + preguntasDe(BLOQUES.get(k)).length, 0);
    const valor = nPreg ? cfg.puntosEjercicios / nPreg : 0;
    sim.ej.forEach((k) => preguntasDe(BLOQUES.get(k)).forEach((it) => {
      const q = it.ref;
      const r = sim.r[it.id] || {};
      const resp = simRespondida(sim, it);
      let ok = false, res = null;
      if (q.tipo === 'opcion') ok = resp && r.c === q.correcta;
      else if (resp) {
        res = M.corregir(q, textoConSigno(q, r.t, r));
        ok = M.esAcierto(res.estado) && (!q.clasif || r.c === q.clasif.correcta);
      }
      if (resp && conRegistro) registrar(it.id, ok, { limpio: true });
      if (ok) pts += valor;
      det.push({ it: it, resp: resp, ok: ok, res: res, pts: ok ? valor : 0, max: valor });
    }));
    const puntaje = M.entero(pts);
    return { det: det, puntaje: puntaje, valor: valor };
  }
  function entregarSimulacro(b, forzado) {
    const sim = S.sim;
    if (!sim) return;
    const faltan = simItems(sim).filter((it) => !simRespondida(sim, it)).length;
    if (!forzado && faltan && !window.confirm('Te quedan ' + faltan + ' sin responder. ¿Entregar el simulacro igual?')) return;
    clearInterval(simReloj);
    const seg = Math.min(simUsado(sim), b.minutos * 60);
    const c = corregirSimulacro(b, sim, true);
    S.simRes = { vf: sim.vf, ej: sim.ej, r: sim.r, seg: seg, fecha: hoy(), puntaje: c.puntaje, buenas: c.det.filter((d) => d.ok).length, total: c.det.length, agotado: !!forzado };
    S.simPrev = sim.ej;
    S.sim = null;
    guardar();
    pintar();
    window.scrollTo(0, 0);
  }
  function hSimPregunta(it, n, sim) {
    const q = it.ref;
    const r = sim.r[it.id] || {};
    const ad = adornos(q);
    const chips = (a, ops, sel) => '<div class="chips">' + ops.map((op, i) => '<button type="button" class="chip" data-a="' + a + '" data-v="' + i + '" aria-pressed="' + (sel === i) + '">' + tx(op) + '</button>').join('') + '</div>';
    let h = '<div class="preg" data-s="' + it.id + '"><label class="preg-t" for="sim-' + it.id + '"><span class="preg-n">' + n + '</span><span>' + tx(q.texto) + '</span></label>';
    if (q.tipo === 'opcion') h += chips('sim-c', q.opciones, r.c);
    else {
      h += '<div class="campo">' + (ad.pre ? '<span class="ad">' + ad.pre + '</span>' : '') +
        '<input id="sim-' + it.id + '" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Tu respuesta" data-t="' + (q.tipo || 'pesos') + '" value="' + esc(r.t || '') + '">' +
        (ad.suf ? '<span class="ad">' + esc(ad.suf) + '</span>' : '') + '</div>';
      if (q.signo) h += '<div class="clasif"><span>¿Qué es?</span>' + chips('sim-s', [q.signo.pos, q.signo.neg], r.s) + '</div>';
      if (q.clasif) h += '<div class="clasif"><span>' + tx(q.clasif.texto) + '</span>' + chips('sim-c', q.clasif.opciones, r.c) + '</div>';
    }
    return h + '</div>';
  }
  function hSimEnCurso(b) {
    const sim = S.sim;
    const its = simItems(sim);
    const resp = its.filter((it) => simRespondida(sim, it)).length;
    const nPreg = sim.ej.reduce((s, k) => s + preguntasDe(BLOQUES.get(k)).length, 0);
    const valor = nPreg ? b.puntosEjercicios / nPreg : 0;
    let h = '<article class="bloque ancho sim"><p class="migas">Módulo 7 · Simulacro</p><h1 tabindex="-1">Simulacro final</h1>' +
      '<div class="sim-barra"><span class="reloj" id="sim-reloj" aria-label="Tiempo restante">' + mmss(b.minutos * 60 - simUsado(sim)) + '</span>' +
      '<span class="sim-cta" id="sim-cta">' + resp + ' de ' + its.length + ' respondidas</span>' +
      '<button type="button" class="btn chico" data-a="sim-pausa">' + (sim.pausa ? 'Reanudar' : 'Pausar') + '</button>' +
      '<button type="button" class="btn chico principal" data-a="sim-entregar">Entregar</button></div>';
    if (sim.pausa) {
      return h + '<div class="res-mod"><p><b>Simulacro en pausa.</b> El tiempo está detenido y las preguntas quedan ocultas hasta que reanudes.</p>' +
        '<p><button type="button" class="btn principal" data-a="sim-pausa">Reanudar</button></p></div></article>';
    }
    h += '<section class="sim-sec"><h2>Pregunta 1 · Verdadero o falso <small>' + (b.vf.puntos * sim.vf.length) + ' puntos (' + b.vf.puntos + ' cada una)</small></h2><ol class="sim-vf">';
    sim.vf.forEach((id) => {
      const it = ITEMS.get(id);
      const v = sim.r[id] ? sim.r[id].v : null;
      h += '<li data-s="' + id + '"><p>' + tx(it.ref.af) + '</p><div class="sim-vfb">' +
        '<button type="button" class="chip" data-a="sim-v" data-v="1" aria-pressed="' + (v === 1) + '">Verdadero</button>' +
        '<button type="button" class="chip" data-a="sim-v" data-v="0" aria-pressed="' + (v === 0) + '">Falso</button></div></li>';
    });
    h += '</ol></section>';
    sim.ej.forEach((k, i) => {
      const e = BLOQUES.get(k);
      const ps = preguntasDe(e);
      const area = b.areas.find((a) => a.id === areaDe(e, b));
      h += '<section class="sim-sec"><h2>Pregunta ' + (i + 2) + ' · ' + tx(area ? area.titulo : e.titulo) + ' <small>' + M.num(valor * ps.length, M.decimales(valor * ps.length, 1)) + ' puntos (' + M.num(valor, M.decimales(valor, 1)) + ' cada respuesta)</small></h2>' +
        hEnunciado(e) + ps.map((it, j) => hSimPregunta(it, j + 1, sim)).join('') + '</section>';
    });
    return h + '<div class="nav"><button type="button" class="btn principal sig" data-a="sim-entregar">Entregar simulacro</button></div></article>';
  }
  function hSimRevision(b, sr) {
    const c = corregirSimulacro(b, sr, false);
    const porId = {};
    c.det.forEach((d) => { porId[d.it.id] = d; });
    const marca = (d) => '<span class="rev-m ' + (d.ok ? 'ok' : 'mal') + '">' + (d.ok ? '✓' : '✗') + '</span>';
    const pts = (d) => '<span class="rev-p">' + M.num(d.pts, M.decimales(d.pts, 1)) + ' / ' + M.num(d.max, M.decimales(d.max, 1)) + ' pts</span>';
    let h = '<h2>Revisión pregunta por pregunta</h2><section class="sim-sec"><h3>Pregunta 1 · Verdadero o falso</h3>';
    sr.vf.forEach((id) => {
      const d = porId[id];
      if (!d) return;
      const x = d.it.ref;
      const v = sr.r[id] ? sr.r[id].v : null;
      h += '<div class="rev ' + (d.ok ? 'ok' : 'mal') + '">' + hFuente(x.fuente, true) + '<p class="rev-t">' + marca(d) + '<span>' + tx(x.af) + '</span>' + pts(d) + '</p>' +
        '<p>Tu respuesta: <b>' + (d.resp ? (v === 1 ? 'Verdadero' : 'Falso') : 'sin responder') + '</b> · Correcta: <b>' + (x.r ? 'Verdadero' : 'Falso') + '</b></p><p class="suave">' + tx(x.porque) + '</p></div>';
    });
    h += '</section>';
    sr.ej.forEach((k, i) => {
      const e = BLOQUES.get(k);
      h += '<section class="sim-sec"><h3>Pregunta ' + (i + 2) + ' · ' + tx(e.titulo) + '</h3>' + hFuente(e.fuente) +
        '<details class="rev-en"><summary>Ver el enunciado</summary>' + hEnunciado(e) + '</details>';
      preguntasDe(e).forEach((it, j) => {
        const d = porId[it.id], q = it.ref, r = sr.r[it.id] || {};
        let tuya = 'sin responder', correcta;
        if (q.tipo === 'opcion') { if (d.resp) tuya = sinHtml(q.opciones[r.c]); correcta = sinHtml(q.opciones[q.correcta]); }
        else {
          if (d.resp) tuya = esc(r.t) + (q.signo && typeof r.s === 'number' ? ' (' + sinHtml(r.s === 1 ? q.signo.neg : q.signo.pos) + ')' : '') + (q.clasif && typeof r.c === 'number' ? ' · ' + sinHtml(q.clasif.opciones[r.c]) : '');
          correcta = M.formatear(q.respuesta, q) + (q.clasif ? ' · ' + sinHtml(q.clasif.opciones[q.clasif.correcta]) : '');
        }
        h += '<div class="rev ' + (d.ok ? 'ok' : 'mal') + '"><p class="rev-t">' + marca(d) + '<span><b>' + (j + 1) + '.</b> ' + tx(q.texto) + '</span>' + pts(d) + '</p>' +
          '<p>Tu respuesta: <b>' + tuya + '</b> · Correcta: <b>' + correcta + '</b></p>' +
          (d.ok && d.res && d.res.estado !== 'correcta' ? '<p class="nota-red">Tu respuesta también es válida.' + (d.res.alt && d.res.alt.nota ? ' ' + tx(d.res.alt.nota) : '') + '</p>' : '') +
          (!d.ok && d.res && d.res.estado === 'casi' ? '<p class="nota-red"><b>Casi, pero está mal.</b> ' + tx(textoCasi(d.res)) + '</p>' : '') +
          (!d.ok && d.res && d.res.estado === 'trampa' ? '<p><b>Qué pasó:</b> ' + tx(d.res.trampa.msg) + '</p>' : '') +
          (q.tipo === 'opcion' ? '<p class="suave">' + tx(q.porque) + '</p>' : hSol(q)) + '</div>';
      });
      h += '</section>';
    });
    return h;
  }
  function hSimulacro(b) {
    if (S.sim) return hSimEnCurso(b);
    const sr = S.simRes;
    const nVf = Array.from(ITEMS.values()).filter((it) => it.k === 'vf').length;
    let h = '<article class="bloque ancho sim"><p class="migas">Módulo 7 · Simulacro</p>';
    if (sr) {
      if (typeof sr.buenas !== 'number') { const c0 = corregirSimulacro(b, sr, false); sr.buenas = c0.det.filter((d) => d.ok).length; sr.total = c0.det.length; }
      const min = Math.max(1, Math.round(sr.seg / 60));
      const e = nErrores();
      h += '<h1 tabindex="-1">Resultado del simulacro</h1>' +
        '<div class="datos-cert"><div><span class="rot">Puntaje</span><b class="grande">' + sr.puntaje + ' / 100</b></div>' +
        '<div><span class="rot">Respuestas correctas</span><b class="grande">' + sr.buenas + ' de ' + sr.total + '</b><span class="suave">Verdadero o falso y ejercicios</span></div>' +
        '<div><span class="rot">Tiempo usado</span><b class="grande">' + min + ' min</b><span class="suave">de ' + b.minutos + (sr.agotado ? ' · se acabó el tiempo' : '') + '</span></div></div>' +
        '<div class="res-mod"><p>' + (sr.puntaje >= 85 ? '<b>Muy bien.</b> Estás al nivel del certamen; repasa solo lo que falló.' : sr.puntaje >= 55 ? '<b>Vas bien encaminado.</b> Lo que falló es justo lo que conviene repasar antes del certamen.' : '<b>Ya sabes dónde poner el esfuerzo.</b> Cada pregunta fallada trae abajo su desarrollo: revísalo y vuelve a intentarlo otro día.') + '</p>' +
        '<p>' + (e ? 'Lo que fallaste quedó en <a href="#/repaso/errores">Mis errores para repasar</a> (' + e + ' en total).' : 'No tienes errores pendientes.') + '</p></div>' +
        '<div class="acciones"><button type="button" class="btn principal" data-a="sim-iniciar">Hacer otro simulacro</button>' + (e ? '<a class="btn" href="#/repaso/errores">Repasar mis errores</a>' : '') + '</div>' +
        hSimRevision(b, sr);
    } else {
      h += '<h1 tabindex="-1">Simulacro final</h1>' +
        '<p>El formato probable del certamen (el de los certámenes anteriores), con tiempo y sin ayuda. Las preguntas salen mezcladas de todos los módulos, porque en el certamen hay que reconocer de qué tipo es cada problema.</p>' +
        '<div class="datos-cert"><div><span class="rot">Parte 1</span><b>' + b.vf.n + ' verdadero o falso</b><span class="suave">' + (b.vf.n * b.vf.puntos) + ' puntos, ' + b.vf.puntos + ' cada uno</span></div>' +
        '<div><span class="rot">Parte 2</span><b>' + b.areas.length + ' ejercicios</b><span class="suave">Presupuestos, costos y CVU · 4–5 preguntas, 20–25 puntos cada uno</span></div>' +
        '<div><span class="rot">Tiempo</span><b>' + b.minutos + ' minutos</b><span class="suave">Se puede pausar</span></div></div>' +
        '<ul><li>Durante el simulacro no hay pistas ni corrección: respondes todo y entregas, como en la prueba.</li>' +
        '<li>Al entregar ves tu puntaje de 0 a 100 y la revisión de cada pregunta con su desarrollo.</li>' +
        '<li>Ten a mano una calculadora simple y papel.</li></ul>';
      if (nVf < b.vf.n) h += '<div class="res-mod"><p>Todavía no hay suficientes preguntas cargadas para armar el simulacro.</p></div>';
      else h += '<div class="acciones"><button type="button" class="btn principal" data-a="sim-iniciar">Empezar simulacro →</button></div>';
    }
    return h + '<div id="zona-nav"></div></article>';
  }
  function tickSimulacro() {
    const b = VISTA.bloque;
    if (!S.sim || !b || b.tipo !== 'simulacro' || S.sim.pausa) return;
    const queda = b.minutos * 60 - simUsado(S.sim);
    const el = document.getElementById('sim-reloj');
    if (el) { el.textContent = mmss(queda); el.classList.toggle('poco', queda <= 300); }
    if (queda <= 0) entregarSimulacro(b, true);
  }
  function simContar() {
    const el = document.getElementById('sim-cta');
    if (!el || !S.sim) return;
    const its = simItems(S.sim);
    el.textContent = its.filter((it) => simRespondida(S.sim, it)).length + ' de ' + its.length + ' respondidas';
  }
  // Clics propios del simulacro. Devuelve true si atendió la acción.
  function clicSimulacro(a, el) {
    const b = VISTA.bloque;
    if (a === 'sim-iniciar') {
      if (S.simRes && !window.confirm('Se armará un simulacro nuevo y se cerrará la revisión del anterior. ¿Seguir?')) return true;
      S.simRes = null;
      S.sim = armarSimulacro(b);
      guardar(); pintar(); window.scrollTo(0, 0);
      return true;
    }
    if (!S.sim) return a.indexOf('sim-') === 0;
    if (a === 'sim-pausa') {
      if (S.sim.pausa) { S.sim.pausa = false; S.sim.t0 = Date.now(); }
      else { S.sim.acum = simUsado(S.sim); S.sim.t0 = null; S.sim.pausa = true; }
      guardar(); pintar();
      return true;
    }
    if (a === 'sim-entregar') { entregarSimulacro(b, false); return true; }
    const caja = el.closest('[data-s]');
    if (!caja) return false;
    const r = S.sim.r[caja.dataset.s] || (S.sim.r[caja.dataset.s] = {});
    const v = Number(el.dataset.v);
    const campo = a === 'sim-v' ? 'v' : a === 'sim-c' ? 'c' : a === 'sim-s' ? 's' : null;
    if (!campo) return false;
    r[campo] = r[campo] === v ? null : v; // tocar de nuevo deja sin responder
    el.parentElement.querySelectorAll('[data-a="' + a + '"]').forEach((x) => x.setAttribute('aria-pressed', String(Number(x.dataset.v) === r[campo])));
    guardarLuego(); simContar();
    return true;
  }

  function hFormulas(b) {
    let h = '<article class="bloque ancho formulas"><p class="migas">Módulo 8 · Fórmulas</p><h1 tabindex="-1">' + tx(b.titulo) + '</h1>' +
      '<p>' + tx(b.bajada) + '</p><div class="acciones no-imprimir"><button type="button" class="btn" data-a="imprimir">Imprimir la hoja</button></div><div class="hoja">';
    b.grupos.forEach((gr) => {
      h += '<section class="hoja-g"><h2>' + tx(gr.t) + '</h2><ul>' + gr.items.map((x) => '<li>' + tx(x) + '</li>').join('') + '</ul></section>';
    });
    h += '</div><p class="hoja-ley"><b>Abreviaturas:</b> ' + (b.leyenda || []).map((k) => '<span class="sin-ab"><b>' + esc(k) + '</b> ' + esc(AB[k] || '') + '</span>').join(' · ') +
      ' · <span><b>p</b> precio unitario</span> · <span><b>q</b> unidades</span> · <span><b>t</b> tasa de impuesto</span></p>';
    return h + '<div id="zona-nav"></div></article>';
  }

  // =====================================================================
  // Índice lateral y progreso
  // =====================================================================
  const EST_TXT = { n: 'sin ver', visto: 'visto', ok: 'correcto', err: 'con errores', parcial: 'a medias' };
  const EST_ICO = { n: '', visto: '✓', ok: '✓', err: '!', parcial: '…' };
  const abiertos = {};
  function hEst(b) {
    const e = estadoBloque(b);
    const inter = b.tipo === 'ejercicio' || b.tipo === 'vf' || b.tipo === 'mc';
    const txt = e === 'n' ? (inter ? 'sin intentar' : 'no visto') : EST_TXT[e];
    return '<span class="est ' + e + '" title="' + txt + '">' + EST_ICO[e] + '<span class="sr"> (' + txt + ')</span></span>';
  }
  function pintarIndice() {
    const act = VISTA.bloque;
    const e = nErrores();
    const rg = hRango();
    let h = '<div class="idx-cab"><b>Índice</b><button type="button" class="barra-btn" data-a="cerrar-idx" aria-label="Cerrar el índice">✕</button></div>' +
      '<a class="idx-rango' + (rg.global ? ' es-global' : '') + '" href="#/inicio/portada"><span class="rot">Tu rango</span><span class="con-ins">' + hInsigniaActual(30) + hNombreActual() + '</span><span class="pts">' + (rg.global ? '∞ pts' : M.num(S.pts, 0) + ' pts') + '</span>' +
      '<span class="idx-mini"><i style="width:' + rg.pct + '%"></i></span>' +
      '<small>' + (rg.global ? 'Tienes puntos infinitos' : rg.sig ? 'Te faltan ' + M.num(rg.falta, 0) + ' pts para ' + rg.sig : 'Llegaste al rango más alto') + '</small></a>' +
      '<a class="idx-esp" href="#/repaso/errores"' + (VISTA.esp === 'errores' ? ' aria-current="page"' : '') + '><span>Mis errores para repasar<small>Salen al acertarlos 2 veces en días distintos</small></span><span class="cuenta' + (e ? '' : ' cero') + '">' + e + '</span></a>' +
      '<a class="idx-esp" href="#/repaso/mixto"' + (VISTA.esp === 'mixto' ? ' aria-current="page"' : '') + '><span>Repaso mixto<small>10 preguntas al azar de lo ya visto</small></span></a>' +
      '<p class="idx-sep">Módulos</p>';
    MODS.forEach((mod) => {
      const prin = mod.bloques.filter((b) => b.rol !== 'extra');
      const listos = prin.filter(completo).length;
      const esActual = act && act.mod === mod;
      const abierto = abiertos[mod.id] !== undefined ? abiertos[mod.id] : esActual;
      h += '<details class="idx-mod' + (esActual ? ' actual' : '') + '" data-mod="' + mod.id + '"' + (abierto ? ' open' : '') + '><summary><span class="idx-n">' + mod.n + '</span><span>' + tx(mod.corto || mod.titulo) + '</span>' +
        '<span class="idx-cta">' + listos + '/' + prin.length + '</span>' +
        '<span class="idx-mini"><i style="width:' + (prin.length ? Math.round(100 * listos / prin.length) : 0) + '%"></i></span></summary>';
      {
        h += '<ul>';
        mod.bloques.forEach((b) => {
          h += '<li' + (b.rol === 'extra' ? ' class="extra"' : '') + '><a href="' + href(b) + '"' + (b === act ? ' aria-current="page"' : '') + '>' + hEst(b) +
            '<span>' + tx(b.titulo) + '<small>' + (b.teorica ? 'Lección · teórica, se puede saltar' : b.tipo === 'simulacro' ? (S.sim ? 'En curso' : (S.simRes ? 'Último: ' + S.simRes.puntaje + ' de 100 puntos' : 'Formato probable del certamen · 70 min')) : b.rol === 'extra' ? 'Ejercicio extra' : TIPO_TXT[b.tipo]) + (b.fuente && b.fuente.k === 'certamen' ? ' · C3 ' + b.fuente.sem + 'S-' + b.fuente.anio : '') + '</small></span></a></li>';
        });
        h += '</ul>';
      }
      h += '</details>';
    });
    h += '<div class="idx-pie"><p>Hoy: ' + S.ses.n + ' bloque' + (S.ses.n === 1 ? '' : 's') + ' avanzado' + (S.ses.n === 1 ? '' : 's') + (e ? ' · ' + e + ' para repasar' : '') + '.</p>' +
      '<button type="button" class="enlace" data-a="reiniciar">Reiniciar progreso</button></div>';
    const y = indice.scrollTop;
    indice.innerHTML = h;
    indice.scrollTop = y;
  }
  // Solo se recuerda lo que el estudiante abre o cierra a mano; el módulo actual se abre solo
  indice.addEventListener('click', (e) => {
    const sm = e.target.closest && e.target.closest('details[data-mod] > summary');
    if (sm) abiertos[sm.parentElement.dataset.mod] = !sm.parentElement.open;
  });
  function pintarProgreso() {
    const total = FLUJO.length;
    const listos = FLUJO.filter(completo).length;
    const pct = total ? Math.round(100 * listos / total) : 0;
    document.getElementById('prog-barra').style.width = pct + '%';
    document.getElementById('prog-txt').textContent = listos + ' de ' + total + ' · ' + pct + ' %';
    const rg = document.getElementById('rango-txt');
    if (rg) rg.innerHTML = hInsigniaActual(20) + hNombreActual() + ' · ' + (esGlobal() ? 'puntos infinitos' : M.num(S.pts, 0) + ' pts');
    document.body.classList.toggle('es-global', esGlobal());
  }

  // =====================================================================
  // Rutas (hash) y pintado
  // =====================================================================
  let VISTA = { bloque: null, esp: null };
  function leerRuta() {
    const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    if (p[0] === 'repaso') return { esp: p[1] === 'mixto' ? 'mixto' : 'errores' };
    if (p.length >= 2 && BLOQUES.has(p[0] + '/' + p[1])) return { bloque: BLOQUES.get(p[0] + '/' + p[1]) };
    if (p.length === 1) { const m = MODS.find((x) => x.id === p[0] && x.bloques.length); if (m) return { bloque: m.bloques[0] }; }
    return { bloque: FLUJO[0] };
  }
  function pintar() {
    U = new Map();
    ocultarTip();
    clearInterval(simReloj);
    const b = VISTA.bloque;
    if (VISTA.esp) app.innerHTML = SES ? hSesion() : (VISTA.esp === 'errores' ? hErrores() : hMixto());
    else {
      app.innerHTML = hBloque(b);
      if (!S.vistos[b.key]) { S.vistos[b.key] = 1; marcarAvance(b); }
      if (b.tipo !== 'portada') S.ult = b.key;
      guardar();
    }
    abreviar(app);
    restaurar();
    marcarScroll();
    if (b && b.tipo === 'simulacro' && S.sim && !S.sim.pausa) { simReloj = setInterval(tickSimulacro, 1000); tickSimulacro(); }
    if (b) refrescarBloque();
    pintarIndice();
    pintarProgreso();
    document.title = (b ? sinHtml(b.titulo) : (VISTA.esp === 'mixto' ? 'Repaso mixto' : 'Mis errores para repasar')) + ' · Estudio ICOFI interactivo';
  }
  // Avisa cuando una tabla no cabe a lo ancho y hay que deslizarla
  function marcarScroll() {
    app.querySelectorAll('.tabla-scroll').forEach((el) => el.classList.toggle('con-scroll', el.scrollWidth > el.clientWidth + 4));
  }
  window.addEventListener('resize', marcarScroll);
  function irA() {
    const r = leerRuta();
    const cambio = r.bloque !== VISTA.bloque || r.esp !== VISTA.esp;
    VISTA = { bloque: r.bloque || null, esp: r.esp || null };
    if (cambio) SES = null;
    pintar();
    document.body.classList.remove('idx-abierto');
    document.getElementById('btn-indice').setAttribute('aria-expanded', String(!esMovil() && !document.body.classList.contains('sin-indice')));
    window.scrollTo(0, 0);
    const enIndice = indice.querySelector('[aria-current]');
    if (enIndice && enIndice.scrollIntoView) enIndice.scrollIntoView({ block: 'nearest' });
    const h1 = app.querySelector('h1');
    if (h1 && cambio) { try { h1.focus({ preventScroll: true }); } catch (e) { /* nada */ } }
  }
  const esMovil = () => window.matchMedia('(max-width: 959px)').matches;

  // =====================================================================
  // Eventos
  // =====================================================================
  function unidadDe(el) {
    const caja = el.closest('[data-u]');
    return caja ? U.get(caja.dataset.u) : null;
  }
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el) {
      if (e.target.id === 'velo') document.body.classList.remove('idx-abierto');
      return;
    }
    const a = el.dataset.a;
    const u = unidadDe(el);
    if (a.indexOf('sim-') === 0) { clicSimulacro(a, el); return; }
    if (a === 'imprimir') { window.print(); return; }
    if (a === 'revisar' && u) revisarPreg(u);
    else if (a === 'pista' && u) verPista(u);
    else if (a === 'sol' && u) verSolucion(u, false);
    else if (a === 'sol-si' && u) verSolucion(u, true);
    else if (a === 'sol-no' && u) { const fb = cajaDe(u).querySelector('.fb'); fb.className = 'fb'; fb.innerHTML = ''; const i = cajaDe(u).querySelector('input'); if (i) i.focus(); }
    else if (a === 'clasif' && u) {
      const d = borr(u);
      d.c = Number(el.dataset.v);
      el.parentElement.querySelectorAll('[data-a="clasif"]').forEach((b, i) => { b.setAttribute('aria-pressed', String(i === d.c)); b.classList.remove('ok', 'mal'); });
      guardar();
    } else if (a === 'signo' && u) {
      const d = borr(u);
      d.s = Number(el.dataset.v);
      el.parentElement.querySelectorAll('[data-a="signo"]').forEach((b, i) => b.setAttribute('aria-pressed', String(i === d.s)));
      guardar();
    } else if (a === 'fila' && u) revisarTabla(u, el.dataset.f);
    else if (a === 'tabla-todo' && u) revisarTabla(u, null);
    else if (a === 'tabla-reset' && u) reiniciarTabla(u);
    else if (a === 'vf' && u) responderVF(u, Number(el.dataset.v));
    else if (a === 'mc' && u) responderMC(u, Number(el.dataset.v));
    else if (a === 'otra-ronda') {
      const b = VISTA.bloque, r = ronda(b);
      S.r[b.key + '@ronda'] = (r.i + 1) % r.total;
      ronda(b).items.forEach((it) => { delete S.r[it.id]; });
      guardar(); pintar(); window.scrollTo(0, 0);
    } else if (a === 'reintentar-ronda') {
      ronda(VISTA.bloque).items.forEach((it) => { delete S.r[it.id]; });
      guardar(); pintar(); window.scrollTo(0, 0);
    } else if (a === 'errores-iniciar') { iniciarSesion('errores'); window.scrollTo(0, 0); }
    else if (a === 'mixto-iniciar') { iniciarSesion('mixto'); window.scrollTo(0, 0); }
    else if (a === 'ses-sig') { SES.i++; pintar(); window.scrollTo(0, 0); const h1 = app.querySelector('h1'); if (h1) { try { h1.focus({ preventScroll: true }); } catch (err) { /* nada */ } } }
    else if (a === 'ses-fin') { SES = null; pintar(); window.scrollTo(0, 0); }
    else if (a === 'cerrar-idx') document.body.classList.remove('idx-abierto');
    else if (a === 'reiniciar') {
      if (window.confirm('¿Reiniciar todo tu progreso? Se borran tus respuestas, tu avance y tu lista de errores. No se puede deshacer.')) {
        S = VACIO(); S.dias = [hoy()]; S.ses = { dia: hoy(), n: 0 };
        guardar(); SES = null;
        if (location.hash && location.hash !== '#/') location.hash = '#/'; else irA();
      }
    }
  });
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('.insignia, #rango-txt');
    if (!t) return;
    if (t.closest('a')) e.preventDefault(); // en la tarjeta del índice, tocar la insignia no navega
    tocarInsignia();
  });
  // Al tocar una abreviatura en celular se muestra su significado; tocar fuera lo cierra
  document.addEventListener('click', (e) => {
    const a = e.target.closest('abbr.ab');
    if (a) mostrarTip(a); else ocultarTip();
  });

  // Puntos de miles mientras se escribe un monto entero (solo si el estudiante no puso separadores a mano)
  function autoMiles(inp, ev) {
    const t = inp.dataset.t;
    if (t !== 'pesos' && t !== 'unidades') return;
    if (!inp.value) { delete inp.dataset.manual; return; }
    if (ev && (ev.data === '.' || ev.data === ',' || ev.inputType === 'insertFromPaste')) inp.dataset.manual = '1';
    if (inp.dataset.manual || !/^\d[\d.]*$/.test(inp.value) || inp.selectionStart !== inp.value.length) return;
    inp.value = inp.value.replace(/\./g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  app.addEventListener('input', (e) => {
    const inp = e.target;
    if (!inp.matches || !inp.matches('.campo input')) return;
    autoMiles(inp, e);
    const enSim = inp.closest('[data-s]');
    if (enSim && S.sim) {
      (S.sim.r[enSim.dataset.s] || (S.sim.r[enSim.dataset.s] = {})).t = inp.value;
      guardarLuego(); simContar();
      return;
    }
    const u = unidadDe(inp);
    if (!u) return;
    const campo = inp.closest('.campo');
    campo.classList.remove('ok', 'mal');
    const d = borr(u);
    if (u.k === 'tabla') {
      d.c = d.c || {}; d.c[inp.dataset.c] = inp.value;
      if (d.e) delete d.e[inp.dataset.c];
      const nota = inp.closest('td').querySelector('.c-fb');
      nota.textContent = '';
      pintarCuadre(u);
    } else { d.t = inp.value; d.e = 0; }
    if (u.modo === 'flujo') guardarLuego();
  });
  let tGuardar = 0;
  function guardarLuego() { clearTimeout(tGuardar); tGuardar = setTimeout(guardar, 400); }
  app.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.matches || !e.target.matches('.campo input')) return;
    const u = unidadDe(e.target);
    if (!u) return;
    e.preventDefault();
    if (u.k === 'tabla') revisarTabla(u, e.target.dataset.f); else revisarPreg(u);
  });

  document.getElementById('btn-indice').addEventListener('click', () => {
    if (esMovil()) {
      document.body.classList.toggle('idx-abierto');
      // Al abrir el índice en celular, deja a la vista el bloque en que estás
      const actual = indice.querySelector('[aria-current]');
      if (actual && document.body.classList.contains('idx-abierto')) indice.scrollTop = Math.max(0, actual.offsetTop - indice.clientHeight / 2);
    } else document.body.classList.toggle('sin-indice');
    document.getElementById('btn-indice').setAttribute('aria-expanded', String(esMovil() ? document.body.classList.contains('idx-abierto') : !document.body.classList.contains('sin-indice')));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { document.body.classList.remove('idx-abierto'); ocultarTip(); } });
  window.addEventListener('hashchange', irA);
  window.addEventListener('pagehide', guardar);

  irA();
})();
