// Animaciones de las preguntas 1 a 9 (Maxwell, transformador y el comienzo de Faraday–Lenz).
// Convención: x a la derecha, y hacia abajo (lienzo), z sale de la pantalla (⊙).
(function () {
  'use strict';
  const { COL, D, TAU, clamp, lerp, fmt, fmtSI, tex, texto, el } = window.Motor;
  const S = window.SIMS;

  // Anillo de campo B en perspectiva alrededor de un eje horizontal (x0, cy).
  // Un punto del anillo es (y, z) = (r cos φ, r sin φ); z se dibuja hacia la izquierda.
  // Con corriente hacia +x, B en la parte de arriba sale de la pantalla (+z): φ creciente.
  function anilloB(g, x0, cy, r, inten, ang, signo = 1) {
    const a = clamp(inten, 0, 1);
    if (a < 0.03) return;
    D.ellipse(g, x0, cy, r * 0.33, r, null, `rgba(96,165,250,${0.2 + 0.6 * a})`, 0.3 + 0.35 * a);
    for (let k = 0; k < 3; k++) {
      const phi = signo * ang + k * TAU / 3;
      const X = x0 - 0.33 * r * Math.sin(phi), Y = cy - r * Math.cos(phi);
      const dX = -0.33 * r * Math.cos(phi) * signo, dY = r * Math.sin(phi) * signo;
      D.head(g, X, Y, Math.atan2(dY, dX), COL.B, 1.4 + 0.9 * a);
    }
  }

  // ===================== 1. El condensador que se carga =====================
  function est1(st) {
    const T = 7, tau = 2.2, tp = st.t % T;
    const I = st.p.I0 * Math.exp(-tp / tau);
    const q = st.p.I0 * tau * (1 - Math.exp(-tp / tau));
    return { I, q, qn: q / (2 * tau) };
  }
  S['condensador'] = {
    controls: [
      { type: 'toggle', key: 'sup', label: 'Superficie', value: 'plana', options: [['plana', 'Plana'], ['abombada', 'Abombada']] },
      { type: 'check', key: 'orig', label: 'Solo Ampère original (sin Maxwell)', value: false },
      { type: 'slider', key: 'I0', label: 'Rapidez de carga ($I$)', min: 0.3, max: 2, step: 0.05, value: 1, fmt: (v) => fmt(v, 2) + ' A' },
    ],
    init(st) { st.fase = 0; st.ang = 0; },
    layout(st) { st.gx = st.V.w * 0.63; st.gam = st.V.w * 0.27; st.cy = 47; },
    step(st, dt) {
      const { I } = est1(st);
      st.fase += I * dt * 12;
      st.ang += (0.6 + I) * dt * 2.2;
    },
    draw(g, st) {
      const W = st.V.w, { gx, gam, cy } = st;
      const { I, qn } = est1(st);
      const abomb = st.p.sup === 'abombada';
      const contra = abomb && st.p.orig;
      // Superficies con borde Γ
      const bolsa = () => {
        g.beginPath();
        g.moveTo(gam, cy - 8);
        g.bezierCurveTo(gam + 10, cy - 25, gx - 7, cy - 25, gx, cy - 19.5);
        g.lineTo(gx, cy + 19.5);
        g.bezierCurveTo(gx - 7, cy + 25, gam + 10, cy + 25, gam, cy + 8);
        g.closePath();
      };
      bolsa();
      if (abomb) { g.fillStyle = contra ? 'rgba(248,113,113,0.16)' : 'rgba(251,146,60,0.2)'; g.fill(); }
      g.strokeStyle = abomb ? (contra ? COL.mal : COL.E) : 'rgba(255,255,255,0.25)';
      g.lineWidth = abomb ? 0.5 : 0.3; g.setLineDash([1.4, 1.2]); g.stroke(); g.setLineDash([]);
      D.ellipse(g, gam, cy, 2.8, 8, abomb ? 'rgba(255,255,255,0.03)' : 'rgba(251,146,60,0.32)', null);
      // Cables y cargas que avanzan hacia la placa izquierda (y salen de la derecha)
      D.line(g, 3, cy, gx - 6, cy, COL.alambre, 0.8);
      D.line(g, gx + 6, cy, W - 3, cy, COL.alambre, 0.8);
      D.puntos(g, [[3, cy], [gx - 6, cy]], st.fase, 5, COL.I, 0.62);
      D.puntos(g, [[gx + 6, cy], [W - 3, cy]], st.fase, 5, COL.I, 0.62);
      D.arrow(g, 8, cy - 4, 16, cy - 4, COL.I, 0.45);
      D.txt(g, 'I', 12, cy - 7.5, { s: 3, c: COL.I });
      // Anillos de B alrededor del cable y entre las placas (misma intensidad: I_d = I)
      const inten = I / 2;
      anilloB(g, gam * 0.45, cy, 7, inten, st.ang);
      anilloB(g, gx + (W - gx) * 0.55, cy, 7, inten, st.ang);
      anilloB(g, gx, cy, 9.5, inten, st.ang);
      anilloB(g, gx, cy, 14.5, inten * 0.8, st.ang * 0.8);
      // Placas, cargas acumuladas y campo eléctrico creciente
      g.fillStyle = '#aab3bd';
      g.fillRect(gx - 7, cy - 16, 1.6, 32);
      g.fillRect(gx + 5.4, cy - 16, 1.6, 32);
      const n = Math.round(clamp(qn, 0, 1) * 7);
      for (let i = 0; i < n; i++) {
        const y = cy - 13 + i * (26 / 6);
        D.txt(g, '+', gx - 9.6, y, { s: 2.6, c: COL.I, min: 8 });
        D.txt(g, '−', gx + 9.6, y, { s: 2.6, c: COL.B, min: 8 });
      }
      const Lq = clamp(qn, 0, 1) * 9.8;
      if (Lq > 0.7) [cy - 11, cy - 5.5, cy + 5.5, cy + 11].forEach((y) => D.arrow(g, gx - 4.9, y, gx - 4.9 + Lq, y, COL.E, 0.45, 1.6));
      D.txt(g, 'E', gx, cy - 21, { s: 3, c: COL.E });
      // Borde Γ
      D.ellipse(g, gam, cy, 2.8, 8, null, COL.gamma, 0.7);
      D.txt(g, 'Γ', gam, cy - 11.5, { s: 3.2, c: COL.gamma });
      // Rótulos
      const etiqueta = abomb ? 'La atraviesa I_d = ε₀ dφ_E/dt' : 'La atraviesa I (corriente de conducción)';
      D.txt(g, (abomb ? 'Superficie abombada: ' : 'Superficie plana: ') + etiqueta, W / 2, 6, { s: 2.8, fondo: 'rgba(0,0,0,0.35)', c: abomb ? COL.E : COL.txt });
      const res = contra ? '∮B·dl = 0  ✗ ¡Contradicción!' : '∮B·dl = μ₀I  ✓';
      D.txt(g, res, W / 2, 83, { s: 4, c: contra ? COL.mal : COL.ok, fondo: 'rgba(0,0,0,0.4)', w: 700 });
    },
    readouts(st) {
      const { I, q } = est1(st);
      return [['I (cable)', fmt(I, 2) + ' A', COL.I], ['I_d (entre placas)', fmt(I, 2) + ' A', COL.E], ['Carga q', fmt(q, 2) + ' C']];
    },
    plot: { series: [{ key: 'I', label: '$I(t)$ en el cable', color: COL.I, max: 2.1 }, { key: 'Id', label: '$I_d(t)$ entre las placas', color: COL.E, dash: true, max: 2.1 }], span: 8 },
    sample(st) { const { I } = est1(st); return { I, Id: I }; },
  };

  // ===================== 2. Líneas que entran y salen =====================
  function campoPolos(polos, x, y) {
    let bx = 0, by = 0;
    for (const p of polos) {
      const dx = x - p.x, dy = y - p.y, r2 = dx * dx + dy * dy + 0.04, r3 = r2 * Math.sqrt(r2);
      bx += p.q * dx / r3; by += p.q * dy / r3;
    }
    return [bx, by];
  }
  function trazar(polos, x, y, maxPasos) {
    const pts = [[x, y]];
    for (let i = 0; i < maxPasos; i++) {
      let dmin = Infinity;
      for (const p of polos) dmin = Math.min(dmin, Math.hypot(x - p.x, y - p.y));
      const h = clamp(dmin * 0.1, 0.22, 4);
      let [bx, by] = campoPolos(polos, x, y);
      let m = Math.hypot(bx, by);
      if (m < 1e-14) break;
      const mx = x + bx / m * h / 2, my = y + by / m * h / 2;
      [bx, by] = campoPolos(polos, mx, my);
      m = Math.hypot(bx, by);
      x += bx / m * h; y += by / m * h;
      pts.push([x, y]);
      for (const p of polos) if (p.q < 0 && Math.hypot(x - p.x, y - p.y) < 0.9) return { pts, fin: p };
      if (Math.abs(x) > 3000 || Math.abs(y) > 3000) break;
    }
    return { pts, fin: null };
  }
  // Líneas cerradas de un imán de barra centrado en (cx, cy): salen por N, vuelven por S y cierran por dentro
  function lineasIman(cx, cy, largo, angs = [14, 32, 52, 76, 102, 130]) {
    const N = { x: cx + largo / 2 - 0.6, y: cy, q: 1 }, Sp = { x: cx - largo / 2 + 0.6, y: cy, q: -1 };
    const polos = [N, Sp];
    const lineas = [];
    angs.forEach((a, i) => [1, -1].forEach((s) => {
      const r = a * Math.PI / 180;
      const x0 = N.x + Math.cos(r) * 0.9, y0 = N.y - s * Math.sin(r) * 0.9;
      const { pts, fin } = trazar(polos, x0, y0, 4000);
      if (fin !== Sp) return;
      const yi = cy - s * (0.45 + 3.2 * (i + 0.5) / angs.length);
      pts.push([Sp.x + 0.8, yi], [N.x - 0.8, yi]);
      lineas.push(cerrada(pts));
    }));
    return lineas;
  }
  function cerrada(pts, abierta) {
    const acum = [0];
    const n = abierta ? pts.length - 1 : pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      acum.push(acum[acum.length - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    return { pts, acum, L: acum[acum.length - 1], abierta: !!abierta };
  }
  function puntoEn(lin, s) {
    const { pts, acum, L } = lin;
    s = lin.abierta ? s % L : ((s % L) + L) % L;
    let lo = 0, hi = acum.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (acum[m] <= s) lo = m; else hi = m; }
    const a = pts[lo], b = pts[(lo + 1) % pts.length], f = (s - acum[lo]) / Math.max(1e-9, acum[lo + 1] - acum[lo]);
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  }
  function cruces(lineas, cx, cy, R) {
    const res = [];
    lineas.forEach((lin) => {
      const { pts } = lin;
      const n = lin.abierta ? pts.length - 1 : pts.length;
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const da = Math.hypot(a[0] - cx, a[1] - cy), db = Math.hypot(b[0] - cx, b[1] - cy);
        if ((da < R) !== (db < R)) {
          const f = (R - da) / (db - da);
          res.push({ x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), sale: da < R });
        }
      }
    });
    return res;
  }
  S['gauss-magnetico'] = {
    controls: [
      { type: 'button', label: '✂ Partir el imán', labelFn: (st) => (st.partido ? '↺ Unir el imán' : '✂ Partir el imán'),
        onClick(st, api) { st.partido = !st.partido; if (!st.playing) st.sp = st.partido ? 1 : 0; st.cache = null; } },
      { type: 'check', key: 'mono', label: 'Mundo hipotético con monopolo', value: false },
      { type: 'slider', key: 'R', label: 'Radio de la superficie cerrada', min: 5, max: 26, step: 0.5, value: 9, fmt: (v) => fmt(v, 1) },
    ],
    init(st) { st.partido = false; st.sp = 0; st.cache = null; st.sx = null; },
    layout(st) {
      st.cx = st.V.w / 2; st.cy = 46; st.largo = st.ancho ? 34 : 28;
      st.cache = null;
      if (st.sx === null || st.sx > st.V.w) { st.sx = st.cx + st.largo / 2; st.sy = st.cy; }
    },
    onParam(st) { st.cache = null; },
    step(st, dt) {
      const obj = st.partido ? 1 : 0;
      if (st.sp !== obj) { st.sp = clamp(st.sp + (obj > st.sp ? 1 : -1) * dt * 1.4, 0, 1); st.cache = null; }
    },
    lineas(st) {
      if (st.cache) return st.cache;
      const { cx, cy, largo } = st;
      let lin = [];
      if (st.p.mono) {
        for (let k = 0; k < 16; k++) {
          const a = k * TAU / 16 + 0.1;
          lin.push(cerrada([[cx + Math.cos(a) * 1.6, cy + Math.sin(a) * 1.6], [cx + Math.cos(a) * 400, cy + Math.sin(a) * 400]], true));
        }
      } else if (st.sp <= 0) {
        lin = lineasIman(cx, cy, largo);
      } else {
        const sep = largo / 4 + st.sp * st.V.w * 0.16, l2 = largo / 2 - 1;
        const angs = [30, 50, 74, 100, 128];
        lin = lineasIman(cx - sep, cy, l2, angs).concat(lineasIman(cx + sep, cy, l2, angs));
      }
      st.cache = lin;
      return lin;
    },
    draw(g, st) {
      const W = st.V.w, { cx, cy, largo } = st;
      const lineas = this.lineas(st);
      lineas.forEach((lin) => D.poly(g, lin.pts, 'rgba(96,165,250,0.55)', 0.4, !lin.abierta));
      // Partículas que muestran el sentido de las líneas
      lineas.forEach((lin, i) => {
        for (let k = 0; k < 3; k++) {
          const [x, y] = puntoEn(lin, (st.t * 9 + k * lin.L / 3 + i * 7));
          if (x > -2 && x < W + 2 && y > -2 && y < 92) D.circ(g, x, y, 0.65, '#bfdbfe');
        }
      });
      // Imán (o monopolo)
      const iman = (x, l) => {
        g.fillStyle = 'rgba(59,130,246,0.88)'; g.fillRect(x - l / 2, cy - 4.5, l / 2, 9);
        g.fillStyle = 'rgba(239,68,68,0.88)'; g.fillRect(x, cy - 4.5, l / 2, 9);
        g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 0.3; g.strokeRect(x - l / 2, cy - 4.5, l, 9);
        D.txt(g, 'S', x - l / 4, cy, { s: 3.4, w: 700 });
        D.txt(g, 'N', x + l / 4, cy, { s: 3.4, w: 700 });
      };
      if (st.p.mono) {
        D.glow(g, cx, cy, 8, 'rgba(239,68,68,A)', 0.8);
        D.circ(g, cx, cy, 3.4, COL.N, '#fff', 0.3);
        D.txt(g, 'N', cx, cy, { s: 3, w: 700 });
      } else if (st.sp <= 0) iman(cx, largo);
      else {
        const sep = largo / 4 + st.sp * W * 0.16, l2 = largo / 2 - 1;
        iman(cx - sep, l2); iman(cx + sep, l2);
      }
      // Superficie cerrada y cruces
      const R = st.p.R;
      const cr = cruces(lineas, st.sx, st.sy, R);
      D.circ(g, st.sx, st.sy, R, 'rgba(251,146,60,0.10)', COL.E, 0.5);
      cr.forEach((c) => D.circ(g, c.x, c.y, 0.95, c.sale ? COL.ok : COL.mal, '#111', 0.15));
      const sal = cr.filter((c) => c.sale).length, ent = cr.length - sal;
      st.cuenta = { sal, ent };
      const neto = sal - ent;
      const txt = 'Entran: ' + ent + ' · Salen: ' + sal + ' · Flujo neto: ' + (neto === 0 ? '0' : neto + ' ≠ 0');
      D.txt(g, txt, W / 2, 5.5, { s: 3, fondo: 'rgba(0,0,0,0.4)', c: neto === 0 ? COL.txt : COL.mal });
      if (st.p.mono && neto !== 0) D.txt(g, '∮B·dA = μ₀ q_m', W / 2, 84, { s: 3.6, c: COL.mal, fondo: 'rgba(0,0,0,0.45)', w: 700 });
      else D.txt(g, 'Arrastra la superficie', st.sx, Math.min(88, st.sy + R + 3.5), { s: 2.5, c: COL.dim, min: 9.5 });
    },
    pointer: {
      hit(st, x, y) { return Math.hypot(x - st.sx, y - st.sy) < st.p.R + 2.5; },
      down(st, x, y) { st.dx = x - st.sx; st.dy = y - st.sy; },
      move(st, x, y) { st.sx = clamp(x - st.dx, 0, st.V.w); st.sy = clamp(y - st.dy, 0, 90); },
    },
    readouts(st) {
      const c = st.cuenta || { sal: 0, ent: 0 };
      return [['Entran', String(c.ent), COL.mal], ['Salen', String(c.sal), COL.ok], ['Flujo neto', String(c.sal - c.ent), c.sal - c.ent ? COL.mal : COL.ok]];
    },
    idea(st) {
      const c = st.cuenta;
      if (st.p.mono && c && c.sal !== c.ent) return 'Con un monopolo encerrado, el flujo neto no es cero: $\\oint \\vec B\\cdot d\\vec A=\\mu_0 q_m$.';
      if (st.partido) return 'Cada mitad es un imán completo, con su propio N y S: nunca queda un polo solo.';
      return null;
    },
  };
  // Si idea() devuelve null se usa la idea clave de la pregunta
  wrapIdea('gauss-magnetico');

  // ===================== 3. Las cuatro ecuaciones y la onda =====================
  S['maxwell-onda'] = {
    controls: [
      { type: 'check', key: 'mono', label: 'Monopolos (hipotético)', value: false },
      { type: 'slider', key: 'f', label: 'Frecuencia de la onda', min: 0.2, max: 1.4, step: 0.05, value: 0.55, fmt: (v) => fmt(v, 2) + ' (u.a.)' },
    ],
    init(st) { st.fuente = null; },
    html(box, st) {
      const grid = el('div', 'ecs');
      const info = el('p', 'ecs-info');
      box.append(grid, info);
      const ecs = (m) => [
        { n: 'Gauss eléctrico', f: '\\oint \\vec E\\cdot d\\vec A=\\frac{q_{enl}}{\\varepsilon_0}',
          t: [['\\frac{q_{enl}}{\\varepsilon_0}', 'Fuente: **cargas eléctricas**. Las líneas de $\\vec E$ empiezan y terminan en ellas.', 'E']] },
        { n: 'Gauss magnético', f: m ? '\\oint \\vec B\\cdot d\\vec A=\\color{#9ca3af}{\\mu_0 q_m}' : '\\oint \\vec B\\cdot d\\vec A=0', hip: m,
          t: m ? [['\\mu_0 q_m', 'Hipotético: una **carga magnética** (monopolo). Las líneas de $\\vec B$ saldrían de ella, como las de $\\vec E$ de una carga.', null, true]]
            : [['0', 'No hay cargas magnéticas: las líneas de $\\vec B$ son **cerradas**.', 'B']] },
        { n: 'Faraday', f: m ? '\\oint \\vec E\\cdot d\\vec l=\\color{#9ca3af}{-\\mu_0 I_m}-\\frac{d\\phi_B}{dt}' : '\\oint \\vec E\\cdot d\\vec l=-\\frac{d\\phi_B}{dt}', hip: m,
          t: [['-\\frac{d\\phi_B}{dt}', 'Fuente: **un $\\vec B$ que cambia**. Crea un $\\vec E$ que da vueltas.', 'B']].concat(m ? [['-\\mu_0 I_m', 'Hipotético: **monopolos en movimiento** (una "corriente magnética"). No existen, por eso Faraday tiene un solo término.', null, true]] : []) },
        { n: 'Ampère–Maxwell', f: '\\oint \\vec B\\cdot d\\vec l=\\mu_0 I_{enl}+\\mu_0\\varepsilon_0\\frac{d\\phi_E}{dt}',
          t: [['\\mu_0 I_{enl}', 'Fuente: **cargas en movimiento** (corriente).', null], ['\\mu_0\\varepsilon_0\\frac{d\\phi_E}{dt}', 'Fuente: **un $\\vec E$ que cambia** (corriente de desplazamiento).', 'E']] },
      ];
      const pintarInfo = () => {
        if (!st.fuente) { texto(info, 'Toca un término para ver qué lo produce.'); return; }
        info.innerHTML = st.fuente.d.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        if (window.renderMathInElement) window.renderMathInElement(info, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false });
      };
      st.renderEcs = () => {
        grid.textContent = '';
        ecs(st.p.mono).forEach((e) => {
          const card = el('div', 'ec' + (e.hip ? ' hip' : ''));
          card.appendChild(el('div', 'ec-n', e.n));
          const f = el('div', 'ec-f');
          tex(f, e.f, true);
          card.appendChild(f);
          const ts = el('div', 'ec-t');
          e.t.forEach(([src, d, campo, hip]) => {
            const b = el('button', 'ec-term' + (hip ? ' hip' : ''));
            b.type = 'button';
            tex(b, src);
            if (st.fuente && st.fuente.src === src) b.classList.add('on');
            b.addEventListener('click', () => { st.fuente = { src, d, campo }; st.renderEcs(); });
            ts.appendChild(b);
          });
          if (e.hip) ts.appendChild(el('span', 'ec-hip', 'hipotético'));
          card.appendChild(ts);
          grid.appendChild(card);
        });
        pintarInfo();
      };
      st.renderEcs();
    },
    onParam(st, key) { if (key === 'mono') { if (st.fuente && /q_m|I_m/.test(st.fuente.src)) st.fuente = null; st.renderEcs(); } },
    step(st, dt) { st.fase = (st.fase || 0) + dt * TAU * st.p.f; },
    draw(g, st) {
      const W = st.V.w, cy = 44, x0 = 8, x1 = W - 10, A = 19, kz = [-0.42, 0.27];
      const lam = st.ancho ? 56 : 44, k = TAU / lam, fase = st.fase || 0;
      const hl = st.fuente && st.fuente.campo;
      D.arrow(g, x0 - 3, cy, x1 + 6, cy, 'rgba(255,255,255,0.4)', 0.35);
      D.txt(g, 'avanza →', x1 + 1, cy + 4, { s: 2.4, c: COL.dim, a: 'right', min: 9 });
      // Curvas envolventes
      const ptsE = [], ptsB = [];
      for (let x = x0; x <= x1; x += 0.8) {
        const s = Math.sin(k * (x - x0) - fase);
        ptsE.push([x, cy - A * s]);
        ptsB.push([x + kz[0] * A * s, cy + kz[1] * A * s]);
      }
      D.poly(g, ptsB, hl === 'B' ? COL.B : 'rgba(96,165,250,0.75)', hl === 'B' ? 0.8 : 0.5);
      D.poly(g, ptsE, hl === 'E' ? COL.E : 'rgba(251,146,60,0.8)', hl === 'E' ? 0.8 : 0.5);
      for (let x = x0; x <= x1; x += 4.6) {
        const s = Math.sin(k * (x - x0) - fase);
        D.arrow(g, x, cy, x + kz[0] * A * s, cy + kz[1] * A * s, hl === 'B' ? COL.B : 'rgba(96,165,250,0.7)', hl === 'B' ? 0.45 : 0.32, 1.2);
        D.arrow(g, x, cy, x, cy - A * s, hl === 'E' ? COL.E : 'rgba(251,146,60,0.75)', hl === 'E' ? 0.45 : 0.32, 1.2);
      }
      D.txt(g, 'E (vertical)', x0 + 2, 10, { s: 2.8, c: COL.E, a: 'left' });
      D.txt(g, 'B (hacia ti, perpendicular a E)', x0 + 2, 15, { s: 2.8, c: COL.B, a: 'left' });
      // Ciclo: E cambia → crea B → B cambia → crea E
      const pasos = ['E cambia', '→ crea B', 'B cambia', '→ crea E'];
      const act = Math.floor((st.fase || 0) / (Math.PI / 2)) % 4;
      const ancho = (W - 16) / 4;
      pasos.forEach((p, i) => D.txt(g, p, 8 + ancho * (i + 0.5), 83, { s: 2.9, c: i === act ? COL.oro : COL.dim, w: i === act ? 700 : 500, min: 9.5 }));
    },
  };

  // ===================== 4. Transformador AC vs DC =====================
  const W4 = TAU * 0.6;
  function est4(st) {
    const k = st.p.nucleo === 'hierro' ? 0.95 : 0.22;
    if (st.p.fuente === 'ac') return { phi: Math.sin(W4 * st.t), Vp: Math.cos(W4 * st.t), Vs: k * Math.cos(W4 * st.t), k };
    if (st.t < st.tDC) return { phi: 0, Vp: 0, Vs: 0, k };
    const d = st.t - st.tDC, tau = 0.25;
    return { phi: 1 - Math.exp(-d / tau), Vp: 1, Vs: k * Math.exp(-d / tau) / tau / W4, k, d };
  }
  // Rectángulo (línea media del núcleo) desplazado en d
  function rectNucleo(g, cx, cy, hw, hh) {
    g.beginPath(); g.rect(cx - hw, cy - hh, hw * 2, hh * 2);
  }
  function nucleo(g, cx, cy, hierro) {
    if (hierro) {
      g.fillStyle = '#5b6168';
      g.beginPath(); g.rect(cx - 28, cy - 22, 56, 44); g.rect(cx - 19, cy - 13, 38, 26); g.fill('evenodd');
      g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 0.3; g.strokeRect(cx - 28, cy - 22, 56, 44); g.strokeRect(cx - 19, cy - 13, 38, 26);
    } else {
      g.setLineDash([1, 1.2]); g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 0.3;
      g.strokeRect(cx - 28, cy - 22, 56, 44); g.strokeRect(cx - 19, cy - 13, 38, 26); g.setLineDash([]);
    }
  }
  function bobina(g, x, cy, n, alto, color, w = 0.7) {
    for (let i = 0; i < n; i++) {
      const y = cy - alto / 2 + (i + 0.5) * alto / n;
      D.line(g, x - 6.5, y - 1.2, x + 6.5, y + 1.2, color, w);
    }
  }
  S['transformador-acdc'] = {
    controls: [
      { type: 'toggle', key: 'fuente', label: 'Fuente', value: 'ac', options: [['ac', 'AC (alterna)'], ['dc', 'DC (continua)']] },
      { type: 'toggle', key: 'nucleo', label: 'Núcleo', value: 'hierro', options: [['hierro', 'Hierro'], ['aire', 'Aire']] },
    ],
    init(st) { st.tDC = 0.4; st.temp = 0; st.fase = 0; },
    layout(st) { st.cx = st.V.w / 2; st.cy = 44; },
    onParam(st, key, api) { if (key === 'fuente') { st.tDC = st.t + 0.15; st.temp = 0; } },
    step(st, dt) {
      const e = est4(st);
      st.fase += dt * 11 * Math.sign(e.phi);
      if (st.p.fuente === 'dc' && st.t > st.tDC) st.temp = Math.min(1, st.temp + dt * 0.22);
      else st.temp = Math.max(0, st.temp - dt * 0.4);
    },
    draw(g, st) {
      const { cx, cy } = st, e = est4(st), hierro = st.p.nucleo === 'hierro';
      nucleo(g, cx, cy, hierro);
      // Líneas de flujo
      const a = 0.12 + 0.85 * Math.abs(e.phi);
      g.setLineDash([2, 1.8]);
      g.lineDashOffset = -st.fase;
      g.lineWidth = 0.45;
      if (hierro) {
        [-2.6, 0, 2.6].forEach((d) => { rectNucleo(g, cx, cy, 23.5 + d, 17.5 + d); g.strokeStyle = `rgba(96,165,250,${a})`; g.stroke(); });
      } else {
        // Con aire casi todo el flujo se escapa alrededor de la primaria
        [[9, 18], [13, 23], [17, 28]].forEach(([rx, ry]) => { g.beginPath(); g.ellipse(cx - 23.5, cy, rx, ry, 0, 0, TAU); g.strokeStyle = `rgba(96,165,250,${a})`; g.stroke(); });
        g.beginPath(); g.ellipse(cx, cy, 25, 19, 0, 0, TAU); g.strokeStyle = `rgba(96,165,250,${a * 0.6})`; g.stroke();
      }
      g.setLineDash([]); g.lineDashOffset = 0;
      // Primaria y fuente
      const xs = cx - 44;
      D.line(g, cx - 30, cy - 13, xs, cy - 13, COL.alambre, 0.4); D.line(g, xs, cy - 13, xs, cy - 5, COL.alambre, 0.4);
      D.line(g, cx - 30, cy + 13, xs, cy + 13, COL.alambre, 0.4); D.line(g, xs, cy + 13, xs, cy + 5, COL.alambre, 0.4);
      if (st.p.fuente === 'ac') {
        D.circ(g, xs, cy, 5, 'rgba(0,0,0,0.3)', COL.alambre, 0.4);
        const p = [];
        for (let i = 0; i <= 20; i++) p.push([xs - 3 + i * 0.3, cy - 1.8 * Math.sin(i / 20 * TAU)]);
        D.poly(g, p, COL.I, 0.4);
      } else {
        D.line(g, xs, cy - 5, xs, cy - 1.2, COL.alambre, 0.4); D.line(g, xs, cy + 5, xs, cy + 1.2, COL.alambre, 0.4);
        D.line(g, xs - 4, cy - 1.2, xs + 4, cy - 1.2, COL.alambre, 0.6); D.line(g, xs - 2.2, cy + 1.2, xs + 2.2, cy + 1.2, COL.alambre, 0.9);
        D.txt(g, '+', xs + 5.5, cy - 2, { s: 2.6 });
      }
      const tp = st.temp;
      bobina(g, cx - 23.5, cy, 7, 26, `rgb(${Math.round(lerp(248, 255, tp))},${Math.round(lerp(113, 60, tp))},${Math.round(lerp(113, 20, tp))})`, 0.7 + tp * 0.4);
      if (tp > 0.05) D.glow(g, cx - 23.5, cy, 14, 'rgba(255,90,40,A)', tp * 0.7);
      // Secundaria y ampolleta
      const xb = cx + 44;
      bobina(g, cx + 23.5, cy, 6, 24, COL.ind);
      D.line(g, cx + 30, cy - 12, xb, cy - 12, COL.alambre, 0.4); D.line(g, xb, cy - 12, xb, cy - 4, COL.alambre, 0.4);
      D.line(g, cx + 30, cy + 12, xb, cy + 12, COL.alambre, 0.4); D.line(g, xb, cy + 12, xb, cy + 5, COL.alambre, 0.4);
      D.bulb(g, xb, cy, 3.6, Math.pow(Math.abs(e.Vs), 1.3));
      // Rótulos
      D.txt(g, 'Primaria', cx - 23.5, cy + 27, { s: 2.8, c: COL.I });
      D.txt(g, 'Secundaria', cx + 23.5, cy + 27, { s: 2.8, c: COL.ind });
      D.txt(g, hierro ? 'Núcleo de hierro' : 'Núcleo de aire', cx, cy - 26, { s: 2.8, c: COL.dim });
      if (st.p.fuente === 'dc') {
        const x = xs, y = cy + 20;
        g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(x - 1.2, y, 2.4, 10);
        g.fillStyle = `rgb(255,${Math.round(lerp(180, 50, tp))},40)`; g.fillRect(x - 1.2, y + 10 * (1 - tp), 2.4, 10 * tp);
        D.txt(g, 'temperatura', x, y + 13, { s: 2.3, c: COL.dim, min: 9 });
      }
      const msg = st.p.fuente === 'ac' ? 'El flujo cambia todo el tiempo → la ampolleta brilla'
        : (e.d === undefined || e.d < 0.9) ? 'Al conectar: un pulso de fem' : 'Flujo constante → V_s = 0, ampolleta apagada';
      D.txt(g, msg, cx, 6, { s: 2.9, fondo: 'rgba(0,0,0,0.35)' });
    },
    readouts(st) {
      const e = est4(st);
      return [['V_p', fmt(e.Vp, 2), COL.I], ['φ', fmt(e.phi, 2), COL.B], ['V_s', fmt(e.Vs, 2), COL.ind], ['Acoplamiento', Math.round(e.k * 100) + ' %']];
    },
    idea(st) {
      const e = est4(st);
      if (st.p.fuente === 'dc' && e.d > 0.9) return 'Sin cambio de flujo no hay fem: con DC la secundaria queda en $V_s=0$ y la primaria solo se calienta.';
      if (st.p.nucleo === 'aire') return 'Sin núcleo, la mayoría de las líneas se escapan: a la secundaria llega poco flujo.';
      return null;
    },
    plot: { series: [{ key: 'Vp', label: '$V_p(t)$', color: COL.I, max: 1.15 }, { key: 'phi', label: '$\\phi(t)$', color: COL.B, max: 1.15 }, { key: 'Vs', label: '$V_s(t)$', color: COL.ind, max: 1.15 }], span: 5 },
    sample(st) { return est4(st); },
  };
  wrapIdea('transformador-acdc');

  // ===================== 5. Balanza de potencia y línea de transmisión =====================
  function est5(st) {
    const r = Math.pow(10, st.p.rk);
    const Vp = 220, Ip = 10, Vs = Vp * r, Is = Ip / r;
    const V = Math.pow(10, st.p.vt), P = 50e6, R = 10, I = P / V;
    const perd = Math.min(P, I * I * R), frac = 1 - perd / P;
    return { r, Vp, Ip, Vs, Is, V, P, I, perd, frac };
  }
  S['potencia-linea'] = {
    controls: [
      { type: 'slider', key: 'rk', label: '$N_s/N_p$', min: -1, max: 1, step: 0.01, value: 0.3, fmt: (v) => fmt(Math.pow(10, v), 2) },
      { type: 'slider', key: 'vt', label: 'Voltaje de transmisión', min: Math.log10(20e3), max: Math.log10(500e3), step: 0.005, value: Math.log10(40e3), fmt: (v) => fmtSI(Math.pow(10, v), 'V', 0) },
    ],
    init(st) { st.fase = 0; st.humo = []; },
    step(st, dt) {
      const e = est5(st);
      st.fase += dt * (4 + 26 * Math.min(1, e.I / 2500));
      const W = st.V.w;
      if (Math.random() < dt * 14 * Math.max(0, (1 - e.frac) - 0.25)) st.humo.push({ x: lerp(22, W - 24, Math.random()), y: 60, v: 0 });
      st.humo.forEach((h) => { h.v += dt; h.y -= dt * 5; h.x += dt * 1.5; });
      st.humo = st.humo.filter((h) => h.v < 2.2);
    },
    draw(g, st) {
      const W = st.V.w, e = est5(st), cx = W / 2;
      // --- Arriba: transformador y balanza ---
      g.fillStyle = '#5b6168'; g.beginPath(); g.rect(cx - 8, 6, 16, 22); g.rect(cx - 4.5, 9.5, 9, 15); g.fill('evenodd');
      bobina(g, cx - 6.2, 17, 4, 13, COL.I, 0.5);
      bobina(g, cx + 6.2, 17, Math.max(2, Math.min(8, Math.round(4 * e.r))), 13, COL.ind, 0.5);
      const caja = (x0, x1, tit, V, I, col) => {
        D.rr(g, x0, 4, x1 - x0, 26, 2); g.fillStyle = 'rgba(0,0,0,0.28)'; g.fill();
        D.txt(g, tit, (x0 + x1) / 2, 8, { s: 2.8, c: col });
        D.txt(g, 'V = ' + fmtSI(V, 'V', 1), x0 + 2, 14, { s: 2.8, a: 'left' });
        D.txt(g, 'I = ' + fmtSI(I, 'A', 1), x0 + 2, 19.5, { s: 2.8, a: 'left' });
        D.txt(g, 'P = ' + fmtSI(V * I, 'W', 1), x0 + 2, 25, { s: 2.8, a: 'left', c: COL.oro });
      };
      caja(3, cx - 11, 'Primaria', e.Vp, e.Ip, COL.I);
      caja(cx + 11, W - 3, 'Secundaria', e.Vs, e.Is, COL.ind);
      // Balanza siempre equilibrada
      const by = 36;
      g.fillStyle = COL.dim; g.beginPath(); g.moveTo(cx, by); g.lineTo(cx - 2, by + 4); g.lineTo(cx + 2, by + 4); g.closePath(); g.fill();
      D.line(g, cx - 18, by, cx + 18, by, COL.oro, 0.5);
      [-18, 18].forEach((d) => { g.fillStyle = 'rgba(233,213,143,0.5)'; g.fillRect(cx + d - 4, by - 3.5, 8, 3.5); D.txt(g, 'P', cx + d, by - 1.8, { s: 2.2, c: '#222', min: 8 }); });
      D.txt(g, 'P entra = P sale', cx, by + 6.5, { s: 2.6, c: COL.oro });
      // --- Abajo: central → línea → ciudad ---
      const yl = 62, x0 = 20, x1 = W - 24;
      g.fillStyle = '#6b7280'; g.fillRect(4, yl - 2, 14, 12); g.fillRect(12, yl - 9, 3, 8);
      D.txt(g, 'Central', 11, yl + 14, { s: 2.5, c: COL.dim, min: 9 });
      const pts = [];
      for (let i = 0; i <= 40; i++) { const f = i / 40; pts.push([lerp(x0, x1, f), yl + 4 * Math.sin(f * Math.PI * 3) ** 2]); }
      for (let i = 0; i <= 3; i++) { const x = lerp(x0, x1, i / 3); D.line(g, x, yl - 1, x, 82, 'rgba(255,255,255,0.25)', 0.5); }
      const calor = 1 - e.frac;
      D.poly(g, pts, `rgb(${Math.round(lerp(170, 255, calor))},${Math.round(lerp(176, 70, calor))},${Math.round(lerp(186, 50, calor))})`, 0.7 + calor * 0.4);
      if (calor > 0.05) D.poly(g, pts, `rgba(255,80,40,${calor * 0.35})`, 2.2);
      D.puntos(g, pts, st.fase, Math.max(2.2, 7 - 5 * Math.min(1, e.I / 2500)), '#fde68a', 0.5);
      st.humo.forEach((h) => D.circ(g, h.x, h.y, 1 + h.v * 1.5, `rgba(180,180,180,${0.35 * (1 - h.v / 2.2)})`));
      // Ciudad
      const xc = W - 21;
      [[0, 14], [5, 20], [10, 11], [14, 17]].forEach(([dx, h], i) => {
        g.fillStyle = '#3f444a'; g.fillRect(xc + dx, 82 - h, 4.5, h);
        for (let j = 0; j < Math.floor(h / 3.2); j++) {
          const on = ((i * 7 + j * 3) % 10) / 10 < e.frac;
          g.fillStyle = on ? '#fde68a' : '#23262a';
          g.fillRect(xc + dx + 1.2, 82 - h + 1.2 + j * 3.2, 2, 1.6);
        }
      });
      D.txt(g, 'Ciudad', xc + 9, 86, { s: 2.5, c: COL.dim, min: 9 });
      D.txt(g, 'Llega ' + Math.round(e.frac * 100) + ' %', W / 2, 49, { s: 3, c: e.frac > 0.8 ? COL.ok : e.frac > 0.3 ? COL.oro : COL.mal, w: 700 });
    },
    readouts(st) {
      const e = est5(st);
      return [['Corriente en la línea', fmtSI(e.I, 'A', 0)], ['P entregada', fmtSI(e.P, 'W', 0)], ['P perdida = I²R', fmtSI(e.perd, 'W', 1), e.frac < 0.7 ? COL.mal : null], ['Llega a la ciudad', Math.round(e.frac * 100) + ' %']];
    },
  };

  // ===================== 6. Arma tu transformador =====================
  function est6(st) {
    const Np = st.p.Np, Ns = st.p.Ns, Vp = 12000, Vs = Vp * Ns / Np;
    return { Np, Ns, Vp, Vs, ok: Math.abs(Vs - 220) <= 12, elevador: Ns > Np };
  }
  S['arma-transformador'] = {
    controls: [
      { type: 'slider', key: 'Np', label: '$N_p$ (vueltas en alta tensión)', min: 100, max: 2400, step: 50, value: 1200, fmt: (v) => String(v) },
      { type: 'slider', key: 'Ns', label: '$N_s$ (vueltas hacia la casa)', min: 2, max: 300, step: 1, value: 100, fmt: (v) => String(v) },
    ],
    init(st) { st.fase = 0; },
    step(st, dt) { st.fase += dt * 10; },
    draw(g, st) {
      const W = st.V.w, e = est6(st), cy = 48, cx = W * 0.44;
      // Poste
      D.line(g, 7, 12, 7, 86, '#8b7355', 1.4); D.line(g, 2, 15, 12, 15, '#8b7355', 0.8);
      D.txt(g, '12 kV', 7, 9, { s: 2.8, c: COL.oro });
      // Núcleo y bobinas
      g.fillStyle = '#5b6168'; g.beginPath(); g.rect(cx - 22, cy - 18, 44, 36); g.rect(cx - 13, cy - 9, 26, 18); g.fill('evenodd');
      g.setLineDash([2, 1.8]); g.lineDashOffset = -st.fase * Math.sign(Math.sin(st.t * TAU * 0.4) || 1);
      g.strokeStyle = 'rgba(96,165,250,0.6)'; g.lineWidth = 0.4; g.strokeRect(cx - 17.5, cy - 13.5, 35, 27); g.setLineDash([]);
      const ip = e.Ns / e.Np, is = 1, tp = 0.35 + 0.9 * ip / (ip + is), ts = 0.35 + 0.9 * is / (ip + is);
      const nv = (N, a, b, lo, hi) => clamp(Math.round(lo + (hi - lo) * Math.log(N / a) / Math.log(b / a)), lo, hi);
      const np = nv(e.Np, 100, 2400, 3, 18), ns = nv(e.Ns, 2, 300, 2, 18);
      for (let i = 0; i < np; i++) { const y = cy - 15 + (i + 0.5) * 30 / np; D.line(g, cx - 23.5, y - 0.8, cx - 11.5, y + 0.8, COL.I, tp); }
      for (let i = 0; i < ns; i++) { const y = cy - 15 + (i + 0.5) * 30 / ns; D.line(g, cx + 11.5, y - 0.8, cx + 23.5, y + 0.8, COL.ind, ts); }
      D.line(g, 7, 15, cx - 17.5, 15, COL.alambre, 0.4); D.line(g, cx - 17.5, 15, cx - 17.5, cy - 15, COL.alambre, 0.4);
      D.txt(g, 'N_p = ' + e.Np, cx - 17.5, cy + 22, { s: 2.8, c: COL.I });
      D.txt(g, 'N_s = ' + e.Ns, cx + 17.5, cy + 22, { s: 2.8, c: COL.ind });
      // Casa
      const hx = W - 16, hy = 62;
      const xsal = cx + 17.5;
      D.line(g, xsal, cy - 15, xsal, 18, COL.alambre, ts * 0.8); D.line(g, xsal, 18, hx, 18, COL.alambre, ts * 0.8); D.line(g, hx, 18, hx, hy - 12, COL.alambre, ts * 0.8);
      D.puntos(g, [[xsal, cy - 15], [xsal, 18], [hx, 18], [hx, hy - 12]], st.fase * clamp(e.Vs / 220, 0.1, 3), 4, '#fde68a', 0.45);
      let colCasa = '#1f2226', aviso = '', colAviso = COL.ok;
      if (e.elevador) { colCasa = Math.sin(st.t * 12) > 0 ? 'rgba(239,68,68,0.9)' : '#3a1515'; aviso = '¡Elevador! Quemarías la casa'; colAviso = COL.mal; }
      else if (e.ok) { colCasa = '#fde68a'; aviso = '¡220 V! La casa se ilumina'; }
      else if (e.Vs > 232) { colCasa = Math.sin(st.t * 9) > 0 ? 'rgba(251,146,60,0.85)' : '#2a2018'; aviso = 'Voltaje muy alto'; colAviso = COL.E; }
      else { colCasa = `rgba(253,230,138,${clamp(e.Vs / 220, 0, 1) * 0.5})`; aviso = 'Voltaje muy bajo'; colAviso = COL.dim; }
      if (e.ok) D.glow(g, hx, hy, 14, 'rgba(253,230,138,A)', 0.7);
      g.fillStyle = '#4b5056'; g.beginPath(); g.moveTo(hx - 9, hy - 6); g.lineTo(hx, hy - 13); g.lineTo(hx + 9, hy - 6); g.closePath(); g.fill();
      g.fillStyle = '#3a3e43'; g.fillRect(hx - 8, hy - 6, 16, 14);
      g.fillStyle = colCasa; g.fillRect(hx - 6, hy - 3.5, 4.5, 4); g.fillRect(hx + 1.5, hy - 3.5, 4.5, 4);
      // Medidor
      D.rr(g, hx - 12, hy + 12, 24, 9, 1.5); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fill();
      D.txt(g, fmtSI(e.Vs, 'V', e.Vs < 1000 ? 0 : 1), hx, hy + 16.5, { s: 3.2, c: e.ok ? COL.ok : e.elevador ? COL.mal : COL.oro, w: 700 });
      D.txt(g, 'Objetivo: 220 V para la casa', W / 2, 5, { s: 2.9, c: COL.txt, fondo: 'rgba(0,0,0,0.35)' });
      D.txt(g, aviso, cx, 85, { s: 3, c: colAviso, w: 700 });
    },
    readouts(st) {
      const e = est6(st);
      return [['V_s', fmtSI(e.Vs, 'V', 1), e.ok ? COL.ok : null], ['N_s/N_p', fmt(e.Ns / e.Np, 4)], ['I_s/I_p = N_p/N_s', fmt(e.Np / e.Ns, 1)]];
    },
  };

  // ===================== 7. La primaria responde a la carga =====================
  function est7(st) {
    const n = st.p.n, Is = 0.5 * n, Ip = 0.02 + Is / 2, P = 110 * Is;
    return { n, Is, Ip, P };
  }
  S['primaria-carga'] = {
    controls: [{ type: 'slider', key: 'n', label: 'Carga (ampolletas encendidas)', min: 0, max: 4, step: 1, value: 0, fmt: (v) => String(v) }],
    init(st) { st.fase = 0; },
    step(st, dt) { st.fase += dt * 9; },
    draw(g, st) {
      const W = st.V.w, e = est7(st), cy = 44, cx = st.ancho ? W * 0.4 : W * 0.38;
      const dir = Math.sin(st.t * TAU * 0.35) >= 0 ? 1 : -1;
      g.fillStyle = '#5b6168'; g.beginPath(); g.rect(cx - 24, cy - 22, 48, 44); g.rect(cx - 13, cy - 11, 26, 22); g.fill('evenodd');
      const capa = (d, color, w, s) => {
        if (w <= 0) return;
        g.setLineDash([2, 1.6]); g.lineDashOffset = -st.fase * s;
        g.strokeStyle = color; g.lineWidth = w; g.strokeRect(cx - 18.5 - d, cy - 16.5 - d, 37 + 2 * d, 33 + 2 * d);
        g.setLineDash([]); g.lineDashOffset = 0;
      };
      const mp = (0.04 + e.Is) / 2.04, ms = e.Is / 2.04;
      capa(3.3, 'rgba(96,165,250,0.95)', 0.3 + 1.3 * mp, dir);
      if (e.Is > 0) capa(0, 'rgba(74,222,128,0.95)', 0.3 + 1.3 * ms, -dir);
      capa(-3.3, 'rgba(255,255,255,0.9)', 0.55, dir);
      // Primaria y red
      bobina(g, cx - 18.5, cy, 8, 30, COL.I, 0.5 + mp * 0.8);
      const xr = cx - 36;
      D.line(g, cx - 25, cy - 15, xr, cy - 15, COL.alambre, 0.4); D.line(g, xr, cy - 15, xr, cy - 5, COL.alambre, 0.4);
      D.line(g, cx - 25, cy + 15, xr, cy + 15, COL.alambre, 0.4); D.line(g, xr, cy + 15, xr, cy + 5, COL.alambre, 0.4);
      D.circ(g, xr, cy, 5, 'rgba(0,0,0,0.3)', COL.alambre, 0.4);
      D.txt(g, 'Red', xr, cy, { s: 2.6, min: 9 });
      D.puntos(g, [[xr, cy - 5], [xr, cy - 15], [cx - 25, cy - 15]], st.fase * e.Ip * 2 * dir, 3.5, '#fde68a', 0.45);
      // Secundaria y ampolletas
      bobina(g, cx + 18.5, cy, 4, 30, COL.ind, 0.5 + ms * 1.2);
      const pos = st.ancho ? [0, 1, 2, 3].map((i) => [cx + 40 + i * 13, cy]) : [[cx + 38, cy - 9], [cx + 52, cy - 9], [cx + 38, cy + 11], [cx + 52, cy + 11]];
      const xb = cx + 30;
      D.line(g, cx + 25, cy - 15, xb, cy - 15, COL.alambre, 0.4); D.line(g, cx + 25, cy + 15, xb, cy + 15, COL.alambre, 0.4);
      D.line(g, xb, cy - 15, xb, cy + 15, COL.alambre, 0.4);
      pos.forEach(([x, y], i) => {
        D.line(g, xb, y - 4, x, y - 4, 'rgba(203,213,225,0.5)', 0.3);
        D.bulb(g, x, y, 3, i < e.n ? 0.9 : 0);
      });
      D.puntos(g, [[cx + 25, cy - 15], [xb, cy - 15]], st.fase * e.Is * dir, 3.5, '#fde68a', 0.45);
      // Leyenda
      const ly = 79;
      D.txt(g, '— primaria', 4, ly, { s: 2.6, c: COL.B, a: 'left', min: 9 });
      D.txt(g, '— secundaria (opuesto)', 4 + (st.ancho ? 30 : 0), st.ancho ? ly : ly + 4.5, { s: 2.6, c: COL.ind, a: 'left', min: 9 });
      D.txt(g, '— flujo neto (constante)', st.ancho ? 88 : 4, st.ancho ? ly : ly + 9, { s: 2.6, c: '#fff', a: 'left', min: 9 });
      D.txt(g, 'Red: ' + fmtSI(e.P, 'W', 0).replace('0 W', '≈ 0 W'), cx, 5, { s: 3, c: COL.oro, fondo: 'rgba(0,0,0,0.35)', w: 700 });
    },
    readouts(st) {
      const e = est7(st);
      return [['I_p', fmt(e.Ip, 2) + ' A', COL.I], ['I_s', fmt(e.Is, 2) + ' A', COL.ind], ['Potencia de la red', e.n ? fmt(e.P, 0) + ' W' : '≈ 0 W', COL.oro]];
    },
  };

  // ===================== 8. Tres escenarios =====================
  function est8(st) {
    const W = st.V.w, s = 20, esc = st.p.esc;
    if (esc === 'a') { const x = W / 2 - s / 2; return { x, phi: st.p.B * 1, s }; }
    if (esc === 'b') return { x: st.xb, phi: 1, s };
    const wx = st.wx, x = st.xc;
    const phi = 6 * Math.log((x + s - wx) / (x - wx));
    return { x, phi, s, eps: 6 * st.p.v * 6 * (1 / (x - wx) - 1 / (x + s - wx)) };
  }
  S['tres-escenarios'] = {
    controls: [
      { type: 'toggle', key: 'esc', label: 'Escenario', value: 'a', options: [['a', '(a) Quieta, campo intenso'], ['b', '(b) Se traslada'], ['c', '(c) Se aleja del alambre']] },
      { type: 'slider', key: 'B', label: 'Intensidad de $B$', min: 0.5, max: 5, step: 0.1, value: 3, fmt: (v) => fmt(v, 1) + ' T', show: (p) => p.esc === 'a' },
      { type: 'slider', key: 'v', label: 'Velocidad', min: 0.5, max: 3, step: 0.1, value: 1.4, fmt: (v) => fmt(v, 1), show: (p) => p.esc !== 'a' },
      { type: 'check', key: 'lados', label: 'Ver fem en cada lado ($vBL$)', value: true, show: (p) => p.esc === 'b' },
    ],
    init(st) { st.xb = 10; st.xc = null; st.phiPrev = null; st.eps = 0; },
    layout(st) { st.wx = st.ancho ? 16 : 12; if (st.xc === null) st.xc = st.wx + 5; },
    onParam(st, key, api) { if (key === 'esc') { st.xb = 10; st.xc = st.wx + 5; st.phiPrev = null; st.eps = 0; api.limpiarGrafico(); } },
    step(st, dt) {
      const W = st.V.w;
      if (st.p.esc === 'b') { st.xb += st.p.v * 9 * dt; if (st.xb > W) st.xb = -20; }
      if (st.p.esc === 'c') { st.xc += st.p.v * 6 * dt; if (st.xc > W - 26) st.xc = st.wx + 5; }
      const e = est8(st);
      if (st.p.esc === 'c') st.eps = e.eps;
      else if (st.p.esc === 'b') st.eps = 0;
      else {
        // (a): solo hay fem mientras se mueve el deslizador de B
        const d = st.phiPrev === null ? 0 : -(e.phi - st.phiPrev) / dt;
        st.eps = lerp(st.eps, clamp(d, -40, 40), 0.35);
        if (Math.abs(st.eps) < 0.01) st.eps = 0;
      }
      st.phiPrev = e.phi;
    },
    draw(g, st) {
      const W = st.V.w, e = est8(st), esc = st.p.esc, cy = 44, s = e.s;
      // Campo de fondo
      if (esc === 'c') {
        const wx = st.wx;
        D.line(g, wx, 2, wx, 88, COL.alambre, 0.9);
        D.arrow(g, wx + 2.5, 30, wx + 2.5, 18, COL.I, 0.5);
        D.txt(g, 'I', wx + 5, 22, { s: 3, c: COL.I });
        for (let x = wx + 6; x < W - 2; x += 8) for (let y = 8; y < 80; y += 8) D.entra(g, x, y, clamp(14 / (x - wx), 0.4, 2.2), 'rgba(96,165,250,0.6)', 0.25);
        for (let y = 8; y < 80; y += 8) D.sale(g, wx - 6, y, clamp(14 / 6, 0.4, 2.2), 'rgba(96,165,250,0.4)', 0.25);
      } else {
        const r = esc === 'a' ? 0.6 + st.p.B * 0.32 : 1.3;
        for (let x = 6; x < W; x += 9) for (let y = 7; y < 82; y += 9) D.entra(g, x, y, r, 'rgba(96,165,250,0.55)', 0.25);
      }
      // Espira
      const x = e.x, y = cy - s / 2;
      g.fillStyle = COL.flux; g.fillRect(x, y, s, s);
      g.strokeStyle = COL.alambre; g.lineWidth = 0.8; g.strokeRect(x, y, s, s);
      if (esc === 'b' && st.p.lados) {
        D.arrow(g, x - 1.8, y + s * 0.75, x - 1.8, y + s * 0.25, COL.ind, 0.5);
        D.arrow(g, x + s + 1.8, y + s * 0.75, x + s + 1.8, y + s * 0.25, COL.ind, 0.5);
        D.txt(g, 'vBL', x - 4.8, cy, { s: 2.4, c: COL.ind, min: 9 });
        D.txt(g, 'vBL', x + s + 4.8, cy, { s: 2.4, c: COL.ind, min: 9 });
        D.txt(g, 'iguales y opuestas en la espira → se cancelan', W / 2, 84, { s: 2.6, c: COL.ind, fondo: 'rgba(0,0,0,0.35)' });
      }
      if (esc !== 'a') D.arrow(g, x + s / 2 - 4, y - 3, x + s / 2 + 4, y - 3, COL.txt, 0.4);
      // Corriente inducida (horaria: B entrante que disminuye)
      const ie = st.eps;
      if (Math.abs(ie) > 0.02) {
        const L = clamp(Math.abs(ie) * 1.6, 1.5, 6), sg = Math.sign(ie);
        const m = [[x + s / 2, y, 1, 0], [x + s, cy, 0, 1], [x + s / 2, y + s, -1, 0], [x, cy, 0, -1]];
        m.forEach(([px, py, dx, dy]) => D.arrow(g, px - dx * L / 2 * sg, py - dy * L / 2 * sg, px + dx * L / 2 * sg, py + dy * L / 2 * sg, COL.ind, 0.6));
      }
      // Galvanómetro
      const gx = W - 13, gy = 84;
      g.beginPath(); g.arc(gx, gy, 8, Math.PI, TAU); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fill(); g.strokeStyle = COL.dim; g.lineWidth = 0.3; g.stroke();
      const ang = -Math.PI / 2 + clamp(ie / 3, -1, 1) * 1.1;
      D.line(g, gx, gy, gx + Math.cos(ang) * 7, gy + Math.sin(ang) * 7, Math.abs(ie) > 0.02 ? COL.ind : COL.txt, 0.45);
      D.txt(g, 'ε', gx, gy - 10.5, { s: 2.6, c: COL.dim, min: 9 });
    },
    readouts(st) {
      const e = est8(st);
      return [['φ', fmt(e.phi, 2) + ' (u.a.)', COL.E], ['ε', fmt(st.eps, 2) + ' (u.a.)', COL.ind]];
    },
    idea(st) {
      if (st.p.esc === 'a') return Math.abs(st.eps) > 0.02 ? '¡Mientras $B$ cambia sí hay fem! Quieto, el flujo es constante → $\\varepsilon=0$.' : 'Flujo constante → $\\varepsilon=0$, aunque $B$ sea enorme.';
      if (st.p.esc === 'b') return 'Flujo constante → $\\varepsilon=0$: la espira se mueve, pero $B$, $A$ y $\\theta$ no cambian.';
      return 'Flujo disminuyendo → hay corriente (horaria: trata de mantener el flujo que entra).';
    },
    plot: { series: [{ key: 'phi', label: '$\\phi(t)$', color: COL.E }, { key: 'eps', label: '$\\varepsilon(t)$', color: COL.ind }], span: 6 },
    sample(st) { return { phi: est8(st).phi, eps: st.eps }; },
  };

  // ===================== 9. Universo con signo + vs signo − =====================
  const g9 = 9.8, L9 = 0.5;
  S['signo-faraday'] = {
    controls: [
      { type: 'toggle', key: 'signo', label: 'Signo de Faraday', value: 'menos', options: [['menos', '− (real)'], ['mas', '+ (hipotético)']] },
      { type: 'slider', key: 'm', label: 'Masa $m$', min: 0.05, max: 0.4, step: 0.01, value: 0.1, fmt: (v) => fmt(v, 2) + ' kg' },
      { type: 'slider', key: 'B', label: 'Campo $B$', min: 0.4, max: 1.6, step: 0.05, value: 1, fmt: (v) => fmt(v, 2) + ' T' },
      { type: 'slider', key: 'R', label: 'Resistencia $R$', min: 0.3, max: 3, step: 0.05, value: 1, fmt: (v) => fmt(v, 2) + ' Ω' },
    ],
    init(st) { st.v = 0; st.h = 0; st.Q = 0; st.yoff = 0; st.boom = 0; },
    onParam(st, key, api) { if (key === 'signo') { this.init(st); st.t = 0; api.limpiarGrafico(); } },
    vT(st) { return st.p.m * g9 * st.p.R / (st.p.B * st.p.B * L9 * L9); },
    step(st, dt, api) {
      const k = st.p.B * st.p.B * L9 * L9 / st.p.R, s = st.p.signo === 'menos' ? -1 : 1;
      const n = 6, h = dt / n;
      for (let i = 0; i < n; i++) {
        const a = g9 + s * k * st.v / st.p.m;
        st.v = Math.min(1e5, st.v + a * h);
        st.h += st.v * h;
        st.Q += k * st.v * st.v * h;
      }
      st.yoff += Math.min(st.v, 14) * dt * 7;
      if (s > 0 && st.v > 30 * this.vT(st)) { st.boom += dt; if (st.boom > 2) { this.init(st); st.t = 0; api.limpiarGrafico(); } }
    },
    draw(g, st) {
      const W = st.V.w, cx = st.ancho ? W * 0.3 : W * 0.3, by = 52, hw = 12;
      const k = st.p.B * st.p.B * L9 * L9 / st.p.R, s = st.p.signo === 'menos' ? -1 : 1;
      // Campo ⊗ que "sube" (la cámara sigue a la barra)
      const off = st.yoff % 9;
      for (let x = cx - hw + 3; x < cx + hw; x += 7) for (let y = 14 - off; y < 92; y += 9) if (y > 13) D.entra(g, x, y, 1.1, 'rgba(96,165,250,0.45)', 0.22);
      // Rieles y resistencia (arriba)
      D.line(g, cx - hw, 10, cx - hw, 90, COL.alambre, 0.6); D.line(g, cx + hw, 10, cx + hw, 90, COL.alambre, 0.6);
      const pot = k * st.v * st.v, brillo = clamp(pot / (st.p.m * g9 * this.vT(st) * 1.2), 0, 1);
      D.glow(g, cx, 10, 9, 'rgba(255,120,40,A)', brillo);
      D.resistor(g, cx - hw, 10, cx + hw, 10, `rgb(255,${Math.round(lerp(200, 90, brillo))},${Math.round(lerp(200, 40, brillo))})`, 0.5, 8);
      D.txt(g, 'R', cx, 5, { s: 2.8 });
      // Barra
      g.fillStyle = '#cfd6dd'; g.fillRect(cx - hw - 1, by - 1.1, 2 * hw + 2, 2.2);
      const I = st.p.B * L9 * st.v / st.p.R;
      if (I > 0.01) {
        const sg = s < 0 ? 1 : -1;
        D.arrow(g, cx - sg * 6, by + 3.3, cx + sg * 6, by + 3.3, COL.ind, 0.5);
        D.txt(g, 'I', cx, by + 6.5, { s: 2.6, c: COL.ind });
      }
      // Fuerzas
      const fg = st.p.m * g9, fm = k * st.v, esc = 10 / fg;
      D.arrow(g, cx + hw + 4, by, cx + hw + 4, by + 10, COL.dim, 0.5);
      D.txt(g, 'mg', cx + hw + 7.5, by + 6, { s: 2.6, c: COL.dim, min: 9 });
      if (fm > 0.001) {
        const L = clamp(fm * esc, 0.8, 22);
        D.arrow(g, cx - hw - 4, by, cx - hw - 4, by + (s < 0 ? -L : L), COL.F, 0.6);
        D.txt(g, 'F_B', cx - hw - 8, by + (s < 0 ? -4 : 4), { s: 2.6, c: COL.F, min: 9 });
      }
      // Energías
      const x0 = st.ancho ? W * 0.58 : W * 0.6, x1 = W - 4, bw = x1 - x0;
      const U = st.p.m * g9 * st.h, Kc = 0.5 * st.p.m * st.v * st.v, Q = st.Q;
      const m = Math.max(U, Kc + Q, 1e-6) * 1.05;
      D.txt(g, 'Energías', x0 + bw / 2, 16, { s: 2.9, c: COL.txt });
      D.txt(g, 'Potencial que se pierde (mgh)', x0, 23, { s: 2.4, a: 'left', c: COL.dim, min: 9 });
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x0, 26, bw, 4); g.fillStyle = COL.B; g.fillRect(x0, 26, bw * U / m, 4);
      D.txt(g, 'Cinética + calor', x0, 35, { s: 2.4, a: 'left', c: COL.dim, min: 9 });
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x0, 38, bw, 4);
      g.fillStyle = '#e5e7eb'; g.fillRect(x0, 38, bw * Kc / m, 4);
      g.fillStyle = COL.E; g.fillRect(x0 + bw * Kc / m, 38, bw * Q / m, 4);
      D.txt(g, 'cinética', x0, 46, { s: 2.2, a: 'left', c: '#e5e7eb', min: 8.5 });
      D.txt(g, 'calor I²R', x0 + bw, 46, { s: 2.2, a: 'right', c: COL.E, min: 8.5 });
      if (s > 0 && st.t > 0.8) {
        D.txt(g, '¡Energía de la nada!', x0 + bw / 2, 58, { s: 3.4, c: COL.mal, w: 700 });
        D.txt(g, 'Imposible.', x0 + bw / 2, 63.5, { s: 3.4, c: COL.mal, w: 700 });
      } else if (s < 0) D.txt(g, 'Cuadra: mgh = cinética + calor', x0 + bw / 2, 58, { s: 2.5, c: COL.ok, min: 9 });
      D.txt(g, 'v_T = mgR/(B²L²) = ' + fmt(this.vT(st), 2) + ' m/s', x0 + bw / 2, 75, { s: 2.6, c: COL.oro, min: 9 });
    },
    readouts(st) {
      const k = st.p.B * st.p.B * L9 * L9 / st.p.R;
      return [['v', st.v > 999 ? '→ ∞' : fmt(st.v, 2) + ' m/s'], ['v_T', fmt(this.vT(st), 2) + ' m/s', COL.oro], ['Calor I²R', fmtSI(k * st.v * st.v, 'W', 2), COL.E], ['mg·v', fmtSI(st.p.m * g9 * st.v, 'W', 2)]];
    },
    idea(st) { return st.p.signo === 'mas' ? 'Con signo $+$ la fuerza empuja a favor: la barra se acelera sola y la energía no cuadra.' : null; },
    plot: { series: [{ key: 'v', label: '$v(t)$', color: COL.txt }, { key: 'vT', label: '$v_T$', color: COL.oro, dash: true }], span: 6, shared: true },
    sample(st) { return { v: Math.min(st.v, 40 * this.vT(st)), vT: this.vT(st) }; },
  };
  wrapIdea('signo-faraday');

  // Cuando idea() devuelve null se usa la idea clave del contenido
  function wrapIdea(id) {
    const def = S[id], f = def.idea;
    def.idea = function (st) { const r = f.call(def, st); return r === null || r === undefined ? st.ideaBase : r; };
  }
  window.Motor.wrapIdea = wrapIdea;
})();
