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
    // Logo embebido como fallback
    const LOGO_EMB = 'data:image/png;base64,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';
    try { doc.addImage(LOGO_EMB,'PNG',M,7,28,28); } catch(e){
      // Último fallback texto
      doc.setFillColor(...C.azul);
      doc.roundedRect(M,7,28,28,4,4,'F');
      doc.setFontSize(14); doc.setFont('helvetica','bold');
      doc.setTextColor(...C.blanco);
      doc.text('IIT',M+14,24,{align:'center'});
    }
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

  // ── PROTOCOLO EJECUTADO ──────────────────────────────────────
  if (protocolo && protocolo.campos?.length) {
    y = chk(doc, y, 16);
    // Header sección
    doc.setFillColor(100,40,180);
    doc.rect(M, y, CW, 9, 'F');
    doc.setFillColor(130,60,210);
    doc.rect(M, y, 3, 9, 'F');
    doc.setFontSize(8.5); doc.setFont('helvetica','bold');
    doc.setTextColor(255,255,255);
    doc.text('PROTOCOLO: '+(protocolo.ejecucion?.protocolos?.nombre||'—').toUpperCase(), M+6, y+6);
    const stP = protocolo.ejecucion?.status||'pendiente';
    const stPColor = {completado:[0,140,80],en_progreso:[0,119,255],pendiente:[200,140,0]}[stP]||[100,110,130];
    doc.setFillColor(...stPColor.map(v=>Math.min(255,v+80)));
    doc.roundedRect(W-M-28, y+1.5, 28, 6, 1, 1, 'F');
    doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
    doc.text(stP.replace(/_/g,' ').toUpperCase(), W-M-14, y+5.5, {align:'center'});
    y += 13;

    // Campos con respuestas
    const respMap = {};
    (protocolo.respuestas||[]).forEach(r => respMap[r.campo_id] = r.valor);

    const campos = (protocolo.campos||[]).sort((a,b)=>a.orden-b.orden);
    campos.forEach((campo, i) => {
      const valor = respMap[campo.id];
      const tipo  = campo.tipo;
      const unidad = campo.unidad ? ' ('+campo.unidad+')' : '';
      const completado = !!valor;

      // Calcular altura necesaria
      let alturaExtra = 0;
      if (tipo === 'foto' && valor) alturaExtra = 40;
      if (tipo === 'firma' && valor) alturaExtra = 20;
      const h = Math.max(8, alturaExtra + 8);
      y = chk(doc, y, h + 4);

      // Fondo alternado
      if (i % 2 === 0) {
        doc.setFillColor(248, 249, 252);
        doc.rect(M, y-1, CW, h+2, 'F');
      }

      // Indicador completado
      if (completado) {
        doc.setFillColor(0, 180, 100);
        doc.rect(M, y-1, 3, h+2, 'F');
      } else {
        doc.setFillColor(200, 140, 0);
        doc.rect(M, y-1, 3, h+2, 'F');
      }

      // Número
      doc.setFontSize(7); doc.setFont('helvetica','bold');
      doc.setTextColor(completado?0:180, completado?140:100, completado?80:0);
      doc.text(String(i+1), M+6, y+5, {align:'center'});

      // Etiqueta
      doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.setTextColor(20, 20, 30);
      doc.text(campo.etiqueta+unidad, M+12, y+5);

      // Tipo badge
      const tL = {texto:'Texto',numero:'Número',si_no:'Sí/No',lista:'Lista',rango:'Rango',foto:'Foto',firma:'Firma',fecha_hora:'Fecha/Hora'}[tipo]||tipo;
      doc.setFontSize(6); doc.setFont('helvetica','normal');
      doc.setTextColor(100,110,130);
      doc.text(tL, W-M-2, y+5, {align:'right'});

      // Valor
      if (valor) {
        if (tipo === 'foto') {
          try {
            doc.addImage(valor, 'PNG', M+12, y+8, 50, 35);
            y += 8;
          } catch(e) {}
        } else if (tipo === 'firma') {
          try {
            doc.addImage(valor, 'PNG', M+12, y+8, 60, 18);
            y += 8;
          } catch(e) {}
        } else if (tipo === 'si_no') {
          const siColor = valor==='si'?[0,140,80]:[200,30,50];
          doc.setFillColor(...siColor.map(v=>Math.min(255,v+140)));
          doc.roundedRect(M+12, y+7, 18, 5, 1, 1, 'F');
          doc.setFontSize(7); doc.setFont('helvetica','bold');
          doc.setTextColor(...siColor.map(v=>Math.max(0,v-60)));
          doc.text(valor.toUpperCase(), M+21, y+10.5, {align:'center'});
          y += 6;
        } else {
          doc.setFontSize(8); doc.setFont('helvetica','normal');
          doc.setTextColor(60, 80, 120);
          const vLines = wrap(doc, String(valor), CW-16);
          doc.text(vLines, M+12, y+10);
          y += vLines.length * 4.5;
        }
      } else {
        doc.setFontSize(7.5); doc.setFont('helvetica','normal');
        doc.setTextColor(180, 100, 0);
        doc.text('Sin respuesta', M+12, y+10);
        y += 4;
      }
      y += 6;
    });

    // Fecha ejecución
    if(protocolo.ejecucion?.fecha_fin) {
      y = chk(doc, y, 8);
      doc.setFontSize(7.5); doc.setFont('helvetica','normal');
      doc.setTextColor(0,140,80);
      doc.text('✓ Protocolo completado: '+fFecha(protocolo.ejecucion.fecha_fin), M, y);
      y += 8;
    }
    y += 4;
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
