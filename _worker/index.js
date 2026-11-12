// Worker de la copia en Cloudflare: sirve el sitio (carpeta _cf) y unas pocas funciones con base de datos.
//
//   POST /api/voto       { ruta, voto: 1|-1 }       → "¿Te sirvio?" de un PDF (un voto por persona y archivo)
//   POST /api/reporte    { ruta, texto, turnstile } → reporte de un error en un PDF
//   POST /api/panel      { clave, accion? }         → numeros para el panel privado (solo con ADMIN_CLAVE)
//
// Configuracion (Cloudflare → Workers → tomasjarufe → Settings → Variables and Secrets):
//   base D1 "DB" (en wrangler.jsonc); secretos TURNSTILE_SECRET, AVISO_TOKEN (se usa como sal de las huellas),
//   ADMIN_CLAVE (clave del panel) y, opcional, ADMIN_CORREO + RESEND_API_KEY (te llegan los reportes por correo).

const SITIO = 'https://tomasjarufe.site';
const COPIA = 'https://tomasjarufe.tomasjarufeurzua.workers.dev';
const REMITENTE = 'Tomás Jarufe <material@tomasjarufe.site>';
const ORIGENES = [SITIO, 'https://www.tomasjarufe.site', COPIA];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      if (!env.DB) return json({ error: 'La base de datos no está configurada.' }, 503, request);
      await crearTabla(env);
      const ruta = url.pathname.replace(/\/+$/, '');
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
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
  ]);
  tablasListas = true;
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
  const [votos, reportes] = await env.DB.batch([
    env.DB.prepare(`SELECT ruta, SUM(voto = 1) AS si, SUM(voto = -1) AS no FROM votos GROUP BY ruta ORDER BY (SUM(voto = 1) + SUM(voto = -1)) DESC, ruta`),
    env.DB.prepare('SELECT id, ruta, texto, creado FROM reportes ORDER BY id DESC LIMIT 100'),
  ]);
  return json({
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

function cors(request) {
  const origen = request.headers.get('Origin');
  const h = { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
  if (origen && ORIGENES.includes(origen)) h['Access-Control-Allow-Origin'] = origen;
  return h;
}

function json(datos, status, request) {
  return new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(request) } });
}
