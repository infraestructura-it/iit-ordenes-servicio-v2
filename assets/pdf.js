// ════════════════════════════════════════════════════════════════
//  IIT Órdenes de Servicio v2 — assets/pdf.js
//  PDF profesional fondo blanco — legible al imprimir
// ════════════════════════════════════════════════════════════════

function cargarJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── PALETA PARA IMPRESIÓN (fondo blanco) ─────────────────────
const C = {
  azul:    [0,  82,  155],   // azul IIT oscuro
  azulL:   [0,  119, 255],   // azul acento
  negro:   [20, 20,  30],    // texto principal
  gris:    [80, 90,  110],   // texto secundario
  grisL:   [180,188, 204],   // bordes y separadores
  grisBG:  [245,247, 251],   // fondos alternados
  blanco:  [255,255, 255],
  verde:   [0,  130, 70],
  rojo:    [200,30,  50],
  naranja: [210,120, 0],
  morado:  [100,40,  180],
};

const PDF_STATUS_COLOR = {
  borrador:   C.gris,
  pendiente:  C.naranja,
  asignada:   C.azulL,
  en_proceso: [0,150,180],
  en_pausa:   [180,100,0],
  cerrada:    C.verde,
  cancelada:  C.rojo
};

const PDF_PRI_COLOR = {
  baja:   C.verde,
  media:  C.naranja,
  alta:   C.rojo,
  critica:C.rojo
};

function fFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function fFechaCorta(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
}
function wrap(doc, text, maxW) {
  return doc.splitTextToSize(String(text||'—'), maxW);
}
function chk(doc, y, h=10) {
  if (y + h > 272) { doc.addPage(); return 18; }
  return y;
}

