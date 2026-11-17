// Motor de las animaciones: crea el lienzo, los controles, las lecturas, el mini-gráfico y el
// ciclo de dibujo de cada animación. Cada animación (anim-*.js) se registra en window.SIMS con:
//   controls: [{ type: 'slider'|'toggle'|'check'|'button', key, label, ... }]
//   init(st)            estado inicial (también al reiniciar)
//   layout(st)          posiciones que dependen del tamaño (st.V = { w: 160|120, h: 90 })
//   step(st, dt)        avanza la física dt segundos
//   draw(g, st)         dibuja en coordenadas virtuales (st.V.w × 90)
//   readouts(st)        [[etiqueta, valor, color?], ...]
//   idea(st)            texto de la idea clave (opcional, si cambia según el estado)
//   plot                { series: [{ key, label, color, dash, max }], span } con sample(st),
//                       o { custom: true, legend: [[texto, color]] } con drawPlot(g, w, h, st)
//   pointer             { hit(st,x,y), down(st,x,y), move(st,x,y), up(st), tap(st,x,y) }
//   html(box, st, api)  contenido HTML extra sobre el lienzo (opcional)
(function () {
  'use strict';

  // Paleta en modo oscuro (los tonos de la especificación, aclarados para que se lean sobre gris oscuro)
  const COL = {
    I: '#f87171',        // corriente
    B: '#60a5fa',        // campo magnético
    E: '#fb923c',        // campo eléctrico
    ind: '#4ade80',      // corriente / fem inducida
    F: '#c084fc',        // fuerza
    flux: 'rgba(251, 146, 60, 0.20)',
    txt: '#f1f3f5',
    dim: '#a3a9af',
    tenue: 'rgba(255, 255, 255, 0.10)',
    alambre: '#cbd5e1',
    metal: '#6b7280',
    N: '#ef4444',
    S: '#3b82f6',
    gamma: '#86efac',
    ok: '#4ade80',
    mal: '#f87171',
    oro: '#e9d58f',
  };
  const TAU = Math.PI * 2;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function fmt(v, d = 2) {
    if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞';
    const s = Math.abs(v) < 0.5 * Math.pow(10, -d) ? (0).toFixed(d) : v.toFixed(d);
    return s.replace('-', '−').replace('.', ',');
  }
  // Número con prefijo (k, M, m, μ, n): fmtSI(0.0042, 'H') → "4,20 mH"
  function fmtSI(v, unidad, d = 2) {
    if (!Number.isFinite(v)) return '∞ ' + unidad;
    const a = Math.abs(v);
    const pre = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'μ'], [1e-9, 'n']];
    if (a === 0) return '0 ' + unidad;
    for (const [f, p] of pre) if (a >= f * 0.9995) return fmt(v / f, d) + ' ' + p + unidad;
    return fmt(v / 1e-9, d) + ' n' + unidad;
  }

  // ---- utilidades de dibujo (coordenadas virtuales) ----
  const D = {
    esc: 1,
    line(g, x1, y1, x2, y2, c, w = 0.4, dash) {
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2);
      g.strokeStyle = c; g.lineWidth = w; g.setLineDash(dash || []); g.stroke(); g.setLineDash([]);
    },
    poly(g, pts, c, w = 0.4, cerrar = false, dash) {
      if (pts.length < 2) return;
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      if (cerrar) g.closePath();
      g.strokeStyle = c; g.lineWidth = w; g.setLineDash(dash || []); g.stroke(); g.setLineDash([]);
    },
    arrow(g, x1, y1, x2, y2, c, w = 0.5, head) {
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      if (L < 0.08) return;
      const h = Math.min(head || Math.max(1.5, w * 3.4), L * 0.7);
      const ux = dx / L, uy = dy / L;
      const bx = x2 - ux * h, by = y2 - uy * h;
      g.strokeStyle = c; g.fillStyle = c; g.lineWidth = w; g.setLineDash([]);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(bx + ux * 0.2, by + uy * 0.2); g.stroke();
      g.beginPath(); g.moveTo(x2, y2);
      g.lineTo(bx - uy * h * 0.48, by + ux * h * 0.48);
      g.lineTo(bx + uy * h * 0.48, by - ux * h * 0.48);
      g.closePath(); g.fill();
    },
    // Punta de flecha sola en (x, y) apuntando en el ángulo ang
    head(g, x, y, ang, c, h = 1.8) {
      const ux = Math.cos(ang), uy = Math.sin(ang);
      g.fillStyle = c; g.beginPath();
      g.moveTo(x + ux * h * 0.6, y + uy * h * 0.6);
      g.lineTo(x - ux * h * 0.4 - uy * h * 0.5, y - uy * h * 0.4 + ux * h * 0.5);
      g.lineTo(x - ux * h * 0.4 + uy * h * 0.5, y - uy * h * 0.4 - ux * h * 0.5);
      g.closePath(); g.fill();
    },
    circ(g, x, y, r, fill, stroke, w = 0.4) {
      g.beginPath(); g.arc(x, y, Math.max(0.01, r), 0, TAU);
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = w; g.setLineDash([]); g.stroke(); }
    },
    ellipse(g, x, y, rx, ry, fill, stroke, w = 0.4, a0 = 0, a1 = TAU, dash) {
      g.beginPath(); g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), 0, a0, a1);
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = w; g.setLineDash(dash || []); g.stroke(); g.setLineDash([]); }
    },
    // ⊙ sale de la pantalla
    sale(g, x, y, r, c, w = 0.35) {
      D.circ(g, x, y, r, 'rgba(0,0,0,0.25)', c, w);
      D.circ(g, x, y, r * 0.3, c);
    },
    // ⊗ entra a la pantalla
    entra(g, x, y, r, c, w = 0.35) {
      D.circ(g, x, y, r, 'rgba(0,0,0,0.25)', c, w);
      const k = r * 0.62;
      g.beginPath(); g.moveTo(x - k, y - k); g.lineTo(x + k, y + k); g.moveTo(x + k, y - k); g.lineTo(x - k, y + k);
      g.strokeStyle = c; g.lineWidth = w; g.stroke();
    },
    // Texto: s es el tamaño en unidades virtuales; en pantalla queda entre 10,5 y 19 px
    txt(g, s, x, y, o = {}) {
      const px = clamp((o.s || 3.2) * D.esc, o.min || 10.5, o.max || 19);
      g.font = `${o.w || 600} ${px / D.esc}px Inter, system-ui, sans-serif`;
      g.textAlign = o.a || 'center'; g.textBaseline = o.b || 'middle';
      if (o.fondo) {
        const m = g.measureText(s), pw = m.width + 1.6, ph = px / D.esc * 1.35;
        const bx = o.a === 'left' ? x - 0.8 : o.a === 'right' ? x - pw + 0.8 : x - pw / 2;
        g.fillStyle = o.fondo; D.rr(g, bx, y - ph / 2, pw, ph, 1); g.fill();
      }
      g.fillStyle = o.c || COL.txt; g.fillText(s, x, y);
    },
    rr(g, x, y, w, h, r) {
      r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
      g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
      g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
      g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath();
    },
    glow(g, x, y, r, c, a = 1) {
      if (a <= 0.01) return;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, c.replace('A', String(0.55 * a)));
      gr.addColorStop(1, c.replace('A', '0'));
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    },
    // Ampolleta: brillo de 0 a 1
    bulb(g, x, y, r, brillo) {
      brillo = clamp(brillo, 0, 1);
      D.glow(g, x, y, r * 3.2, 'rgba(255, 220, 120, A)', brillo);
      const vidrio = `rgba(${Math.round(lerp(90, 255, brillo))}, ${Math.round(lerp(96, 236, brillo))}, ${Math.round(lerp(104, 160, brillo))}, 0.95)`;
      D.circ(g, x, y, r, vidrio, 'rgba(255,255,255,0.5)', 0.3);
      g.fillStyle = '#9ca3af'; g.fillRect(x - r * 0.55, y + r * 0.85, r * 1.1, r * 0.75);
    },
    // Resorte/resistencia en zigzag entre dos puntos
    resistor(g, x1, y1, x2, y2, c, w = 0.45, n = 6) {
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, amp = 1.6;
      const pts = [[x1, y1], [x1 + ux * L * 0.2, y1 + uy * L * 0.2]];
      for (let i = 0; i < n; i++) {
        const f = 0.2 + 0.6 * (i + 0.5) / n, s = i % 2 ? -1 : 1;
        pts.push([x1 + ux * L * f - uy * amp * s, y1 + uy * L * f + ux * amp * s]);
      }
      pts.push([x1 + ux * L * 0.8, y1 + uy * L * 0.8], [x2, y2]);
      D.poly(g, pts, c, w);
    },
    // Puntitos que avanzan por una polilínea (pts) con un desfase "fase" (en unidades)
    puntos(g, pts, fase, sep, c, r = 0.55) {
      let acum = 0;
      const total = [];
      for (let i = 1; i < pts.length; i++) total.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const L = total.reduce((a, b) => a + b, 0);
      if (L <= 0) return;
      let s = ((fase % sep) + sep) % sep;
      g.fillStyle = c;
      let i = 0;
      for (; s < L; s += sep) {
        while (i < total.length - 1 && acum + total[i] < s) { acum += total[i]; i++; }
        const f = total[i] ? (s - acum) / total[i] : 0;
        const x = lerp(pts[i][0], pts[i + 1][0], f), y = lerp(pts[i][1], pts[i + 1][1], f);
        g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      }
    },
  };

  // Fórmulas con KaTeX si está disponible; si no, el texto tal cual
  function tex(el, src, display) {
    if (window.katex) {
      try { window.katex.render(src, el, { throwOnError: false, displayMode: !!display }); return; } catch (e) { /* sigue abajo */ }
    }
    el.textContent = src;
  }
  function texto(el, s) {
    if (window.renderMathInElement && s.indexOf('$') >= 0) {
      el.textContent = s;
      try {
        window.renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
      } catch (e) { /* queda el texto */ }
    } else el.textContent = s;
  }

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  let uid = 0;

  function crear(host, def, opciones = {}) {
    const root = el('div', 'sim');
    let htmlBox = null;
    if (def.html) { htmlBox = el('div', 'sim-html'); root.appendChild(htmlBox); }
    const stage = el('div', 'sim-stage');
    const cv = el('canvas', 'sim-canvas');
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Animación: ' + (opciones.titulo || ''));
    stage.appendChild(cv);
    const botones = el('div', 'sim-botones');
    const bPlay = el('button', 'sim-btn');
    bPlay.type = 'button';
    const bReset = el('button', 'sim-btn', '↺ Reiniciar');
    bReset.type = 'button';
    botones.append(bPlay, bReset);
    root.appendChild(stage);
    // Debajo del lienzo: lecturas a la izquierda y botones de reproducción a la derecha
    const barra = el('div', 'sim-barra');
    const reads = el('div', 'sim-reads');
    reads.setAttribute('aria-live', 'off');
    barra.append(reads, botones);
    root.appendChild(barra);
    let plot = null;
    if (def.plot) {
      const pw = el('div', 'sim-plot');
      const leg = el('div', 'sim-leg');
      const pc = el('canvas');
      pc.setAttribute('aria-hidden', 'true');
      pw.append(leg, pc);
      root.appendChild(pw);
      plot = { wrap: pw, cv: pc, g: pc.getContext('2d'), buf: [], w: 0, h: 0, esc: [] };
      const items = def.plot.series ? def.plot.series.map((s) => [s.label, s.color, s.dash]) : (def.plot.legend || []);
      items.forEach(([t, c, dash]) => {
        const it = el('span', 'sim-leg-item');
        const sw = el('i');
        sw.style.borderTopColor = c;
        if (dash) sw.style.borderTopStyle = 'dashed';
        const tx = el('span');
        texto(tx, t);
        it.append(sw, tx);
        leg.appendChild(it);
      });
    }
    const ctrls = el('div', 'sim-ctrls');
    root.appendChild(ctrls);
    const idea = el('p', 'sim-idea');
    root.appendChild(idea);
    host.appendChild(root);

    const g = cv.getContext('2d');
    const st = { t: 0, p: {}, V: { w: 160, h: 90 }, ancho: true, playing: false, ideaBase: opciones.idea || null };
    const api = {};
    (def.controls || []).forEach((c) => { if (c.key && c.value !== undefined) st.p[c.key] = c.value; });

    // ---- controles ----
    const controles = [];
    function cambio(key) {
      if (def.onParam) def.onParam(st, key, api);
      refrescar();
      invalidar();
    }
    function crearControl(c) {
      const box = el('div', 'sim-ctrl sim-' + c.type);
      if (c.type === 'slider') {
        const id = 'simc' + (++uid);
        const lab = el('label');
        lab.htmlFor = id;
        const nombre = el('span', 'sim-ctrl-name');
        texto(nombre, c.label);
        const val = el('span', 'sim-ctrl-val');
        lab.append(nombre, val);
        const inp = el('input');
        inp.type = 'range'; inp.id = id; inp.min = c.min; inp.max = c.max; inp.step = c.step || 'any';
        inp.value = st.p[c.key];
        inp.addEventListener('input', () => { st.p[c.key] = parseFloat(inp.value); if (c.onInput) c.onInput(st); cambio(c.key); });
        box.append(lab, inp);
        return { c, box, upd() {
          val.textContent = c.fmt ? c.fmt(st.p[c.key], st) : fmt(st.p[c.key], 1);
          if (document.activeElement !== inp) inp.value = st.p[c.key];
        } };
      }
      if (c.type === 'toggle') {
        const nombre = el('span', 'sim-ctrl-name');
        texto(nombre, c.label);
        const seg = el('div', 'sim-seg');
        seg.setAttribute('role', 'radiogroup');
        seg.setAttribute('aria-label', c.label.replace(/\$/g, ''));
        const btns = c.options.map(([v, t]) => {
          const b = el('button');
          b.type = 'button';
          b.setAttribute('role', 'radio');
          texto(b, t);
          b.addEventListener('click', () => { if (st.p[c.key] === v) return; st.p[c.key] = v; cambio(c.key); });
          seg.appendChild(b);
          return [v, b];
        });
        box.append(nombre, seg);
        return { c, box, upd() { btns.forEach(([v, b]) => { const on = st.p[c.key] === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); }); } };
      }
      if (c.type === 'check') {
        const b = el('button', 'sim-check');
        b.type = 'button';
        b.appendChild(el('span', 'sim-sw'));
        const t = el('span');
        texto(t, c.label);
        b.appendChild(t);
        b.addEventListener('click', () => { st.p[c.key] = !st.p[c.key]; cambio(c.key); });
        box.appendChild(b);
        return { c, box, upd() { b.setAttribute('aria-pressed', String(!!st.p[c.key])); b.classList.toggle('on', !!st.p[c.key]); } };
      }
      // botón
      const b = el('button', 'sim-btn2');
      b.type = 'button';
      texto(b, c.label);
      b.addEventListener('click', () => { c.onClick(st, api); refrescar(); invalidar(); });
      box.appendChild(b);
      let ultimo = c.label;
      return { c, box, upd() { if (c.labelFn) { const s = c.labelFn(st); if (s !== ultimo) { ultimo = s; texto(b, s); } } } };
    }
    (def.controls || []).forEach((c) => {
      const o = crearControl(c);
      if (c.wide) o.box.classList.add('sim-ctrl-ancho');
      controles.push(o);
      ctrls.appendChild(o.box);
    });
    if (!controles.length) ctrls.remove();
    function refrescar() {
      controles.forEach((o) => {
        o.upd();
        if (o.c.show) o.box.hidden = !o.c.show(st.p, st);
      });
    }
    api.refrescar = refrescar;
    api.invalidar = () => invalidar();
    api.limpiarGrafico = () => { if (plot) plot.buf = []; };
    api.pausar = () => setPlaying(false);
    api.st = st;

    // ---- tamaño ----
    let W = 0, H = 0, dpr = 1, esc = 1, iniciado = false;
    function medir() {
      const cw = stage.clientWidth;
      if (!cw) return;
      const angosto = cw < 600;
      const V = angosto ? { w: 120, h: 90 } : { w: 160, h: 90 };
      const maxH = Math.max(230, window.innerHeight * 0.72);
      let w = cw, h = w * V.h / V.w;
      if (h > maxH) { h = maxH; w = h * V.w / V.h; }
      dpr = Math.min(2.5, window.devicePixelRatio || 1);
      cv.style.width = w + 'px';
      cv.style.height = h + 'px';
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      W = w; H = h; esc = w / V.w;
      const cambioV = V.w !== st.V.w || !iniciado;
      st.V = V; st.ancho = !angosto;
      if (!iniciado) { iniciado = true; if (def.init) def.init(st, api); }
      if (cambioV && def.layout) def.layout(st);
      if (plot) {
        const pw = plot.wrap.clientWidth || w;
        const ph = angosto ? 112 : 128;
        plot.w = pw; plot.h = ph;
        plot.cv.style.width = pw + 'px';
        plot.cv.style.height = ph + 'px';
        plot.cv.width = Math.round(pw * dpr);
        plot.cv.height = Math.round(ph * dpr);
      }
      dibujar();
    }

    // ---- gráfico ----
    function muestrear() {
      if (!plot || !def.plot.series) return;
      const s = def.sample(st);
      plot.buf.push([st.t].concat(def.plot.series.map((x) => s[x.key])));
      const span = def.plot.span || 6;
      while (plot.buf.length > 2 && plot.buf[0][0] < st.t - span - 0.5) plot.buf.shift();
    }
    function ejes(pg, w, h) {
      pg.fillStyle = 'rgba(0,0,0,0.18)';
      pg.fillRect(0, 0, w, h);
      pg.strokeStyle = 'rgba(255,255,255,0.18)';
      pg.lineWidth = 1;
      pg.beginPath(); pg.moveTo(0, h / 2 + 0.5); pg.lineTo(w, h / 2 + 0.5); pg.stroke();
    }
    function dibujarGrafico() {
      if (!plot || !plot.w) return;
      const pg = plot.g, w = plot.w, h = plot.h;
      pg.setTransform(dpr, 0, 0, dpr, 0, 0);
      pg.clearRect(0, 0, w, h);
      if (def.plot.custom) { def.drawPlot(pg, w, h, st); return; }
      ejes(pg, w, h);
      const span = def.plot.span || 6, t1 = Math.max(st.t, span), t0 = t1 - span;
      const series = def.plot.series;
      const compartida = def.plot.shared;
      let maxComp = 1e-9;
      if (compartida) plot.buf.forEach((r) => { for (let i = 1; i < r.length; i++) maxComp = Math.max(maxComp, Math.abs(r[i] || 0)); });
      series.forEach((s, i) => {
        let m = s.max;
        if (compartida) m = s.max || maxComp * 1.1;
        if (!m) {
          let mm = 0;
          plot.buf.forEach((r) => { mm = Math.max(mm, Math.abs(r[i + 1] || 0)); });
          m = mm > 1e-9 ? mm * 1.15 : 1;
        }
        pg.strokeStyle = s.color;
        pg.lineWidth = 2;
        pg.setLineDash(s.dash ? [6, 4] : []);
        pg.beginPath();
        let primero = true;
        plot.buf.forEach((r) => {
          if (r[0] < t0) return;
          const x = (r[0] - t0) / span * w;
          const y = h / 2 - clamp((r[i + 1] || 0) / m, -1.05, 1.05) * (h / 2 - 8);
          if (primero) { pg.moveTo(x, y); primero = false; } else pg.lineTo(x, y);
        });
        pg.stroke();
        pg.setLineDash([]);
      });
      pg.fillStyle = 'rgba(255,255,255,0.45)';
      pg.font = '11px Inter, system-ui, sans-serif';
      pg.textAlign = 'right';
      pg.fillText('t →', w - 6, h - 6);
    }

    // ---- dibujo ----
    let ultLect = '', ultIdea = null;
    function dibujar() {
      if (!W) return;
      D.esc = esc;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cv.width, cv.height);
      g.setTransform(dpr * esc, 0, 0, dpr * esc, 0, 0);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      def.draw(g, st);
      dibujarGrafico();
      if (def.readouts) {
        const r = def.readouts(st);
        const clave = r.map((x) => x.join('|')).join('§');
        if (clave !== ultLect) {
          ultLect = clave;
          if (reads.children.length !== r.length) {
            reads.textContent = '';
            r.forEach(() => { const s = el('span', 'sim-read'); s.append(el('span', 'sim-read-k'), el('span', 'sim-read-v')); reads.appendChild(s); });
          }
          r.forEach(([k, v, c], i) => {
            const s = reads.children[i];
            if (s.firstChild.textContent !== k) s.firstChild.textContent = k;
            s.lastChild.textContent = v;
            s.lastChild.style.color = c || '';
          });
        }
      }
      const tIdea = def.idea ? def.idea(st) : opciones.idea;
      if (tIdea !== ultIdea) { ultIdea = tIdea; texto(idea, tIdea || ''); idea.hidden = !tIdea; }
    }

    // ---- ciclo ----
    let raf = 0, last = 0, visible = true, vivo = true, activo = true, cuenta = 0;
    function programar() {
      if (!raf && vivo && activo && visible && !document.hidden) raf = requestAnimationFrame(cuadro);
    }
    function cuadro(now) {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (st.playing && dt > 0) {
        st.t += dt;
        if (def.step) def.step(st, dt, api);
        muestrear();
      }
      dibujar();
      if (++cuenta % 6 === 0) refrescar();
      if (st.playing) programar(); else last = 0;
    }
    function invalidar() {
      if (raf) return;
      if (st.playing) { programar(); return; }
      if (vivo && activo) { dibujar(); }
    }
    function setPlaying(on) {
      st.playing = on;
      bPlay.textContent = on ? '⏸ Pausar' : '▶ Reproducir';
      bPlay.setAttribute('aria-label', on ? 'Pausar animación' : 'Reproducir animación');
      last = 0;
      if (on) programar();
    }
    api.play = () => setPlaying(true);
    bPlay.addEventListener('click', () => setPlaying(!st.playing));
    bReset.addEventListener('click', () => {
      st.t = 0;
      if (def.init) def.init(st, api);
      if (def.layout) def.layout(st);
      if (plot) plot.buf = [];
      refrescar();
      invalidar();
    });

    // ---- arrastre ----
    if (def.pointer) {
      cv.classList.add('arrastrable');
      const P = def.pointer;
      let arr = false, x0 = 0, y0 = 0, movio = false;
      const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / esc, (e.clientY - r.top) / esc]; };
      cv.addEventListener('pointerdown', (e) => {
        const [x, y] = pos(e);
        x0 = x; y0 = y; movio = false;
        if (P.hit && P.hit(st, x, y)) {
          arr = true;
          if (P.down) P.down(st, x, y);
          try { cv.setPointerCapture(e.pointerId); } catch (er) { /* nada */ }
          cv.classList.add('arrastrando');
          invalidar();
        }
      });
      cv.addEventListener('pointermove', (e) => {
        const [x, y] = pos(e);
        if (Math.hypot(x - x0, y - y0) > 1.2) movio = true;
        if (arr) { if (P.move) P.move(st, x, y); refrescar(); invalidar(); return; }
        if (e.pointerType === 'mouse') cv.style.cursor = P.hit && P.hit(st, x, y) ? 'grab' : (P.tap ? 'crosshair' : '');
      });
      const fin = (e) => {
        const [x, y] = pos(e);
        if (arr) { arr = false; cv.classList.remove('arrastrando'); if (P.up) P.up(st); }
        else if (!movio && P.tap && e.type === 'pointerup') P.tap(st, x, y);
        refrescar();
        invalidar();
      };
      cv.addEventListener('pointerup', fin);
      cv.addEventListener('pointercancel', (e) => { arr = false; cv.classList.remove('arrastrando'); if (P.up) P.up(st); });
      // En celular la página sigue desplazándose con el dedo, salvo que se toque algo arrastrable
      cv.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        const r = cv.getBoundingClientRect();
        const x = (t.clientX - r.left) / esc, y = (t.clientY - r.top) / esc;
        if (P.hit && P.hit(st, x, y)) e.preventDefault();
      }, { passive: false });
    }

    // ---- visibilidad ----
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
      visible = es[es.length - 1].isIntersecting;
      if (visible) programar();
    }) : null;
    if (io) io.observe(stage);
    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => medir()) : null;
    if (ro) ro.observe(stage);
    else window.addEventListener('resize', medir);
    const alCambiarVis = () => { if (!document.hidden) programar(); };
    document.addEventListener('visibilitychange', alCambiarVis);

    if (def.html) def.html(htmlBox, st, api);
    medir();
    refrescar();
    setPlaying(!reduce.matches);

    return {
      root,
      activar(on) {
        activo = on;
        if (on) { last = 0; programar(); }
      },
      destruir() {
        vivo = false;
        if (raf) cancelAnimationFrame(raf);
        if (io) io.disconnect();
        if (ro) ro.disconnect(); else window.removeEventListener('resize', medir);
        document.removeEventListener('visibilitychange', alCambiarVis);
        root.remove();
      },
    };
  }

  window.Motor = { COL, D, TAU, clamp, lerp, fmt, fmtSI, tex, texto, el, crear, reducido: () => reduce.matches };
  window.SIMS = window.SIMS || {};
})();
