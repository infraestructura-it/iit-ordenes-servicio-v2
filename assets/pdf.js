// ════════════════════════════════════════════════════════════════
//  IIT Órdenes de Servicio v2 — assets/pdf.js
//  Exportación PDF para Admin, Técnico y Cliente
//  Depende de: jsPDF (cdnjs)
// ════════════════════════════════════════════════════════════════

// ── CARGAR jsPDF DINÁMICAMENTE ────────────────────────────────────
function cargarJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── PALETA IIT ────────────────────────────────────────────────────
const C = {
  bg:      [8,  11, 16],
  surface: [13, 17, 23],
  border:  [30, 42, 56],
  accent:  [0,  212,255],
  blue:    [0,  119,255],
  text:    [232,240,248],
  muted:   [74, 96, 112],
  success: [0,  229,160],
  warn:    [255,183,0],
  error:   [255,69, 96],
  white:   [255,255,255]
};

const STATUS_COLOR = {
  borrador:   C.muted,
  pendiente:  C.warn,
  asignada:   C.blue,
  en_proceso: C.accent,
  en_pausa:   [255,140,0],
  cerrada:    C.success,
  cancelada:  C.error
};

const PRI_COLOR = {
  baja:    C.success,
  media:   C.warn,
  alta:    C.error,
  critica: C.error
};

// ── HELPERS ───────────────────────────────────────────────────────
function fFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', {
    day:'2-digit', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
}

function fFechaCorta(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day:'2-digit', month:'short', year:'numeric'
  });
}

function wrap(doc, text, maxW) {
  return doc.splitTextToSize(String(text || '—'), maxW);
}

