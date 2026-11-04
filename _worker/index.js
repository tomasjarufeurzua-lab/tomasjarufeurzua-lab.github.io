// Worker de la copia en Cloudflare: sirve el sitio (carpeta _cf) y la lista de avisos por correo.
//
//   POST /api/suscribir  { correo, turnstile }  → inscribe el correo y manda una bienvenida con enlace de baja
//   GET  /api/confirmar?t=TOKEN                 → confirma (para enlaces de confirmacion antiguos)
//   GET  /api/baja?t=TOKEN (o POST, un clic)    → borra el correo de la lista
//   POST /api/aviso      { archivos: [...] }    → avisa a los confirmados (solo con AVISO_TOKEN)
//   POST /api/voto       { ruta, voto: 1|-1 }   → "¿Te sirvio?" de un PDF (un voto por persona y archivo)
//   POST /api/reporte    { ruta, texto, turnstile } → reporte de un error en un PDF
//   POST /api/panel      { clave, accion? }     → numeros para el panel privado (solo con ADMIN_CLAVE)
//
// Configuracion (Cloudflare → Workers → tomasjarufe → Settings → Variables and Secrets):
//   base D1 "DB" (en wrangler.jsonc); secretos RESEND_API_KEY, TURNSTILE_SECRET, AVISO_TOKEN,
//   ADMIN_CLAVE (clave del panel) y, opcional, ADMIN_CORREO (recibe los reportes de errores).

const SITIO = 'https://tomasjarufe.site';
const COPIA = 'https://tomasjarufe.tomasjarufeurzua.workers.dev';
const REMITENTE = 'Tomás Jarufe <material@tomasjarufe.site>';
const ORIGENES = [SITIO, 'https://www.tomasjarufe.site', COPIA];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    // Diagnostico: que configuracion ve el Worker (solo nombres, nunca valores)
    if (url.pathname === '/api/estado') {
      const tiene = (k) => typeof env[k] === 'string' && env[k].length > 0;
      return json({
        base_de_datos: !!env.DB,
        RESEND_API_KEY: tiene('RESEND_API_KEY'),
        TURNSTILE_SECRET: tiene('TURNSTILE_SECRET'),
        AVISO_TOKEN: tiene('AVISO_TOKEN'),
        nombres_recibidos: Object.keys(env).sort(),
      }, 200, request);
    }
    try {
      if (!env.DB) return json({ error: 'Los avisos por correo aún no están configurados.' }, 503, request);
      await crearTabla(env);
      const ruta = url.pathname.replace(/\/+$/, '');
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
      if (ruta === '/api/suscribir' && request.method === 'POST') return await suscribir(request, env);
      if (ruta === '/api/confirmar' && request.method === 'GET') return await confirmar(url, env);
      if (ruta === '/api/baja' && (request.method === 'GET' || request.method === 'POST')) return await baja(request, url, env);
      if (ruta === '/api/aviso' && request.method === 'POST') return await aviso(request, env);
      if (ruta === '/api/voto' && request.method === 'POST') return await votar(request, env);
      if (ruta === '/api/reporte' && request.method === 'POST') return await reportar(request, env);
      if (ruta === '/api/panel' && request.method === 'POST') return await panel(request, env);
      return json({ error: 'No encontrado' }, 404, request);
    } catch (e) {
      console.error(e);
      return json({ error: 'Algo falló. Intenta de nuevo en unos minutos. (código: ' + codigoError(e) + ')' }, 500, request);
    }
  },
};

