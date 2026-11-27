// Diagramas de la guía (SVG simples). Cada uno se usa desde los datos con { k: 'diagrama', id: '...' }.
// Están pensados para verse bien en celular: lienzo angosto (360 de ancho) y letra de 11 px o más.
(function (g) {
  'use strict';

  var T = '#c3c8cd', H = '#f1f3f5', A = '#5eead4', D = '#a3a9af', B = 'rgba(255,255,255,0.3)', F = 'rgba(94,234,212,0.18)';
  var ROJO = '#f87171', VERDE = '#4ade80', ORO = '#e9d58f';

  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" fill="' + (o.c || T) + '" font-size="' + (o.s || 12) + '" font-weight="' + (o.w || 500) + '" text-anchor="' + (o.a || 'middle') + '">' + s + '</text>';
  }
  function caja(x, y, w, h, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r || 9) + '" fill="' + (o.f || 'none') + '" stroke="' + (o.c || B) + '" stroke-width="' + (o.g || 1.5) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + '/>';
  }
  function flecha(d, id, c) {
    return '<path d="' + d + '" fill="none" stroke="' + (c || A) + '" stroke-width="2" marker-end="url(#' + id + ')"/>';
  }
  function punta(id, c) {
    return '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + (c || A) + '"/></marker></defs>';
  }
  function media(cx, cy, r) {
    // Círculo con la mitad izquierda rellena (torta a medio hacer)
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + B + '" stroke-width="2"/>' +
      '<path d="M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + ' Z" fill="' + A + '"/>';
  }
  function llena(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + A + '" stroke="' + A + '" stroke-width="2"/>';
  }
  function svg(alto, etiqueta, cuerpo) {
    return '<svg viewBox="0 0 360 ' + alto + '" role="img" aria-label="' + etiqueta + '">' + cuerpo + '</svg>';
  }

  g.ICOFI_DIAGRAMAS = {
    // ---------------------------------------------------------------- Módulo 1
    'fases-planificacion': {
      pie: 'El presupuesto aparece en la fase III: es la cuantificación de los planes y programas.',
      svg: svg(318, 'Las cuatro fases de la planificación estratégica: diagnóstico, formulación, implementación (donde están los presupuestos) y evaluación y control, con retroalimentación hacia el diagnóstico.',
        punta('fp') + punta('fpo', ORO) +
        caja(70, 8, 280, 58) + txt(84, 31, 'I · Diagnóstico', { a: 'start', c: H, s: 14, w: 700 }) + txt(84, 51, 'Análisis del medio externo y del interno', { a: 'start', c: D, s: 11.5 }) +
        flecha('M210 66V82', 'fp') +
        caja(70, 86, 280, 58) + txt(84, 109, 'II · Formulación', { a: 'start', c: H, s: 14, w: 700 }) + txt(84, 129, 'Misión, objetivos, estrategias y políticas', { a: 'start', c: D, s: 11.5 }) +
        flecha('M210 144V160', 'fp') +
        caja(70, 164, 280, 58, { f: F, c: A, g: 2 }) + txt(84, 187, 'III · Implementación', { a: 'start', c: H, s: 14, w: 700 }) + txt(84, 207, 'Planes → programas → presupuestos', { a: 'start', c: A, s: 11.5, w: 700 }) +
        flecha('M210 222V238', 'fp') +
        caja(70, 242, 280, 58) + txt(84, 265, 'IV · Evaluación y control', { a: 'start', c: H, s: 14, w: 700 }) + txt(84, 285, 'Comparar lo real con lo presupuestado', { a: 'start', c: D, s: 11.5 }) +
        // Retroalimentación: de la fase IV de vuelta a la fase I
        '<path d="M70 271H34V37H64" fill="none" stroke="' + ORO + '" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#fpo)"/>' +
        '<text transform="translate(22 154) rotate(-90)" fill="' + ORO + '" font-size="11.5" font-weight="600" text-anchor="middle">Retroalimentación</text>')
    },

    // ---------------------------------------------------------------- Módulo 2
    'flujo-costos': {
      pie: 'El costo viaja de inventario en inventario (balance) y recién pasa al estado de resultados cuando el producto se vende. MP: materia prima · PenP: productos en proceso · PT: productos terminados · MOD: mano de obra directa · CIF: costos indirectos de fabricación.',
      svg: svg(206, 'Recorrido del costo en una empresa industrial: la materia prima comprada entra a la bodega de materia prima; al usarse pasa a productos en proceso, donde se suman la mano de obra directa y los costos indirectos de fabricación; lo terminado pasa a productos terminados y, al venderse, a costo de venta.',
        punta('fc') +
        txt(4, 16, 'Compras', { a: 'start', c: D, s: 11 }) + flecha('M26 22V40', 'fc') +
        caja(4, 44, 72, 50, { f: F, c: A }) + txt(40, 66, 'MP', { c: H, s: 15, w: 700 }) + txt(40, 83, 'bodega', { c: D, s: 10.5 }) +
        flecha('M76 69H94', 'fc') + txt(87, 37, 'se usa', { c: D, s: 10.5 }) +
        caja(98, 44, 72, 50, { f: F, c: A }) + txt(134, 66, 'PenP', { c: H, s: 15, w: 700 }) + txt(134, 83, 'producción', { c: D, s: 10.5 }) +
        flecha('M170 69H188', 'fc') + txt(181, 37, 'se termina', { c: D, s: 10.5 }) +
        caja(192, 44, 72, 50, { f: F, c: A }) + txt(228, 66, 'PT', { c: H, s: 15, w: 700 }) + txt(228, 83, 'bodega', { c: D, s: 10.5 }) +
        flecha('M264 69H282', 'fc') + txt(275, 37, 'se vende', { c: D, s: 10.5 }) +
        caja(286, 44, 70, 50, { c: ORO, g: 2 }) + txt(321, 64, 'Costo', { c: H, s: 13, w: 700 }) + txt(321, 81, 'de venta', { c: H, s: 13, w: 700 }) +
        // Entran MOD y CIF a la producción
        flecha('M134 128V98', 'fc') + txt(134, 144, '+ MOD + CIF', { c: A, s: 12, w: 700 }) +
        // Dónde vive cada cosa
        '<path d="M4 168V176H264V168" fill="none" stroke="' + B + '" stroke-width="1.5"/>' + txt(134, 194, 'Balance: inventarios (costo no expirado)', { c: D, s: 11 }) +
        '<path d="M286 104V112H356V104" fill="none" stroke="' + ORO + '" stroke-width="1.5"/>' + txt(321, 128, 'Estado de', { c: ORO, s: 11 }) + txt(321, 142, 'resultados', { c: ORO, s: 11 }))
    },

    // ---------------------------------------------------------------- Módulo 4
    tortas: {
      pie: 'Las mismas dos tortas equivalen a 1 en trabajo y a 2 en materia prima: por eso se calcula una UE por elemento.',
      svg: svg(206, 'Dos tortas hechas hasta la mitad equivalen a una torta terminada en trabajo; si ya tienen todo el bizcocho, equivalen a dos tortas en materia prima.',
        txt(8, 18, 'En trabajo (avance 50 %)', { a: 'start', c: D, s: 12, w: 600 }) +
        media(36, 58, 26) + txt(80, 65, '+', { s: 20, c: H }) + media(124, 58, 26) + txt(168, 65, '=', { s: 20, c: H }) + llena(212, 58, 26) +
        txt(250, 54, '1 torta', { a: 'start', c: H, s: 15, w: 700 }) + txt(250, 72, '2 × 50 %', { a: 'start', c: D, s: 11.5 }) +
        txt(8, 122, 'En materia prima (bizcocho completo, 100 %)', { a: 'start', c: D, s: 12, w: 600 }) +
        llena(36, 162, 26) + txt(80, 169, '+', { s: 20, c: H }) + llena(124, 162, 26) + txt(168, 169, '=', { s: 20, c: H }) + llena(206, 162, 22) + llena(232, 162, 22) +
        txt(266, 158, '2 tortas', { a: 'start', c: H, s: 15, w: 700 }) + txt(266, 176, '2 × 100 %', { a: 'start', c: D, s: 11.5 }))
    },

    'flujo-etc': {
      pie: 'Recorrido de las unidades: lo que termina el departamento 1 entra al departamento 2.',
      svg: svg(322, 'Al departamento 1 entran 1.000 unidades: 700 se terminan y pasan al departamento 2, 200 quedan en proceso y 100 son merma normal. De las 700 que recibe el departamento 2, 500 se terminan, 100 quedan en proceso y 100 son merma anormal.',
        punta('fe') +
        txt(8, 14, '1.000 u puestas en proceso', { c: H, s: 12, w: 600, a: 'start' }) + flecha('M76 20V40', 'fe') +
        caja(16, 44, 120, 72, { f: F, c: A }) + txt(76, 86, 'Depto. 1', { c: H, s: 15, w: 700 }) +
        '<path d="M136 66H186" stroke="' + B + '" stroke-width="1.5" stroke-dasharray="4 4"/>' +
        caja(190, 40, 164, 42) + txt(272, 58, '200 u en proceso', { c: H, s: 12, w: 600 }) + txt(272, 74, 'MP 100 % · CC 70 %', { c: D, s: 10.5 }) +
        caja(190, 88, 164, 30, { d: '5 4' }) + txt(272, 108, '100 u merma normal', { c: H, s: 12, w: 600 }) +
        '<path d="M136 102H186" stroke="' + B + '" stroke-width="1.5" stroke-dasharray="4 4"/>' +
        flecha('M76 116V162', 'fe') + txt(86, 143, '700 u transferidas', { a: 'start', c: H, s: 12, w: 600 }) +
        caja(16, 166, 120, 72, { f: F, c: A }) + txt(76, 208, 'Depto. 2', { c: H, s: 15, w: 700 }) +
        '<path d="M136 188H186" stroke="' + B + '" stroke-width="1.5" stroke-dasharray="4 4"/>' +
        caja(190, 162, 164, 42) + txt(272, 180, '100 u en proceso', { c: H, s: 12, w: 600 }) + txt(272, 196, 'MP 100 % · CC 60 %', { c: D, s: 10.5 }) +
        caja(190, 210, 164, 30, { c: ROJO, d: '5 4' }) + txt(272, 230, '100 u merma anormal', { c: H, s: 12, w: 600 }) +
        '<path d="M136 224H186" stroke="' + B + '" stroke-width="1.5" stroke-dasharray="4 4"/>' +
        flecha('M76 238V284', 'fe') + txt(76, 304, '500 u terminadas', { c: H, s: 12, w: 600 }))
    },

    // ---------------------------------------------------------------- Módulo 6
    'punto-equilibrio': {
      pie: 'A la izquierda del punto de equilibrio los costos totales superan a los ingresos (pérdida); a la derecha, cada unidad extra deja utilidad. V: venta de equilibrio en pesos · CF: costos fijos.',
      svg: svg(262, 'Gráfico del punto de equilibrio: la recta de ingresos parte de cero y la de costos totales parte desde los costos fijos. Se cruzan en el punto de equilibrio; antes hay pérdida y después hay utilidad.',
        // Zonas
        '<path d="M46 220L46 150L211.7 109.2Z" fill="rgba(248,113,113,0.2)"/>' +
        '<path d="M211.7 109.2L330 30L330 80Z" fill="rgba(74,222,128,0.2)"/>' +
        // Ejes
        '<path d="M46 14V220H348" fill="none" stroke="' + B + '" stroke-width="1.5"/>' +
        txt(42, 14, '$', { a: 'end', c: D, s: 12 }) + txt(348, 254, 'Unidades vendidas (q)', { a: 'end', c: D, s: 11 }) +
        // Costos fijos
        '<path d="M46 150H330" stroke="' + D + '" stroke-width="1.5" stroke-dasharray="5 4"/>' + txt(326, 166, 'Costos fijos', { a: 'end', c: D, s: 11 }) +
        // Rectas
        '<path d="M46 150L330 80" stroke="' + ROJO + '" stroke-width="2.5"/>' + txt(330, 112, 'Costos totales', { a: 'end', c: ROJO, s: 11.5, w: 700 }) +
        '<path d="M46 220L330 30" stroke="' + A + '" stroke-width="2.5"/>' + txt(318, 24, 'Ingresos', { a: 'end', c: A, s: 11.5, w: 700 }) +
        // Punto de equilibrio
        '<path d="M211.7 109.2V220M211.7 109.2H46" stroke="' + ORO + '" stroke-width="1.2" stroke-dasharray="3 4"/>' +
        '<circle cx="211.7" cy="109.2" r="5.5" fill="' + ORO + '"/>' +
        txt(204, 98, 'Punto de equilibrio', { a: 'end', c: ORO, s: 11.5, w: 700 }) +
        txt(211.7, 236, 'q de equilibrio', { c: ORO, s: 11 }) +
        txt(40, 113, 'V', { a: 'end', c: ORO, s: 11 }) +
        txt(92, 182, 'Pérdida', { c: ROJO, s: 12, w: 700 }) + txt(296, 72, 'Utilidad', { c: VERDE, s: 12, w: 700 }) +
        txt(40, 154, 'CF', { a: 'end', c: D, s: 11 }) + txt(40, 224, '0', { a: 'end', c: D, s: 11 }))
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
