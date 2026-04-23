// ════════════════════════════════════════════════════════════════
//  IIT Órdenes de Servicio v2 — assets/excel.js
//  Exportación Excel para Admin, Técnico y Cliente
//  Depende de: SheetJS (cdn.jsdelivr.net/npm/xlsx)
// ════════════════════════════════════════════════════════════════

// ── CARGAR SHEETJS DINÁMICAMENTE ─────────────────────────────────
function cargarSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── EXPORTAR ÓRDENES A EXCEL ──────────────────────────────────────
async function exportarExcel(ordenes, nombreArchivo = 'IIT-Ordenes') {
  await cargarSheetJS();

  if (!ordenes || !ordenes.length) {
    alert('No hay órdenes para exportar.');
    return;
  }

  // ── HOJA 1: RESUMEN ──────────────────────────────────────────────
  const resumenRows = [
    // Cabecera
    ['INFRAESTRUCTURA-IT — REPORTE DE ÓRDENES DE SERVICIO'],
    ['Generado:', new Date().toLocaleString('es-CO')],
    ['Total órdenes:', ordenes.length],
    [],
    // Encabezados tabla
    [
      'NO. ORDEN', 'FECHA CREACION', 'EMPRESA', 'CONTACTO', 'CORREO',
      'TELEFONO', 'CIUDAD', 'TIPO DE SERVICIO', 'AREA', 'PRIORIDAD',
      'ESTADO', 'TECNICO ASIGNADO', 'FECHA REQUERIDA', 'CONTRATO', 'CENTRO COSTO'
    ]
  ];

  // Filas de datos
  ordenes.forEach(o => {
    const tecNombre = o.tecnicos?.usuarios?.nombre || '—';
    resumenRows.push([
      o.orden_id        || '—',
      o.created_at      ? new Date(o.created_at).toLocaleString('es-CO') : '—',
      o.empresa         || '—',
      o.nombre          || '—',
      o.correo          || '—',
      o.telefono        || '—',
      o.ciudad          || '—',
      o.tipo_servicio   || '—',
      o.area            || '—',
      (o.prioridad      || '—').toUpperCase(),
      (o.status         || '—').replace(/_/g,' ').toUpperCase(),
      tecNombre,
      o.fecha_requerida || '—',
      o.contrato        || '—',
      o.centro_costo    || '—'
    ]);
  });

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);

  // Estilos de ancho de columnas
  wsResumen['!cols'] = [
    {wch:20},{wch:20},{wch:22},{wch:20},{wch:28},
    {wch:16},{wch:16},{wch:22},{wch:24},{wch:10},
    {wch:14},{wch:20},{wch:16},{wch:16},{wch:14}
  ];

  // ── HOJA 2: DETALLE COMPLETO ──────────────────────────────────────
  const detalleRows = [
    ['INFRAESTRUCTURA-IT — DETALLE COMPLETO DE ÓRDENES'],
    ['Generado:', new Date().toLocaleString('es-CO')],
    []
  ];

  ordenes.forEach((o, i) => {
    detalleRows.push(['═'.repeat(60)]);
    detalleRows.push(['ORDEN #' + (i+1), o.orden_id || '—']);
    detalleRows.push(['Estado', (o.status||'—').replace(/_/g,' ').toUpperCase()]);
    detalleRows.push(['Creada', o.created_at ? new Date(o.created_at).toLocaleString('es-CO') : '—']);
    detalleRows.push([]);

    detalleRows.push(['── SOLICITANTE ──']);
    detalleRows.push(['Nombre',    o.nombre    || '—']);
    detalleRows.push(['Empresa',   o.empresa   || '—']);
    detalleRows.push(['Correo',    o.correo    || '—']);
    detalleRows.push(['Teléfono',  o.telefono  || '—']);
    detalleRows.push(['Cargo',     o.cargo     || '—']);
    detalleRows.push([]);

    detalleRows.push(['── UBICACIÓN ──']);
    detalleRows.push(['Ciudad',       o.ciudad        || '—']);
    detalleRows.push(['Departamento', o.departamento  || '—']);
    detalleRows.push(['Dirección',    o.direccion     || '—']);
    detalleRows.push(['Referencia',   o.referencia    || '—']);
    detalleRows.push(['Recibe',       o.persona_recibe|| '—']);
    detalleRows.push([]);

    detalleRows.push(['── SERVICIO ──']);
    detalleRows.push(['Tipo',          o.tipo_servicio  || '—']);
    detalleRows.push(['Área',          o.area           || '—']);
    detalleRows.push(['Prioridad',     (o.prioridad||'—').toUpperCase()]);
    detalleRows.push(['Fecha req.',    o.fecha_requerida|| '—']);
    detalleRows.push(['Hora',          o.hora_preferida || '—']);
    detalleRows.push(['Duración',      o.duracion       || '—']);
    detalleRows.push(['Ventana',       o.ventana        || '—']);
    detalleRows.push(['Acceso',        o.acceso         || '—']);
    detalleRows.push(['Síntoma',       o.sintoma        || '—']);
    detalleRows.push([]);

    detalleRows.push(['── EQUIPOS ──']);
    detalleRows.push(['Equipos',    Array.isArray(o.equipos) ? o.equipos.join(', ') : (o.equipos||'—')]);
    detalleRows.push(['Marca',      o.marca      || '—']);
    detalleRows.push(['N° Serie',   o.serie      || '—']);
    detalleRows.push(['Obs. Equipo',o.obs_equipos|| '—']);
    detalleRows.push([]);

    detalleRows.push(['── ADICIONAL ──']);
    detalleRows.push(['Antecedentes', o.antecedentes || '—']);
    detalleRows.push(['Archivos',     o.archivos     || '—']);
    detalleRows.push(['Contrato',     o.contrato     || '—']);
    detalleRows.push(['Centro Costo', o.centro_costo || '—']);
    detalleRows.push(['Notas',        o.notas        || '—']);
    detalleRows.push([]);
    detalleRows.push([]);
  });

  const wsDetalle = XLSX.utils.aoa_to_sheet(detalleRows);
  wsDetalle['!cols'] = [{wch:20},{wch:60}];

  // ── HOJA 3: ESTADÍSTICAS ─────────────────────────────────────────
  const total     = ordenes.length;
  const porStatus = {};
  const porPri    = {};
  const porArea   = {};

  ordenes.forEach(o => {
    const s = (o.status||'sin estado').replace(/_/g,' ');
    const p = o.prioridad || 'sin prioridad';
    const a = o.area || 'sin area';
    porStatus[s] = (porStatus[s]||0) + 1;
    porPri[p]    = (porPri[p]   ||0) + 1;
    porArea[a]   = (porArea[a]  ||0) + 1;
  });

  const statsRows = [
    ['INFRAESTRUCTURA-IT — ESTADÍSTICAS'],
    ['Generado:', new Date().toLocaleString('es-CO')],
    [],
    ['TOTAL ÓRDENES', total],
    [],
    ['POR ESTADO'],
    ...Object.entries(porStatus).map(([k,v]) => [k.toUpperCase(), v, Math.round(v/total*100)+'%']),
    [],
    ['POR PRIORIDAD'],
    ...Object.entries(porPri).map(([k,v]) => [k.toUpperCase(), v, Math.round(v/total*100)+'%']),
    [],
    ['POR ÁREA TÉCNICA'],
    ...Object.entries(porArea).sort((a,b)=>b[1]-a[1]).map(([k,v]) => [k, v, Math.round(v/total*100)+'%'])
  ];

  const wsStats = XLSX.utils.aoa_to_sheet(statsRows);
  wsStats['!cols'] = [{wch:30},{wch:10},{wch:10}];

  // ── WORKBOOK ─────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle Completo');
  XLSX.utils.book_append_sheet(wb, wsStats,   'Estadísticas');

  // ── DESCARGAR ────────────────────────────────────────────────────
  const fecha = new Date().toISOString().slice(0,10);
  XLSX.writeFile(wb, nombreArchivo + '-' + fecha + '.xlsx');
}

// ── FUNCIÓN PÚBLICA — llamar desde cualquier vista ────────────────
async function exportarExcelOrdenes(ordenes, rol = 'admin') {
  const nombres = {
    admin:   'IIT-Ordenes-Admin',
    tecnico: 'IIT-Mis-Ordenes-Tecnico',
    cliente: 'IIT-Mis-Ordenes-Cliente'
  };
  await exportarExcel(ordenes, nombres[rol] || 'IIT-Ordenes');
}