// Las tablas se crean (o se les agregan columnas) la primera vez que el Worker atiende algo
let tablasListas = false;
async function crearTabla(env) {
  if (tablasListas) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS suscriptores (
      correo TEXT PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      confirmado INTEGER NOT NULL DEFAULT 0,
      creado TEXT NOT NULL,
      confirmacion_enviada TEXT
    )`),
    // Votos "¿Te sirvio?": uno por persona (huella anonima) y archivo; se puede cambiar
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS votos (
      ruta TEXT NOT NULL,
      huella TEXT NOT NULL,
      voto INTEGER NOT NULL,
      creado TEXT NOT NULL,
      PRIMARY KEY (ruta, huella)
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS reportes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ruta TEXT NOT NULL,
      texto TEXT NOT NULL,
      creado TEXT NOT NULL
    )`),
    // Altas y bajas de la lista, para el panel (sin correos)
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS eventos (
      tipo TEXT NOT NULL,
      creado TEXT NOT NULL
    )`),
  ]);
  // Ramos elegidos por cada inscrito (JSON con nombres de carpeta; NULL = todos los ramos)
  const { results } = await env.DB.prepare('PRAGMA table_info(suscriptores)').all();
  if (!results.some((c) => c.name === 'ramos')) await env.DB.prepare('ALTER TABLE suscriptores ADD COLUMN ramos TEXT').run();
  // IP desde donde se inscribio el correo (la ultima vez que se inscribio)
  if (!results.some((c) => c.name === 'ip')) await env.DB.prepare('ALTER TABLE suscriptores ADD COLUMN ip TEXT').run();
  tablasListas = true;
}

// ---------- suscribirse ----------
async function suscribir(request, env) {
  let datos;
  try { datos = await request.json(); } catch { return json({ error: 'Datos inválidos.' }, 400, request); }
  const correo = String(datos.correo || '').trim().toLowerCase();
  if (correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
    return json({ error: 'Ese correo no parece válido.' }, 400, request);
  }
  if (!(await turnstileOk(datos.turnstile, request, env))) {
    return json({ error: 'No pudimos verificar que no eres un robot. Recarga la página e intenta de nuevo.' }, 400, request);
  }
  // Ramos elegidos: nombres de carpeta de material/ (vacio o ausente = todos)
  const ramos = Array.isArray(datos.ramos)
    ? [...new Set(datos.ramos.map((r) => String(r).trim()).filter((r) => r && r.length <= 80 && !/[\/]/.test(r)))].slice(0, 20)
    : [];
  const ramosJson = ramos.length ? JSON.stringify(ramos) : null;
  const ahora = new Date().toISOString();
  const ip = request.headers.get('CF-Connecting-IP') || null;
  const fila = await env.DB.prepare('SELECT token, confirmado FROM suscriptores WHERE correo = ?').bind(correo).first();
  // Misma respuesta en todos los casos, para no revelar quien esta inscrito
  const listo = json({ ok: true, mensaje: '¡Listo! Te avisaré por correo cuando suba material nuevo. Te mandé un correo de bienvenida: si no lo ves, revisa Spam o Correo no deseado y márcalo como «No es spam».' }, 200, request);
  if (fila && fila.confirmado) {
    // Ya inscrito: inscribirse de nuevo solo actualiza los ramos elegidos (sin mandar otro correo)
    await env.DB.prepare('UPDATE suscriptores SET ramos = ?, ip = ? WHERE correo = ?').bind(ramosJson, ip, correo).run();
    return listo;
  }
  // Inscripcion inmediata (sin confirmar); llega un correo de bienvenida con el enlace para darse de baja,
  // por si alguien inscribio un correo ajeno
  const token = fila ? fila.token : crypto.randomUUID();
  if (fila) {
    await env.DB.prepare('UPDATE suscriptores SET confirmado = 1, confirmacion_enviada = ?, ramos = ?, ip = ? WHERE correo = ?').bind(ahora, ramosJson, ip, correo).run();
  } else {
    await env.DB.prepare('INSERT INTO suscriptores (correo, token, confirmado, creado, confirmacion_enviada, ramos, ip) VALUES (?, ?, 1, ?, ?, ?, ?)')
      .bind(correo, token, ahora, ahora, ramosJson, ip).run();
  }
  const queRamos = ramos.length ? 'de ' + ramos.map(titulo).join(', ') : 'de los ramos que ayudo';
  const salir = `${SITIO}/baja.html?t=${token}`;
  const salirUnClic = `${COPIA}/api/baja?t=${token}`;
  try {
    await enviar(env, [{
      from: REMITENTE,
      to: [correo],
      subject: 'Listo: te avisaré cuando suba material nuevo',
      headers: { 'List-Unsubscribe': `<${salirUnClic}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      html: plantilla({
        previa: 'Te avisaré cada vez que suba material nuevo.',
        titulo: '¡Listo, quedaste inscrito!',
        intro: `Desde ahora te llegará un correo cada vez que suba material nuevo ${esc(queRamos)}: apuntes, ensayos y pautas. Para cambiar de ramos, vuelve a inscribirte en la página con el mismo correo.`,
        boton: { texto: 'Ver el material', href: `${SITIO}/#material` },
        pie: `¿No fuiste tú quien se inscribió? <a href="${salir}" style="color:${C.tenue};text-decoration:underline">Darme de baja</a> y no recibirás nada más.`,
      }),
      text: `Desde ahora te llegará un correo cada vez que suba material nuevo ${queRamos} a tomasjarufe.site.\n\n¿No fuiste tú? Date de baja aquí: ${salir}`,
    }]);
    await env.DB.prepare("INSERT INTO eventos (tipo, creado) VALUES ('alta', ?)").bind(ahora).run();
  } catch (e) {
    // Si la bienvenida no sale (por ejemplo, correo inexistente), la inscripcion se deshace
    await env.DB.prepare('DELETE FROM suscriptores WHERE correo = ?').bind(correo).run();
    throw e;
  }
  return listo;
}

