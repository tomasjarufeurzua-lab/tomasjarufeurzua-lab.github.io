// MÓDULO 8 — Hoja de fórmulas (tarjeta final, imprimible).
(function (g) {
  'use strict';

  g.ICOFI_C3.modulos.push({
    id: 'formulas',
    n: 8,
    titulo: 'Hoja de fórmulas',
    corto: 'Hoja de fórmulas',
    bloques: [
      {
        tipo: 'formulas',
        id: 'hoja',
        titulo: 'Hoja de fórmulas',
        bajada: 'Todo el Certamen 3 en una tarjeta. Sirve para el repaso final; se puede imprimir.',
        grupos: [
          { t: 'Presupuestos', items: [
            'Producción (o compras) = ventas + IF deseado − II',
            'Compras de MP = producción × consumo por unidad + IF de MP − II de MP',
            'Caja: solo lo percibido (cobrado y pagado). La depreciación y el incobrable no son flujo de caja.',
            'Si el precio es neto, el cliente paga el bruto: neto × 1,19.'
          ] },
          { t: 'Costos', items: [
            'Costo primo = MPD + MOD',
            'Costo de conversión = MOD + CIF',
            'Costo de producción = MPD + MOD + CIF',
            'Estado de costos: MP utilizada → costo puesto en producción (± PenP) → costo de PT (± PT) → costo de venta'
          ] },
          { t: 'Órdenes específicas', items: [
            'Cuota de asignación = {{CIF presupuestados // base}}',
            'CIF aplicado = cuota × base de la orden',
            'Aplicado > real: sobreaplicación (se resta al costo de venta). Aplicado < real: subaplicación (se suma).'
          ] },
          { t: 'Procesos', items: [
            'UE = terminadas + en proceso × % de avance (+ mermas anormales × su avance)',
            'Costo unitario del elemento = {{costo del elemento // UE del elemento}}',
            'Merma normal: no entra a las UE; la absorben las unidades buenas. Merma anormal: entra, se costea y va al EERR.'
          ] },
          { t: 'Costeo total vs costeo directo', items: [
            'Total: los costos fijos de producción quedan en el inventario hasta vender.',
            'Directo: los costos fijos de producción van completos al resultado del período.',
            'Si se vende todo lo producido, los dos resultados coinciden.'
          ] },
          { t: 'Relación costo–volumen–utilidad', items: [
            'mcᵤ = p − cvᵤ',
            'rc = {{mcᵤ // p}} · rr = {{cvᵤ // p}} · rc + rr = 1',
            'q de equilibrio = {{CF // mcᵤ}}',
            'Venta de equilibrio ($) = {{CF // rc}}',
            'q para una utilidad = {{CF + UAI // mcᵤ}}',
            'UAI = {{UDI // 1 − t}}',
            'MS % = {{venta real − venta de equilibrio // venta real}}',
            'UAI = MS (en unidades) × mcᵤ'
          ] }
        ],
        // Abreviaturas que aparecen en la hoja (para la versión impresa, donde no hay tooltips)
        leyenda: ['IF', 'II', 'MP', 'MPD', 'MOD', 'CIF', 'PenP', 'PT', 'UE', 'EERR', 'mcᵤ', 'cvᵤ', 'rc', 'rr', 'CF', 'UAI', 'UDI', 'MS']
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
