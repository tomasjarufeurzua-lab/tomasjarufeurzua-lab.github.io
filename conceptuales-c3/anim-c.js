// Animaciones de las preguntas 17 a 20 (ley de Ampère).
// Corrientes rectas perpendiculares a la pantalla: I > 0 sale (⊙), I < 0 entra (⊗).
// En coordenadas del lienzo (y hacia abajo), el campo de una corriente que sale en el punto
// (dx, dy) relativo al alambre es B = I/(2π r²)·(dy, −dx): da vueltas en sentido antihorario.
(function () {
  'use strict';
  const { COL, D, TAU, clamp, lerp, fmt, fmtSI, wrapIdea } = window.Motor;
  const S = window.SIMS;

  function campo(alambres, x, y) {
    let bx = 0, by = 0;
    for (const w of alambres) {
      const dx = x - w.x, dy = y - w.y, r2 = dx * dx + dy * dy;
      if (r2 < 0.25) continue;
      const k = w.I / (TAU * r2);
      bx += k * dy; by -= k * dx;
    }
    return [bx, by];
  }
  function simbolo(g, w, r, apagado) {
    const c = apagado ? 'rgba(248,113,113,0.3)' : COL.I;
    (w.I >= 0 ? D.sale : D.entra)(g, w.x, w.y, r, c, 0.45);
  }
  function flechasCampo(g, alambres, W, paso, ref, alfa = 0.55) {
    for (let x = paso / 2; x < W; x += paso) for (let y = paso / 2; y < 90; y += paso) {
      let near = false;
      for (const w of alambres) if (Math.hypot(x - w.x, y - w.y) < 2.6) near = true;
      if (near) continue;
      const [bx, by] = campo(alambres, x, y), m = Math.hypot(bx, by);
      if (m < 1e-9) continue;
      const L = clamp(Math.sqrt(m / ref) * paso * 0.45, 0.6, paso * 0.62);
      D.arrow(g, x - bx / m * L / 2, y - by / m * L / 2, x + bx / m * L / 2, y + by / m * L / 2, `rgba(96,165,250,${alfa})`, 0.25, 1);
    }
  }
  // ===================== 17. Mapa de campo de dos alambres =====================
  const CASOS = [[], [['L', 'B']], [['B', 'R']], [['L', 'R']], [['T', 'R']], [['L', 'T'], ['B', 'R']], [['T', 'B']], [['L', 'T']], [['L', 'T']], [['T', 'B']], [['T', 'R'], ['L', 'B']], [['T', 'R']], [['L', 'R']], [['B', 'R']], [['L', 'B']], []];
  function contornos(F, nx, ny, dx, dy, niveles) {
    const segs = [];
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const tl = F[j * nx + i], tr = F[j * nx + i + 1], br = F[(j + 1) * nx + i + 1], bl = F[(j + 1) * nx + i];
      const x = i * dx, y = j * dy;
      for (const L of niveles) {
        const c = (tl > L ? 8 : 0) | (tr > L ? 4 : 0) | (br > L ? 2 : 0) | (bl > L ? 1 : 0);
        if (!c || c === 15) continue;
        const e = (k) => {
          if (k === 'T') return [x + dx * (L - tl) / (tr - tl), y];
          if (k === 'B') return [x + dx * (L - bl) / (br - bl), y + dy];
          if (k === 'L') return [x, y + dy * (L - tl) / (bl - tl)];
          return [x + dx, y + dy * (L - tr) / (br - tr)];
        };
        CASOS[c].forEach(([a, b]) => segs.push([e(a), e(b)]));
      }
    }
    return segs;
  }
  S['dos-alambres'] = {
    controls: [
      { type: 'toggle', key: 'sentido', label: 'Corrientes', value: 'mismo', options: [['mismo', 'Mismo sentido'], ['opuesto', 'Sentidos opuestos']] },
      { type: 'slider', key: 'I1', label: '$I_1$', min: 0.5, max: 3, step: 0.1, value: 1.5, fmt: (v) => fmt(v, 1) + ' A' },
      { type: 'slider', key: 'I2', label: '$I_2$', min: 0.5, max: 3, step: 0.1, value: 1.5, fmt: (v) => fmt(v, 1) + ' A' },
      { type: 'slider', key: 'd', label: 'Separación $d$', min: 2, max: 10, step: 0.2, value: 6, fmt: (v) => fmt(v, 1) + ' cm' },
      { type: 'check', key: 'auto', label: 'Sonda automática', value: true },
    ],
    init(st) { st.cache = null; st.px = null; st.py = null; st.ph = 0; },
    layout(st) { st.cache = null; },
    onParam(st) { st.cache = null; },
    geo(st) {
      const W = st.V.w, cx = W / 2, cy = 42, dv = 10 + (st.p.d - 2) / 8 * W * 0.45;
      const s2 = st.p.sentido === 'mismo' ? 1 : -1;
      return { cx, cy, dv, al: [{ x: cx - dv / 2, y: cy, I: st.p.I1 }, { x: cx + dv / 2, y: cy, I: s2 * st.p.I2 }] };
    },
    calc(st) {
      if (st.cache) return st.cache;
      const W = st.V.w, { al } = this.geo(st), nx = 81, ny = 46, dx = W / (nx - 1), dy = 90 / (ny - 1);
      const A = new Float32Array(nx * ny), M = new Float32Array(nx * ny);
      let mmax = 0;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = i * dx, y = j * dy;
        let a = 0;
        for (const w of al) a -= w.I * Math.log(Math.max(0.6, Math.hypot(x - w.x, y - w.y)));
        A[j * nx + i] = a;
        const [bx, by] = campo(al, x, y), m = Math.hypot(bx, by);
        M[j * nx + i] = m; mmax = Math.max(mmax, m);
      }
      const ord = Array.from(A).sort((a, b) => a - b);
      const niveles = [];
      for (let k = 1; k <= 18; k++) niveles.push(ord[Math.floor(ord.length * (0.04 + 0.92 * k / 19))]);
      const segs = contornos(A, nx, ny, dx, dy, niveles);
      // Mapa de intensidad en una imagen chica que se escala suave
      const img = document.createElement('canvas');
      img.width = nx; img.height = ny;
      const ig = img.getContext('2d'), id = ig.createImageData(nx, ny);
      const ref = st.p.I1 / (TAU * 6);
      for (let k = 0; k < nx * ny; k++) {
        const t = clamp(Math.log(1 + M[k] / (ref * 0.08)) / Math.log(1 + 25), 0, 1);
        id.data[4 * k] = lerp(20, 147, t); id.data[4 * k + 1] = lerp(30, 197, t); id.data[4 * k + 2] = lerp(48, 253, t); id.data[4 * k + 3] = 150 * t;
      }
      ig.putImageData(id, 0, 0);
      st.cache = { segs, img };
      return st.cache;
    },
    step(st, dt) { if (st.p.auto) st.ph += dt; },
    sonda(st) {
      const { cx, cy, dv } = this.geo(st);
      if (st.p.auto || st.px === null) return [cx + dv / 2 * 0.86 * Math.sin(st.ph * 0.7), cy];
      return [st.px, st.py];
    },
    draw(g, st) {
      const W = st.V.w, c = this.calc(st), { al, cy, dv } = this.geo(st);
      g.imageSmoothingEnabled = true;
      g.drawImage(c.img, 0, 0, W, 90);
      g.strokeStyle = 'rgba(191,219,254,0.55)'; g.lineWidth = 0.3; g.beginPath();
      c.segs.forEach(([a, b]) => { g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); });
      g.stroke();
      D.line(g, 0, cy, W, cy, 'rgba(255,255,255,0.15)', 0.25, [1, 1]);
      al.forEach((w, i) => { simbolo(g, w, 2.6); D.tex(g, i ? '$I_2$' : '$I_1$', w.x, w.y - 5.5, { s: 2.8, c: COL.I }); });
      // Sonda
      const [sx, sy] = this.sonda(st);
      const b1 = campo([al[0]], sx, sy), b2 = campo([al[1]], sx, sy), bt = [b1[0] + b2[0], b1[1] + b2[1]];
      const ref = st.p.I1 / (TAU * dv / 2), k = 12 / ref;
      const cero = Math.hypot(bt[0], bt[1]) < 0.06 * ref;
      if (cero) D.glow(g, sx, sy, 8, 'rgba(74,222,128,A)', 1);
      const fl = (b, col, w) => { const L = Math.hypot(b[0], b[1]) * k, f = L > 20 ? 20 / L : 1; D.arrow(g, sx, sy, sx + b[0] * k * f, sy + b[1] * k * f, col, w); };
      fl(b1, 'rgba(147,197,253,0.8)', 0.35); fl(b2, 'rgba(196,181,253,0.8)', 0.35); fl(bt, '#fff', 0.6);
      D.circ(g, sx, sy, 1.3, cero ? COL.ok : COL.oro, '#000', 0.2);
      if (cero) D.tex(g, '¡$B = 0$!', sx, sy - 6, { s: 3, c: COL.ok, w: 700 });
      D.tex(g, '$\\vec B_1$', 4, 6, { s: 2.6, c: '#93c5fd', a: 'left' }); D.tex(g, '$\\vec B_2$', 12, 6, { s: 2.6, c: '#c4b5fd', a: 'left' }); D.tex(g, '$\\vec B$ total', 20, 6, { s: 2.6, a: 'left' });
      D.txt(g, 'Arrastra la sonda', W / 2, 87, { s: 2.4, c: COL.dim, min: 9 });
    },
    pointer: {
      hit(st, x, y) { const [sx, sy] = S['dos-alambres'].sonda(st); return Math.hypot(x - sx, y - sy) < 4.5; },
      down(st) { st.p.auto = false; },
      move(st, x, y) { st.px = clamp(x, 1, st.V.w - 1); st.py = clamp(y, 1, 89); },
    },
    readouts(st) {
      const { al } = this.geo(st), [sx, sy] = this.sonda(st);
      const b = campo(al, sx, sy), ref = st.p.I1 / (TAU * this.geo(st).dv / 2);
      return [['$|\\vec B|$ en la sonda', fmt(Math.hypot(b[0], b[1]) / ref, 2) + ' $B_0$'], ['Entre los alambres', st.p.sentido === 'mismo' ? 'hay un cero' : 'se suman: no hay cero', st.p.sentido === 'mismo' ? COL.ok : COL.E]];
    },
    plot: { custom: true, legend: [['$B_y(x)$ sobre la línea que une los alambres', COL.B], ['sonda', COL.oro]] },
    drawPlot(g, w, h, st) {
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, h);
      const W = st.V.w, { al, dv } = this.geo(st), ref = st.p.I1 / (TAU * dv / 2), mid = h / 2;
      const X = (x) => x / W * w, Y = (v) => mid - clamp(v / (3 * ref), -1, 1) * (mid - 6);
      g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, mid); g.lineTo(w, mid); g.stroke();
      al.forEach((a) => { g.setLineDash([3, 4]); g.beginPath(); g.moveTo(X(a.x), 2); g.lineTo(X(a.x), h - 2); g.stroke(); g.setLineDash([]); });
      g.strokeStyle = COL.B; g.lineWidth = 2; g.beginPath();
      let ant = null;
      for (let i = 0; i <= 300; i++) {
        const x = i / 300 * W;
        if (al.some((a) => Math.abs(x - a.x) < 0.8)) { ant = null; continue; }
        // B_y con y hacia arriba: Σ I/(2π (x − xi))
        const by = al.reduce((s, a) => s + a.I / (TAU * (x - a.x)), 0);
        if (ant === null) g.moveTo(X(x), Y(by)); else g.lineTo(X(x), Y(by));
        ant = by;
      }
      g.stroke();
      const [sx] = this.sonda(st);
      g.fillStyle = COL.oro; g.beginPath(); g.arc(X(sx), mid, 4, 0, TAU); g.fill();
    },
    idea(st) { return st.p.sentido === 'mismo' && Math.abs(st.p.I1 - st.p.I2) > 0.05 ? 'Con corrientes distintas, el cero se corre hacia el alambre con menos corriente.' : null; },
  };
  wrapIdea('dos-alambres');

  // ===================== 18. ¿Se puede despejar B? =====================
  function config21(st) {
    const W = st.V.w, cx = W * (st.ancho ? 0.4 : 0.5), cy = 44, cfg = st.p.cfg, al = [];
    let lazo;
    if (cfg === 'alambre') { al.push({ x: cx, y: cy, I: 1 }); lazo = { tipo: 'c', r: 18 }; }
    if (cfg === 'solenoide') {
      const n = st.ancho ? 22 : 18, Lh = st.ancho ? 50 : 42;
      for (let i = 0; i < n; i++) { const x = cx - Lh + i * 2 * Lh / (n - 1); al.push({ x, y: cy - 12, I: 1 }, { x, y: cy + 12, I: -1 }); }
      lazo = { tipo: 'r', w: 28, h: 26 };
    }
    if (cfg === 'toroide') {
      const n = 28, a = st.ancho ? 11 : 10, b = st.ancho ? 28 : 25;
      for (let i = 0; i < n; i++) { const t = i * TAU / n; al.push({ x: cx + a * Math.cos(t), y: cy + a * Math.sin(t), I: 1 }, { x: cx + b * Math.cos(t), y: cy + b * Math.sin(t), I: -1 }); }
      lazo = { tipo: 'c', r: (a + b) / 2 };
    }
    if (cfg === 'espira') { al.push({ x: cx, y: cy - 14, I: 1 }, { x: cx, y: cy + 14, I: -1 }); lazo = { tipo: 'c', r: 9 }; }
    return { cx, cy, al, lazo, cfg };
  }
  S['sirve-ampere'] = {
    controls: [
      { type: 'toggle', key: 'cfg', label: 'Configuración', value: 'alambre', wide: true, options: [['alambre', 'Alambre infinito'], ['solenoide', 'Solenoide'], ['toroide', 'Toroide'], ['espira', 'Espira circular'], ['finito', 'Alambre finito']] },
      { type: 'button', label: 'Volver a centrar el loop', onClick(st) { st.off = null; st.cache = null; } },
    ],
    init(st) { st.u = 0; st.off = null; st.cache = null; },
    layout(st) { st.off = null; st.cache = null; },
    onParam(st) { st.off = null; st.cache = null; },
    lazoPts(st, c) {
      const o = st.off || this.offDef(st, c), n = 200, P = [];
      if (c.lazo.tipo === 'c') for (let i = 0; i < n; i++) { const a = -i / n * TAU; P.push([o[0] + c.lazo.r * Math.cos(a), o[1] + c.lazo.r * Math.sin(a)]); }
      else {
        const { w, h } = c.lazo, x0 = o[0] - w / 2, y0 = o[1] - h / 2, per = 2 * (w + h);
        for (let i = 0; i < n; i++) {
          let s = i / n * per;
          if (s < w) P.push([x0 + w - s, y0]);
          else if ((s -= w) < h) P.push([x0, y0 + s]);
          else if ((s -= h) < w) P.push([x0 + s, y0 + h]);
          else { s -= w; P.push([x0 + w, y0 + h - s]); }
        }
      }
      return P;
    },
    offDef(st, c) {
      if (c.cfg === 'solenoide') return [c.cx, c.cy - 12];
      if (c.cfg === 'espira') return [c.cx, c.cy - 14];
      return [c.cx, c.cy];
    },
    calc(st) {
      if (st.cache) return st.cache;
      const c = config21(st);
      if (c.cfg === 'finito') { st.cache = { c, finito: true }; return st.cache; }
      const P = this.lazoPts(st, c), n = P.length, mag = [], ang = [], bt = [];
      for (let i = 0; i < n; i++) {
        const a = P[i], b = P[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
        const [bx, by] = campo(c.al, a[0], a[1]), m = Math.hypot(bx, by);
        mag.push(m); bt.push((bx * tx + by * ty) / tl);
        ang.push(m < 1e-9 ? 90 : Math.acos(clamp((bx * tx + by * ty) / (tl * m), -1, 1)) * 180 / Math.PI);
      }
      const mmax = Math.max(...mag, 1e-9);
      let ok;
      if (c.lazo.tipo === 'c') {
        const media = mag.reduce((a, b) => a + b, 0) / n;
        const cv = Math.sqrt(mag.reduce((a, b) => a + (b - media) ** 2, 0) / n) / media;
        ok = cv < 0.04 && Math.max(...ang) < 6;
      } else {
        // Rectángulo: cada lado debe tener B paralelo y constante, B perpendicular o B ≈ 0
        const lados = [[], [], [], []], { w, h } = c.lazo, per = 2 * (w + h);
        for (let i = 0; i < n; i++) { const s = i / n * per; lados[s < w ? 0 : s < w + h ? 1 : s < 2 * w + h ? 2 : 3].push(i); }
        const [bx0, by0] = campo(c.al, c.cx, c.cy), bin = Math.hypot(bx0, by0);
        ok = lados.every((idx) => {
          const ms = idx.map((i) => mag[i]), ts = idx.map((i) => Math.abs(bt[i]));
          if (Math.max(...ms) < 0.08 * bin) return true;
          if (Math.max(...ts) < 0.08 * bin) return true;
          const media = ms.reduce((a, b) => a + b, 0) / ms.length;
          return Math.max(...idx.map((i) => Math.min(ang[i], 180 - ang[i]))) < 8 && Math.max(...ms.map((m) => Math.abs(m - media))) < 0.06 * media;
        });
      }
      st.cache = { c, P, mag, ang, mmax, ok };
      return st.cache;
    },
    step(st, dt) { st.u = (st.u + dt / 5) % 1; },
    draw(g, st) {
      const W = st.V.w, k = this.calc(st), c = k.c;
      if (k.finito) {
        const x0 = c.cx - 24, x1 = c.cx + 24;
        D.line(g, x0, c.cy, x1, c.cy, COL.alambre, 1);
        D.puntos(g, [[x0, c.cy], [x1, c.cy]], st.t * 8, 4, COL.I, 0.55);
        D.circ(g, x0, c.cy, 1, COL.alambre); D.circ(g, x1, c.cy, 1, COL.alambre);
        const xl = st.off ? st.off[0] : c.cx + 14, r = 11;
        D.ellipse(g, xl, c.cy, r * 0.3, r, null, COL.gamma, 0.6);
        const a = -st.u * TAU, px = xl + 0.3 * r * Math.sin(a), py = c.cy - r * Math.cos(a);
        D.circ(g, px, py, 1, COL.oro);
        D.txt(g, '↔ arrastra el loop', xl, c.cy + r + 4, { s: 2.4, c: COL.dim, min: 9 });
        D.tex(g, '❌ La simetría no basta: $B$ en el loop no es $\\mu_0 I/2\\pi r$', W / 2, 6, { s: 2.8, c: COL.mal, fondo: 'rgba(0,0,0,0.45)', w: 700 });
        return;
      }
      flechasCampo(g, c.al, W, 7, c.cfg === 'solenoide' || c.cfg === 'toroide' ? 0.05 : 0.008, 0.5);
      c.al.forEach((w) => simbolo(g, w, c.al.length > 4 ? 1.2 : 2.4));
      D.poly(g, k.P, k.ok ? COL.gamma : COL.mal, 0.65, true);
      const i = Math.floor(st.u * k.P.length), [px, py] = k.P[i], [qx, qy] = k.P[(i + 1) % k.P.length];
      const tl = Math.hypot(qx - px, qy - py) || 1;
      D.arrow(g, px, py, px + (qx - px) / tl * 5, py + (qy - py) / tl * 5, '#fff', 0.4);
      const [bx, by] = campo(c.al, px, py), bm = Math.hypot(bx, by);
      if (bm > 1e-6) { const L = clamp(bm / k.mmax * 9, 1, 9); D.arrow(g, px, py, px + bx / bm * L, py + by / bm * L, COL.B, 0.5); }
      D.circ(g, px, py, 1, COL.oro);
      D.tex(g, k.ok ? '✅ $B$ sale de la integral: se puede despejar' : '❌ La ley se cumple, pero no puedes despejar $B$', W / 2, 6, { s: 2.8, c: k.ok ? COL.ok : COL.mal, fondo: 'rgba(0,0,0,0.45)', w: 700 });
      D.txt(g, 'Arrastra el loop para probar otros', W / 2, 87, { s: 2.4, c: COL.dim, min: 9 });
    },
    pointer: {
      hit(st, x, y) {
        const k = S['sirve-ampere'].calc(st), c = k.c;
        if (k.finito) { const xl = st.off ? st.off[0] : c.cx + 14; return Math.abs(x - xl) < 5 && Math.abs(y - c.cy) < 13; }
        return k.P.some(([px, py]) => Math.hypot(px - x, py - y) < 3.5);
      },
      down(st, x, y) {
        const k = S['sirve-ampere'].calc(st), c = k.c;
        const o = st.off || (k.finito ? [c.cx + 14, c.cy] : S['sirve-ampere'].offDef(st, c));
        st.agarre = [x - o[0], y - o[1]];
      },
      move(st, x, y) {
        const c = config21(st);
        if (c.cfg === 'finito') st.off = [clamp(x - st.agarre[0], c.cx - 40, c.cx + 40), c.cy];
        else st.off = [clamp(x - st.agarre[0], 0, st.V.w), clamp(y - st.agarre[1], 0, 90)];
        st.cache = null;
      },
    },
    finitoRatio(st) {
      const c = config21(st), xl = st.off ? st.off[0] : c.cx + 14, r = 11, s1 = (c.cx - 24) - xl, s2 = (c.cx + 24) - xl;
      return (s2 / Math.hypot(s2, r) - s1 / Math.hypot(s1, r)) / 2;
    },
    readouts(st) {
      const k = this.calc(st);
      if (k.finito) return [['$B$ en el loop', Math.round(this.finitoRatio(st) * 100) + ' % de $\\mu_0 I/2\\pi r$', COL.mal], ['Constante a lo largo del loop', 'sí, pero no sirve'], ['Hay que usar', 'Biot–Savart']];
      const media = k.mag.reduce((a, b) => a + b, 0) / k.mag.length;
      const cv = Math.sqrt(k.mag.reduce((a, b) => a + (b - media) ** 2, 0) / k.mag.length) / (media || 1);
      return [['Variación de $|\\vec B|$ en el loop', Math.round(cv * 100) + ' %'], ['Ángulo máx. entre $\\vec B$ y $d\\vec l$', Math.round(Math.max(...k.ang)) + '°'], ['¿Se despeja $B$?', k.ok ? 'sí' : 'no', k.ok ? COL.ok : COL.mal]];
    },
    idea(st) {
      if (st.p.cfg === 'finito') return 'Alambre finito: un tramo solo no es un circuito y $B$ depende de dónde pongas el loop. La igualdad no deja despejar $B$: se usa Biot–Savart.';
      return null;
    },
    plot: { custom: true, legend: [['$|\\vec B|$ a lo largo del loop', COL.B], ['ángulo entre $\\vec B$ y $d\\vec l$', COL.dim]] },
    drawPlot(g, w, h, st) {
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, h);
      const k = this.calc(st), X = (s) => 8 + (w - 16) * s, Y = (v) => h - 12 - (h - 22) * v;
      g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(8, Y(0)); g.lineTo(w - 8, Y(0)); g.stroke();
      g.font = '11px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.55)';
      if (k.finito) {
        const r = this.finitoRatio(st);
        g.strokeStyle = COL.B; g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), Y(r * 0.8)); g.lineTo(X(1), Y(r * 0.8)); g.stroke();
        g.strokeStyle = COL.oro; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(X(0), Y(0.8)); g.lineTo(X(1), Y(0.8)); g.stroke(); g.setLineDash([]);
        D.tex(g, 'lo que daría Ampère: $\\mu_0 I/2\\pi r$', X(0.02), Y(0.8) - 10, { s: 12, a: 'left', c: 'rgba(255,255,255,0.75)', w: 500 });
        return;
      }
      const n = k.mag.length;
      g.strokeStyle = COL.B; g.lineWidth = 2; g.beginPath();
      k.mag.forEach((m, i) => { const x = X(i / n), y = Y(m / k.mmax * 0.95); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      g.strokeStyle = 'rgba(163,169,175,0.9)'; g.setLineDash([4, 3]); g.lineWidth = 1.5; g.beginPath();
      k.ang.forEach((a, i) => { const x = X(i / n), y = Y(a / 180 * 0.95); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]);
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(X(st.u), 4); g.lineTo(X(st.u), h - 10); g.stroke();
      g.textAlign = 'right'; g.fillText('recorrido del loop →', w - 6, h - 1);
    },
  };
  wrapIdea('sirve-ampere');

  // ===================== 19. Construyendo el solenoide =====================
  S['construye-solenoide'] = {
    controls: [
      { type: 'slider', key: 'N', label: 'Número de vueltas (largo)', min: 1, max: 30, step: 1, value: 1, fmt: (v) => String(v) },
      { type: 'check', key: 'auto', label: 'Construir solo', value: true },
      { type: 'check', key: 'aportes', label: 'Mostrar aportes en la sonda', value: true },
      { type: 'check', key: 'inv', label: 'Invertir corriente', value: false },
    ],
    init(st) { st.p.N = st.p.auto ? 1 : st.p.N; st.ac = 0; st.parts = []; st.sonda = null; st.rect = null; },
    layout(st) { st.sonda = null; st.rect = null; st.parts = []; },
    onParam(st, key) { if (key === 'N') st.p.auto = false; },
    geo(st) {
      const W = st.V.w, cx = W / 2, cy = 44, a = 11, sp = st.ancho ? 4 : 3.4, N = st.p.N, s = st.p.inv ? -1 : 1, al = [];
      for (let i = 0; i < N; i++) { const x = cx - (N - 1) * sp / 2 + i * sp; al.push({ x, y: cy - a, I: s, fila: 'arriba' }, { x, y: cy + a, I: -s, fila: 'abajo' }); }
      return { cx, cy, a, sp, al };
    },
    step(st, dt) {
      if (st.p.auto && st.p.N < 24) { st.ac += dt; if (st.ac > 0.45) { st.ac = 0; st.p.N++; } }
      const { al, cx, cy } = this.geo(st), W = st.V.w;
      const bin = Math.hypot(...campo(al, cx, cy)) || 1;
      while (st.parts.length < 90) st.parts.push({ x: Math.random() * W, y: Math.random() * 90, v: Math.random() * 3 });
      st.parts.forEach((p) => {
        const [bx, by] = campo(al, p.x, p.y), m = Math.hypot(bx, by);
        p.v += dt;
        if (m > 1e-9) { const sp = 16 * clamp(Math.sqrt(m / bin), 0.08, 1.3); p.x += bx / m * sp * dt; p.y += by / m * sp * dt; }
        const cerca = al.some((w) => Math.hypot(p.x - w.x, p.y - w.y) < 1.2);
        if (p.v > 4 || cerca || p.x < 0 || p.x > W || p.y < 0 || p.y > 90) { p.x = Math.random() * W; p.y = Math.random() * 90; p.v = 0; }
      });
    },
    draw(g, st) {
      const W = st.V.w, { cx, cy, a, al } = this.geo(st);
      if (!st.sonda) st.sonda = [cx + 6, cy - a - 10];
      if (!st.rect) st.rect = [cx - 2, cy - a - 3];
      const bin = Math.hypot(...campo(al, cx, cy)) || 1;
      flechasCampo(g, al, W, 8, bin * 1.2, 0.45);
      st.parts.forEach((p) => D.circ(g, p.x, p.y, 0.5, `rgba(191,219,254,${0.8 * Math.min(1, p.v) * (1 - p.v / 4.2)})`));
      al.forEach((w) => simbolo(g, w, 1.35));
      // Loop amperiano rectangular (lado 1 abajo, 2 derecha, 3 arriba, 4 izquierda)
      const [rx, ry] = st.rect, rw = 14, rh = 18;
      const x0 = rx - rw / 2, y0 = ry - rh / 2;
      g.strokeStyle = COL.gamma; g.lineWidth = 0.55; g.setLineDash([1.4, 1]); g.strokeRect(x0, y0, rw, rh); g.setLineDash([]);
      [['1', rx, y0 + rh + 2.6], ['2', x0 + rw + 2.4, ry], ['3', rx, y0 - 2.4], ['4', x0 - 2.4, ry]].forEach(([t, x, y]) => D.txt(g, t, x, y, { s: 2.4, c: COL.gamma, min: 9 }));
      // Sonda con los aportes de los cables de arriba y de abajo
      const [sx, sy] = st.sonda;
      const arr = al.filter((w) => w.fila === 'arriba'), aba = al.filter((w) => w.fila === 'abajo');
      const bA = campo(arr, sx, sy), bB = campo(aba, sx, sy), bt = [bA[0] + bB[0], bA[1] + bB[1]], k = 9 / bin;
      const fl = (b, col, w) => { const L = Math.hypot(b[0], b[1]) * k, f = L > 16 ? 16 / L : 1; D.arrow(g, sx, sy, sx + b[0] * k * f, sy + b[1] * k * f, col, w); };
      if (st.p.aportes) { fl(bA, '#fca5a5', 0.4); fl(bB, '#93c5fd', 0.4); }
      fl(bt, '#fff', 0.6);
      D.circ(g, sx, sy, 1.3, COL.oro, '#000', 0.2);
      const adentro = Math.abs(sy - cy) < a && st.p.N > 1;
      if (st.p.aportes) D.txt(g, adentro ? 'adentro: se suman' : 'afuera: se cancelan', sx, sy - 5, { s: 2.5, c: COL.oro, fondo: 'rgba(0,0,0,0.45)', min: 9 });
      if (st.p.aportes) { D.txt(g, '— cables de arriba', 3, 84, { s: 2.4, c: '#fca5a5', a: 'left', min: 9 }); D.txt(g, '— cables de abajo', 3, 88, { s: 2.4, c: '#93c5fd', a: 'left', min: 9 }); }
      D.txt(g, st.p.N === 1 ? '1 espira: campo de dipolo' : st.p.N + ' vueltas', W / 2, 5, { s: 2.8, fondo: 'rgba(0,0,0,0.4)' });
    },
    pointer: {
      hit(st, x, y) {
        if (st.sonda && Math.hypot(x - st.sonda[0], y - st.sonda[1]) < 4) return true;
        return st.rect && Math.abs(x - st.rect[0]) < 8 && Math.abs(y - st.rect[1]) < 10;
      },
      down(st, x, y) { st.que = st.sonda && Math.hypot(x - st.sonda[0], y - st.sonda[1]) < 4 ? 'sonda' : 'rect'; const o = st.que === 'sonda' ? st.sonda : st.rect; st.agarre = [x - o[0], y - o[1]]; },
      move(st, x, y) { const p = [clamp(x - st.agarre[0], 2, st.V.w - 2), clamp(y - st.agarre[1], 2, 88)]; if (st.que === 'sonda') st.sonda = p; else st.rect = p; },
    },
    readouts(st) {
      const { al, cy, a } = this.geo(st);
      if (!st.rect) return [];
      const [rx, ry] = st.rect, rw = 14, rh = 18;
      const enc = al.filter((w) => Math.abs(w.x - rx) < rw / 2 && Math.abs(w.y - ry) < rh / 2);
      const neto = enc.reduce((s, w) => s + w.I, 0);
      const lado1 = ry + rh / 2, dentro1 = Math.abs(lado1 - cy) < a;
      return [['Corriente encerrada', neto ? '$' + Math.abs(neto) + 'I$' : '0', COL.I], ['$B$ (lado 1)', neto ? '$\\mu_0\\cdot ' + Math.abs(neto) + 'I/\\ell$ (igual a cualquier altura)' : '0 (no encierra corriente)', COL.B], ['Lado 1', dentro1 ? 'adentro' : 'afuera']];
    },
  };

  // ===================== 20. Loops en el toroide =====================
  S['toroide'] = {
    controls: [
      { type: 'slider', key: 'N', label: 'Número de vueltas $N$', min: 8, max: 48, step: 2, value: 24, fmt: (v) => String(v) },
      { type: 'check', key: 'auto', label: 'Mover el círculo solo', value: true },
      { type: 'slider', key: 'r', label: 'Radio del círculo amperiano $r$', min: 0, max: 1, step: 0.01, value: 0.5, fmt: (v) => fmt(v, 2), show: (p) => !p.auto },
      { type: 'check', key: 'franjas', label: 'Ver flujo en franjas', value: false },
    ],
    init(st) { st.ph = 0; st.fase = 0; },
    onParam(st, key) { if (key === 'r') st.p.auto = false; },
    geo(st) {
      const W = st.V.w, fr = st.p.franjas;
      if (st.ancho) return { cx: fr ? W * 0.3 : W * 0.4, cy: 45, a: 12, b: 27 };
      return fr ? { cx: W * 0.3, cy: 45, a: 9, b: 20 } : { cx: W * 0.5, cy: 45, a: 11, b: 25 };
    },
    rMax(gm) { return gm.b + 12; },
    step(st, dt) { st.fase += dt * 6; if (st.p.auto) { st.ph += dt; st.p.r = 0.5 - 0.48 * Math.cos(st.ph * 0.5); } },
    draw(g, st) {
      const W = st.V.w, gm = this.geo(st), { cx, cy, a, b } = gm, N = st.p.N, r = st.p.r * this.rMax(gm);
      g.beginPath(); g.arc(cx, cy, b, 0, TAU); g.arc(cx, cy, a, 0, TAU, true); g.fillStyle = 'rgba(107,114,128,0.55)'; g.fill();
      // Campo dentro del núcleo: antihorario, más intenso cerca del borde interior
      [a + 3, (a + b) / 2, b - 3].forEach((rr) => {
        for (let i = 0; i < 10; i++) {
          const t = i * TAU / 10 + st.fase * 0.05, L = clamp(3.2 * (a + 3) / rr, 1, 4);
          const x = cx + rr * Math.cos(t), y = cy + rr * Math.sin(t);
          D.arrow(g, x - Math.sin(t) * L / 2, y + Math.cos(t) * L / 2, x + Math.sin(t) * L / 2, y - Math.cos(t) * L / 2, COL.B, 0.4, 1.2);
        }
      });
      // Vueltas: suben (⊙) por dentro y bajan (⊗) por fuera
      for (let i = 0; i < N; i++) {
        const t = i * TAU / N, c = Math.cos(t), s = Math.sin(t);
        D.line(g, cx + a * c, cy + a * s, cx + b * c, cy + b * s, 'rgba(248,113,113,0.65)', 0.35);
        const f = ((st.fase * 0.15 + i * 0.37) % 1);
        D.circ(g, cx + lerp(a, b, f) * c, cy + lerp(a, b, f) * s, 0.45, '#fecaca');
        D.sale(g, cx + a * c, cy + a * s, 0.8, COL.I, 0.2);
        D.entra(g, cx + b * c, cy + b * s, 0.8, COL.I, 0.2);
      }
      D.circ(g, cx, cy, r, 'rgba(134,239,172,0.08)', COL.gamma, 0.65);
      const nsale = r > a ? N : 0, nentra = r > b ? N : 0;
      const zona = r < a ? 'En el hueco: 0 cortes → $I_{enl}=0$' : r < b ? 'Dentro del núcleo: ⊙ × ' + N + ' → $I_{enl}=NI$' : '⊙ × ' + N + ' y ⊗ × ' + N + ' → $I_{enl}=0$';
      D.tex(g, zona, st.p.franjas && st.ancho ? cx + 4 : W / 2, 5, { s: 2.8, c: r > a && r < b ? COL.ok : COL.txt, fondo: 'rgba(0,0,0,0.45)' });
      st.cortes = [nsale, nentra];
      if (st.p.franjas) {
        const x0 = st.ancho ? W * 0.6 : W * 0.6, x1 = W - 5, y0 = 30, hh = 26;
        D.tex(g, 'Sección: $h\\times(b-a)$', (x0 + x1) / 2, y0 - 4, { s: 2.5, c: COL.dim, min: 9 });
        const n = 14;
        for (let i = 0; i < n; i++) {
          const rr = a + (i + 0.5) * (b - a) / n, al = 0.15 + 0.7 * a / rr;
          g.fillStyle = `rgba(251,146,60,${al})`; g.fillRect(x0 + i * (x1 - x0) / n, y0, (x1 - x0) / n - 0.25, hh);
        }
        g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 0.3; g.strokeRect(x0, y0, x1 - x0, hh);
        D.tex(g, '$a$', x0, y0 + hh + 3, { s: 2.6, c: COL.dim }); D.tex(g, '$b$', x1, y0 + hh + 3, { s: 2.6, c: COL.dim });
        D.tex(g, 'franjas $dr$: $B\\propto 1/r$', (x0 + x1) / 2, y0 + hh + 8, { s: 2.4, c: COL.E, min: 9 });
        D.tex(g, '$\\phi = \\frac{\\mu_0 NIh}{2\\pi}\\ln\\frac{b}{a}$', (x0 + x1) / 2, y0 + hh + 13, { s: 2.6, c: COL.oro, min: 9 });
      }
    },
    pointer: {
      hit(st, x, y) { const T = S['toroide'], gm = T.geo(st); return Math.abs(Math.hypot(x - gm.cx, y - gm.cy) - st.p.r * T.rMax(gm)) < 3; },
      down(st) { st.p.auto = false; },
      move(st, x, y) { const T = S['toroide'], gm = T.geo(st); st.p.r = clamp(Math.hypot(x - gm.cx, y - gm.cy) / T.rMax(gm), 0, 1); },
    },
    readouts(st) {
      const gm = this.geo(st), r = st.p.r * this.rMax(gm), c = st.cortes || [0, 0];
      const B = r > gm.a && r < gm.b ? gm.a / r : 0;
      return [['⊙ cortadas', String(c[0]), COL.I], ['⊗ cortadas', String(c[1]), COL.I], ['$I_{enl}$', (c[0] - c[1]) ? '$' + (c[0] - c[1]) + 'I$' : '0'], ['$B(r)$', fmt(B, 2) + ' $\\cdot B(a)$', COL.B]];
    },
    idea(st) {
      const gm = this.geo(st), r = st.p.r * this.rMax(gm);
      if (r < gm.a) return 'En el hueco el círculo no encierra corriente → $B=0$.';
      if (r < gm.b) return 'Dentro del núcleo encierra $N$ vueltas: $B=\\frac{\\mu_0 NI}{2\\pi r}$, más grande cerca del borde interior.';
      return null;
    },
    plot: { custom: true, legend: [['$B(r)$', COL.B], ['círculo amperiano', COL.gamma]] },
    drawPlot(g, w, h, st) {
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, h);
      const gm = this.geo(st), rm = this.rMax(gm), X = (r) => 8 + (w - 16) * r / rm, Y = (v) => h - 12 - (h - 22) * v;
      g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(8, Y(0)); g.lineTo(w - 8, Y(0)); g.stroke();
      g.strokeStyle = COL.B; g.lineWidth = 2; g.beginPath();
      g.moveTo(X(0), Y(0)); g.lineTo(X(gm.a), Y(0));
      for (let i = 0; i <= 60; i++) { const r = gm.a + (gm.b - gm.a) * i / 60; g.lineTo(X(r), Y(gm.a / r * 0.95)); }
      g.lineTo(X(gm.b), Y(0)); g.lineTo(X(rm), Y(0)); g.stroke();
      const r = st.p.r * rm, v = r > gm.a && r < gm.b ? gm.a / r * 0.95 : 0;
      g.fillStyle = COL.gamma; g.beginPath(); g.arc(X(r), Y(v), 4, 0, TAU); g.fill();
      const pt = (t, x, y) => D.tex(g, t, x, y, { s: 12, c: 'rgba(255,255,255,0.75)', w: 500 });
      pt('$a$', X(gm.a), h - 6); pt('$b$', X(gm.b), h - 6); pt('$\\propto 1/r$', X((gm.a + gm.b) / 2), 11);
    },
  };
  wrapIdea('toroide');
})();