async function turnstileOk(respuesta, request, env) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!respuesta) return false;
  const cuerpo = new FormData();
  cuerpo.append('secret', env.TURNSTILE_SECRET);
  cuerpo.append('response', String(respuesta));
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) cuerpo.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: cuerpo });
  const d = await r.json();
  return !!d.success;
}

// ---------- confirmar y darse de baja ----------
async function confirmar(url, env) {
  const t = url.searchParams.get('t') || '';
  const r = await env.DB.prepare('UPDATE suscriptores SET confirmado = 1 WHERE token = ?').bind(t).run();
  if (!r.meta.changes) return pagina('Enlace no válido', 'Este enlace no es válido o ya te diste de baja. Puedes inscribirte de nuevo en la página.');
  return pagina('¡Listo!', 'Desde ahora te llegará un correo cada vez que suba material nuevo. Cada correo trae un enlace para darte de baja.');
}

// Abrir el enlace (GET) solo muestra un boton; la baja se hace con POST. Asi los antivirus de correo
// (como el de Microsoft en @usm.cl), que abren todos los enlaces de un mail, no dan de baja a nadie.
// El boton "Cancelar suscripcion" de Gmail/Outlook usa POST (List-Unsubscribe-Post) y da de baja altiro.
async function baja(request, url, env) {
  const t = url.searchParams.get('t') || '';
  if (request.method === 'GET') {
    const fila = await env.DB.prepare('SELECT 1 FROM suscriptores WHERE token = ?').bind(t).first();
    if (!fila) return pagina('Ya no estás inscrito', 'Este correo ya no está en la lista de avisos.');
    return pagina('¿Darte de baja?', 'Dejarás de recibir los correos de material nuevo.',
      `<form method="post" action="/api/baja?t=${encodeURIComponent(t)}"><button type="submit" style="padding:10px 20px;border-radius:999px;border:1px solid #8a7f57;background:#42464b;color:#f1f3f5;font:inherit;font-weight:600;cursor:pointer">Sí, darme de baja</button></form>`);
  }
  const borrado = await env.DB.prepare('DELETE FROM suscriptores WHERE token = ?').bind(t).run();
  if (borrado.meta.changes) await env.DB.prepare("INSERT INTO eventos (tipo, creado) VALUES ('baja', ?)").bind(new Date().toISOString()).run();
  // Desde la pagina baja.html de tomasjarufe.site se responde en JSON (con CORS)
  if (request.headers.get('Origin')) return json({ ok: true }, 200, request);
  return pagina('Te diste de baja', 'Ya no recibirás más correos de avisos de material. Tu correo fue borrado de la lista.');
}

