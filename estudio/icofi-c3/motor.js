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

  // ---------- Regla de corrección: tolerancia 0 ----------
  // Solo vale la respuesta exacta de la pauta del certamen (o de la resolución del profesor en los talleres).
  // Si la pauta entrega dos valores ("$ X o $ Y"), también vale el segundo: va en "tambien" con pauta: true
  // o equivalente: true. Lo que queda cerca NO se acepta: se marca como "casi" y se explica la diferencia.

  function iguales(a, b) {
    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  }

  // Zona "casi": qué tan cerca debe estar un valor equivocado para avisar que casi acierta.
  function tolerancia(q) {
    var tipo = q.tipo || 'pesos';
    var r = Math.abs(q.respuesta);
    if (tipo === 'unitario') return Math.max(0.05, 0.005 * r);
    if (tipo === 'porcentaje') return 0.5;
    if (tipo === 'razon') return 0.005;
    return Math.max(1, 0.005 * r);
  }

  // Margen para reconocer una trampa escrita por el estudiante.
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

  // Resultado: { estado, valor, alt, casi, trampa }
  // estado: 'vacia' | 'invalida' | 'correcta' | 'alternativa' | 'casi' | 'trampa' | 'incorrecta'
  //   correcta     -> exactamente el valor de la pauta
  //   alternativa  -> el otro valor que la misma pauta acepta
  //   casi         -> cerca, pero mal: un valor listado en "casi" (con su explicación) o dentro de la zona "casi"
  function corregir(q, texto) {
    var L = leer(texto);
    if (L.vacio) return { estado: 'vacia' };
    if (L.guion) {
      // Un guion significa "nada" (0): correcto solo si la respuesta es 0 y la celda admite guion
      if (q.guion && q.respuesta === 0) return { estado: 'correcta', valor: 0 };
      L = { ok: true, cands: [0], pct: false };
    }
    if (!L.ok) return { estado: 'invalida' };
    var cs = candidatos(q, L);
    var i, j;
    for (i = 0; i < cs.length; i++) {
      if (iguales(cs[i], q.respuesta)) return { estado: 'correcta', valor: cs[i] };
    }
    var deLaPauta = (q.tambien || []).filter(function (a) { return a.pauta || a.equivalente; });
    for (j = 0; j < deLaPauta.length; j++) {
      for (i = 0; i < cs.length; i++) {
        if (iguales(cs[i], deLaPauta[j].valor)) return { estado: 'alternativa', valor: cs[i], alt: deLaPauta[j] };
      }
    }
    var casis = q.casi || [];
    for (j = 0; j < casis.length; j++) {
      for (i = 0; i < cs.length; i++) {
        if (iguales(cs[i], casis[j].valor)) return { estado: 'casi', valor: cs[i], casi: casis[j] };
      }
    }
    var trs = q.trampas || [];
    for (j = 0; j < trs.length; j++) {
      for (i = 0; i < cs.length; i++) {
        if (cerca(cs[i], trs[j].valor, margenValor(q, trs[j].valor))) return { estado: 'trampa', valor: cs[i], trampa: trs[j] };
      }
    }
    var zona = tolerancia(q);
    for (i = 0; i < cs.length; i++) {
      if (cerca(cs[i], q.respuesta, zona)) return { estado: 'casi', valor: cs[i] };
    }
    return { estado: 'incorrecta', valor: cs[0] };
  }

  function esAcierto(estado) {
    return estado === 'correcta' || estado === 'alternativa';
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
    iguales: iguales,
    margenValor: margenValor,
    corregir: corregir,
    esAcierto: esAcierto
  };
})(typeof window !== 'undefined' ? window : globalThis);
