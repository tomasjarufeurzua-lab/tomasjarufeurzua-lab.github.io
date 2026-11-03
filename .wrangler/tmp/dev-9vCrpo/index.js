var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker/index.js
var SITIO = "https://tomasjarufe.site";
var COPIA = "https://tomasjarufe.tomasjarufeurzua.workers.dev";
var REMITENTE = "Tom\xE1s Jarufe <material@tomasjarufe.site>";
var ORIGENES = [SITIO, "https://www.tomasjarufe.site", COPIA];
var ESPERA_CONFIRMACION_MS = 10 * 60 * 1e3;
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      if (!env.DB) return json({ error: "Los avisos por correo a\xFAn no est\xE1n configurados." }, 503, request);
      await crearTabla(env);
      const ruta = url.pathname.replace(/\/+$/, "");
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(request) });
      if (ruta === "/api/suscribir" && request.method === "POST") return await suscribir(request, env);
      if (ruta === "/api/confirmar" && request.method === "GET") return await confirmar(url, env);
      if (ruta === "/api/baja" && (request.method === "GET" || request.method === "POST")) return await baja(url, env);
      if (ruta === "/api/aviso" && request.method === "POST") return await aviso(request, env);
      return json({ error: "No encontrado" }, 404, request);
    } catch (e) {
      console.error(e);
      return json({ error: "Algo fall\xF3. Intenta de nuevo en unos minutos." }, 500, request);
    }
  }
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
__name(crearTabla, "crearTabla");
async function suscribir(request, env) {
  let datos;
  try {
    datos = await request.json();
  } catch {
    return json({ error: "Datos inv\xE1lidos." }, 400, request);
  }
  const correo = String(datos.correo || "").trim().toLowerCase();
  if (correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
    return json({ error: "Ese correo no parece v\xE1lido." }, 400, request);
  }
  if (!await turnstileOk(datos.turnstile, request, env)) {
    return json({ error: "No pudimos verificar que no eres un robot. Recarga la p\xE1gina e intenta de nuevo." }, 400, request);
  }
  const ahora = (/* @__PURE__ */ new Date()).toISOString();
  const fila = await env.DB.prepare("SELECT token, confirmado, confirmacion_enviada FROM suscriptores WHERE correo = ?").bind(correo).first();
  const listo = json({ ok: true, mensaje: "Revisa tu correo y confirma con el enlace que te mand\xE9." }, 200, request);
  if (fila && fila.confirmado) return listo;
  if (fila && fila.confirmacion_enviada && Date.now() - Date.parse(fila.confirmacion_enviada) < ESPERA_CONFIRMACION_MS) return listo;
  const token = fila ? fila.token : crypto.randomUUID();
  if (fila) {
    await env.DB.prepare("UPDATE suscriptores SET confirmacion_enviada = ? WHERE correo = ?").bind(ahora, correo).run();
  } else {
    await env.DB.prepare("INSERT INTO suscriptores (correo, token, confirmado, creado, confirmacion_enviada) VALUES (?, ?, 0, ?, ?)").bind(correo, token, ahora, ahora).run();
  }
  const enlace = `${COPIA}/api/confirmar?t=${token}`;
  const deshacer = /* @__PURE__ */ __name(() => env.DB.prepare("UPDATE suscriptores SET confirmacion_enviada = NULL WHERE correo = ?").bind(correo).run(), "deshacer");
  await enviar(env, [{
    from: REMITENTE,
    to: [correo],
    subject: "Confirma tu suscripci\xF3n a los avisos de material",
    html: plantilla(
      "Confirma tu suscripci\xF3n",
      `<p>Alguien (ojal\xE1 t\xFA) pidi\xF3 recibir un correo cada vez que suba material nuevo a <a href="${SITIO}/#material">tomasjarufe.site</a>.</p>
       <p><a href="${enlace}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#2dd4bf;color:#0f2f2b;font-weight:600;text-decoration:none">Confirmar suscripci\xF3n</a></p>
       <p style="color:#6b7280;font-size:13px">Si no fuiste t\xFA, ignora este correo y no recibir\xE1s nada m\xE1s.</p>`
    ),
    text: `Para recibir avisos cuando suba material nuevo a tomasjarufe.site, confirma aqu\xED: ${enlace}

Si no fuiste t\xFA, ignora este correo.`
  }]).catch(async (e) => {
    await deshacer();
    throw e;
  });
  return listo;
}
__name(suscribir, "suscribir");
async function turnstileOk(respuesta, request, env) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!respuesta) return false;
  const cuerpo = new FormData();
  cuerpo.append("secret", env.TURNSTILE_SECRET);
  cuerpo.append("response", String(respuesta));
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) cuerpo.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: cuerpo });
  const d = await r.json();
  return !!d.success;
}
__name(turnstileOk, "turnstileOk");
async function confirmar(url, env) {
  const t = url.searchParams.get("t") || "";
  const r = await env.DB.prepare("UPDATE suscriptores SET confirmado = 1 WHERE token = ?").bind(t).run();
  if (!r.meta.changes) return pagina("Enlace no v\xE1lido", "Este enlace no es v\xE1lido o ya te diste de baja. Puedes inscribirte de nuevo en la p\xE1gina.");
  return pagina("\xA1Listo!", "Desde ahora te llegar\xE1 un correo cada vez que suba material nuevo. Cada correo trae un enlace para darte de baja.");
}
__name(confirmar, "confirmar");
async function baja(url, env) {
  const t = url.searchParams.get("t") || "";
  await env.DB.prepare("DELETE FROM suscriptores WHERE token = ?").bind(t).run();
  return pagina("Te diste de baja", "Ya no recibir\xE1s m\xE1s correos de avisos de material. Tu correo fue borrado de la lista.");
}
__name(baja, "baja");
async function aviso(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!env.AVISO_TOKEN || auth !== `Bearer ${env.AVISO_TOKEN}`) return json({ error: "No autorizado" }, 401, request);
  let datos;
  try {
    datos = await request.json();
  } catch {
    return json({ error: "Datos inv\xE1lidos." }, 400, request);
  }
  const archivos = (Array.isArray(datos.archivos) ? datos.archivos : []).map(String).filter((r) => r.startsWith("material/") && !r.split("/").pop().startsWith("."));
  if (!archivos.length) return json({ ok: true, enviados: 0 }, 200, request);
  const { results } = await env.DB.prepare("SELECT correo, token FROM suscriptores WHERE confirmado = 1").all();
  const lista = archivos.map((ruta) => {
    const partes = ruta.split("/");
    const ramo = titulo(partes[1]);
    const nombre = titulo(partes[partes.length - 1].replace(/\.[^.]+$/, ""));
    const href = `${SITIO}/${partes.map(encodeURIComponent).join("/")}`;
    return { ramo, nombre, href };
  });
  const html = '<ul style="padding-left:18px">' + lista.map((x) => `<li style="margin:6px 0"><a href="${x.href}">${esc(x.nombre)}</a> <span style="color:#6b7280">\xB7 ${esc(x.ramo)}</span></li>`).join("") + "</ul>";
  const texto = lista.map((x) => `- ${x.nombre} (${x.ramo}): ${x.href}`).join("\n");
  const asunto = lista.length === 1 ? `Material nuevo: ${lista[0].nombre}` : `Material nuevo: ${lista.length} archivos`;
  const mensajes = results.map((s) => {
    const salir = `${COPIA}/api/baja?t=${s.token}`;
    return {
      from: REMITENTE,
      to: [s.correo],
      subject: asunto,
      headers: { "List-Unsubscribe": `<${salir}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      html: plantilla(
        "Sub\xED material nuevo",
        `${html}<p><a href="${SITIO}/#material">Ver todo el material</a></p>
         <p style="color:#6b7280;font-size:13px">Recibes esto porque te inscribiste en tomasjarufe.site. <a href="${salir}" style="color:#6b7280">Darme de baja</a></p>`
      ),
      text: `Sub\xED material nuevo:

${texto}

Todo el material: ${SITIO}/#material

Darme de baja: ${salir}`
    };
  });
  for (let i = 0; i < mensajes.length; i += 100) await enviar(env, mensajes.slice(i, i + 100));
  return json({ ok: true, enviados: mensajes.length }, 200, request);
}
__name(aviso, "aviso");
async function enviar(env, mensajes) {
  if (!env.RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY");
  const r = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(mensajes)
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}
__name(enviar, "enviar");
function titulo(nombre) {
  return nombre.replace(/^\d+\s*-\s+/, "").replace(/\s+-\s+/g, " \u2014 ").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}
__name(titulo, "titulo");
function esc(t) {
  return String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(esc, "esc");
function plantilla(titulo2, cuerpo) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;color:#1f2937;line-height:1.5">
    <h2 style="font-size:18px;margin:0 0 12px">${esc(titulo2)}</h2>${cuerpo}
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">Tom\xE1s Jarufe \xB7 <a href="${SITIO}" style="color:#9ca3af">tomasjarufe.site</a></p></div>`;
}
__name(plantilla, "plantilla");
function cors(request) {
  const origen = request.headers.get("Origin");
  const h = { "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" };
  if (origen && ORIGENES.includes(origen)) h["Access-Control-Allow-Origin"] = origen;
  return h;
}
__name(cors, "cors");
function json(datos, status, request) {
  return new Response(JSON.stringify(datos), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors(request) } });
}
__name(json, "json");
function pagina(titulo2, texto) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo2)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#2e3135;color:#d1d5db;font-family:system-ui,sans-serif;padding:24px}
main{max-width:420px}h1{color:#f3f4f6;font-size:1.4rem}a{color:#5eead4}</style></head>
<body><main><h1>${esc(titulo2)}</h1><p>${esc(texto)}</p><p><a href="${SITIO}/#material">Volver al material</a></p></main></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
__name(pagina, "pagina");

// ../../../root/.npm/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../root/.npm/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-e0l2R7/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../root/.npm/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-e0l2R7/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