// ---------- aviso de material nuevo ----------
async function aviso(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!env.AVISO_TOKEN || auth !== `Bearer ${env.AVISO_TOKEN}`) return json({ error: 'No autorizado' }, 401, request);
  let datos;
  try { datos = await request.json(); } catch { return json({ error: 'Datos inválidos.' }, 400, request); }
  const archivos = (Array.isArray(datos.archivos) ? datos.archivos : [])
    .map(String).filter((r) => r.startsWith('material/') && !r.split('/').pop().startsWith('.'));
  if (!archivos.length) return json({ ok: true, enviados: 0 }, 200, request);
  // "solo": manda el aviso a un solo inscrito (para probar sin molestar a los demas)
  const solo = datos.solo ? String(datos.solo).trim().toLowerCase() : '';
  // Si "solo" empieza con @ (por ejemplo @usm.cl) va a todos los de ese dominio y sus subdominios
  const dominio = solo.startsWith('@') ? solo.slice(1) : '';
  const { results } = dominio
    ? await env.DB.prepare("SELECT correo, token, ramos FROM suscriptores WHERE confirmado = 1 AND (correo LIKE ? OR correo LIKE ?)").bind('%@' + dominio, '%.' + dominio).all()
    : solo
      ? await env.DB.prepare('SELECT correo, token, ramos FROM suscriptores WHERE confirmado = 1 AND correo = ?').bind(solo).all()
      : await env.DB.prepare('SELECT correo, token, ramos FROM suscriptores WHERE confirmado = 1').all();
  const lista = archivos.map((ruta) => {
    const partes = ruta.split('/');
    const ramo = titulo(partes[1]);
    const nombre = titulo(partes[partes.length - 1].replace(/\.[^.]+$/, ''));
    const href = `${SITIO}/${partes.map(encodeURIComponent).join('/')}`;
    const carpeta = partes.slice(2, -1).map(titulo).join(' · ');
    return { ramo, nombre, href, carpeta, carpetaRamo: partes[1] };
  });
  // Cada inscrito recibe solo los archivos de los ramos que eligio (sin eleccion = todos)
  const mensajes = results.map((s) => {
    let elegidos = null;
    try { elegidos = s.ramos ? JSON.parse(s.ramos) : null; } catch { elegidos = null; }
    const suyos = elegidos && elegidos.length ? lista.filter((x) => elegidos.includes(x.carpetaRamo)) : lista;
    if (!suyos.length) return null;
    return mensajeAviso(s, suyos);
  }).filter(Boolean);
  for (let i = 0; i < mensajes.length; i += 100) await enviar(env, mensajes.slice(i, i + 100));
  return json({ ok: true, enviados: mensajes.length }, 200, request);
}

function mensajeAviso(s, lista) {
  const cuerpo = filasArchivos(lista);
  const texto = lista.map((x) => `- ${x.nombre} (${x.ramo}): ${x.href}`).join('\n');
  const asunto = lista.length === 1 ? `Material nuevo: ${lista[0].nombre}` : `Material nuevo: ${lista.length} archivos`;
  const salir = `${SITIO}/baja.html?t=${s.token}`;
  const salirUnClic = `${COPIA}/api/baja?t=${s.token}`;
  return {
    from: REMITENTE,
    to: [s.correo],
    subject: asunto,
    headers: { 'List-Unsubscribe': `<${salirUnClic}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    html: plantilla({
      previa: lista.map((x) => x.nombre).join(' · '),
      titulo: lista.length === 1 ? 'Subí material nuevo' : `Subí ${lista.length} archivos nuevos`,
      intro: 'Ya está disponible en la página. Toca un archivo para descargarlo.',
      cuerpo,
      boton: { texto: 'Ver todo el material', href: `${SITIO}/#material` },
      pie: `Recibes esto porque te inscribiste en tomasjarufe.site. <a href="${salir}" style="color:${C.tenue};text-decoration:underline">Darme de baja</a>`,
    }),
    text: `Subí material nuevo:\n\n${texto}\n\nTodo el material: ${SITIO}/#material\n\nDarme de baja: ${salir}`,
  };
}

// ---------- "¿Te sirvio?" y reportes de errores ----------
// El archivo tiene que existir en la pagina (asi nadie llena la base con rutas inventadas)
async function rutaValida(ruta, env) {
  if (typeof ruta !== 'string' || !ruta.startsWith('material/') || ruta.length > 400 || ruta.includes('..')) return false;
  const r = await env.ASSETS.fetch(new Request(`${COPIA}/${ruta.split('/').map(encodeURIComponent).join('/')}`, { method: 'HEAD' }));
  return r.ok;
}

