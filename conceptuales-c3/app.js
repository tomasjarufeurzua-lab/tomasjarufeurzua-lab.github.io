// Página de preguntas conceptuales: inicio, una pregunta a la vez, pantalla entre partes y final.
// El progreso (vistas y marcadas) se guarda en localStorage; si falla, la página funciona igual.
(function () {
  'use strict';
  const P = window.PREGUNTAS;
  const TOTAL = P.length;
  const FIN_A = P.filter((q) => q.parte === 'A').length;
  const app = document.getElementById('app');
  const CLAVE = 'conceptuales-c3-fis121-v2';

  // ---- progreso ----
  let prog = { vistas: [], marcadas: [], ultima: 0 };
  try { const g = JSON.parse(localStorage.getItem(CLAVE)); if (g && Array.isArray(g.vistas)) prog = Object.assign(prog, g); } catch (e) { /* sin almacenamiento */ }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(prog)); } catch (e) { /* nada */ } }
  const vista = (id) => prog.vistas.includes(id);
  const marcada = (id) => prog.marcadas.includes(id);

  // ---- texto con negritas, listas y fórmulas ----
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const enLinea = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  function md(src) {
    return src.split(/\n\s*\n/).map((bloque) => {
      const lineas = bloque.split('\n');
      let html = '', lista = [], parrafo = [];
      const cerrarP = () => { if (parrafo.length) { html += '<p>' + parrafo.map(enLinea).join('\n') + '</p>'; parrafo = []; } };
      const cerrarL = () => { if (lista.length) { html += '<ul>' + lista.map((l) => '<li>' + enLinea(l) + '</li>').join('') + '</ul>'; lista = []; } };
      lineas.forEach((l) => { if (/^- /.test(l)) { cerrarP(); lista.push(l.slice(2)); } else { cerrarL(); parrafo.push(l); } });
      cerrarP(); cerrarL();
      return html;
    }).join('');
  }
  function formulas(el) {
    if (!window.renderMathInElement) return;
    try {
      window.renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
    } catch (e) { /* queda el texto */ }
  }
  function h(tag, attrs, ...hijos) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
    });
    hijos.flat().forEach((c) => { if (c != null && c !== false) e.append(c); });
    return e;
  }

  // ---- dibujos estáticos de las preguntas ----
  const DIBUJOS = {
    condensador: `<svg viewBox="0 0 320 150" role="img" aria-label="Cable que llega a un condensador de placas paralelas, con el anillo Γ, una superficie plana y otra abombada que pasa entre las placas">
      <path d="M95 59 C130 22 196 22 214 34 L214 116 C196 128 130 128 95 91 Z" fill="var(--flujo)" stroke="var(--c-E)" stroke-dasharray="5 4" stroke-width="1.5"/>
      <ellipse cx="95" cy="75" rx="9" ry="16" fill="rgba(251,146,60,0.25)"/>
      <line x1="10" y1="75" x2="200" y2="75" stroke="var(--c-alambre)" stroke-width="3"/>
      <line x1="228" y1="75" x2="310" y2="75" stroke="var(--c-alambre)" stroke-width="3"/>
      <rect x="198" y="38" width="5" height="74" fill="#aab3bd"/><rect x="225" y="38" width="5" height="74" fill="#aab3bd"/>
      <ellipse cx="95" cy="75" rx="9" ry="16" fill="none" stroke="var(--c-gamma)" stroke-width="2.5"/>
      <text x="95" y="50" fill="var(--c-gamma)" font-size="15" text-anchor="middle" font-weight="700">Γ</text>
      <path d="M30 63 L52 63" stroke="var(--c-I)" stroke-width="2"/><path d="M52 58 L60 63 L52 68 Z" fill="var(--c-I)"/>
      <text x="44" y="56" fill="var(--c-I)" font-size="13" text-anchor="middle" font-weight="700">I</text>
      <text x="60" y="118" fill="var(--c-dim)" font-size="11">superficie plana</text>
      <text x="150" y="16" fill="var(--c-E)" font-size="11" text-anchor="middle">superficie abombada</text>
    </svg>`,
    circulacion: `<svg viewBox="0 0 320 170" role="img" aria-label="Curva Γ que encierra I1 saliendo e I2 entrando; I3 queda afuera; P está sobre el borde derecho de Γ">
      <rect x="40" y="20" width="170" height="130" rx="26" fill="none" stroke="var(--c-gamma)" stroke-width="2.5"/>
      <path d="M210 70 L210 92" stroke="var(--c-gamma)" stroke-width="2.5"/><path d="M204 76 L210 64 L216 76 Z" fill="var(--c-gamma)"/>
      <text x="52" y="40" fill="var(--c-gamma)" font-size="16" font-weight="700">Γ</text>
      <circle cx="95" cy="68" r="11" fill="none" stroke="var(--c-I)" stroke-width="2"/><circle cx="95" cy="68" r="3.5" fill="var(--c-I)"/>
      <text x="115" y="60" fill="var(--c-I)" font-size="13" font-weight="700">I₁</text>
      <circle cx="160" cy="112" r="11" fill="none" stroke="var(--c-I)" stroke-width="2"/><path d="M152 104 L168 120 M168 104 L152 120" stroke="var(--c-I)" stroke-width="2"/>
      <text x="178" y="106" fill="var(--c-I)" font-size="13" font-weight="700">I₂</text>
      <circle cx="270" cy="85" r="11" fill="none" stroke="var(--c-I)" stroke-width="2"/><circle cx="270" cy="85" r="3.5" fill="var(--c-I)"/>
      <text x="288" y="78" fill="var(--c-I)" font-size="13" font-weight="700">I₃</text>
      <circle cx="210" cy="85" r="4" fill="#fff"/><text x="219" y="100" fill="#fff" font-size="13" font-weight="700">P</text>
    </svg>`,
  };

  // ---- estado de la navegación ----
  let sim = null;
  let modoMarcadas = false;
  function limpiar() { if (sim) { sim.destruir(); sim = null; } app.textContent = ''; }
  function ir(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  const pq = (id) => '#p-' + id;

  function chipParte(q) { return h('span', { class: 'chip ' + (q.parte === 'A' ? 'chip-a' : 'chip-b') }, q.parte === 'A' ? 'Más probable' : 'Podría salir'); }

  // ---- inicio ----
  function inicio() {
    limpiar();
    const n = prog.vistas.length;
    const temas = [];
    P.forEach((q) => { const k = q.parte + '|' + q.tema; if (!temas.includes(k)) temas.push(k); });
    const indice = h('details', { class: 'indice' },
      h('summary', null, 'Índice de las ' + TOTAL + ' preguntas'),
      ['A', 'B'].map((parte) => h('div', { class: 'indice-parte' },
        h('h3', null, parte === 'A' ? 'Parte A · Las más probables' : 'Parte B · Podrían salir'),
        temas.filter((t) => t.startsWith(parte)).map((t) => h('div', { class: 'indice-tema' },
          h('h4', null, t.split('|')[1]),
          h('ol', null, P.filter((q) => q.parte + '|' + q.tema === t).map((q) => h('li', { value: q.id },
            h('a', { href: pq(q.id), onclick: () => { modoMarcadas = false; } },
              h('span', { class: 'indice-titulo', html: enLinea(q.titulo) }),
              vista(q.id) ? h('span', { class: 'ok', title: 'Vista' }, '✓') : null,
              marcada(q.id) ? h('span', { class: 'estrella', title: 'Marcada para repasar' }, '★') : null)))))))));
    const continuar = n > 0 && n < TOTAL && prog.ultima;
    const caja = h('section', { class: 'portada' },
      h('p', { class: 'sobre' }, 'FIS121 · Electricidad y Magnetismo'),
      h('h1', null, 'Preguntas conceptuales · Electromagnetismo (Certamen 3)'),
      h('p', { class: 'sub' }, 'Ampère, Faraday–Lenz, inductancia, transformador y Maxwell. Intenta responder cada pregunta antes de ver la respuesta.'),
      h('div', { class: 'barra-prog', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': TOTAL, 'aria-valuenow': n, 'aria-label': 'Preguntas vistas' }, h('i', { style: `width:${n / TOTAL * 100}%` })),
      h('p', { class: 'cuenta' }, n + ' / ' + TOTAL + ' vistas'),
      h('div', { class: 'acciones' },
        h('a', { class: 'btn principal', href: pq(continuar ? prog.ultima : 1), onclick: () => { modoMarcadas = false; } }, continuar ? 'Continuar donde quedé' : 'Empezar'),
        continuar ? h('a', { class: 'btn', href: pq(1), onclick: () => { modoMarcadas = false; } }, 'Empezar de nuevo') : null,
        prog.marcadas.length ? h('button', { class: 'btn', type: 'button', onclick: () => irMarcadas() }, '★ Ir a las que marqué (' + prog.marcadas.length + ')') : null),
      indice,
      h('p', { class: 'nota' }, 'Atajos: ← → para moverte, Espacio o Enter para ver u ocultar la respuesta.'),
      (n || prog.marcadas.length) ? h('button', { class: 'enlace-chico', type: 'button', onclick: () => {
        if (!confirm('¿Borrar el progreso y las marcas?')) return;
        prog = { vistas: [], marcadas: [], ultima: 0 }; guardar(); render();
      } }, 'Reiniciar progreso') : null);
    app.append(caja);
    formulas(caja);
    document.title = 'Preguntas conceptuales · Certamen 3 · FIS121';
  }
  function irMarcadas() {
    const m = prog.marcadas.slice().sort((a, b) => a - b);
    if (!m.length) return;
    modoMarcadas = true;
    ir(pq(m[0]));
  }

  // ---- pregunta ----
  function pregunta(id) {
    limpiar();
    const q = P.find((x) => x.id === id);
    if (!q) return inicio();
    prog.ultima = id; guardar();
    const lista = modoMarcadas ? prog.marcadas.slice().sort((a, b) => a - b) : null;
    if (lista && !lista.includes(id)) modoMarcadas = false;
    const pos = modoMarcadas ? lista.indexOf(id) : id - 1, cuantas = modoMarcadas ? lista.length : TOTAL;

    const btnEstrella = h('button', { class: 'estrella-btn' + (marcada(id) ? ' on' : ''), type: 'button', 'aria-pressed': String(marcada(id)), title: 'Marcar para repasar' }, marcada(id) ? '★ Marcada' : '☆ Marcar para repasar');
    btnEstrella.addEventListener('click', () => {
      if (marcada(id)) prog.marcadas = prog.marcadas.filter((x) => x !== id); else prog.marcadas.push(id);
      guardar();
      const on = marcada(id);
      btnEstrella.classList.toggle('on', on); btnEstrella.setAttribute('aria-pressed', String(on));
      btnEstrella.textContent = on ? '★ Marcada' : '☆ Marcar para repasar';
    });

    const cuerpo = h('div', { class: 'resp-cuerpo' });
    cuerpo.innerHTML = md(q.respuesta);
    const simHost = h('div', { class: 'sim-host' });
    const resp = h('section', { class: 'respuesta', id: 'respuesta', 'aria-hidden': 'true' },
      h('div', { class: 'resp-inner' },
        h('h3', { class: 'resp-tit' }, 'Respuesta'),
        cuerpo,
        q.animacion ? h('h3', { class: 'anim-tit' }, 'Animación · ' + q.animTitulo) : null,
        q.notaAnim ? h('p', { class: 'nota-anim', html: '<strong>Ojo:</strong> ' + enLinea(q.notaAnim) }) : null,
        q.animacion ? simHost : null));
    const btnVer = h('button', { class: 'btn principal ver', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'respuesta' }, 'Ver respuesta');
    let abierta = false;
    function alternar(forzar) {
      abierta = forzar === undefined ? !abierta : forzar;
      resp.classList.toggle('abierta', abierta);
      resp.setAttribute('aria-hidden', String(!abierta));
      btnVer.textContent = abierta ? 'Ocultar respuesta' : 'Ver respuesta';
      btnVer.setAttribute('aria-expanded', String(abierta));
      if (abierta) {
        if (!vista(id)) { prog.vistas.push(id); guardar(); }
        if (!sim && q.animacion) {
          const def = window.SIMS[q.animacion];
          if (def) sim = window.Motor.crear(simHost, def, { titulo: q.animTitulo, idea: q.ideaClave });
        } else if (sim) sim.activar(true);
        actualizarBarra();
      } else if (sim) sim.activar(false);
    }
    btnVer.addEventListener('click', () => alternar());

    const ant = h('button', { class: 'btn nav', type: 'button', disabled: pos === 0 && !(!modoMarcadas && id > 1) }, '← Anterior');
    const sig = h('button', { class: 'btn nav principal-sig', type: 'button' }, modoMarcadas ? (pos === cuantas - 1 ? 'Terminar repaso' : 'Siguiente marcada →') : id === TOTAL ? 'Terminar →' : 'Siguiente →');
    ant.addEventListener('click', anterior);
    sig.addEventListener('click', siguiente);
    function anterior() {
      if (modoMarcadas) { if (pos > 0) ir(pq(lista[pos - 1])); return; }
      if (id > 1) ir(pq(id - 1));
    }
    function siguiente() {
      if (modoMarcadas) { if (pos < cuantas - 1) ir(pq(lista[pos + 1])); else { modoMarcadas = false; ir('#final'); } return; }
      if (id === FIN_A) ir('#parte-b');
      else if (id === TOTAL) ir('#final');
      else ir(pq(id + 1));
    }
    const barra = h('div', { class: 'barra-prog arriba', role: 'progressbar', 'aria-label': 'Avance', 'aria-valuemin': 0, 'aria-valuemax': cuantas }, h('i'));
    function actualizarBarra() {
      const n = modoMarcadas ? pos + 1 : prog.vistas.length;
      barra.firstChild.style.width = (modoMarcadas ? (pos + 1) / cuantas : n / TOTAL) * 100 + '%';
      barra.setAttribute('aria-valuenow', n);
    }
    actualizarBarra();

    const enun = h('article', { class: 'card enunciado' },
      h('h2', { html: enLinea(q.titulo) }),
      h('div', { class: 'enun-txt', html: md(q.enunciado) }),
      q.dibujo && DIBUJOS[q.dibujo] ? h('figure', { class: 'dibujo', html: DIBUJOS[q.dibujo] }) : null);

    const vista_ = h('div', { class: 'vista-pregunta' },
      barra,
      modoMarcadas ? h('p', { class: 'aviso-marcadas' }, '★ Repasando las marcadas (' + (pos + 1) + ' de ' + cuantas + ') · ', h('button', { class: 'enlace-chico', type: 'button', onclick: () => { modoMarcadas = false; render(); } }, 'Ver todas')) : null,
      h('div', { class: 'q-head' },
        chipParte(q), h('span', { class: 'chip chip-tema' }, q.tema),
        h('span', { class: 'q-num' }, 'Pregunta ' + id + ' de ' + TOTAL)),
      enun,
      h('div', { class: 'acciones-q' }, btnVer, btnEstrella),
      resp,
      h('nav', { class: 'q-nav', 'aria-label': 'Navegación entre preguntas' }, ant, h('a', { class: 'q-inicio', href: '#' }, 'Índice'), sig));
    app.append(vista_);
    formulas(enun);
    formulas(resp);
    document.title = 'P' + id + ' · ' + q.titulo.replace(/\$/g, '') + ' · Conceptuales C3';
    teclas = (e) => {
      const t = e.target;
      if (t.closest && (t.closest('input, select, textarea, .sim') || (t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')))) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alternar(); }
    };
  }

  function parteB() {
    limpiar();
    teclas = (e) => { if (e.key === 'ArrowRight') ir(pq(FIN_A + 1)); else if (e.key === 'ArrowLeft') ir(pq(FIN_A)); };
    app.append(h('section', { class: 'portada intermedia' },
      h('p', { class: 'grande' }, '🎉'),
      h('h1', null, '¡Terminaste las más probables!'),
      h('p', { class: 'sub', html: 'Las siguientes son de <strong>Ley de Ampère</strong>. No creo que salgan en la sección conceptual, pero podrían. ¿Seguimos?' }),
      h('div', { class: 'acciones' },
        h('a', { class: 'btn principal', href: pq(FIN_A + 1) }, 'Seguir con la Parte B'),
        h('a', { class: 'btn', href: '#' }, 'Volver al inicio'))));
  }

  function final() {
    limpiar();
    teclas = null;
    const n = prog.vistas.length;
    app.append(h('section', { class: 'portada intermedia' },
      h('p', { class: 'grande' }, '✅'),
      h('h1', null, '¡Llegaste al final!'),
      h('p', { class: 'cuenta' }, n + ' / ' + TOTAL + ' vistas'),
      h('div', { class: 'barra-prog' }, h('i', { style: `width:${n / TOTAL * 100}%` })),
      h('div', { class: 'acciones' },
        h('a', { class: 'btn principal', href: pq(1), onclick: () => { modoMarcadas = false; } }, 'Repasar desde el principio'),
        prog.marcadas.length ? h('button', { class: 'btn', type: 'button', onclick: irMarcadas }, '★ Ir a las que marqué (' + prog.marcadas.length + ')') : h('span', { class: 'nota' }, 'No marcaste ninguna. Usa ☆ en una pregunta para repasarla después.'),
        h('a', { class: 'btn', href: '#' }, 'Índice'))));
  }

  // ---- rutas ----
  let teclas = null;
  document.addEventListener('keydown', (e) => { if (teclas) teclas(e); });
  function render() {
    teclas = null;
    const hs = location.hash;
    const m = /^#p-(\d+)$/.exec(hs);
    if (m) pregunta(parseInt(m[1], 10));
    else if (hs === '#parte-b') parteB();
    else if (hs === '#final') final();
    else inicio();
    window.scrollTo(0, 0);
    const foco = app.querySelector('h1, h2');
    if (foco) { foco.setAttribute('tabindex', '-1'); foco.focus({ preventScroll: true }); }
  }
  window.addEventListener('hashchange', render);
  render();
})();
