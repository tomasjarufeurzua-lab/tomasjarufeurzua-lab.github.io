// Diagramas de la guía (SVG simples). Cada uno se usa desde los datos con { k: 'diagrama', id: '...' }.
(function (g) {
  'use strict';

  var T = '#c3c8cd', H = '#f1f3f5', A = '#5eead4', D = '#a3a9af', B = 'rgba(255,255,255,0.28)', F = 'rgba(94,234,212,0.22)';

  function media(cx, cy, r) {
    // Círculo con la mitad izquierda rellena (torta a medio hacer)
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + B + '" stroke-width="2"/>' +
      '<path d="M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + ' Z" fill="' + A + '"/>';
  }
  function llena(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + A + '" stroke="' + A + '" stroke-width="2"/>';
  }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" fill="' + (o.c || T) + '" font-size="' + (o.s || 14) + '" font-weight="' + (o.w || 500) + '" text-anchor="' + (o.a || 'middle') + '">' + s + '</text>';
  }

  g.ICOFI_DIAGRAMAS = {
    tortas: {
      pie: 'Las mismas dos tortas equivalen a 1 en trabajo y a 2 en materia prima: por eso se calcula una UE por elemento.',
      svg: '<svg viewBox="0 0 620 210" role="img" aria-label="Dos tortas hechas hasta la mitad equivalen a una torta terminada en trabajo; si ya tienen todo el bizcocho, equivalen a dos tortas en materia prima.">' +
        txt(14, 26, 'En trabajo (avance 50 %)', { a: 'start', c: D, s: 13, w: 600 }) +
        media(70, 70, 30) + txt(125, 77, '+', { s: 22, c: H }) + media(180, 70, 30) + txt(240, 77, '=', { s: 22, c: H }) + llena(300, 70, 30) +
        txt(350, 66, '2 × 50 % = 1 torta', { a: 'start', c: H, s: 16, w: 600 }) + txt(350, 86, 'equivalente', { a: 'start', c: D, s: 13 }) +
        txt(14, 132, 'En materia prima (bizcocho completo, avance 100 %)', { a: 'start', c: D, s: 13, w: 600 }) +
        llena(70, 172, 26) + txt(125, 179, '+', { s: 22, c: H }) + llena(180, 172, 26) + txt(240, 179, '=', { s: 22, c: H }) + llena(292, 172, 26) + llena(326, 172, 26) +
        txt(372, 168, '2 × 100 % = 2 tortas', { a: 'start', c: H, s: 16, w: 600 }) + txt(372, 188, 'equivalentes', { a: 'start', c: D, s: 13 }) +
        '</svg>'
    },

    'flujo-etc': {
      pie: 'Recorrido de las unidades: lo que termina el departamento 1 entra al departamento 2.',
      svg: '<svg viewBox="0 0 620 236" role="img" aria-label="Al departamento 1 entran 1.000 unidades: 700 se terminan y pasan al departamento 2, 200 quedan en proceso y 100 son merma normal. De las 700 que recibe el departamento 2, 500 se terminan, 100 quedan en proceso y 100 son merma anormal.">' +
        '<defs><marker id="fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + A + '"/></marker></defs>' +
        // Entrada
        txt(52, 44, '1.000 u', { c: H, s: 15, w: 700 }) + txt(52, 62, 'puestas en proceso', { c: D, s: 11 }) +
        '<path d="M100 50H134" stroke="' + A + '" stroke-width="2" marker-end="url(#fl)"/>' +
        // Depto 1
        '<rect x="138" y="22" width="130" height="58" rx="10" fill="' + F + '" stroke="' + A + '" stroke-width="1.5"/>' + txt(203, 57, 'Depto. 1', { c: H, s: 16, w: 700 }) +
        '<path d="M268 50H352" stroke="' + A + '" stroke-width="2" marker-end="url(#fl)"/>' + txt(310, 40, '700 u', { c: H, s: 14, w: 700 }) + txt(310, 68, 'transferidas', { c: D, s: 11 }) +
        // Depto 2
        '<rect x="356" y="22" width="130" height="58" rx="10" fill="' + F + '" stroke="' + A + '" stroke-width="1.5"/>' + txt(421, 57, 'Depto. 2', { c: H, s: 16, w: 700 }) +
        '<path d="M486 50H520" stroke="' + A + '" stroke-width="2" marker-end="url(#fl)"/>' + txt(568, 44, '500 u', { c: H, s: 15, w: 700 }) + txt(568, 62, 'terminadas', { c: D, s: 11 }) +
        // Lo que queda en cada departamento
        '<path d="M203 80V112" stroke="' + B + '" stroke-width="1.5" stroke-dasharray="4 4"/>' +
        '<rect x="118" y="114" width="170" height="52" rx="8" fill="none" stroke="' + B + '"/>' + txt(203, 136, '200 u en proceso', { c: H, s: 13, w: 600 }) + txt(203, 154, 'MP 100 % · CC 70 %', { c: D, s: 11 }) +
        '<rect x="118" y="176" width="170" height="44" rx="8" fill="none" stroke="' + B + '" stroke-dasharray="5 4"/>' + txt(203, 203, '100 u merma normal', { c: H, s: 13, w: 600 }) +
        '<path d="M421 80V112" stroke="' + B + '" stroke-width="1.5" stroke-dasharray="4 4"/>' +
        '<rect x="336" y="114" width="170" height="52" rx="8" fill="none" stroke="' + B + '"/>' + txt(421, 136, '100 u en proceso', { c: H, s: 13, w: 600 }) + txt(421, 154, 'MP 100 % · CC 60 %', { c: D, s: 11 }) +
        '<rect x="336" y="176" width="170" height="44" rx="8" fill="none" stroke="#f87171" stroke-dasharray="5 4"/>' + txt(421, 203, '100 u merma anormal', { c: H, s: 13, w: 600 }) +
        '</svg>'
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