// Huella anonima de quien vota: resumen de su IP y del archivo (no se guarda la IP)
async function huella(request, ruta, env) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const datos = new TextEncoder().encode(`${ip}|${ruta}|${env.AVISO_TOKEN || ''}`);
  const h = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function votar(request, env) {
  let datos;
  try { datos = await request.json(); } catch { return json({ error: 'Datos inválidos.' }, 400, request); }
  const voto = Number(datos.voto);
  if (voto !== 1 && voto !== -1) return json({ error: 'Voto inválido.' }, 400, request);
  if (!(await rutaValida(datos.ruta, env))) return json({ error: 'Archivo no encontrado.' }, 400, request);
  await env.DB.prepare(`INSERT INTO votos (ruta, huella, voto, creado) VALUES (?, ?, ?, ?)
    ON CONFLICT (ruta, huella) DO UPDATE SET voto = excluded.voto, creado = excluded.creado`)
    .bind(datos.ruta, await huella(request, datos.ruta, env), voto, new Date().toISOString()).run();
  return json({ ok: true }, 200, request);
}

async function reportar(request, env) {
  let datos;
  try { datos = await request.json(); } catch { return json({ error: 'Datos inválidos.' }, 400, request); }
  const texto = String(datos.texto || '').trim().slice(0, 1000);
  if (texto.length < 3) return json({ error: 'Cuéntame cuál es el error.' }, 400, request);
  if (!(await turnstileOk(datos.turnstile, request, env))) {
    return json({ error: 'No pudimos verificar que no eres un robot. Intenta de nuevo.' }, 400, request);
  }
  if (!(await rutaValida(datos.ruta, env))) return json({ error: 'Archivo no encontrado.' }, 400, request);
  await env.DB.prepare('INSERT INTO reportes (ruta, texto, creado) VALUES (?, ?, ?)').bind(datos.ruta, texto, new Date().toISOString()).run();
  // Aviso al correo del administrador (si esta configurado); si falla, el reporte igual queda guardado
  if (env.ADMIN_CORREO && env.RESEND_API_KEY) {
    const partes = datos.ruta.split('/');
    const nombre = titulo(partes[partes.length - 1].replace(/\.[^.]+$/, ''));
    await enviar(env, [{
      from: REMITENTE,
      to: [env.ADMIN_CORREO],
      subject: `Reporte de error: ${nombre}`,
      html: plantilla({
        previa: texto.slice(0, 90),
        titulo: 'Reportaron un error',
        intro: `En <b>${esc(nombre)}</b> <span style="color:${C.tenue}">(${esc(partes.slice(1, -1).map(titulo).join(' · '))})</span>:`,
        cuerpo: `<p class="c-texto" style="margin:0 0 16px;padding:12px 14px;border-radius:10px;background:${C.fila};font-size:15px;line-height:1.6;color:${C.texto};white-space:pre-wrap">${esc(texto)}</p>`,
        boton: { texto: 'Abrir el PDF', href: `${SITIO}/${partes.map(encodeURIComponent).join('/')}` },
        pie: 'Lo ves también en el panel de tu página (Candado → Panel).',
      }),
      text: `Reportaron un error en ${nombre}:\n\n${texto}`,
    }]).catch((e) => console.error(e));
  }
  return json({ ok: true }, 200, request);
}