// ── PDF INDIVIDUAL ────────────────────────────────────────────────
async function exportarPDFOrden(orden, historial = [], protocolo = null, logoB64 = null) {
  await cargarJsPDF();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const W = 210, M = 16;
  let y = 0;

  // ─ HEADER ─
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, W, 38, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(0, 0, W, 2, 'F');

  // Logo
  if (logoB64) {
    try { doc.addImage(logoB64, 'PNG', M, 6, 22, 22); } catch {}
  }

  // Nombre empresa
  doc.setTextColor(...C.text);
  doc.setFontSize(13);
  doc.setFont('helvetica','bold');
  doc.text('Infraestructura-IT', M + 26, 14);
  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica','normal');
  doc.text('SOPORTE & MANTENIMIENTO · BOGOTÁ, COLOMBIA', M + 26, 20);
  doc.text('Sistema de Órdenes de Servicio v2.0', M + 26, 25);

  // OS ID
  doc.setTextColor(...C.accent);
  doc.setFontSize(15);
  doc.setFont('helvetica','bold');
  doc.text(orden.orden_id || '—', W - M, 14, { align:'right' });

  // Status badge
  const sc = STATUS_COLOR[orden.status] || C.muted;
  doc.setFillColor(...sc);
  doc.roundedRect(W - M - 30, 18, 30, 7, 1.5, 1.5, 'F');
  doc.setTextColor(...C.bg);
  doc.setFontSize(7);
  doc.setFont('helvetica','bold');
  doc.text((orden.status||'—').replace(/_/g,' ').toUpperCase(), W - M - 15, 22.5, { align:'center' });

  // Fecha
  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica','normal');
  doc.text('Creada: ' + fFecha(orden.created_at), M + 26, 30);

  y = 46;

  // ─ FUNCIONES HELPER ─
  const seccion = (titulo, color = C.blue) => {
    if (y > 265) { doc.addPage(); y = 16; }
    doc.setFillColor(...C.bg);
    doc.rect(M, y, W - M*2, 7, 'F');
    doc.setFillColor(...color);
    doc.rect(M, y, 3, 7, 'F');
    doc.setTextColor(...C.text);
    doc.setFontSize(8);
    doc.setFont('helvetica','bold');
    doc.text(titulo, M + 6, y + 5);
    y += 10;
  };

  const campo = (label, val, fullW = false) => {
    if (!val || val === '—') return;
    const strVal = String(val);
    if (y > 268) { doc.addPage(); y = 16; }
    const ancho = fullW ? W - M*2 - 2 : W - M*2 - 46;
    const lines = wrap(doc, strVal, ancho);
    const h = Math.max(6, lines.length * 4.5);
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont('helvetica','normal');
    doc.text(label.toUpperCase(), M + 2, y);
    doc.setTextColor(...C.text);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', lines.length > 1 ? 'normal' : 'bold');
    doc.text(lines, fullW ? M + 2 : M + 44, y);
    y += h;
  };

  const linea = () => {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 4;
  };

  // ─ SECCIÓN 1: SOLICITANTE ─
  seccion('1. DATOS DEL SOLICITANTE');
  campo('Nombre',    orden.nombre);
  campo('Empresa',   orden.empresa);
  campo('Correo',    orden.correo);
  campo('Teléfono',  orden.telefono);
  campo('Cargo',     orden.cargo);
  linea();

  // ─ SECCIÓN 2: UBICACIÓN ─
  seccion('2. UBICACIÓN DEL SERVICIO');
  campo('Ciudad',    orden.ciudad + (orden.departamento ? ', '+orden.departamento : ''));
  campo('Dirección', orden.direccion);
  campo('Referencia',orden.referencia);
  campo('Recibe',    orden.persona_recibe);
  linea();

  // ─ SECCIÓN 3: SERVICIO ─
  seccion('3. DESCRIPCIÓN DEL SERVICIO');
  campo('Tipo',     orden.tipo_servicio);
  campo('Área',     orden.area);

  // Prioridad con color
  if (orden.prioridad) {
    const pc = PRI_COLOR[orden.prioridad] || C.muted;
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.text('PRIORIDAD', M + 2, y);
    doc.setFillColor(...pc);
    doc.roundedRect(M + 44, y - 4, 22, 6, 1, 1, 'F');
    doc.setTextColor(...C.bg);
    doc.setFontSize(7);
    doc.setFont('helvetica','bold');
    doc.text(orden.prioridad.toUpperCase(), M + 55, y, { align:'center' });
    y += 7;
  }

  campo('Fecha req.', orden.fecha_requerida);
  campo('Ventana',    orden.ventana);
  campo('Duración',   orden.duracion);
  campo('Acceso',     orden.acceso);

  if (orden.sintoma) {
    if (y > 250) { doc.addPage(); y = 16; }
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont('helvetica','normal');
    doc.text('SÍNTOMA', M + 2, y);
    doc.setTextColor(...C.text);
    doc.setFontSize(8);
    const lines = wrap(doc, orden.sintoma, W - M*2 - 2);
    doc.text(lines, M + 2, y + 5);
    y += lines.length * 4.5 + 8;
  }
  linea();

  // ─ SECCIÓN 4: EQUIPOS ─
  const equipos = Array.isArray(orden.equipos) ? orden.equipos : [];
  if (equipos.length || orden.marca) {
    seccion('4. EQUIPOS INVOLUCRADOS', C.accent);
    if (equipos.length) campo('Equipos', equipos.join(', '));
    campo('Marca/Modelo', orden.marca);
    campo('N° Serie',     orden.serie);
    campo('Observaciones',orden.obs_equipos);
    linea();
  }

  // ─ SECCIÓN 5: ADICIONAL ─
  if (orden.antecedentes || orden.contrato || orden.notas) {
    seccion('5. INFORMACIÓN ADICIONAL', C.muted);
    campo('Contrato',     orden.contrato);
    campo('Centro Costo', orden.centro_costo);
    campo('Antecedentes', orden.antecedentes);
    campo('Notas',        orden.notas);
    linea();
  }

  // ─ SECCIÓN 6: HISTORIAL ─
  if (historial && historial.length) {
    if (y > 220) { doc.addPage(); y = 16; }
    seccion('6. HISTORIAL DE CAMBIOS', C.success);
    historial.forEach(h => {
      if (y > 265) { doc.addPage(); y = 16; }
      doc.setTextColor(...C.muted);
      doc.setFontSize(7);
      doc.setFont('helvetica','normal');
      doc.text(fFechaCorta(h.created_at), M + 2, y);
      doc.setTextColor(...C.text);
      doc.setFontSize(8);
      const txt = h.campo_modificado + ': ' + (h.valor_anterior||'—') + ' → ' + (h.valor_nuevo||'—');
      const lines = wrap(doc, txt, W - M*2 - 32);
      doc.text(lines, M + 28, y);
      y += Math.max(5, lines.length * 4) + 1;
    });
    linea();
  }

  // ─ SECCIÓN 7: QR ─
  if (y > 230) { doc.addPage(); y = 16; }
  seccion('7. ACCESO RÁPIDO — QR', C.success);
  const formUrl = 'https://infraestructura-it.github.io/iit-ordenes-servicio-v2/orden.html?orden=' +
    encodeURIComponent(orden.orden_id||'') +
    '&nombre=' + encodeURIComponent(orden.nombre||'') +
    '&correo=' + encodeURIComponent(orden.correo||'') +
    '&empresa=' + encodeURIComponent(orden.empresa||'') +
    '&telefono=' + encodeURIComponent(orden.telefono||'');

  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' +
    encodeURIComponent(formUrl) + '&bgcolor=ffffff&color=000000&margin=2';

  try {
    const qrImg = await cargarImagen(qrUrl);
    doc.addImage(qrImg, 'PNG', M, y, 32, 32);
  } catch {}

  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.text('Escanee para abrir el formulario completo', M + 36, y + 8);
  doc.setTextColor(...C.accent);
  const urlLines = wrap(doc, formUrl, W - M*2 - 38);
  doc.text(urlLines, M + 36, y + 14);
  y += 36;

  // ─ FOOTER ─
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.bg);
    doc.rect(0, 284, W, 13, 'F');
    doc.setDrawColor(...C.border);
    doc.line(0, 284, W, 284);
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.text('INFRAESTRUCTURA-IT · Sistema de Órdenes de Servicio v2.0 · Bogotá, Colombia', M, 290);
    doc.text('Página ' + i + ' / ' + pages, W - M, 290, { align:'right' });
  }

  // ─ DESCARGAR ─
  doc.save('OS-IIT-' + (orden.orden_id||'orden') + '-' + new Date().toISOString().slice(0,10) + '.pdf');
}