// ── PDF ORDEN INDIVIDUAL ──────────────────────────────────────
async function exportarPDFOrden(orden, historial=[], protocolo=null, logoB64=null) {
  await cargarJsPDF();
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({unit:'mm', format:'a4'});
  const W=210, M=16, CW=W-M*2;
  let y=0;

  // ── HEADER ──────────────────────────────────────────────────
  // Franja azul superior
  doc.setFillColor(...C.azul); doc.rect(0,0,W,46,'F');
  doc.setFillColor(...C.azulL); doc.rect(0,0,4,46,'F');

  // Logo
  if (logoB64) {
    try { doc.addImage(logoB64,'PNG',M,6,26,26); } catch{}
  } else {
    // Logo IIT profesional — texto cuando no hay imagen
    doc.setFillColor(...C.azul);
    doc.roundedRect(M,7,28,28,4,4,'F');
    doc.setFillColor(...C.azulL);
    doc.roundedRect(M,7,28,4,2,2,'F');
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.setTextColor(...C.blanco);
    doc.text('IIT',M+14,24,{align:'center'});
    doc.setFontSize(5.5); doc.setFont('helvetica','normal');
    doc.text('INFRA-IT',M+14,30,{align:'center'});
  }

  // Nombre empresa
  doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.setTextColor(...C.blanco);
  doc.text('Infraestructura-IT', M+28, 16);
  doc.setFontSize(7.5); doc.setFont('helvetica','normal');
  doc.setTextColor(200,215,240);
  doc.text('SOPORTE & MANTENIMIENTO · BOGOTÁ, COLOMBIA', M+28, 22);
  doc.text('Sistema de Órdenes de Servicio v2.0', M+28, 27);
  doc.text('Creada: '+fFecha(orden.created_at), M+28, 32);

  // ID Orden
  doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.setTextColor(...C.blanco);
  doc.text(orden.orden_id||'—', W-M, 16, {align:'right'});

  // Status badge
  const sc = PDF_STATUS_COLOR[orden.status]||C.gris;
  doc.setFillColor(...sc.map(v=>Math.min(255,v+60)));
  doc.roundedRect(W-M-32,20,32,8,2,2,'F');
  doc.setFontSize(7.5); doc.setFont('helvetica','bold');
  doc.setTextColor(...C.blanco);
  doc.text((orden.status||'—').replace(/_/g,' ').toUpperCase(),W-M-16,25.5,{align:'center'});

  y = 54;

  // ── KPIs resumen ────────────────────────────────────────────
  doc.setFillColor(...C.grisBG);
  doc.roundedRect(M,y,CW,18,2,2,'F');
  doc.setDrawColor(...C.grisL); doc.setLineWidth(0.3);
  doc.roundedRect(M,y,CW,18,2,2,'S');

  const kpis = [
    ['PRIORIDAD', (orden.prioridad||'—').toUpperCase(), PDF_PRI_COLOR[orden.prioridad]||C.gris],
    ['ÁREA',      orden.area||orden.tipo_servicio||'—', C.azulL],
    ['CIUDAD',    orden.ciudad||'—', C.negro],
    ['TÉCNICO',   orden.tecnicos?.usuarios?.nombre||'Sin asignar', orden.tecnico_id?C.verde:C.naranja],
  ];
  const kw = CW/kpis.length;
  kpis.forEach(([lbl,val,color],i)=>{
    const x = M + i*kw + kw/2;
    doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(100,110,130);
    doc.text(lbl, x, y+6, {align:'center'});
    doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(...color);
    doc.text(String(val).slice(0,18), x, y+13, {align:'center'});
    if(i>0){doc.setDrawColor(...C.grisL);doc.line(M+i*kw,y+3,M+i*kw,y+15);}
  });
  y += 24;

  // ── FUNCIÓN SECCIÓN ──────────────────────────────────────────
  const secHeader = (num, titulo) => {
    y = chk(doc, y, 12);
    doc.setFillColor(...C.azul); doc.rect(M,y,CW,8,'F');
    doc.setFillColor(...C.azulL); doc.rect(M,y,3,8,'F');
    doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.setTextColor(...C.blanco);
    doc.text(num+'.  '+titulo.toUpperCase(), M+6, y+5.5);
    y += 12;
  };

  // ── FUNCIÓN CAMPO ────────────────────────────────────────────
  const campo = (label, val, isAlt=false) => {
    if (!val || val==='—') return;
    const lines = wrap(doc, val, CW-55);
    const h = Math.max(7, lines.length*4.5);
    y = chk(doc, y, h);
    if (isAlt) { doc.setFillColor(...C.grisBG); doc.rect(M,y-1,CW,h+1,'F'); }
    // Label en gris oscuro
    doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(80,90,110);
    doc.text(label, M+2, y+4);
    // Valor en negro puro — legible al imprimir
    doc.setFont('helvetica','normal'); doc.setTextColor(20,20,30);
    doc.text(lines, M+52, y+4);
    y += h;
  };

  // ── 1. DATOS DEL SOLICITANTE ─────────────────────────────────
  secHeader('1','Datos del Solicitante');
  campo('NOMBRE',   orden.nombre, false);
  campo('EMPRESA',  orden.empresa, true);
  campo('CORREO',   orden.correo, false);
  campo('TELÉFONO', orden.telefono, true);
  campo('CARGO',    orden.cargo, false);
  y += 4;

  // ── 2. UBICACIÓN ─────────────────────────────────────────────
  secHeader('2','Ubicación del Servicio');
  campo('CIUDAD',         orden.ciudad, false);
  campo('DEPARTAMENTO',   orden.departamento, true);
  campo('DIRECCIÓN',      orden.direccion, false);
  campo('REFERENCIA',     orden.referencia, true);
  campo('PERSONA RECIBE', orden.persona_recibe, false);
  y += 4;

  // ── 3. DESCRIPCIÓN ───────────────────────────────────────────
  secHeader('3','Descripción del Servicio');
  campo('TIPO',        orden.tipo_servicio, false);
  campo('ÁREA',        orden.area, true);
  // Prioridad visual
  y = chk(doc, y, 8);
  doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(...C.negro);
  doc.text('PRIORIDAD', M+2, y+4);
  const pc = PDF_PRI_COLOR[orden.prioridad]||C.gris;
  doc.setFillColor(...pc); doc.roundedRect(M+52, y+0.5, 22, 5.5, 1,1,'F');
  doc.setTextColor(...C.blanco); doc.setFontSize(7);
  doc.text((orden.prioridad||'—').toUpperCase(), M+63, y+4.5, {align:'center'});
  y += 7;

  campo('FECHA REQ.',  fFechaCorta(orden.fecha_requerida), false);
  // Síntoma en caja destacada
  if (orden.sintoma) {
    y = chk(doc, y, 16);
    doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(...C.negro);
    doc.text('SÍNTOMA', M+2, y+4);
    const sLines = wrap(doc, orden.sintoma, CW-8);
    const sh = sLines.length*4.5+8;
    y = chk(doc, y+6, sh);
    doc.setFillColor(240,244,255);
    doc.roundedRect(M,y,CW,sh,1,1,'F');
    doc.setDrawColor(...C.grisL); doc.setLineWidth(0.2);
    doc.roundedRect(M,y,CW,sh,1,1,'S');
    doc.setFillColor(...C.azulL); doc.rect(M,y,2,sh,'F');
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(20,20,30);
    doc.text(sLines, M+5, y+5);
    y += sh+4;
  }

  // ── 4. EQUIPOS ───────────────────────────────────────────────
  if (orden.marca||orden.serie||orden.equipos?.length||orden.obs_equipos) {
    secHeader('4','Equipos Involucrados');
    campo('MARCA/MODELO', orden.marca, false);
    campo('No. SERIE',    orden.serie, true);
    if (orden.equipos?.length) {
      campo('EQUIPOS', orden.equipos.join(', '), false);
    }
    campo('OBSERVACIONES', orden.obs_equipos, true);
    y += 4;
  }

  // ── 5. INFORMACIÓN ADICIONAL ─────────────────────────────────
  if (orden.notas||orden.antecedentes||orden.contrato) {
    secHeader('5','Información Adicional');
    campo('NOTAS',          orden.notas, false);
    campo('ANTECEDENTES',   orden.antecedentes, true);
    campo('CONTRATO/OC',    orden.contrato, false);
    campo('CENTRO COSTO',   orden.centro_costo, true);
    y += 4;
  }

  // ── 6. HISTORIAL ─────────────────────────────────────────────
  if (historial?.length) {
    secHeader('6','Historial de Cambios');
    historial.slice(0,8).forEach((h,i)=>{
      y = chk(doc, y, 7);
      if(i%2===0){doc.setFillColor(...C.grisBG);doc.rect(M,y-1,CW,7,'F');}
      doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(80,90,110);
      doc.text(fFechaCorta(h.created_at), M+2, y+4);
      const detalle = (h.campo||'')+(h.valor_anterior?': '+h.valor_anterior+' → '+(h.valor_nuevo||''):' '+h.valor_nuevo||'');
      doc.setTextColor(20,20,30);
      doc.text(wrap(doc,detalle,CW-40)[0], M+38, y+4);
      y+=7;
    });
    y+=4;
  }

  // ── 7. QR ────────────────────────────────────────────────────
  y = chk(doc, y, 44);
  secHeader('7','Acceso Rápido — QR');
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+
    encodeURIComponent('https://infraestructura-it.github.io/iit-ordenes-servicio-v2/orden.html'+
      '?orden='+(orden.orden_id||'')+
      '&nombre='+(orden.nombre||'')+
      '&correo='+(orden.correo||'')+
      '&empresa='+(orden.empresa||'')+
      '&telefono='+(orden.telefono||'')
    )+'&color=00529b&bgcolor=ffffff&margin=2';

  try {
    const qrImg = await new Promise((res,rej)=>{
      const img=new Image(); img.crossOrigin='anonymous';
      img.onload=()=>{
        const cv=document.createElement('canvas');
        cv.width=img.width; cv.height=img.height;
        cv.getContext('2d').drawImage(img,0,0);
        res(cv.toDataURL('image/png'));
      };
      img.onerror=rej; img.src=qrUrl;
    });
    doc.addImage(qrImg,'PNG',M,y,32,32);
    doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(...C.negro);
    doc.text('Escanee para abrir el formulario completo', M+36, y+8);
    doc.setFont('helvetica','normal'); doc.setTextColor(0,82,155);
    const link='https://infraestructura-it.github.io/iit-ordenes-servicio-v2/orden.html?orden='+(orden.orden_id||'');
    const lLines=wrap(doc,link,CW-40);
    doc.text(lLines, M+36, y+14);
    y+=36;
  } catch {
    y+=4;
  }

  // ── FOOTER ───────────────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setFillColor(...C.azul); doc.rect(0,285,W,12,'F');
    doc.setFontSize(6.5); doc.setFont('helvetica','normal');
    doc.setTextColor(200,215,240);
    doc.text('INFRAESTRUCTURA-IT · Sistema de Órdenes de Servicio v2.0 · Bogotá, Colombia', M, 292);
    doc.text('Página '+i+' / '+pages, W-M, 292, {align:'right'});
  }

  doc.save('OS-IIT-'+(orden.orden_id||'orden')+'-'+new Date().toISOString().slice(0,10)+'.pdf');
}