// ---------- panel privado ----------
function claveOk(clave, env) {
  const a = new TextEncoder().encode(String(clave || ''));
  const b = new TextEncoder().encode(String(env.ADMIN_CLAVE || ''));
  if (!b.length || a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a[i] ^ b[i];
  return dif === 0;
}

async function panel(request, env) {
  let datos;
  try { datos = await request.json(); } catch { return json({ error: 'Datos inválidos.' }, 400, request); }
  if (!env.ADMIN_CLAVE) return json({ error: 'Falta configurar ADMIN_CLAVE en Cloudflare.' }, 503, request);
  if (!claveOk(datos.clave, env)) {
    await new Promise((r) => setTimeout(r, 1500));
    return json({ error: 'Clave incorrecta.' }, 401, request);
  }
  if (datos.accion === 'borrar-reporte') {
    await env.DB.prepare('DELETE FROM reportes WHERE id = ?').bind(Number(datos.id) || 0).run();
  }
  const hace30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const [ins, ev, votos, reportes] = await env.DB.batch([
    env.DB.prepare('SELECT correo, ramos, creado, ip FROM suscriptores WHERE confirmado = 1 ORDER BY creado DESC'),
    env.DB.prepare('SELECT tipo, COUNT(*) AS n FROM eventos WHERE creado >= ? GROUP BY tipo').bind(hace30),
    env.DB.prepare(`SELECT ruta, SUM(voto = 1) AS si, SUM(voto = -1) AS no FROM votos GROUP BY ruta ORDER BY (SUM(voto = 1) + SUM(voto = -1)) DESC, ruta`),
    env.DB.prepare('SELECT id, ruta, texto, creado FROM reportes ORDER BY id DESC LIMIT 100'),
  ]);
  const porRamo = {};
  let todos = 0;
  for (const s of ins.results) {
    let r = null;
    try { r = s.ramos ? JSON.parse(s.ramos) : null; } catch { r = null; }
    if (!r || !r.length) { todos++; continue; }
    for (const x of r) porRamo[x] = (porRamo[x] || 0) + 1;
  }
  const evento = (t) => (ev.results.find((e) => e.tipo === t) || { n: 0 }).n;
  return json({
    inscritos: ins.results.length,
    todos_los_ramos: todos,
    por_ramo: porRamo,
    altas_30_dias: evento('alta'),
    bajas_30_dias: evento('baja'),
    lista: ins.results.map((s) => ({ correo: s.correo, ramos: s.ramos ? JSON.parse(s.ramos) : null, creado: s.creado, ip: s.ip || null })),
    votos: votos.results,
    reportes: reportes.results,
  }, 200, request);
}

// ---------- utilidades ----------
// Codigo corto del error para mostrar en la pagina (sin datos secretos), para saber que arreglar
function codigoError(e) {
  const m = String((e && e.message) || e);
  if (m.includes('Falta RESEND_API_KEY')) return 'falta-clave-resend';
  if (/^Resend 401/.test(m)) return 'clave-resend-invalida';
  if (/^Resend 403/.test(m)) return /domain|verify/i.test(m) ? 'dominio-no-verificado-en-resend' : 'resend-sin-permiso';
  if (/^Resend 422/.test(m)) return 'resend-rechazo-el-correo';
  if (/^Resend 429/.test(m)) return 'limite-de-envios-resend';
  if (/^Resend/.test(m)) return 'resend-' + m.slice(7, 10);
  if (/D1|SQL/i.test(m)) return 'base-de-datos';
  return 'otro';
}

async function enviar(env, mensajes) {
  if (!env.RESEND_API_KEY) throw new Error('Falta RESEND_API_KEY');
  const r = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(mensajes),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

// Igual que en la pagina: "1 - Ensayo_1.pdf" → "Ensayo 1"
function titulo(nombre) {
  return nombre.replace(/^\d+\s*-\s+/, '').replace(/\s+-\s+/g, ' — ').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function esc(t) {
  return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Colores del correo. La base es clara a proposito: Gmail en modo oscuro invierte los colores, y un diseno
// claro queda bien al invertirse. Los clientes que respetan el modo oscuro (Apple Mail, Outlook) usan los
// colores oscuros de la pagina (bloque @media de abajo).
const C = { fondo: '#e9ebee', tarjeta: '#ffffff', fila: '#f3f4f6', borde: '#d9dde1', titulo: '#1f2328', texto: '#454b52', tenue: '#6b7178', turquesa: '#14b8a6', pdfFondo: '#ccfbf1', pdfTexto: '#0f766e', oro: '#b8962e' };
const FUENTE = "'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif";
const ESTILO_OSCURO = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) {
    .c-fondo { background: #2b2e32 !important; }
    .c-tarjeta { background: #34383c !important; border-color: #4a4f55 !important; }
    .c-fila { background: #3c4045 !important; border-left-color: #5eead4 !important; }
    .c-titulo { color: #f1f3f5 !important; }
    .c-texto { color: #c3c8cd !important; }
    .c-tenue, .c-tenue a { color: #a3a9af !important; }
    .c-acento { color: #5eead4 !important; }
    .c-barra { background: #5eead4 !important; }
    .c-pdf { background: #2f4a47 !important; color: #5eead4 !important; }
    .c-linea { background: #4a4f55 !important; }
    .c-boton { background: #42464b !important; border-color: #8a7f57 !important; color: #f1f3f5 !important; }
    .c-oro { color: #e9d58f !important; }
  }`;

// Correo con la estetica de la pagina. Tablas y estilos en linea para que se vea igual en Gmail, Outlook y el celular.
function plantilla({ previa, titulo, intro, cuerpo = '', boton, pie }) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(titulo)}</title>
<style>${ESTILO_OSCURO}</style></head>
<body class="c-fondo" style="margin:0;padding:0;background:${C.fondo}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(previa || '')}</div>
<table role="presentation" class="c-fondo" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fondo};padding:28px 12px">
<tr><td align="center">
<table role="presentation" class="c-tarjeta" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.tarjeta};border:1px solid ${C.borde};border-radius:16px;font-family:${FUENTE}">
<tr><td style="padding:28px 28px 8px">
  <p class="c-tenue" style="margin:0 0 18px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.tenue}">Tomás Jarufe Urzúa <span class="c-acento" style="color:${C.turquesa}">·</span> Material</p>
  <h1 class="c-titulo" style="margin:0 0 10px;font-size:24px;line-height:1.25;font-weight:700;color:${C.titulo}">${esc(titulo)}</h1>
  <div class="c-barra" style="width:48px;height:3px;border-radius:3px;background:${C.turquesa};margin:0 0 18px"></div>
  <p class="c-texto" style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${C.texto}">${intro}</p>
</td></tr>
${cuerpo ? `<tr><td style="padding:0 28px">${cuerpo}</td></tr>` : ''}
${boton ? `<tr><td style="padding:12px 28px 8px">
  <a href="${boton.href}" class="c-boton" style="display:inline-block;padding:12px 22px;border-radius:999px;border:1px solid #2b2e32;background:#34383c;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">${esc(boton.texto)} <span class="c-oro" style="color:#e9d58f">→</span></a>
</td></tr>` : ''}
<tr><td style="padding:24px 28px 26px">
  <div class="c-linea" style="height:1px;background:${C.borde};margin:0 0 16px"></div>
  <p class="c-tenue" style="margin:0;font-size:12px;line-height:1.6;color:${C.tenue}">${pie}</p>
  <p class="c-tenue" style="margin:8px 0 0;font-size:12px;color:${C.tenue}"><a href="${SITIO}" style="color:${C.tenue};text-decoration:underline">tomasjarufe.site</a> · Valparaíso, Chile</p>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

// Lista de archivos agrupada por ramo, con filas como las de la pagina
function filasArchivos(lista) {
  const ramos = [...new Set(lista.map((x) => x.ramo))];
  return ramos.map((ramo) => `
  <p class="c-titulo" style="margin:6px 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.titulo}">${esc(ramo)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">${lista.filter((x) => x.ramo === ramo).map((x) => `
    <tr><td style="padding:0 0 8px"><a href="${x.href}" style="display:block;text-decoration:none">
      <table role="presentation" class="c-fila" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fila};border-radius:10px;border-left:3px solid ${C.turquesa}"><tr>
        <td class="c-titulo" style="padding:12px 14px;font-size:15px;line-height:1.4;color:${C.titulo}">${esc(x.nombre)}${x.carpeta ? `<br><span class="c-tenue" style="font-size:12px;color:${C.tenue}">${esc(x.carpeta)}</span>` : ''}</td>
        <td align="right" style="padding:12px 14px 12px 0;white-space:nowrap"><span class="c-pdf" style="display:inline-block;padding:3px 9px;border-radius:5px;background:${C.pdfFondo};color:${C.pdfTexto};font-size:11px;font-weight:700">PDF</span> <span class="c-tenue" style="color:${C.tenue};font-size:15px">↓</span></td>
      </tr></table></a></td></tr>`).join('')}
  </table>`).join('');
}

function cors(request) {
  const origen = request.headers.get('Origin');
  const h = { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
  if (origen && ORIGENES.includes(origen)) h['Access-Control-Allow-Origin'] = origen;
  return h;
}

function json(datos, status, request) {
  return new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(request) } });
}

function pagina(titulo, texto, extra = '') {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#2e3135;color:#d1d5db;font-family:system-ui,sans-serif;padding:24px}
main{max-width:420px}h1{color:#f3f4f6;font-size:1.4rem}a{color:#5eead4}</style></head>
<body><main><h1>${esc(titulo)}</h1><p>${esc(texto)}</p>${extra}<p><a href="${SITIO}/#material">Volver al material</a></p></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