// ── PDF LISTADO ───────────────────────────────────────────────────
async function exportarPDFListado(ordenes, titulo = 'Reporte de Órdenes', logoB64 = null) {
  await cargarJsPDF();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'mm', format:'a4', orientation:'landscape' });
  const W = 297, M = 12;
  let y = 0;

  // Header
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, W, 28, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(0, 0, W, 2, 'F');

  if (logoB64) {
    try { doc.addImage(logoB64, 'PNG', M, 5, 16, 16); } catch {}
  }

  doc.setTextColor(...C.text);
  doc.setFontSize(12);
  doc.setFont('helvetica','bold');
  doc.text('Infraestructura-IT — ' + titulo, M + 20, 12);
  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica','normal');
  doc.text('Generado: ' + new Date().toLocaleString('es-CO') + '  |  Total: ' + ordenes.length + ' órdenes', M + 20, 18);

  // KPIs
  const stats = {
    pendiente:  ordenes.filter(o=>o.status==='pendiente').length,
    en_proceso: ordenes.filter(o=>o.status==='en_proceso').length,
    cerrada:    ordenes.filter(o=>o.status==='cerrada').length,
    critica:    ordenes.filter(o=>o.prioridad==='critica').length
  };

  const kpis = [
    ['TOTAL', ordenes.length, C.accent],
    ['PENDIENTES', stats.pendiente, C.warn],
    ['EN PROCESO', stats.en_proceso, C.blue],
    ['CERRADAS', stats.cerrada, C.success],
    ['CRÍTICAS', stats.critica, C.error]
  ];

  kpis.forEach((k, i) => {
    const x = W - M - (kpis.length - i) * 38;
    doc.setFillColor(...C.surface);
    doc.roundedRect(x, 5, 35, 18, 1.5, 1.5, 'F');
    doc.setTextColor(...k[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica','bold');
    doc.text(String(k[1]), x + 17.5, 16, { align:'center' });
    doc.setTextColor(...C.muted);
    doc.setFontSize(6);
    doc.setFont('helvetica','normal');
    doc.text(k[0], x + 17.5, 21, { align:'center' });
  });

  y = 34;

  // Tabla
  const cols = [
    { label:'NO. ORDEN',  w:28 },
    { label:'FECHA',      w:22 },
    { label:'EMPRESA',    w:32 },
    { label:'CONTACTO',   w:24 },
    { label:'SERVICIO',   w:28 },
    { label:'ÁREA',       w:30 },
    { label:'PRIORIDAD',  w:18 },
    { label:'ESTADO',     w:20 },
    { label:'TÉCNICO',    w:24 },
    { label:'CIUDAD',     w:20 },
    { label:'FECHA REQ.', w:20 }
  ];

  // Header tabla
  doc.setFillColor(...C.surface);
  doc.rect(M, y, W - M*2, 7, 'F');
  let x = M;
  cols.forEach(col => {
    doc.setTextColor(...C.muted);
    doc.setFontSize(6.5);
    doc.setFont('helvetica','bold');
    doc.text(col.label, x + 1, y + 5);
    x += col.w;
  });
  y += 8;

  // Filas
  ordenes.forEach((o, i) => {
    if (y > 188) {
      doc.addPage();
      y = 16;
      // Repetir header
      doc.setFillColor(...C.surface);
      doc.rect(M, y, W - M*2, 7, 'F');
      let xh = M;
      cols.forEach(col => {
        doc.setTextColor(...C.muted);
        doc.setFontSize(6.5);
        doc.setFont('helvetica','bold');
        doc.text(col.label, xh + 1, y + 5);
        xh += col.w;
      });
      y += 8;
    }

    // Fondo alternado
    if (i % 2 === 0) {
      doc.setFillColor(13, 17, 23);
      doc.rect(M, y - 1, W - M*2, 6.5, 'F');
    }

    const sc = STATUS_COLOR[o.status] || C.muted;
    const pc = PRI_COLOR[o.prioridad] || C.muted;
    const tec = o.tecnicos?.usuarios?.nombre || '—';
    const vals = [
      o.orden_id || '—',
      o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'2-digit'}) : '—',
      o.empresa || '—',
      o.nombre || '—',
      o.tipo_servicio || '—',
      o.area || '—',
      (o.prioridad||'—').toUpperCase(),
      (o.status||'—').replace(/_/g,' ').toUpperCase(),
      tec,
      o.ciudad || '—',
      o.fecha_requerida || '—'
    ];

    let xv = M;
    vals.forEach((val, vi) => {
      const col = cols[vi];
      // Color especial para prioridad y estado
      if (vi === 6) doc.setTextColor(...pc);
      else if (vi === 7) doc.setTextColor(...sc);
      else doc.setTextColor(...C.text);

      doc.setFontSize(7);
      doc.setFont('helvetica', vi === 0 ? 'bold' : 'normal');
      const txt = String(val).slice(0, Math.floor(col.w / 1.8));
      doc.text(txt, xv + 1, y + 4);
      xv += col.w;
    });

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(M, y + 5.5, W - M, y + 5.5);
    y += 6.5;
  });

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.bg);
    doc.rect(0, 200, W, 8, 'F');
    doc.setTextColor(...C.muted);
    doc.setFontSize(6.5);
    doc.text('INFRAESTRUCTURA-IT · Sistema de Órdenes de Servicio v2.0', M, 205);
    doc.text('Página ' + i + ' / ' + pages, W - M, 205, { align:'right' });
  }

  doc.save('IIT-Listado-' + new Date().toISOString().slice(0,10) + '.pdf');
}

// ── CARGAR IMAGEN ─────────────────────────────────────────────────
function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      cv.getContext('2d').drawImage(img, 0, 0);
      resolve(cv.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}
