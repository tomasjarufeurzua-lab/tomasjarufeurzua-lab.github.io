// Worker de la copia en Cloudflare: sirve el sitio (carpeta _cf) y la lista de avisos por correo.
//
//   POST /api/suscribir  { correo, turnstile }  → inscribe el correo y manda una bienvenida con enlace de baja
//   GET  /api/confirmar?t=TOKEN                 → confirma (para enlaces de confirmacion antiguos)
//   GET  /api/baja?t=TOKEN (o POST, un clic)    → borra el correo de la lista
//   POST /api/aviso      { archivos: [...] }    → avisa a los confirmados (solo con AVISO_TOKEN)
//
// Configuracion (Cloudflare → Workers → tomasjarufe → Settings):
//   base D1 "DB" (en wrangler.jsonc); secretos RESEND_API_KEY, TURNSTILE_SECRET y AVISO_TOKEN.

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
      if (ruta === '/api/baja' && (request.method === 'GET' || request.method === 'POST')) return await baja(url, env);
      if (ruta === '/api/aviso' && request.method === 'POST') return await aviso(request, env);
      return json({ error: 'No encontrado' }, 404, request);
    } catch (e) {
      console.error(e);
      return json({ error: 'Algo falló. Intenta de nuevo en unos minutos. (código: ' + codigoError(e) + ')' }, 500, request);
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
  const fila = await env.DB.prepare('SELECT token, confirmado FROM suscriptores WHERE correo = ?').bind(correo).first();
  // Misma respuesta en todos los casos, para no revelar quien esta inscrito
  const listo = json({ ok: true, mensaje: '¡Listo! Te avisaré por correo cuando suba material nuevo.' }, 200, request);
  if (fila && fila.confirmado) return listo;
  // Inscripcion inmediata (sin confirmar); llega un correo de bienvenida con el enlace para darse de baja,
  // por si alguien inscribio un correo ajeno
  const token = fila ? fila.token : crypto.randomUUID();
  if (fila) {
    await env.DB.prepare('UPDATE suscriptores SET confirmado = 1, confirmacion_enviada = ? WHERE correo = ?').bind(ahora, correo).run();
  } else {
    await env.DB.prepare('INSERT INTO suscriptores (correo, token, confirmado, creado, confirmacion_enviada) VALUES (?, ?, 1, ?, ?)')
      .bind(correo, token, ahora, ahora).run();
  }
  const salir = `${COPIA}/api/baja?t=${token}`;
  try {
    await enviar(env, [{
      from: REMITENTE,
      to: [correo],
      subject: 'Listo: te avisaré cuando suba material nuevo',
      headers: { 'List-Unsubscribe': `<${salir}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      html: plantilla({
        previa: 'Te avisaré cada vez que suba material nuevo.',
        titulo: '¡Listo, quedaste inscrito!',
        intro: 'Desde ahora te llegará un correo cada vez que suba material nuevo: apuntes, ensayos y pautas de los ramos que ayudo.',
        boton: { texto: 'Ver el material', href: `${SITIO}/#material` },
        pie: `¿No fuiste tú quien se inscribió? <a href="${salir}" style="color:${C.tenue};text-decoration:underline">Darme de baja</a> y no recibirás nada más.`,
      }),
      text: `Desde ahora te llegará un correo cada vez que suba material nuevo a tomasjarufe.site.\n\n¿No fuiste tú? Date de baja aquí: ${salir}`,
    }]);
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
    const carpeta = partes.slice(2, -1).map(titulo).join(' · ');
    return { ramo, nombre, href, carpeta };
  });
  const cuerpo = filasArchivos(lista);
  const texto = lista.map((x) => `- ${x.nombre} (${x.ramo}): ${x.href}`).join('\n');
  const asunto = lista.length === 1 ? `Material nuevo: ${lista[0].nombre}` : `Material nuevo: ${lista.length} archivos`;
  const mensajes = results.map((s) => {
    const salir = `${COPIA}/api/baja?t=${s.token}`;
    return {
      from: REMITENTE,
      to: [s.correo],
      subject: asunto,
      headers: { 'List-Unsubscribe': `<${salir}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
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
  });
  for (let i = 0; i < mensajes.length; i += 100) await enviar(env, mensajes.slice(i, i + 100));
  return json({ ok: true, enviados: mensajes.length }, 200, request);
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

// Colores de la pagina (gris metalizado, turquesa y dorado)
const C = { fondo: '#2b2e32', tarjeta: '#34383c', fila: '#3c4045', borde: '#4a4f55', titulo: '#f1f3f5', texto: '#c3c8cd', tenue: '#a3a9af', turquesa: '#5eead4', oro: '#e9d58f' };
const FUENTE = "'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif";

// Correo con la estetica de la pagina. Se arma con tablas y estilos en linea para que se vea igual en Gmail, Outlook y el celular.
function plantilla({ previa, titulo, intro, cuerpo = '', boton, pie }) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light"><title>${esc(titulo)}</title></head>
<body style="margin:0;padding:0;background:${C.fondo}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(previa || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fondo};padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.tarjeta};background-image:linear-gradient(135deg,#3a3e43 0%,#34383c 50%,#2f3337 100%);border:1px solid ${C.borde};border-radius:16px;font-family:${FUENTE}">
<tr><td style="padding:28px 28px 8px">
  <p style="margin:0 0 18px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.tenue}">Tomás Jarufe Urzúa <span style="color:${C.turquesa}">·</span> Material</p>
  <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;font-weight:700;color:${C.titulo}">${esc(titulo)}</h1>
  <div style="width:48px;height:3px;border-radius:3px;background:${C.turquesa};margin:0 0 18px"></div>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${C.texto}">${intro}</p>
</td></tr>
${cuerpo ? `<tr><td style="padding:0 28px">${cuerpo}</td></tr>` : ''}
${boton ? `<tr><td style="padding:12px 28px 8px">
  <a href="${boton.href}" style="display:inline-block;padding:12px 22px;border-radius:999px;border:1px solid #8a7f57;background:#42464b;background-image:linear-gradient(135deg,#5d6268 0%,#42464b 45%,#30343a 70%,#52575d 100%);box-shadow:0 0 9px rgba(212,175,55,.4);color:${C.titulo};font-size:15px;font-weight:600;text-decoration:none">${esc(boton.texto)} <span style="color:${C.oro}">→</span></a>
</td></tr>` : ''}
<tr><td style="padding:24px 28px 26px">
  <div style="height:1px;background:${C.borde};margin:0 0 16px"></div>
  <p style="margin:0;font-size:12px;line-height:1.6;color:${C.tenue}">${pie}</p>
  <p style="margin:8px 0 0;font-size:12px;color:${C.tenue}"><a href="${SITIO}" style="color:${C.tenue};text-decoration:underline">tomasjarufe.site</a> · Valparaíso, Chile</p>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

// Lista de archivos agrupada por ramo, con filas como las de la pagina
function filasArchivos(lista) {
  const ramos = [...new Set(lista.map((x) => x.ramo))];
  return ramos.map((ramo) => `
  <p style="margin:6px 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.titulo}">${esc(ramo)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">${lista.filter((x) => x.ramo === ramo).map((x) => `
    <tr><td style="padding:0 0 8px"><a href="${x.href}" style="display:block;text-decoration:none">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fila};border-radius:10px;border-left:3px solid ${C.turquesa}"><tr>
        <td style="padding:12px 14px;font-size:15px;line-height:1.4;color:${C.titulo}">${esc(x.nombre)}${x.carpeta ? `<br><span style="font-size:12px;color:${C.tenue}">${esc(x.carpeta)}</span>` : ''}</td>
        <td align="right" style="padding:12px 14px 12px 0;white-space:nowrap"><span style="display:inline-block;padding:3px 9px;border-radius:5px;background:#2f4a47;color:${C.turquesa};font-size:11px;font-weight:700">PDF</span> <span style="color:${C.tenue};font-size:15px">↓</span></td>
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

function pagina(titulo, texto) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#2e3135;color:#d1d5db;font-family:system-ui,sans-serif;padding:24px}
main{max-width:420px}h1{color:#f3f4f6;font-size:1.4rem}a{color:#5eead4}</style></head>
<body><main><h1>${esc(titulo)}</h1><p>${esc(texto)}</p><p><a href="${SITIO}/#material">Volver al material</a></p></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
