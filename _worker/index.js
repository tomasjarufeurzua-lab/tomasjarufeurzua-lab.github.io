// Worker de la copia en Cloudflare: sirve el sitio (carpeta _cf) y la lista de avisos por correo.
//
//   POST /api/suscribir  { correo, turnstile }  → guarda el correo y manda un mail para confirmar
//   GET  /api/confirmar?t=TOKEN                 → confirma la suscripcion
//   GET  /api/baja?t=TOKEN (o POST, un clic)    → borra el correo de la lista
//   POST /api/aviso      { archivos: [...] }    → avisa a los confirmados (solo con AVISO_TOKEN)
//
// Configuracion (Cloudflare → Workers → tomasjarufe → Settings):
//   base D1 "DB" (en wrangler.jsonc); secretos RESEND_API_KEY, TURNSTILE_SECRET y AVISO_TOKEN.

const SITIO = 'https://tomasjarufe.site';
const COPIA = 'https://tomasjarufe.tomasjarufeurzua.workers.dev';
const REMITENTE = 'Tomás Jarufe <material@tomasjarufe.site>';
const ORIGENES = [SITIO, 'https://www.tomasjarufe.site', COPIA];
// No se manda otro mail de confirmacion al mismo correo antes de este tiempo
const ESPERA_CONFIRMACION_MS = 10 * 60 * 1000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      if (!env.DB) return json({ error: 'Los avisos por correo aún no están configurados.' }, 503, request);
      await crearTabla(env);
      const ruta = url.pathname.replace(/\/+$/, '');
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
      if (ruta === '/api/suscribir' && request.method === 'POST') return await suscribir(request, env);
      if (ruta === '/api/confirmar' && request.method === 'GET') return await confirmar(url, env);
      if (ruta === '/api/baja' && (request.method === 'GET' || request.method === 'POST')) return await baja(url, env);
      if (ruta === '/api/aviso' && request.method === 'POST') return await aviso(request, env);
      return json({ error: 'No encontrado' }, 404, request);
    } catch (e) {
      console.error(e);
      return json({ error: 'Algo falló. Intenta de nuevo en unos minutos.' }, 500, request);
    }
  },
};

async function crearTabla(env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS suscriptores (
      correo TEXT PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      confirmado INTEGER NOT NULL DEFAULT 0,
      creado TEXT NOT NULL,
      confirmacion_enviada TEXT
    )`
  ).run();
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
  const ahora = new Date().toISOString();
  const fila = await env.DB.prepare('SELECT token, confirmado, confirmacion_enviada FROM suscriptores WHERE correo = ?').bind(correo).first();
  // Misma respuesta en todos los casos, para no revelar quien esta inscrito
  const listo = json({ ok: true, mensaje: 'Revisa tu correo y confirma con el enlace que te mandé.' }, 200, request);
  if (fila && fila.confirmado) return listo;
  if (fila && fila.confirmacion_enviada && Date.now() - Date.parse(fila.confirmacion_enviada) < ESPERA_CONFIRMACION_MS) return listo;
  const token = fila ? fila.token : crypto.randomUUID();
  if (fila) {
    await env.DB.prepare('UPDATE suscriptores SET confirmacion_enviada = ? WHERE correo = ?').bind(ahora, correo).run();
  } else {
    await env.DB.prepare('INSERT INTO suscriptores (correo, token, confirmado, creado, confirmacion_enviada) VALUES (?, ?, 0, ?, ?)')
      .bind(correo, token, ahora, ahora).run();
  }
  const enlace = `${COPIA}/api/confirmar?t=${token}`;
  // Si el correo no sale, se puede volver a intentar altiro
  const deshacer = () => env.DB.prepare('UPDATE suscriptores SET confirmacion_enviada = NULL WHERE correo = ?').bind(correo).run();
  await enviar(env, [{
    from: REMITENTE,
    to: [correo],
    subject: 'Confirma tu suscripción a los avisos de material',
    html: plantilla('Confirma tu suscripción',
      `<p>Alguien (ojalá tú) pidió recibir un correo cada vez que suba material nuevo a <a href="${SITIO}/#material">tomasjarufe.site</a>.</p>
       <p><a href="${enlace}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#2dd4bf;color:#0f2f2b;font-weight:600;text-decoration:none">Confirmar suscripción</a></p>
       <p style="color:#6b7280;font-size:13px">Si no fuiste tú, ignora este correo y no recibirás nada más.</p>`),
    text: `Para recibir avisos cuando suba material nuevo a tomasjarufe.site, confirma aquí: ${enlace}\n\nSi no fuiste tú, ignora este correo.`,
  }]).catch(async (e) => { await deshacer(); throw e; });
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

async function baja(url, env) {
  const t = url.searchParams.get('t') || '';
  await env.DB.prepare('DELETE FROM suscriptores WHERE token = ?').bind(t).run();
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
  const { results } = await env.DB.prepare('SELECT correo, token FROM suscriptores WHERE confirmado = 1').all();
  const lista = archivos.map((ruta) => {
    const partes = ruta.split('/');
    const ramo = titulo(partes[1]);
    const nombre = titulo(partes[partes.length - 1].replace(/\.[^.]+$/, ''));
    const href = `${SITIO}/${partes.map(encodeURIComponent).join('/')}`;
    return { ramo, nombre, href };
  });
  const html = '<ul style="padding-left:18px">' + lista.map((x) =>
    `<li style="margin:6px 0"><a href="${x.href}">${esc(x.nombre)}</a> <span style="color:#6b7280">· ${esc(x.ramo)}</span></li>`).join('') + '</ul>';
  const texto = lista.map((x) => `- ${x.nombre} (${x.ramo}): ${x.href}`).join('\n');
  const asunto = lista.length === 1 ? `Material nuevo: ${lista[0].nombre}` : `Material nuevo: ${lista.length} archivos`;
  const mensajes = results.map((s) => {
    const salir = `${COPIA}/api/baja?t=${s.token}`;
    return {
      from: REMITENTE,
      to: [s.correo],
      subject: asunto,
      headers: { 'List-Unsubscribe': `<${salir}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      html: plantilla('Subí material nuevo',
        `${html}<p><a href="${SITIO}/#material">Ver todo el material</a></p>
         <p style="color:#6b7280;font-size:13px">Recibes esto porque te inscribiste en tomasjarufe.site. <a href="${salir}" style="color:#6b7280">Darme de baja</a></p>`),
      text: `Subí material nuevo:\n\n${texto}\n\nTodo el material: ${SITIO}/#material\n\nDarme de baja: ${salir}`,
    };
  });
  for (let i = 0; i < mensajes.length; i += 100) await enviar(env, mensajes.slice(i, i + 100));
  return json({ ok: true, enviados: mensajes.length }, 200, request);
}

// ---------- utilidades ----------
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

function plantilla(titulo, cuerpo) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;color:#1f2937;line-height:1.5">
    <h2 style="font-size:18px;margin:0 0 12px">${esc(titulo)}</h2>${cuerpo}
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">Tomás Jarufe · <a href="${SITIO}" style="color:#9ca3af">tomasjarufe.site</a></p></div>`;
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

function pagina(titulo, texto) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#2e3135;color:#d1d5db;font-family:system-ui,sans-serif;padding:24px}
main{max-width:420px}h1{color:#f3f4f6;font-size:1.4rem}a{color:#5eead4}</style></head>
<body><main><h1>${esc(titulo)}</h1><p>${esc(texto)}</p><p><a href="${SITIO}/#material">Volver al material</a></p></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