// ── PDF LISTADO ───────────────────────────────────────────────
async function exportarPDFListado(ordenes, titulo='Reporte de Órdenes', logoB64=null) {
  await cargarJsPDF();
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({unit:'mm', format:'a4', orientation:'landscape'});
  const W=297, M=14, CW=W-M*2;
  let y=0;

  // Header
  doc.setFillColor(...C.azul); doc.rect(0,0,W,32,'F');
  doc.setFillColor(...C.azulL); doc.rect(0,0,4,32,'F');

  if(logoB64){
    try{ doc.addImage(logoB64,'PNG',M,4,20,20); }catch{}
    doc.setFontSize(13); doc.setFont('helvetica','bold');
    doc.setTextColor(...C.blanco);
    doc.text('Infraestructura-IT', M+24, 14);
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.setTextColor(200,215,240);
    doc.text('Sistema de Órdenes de Servicio v2.0', M+24, 20);
  } else {
    doc.setFontSize(13); doc.setFont('helvetica','bold');
    doc.setTextColor(...C.blanco);
    doc.text('Infraestructura-IT', M, 14);
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.setTextColor(200,215,240);
    doc.text('Sistema de Órdenes de Servicio v2.0', M, 20);
  }

  doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.setTextColor(...C.blanco);
  doc.text(titulo, W-M, 14, {align:'right'});
  doc.setFontSize(7); doc.setFont('helvetica','normal');
  doc.setTextColor(200,215,240);
  doc.text(new Date().toLocaleString('es-CO'), W-M, 20, {align:'right'});
  doc.text(ordenes.length+' órdenes', W-M, 25, {align:'right'});
  y=38;

  // Cabecera tabla
  const cols=[
    {t:'NO. ORDEN',  w:30},
    {t:'EMPRESA',    w:42},
    {t:'CONTACTO',   w:30},
    {t:'ÁREA',       w:30},
    {t:'PRIORIDAD',  w:22},
    {t:'ESTADO',     w:26},
    {t:'TÉCNICO',    w:36},
    {t:'FECHA',      w:22},
  ];

  doc.setFillColor(...C.azul); doc.rect(M,y,CW,8,'F');
  let cx=M;
  cols.forEach(col=>{
    doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.setTextColor(...C.blanco);
    doc.text(col.t, cx+1, y+5.5);
    cx+=col.w;
  });
  y+=9;

  ordenes.forEach((o,i)=>{
    const colores=[8,7,7,7,7,7,7,7]; // alturas mín por fila
    const h=8;
    if(y+h>196){doc.addPage();y=16;}
    if(i%2===0){doc.setFillColor(...C.grisBG);doc.rect(M,y-1,CW,h+1,'F');}
    doc.setDrawColor(...C.grisL); doc.setLineWidth(0.1);
    doc.line(M,y+h,M+CW,y+h);

    cx=M;
    // No. Orden
    doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.setTextColor(...C.azulL);
    doc.text(o.orden_id||'—', cx+1, y+5); cx+=cols[0].w;

    // Empresa
    doc.setFont('helvetica','bold'); doc.setTextColor(...C.negro);
    doc.text(wrap(doc,o.empresa||'—',cols[1].w-2)[0], cx+1, y+5); cx+=cols[1].w;

    // Contacto
    doc.setFont('helvetica','normal'); doc.setTextColor(...C.gris);
    doc.text(wrap(doc,o.nombre||'—',cols[2].w-2)[0], cx+1, y+5); cx+=cols[2].w;

    // Área
    doc.text(wrap(doc,o.area||o.tipo_servicio||'—',cols[3].w-2)[0], cx+1, y+5); cx+=cols[3].w;

    // Prioridad
    const pc=PDF_PRI_COLOR[o.prioridad]||C.gris;
    doc.setFillColor(...pc); doc.roundedRect(cx+1,y+1.5,18,5,1,1,'F');
    doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(...C.blanco);
    doc.text((o.prioridad||'—').toUpperCase().slice(0,6), cx+10, y+5.2, {align:'center'});
    cx+=cols[4].w;

    // Estado
    const sc=PDF_STATUS_COLOR[o.status]||C.gris;
    doc.setFillColor(...sc.map(v=>Math.min(255,v+80)));
    doc.roundedRect(cx+1,y+1.5,22,5,1,1,'F');
    doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(...sc.map(v=>Math.max(0,v-40)));
    doc.text((o.status||'—').replace(/_/g,' ').toUpperCase().slice(0,10), cx+12, y+5.2, {align:'center'});
    cx+=cols[5].w;

    // Técnico
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.setTextColor(o.tecnico_id?C.negro:C.naranja);
    doc.text(wrap(doc,o.tecnicos?.usuarios?.nombre||'Sin asignar',cols[6].w-2)[0], cx+1, y+5);
    cx+=cols[6].w;

    // Fecha
    doc.setTextColor(...C.gris);
    doc.text(fFechaCorta(o.created_at), cx+1, y+5);

    y+=h;
  });

  // Footer
  const pages=doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setFillColor(...C.azul); doc.rect(0,198,W,10,'F');
    doc.setFontSize(6.5); doc.setFont('helvetica','normal');
    doc.setTextColor(200,215,240);
    doc.text('INFRAESTRUCTURA-IT · Bogotá, Colombia', M, 204);
    doc.text('Página '+i+' / '+pages, W-M, 204, {align:'right'});
  }

  doc.save('IIT-Reporte-'+new Date().toISOString().slice(0,10)+'.pdf');
}
