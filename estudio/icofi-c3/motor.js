// Motor de corrección de la guía ICOFI · Certamen 3.
// Lógica pura, sin interfaz: leer números en formato chileno, mostrarlos y corregir respuestas.
// Lo usa la página (window.ICOFI_MOTOR) y el script de verificación (globalThis.ICOFI_MOTOR).
(function (g) {
  'use strict';

  var EPS = 1e-9;

  // ---------- Mostrar números ----------

  // 1234567.5 -> "1.234.567,5" (punto de miles, coma decimal)
  function num(v, dec) {
    var neg = v < 0;
    var partes = Math.abs(v).toFixed(dec).split('.');
    var ent = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '−' : '') + ent + (partes[1] ? ',' + partes[1] : '');
  }

  // Cantidad mínima de decimales (hasta max) con la que el valor queda exacto.
  function decimales(v, max) {
    for (var d = 0; d < max; d++) {
      var p = Math.pow(10, d);
      if (Math.abs(v * p - Math.round(v * p)) < 1e-7) return d;
    }
    return max;
  }

  // Redondeo al entero más cercano; un ,5 sube (6.837,5 -> 6.838).
  function entero(v) {
    return Math.floor(v + 0.5 + EPS);
  }

  function redondear(v, dec) {
    var p = Math.pow(10, dec);
    return Math.floor(v * p + 0.5 + EPS) / p;
  }

  // Formato según el tipo de la pregunta. q = { tipo, unidad, moneda }.
  function formatear(v, q) {
    q = q || {};
    var tipo = q.tipo || 'pesos';
    var moneda = q.moneda || '$';
    if (tipo === 'pesos') {
      var e = entero(Math.abs(v));
      return (v < -0.5 ? '−' : '') + moneda + ' ' + num(e, 0);
    }
    if (tipo === 'unitario') {
      return (v < 0 ? '−' : '') + moneda + ' ' + num(Math.abs(v), decimales(v, 2));
    }
    if (tipo === 'unidades') {
      return num(v, decimales(v, 2)) + ' ' + (q.unidad || 'u');
    }
    if (tipo === 'porcentaje') {
      return num(v, decimales(v, 2)) + ' %';
    }
    if (tipo === 'razon') {
      var d = decimales(v, 5);
      return num(v, d < 2 ? 2 : d);
    }
    return num(v, decimales(v, 2)) + (q.unidad ? ' ' + q.unidad : '');
  }

  // Solo el número, sin símbolo ni unidad (para celdas de tabla y campos).
  function soloNumero(v, q) {
    q = q || {};
    var tipo = q.tipo || 'pesos';
    if (tipo === 'pesos') return num(entero(v), 0);
    if (tipo === 'razon') { var d = decimales(v, 5); return num(v, d < 2 ? 2 : d); }
    return num(v, decimales(v, 2));
  }

  // ---------- Leer lo que escribe el estudiante ----------

  // Devuelve { vacio } | { guion } | { ok:false } | { ok:true, cands:[...], pct }.
  // cands: lecturas posibles, la más probable primero (formato chileno primero).
  function leer(texto) {
    var s = String(texto == null ? '' : texto).replace(/[\s  ]/g, '');
    if (!s) return { vacio: true };
    if (/^[-–—−]+$/.test(s)) return { guion: true };
    var neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    var pct = s.indexOf('%') !== -1;
    // Fuera símbolos de moneda, unidades y letras: "$", "M$", "USD", "u", "kg", "%"...
    s = s.replace(/%/g, '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ$°º]+\.?/g, '');
    if (/^[-–—−]/.test(s)) { neg = !neg; s = s.replace(/^[-–—−]+/, ''); }
    if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return { ok: false };

    var puntos = (s.match(/\./g) || []).length;
    var comas = (s.match(/,/g) || []).length;
    var cands = [];
    var pos, ent, dec, ab;

    if (puntos && comas) {
      // El último separador es el decimal: 1.234,56 (o 1,234.56)
      pos = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
      var sep = s.charAt(pos);
      if ((sep === '.' ? puntos : comas) > 1) return { ok: false };
      ent = s.slice(0, pos).replace(/[.,]/g, '');
      dec = s.slice(pos + 1);
      cands.push(parseFloat((ent || '0') + '.' + (dec || '0')));
    } else if (comas === 1) {
      // Coma = decimal (formato chileno)
      ab = s.split(',');
      cands.push(parseFloat((ab[0] || '0') + '.' + (ab[1] || '0')));
    } else if (comas > 1) {
      if (!/^\d{1,3}(,\d{3})+$/.test(s)) return { ok: false };
      cands.push(parseFloat(s.replace(/,/g, '')));
    } else if (puntos === 1) {
      ab = s.split('.');
      var comoDecimal = parseFloat((ab[0] || '0') + '.' + (ab[1] || '0'));
      if (ab[1].length === 3 && ab[0].length >= 1 && ab[0].length <= 3 && !/^0+$/.test(ab[0])) {
        // 36.000 -> miles (formato chileno); 278.571 podría ser decimal: se prueba después
        cands.push(parseFloat(ab[0] + ab[1]));
        cands.push(comoDecimal);
      } else {
        // 278.6 -> un solo punto con 1-2 decimales: decimal
        cands.push(comoDecimal);
      }
    } else if (puntos > 1) {
      if (!/^\d{1,3}(\.\d{3})+$/.test(s)) return { ok: false };
      cands.push(parseFloat(s.replace(/\./g, '')));
    } else {
      cands.push(parseFloat(s));
    }
    for (var i = 0; i < cands.length; i++) {
      if (!isFinite(cands[i])) return { ok: false };
      if (neg) cands[i] = -cands[i];
    }
    return { ok: true, cands: cands, pct: pct };
  }

  // ---------- Tolerancias ----------

  // Margen dentro del cual la respuesta se considera "el valor exacto" (misma cifra mostrada).
  function margenExacto(q, valor) {
    var tipo = q.tipo || 'pesos';
    if (tipo === 'pesos') return 0.5;
    if (tipo === 'unitario') return 0.005;
    if (tipo === 'porcentaje') return 0.005;
    if (tipo === 'razon') return decimales(valor, 5) <= 2 ? 0.0005 : 0.000006;
    return 0;
  }

  // Tolerancia general (1.4): max(1; 0,5 %) para montos; propia para lo demás.
  function tolerancia(q) {
    if (typeof q.tolerancia === 'number') return q.tolerancia;
    var tipo = q.tipo || 'pesos';
    var r = Math.abs(q.respuesta);
    if (tipo === 'pesos') return Math.max(1, 0.005 * r);
    if (tipo === 'unitario') return Math.max(0.05, 0.005 * r);
    if (tipo === 'porcentaje') return 0.5;
    if (tipo === 'razon') return 0.005;
    return 0; // unidades y conteos: exacto
  }

  // Margen para reconocer una trampa o un valor alternativo escrito por el estudiante.
  function margenValor(q, valor) {
    var tipo = q.tipo || 'pesos';
    if (tipo === 'pesos') return Math.max(1, 0.0005 * Math.abs(valor));
    if (tipo === 'unitario') return 0.05;
    if (tipo === 'porcentaje') return 0.05;
    if (tipo === 'razon') return 0.0005;
    return 0;
  }

  // ---------- Corregir ----------

  // Lecturas posibles según el tipo: en porcentajes "0,7" = 70 %; en razones "70 %" = 0,70.
  function candidatos(q, L) {
    var tipo = q.tipo || 'pesos';
    var out = [];
    L.cands.forEach(function (c) {
      if (tipo === 'porcentaje') {
        out.push(c);
        if (!L.pct && Math.abs(c) <= 1 && c !== 0) out.push(c * 100);
      } else if (tipo === 'razon') {
        if (L.pct) out.push(c / 100);
        else { out.push(c); if (Math.abs(c) > 1) out.push(c / 100); }
      } else {
        out.push(c);
      }
    });
    return out;
  }

  function cerca(a, b, margen) {
    return Math.abs(a - b) <= margen + EPS;
  }

  // Resultado: { estado, valor, alt, trampa }
  // estado: 'vacia' | 'invalida' | 'correcta' | 'alternativa' | 'redondeo' | 'trampa' | 'incorrecta'
  //   correcta     -> el valor principal
  //   alternativa  -> un valor listado en "tambien" (se acepta, con su nota)
  //   redondeo     -> dentro de la tolerancia (se acepta, con nota de redondeo)
  function corregir(q, texto) {
    var L = leer(texto);
    if (L.vacio) return { estado: 'vacia' };
    if (L.guion) {
      if (q.guion) return { estado: 'correcta', valor: 0 };
      return { estado: 'invalida' };
    }
    if (!L.ok) return { estado: 'invalida' };
    var cs = candidatos(q, L);
    var i, j;
    for (i = 0; i < cs.length; i++) {
      if (cerca(cs[i], q.respuesta, margenExacto(q, q.respuesta))) return { estado: 'correcta', valor: cs[i] };
    }
    var alts = q.tambien || [];
    for (j = 0; j < alts.length; j++) {
      for (i = 0; i < cs.length; i++) {
        if (cerca(cs[i], alts[j].valor, margenValor(q, alts[j].valor))) return { estado: 'alternativa', valor: cs[i], alt: alts[j] };
      }
    }
    var tol = tolerancia(q);
    for (i = 0; i < cs.length; i++) {
      if (cerca(cs[i], q.respuesta, tol)) return { estado: 'redondeo', valor: cs[i] };
    }
    var trs = q.trampas || [];
    for (j = 0; j < trs.length; j++) {
      for (i = 0; i < cs.length; i++) {
        if (cerca(cs[i], trs[j].valor, margenValor(q, trs[j].valor))) return { estado: 'trampa', valor: cs[i], trampa: trs[j] };
      }
    }
    return { estado: 'incorrecta', valor: cs[0] };
  }

  function esAcierto(estado) {
    return estado === 'correcta' || estado === 'alternativa' || estado === 'redondeo';
  }

  // Nota en escala chilena: 1 + 6·puntaje/100, con un decimal.
  function nota(puntaje) {
    return redondear(1 + 6 * puntaje / 100, 1);
  }

  g.ICOFI_MOTOR = {
    num: num,
    decimales: decimales,
    entero: entero,
    redondear: redondear,
    formatear: formatear,
    soloNumero: soloNumero,
    leer: leer,
    tolerancia: tolerancia,
    margenExacto: margenExacto,
    margenValor: margenValor,
    corregir: corregir,
    esAcierto: esAcierto,
    nota: nota
  };
})(typeof window !== 'undefined' ? window : globalThis);
