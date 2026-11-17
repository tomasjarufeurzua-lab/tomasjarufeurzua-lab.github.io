// Animaciones de las preguntas 10 a 18 (Faraday–Lenz e inductancia).
// Convención: x a la derecha, y hacia abajo (lienzo), z sale de la pantalla (⊙).
(function () {
  'use strict';
  const { COL, D, TAU, clamp, lerp, fmt, fmtSI, wrapIdea } = window.Motor;
  const S = window.SIMS;

  // ===================== 10. Imán y aro =====================
  // Flujo del imán por el aro según la distancia d (dipolo sobre el eje, normalizado)
  const f10 = (d) => 1 / Math.pow(1 + (d / 14) ** 2, 1.5);
  const df10 = (d) => -3 * d / 196 * Math.pow(1 + (d / 14) ** 2, -2.5);
  S['iman-aro'] = {
    controls: [
      { type: 'toggle', key: 'polo', label: 'Polo enfrentado al aro', value: 'N', options: [['N', 'Norte'], ['S', 'Sur']] },
      { type: 'toggle', key: 'modo', label: 'Movimiento', value: 'auto', options: [['auto', 'Acercar y alejar solo'], ['manual', 'Manual (arrastra el imán)']] },
      { type: 'slider', key: 'd', label: 'Distancia imán–aro', min: 4, max: 60, step: 0.5, value: 30, fmt: (v) => fmt(v, 0), show: (p) => p.modo === 'manual' },
    ],
    init(st) { st.ph = 0; st.dd = 0; st.dPrev = null; st.dist = 30; st.ang = 0; st.phi = 0; st.dphi = 0; st.ind = 0; },
    layout(st) { st.rx = st.V.w * (st.ancho ? 0.68 : 0.72); st.cy = 52; st.dmax = st.rx - 30; },
    onParam(st, key) { if (key === 'd') st.p.d = Math.min(st.p.d, st.dmax); },
    step(st, dt) {
      let d;
      if (st.p.modo === 'auto') { st.ph += dt; const lejos = Math.min(st.dmax, 36); d = 5 + (lejos - 5) * 0.5 * (1 + Math.cos(st.ph * TAU / 4)); st.p.d = d; }
      else d = Math.min(st.p.d, st.dmax);
      const v = st.dPrev === null ? 0 : (d - st.dPrev) / dt;
      st.dd = st.p.modo === 'auto' ? v : lerp(st.dd, v, 0.25);
      st.dPrev = d; st.dist = d;
      const s = st.p.polo === 'N' ? 1 : -1;
      st.phi = s * f10(d);
      st.dphi = s * df10(d) * st.dd;
      st.ind = -st.dphi; // > 0: B inducido hacia +x (alejándose del imán)
      st.ang += dt * clamp(st.ind * 4, -7, 7);
    },
    draw(g, st) {
      const W = st.V.w, { rx, cy } = st, R = 14, s = st.p.polo === 'N' ? 1 : -1, d = st.dist, xm = rx - d;
      const indN = clamp(st.ind / 1.4, -1, 1), activo = Math.abs(indN) > 0.04;
      const pAro = (th) => [rx + 0.35 * R * Math.sin(th), cy - R * Math.cos(th)];
      // Mitad de atrás del aro
      g.beginPath();
      for (let i = 0; i <= 40; i++) { const [x, y] = pAro(Math.PI + i / 40 * Math.PI); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = 'rgba(203,213,225,0.45)'; g.lineWidth = 1; g.stroke();
      // Líneas del imán que atraviesan el aro (más líneas cuanto más cerca)
      const nl = Math.max(1, Math.round(1 + 5 * f10(d)));
      for (let i = 0; i < nl; i++) {
        const yo = nl === 1 ? 0 : (i / (nl - 1) - 0.5) * 2 * R * 0.72;
        g.beginPath(); g.moveTo(xm, cy + yo * 0.25);
        g.bezierCurveTo(xm + d * 0.4, cy + yo * 0.6, rx - 6, cy + yo, rx, cy + yo);
        g.lineTo(rx + 10, cy + yo * 1.25);
        g.strokeStyle = 'rgba(96,165,250,0.6)'; g.lineWidth = 0.4; g.stroke();
        D.head(g, rx + 6, cy + yo * 1.15, s > 0 ? 0 : Math.PI, 'rgba(96,165,250,0.9)', 1.6);
      }
      // Imán
      const L = 26;
      g.fillStyle = s > 0 ? 'rgba(59,130,246,0.9)' : 'rgba(239,68,68,0.9)'; g.fillRect(xm - L, cy - 4.5, L / 2, 9);
      g.fillStyle = s > 0 ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)'; g.fillRect(xm - L / 2, cy - 4.5, L / 2, 9);
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 0.3; g.strokeRect(xm - L, cy - 4.5, L, 9);
      D.txt(g, s > 0 ? 'S' : 'N', xm - L * 0.75, cy, { s: 3.4, w: 700 });
      D.txt(g, s > 0 ? 'N' : 'S', xm - L * 0.25, cy, { s: 3.4, w: 700 });
      // Fuerza sobre el imán: repele al acercarse, atrae al alejarse
      if (activo) {
        const Lf = 3 + 10 * Math.abs(indN), dir = Math.sign(st.dd);
        D.arrow(g, xm - L / 2, cy - 8, xm - L / 2 + dir * Lf, cy - 8, COL.F, 0.6);
        D.txt(g, dir < 0 ? 'repele' : 'atrae', xm - L / 2, cy - 12, { s: 2.6, c: COL.F, min: 9 });
      }
      // B inducido
      if (activo) {
        const Lb = 4 + 11 * Math.abs(indN);
        g.setLineDash([1, 0.8]); D.arrow(g, rx, cy, rx + Math.sign(indN) * Lb, cy, COL.B, 0.55); g.setLineDash([]);
        D.txt(g, 'B_ind', rx + Math.sign(indN) * (Lb + 4.5), cy + 3.5, { s: 2.5, c: COL.B, min: 9, fondo: 'rgba(0,0,0,0.45)' });
      }
      // Mitad de adelante del aro y corriente inducida
      g.beginPath();
      for (let i = 0; i <= 40; i++) { const [x, y] = pAro(i / 40 * Math.PI); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = '#d6dde4'; g.lineWidth = 1.2; g.stroke();
      if (activo) {
        for (let k = 0; k < 4; k++) {
          const th = st.ang + k * Math.PI / 2, [x, y] = pAro(th), sg = Math.sign(indN);
          D.head(g, x, y, Math.atan2(R * Math.sin(th) * sg, 0.35 * R * Math.cos(th) * sg), COL.ind, 1.8 + 1.2 * Math.abs(indN));
        }
        // La cara que mira al imán se comporta como un polo
        const cara = indN < 0 ? 'N' : 'S';
        D.circ(g, rx - 8, cy - R - 3, 2.6, cara === 'N' ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)');
        D.txt(g, cara, rx - 8, cy - R - 3, { s: 2.6, w: 700, min: 9 });
        D.txt(g, 'el aro actúa como polo ' + cara, rx - 8, cy - R - 8, { s: 2.4, c: COL.dim, min: 9 });
      }
      // Vista desde el imán
      const ix = st.ancho ? 14 : 12, iy = 13, ir = 6;
      D.circ(g, ix, iy, ir + 3.4, 'rgba(0,0,0,0.3)');
      D.circ(g, ix, iy, ir, null, '#d6dde4', 0.7);
      if (activo) for (let k = 0; k < 3; k++) {
        const a = st.ang + k * TAU / 3, sg = Math.sign(indN);
        D.head(g, ix + ir * Math.cos(a), iy + ir * Math.sin(a), Math.atan2(Math.cos(a) * sg, -Math.sin(a) * sg), COL.ind, 1.7);
      }
      D.txt(g, 'Vista desde el imán', ix + 11, iy - 3, { s: 2.4, c: COL.dim, a: 'left', min: 9 });
      D.txt(g, activo ? (indN < 0 ? 'antihoraria' : 'horaria') : 'sin corriente', ix + 11, iy + 2.5, { s: 2.7, c: activo ? COL.ind : COL.dim, a: 'left', w: 700 });
      if (st.p.modo === 'manual') D.txt(g, '↔ arrastra el imán', xm - L / 2, cy + 9, { s: 2.4, c: COL.dim, min: 9 });
    },
    pointer: {
      hit(st, x, y) { const xm = st.rx - st.dist; return x > xm - 28 && x < xm + 2 && Math.abs(y - st.cy) < 7; },
      down(st, x) { st.p.modo = 'manual'; st.agarre = x - (st.rx - st.dist); },
      move(st, x) { st.p.d = clamp(st.rx - (x - st.agarre), 4, st.dmax); if (!st.playing) st.dist = st.p.d; },
    },
    readouts(st) {
      return [['φ', fmt(st.phi, 2) + ' (u.a.)', COL.B], ['dφ/dt', fmt(st.dphi, 2), COL.E], ['I inducida', fmt(Math.abs(st.ind), 2) + ' (u.a.)', COL.ind]];
    },
    idea(st) {
      if (Math.abs(st.ind) < 0.05) return Math.abs(st.dd) < 0.5 ? 'Si el imán no se mueve, el flujo no cambia: no hay corriente.' : 'Lejos del aro el flujo casi no cambia: casi no hay corriente.';
      return st.dd < 0 ? 'Se acerca → el flujo aumenta → el aro repele.' : 'Se aleja → el flujo disminuye → el aro atrae.';
    },
  };

  // ===================== 11. Separación de cargas =====================
  function aleatorio(semilla) {
    let x = semilla;
    return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
  }
  S['barra-cargas'] = {
    controls: [
      { type: 'slider', key: 'v', label: 'Velocidad $v$', min: 1, max: 10, step: 0.5, value: 5, fmt: (v) => fmt(v, 1) + ' m/s' },
      { type: 'slider', key: 'B', label: 'Campo $B$', min: 0.1, max: 1, step: 0.05, value: 0.6, fmt: (v) => fmt(v, 2) + ' T' },
      { type: 'slider', key: 'L', label: 'Largo $L$', min: 0.2, max: 1, step: 0.05, value: 0.6, fmt: (v) => fmt(v, 2) + ' m' },
      { type: 'check', key: 'rieles', label: 'Conectar a rieles con resistencia', value: false },
    ],
    init(st) {
      st.xb = 16; st.sig = 0; st.fase = 0;
      const r = aleatorio(7);
      st.q = [];
      for (let i = 0; i < 9; i++) { st.q.push({ s: 1, fx: r() - 0.5, y0: r(), k: i }); st.q.push({ s: -1, fx: r() - 0.5, y0: r(), k: i }); }
    },
    step(st, dt) {
      const W = st.V.w;
      st.xb += (3 + st.p.v * 1.6) * dt;
      if (st.xb > W - 10) { st.xb = 16; st.sig = 0; }
      st.sig += dt * 2.6 * (1 - st.sig);
      st.fase += dt * 3 * st.p.v * st.p.B * st.p.L * 4;
    },
    draw(g, st) {
      const W = st.V.w, cy = 46, Lv = 12 + 30 * (st.p.L - 0.2) / 0.8, top = cy - Lv / 2, bot = cy + Lv / 2, x = st.xb;
      for (let gx = 6; gx < W; gx += 9) for (let gy = 6; gy < 88; gy += 9) D.sale(g, gx, gy, 1, 'rgba(96,165,250,0.5)', 0.25);
      if (st.p.rieles) {
        D.line(g, 8, top, W - 3, top, COL.alambre, 0.5); D.line(g, 8, bot, W - 3, bot, COL.alambre, 0.5);
        D.resistor(g, 8, top, 8, bot, COL.alambre, 0.5);
        D.txt(g, 'R', 4, cy, { s: 2.8 });
        D.puntos(g, [[x, top], [x, bot], [8, bot], [8, top], [x, top]], st.fase, 4, COL.ind, 0.6);
        D.arrow(g, x, top - 3, x - 9, top - 3, COL.F, 0.6);
        D.txt(g, 'frena', x - 4.5, top - 6.5, { s: 2.5, c: COL.F, min: 9 });
      }
      g.fillStyle = 'rgba(207,214,221,0.92)'; g.fillRect(x - 2, top, 4, Lv);
      // Cargas que se separan: + abajo, − arriba
      st.q.forEach((q) => {
        const y0 = top + 1.4 + q.y0 * (Lv - 2.8);
        const yt = q.s > 0 ? bot - 1.4 - (q.k / 9) * Lv * 0.3 : top + 1.4 + (q.k / 9) * Lv * 0.3;
        const y = lerp(y0, yt, st.sig);
        D.circ(g, x + q.fx * 2.6, y, 0.75, q.s > 0 ? COL.I : COL.B);
      });
      D.txt(g, '−', x + 5, top + 1, { s: 3.2, c: COL.B, w: 700 });
      D.txt(g, '+', x + 5, bot - 1, { s: 3.2, c: COL.I, w: 700 });
      // Fuerzas sobre una carga positiva
      const yf = cy + Lv * 0.15;
      D.arrow(g, x + 8, yf, x + 8, yf + 7, COL.F, 0.5);
      D.txt(g, 'F_B = qv×B', x + 10, yf + 5, { s: 2.4, c: COL.F, a: 'left', min: 9 });
      if (st.sig > 0.05) {
        D.arrow(g, x + 8, yf, x + 8, yf - 7 * st.sig, COL.E, 0.5);
        D.txt(g, 'F_E = qE', x + 10, yf - 4, { s: 2.4, c: COL.E, a: 'left', min: 9 });
      }
      D.arrow(g, x - 3, top - (st.p.rieles ? 10 : 3), x + 5, top - (st.p.rieles ? 10 : 3), COL.txt, 0.4);
      D.txt(g, 'v', x + 7, top - (st.p.rieles ? 10 : 3), { s: 2.6 });
      const dV = st.p.v * st.p.B * st.p.L * st.sig;
      D.txt(g, 'ΔV = ' + fmt(dV, 2) + ' V (abajo a mayor potencial)', W / 2, 85, { s: 2.8, c: COL.oro, fondo: 'rgba(0,0,0,0.4)' });
    },
    readouts(st) {
      const e = st.p.v * st.p.B * st.p.L;
      return [['ΔV = vBL', fmt(e * st.sig, 2) + ' V', COL.oro], ['Corriente', st.p.rieles ? fmt(e / 2, 2) + ' A (R = 2 Ω)' : '0 (circuito abierto)', COL.ind], ['Equilibrio F_E = F_B', Math.round(st.sig * 100) + ' %']];
    },
    idea(st) { return st.p.rieles ? 'Con circuito: la $\\Delta V$ actúa como pila y circula $I=vBL/R$ (y aparece una fuerza que frena).' : 'Sin circuito: solo $\\Delta V$, sin corriente sostenida.'; },
  };

  // ===================== 12. El campo que da vueltas =====================
  const R12 = 14;
  function est12(st) {
    const m = st.p.modo, T = 5;
    if (m === 'sube') { const f = (st.t % T) / T; return { B: 0.15 + 0.85 * f, dB: 0.85 / T, esc: 0.85 / T }; }
    if (m === 'baja') { const f = (st.t % T) / T; return { B: 1 - 0.85 * f, dB: -0.85 / T, esc: 0.85 / T }; }
    const w = TAU * 0.2;
    return { B: Math.sin(w * st.t), dB: w * Math.cos(w * st.t), esc: w };
  }
  const E12 = (r, dB) => (r < R12 ? r / 2 : R12 * R12 / (2 * r)) * dB;
  S['campo-inducido'] = {
    controls: [
      { type: 'toggle', key: 'modo', label: '$B(t)$', value: 'sube', options: [['sube', 'Creciente'], ['baja', 'Decreciente'], ['oscila', 'Oscilante']] },
      { type: 'slider', key: 'r', label: 'Radio del anillo de prueba $r$', min: 3, max: 44, step: 0.5, value: 24, fmt: (v) => fmt(v / R12, 2) + ' R₀' },
      { type: 'check', key: 'comp', label: 'Comparar con carga puntual', value: false },
      { type: 'button', label: 'Borrar partículas', onClick(st) { st.parts = []; } },
    ],
    init(st) { st.rot = {}; st.parts = []; [[8, 0], [-10, 4], [22, -6], [0, 30]].forEach(([dx, dy]) => st.parts.push({ r: Math.hypot(dx, dy), a: Math.atan2(dy, dx), v: 0 })); },
    layout(st) {
      const W = st.V.w;
      st.cy = 46;
      st.cx = st.ancho ? (st.p.comp ? W * 0.36 : W * 0.44) : (st.p.comp ? W * 0.42 : W * 0.5);
    },
    onParam(st, key) { if (key === 'comp') this.layout(st); },
    step(st, dt) {
      const e = est12(st), k = 1.4 / e.esc;
      [5, 10, R12, 20, 27, 35, 44].forEach((r) => { st.rot[r] = (st.rot[r] || 0) + dt * k * E12(r, e.dB) / r; });
      st.parts.forEach((p) => { p.a += dt * k * E12(p.r, e.dB) / p.r; p.v += dt; });
      st.parts = st.parts.filter((p) => p.v < 16);
    },
    draw(g, st) {
      const W = st.V.w, { cx, cy } = st, e = est12(st), k = R12 / 2 * e.esc;
      // Región con B
      D.circ(g, cx, cy, R12, `rgba(96,165,250,${0.08 + 0.3 * Math.abs(e.B)})`, 'rgba(96,165,250,0.7)', 0.4);
      for (let x = -R12 + 3; x < R12; x += 5.5) for (let y = -R12 + 3; y < R12; y += 5.5) {
        if (Math.hypot(x, y) > R12 - 2) continue;
        const r = 0.4 + 0.9 * Math.abs(e.B);
        (e.B >= 0 ? D.sale : D.entra)(g, cx + x, cy + y, r, 'rgba(191,219,254,0.85)', 0.22);
      }
      // Círculos de E (sentido horario si B ⊙ aumenta)
      [5, 10, R12, 20, 27, 35, 44].forEach((r) => {
        if (cy - r < -2 && cx - r < -2) return;
        const Er = E12(r, e.dB), mag = Math.abs(Er) / k;
        D.circ(g, cx, cy, r, null, `rgba(251,146,60,${0.12 + 0.35 * mag})`, 0.3);
        const n = clamp(Math.round(TAU * r / 10), 3, 12);
        if (mag > 0.02) for (let i = 0; i < n; i++) {
          const a = (st.rot[r] || 0) + i * TAU / n, sg = Math.sign(Er);
          D.head(g, cx + r * Math.cos(a), cy + r * Math.sin(a), a + sg * Math.PI / 2, COL.E, 1 + 1.6 * clamp(mag, 0, 1.2));
        }
      });
      // Partículas de prueba (también giran fuera del disco, donde B = 0)
      st.parts.forEach((p) => D.circ(g, cx + p.r * Math.cos(p.a), cy + p.r * Math.sin(p.a), 0.9, `rgba(253,230,138,${1 - p.v / 16})`, '#000', 0.12));
      // Anillo de prueba
      const rt = st.p.r;
      D.circ(g, cx, cy, rt, null, COL.gamma, 0.5);
      D.circ(g, cx + rt * Math.cos(-0.7), cy + rt * Math.sin(-0.7), 1.4, COL.gamma);
      D.txt(g, 'r', cx + (rt + 3) * Math.cos(-0.7), cy + (rt + 3) * Math.sin(-0.7), { s: 2.8, c: COL.gamma });
      if (st.p.comp) {
        const qx = st.ancho ? W * 0.84 : W - 13, qy = st.ancho ? cy : 14, L = st.ancho ? 15 : 9;
        D.circ(g, qx, qy, L + 4, 'rgba(0,0,0,0.3)');
        for (let i = 0; i < 12; i++) { const a = i * TAU / 12; D.arrow(g, qx + 2 * Math.cos(a), qy + 2 * Math.sin(a), qx + L * Math.cos(a), qy + L * Math.sin(a), COL.E, 0.35, 1.2); }
        D.circ(g, qx, qy, 1.8, COL.I); D.txt(g, '+', qx, qy, { s: 2.4, min: 8 });
        D.txt(g, 'Carga: E radial', qx, qy + L + 6, { s: 2.4, c: COL.dim, min: 9 });
        D.txt(g, '∮E·dl = 0', qx, qy + L + 10, { s: 2.4, c: COL.dim, min: 9 });
      }
      const sentido = Math.abs(e.dB) < 0.02 ? 'B no cambia por un instante → E = 0' : (e.B >= 0) === (e.dB > 0) ? '|B| aumenta → E gira en sentido ' + (e.dB > 0 ? 'horario' : 'antihorario') : '|B| disminuye → E gira en sentido ' + (e.dB > 0 ? 'horario' : 'antihorario');
      D.txt(g, sentido, W / 2, 5, { s: 2.8, fondo: 'rgba(0,0,0,0.4)', c: COL.E });
      D.txt(g, 'Toca para soltar una carga de prueba', W / 2, 87, { s: 2.4, c: COL.dim, min: 9 });
    },
    pointer: {
      hit(st, x, y) { return Math.abs(Math.hypot(x - st.cx, y - st.cy) - st.p.r) < 3; },
      move(st, x, y) { st.p.r = clamp(Math.hypot(x - st.cx, y - st.cy), 3, 44); },
      tap(st, x, y) {
        const r = Math.hypot(x - st.cx, y - st.cy);
        if (r < 1.5) return;
        st.parts.push({ r, a: Math.atan2(y - st.cy, x - st.cx), v: 0 });
        if (st.parts.length > 25) st.parts.shift();
      },
    },
    readouts(st) {
      const e = est12(st), r = st.p.r, ae = Math.PI * Math.min(r, R12) ** 2;
      return [['B', fmt(e.B, 2), COL.B], ['dB/dt', fmt(e.dB, 2), COL.B], ['φ encerrado', fmt(e.B * ae / (Math.PI * R12 * R12), 2) + ' φ₀'], ['∮E·dl', fmt(-e.dB * ae / (Math.PI * R12 * R12), 2) + ' (u.a.)', COL.E], [r > R12 ? 'r > R₀: φ ya no crece' : 'r < R₀', fmt(Math.abs(E12(r, 1)), 2) + '·|dB/dt|']];
    },
    plot: { custom: true, legend: [['$|E|(r)$', COL.E], ['anillo de prueba', COL.gamma]] },
    drawPlot(g, w, h, st) {
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, h);
      const rmax = 46, X = (r) => 8 + (w - 16) * r / rmax, Y = (v) => h - 14 - (h - 26) * v;
      g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(8, Y(0)); g.lineTo(w - 8, Y(0)); g.stroke();
      g.setLineDash([4, 4]); g.beginPath(); g.moveTo(X(R12), 6); g.lineTo(X(R12), h - 12); g.stroke(); g.setLineDash([]);
      g.strokeStyle = COL.E; g.lineWidth = 2; g.beginPath();
      for (let i = 0; i <= 200; i++) { const r = i / 200 * rmax, v = Math.abs(E12(r, 1)) / (R12 / 2); i ? g.lineTo(X(r), Y(v)) : g.moveTo(X(r), Y(v)); }
      g.stroke();
      const r = st.p.r;
      g.fillStyle = COL.gamma; g.beginPath(); g.arc(X(r), Y(Math.abs(E12(r, 1)) / (R12 / 2)), 4, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = 'center';
      g.fillText('R₀', X(R12), h - 2); g.textAlign = 'right'; g.fillText('r →', w - 6, h - 2);
      g.textAlign = 'left'; g.fillText('crece ∝ r', X(2), 14); g.fillText('cae ∝ 1/r', X(R12 + 4), 14);
    },
  };

  // ===================== 13. Generador =====================
  S['generador'] = {
    controls: [
      { type: 'slider', key: 'w', label: 'Rapidez angular $\\omega$', min: 0.5, max: 4, step: 0.1, value: 1.6, fmt: (v) => fmt(v, 1) + ' rad/s' },
      { type: 'slider', key: 'B', label: 'Campo $B$', min: 0.2, max: 1, step: 0.05, value: 0.7, fmt: (v) => fmt(v, 2) + ' T' },
      { type: 'slider', key: 'A', label: 'Área de la espira', min: 0.5, max: 1.5, step: 0.05, value: 1, fmt: (v) => fmt(v, 2) + ' m²' },
      { type: 'button', label: 'Pausar en ε máx', onClick(st, api) { st.th = Math.floor(st.th / Math.PI) * Math.PI + Math.PI / 2; api.pausar(); } },
      { type: 'button', label: 'Pausar en ε = 0', onClick(st, api) { st.th = Math.ceil(st.th / Math.PI) * Math.PI; api.pausar(); } },
    ],
    init(st) { st.th = 0.3; st.fase = 0; },
    step(st, dt) { st.th += st.p.w * dt; st.fase += dt * 8; },
    draw(g, st) {
      const W = st.V.w, cx = st.ancho ? W * 0.42 : W * 0.46, cy = 44, th = st.th;
      const a = 13 * Math.sqrt(st.p.A), b = 15;
      const BA = st.p.B * st.p.A, phi = BA * Math.cos(th), eps = BA * st.p.w * Math.sin(th);
      // Campo uniforme horizontal
      g.setLineDash([2.4, 2]); g.lineDashOffset = -st.fase;
      for (let y = 10; y < 84; y += 9) { g.beginPath(); g.moveTo(3, y); g.lineTo(W - 3, y); g.strokeStyle = `rgba(96,165,250,${0.25 + 0.4 * st.p.B})`; g.lineWidth = 0.35; g.stroke(); }
      g.setLineDash([]); g.lineDashOffset = 0;
      D.arrow(g, W - 12, 6, W - 4, 6, COL.B, 0.5); D.txt(g, 'B', W - 14, 6, { s: 3, c: COL.B });
      const P = (x, y, z) => [cx + x - 0.38 * z, cy - y + 0.22 * z];
      const u = [-Math.sin(th), Math.cos(th)];
      const esq = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([i, j]) => P(i * a * u[0], j * b, i * a * u[1]));
      D.line(g, cx, cy - b - 9, cx, cy + b + 9, 'rgba(255,255,255,0.35)', 0.35, [1.2, 1]);
      g.beginPath(); esq.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = `rgba(251,146,60,${0.05 + 0.3 * Math.abs(Math.cos(th))})`; g.fill();
      const brillo = clamp(Math.abs(eps) / 2.5, 0, 1);
      g.strokeStyle = `rgba(${Math.round(lerp(203, 74, brillo))},${Math.round(lerp(213, 222, brillo))},${Math.round(lerp(225, 128, brillo))},1)`; g.lineWidth = 1; g.stroke();
      const [nx, ny] = P(19 * Math.cos(th), 0, 19 * Math.sin(th));
      D.arrow(g, cx, cy, nx, ny, COL.oro, 0.55);
      D.txt(g, 'n̂', nx + (nx > cx ? 2.5 : -2.5), ny - 2, { s: 3, c: COL.oro });
      // Ampolleta conectada
      const bx = st.ancho ? W * 0.83 : W - 10, by = 74;
      D.line(g, cx, cy + b + 9, cx, by + 6, COL.alambre, 0.35); D.line(g, cx, by + 6, bx, by + 6, COL.alambre, 0.35); D.line(g, bx, by + 6, bx, by + 3, COL.alambre, 0.35);
      D.bulb(g, bx, by, 3.2, brillo);
      const sn = Math.abs(Math.sin(th)), cs = Math.abs(Math.cos(th));
      let lbl = '';
      if (sn > 0.97) lbl = 'Plano ∥ B: φ = 0 pero cambia lo más rápido → ε máxima';
      else if (cs > 0.97) lbl = 'Normal ∥ B: φ máximo pero no cambia → ε = 0';
      if (lbl) D.txt(g, lbl, W / 2, 86, { s: 2.8, c: sn > 0.97 ? COL.ind : COL.E, fondo: 'rgba(0,0,0,0.45)' });
    },
    readouts(st) {
      const BA = st.p.B * st.p.A, th = st.th;
      const deg = ((th * 180 / Math.PI) % 360 + 360) % 360;
      return [['φ = BA cos ωt', fmt(BA * Math.cos(th), 2) + ' Wb', COL.E], ['ε = BAω sin ωt', fmt(BA * st.p.w * Math.sin(th), 2) + ' V', COL.ind], ['ángulo n̂–B', Math.round(deg) + '°']];
    },
    idea(st) {
      const sn = Math.abs(Math.sin(st.th));
      if (!st.playing && sn > 0.97) return 'Plano de la espira paralelo a $\\vec B$: el flujo es cero, pero cambia lo más rápido → $\\varepsilon$ máxima.';
      if (!st.playing && sn < 0.05) return 'Normal paralela a $\\vec B$: flujo máximo, pero por un instante no cambia → $\\varepsilon=0$.';
      return null;
    },
    plot: { custom: true, legend: [['$\\phi(t)$', COL.E], ['$\\varepsilon(t)$', COL.ind]] },
    drawPlot(g, w, h, st) {
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, h);
      const X = (t) => 8 + (w - 16) * t / TAU, mid = h / 2, amp = h / 2 - 12;
      g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(8, mid); g.lineTo(w - 8, mid); g.stroke();
      const BA = st.p.B * st.p.A, aF = BA / 1.5, aE = BA * st.p.w / 6;
      [[(t) => aF * Math.cos(t), COL.E], [(t) => aE * Math.sin(t), COL.ind]].forEach(([f, c]) => {
        g.strokeStyle = c; g.lineWidth = 2; g.beginPath();
        for (let i = 0; i <= 160; i++) { const t = i / 160 * TAU; i ? g.lineTo(X(t), mid - f(t) * amp) : g.moveTo(X(t), mid - f(t) * amp); }
        g.stroke();
      });
      const t = ((st.th % TAU) + TAU) % TAU;
      g.strokeStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.moveTo(X(t), 4); g.lineTo(X(t), h - 4); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.65)'; g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = 'left';
      g.fillText('φ máx → ε = 0', X(0) + 3, 12);
      g.fillText('φ = 0 → ε máx', X(Math.PI / 2) + 3, h - 4);
    },
  };
  wrapIdea('generador');

  // ===================== 14. Cocina de inducción =====================
  S['cocina-induccion'] = {
    controls: [
      { type: 'toggle', key: 'mat', label: 'Material de la olla', value: 'acero', options: [['acero', 'Acero'], ['greda', 'Greda']] },
      { type: 'toggle', key: 'cor', label: 'Corriente de la cocina', value: 'ac', options: [['ac', 'AC'], ['dc', 'DC']] },
      { type: 'slider', key: 'f', label: 'Frecuencia', min: 20, max: 60, step: 1, value: 40, fmt: (v) => v + ' kHz' },
    ],
    init(st) { st.T = 20; st.fase = 0; st.ph = 0; st.burb = []; },
    onParam(st, key) { if (key === 'mat' || key === 'cor') st.T = Math.min(st.T, 20 + (st.T - 20) * 0.3); },
    calienta(st) { return st.p.mat === 'acero' && st.p.cor === 'ac'; },
    step(st, dt) {
      const ac = st.p.cor === 'ac';
      st.ph += dt * TAU * (ac ? 0.25 + st.p.f / 80 : 0);
      st.fase += dt * 6;
      const P = this.calienta(st) ? 7 * st.p.f / 60 : 0;
      st.T = clamp(st.T + dt * (P - 0.035 * (st.T - 20)), 20, 100);
      if (st.T > 86 && Math.random() < dt * 30 * (st.T - 86) / 14) st.burb.push({ x: (Math.random() - 0.5) * 44, y: 50, v: 0 });
      st.burb.forEach((b) => { b.v += dt; b.y -= dt * 14; });
      st.burb = st.burb.filter((b) => b.y > 31);
    },
    draw(g, st) {
      const W = st.V.w, cx = W * 0.44, ac = st.p.cor === 'ac', I = ac ? Math.cos(st.ph) : 1, dIdt = ac ? -Math.sin(st.ph) : 0;
      const ancho = st.ancho ? 26 : 22;
      // Bobina bajo la vitrocerámica
      for (let i = 0; i < 8; i++) {
        const x = cx - 21 + i * 6, izq = i < 4, sale = izq ? I >= 0 : I < 0;
        (sale ? D.sale : D.entra)(g, x, 67, 1.8, `rgba(248,113,113,${0.4 + 0.6 * Math.abs(I)})`, 0.4);
      }
      D.txt(g, 'bobina', cx + 29, 67, { s: 2.4, c: COL.dim, a: 'left', min: 9 });
      // Líneas de B: suben por el centro y cambian de sentido con la corriente
      const sgn = Math.sign(I) || 1, a = 0.2 + 0.7 * Math.abs(I);
      [[8, 9], [14, 17], [20, 26]].forEach(([rx, ry]) => {
        [[cx - 12, sgn], [cx + 12, -sgn]].forEach(([x0, s]) => {
          g.setLineDash([2, 1.6]); g.lineDashOffset = st.fase * s;
          g.beginPath(); g.ellipse(x0, 66, rx * 0.8, ry, 0, Math.PI, TAU);
          g.strokeStyle = `rgba(96,165,250,${a})`; g.lineWidth = 0.4; g.stroke();
          g.setLineDash([]); g.lineDashOffset = 0;
        });
      });
      D.arrow(g, cx, 64, cx, 64 - 9 * sgn * a, COL.B, 0.5);
      // Vitrocerámica y olla
      g.fillStyle = 'rgba(220,230,240,0.25)'; g.fillRect(cx - 36, 58.5, 72, 2.2);
      const calor = (st.T - 20) / 80;
      const acero = st.p.mat === 'acero';
      g.fillStyle = 'rgba(96,165,250,0.28)'; g.fillRect(cx - ancho + 1, 30, 2 * ancho - 2, 23);
      st.burb.forEach((b) => D.circ(g, cx + b.x * ancho / 26, b.y, 0.9, null, 'rgba(255,255,255,0.7)', 0.25));
      g.strokeStyle = acero ? '#cbd5e1' : '#c08457'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(cx - ancho, 22); g.lineTo(cx - ancho, 56); g.lineTo(cx + ancho, 56); g.lineTo(cx + ancho, 22); g.stroke();
      const base = acero ? `rgb(${Math.round(lerp(150, 255, calor))},${Math.round(lerp(158, 95, calor))},${Math.round(lerp(168, 40, calor))})` : '#b07a52';
      g.fillStyle = base; g.fillRect(cx - ancho, 53, 2 * ancho, 3.5);
      if (acero && calor > 0.1) D.glow(g, cx, 55, ancho, 'rgba(255,110,40,A)', calor * 0.6);
      D.txt(g, acero ? 'olla de acero' : 'olla de greda', cx, 18, { s: 2.6, c: COL.dim, min: 9 });
      // Corrientes de Foucault en la base
      if (this.calienta(st)) {
        const sg = Math.sign(dIdt) || 1, fuerza = Math.abs(dIdt) * st.p.f / 60;
        [7, 13, 19].forEach((rx, j) => {
          g.beginPath(); g.ellipse(cx, 54.8, rx * ancho / 26, 1.3, 0, 0, TAU);
          g.strokeStyle = `rgba(74,222,128,${0.25 + 0.7 * fuerza})`; g.lineWidth = 0.45; g.stroke();
          const ang = st.fase * 0.6 * sg + j;
          D.head(g, cx + rx * ancho / 26 * Math.cos(ang), 54.8 + 1.3 * Math.sin(ang), ang + sg * Math.PI / 2, COL.ind, 1.2 + fuerza);
        });
      }
      // Termómetro
      const tx = cx + ancho + 8;
      D.rr(g, tx - 1.4, 24, 2.8, 30, 1.4); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fill();
      const nivel = 28 * clamp(calor, 0, 1);
      g.fillStyle = COL.I; g.fillRect(tx - 0.8, 53 - nivel, 1.6, nivel + 1);
      D.circ(g, tx, 55, 2, COL.I);
      D.txt(g, Math.round(st.T) + ' °C', tx + 3, 26, { s: 2.8, a: 'left', c: st.T > 95 ? COL.I : COL.txt });
      if (st.T > 98) D.txt(g, '¡Hierve!', tx + 3, 31, { s: 2.6, a: 'left', c: COL.I, min: 9 });
      D.txt(g, ac ? 'Campo alterno: el flujo cambia' : 'Campo constante: el flujo no cambia', W / 2, 5, { s: 2.8, fondo: 'rgba(0,0,0,0.4)' });
    },
    readouts(st) {
      const P = this.calienta(st) ? Math.round(2000 * st.p.f / 60) : 0;
      return [['Agua', Math.round(st.T) + ' °C', COL.I], ['Calor en la base', P + ' W', COL.E], ['Corrientes de Foucault', P ? 'sí' : 'no', P ? COL.ind : COL.dim]];
    },
    idea(st) {
      if (st.p.cor === 'dc') return 'Con campo constante el flujo no cambia: no hay corrientes de Foucault y no calienta ninguna olla.';
      if (st.p.mat === 'greda') return 'La greda es aislante: aunque haya fem, no circula corriente y no se calienta.';
      return null;
    },
  };
  wrapIdea('cocina-induccion');

  // ===================== 15. La inercia de la corriente =====================
  function perfil15(t) {
    t %= 6;
    if (t < 1.5) return t / 1.5;
    if (t < 3) return 1;
    if (t < 4.5) return 1 - (t - 3) / 1.5;
    return 0;
  }
  S['inercia-corriente'] = {
    controls: [
      { type: 'toggle', key: 'modo', label: 'Corriente', value: 'auto', options: [['auto', 'Automática (sube, se mantiene, baja)'], ['manual', 'La muevo yo']] },
      { type: 'slider', key: 'I', label: 'Corriente $I$', min: 0, max: 1, step: 0.01, value: 0.5, fmt: (v) => fmt(v, 2) + ' A', show: (p) => p.modo === 'manual' },
      { type: 'slider', key: 'L', label: 'Autoinductancia $L$', min: 0.2, max: 2, step: 0.05, value: 1, fmt: (v) => fmt(v, 2) + ' H' },
    ],
    init(st) { st.I = 0; st.dI = 0; st.fase = 0; },
    onParam(st, key) { if (key === 'modo' && st.p.modo === 'manual') st.p.I = Math.round(st.I * 100) / 100; },
    step(st, dt) {
      if (st.p.modo === 'auto') { const n = perfil15(st.t); st.dI = (n - st.I) / dt; st.I = n; }
      else { st.dI = (st.p.I - st.I) / 0.35; st.I += st.dI * dt; }
      if (Math.abs(st.dI) < 1e-3) st.dI = 0;
      st.fase += dt * st.I * 2.4;
    },
    draw(g, st) {
      const W = st.V.w, cx = st.ancho ? W * 0.36 : W * 0.5, cy = 46, R = 17;
      const eps = -st.p.L * st.dI;
      D.circ(g, cx, cy, R, null, '#cbd5e1', 1.1);
      // Corriente en sentido antihorario (en la pantalla) → B sale por el centro
      for (let k = 0; k < 10; k++) {
        const a = -st.fase + k * TAU / 10;
        if (st.I > 0.02) D.head(g, cx + R * Math.cos(a), cy + R * Math.sin(a), a - Math.PI / 2, COL.I, 1.2 + 1.4 * st.I);
      }
      if (st.I > 0.02) D.sale(g, cx, cy, 1 + 4 * st.I, COL.B, 0.4 + 0.3 * st.I);
      D.txt(g, 'B', cx + 6.5, cy - 3, { s: 2.8, c: COL.B });
      // fem autoinducida: en contra de I si I sube, a favor si I baja
      if (Math.abs(eps) > 0.03) {
        const rr = R + 5.5, span = clamp(Math.abs(eps) / 1.4, 0.12, 1) * Math.PI * 1.1, s = Math.sign(eps);
        const a0 = -Math.PI / 2 + s * span / 2, a1 = -Math.PI / 2 - s * span / 2;
        g.beginPath(); g.arc(cx, cy, rr, Math.min(a0, a1), Math.max(a0, a1)); g.strokeStyle = COL.ind; g.lineWidth = 0.8; g.stroke();
        D.head(g, cx + rr * Math.cos(a1), cy + rr * Math.sin(a1), a1 - s * Math.PI / 2, COL.ind, 2.4);
        D.txt(g, 'ε_L', cx, cy - rr - 4, { s: 3, c: COL.ind, w: 700 });
      }
      let estado;
      if (st.dI > 0.03) estado = ['I aumenta → ε_L en contra de I', COL.ind];
      else if (st.dI < -0.03) estado = ['I disminuye → ε_L a favor de I', COL.ind];
      else estado = ['I constante → ε_L = 0 (aunque haya campo)', COL.dim];
      D.txt(g, estado[0], W / 2, 6, { s: 3, c: estado[1], fondo: 'rgba(0,0,0,0.4)' });
      if (st.ancho) {
        // Analogía: la masa de un carro
        const x0 = W * 0.66, x1 = W - 6, yc = 58, px = lerp(x0 + 6, x1 - 8, st.I);
        D.line(g, x0, yc + 4.2, x1, yc + 4.2, 'rgba(255,255,255,0.3)', 0.4);
        const m = 5 + st.p.L * 3;
        D.rr(g, px - m / 2, yc - m * 0.5, m, m * 0.7, 1); g.fillStyle = '#6b7280'; g.fill();
        D.circ(g, px - m / 3, yc + 2.8, 1.3, '#cbd5e1'); D.circ(g, px + m / 3, yc + 2.8, 1.3, '#cbd5e1');
        D.txt(g, 'más L = más masa', (x0 + x1) / 2, yc - 10, { s: 2.5, c: COL.dim, min: 9 });
        D.txt(g, 'analogía', (x0 + x1) / 2, yc - 14.5, { s: 2.3, c: COL.dim, min: 8.5 });
      }
    },
    readouts(st) { return [['I', fmt(st.I, 2) + ' A', COL.I], ['dI/dt', fmt(st.dI, 2) + ' A/s'], ['ε_L = −L dI/dt', fmt(-st.p.L * st.dI, 2) + ' V', COL.ind]]; },
    plot: { series: [{ key: 'I', label: '$I(t)$', color: COL.I, max: 1.1 }, { key: 'e', label: '$\\varepsilon_L(t)=-L\\,dI/dt$', color: COL.ind }], span: 7 },
    sample(st) { return { I: st.I, e: -st.p.L * st.dI }; },
  };

  // ===================== 16. Solenoide configurable =====================
  const MU0 = 4 * Math.PI * 1e-7;
  function fis16(p, N) {
    N = N || p.N;
    const r = p.r / 100, l = p.l / 100, A = Math.PI * r * r, B = MU0 * N * p.I / l, phi1 = B * A;
    return { B, phi1, Nphi: N * phi1, L: N * phi1 / p.I };
  }
  S['solenoide-L'] = {
    controls: [
      { type: 'slider', key: 'N', label: 'Número de vueltas $N$', min: 4, max: 40, step: 1, value: 10, fmt: (v) => String(v) },
      { type: 'slider', key: 'r', label: 'Radio (área $A$)', min: 1, max: 4, step: 0.1, value: 2, fmt: (v) => fmt(v, 1) + ' cm' },
      { type: 'slider', key: 'l', label: 'Largo $\\ell$', min: 10, max: 40, step: 1, value: 25, fmt: (v) => v + ' cm' },
      { type: 'slider', key: 'I', label: 'Corriente $I$', min: 0.5, max: 5, step: 0.1, value: 2, fmt: (v) => fmt(v, 1) + ' A' },
      { type: 'button', label: 'Duplicar N', onClick(st) {
        let N = st.p.N;
        if (N * 2 > 40) N = Math.max(4, Math.floor(N / 2));
        st.seq = { t: 0, N0: N, L0: fis16(st.p, N).L };
        st.p.N = N * 2;
      } },
    ],
    init(st) { st.seq = null; st.fase = 0; },
    step(st, dt) { st.fase += dt * 7; if (st.seq) { st.seq.t += dt; if (st.seq.t > 7) st.seq = null; } },
    draw(g, st) {
      const W = st.V.w, cx = W / 2, cy = 42, f = fis16(st.p);
      const lv = 30 + (W - 64) * (st.p.l - 10) / 30, rv = 6 + 11 * (st.p.r - 1) / 3, N = st.p.N;
      const x0 = cx - lv / 2;
      // Mitad de atrás de las vueltas
      for (let i = 0; i < N; i++) D.ellipse(g, x0 + (i + 0.5) * lv / N, cy, rv * 0.28, rv, null, 'rgba(248,113,113,0.35)', 0.4, -Math.PI / 2, Math.PI / 2);
      // Líneas de B adentro (cuántas ∝ B)
      const k = clamp(Math.round(f.B / 1e-4 * 2), 1, 16);
      g.setLineDash([2.2, 1.6]); g.lineDashOffset = -st.fase;
      for (let j = 0; j < k; j++) {
        const y = cy + (k === 1 ? 0 : (j / (k - 1) - 0.5) * 1.6 * rv * 0.9);
        g.beginPath(); g.moveTo(x0 - 7, y); g.lineTo(x0 + lv + 7, y); g.strokeStyle = 'rgba(96,165,250,0.85)'; g.lineWidth = 0.45; g.stroke();
      }
      g.setLineDash([]); g.lineDashOffset = 0;
      D.arrow(g, x0 + lv + 5, cy - rv - 3, x0 + lv + 12, cy - rv - 3, COL.B, 0.5);
      D.txt(g, 'B', x0 + lv + 14, cy - rv - 3, { s: 2.8, c: COL.B, a: 'left' });
      // Mitad de adelante (la corriente baja por el frente → B hacia la derecha)
      const resaltar = st.seq && st.seq.t > 2.3 && st.seq.t < 4.6;
      for (let i = 0; i < N; i++) {
        const x = x0 + (i + 0.5) * lv / N;
        D.ellipse(g, x, cy, rv * 0.28, rv, null, resaltar ? COL.oro : COL.I, 0.6, Math.PI / 2, Math.PI * 1.5);
        if (i % Math.max(1, Math.round(N / 5)) === 0) D.head(g, x - rv * 0.28, cy + 0.5, Math.PI / 2, COL.I, 1.5);
      }
      if (st.seq) {
        const t = st.seq.t;
        let msg;
        if (t < 2.3) msg = '① El campo (y el flujo por vuelta) se duplica: × 2';
        else if (t < 4.6) msg = '② Cada línea atraviesa el doble de vueltas: × 2';
        else msg = 'Resultado: L × 4 (' + fmtSI(st.seq.L0, 'H', 2) + ' → ' + fmtSI(f.L, 'H', 2) + ')';
        D.txt(g, msg, W / 2, 80, { s: 3, c: COL.oro, fondo: 'rgba(0,0,0,0.5)', w: 700 });
      }
      D.txt(g, 'L = ' + fmtSI(f.L, 'H', 2) + '  🔒 no depende de I', W / 2, 6, { s: 3, c: COL.txt, fondo: 'rgba(0,0,0,0.4)' });
    },
    readouts(st) {
      const f = fis16(st.p);
      return [['B = μ₀NI/ℓ', fmtSI(f.B, 'T', 2), COL.B], ['φ por vuelta', fmtSI(f.phi1, 'Wb', 2), COL.E], ['N·φ', fmtSI(f.Nphi, 'Wb', 2)], ['L = Nφ/I', fmtSI(f.L, 'H', 2), COL.oro]];
    },
  };

  // ===================== 17. Interruptor y secundaria =====================
  S['interruptor'] = {
    controls: [
      { type: 'button', label: 'Cerrar el interruptor', labelFn: (st) => (st.cerrado ? 'Abrir el interruptor' : 'Cerrar el interruptor'), onClick(st) { st.p.auto = false; st.cerrado = !st.cerrado; } },
      { type: 'check', key: 'auto', label: 'Abrir y cerrar solo', value: true },
      { type: 'slider', key: 'd', label: 'Distancia entre bobinas', min: 0, max: 30, step: 1, value: 6, fmt: (v) => v + ' mm' },
      { type: 'slider', key: 'tau', label: 'Tiempo de subida de $I_1$', min: 0.1, max: 1, step: 0.05, value: 0.35, fmt: (v) => fmt(v, 2) + ' s' },
    ],
    init(st) { st.cerrado = false; st.I1 = 0; st.dI = 0; st.eps = 0; st.fase = 0; st.tc = 0; },
    M(st) { return 1 / (1 + (st.p.d / 14) ** 2); },
    step(st, dt) {
      if (st.p.auto) { st.tc += dt; const c = st.tc % 6, q = c > 0.6 && c < 3.6; if (q !== st.cerrado) st.cerrado = q; }
      const tau = st.cerrado ? st.p.tau : 0.12, obj = st.cerrado ? 1 : 0;
      st.dI = (obj - st.I1) / tau;
      st.I1 += st.dI * dt;
      if (Math.abs(st.dI) < 1e-3) st.dI = 0;
      st.eps = -this.M(st) * st.dI;
      st.fase += dt * st.I1 * 8;
    },
    draw(g, st) {
      const W = st.V.w, cy = 34, c1 = st.ancho ? W * 0.33 : W * 0.27, c2 = c1 + 22 + st.p.d * (st.ancho ? 1.1 : 0.8), M = this.M(st);
      const bobina2 = (x, color, ancho = 12) => { for (let i = 0; i < 6; i++) D.ellipse(g, x - ancho / 2 + (i + 0.5) * ancho / 6, cy, 1.6, 9, null, color, 0.7); };
      // Flujo de la primaria que llega a la secundaria
      g.setLineDash([2, 1.6]); g.lineDashOffset = -st.fase;
      [-5, -1.7, 1.7, 5].forEach((y, i) => {
        g.beginPath(); g.moveTo(c1 - 10, cy + y); g.lineTo(c2 + 10, cy + y);
        g.strokeStyle = `rgba(96,165,250,${st.I1 * (i % 3 ? 0.9 : 0.9 * M)})`; g.lineWidth = 0.45; g.stroke();
      });
      g.setLineDash([]); g.lineDashOffset = 0;
      bobina2(c1, COL.I); bobina2(c2, COL.ind);
      D.txt(g, 'Primaria', c1, cy - 13, { s: 2.6, c: COL.I, min: 9 });
      D.txt(g, 'Secundaria', c2, cy - 13, { s: 2.6, c: COL.ind, min: 9 });
      if (st.I1 > 0.05) [-3, 3].forEach((dx) => D.arrow(g, c1 + dx, cy - 6, c1 + dx, cy + 6, COL.I, 0.5));
      if (Math.abs(st.eps) > 0.03) {
        const mismo = st.eps > 0;
        [-3, 3].forEach((dx) => D.arrow(g, c2 + dx, mismo ? cy - 6 : cy + 6, c2 + dx, mismo ? cy + 6 : cy - 6, COL.ind, 0.5));
        D.txt(g, mismo ? 'mismo sentido' : 'sentido contrario', c2, cy + 13, { s: 2.6, c: COL.ind, min: 9 });
      }
      // Circuito de la primaria: batería e interruptor
      const yb = 70, xb = c1 - 16;
      D.line(g, c1 - 6, cy + 9, c1 - 6, yb, COL.alambre, 0.4); D.line(g, c1 + 6, cy + 9, c1 + 6, yb, COL.alambre, 0.4);
      D.line(g, c1 - 6, yb, xb + 2, yb, COL.alambre, 0.4);
      D.line(g, xb + 2, yb - 3.5, xb + 2, yb + 3.5, COL.alambre, 0.6); D.line(g, xb, yb - 2, xb, yb + 2, COL.alambre, 1);
      D.line(g, xb, yb, xb - 3, yb, COL.alambre, 0.4); D.line(g, xb - 3, yb, xb - 3, yb + 8, COL.alambre, 0.4);
      const sx = c1 + 1, sy = yb + 8;
      D.line(g, xb - 3, sy, sx - 4, sy, COL.alambre, 0.4); D.line(g, sx + 4, sy, c1 + 10, sy, COL.alambre, 0.4);
      D.line(g, c1 + 10, sy, c1 + 10, yb, COL.alambre, 0.4); D.line(g, c1 + 10, yb, c1 + 6, yb, COL.alambre, 0.4);
      D.circ(g, sx - 4, sy, 0.8, COL.alambre); D.circ(g, sx + 4, sy, 0.8, COL.alambre);
      const ang = st.cerrado ? 0 : -0.6;
      D.line(g, sx - 4, sy, sx - 4 + 8 * Math.cos(ang), sy + 8 * Math.sin(ang), st.cerrado ? COL.ok : COL.oro, 0.8);
      D.rr(g, sx - 7, sy - 7, 14, 10, 2); g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 0.3; g.stroke();
      D.txt(g, st.cerrado ? 'cerrado' : 'abierto (toca)', sx, sy + 5, { s: 2.4, c: st.cerrado ? COL.ok : COL.oro, min: 9 });
      // Galvanómetro de la secundaria (cero al centro)
      const gx = c2, gy = 76;
      D.line(g, c2 - 6, cy + 9, c2 - 6, gy - 2, COL.alambre, 0.4); D.line(g, c2 + 6, cy + 9, c2 + 6, gy - 2, COL.alambre, 0.4);
      g.beginPath(); g.arc(gx, gy, 8, Math.PI, TAU); g.fillStyle = 'rgba(0,0,0,0.45)'; g.fill(); g.strokeStyle = COL.dim; g.lineWidth = 0.3; g.stroke();
      const na = -Math.PI / 2 + clamp(st.eps / 2.2, -1, 1) * 1.15;
      D.line(g, gx, gy, gx + 7 * Math.cos(na), gy + 7 * Math.sin(na), Math.abs(st.eps) > 0.03 ? COL.ind : COL.txt, 0.5);
      D.txt(g, '0', gx, gy - 9.8, { s: 2.2, c: COL.dim, min: 8 });
      let msg;
      if (st.cerrado && st.dI > 0.05) msg = 'Al cerrar: I₁ sube → pulso en sentido contrario';
      else if (st.cerrado) msg = 'Campo grande pero constante → ε₂ = 0';
      else if (st.dI < -0.05) msg = 'Al abrir: I₁ cae → pulso en el mismo sentido';
      else msg = 'Interruptor abierto: no hay corriente ni flujo';
      D.txt(g, msg, W / 2, 5, { s: 2.8, fondo: 'rgba(0,0,0,0.4)' });
    },
    pointer: {
      hit() { return false; },
      tap(st, x, y) {
        const c1 = st.ancho ? st.V.w * 0.33 : st.V.w * 0.27, sx = c1 + 1, sy = 78;
        if (Math.abs(x - sx) < 9 && Math.abs(y - sy) < 8) { st.p.auto = false; st.cerrado = !st.cerrado; }
      },
    },
    readouts(st) { return [['I₁', fmt(st.I1, 2) + ' A', COL.I], ['ε₂ = −M dI₁/dt', fmt(st.eps, 2) + ' V', COL.ind], ['M (relativa)', fmt(this.M(st), 2)]]; },
    plot: { series: [{ key: 'I', label: '$I_1(t)$', color: COL.I, max: 1.1 }, { key: 'e', label: '$\\varepsilon_2(t)$', color: COL.ind }], span: 7 },
    sample(st) { return { I: st.I1, e: st.eps }; },
  };

  // ===================== 18. Dos caminos, mismo M =====================
  // Campo Bz (sale = +) en el plano, de un tramo recto con corriente de p1 a p2 (coordenadas matemáticas, y hacia arriba)
  function bzTramo(p1, p2, q) {
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const rx = q[0] - p1[0], ry = q[1] - p1[1];
    const s1 = -(rx * ux + ry * uy), s2 = L + s1;
    const d = Math.abs(ux * ry - uy * rx);
    if (d < 1e-6) return 0;
    const sgn = Math.sign(ux * ry - uy * rx);
    return sgn * (s2 / Math.hypot(s2, d) - s1 / Math.hypot(s1, d)) / d;
  }
  S['mutua'] = {
    controls: [
      { type: 'toggle', key: 'quien', label: 'Quién lleva la corriente', value: 'alambre', options: [['alambre', 'El alambre'], ['espira', 'La espira']] },
      { type: 'slider', key: 'a', label: 'Distancia $a$', min: 1, max: 10, step: 0.5, value: 3, fmt: (v) => fmt(v, 1) + ' cm' },
      { type: 'slider', key: 'c', label: 'Ancho $c$', min: 2, max: 15, step: 0.5, value: 8, fmt: (v) => fmt(v, 1) + ' cm' },
      { type: 'slider', key: 'h', label: 'Alto $h$', min: 5, max: 20, step: 0.5, value: 14, fmt: (v) => fmt(v, 1) + ' cm' },
    ],
    init(st) { st.barr = 0; st.fase = 0; },
    M(p) { return 2e-7 * (p.h / 100) * Math.log((p.a + p.c) / p.a); },
    step(st, dt) { st.barr += dt / 3.4; if (st.barr > 1.35) st.barr = 0; st.fase += dt * 6; },
    draw(g, st) {
      const W = st.V.w, cy = 46, wx = st.ancho ? 16 : 11, s = (W - wx - 6) / 25, sh = 3.4;
      const x0 = wx + st.p.a * s, w = st.p.c * s, hh = st.p.h * sh / 2;
      const alambre = st.p.quien === 'alambre';
      // Alambre
      D.line(g, wx, 2, wx, 88, alambre ? COL.alambre : 'rgba(203,213,225,0.45)', 0.9);
      if (alambre) { D.arrow(g, wx - 3, 26, wx - 3, 14, COL.I, 0.55); D.txt(g, 'I', wx - 6, 20, { s: 3, c: COL.I }); }
      if (alambre) {
        // Campo del alambre ∝ 1/x: ⊗ a la derecha (corriente hacia arriba)
        for (let x = wx + 4; x < W - 2; x += 7) for (let y = 6; y < 88; y += 7) D.entra(g, x, y, clamp(9 / (x - wx), 0.35, 2), 'rgba(96,165,250,0.45)', 0.2);
        for (let y = 6; y < 88; y += 7) D.sale(g, wx - 5, y, 1.6, 'rgba(96,165,250,0.35)', 0.2);
        // Integral en franjas dx
        const n = 26, f = clamp(st.barr, 0, 1);
        for (let i = 0; i < n * f; i++) {
          const xi = x0 + i * w / n, a = 0.15 + 0.6 * (st.p.a * s) / (xi - wx + 0.0001) * 1;
          g.fillStyle = `rgba(251,146,60,${clamp(a, 0.1, 0.8)})`; g.fillRect(xi, cy - hh, w / n + 0.05, 2 * hh);
        }
        const xa = (st.p.a + f * st.p.c);
        st.parcial = 2e-7 * (st.p.h / 100) * Math.log(xa / st.p.a);
        D.txt(g, 'φ₂₁ = ∫ μ₀I h /(2πx) dx', W / 2 + 8, 84, { s: 2.8, c: COL.E, fondo: 'rgba(0,0,0,0.45)' });
      } else {
        // Campo de la espira (en su plano): Bz por superposición de sus 4 tramos
        const P = [[x0, cy + hh], [x0 + w, cy + hh], [x0 + w, cy - hh], [x0, cy - hh]].map(([x, y]) => [x, -y]);
        const vals = [];
        for (let x = 4; x < W - 2; x += 6.5) for (let y = 5; y < 88; y += 6.5) {
          let bz = 0;
          for (let i = 0; i < 4; i++) bz += bzTramo(P[i], P[(i + 1) % 4], [x, -y]);
          vals.push([x, y, bz]);
        }
        const ref = 4 / Math.min(w, 2 * hh);
        vals.forEach(([x, y, bz]) => {
          const r = clamp(Math.sqrt(Math.abs(bz) / ref) * 1.5, 0.25, 2);
          (bz > 0 ? D.sale : D.entra)(g, x, y, r, 'rgba(96,165,250,0.45)', 0.2);
        });
        D.txt(g, 'Flujo de la espira "por el alambre": no hay un área clara', W / 2 + 6, 84, { s: 2.6, c: COL.dim, fondo: 'rgba(0,0,0,0.45)' });
      }
      // Espira
      g.strokeStyle = alambre ? '#cbd5e1' : COL.I; g.lineWidth = 0.8; g.strokeRect(x0, cy - hh, w, 2 * hh);
      if (!alambre) D.puntos(g, [[x0, cy - hh], [x0, cy + hh], [x0 + w, cy + hh], [x0 + w, cy - hh], [x0, cy - hh]], st.fase, 5, COL.I, 0.6);
      // Cotas
      D.line(g, wx, cy + hh + 4, x0, cy + hh + 4, COL.dim, 0.3); D.txt(g, 'a', (wx + x0) / 2, cy + hh + 6.5, { s: 2.6, c: COL.dim });
      D.line(g, x0, cy - hh - 3, x0 + w, cy - hh - 3, COL.dim, 0.3); D.txt(g, 'c', x0 + w / 2, cy - hh - 5.5, { s: 2.6, c: COL.dim });
      D.txt(g, 'h', x0 + w + 3, cy, { s: 2.6, c: COL.dim });
    },
    readouts(st) {
      const M = this.M(st.p);
      const r = [['M = μ₀h/(2π) ln((a+c)/a)', fmtSI(M, 'H', 2), COL.oro]];
      if (st.p.quien === 'alambre') r.push(['φ₂₁/I (barrido)', fmtSI(st.parcial || 0, 'H', 2), COL.E]);
      else r.push(['Calculado desde la espira', fmtSI(M, 'H', 2) + ' (igual)', COL.I]);
      return r;
    },
    idea(st) { return st.p.quien === 'espira' ? 'Más difícil de calcular, mismo resultado: $M_{12}=M_{21}$.' : null; },
  };
  wrapIdea('mutua');
})();
