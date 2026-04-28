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

// Helpers globales PDF
function fNum(n){ return Math.round(n||0).toLocaleString('es-CO'); }
function fFecha(iso){ if(!iso) return '—'; return new Date(iso).toLocaleString('es-CO',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }

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
async function exportarPDFOrden(orden, historial=[], protocolo=null, logoB64=null, cotizacion=null) {
  await cargarJsPDF();
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({unit:'mm', format:'a4'});
  const W=210, M=14, CW=W-M*2;
  const H2 = CW/2 - 3; // mitad para 2 columnas
  let y = 0;

  // ── HELPERS ──────────────────────────────────────────────────
  const nP = (n=0) => { doc.addPage(); y=14; };
  const ck = (h=8) => { if(y+h>278){nP();} };

  // Sección header compacto
  const sec = (titulo, color=C.azul) => {
    ck(7);
    doc.setFillColor(...color); doc.rect(M,y,CW,7,'F');
    doc.setFillColor(...color.map(v=>Math.min(255,v+50))); doc.rect(M,y,2,7,'F');
    doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
    doc.text(titulo.toUpperCase(), M+4, y+5); y+=9;
  };

  // Campo compacto en 1 col
  const cf = (label, val, alt=false) => {
    if(!val||val==='—') return;
    const vl = wrap(doc, String(val), CW-42);
    const h  = Math.max(6, vl.length*4);
    ck(h);
    if(alt){doc.setFillColor(...C.grisBG);doc.rect(M,y-0.5,CW,h+0.5,'F');}
    doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(100,110,130);
    doc.text(label, M+1, y+3.5);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(20,20,30);
    doc.text(vl, M+42, y+3.5);
    y += h;
  };

  // Campo en 2 columnas
  const cf2 = (items) => {
    // items = [[label,val],[label,val],...]
    const filas = [];
    for(let i=0;i<items.length;i+=2) filas.push([items[i],items[i+1]||null]);
    filas.forEach(([a,b])=>{
      if(!a[1]&&!b?.[1]) return;
      ck(6);
      doc.setFillColor(...C.grisBG); doc.rect(M,y-0.5,CW,6,'F');
      [[a,M],[b,M+H2+6]].forEach(([item,x])=>{
        if(!item||!item[1]) return;
        doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(100,110,130);
        doc.text(item[0], x+1, y+2.5);
        doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(20,20,30);
        doc.text(wrap(doc,String(item[1]),H2-20)[0], x+22, y+4);
      });
      y+=6;
    });
  };

  // ── HEADER ───────────────────────────────────────────────────
  doc.setFillColor(...C.azul); doc.rect(0,0,W,32,'F');
  doc.setFillColor(...C.azulL); doc.rect(0,0,3,32,'F');

  // Logo
  const LOGO_EMB = 'data:image/png;base64,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';
  try{ doc.addImage(LOGO_EMB,'PNG',M,5,22,22); }catch(e){}

  // Nombre empresa
  doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
  doc.text('Infraestructura-IT', M+25, 13);
  doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(180,205,240);
  doc.text('SOPORTE & MANTENIMIENTO · BOGOTÁ', M+25, 18);
  doc.text('Creada: '+fFechaCorta(orden.created_at), M+25, 23);

  // ID Orden
  doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
  doc.text(orden.orden_id||'—', W-M, 13, {align:'right'});
  // Status
  const sc = PDF_STATUS_COLOR[orden.status]||C.gris;
  doc.setFillColor(...sc); doc.roundedRect(W-M-26,16,26,7,1.5,1.5,'F');
  doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
  doc.text((orden.status||'').replace(/_/g,' ').toUpperCase(),W-M-13,21,{align:'center'});

  y = 36;

  // ── RESUMEN EN 1 LÍNEA ───────────────────────────────────────
  doc.setFillColor(235,243,255); doc.rect(M,y,CW,8,'F');
  doc.setDrawColor(...C.grisL); doc.setLineWidth(0.2); doc.rect(M,y,CW,8,'S');
  const pc = PDF_PRI_COLOR[orden.prioridad]||C.gris;
  doc.setFillColor(...pc); doc.roundedRect(M+1,y+1.5,16,5,1,1,'F');
  doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
  doc.text((orden.prioridad||'—').toUpperCase(),M+9,y+5,{align:'center'});
  const resItems = [
    orden.tipo_servicio||'—',
    orden.area||'—',
    orden.ciudad||'—',
    orden.tecnico_id?(orden.tecnicos?.usuarios?.nombre||'Asignado'):'Sin asignar'
  ];
  resItems.forEach((v,i)=>{
    const x = M+20 + i*((CW-20)/4);
    doc.setFontSize(7); doc.setFont('helvetica', i===3&&!orden.tecnico_id?'bold':'normal');
    doc.setTextColor(i===3&&!orden.tecnico_id?210:40, i===3&&!orden.tecnico_id?120:50, i===3&&!orden.tecnico_id?0:80);
    doc.text(String(v).slice(0,20), x, y+5);
  });
  y += 11;

  // ── 1. SOLICITANTE + UBICACIÓN en 2 columnas ─────────────────
  sec('1. SOLICITANTE & UBICACIÓN');
  cf2([
    ['NOMBRE',   orden.nombre],
    ['EMPRESA',  orden.empresa],
    ['CORREO',   orden.correo],
    ['TELÉFONO', orden.telefono],
    ['CIUDAD',   orden.ciudad],
    ['DIRECCIÓN',orden.direccion],
    ['CARGO',    orden.cargo],
    ['REFERENCIA',orden.referencia],
  ]);
  y+=3;

  // ── 2. SERVICIO ───────────────────────────────────────────────
  sec('2. DESCRIPCIÓN DEL SERVICIO');
  cf2([
    ['TIPO SERVICIO', orden.tipo_servicio],
    ['FECHA REQ.',    fFechaCorta(orden.fecha_requerida)],
    ['ÁREA',          orden.area],
    ['HORA PREF.',    orden.hora_preferida],
  ]);
  if(orden.sintoma){
    ck(14);
    const sL=wrap(doc,orden.sintoma,CW-4);
    const sh=sL.length*4+6;
    doc.setFillColor(240,244,255); doc.roundedRect(M,y,CW,sh,1,1,'F');
    doc.setFillColor(...C.azulL); doc.rect(M,y,2,sh,'F');
    doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(100,110,130);
    doc.text('SÍNTOMA/PROBLEMA:', M+3,y+4);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(20,20,30);
    doc.text(sL,M+3,y+8); y+=sh+3;
  }
  y+=3;

  // ── 3. EQUIPOS (si hay) ───────────────────────────────────────
  if(orden.marca||orden.serie||orden.equipos?.length){
    sec('3. EQUIPOS');
    cf2([
      ['MARCA/MODELO',orden.marca],
      ['No. SERIE',   orden.serie],
      ['EQUIPOS',     orden.equipos?.join(', ')],
      ['OBS.',        orden.obs_equipos],
    ]);
    y+=3;
  }

  // ── 4. ADICIONAL ─────────────────────────────────────────────
  if(orden.notas||orden.antecedentes||orden.contrato){
    sec('4. INFORMACIÓN ADICIONAL');
    cf('NOTAS',        orden.notas, false);
    cf('ANTECEDENTES', orden.antecedentes, true);
    cf('CONTRATO/OC',  orden.contrato, false);
    y+=3;
  }

  // ── 5. HISTORIAL ─────────────────────────────────────────────
  if(historial?.length){
    sec('5. HISTORIAL');
    historial.slice(0,6).forEach((h,i)=>{
      ck(6);
      if(i%2===0){doc.setFillColor(...C.grisBG);doc.rect(M,y-0.5,CW,6,'F');}
      doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(100,110,130);
      doc.text(fFechaCorta(h.created_at),M+1,y+4);
      const det=(h.campo||'')+(h.valor_anterior?': '+h.valor_anterior+' → '+(h.valor_nuevo||''):' '+(h.valor_nuevo||''));
      doc.setTextColor(20,20,30);
      doc.text(wrap(doc,det,CW-36)[0],M+34,y+4);
      y+=6;
    });
    y+=3;
  }

  // ── 6. QR ─────────────────────────────────────────────────────
  if(orden.orden_id){
    ck(30);
    try{
      const qrUrl='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+
        encodeURIComponent('https://infraestructura-it.github.io/iit-ordenes-servicio-v2/orden.html?orden='+orden.orden_id)+
        '&bgcolor=ffffff&color=00529b&margin=2';
      const qrImg=await cargarImgPDF(qrUrl);
      doc.addImage(qrImg,'PNG',W-M-24,y,24,24);
      doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(100,110,130);
      doc.text('ACCESO RÁPIDO',W-M-12,y+26,{align:'center'});
      doc.text(orden.orden_id,W-M-12,y+29,{align:'center'});
    }catch(e){}
    y+=3;
  }

  // ── 7. PROTOCOLO ─────────────────────────────────────────────
  if(protocolo?.campos?.length){
    ck(10);
    const stP=protocolo.ejecucion?.status||'pendiente';
    const stPC={completado:C.verde,en_progreso:C.azulL,pendiente:C.naranja}[stP]||C.gris;
    doc.setFillColor(100,40,180); doc.rect(M,y,CW,7,'F');
    doc.setFillColor(130,60,210); doc.rect(M,y,2,7,'F');
    doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
    doc.text('PROTOCOLO: '+(protocolo.ejecucion?.protocolos?.nombre||'—').toUpperCase().slice(0,50), M+4, y+5);
    doc.setFillColor(...stPC.map(v=>Math.min(255,v+80)));
    doc.roundedRect(W-M-24,y+1,24,5,1,1,'F');
    doc.setFontSize(6); doc.text(stP.replace(/_/g,' ').toUpperCase(),W-M-12,y+4.5,{align:'center'});
    y+=10;

    const respMap={};
    (protocolo.respuestas||[]).forEach(r=>respMap[r.campo_id]=r.valor);

    // Campos en 2 columnas cuando son cortos
    const tipoL={texto:'Texto',numero:'Número',si_no:'Sí/No',lista:'Lista',rango:'Rango',foto:'📷',firma:'✍',fecha_hora:'Fecha'};
    protocolo.campos.forEach((campo,i)=>{
      const val=respMap[campo.id];
      const tipo=campo.tipo;
      const unidad=campo.unidad?' ('+campo.unidad+')':'';

      // Foto y firma necesitan más espacio
      if(tipo==='foto'&&val){
        ck(28); 
        doc.setFillColor(i%2===0?248:255,249,252); doc.rect(M,y-0.5,CW,28,'F');
        doc.setFillColor(...C.morado.map?C.morado:[100,40,180]); doc.rect(M,y-0.5,2,28,'F');
        doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(20,20,30);
        doc.text((i+1)+'. '+campo.etiqueta+unidad, M+3, y+4);
        try{doc.addImage(val,'PNG',M+3,y+6,40,20);}catch(e){}
        y+=29; return;
      }
      if(tipo==='firma'&&val){
        ck(18);
        doc.setFillColor(248,249,252); doc.rect(M,y-0.5,CW,18,'F');
        doc.setFillColor(100,40,180); doc.rect(M,y-0.5,2,18,'F');
        doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(20,20,30);
        doc.text((i+1)+'. '+campo.etiqueta, M+3, y+4);
        try{doc.addImage(val,'PNG',M+3,y+6,50,10);}catch(e){}
        y+=19; return;
      }

      ck(7);
      if(i%2===0){doc.setFillColor(...C.grisBG);doc.rect(M,y-0.5,CW,7,'F');}
      doc.setFillColor(val?0:180, val?140:100, val?180:0);
      doc.rect(M,y-0.5,2,7,'F');

      // Número
      doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(100,40,180);
      doc.text(String(i+1), M+4, y+4.5, {align:'center'});

      // Etiqueta
      doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(20,20,30);
      doc.text(campo.etiqueta+unidad, M+8, y+4.5);

      // Tipo
      doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(120,120,140);
      doc.text(tipoL[tipo]||tipo, W-M-35, y+4.5);

      // Valor
      if(val){
        let vshow=String(val);
        if(tipo==='si_no'){
          const vc=val==='si'?[0,140,80]:[200,30,50];
          doc.setFillColor(...vc.map(v=>Math.min(255,v+140)));
          doc.roundedRect(W-M-25,y+1,14,5,1,1,'F');
          doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(...vc.map(v=>Math.max(0,v-60)));
          doc.text(val.toUpperCase(),W-M-18,y+4.5,{align:'center'});
        } else {
          doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(0,60,140);
          doc.text(wrap(doc,vshow,42)[0], W-M-22, y+4.5);
        }
      } else {
        doc.setFontSize(6.5); doc.setFont('helvetica','italic'); doc.setTextColor(180,140,0);
        doc.text('—', W-M-5, y+4.5);
      }
      y+=7;
    });

    if(protocolo.ejecucion?.fecha_fin){
      ck(7);
      doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(0,140,70);
      doc.text('✓ Completado: '+fFechaCorta(protocolo.ejecucion.fecha_fin), M, y+4);
      y+=8;
    }
    y+=3;
  }

  // ── 8. COTIZACIÓN ─────────────────────────────────────────────
  if(cotizacion){
    ck(10);
    doc.setFillColor(0,120,60); doc.rect(M,y,CW,7,'F');
    doc.setFillColor(0,160,80); doc.rect(M,y,2,7,'F');
    doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
    doc.text('COTIZACIÓN: '+(cotizacion.cotizacion_id||'—'), M+4, y+5);
    const stC={enviada:C.azulL,aceptada:C.verde,rechazada:C.rojo,vencida:C.naranja}[cotizacion.status]||C.gris;
    doc.setFillColor(...stC.map(v=>Math.min(255,v+80)));
    doc.roundedRect(W-M-24,y+1,24,5,1,1,'F');
    doc.setFontSize(6); doc.text((cotizacion.status||'').toUpperCase(),W-M-12,y+4.5,{align:'center'});
    y+=10;

    // Info en 2 col
    cf2([
      ['EMPRESA',  cotizacion.empresa],
      ['FORMA PAGO',cotizacion.forma_pago],
      ['CONTACTO', cotizacion.nombre],
      ['PLAZO',    cotizacion.plazo_entrega],
      ['GARANTÍA', cotizacion.garantia],
      ['OC',       cotizacion.orden_compra],
    ]);
    y+=3;

    // Tabla items compacta
    const items=(cotizacion.cotizacion_items||[]).sort((a,b)=>a.orden-b.orden);
    if(items.length){
      ck(8);
      const cw=[CW-58,10,22,12,14];
      const cx=[M,M+cw[0],M+cw[0]+cw[1],M+cw[0]+cw[1]+cw[2],M+cw[0]+cw[1]+cw[2]+cw[3]];
      doc.setFillColor(0,82,155); doc.rect(M,y,CW,6,'F');
      ['DESCRIPCIÓN','CANT','V.UNIT','%','TOTAL'].forEach((h,i)=>{
        doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
        doc.text(h, i===0?cx[i]+1:cx[i]+cw[i]-1, y+4.5, {align:i===0?'left':'right'});
      });
      y+=7;
      items.forEach((it,idx)=>{
        ck(6);
        if(idx%2===0){doc.setFillColor(...C.grisBG);doc.rect(M,y-0.5,CW,6,'F');}
        const vs=[it.descripcion||'—',String(it.cantidad||1),'$'+fNum(it.valor_unitario||0),(it.descuento_pct||0)+'%','$'+fNum(it.valor_total||0)];
        vs.forEach((v,i)=>{
          doc.setFontSize(i===4?7.5:7); doc.setFont('helvetica',i===4?'bold':'normal');
          doc.setTextColor(i===4?0:60, i===4?130:70, i===4?70:90);
          doc.text(i===0?wrap(doc,v,cw[0]-2)[0]:v, i===0?cx[i]+1:cx[i]+cw[i]-1, y+4.5, {align:i===0?'left':'right'});
        });
        y+=6;
      });
      y+=3;
      // Totales compactos
      [['SUBTOTAL',cotizacion.subtotal||0,false],['IVA',cotizacion.total_iva||0,false],['TOTAL',cotizacion.total_final||0,true]].forEach(([l,v,b])=>{
        ck(6);
        if(b){doc.setFillColor(0,82,155);doc.rect(W-M-52,y-0.5,52,7,'F');doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);}
        else{doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(100,110,130);}
        doc.text(l+':', W-M-51, y+4.5);
        doc.setFont('helvetica','bold');
        doc.text('$'+fNum(v), W-M-1, y+4.5, {align:'right'});
        y+=b?8:6;
      });
    }
    if(cotizacion.firma_cliente){
      ck(20); y+=3;
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(0,140,70);
      doc.text('✓ Firmada por el cliente', M, y); y+=4;
      try{doc.addImage(cotizacion.firma_cliente,'PNG',M,y,50,14);y+=18;}catch(e){}
    }
    y+=3;
  }

  // ── FIRMA QR (si no hay protocolo) ───────────────────────────
  if(orden.firma_url){
    ck(22); y+=2;
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(0,82,155);
    doc.text('FIRMA DEL SOLICITANTE', M, y); y+=4;
    try{doc.addImage(orden.firma_url,'PNG',M,y,55,16);y+=20;}catch(e){}
  }

  // ── FOOTER ────────────────────────────────────────────────────
  const pages=doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setFillColor(...C.azul); doc.rect(0,285,W,12,'F');
    doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(180,205,240);
    doc.text('INFRAESTRUCTURA-IT · Sistema de Órdenes de Servicio v2.0 · Bogotá, Colombia',M,292);
    doc.text('Página '+i+' / '+pages,W-M,292,{align:'right'});
  }

  doc.save('OS-IIT-'+(orden.orden_id||'orden')+'-'+new Date().toISOString().slice(0,10)+'.pdf');
}

function cargarImgPDF(url){
  return new Promise((res,rej)=>{
    const img=new Image(); img.crossOrigin='anonymous';
    img.onload=()=>{const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;cv.getContext('2d').drawImage(img,0,0);res(cv.toDataURL('image/png'));};
    img.onerror=rej; img.src=url;
  });
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
