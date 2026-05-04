// ════════════════════════════════════════════════════════
//  IIT — assets/pdf.js  v3 — Compacto y completo
// ════════════════════════════════════════════════════════

function cargarJsPDF(){
  return new Promise((res,rej)=>{
    if(window.jspdf) return res();
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload=res; s.onerror=rej; document.head.appendChild(s);
  });
}

function fNum(n){ return Math.round(n||0).toLocaleString('es-CO'); }
function fFechaCorta(iso){ if(!iso)return'—'; return new Date(iso).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}); }
function fFecha(iso){ if(!iso)return'—'; return new Date(iso).toLocaleString('es-CO',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function wrap(doc,t,w){ return doc.splitTextToSize(String(t||'—'),w); }

const LOGO_B64 = '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';

const PDF_STATUS_COLOR = {
  borrador:[130,130,130], pendiente:[210,120,0], asignada:[0,119,255],
  en_proceso:[0,150,180], en_pausa:[180,100,0], cerrada:[0,130,70], cancelada:[200,30,50]
};
const PDF_PRI_COLOR = {
  baja:[0,130,70], media:[210,120,0], alta:[200,30,50], critica:[200,30,50]
};

// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────────
async function exportarPDFOrden(orden, historial=[], protocolo=null, logoB64=null, cotizacion=null) {
  await cargarJsPDF();
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({unit:'mm',format:'a4'});
  const W=210, M=13, CW=W-M*2;
  let y=0;

  // Colores
  const AZ=[0,82,155], AZL=[0,119,255], NG=[20,20,30], GR=[90,100,120];
  const GRL=[200,210,225], BG=[247,249,252], BL=[255,255,255];
  const VD=[0,130,70], RJ=[200,30,50], OR=[210,120,0], MO=[100,40,180];

  const ck=(h=8)=>{ if(y+h>276){doc.addPage();y=13;} };

  // Sección header
  const sec=(t,col=AZ)=>{
    ck(7); doc.setFillColor(...col); doc.rect(M,y,CW,7,'F');
    doc.setFillColor(...col.map(v=>Math.min(255,v+50))); doc.rect(M,y,2,7,'F');
    doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
    doc.text(t.toUpperCase(),M+4,y+5); y+=9;
  };

  // Campo 2 columnas
  const cf2=(items)=>{
    const filas=[];
    for(let i=0;i<items.length;i+=2) filas.push([items[i],items[i+1]||null]);
    filas.forEach(([a,b])=>{
      if(!a[1]&&!b?.[1]) return;
      ck(6); const H2=CW/2-3;
      doc.setFillColor(...BG); doc.rect(M,y-0.5,CW,6,'F');
      [[a,M],[b&&b[1]?b:null,M+H2+6]].forEach(([item,x])=>{
        if(!item||!item[1]||item[1]==='—') return;
        doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(...GR);
        doc.text(String(item[0]),x+1,y+2.5);
        doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(...NG);
        doc.text(wrap(doc,String(item[1]),H2-20)[0],x+22,y+5);
      });
      y+=6;
    });
  };

  // Campo 1 columna
  const cf1=(label,val,alt=false)=>{
    if(!val||val==='—') return;
    const vl=wrap(doc,String(val),CW-42); const h=Math.max(6,vl.length*4.5);
    ck(h); if(alt){doc.setFillColor(...BG);doc.rect(M,y-0.5,CW,h+0.5,'F');}
    doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(...GR);
    doc.text(label,M+1,y+4);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(...NG);
    doc.text(vl,M+40,y+4); y+=h;
  };

  // ── HEADER ───────────────────────────────────────────────────
  doc.setFillColor(...AZ); doc.rect(0,0,W,36,'F');
  doc.setFillColor(...AZL); doc.rect(0,0,2,34,'F');

  // ── HEADER: Texto izquierda + QR derecha ──
  doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
  doc.text('Infraestructura-IT',M,15);
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(180,205,240);
  doc.text('SOPORTE & MANTENIMIENTO · BOGOTÁ, COLOMBIA',M,20);
  doc.text('Creada: '+fFechaCorta(orden.created_at),M,25);

  // ID y status
  doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
  doc.text(orden.orden_id||'—',W-M-32,13,{align:'right'});
  const sc=PDF_STATUS_COLOR[orden.status]||GR;
  doc.setFillColor(...sc); doc.roundedRect(W-M-50,17,30,7,1.5,1.5,'F');
  doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
  doc.text((orden.status||'').replace(/_/g,' ').toUpperCase(),W-M-35,22,{align:'center'});

  // QR grande centrado en el lado derecho del header
  if(orden.orden_id){
    try{
      const qrUrl='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+
        encodeURIComponent('https://infraestructura-it.github.io/iit-ordenes-servicio-v2/orden.html?orden='+orden.orden_id)+
        '&bgcolor=00529b&color=ffffff&margin=2';
      const qrImg=await cargarImgPDF(qrUrl);
      // QR a la derecha del header, centrado verticalmente
      doc.addImage(qrImg,'PNG',W-M-28,3,26,26);
      doc.setFontSize(5.5); doc.setFont('helvetica','normal'); doc.setTextColor(180,205,240);
      doc.text('ESCANEAR',W-M-15,30.5,{align:'center'});
    }catch(e){}
  }

  y=40;

  // Barra resumen
  doc.setFillColor(230,240,255); doc.rect(M,y,CW,8,'F');
  doc.setDrawColor(...GRL); doc.setLineWidth(0.15); doc.rect(M,y,CW,8,'S');
  const pc=PDF_PRI_COLOR[orden.prioridad]||GR;
  doc.setFillColor(...pc); doc.roundedRect(M+1,y+1.5,15,5,1,1,'F');
  doc.setFontSize(5.5); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
  doc.text((orden.prioridad||'—').toUpperCase(),M+8.5,y+5,{align:'center'});
  const ri=[orden.tipo_servicio||'—',orden.area||'—',orden.ciudad||'—',orden.tecnico_id?(orden.tecnicos?.usuarios?.nombre||'Asignado'):'⚠ Sin asignar'];
  ri.forEach((v,i)=>{
    const x=M+18+i*((CW-18)/4);
    doc.setFontSize(7); doc.setFont('helvetica',i===3&&!orden.tecnico_id?'bold':'normal');
    doc.setTextColor(i===3&&!orden.tecnico_id?180:50,i===3&&!orden.tecnico_id?80:60,i===3&&!orden.tecnico_id?0:100);
    doc.text(String(v).slice(0,22),x,y+5);
  });
  y+=11;

  // ── 1. SOLICITANTE & UBICACIÓN ────────────────────────────────
  sec('1. Solicitante & Ubicación');
  cf2([
    ['NOMBRE',orden.nombre],['EMPRESA',orden.empresa],
    ['CORREO',orden.correo],['TELÉFONO',orden.telefono],
    ['CIUDAD',orden.ciudad],['DIRECCIÓN',orden.direccion],
    ['CARGO',orden.cargo],['REFERENCIA',orden.referencia],
  ]);
  y+=3;

  // ── 2. SERVICIO ───────────────────────────────────────────────
  sec('2. Descripción del Servicio');
  cf2([
    ['TIPO',orden.tipo_servicio],['FECHA REQ.',fFechaCorta(orden.fecha_requerida)],
    ['ÁREA',orden.area],['HORA PREF.',orden.hora_preferida],
  ]);
  if(orden.sintoma){
    ck(14); const sL=wrap(doc,orden.sintoma,CW-4); const sh=sL.length*4.5+6;
    doc.setFillColor(238,244,255); doc.roundedRect(M,y,CW,sh,1,1,'F');
    doc.setFillColor(...AZL); doc.rect(M,y,2,sh,'F');
    doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(...GR); doc.text('SÍNTOMA:',M+3,y+4);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(...NG); doc.text(sL,M+3,y+8);
    y+=sh+3;
  }
  y+=3;

  // ── 3. EQUIPOS ────────────────────────────────────────────────
  if(orden.marca||orden.serie||orden.equipos?.length||orden.obs_equipos){
    sec('3. Equipos');
    cf2([
      ['MARCA/MOD.',orden.marca],['No. SERIE',orden.serie],
      ['EQUIPOS',orden.equipos?.join(', ')],['OBS.',orden.obs_equipos],
    ]);
    y+=3;
  }

  // ── 4. ADICIONAL ─────────────────────────────────────────────
  if(orden.notas||orden.antecedentes||orden.contrato){
    sec('4. Información Adicional');
    cf1('NOTAS',orden.notas);
    cf1('ANTECEDENTES',orden.antecedentes,true);
    cf1('CONTRATO/OC',orden.contrato);
    y+=3;
  }

  // ── 5. HISTORIAL ─────────────────────────────────────────────
  if(historial?.length){
    sec('5. Historial');
    historial.slice(0,5).forEach((h,i)=>{
      ck(6); if(i%2===0){doc.setFillColor(...BG);doc.rect(M,y-0.5,CW,6,'F');}
      doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(...GR);
      doc.text(fFechaCorta(h.created_at),M+1,y+4.5);
      const det=(h.campo_modificado||h.campo||'')+(h.valor_anterior?': '+h.valor_anterior+' → '+(h.valor_nuevo||''):' '+(h.valor_nuevo||''));
      doc.setTextColor(...NG); doc.text(wrap(doc,det,CW-30)[0],M+30,y+4.5);
      const usr=h.usuarios?.nombre||'';
      if(usr){doc.setTextColor(...GR);doc.text(usr.slice(0,15),W-M-1,y+4.5,{align:'right'});}
      y+=6;
    });
    y+=3;
  }

  // ── 6. PROTOCOLO ─────────────────────────────────────────────
  if(protocolo?.campos?.length){
    const stP=protocolo.ejecucion?.status||'pendiente';
    const stPC={completado:VD,en_progreso:AZL,pendiente:OR}[stP]||GR;
    ck(10);
    doc.setFillColor(...MO); doc.rect(M,y,CW,8,'F');
    doc.setFillColor(130,60,210); doc.rect(M,y,2,8,'F');
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
    const protoNombre=(protocolo.ejecucion?.protocolos?.nombre||'Protocolo').slice(0,55);
    doc.text('PROTOCOLO: '+protoNombre.toUpperCase(),M+4,y+5.5);
    doc.setFillColor(...stPC); doc.roundedRect(W-M-24,y+1.5,24,5,1,1,'F');
    doc.setFontSize(6); doc.text(stP.replace(/_/g,' ').toUpperCase(),W-M-12,y+5,{align:'center'});
    y+=11;

    const respMap={};
    (protocolo.respuestas||[]).forEach(r=>{
      // Leer el valor de la columna correcta según tipo
      let val = r.valor;
      if(!val) {
        if(r.valor_texto)   val = r.valor_texto;
        else if(r.valor_numero!==null&&r.valor_numero!==undefined) val = String(r.valor_numero);
        else if(r.valor_boolean!==null&&r.valor_boolean!==undefined) val = r.valor_boolean?'si':'no';
        else if(r.valor_opcion) val = r.valor_opcion;
        else if(r.valor_fecha)  val = new Date(r.valor_fecha).toLocaleDateString('es-CO');
        else if(r.archivo_url)  val = r.archivo_url;
      }
      respMap[r.campo_id] = val;
    });

    const tipoL={texto:'Texto',numero:'Núm.',si_no:'Sí/No',lista:'Lista',rango:'Rango',foto:'Foto',firma:'Firma',fecha_hora:'Fecha'};

    protocolo.campos.forEach((campo,i)=>{
      const val=respMap[campo.id];
      const tipo=campo.tipo;
      const unidad=campo.unidad?' ('+campo.unidad+')':'';

      if(tipo==='foto'&&val){
        ck(28); doc.setFillColor(...BG); doc.rect(M,y-0.5,CW,30,'F');
        doc.setFillColor(...MO); doc.rect(M,y-0.5,2,30,'F');
        doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(...NG);
        doc.text((i+1)+'. '+campo.etiqueta,M+4,y+4.5);
        try{doc.addImage(val,'PNG',M+4,y+6,40,22);}catch(e){
          doc.setFontSize(7); doc.setTextColor(...GR); doc.text('[Foto adjunta]',M+4,y+16);
        }
        y+=31; return;
      }
      if(tipo==='firma'&&val){
        ck(20); doc.setFillColor(...BG); doc.rect(M,y-0.5,CW,20,'F');
        doc.setFillColor(...MO); doc.rect(M,y-0.5,2,20,'F');
        doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(...NG);
        doc.text((i+1)+'. '+campo.etiqueta,M+4,y+4.5);
        try{doc.addImage(val,'PNG',M+4,y+6,55,12);}catch(e){
          doc.setFontSize(7); doc.setTextColor(...GR); doc.text('[Firma adjunta]',M+4,y+14);
        }
        y+=21; return;
      }

      ck(7); if(i%2===0){doc.setFillColor(...BG);doc.rect(M,y-0.5,CW,7,'F');}
      const barColor = val ? MO : [200,200,210];
      doc.setFillColor(...barColor); doc.rect(M,y-0.5,2,7,'F');

      // Número
      doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(...MO);
      doc.text(String(i+1),M+5,y+5,{align:'center'});

      // Etiqueta
      doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(...NG);
      doc.text((campo.etiqueta+unidad).slice(0,35),M+9,y+5);

      // Tipo
      doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(...GR);
      doc.text(tipoL[tipo]||tipo,M+9+doc.getTextWidth((campo.etiqueta+unidad).slice(0,35))+2,y+5);

      // Valor — siempre en la derecha bien visible
      if(val!==undefined && val!==null && val!==''){
        if(tipo==='si_no'){
          const vc=val==='si'?VD:RJ;
          doc.setFillColor(...vc); doc.roundedRect(W-M-18,y+1,18,5,1,1,'F');
          doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
          doc.text(val==='si'?'✓ SÍ':'✗ NO',W-M-9,y+4.5,{align:'center'});
        } else {
          doc.setFontSize(8.5); doc.setFont('helvetica','bold'); doc.setTextColor(...AZ);
          doc.text(wrap(doc,String(val),38)[0],W-M-1,y+5,{align:'right'});
        }
      } else {
        doc.setFontSize(7); doc.setFont('helvetica','italic'); doc.setTextColor(180,180,200);
        doc.text('sin respuesta',W-M-1,y+5,{align:'right'});
      }
      y+=7;
    });

    if(protocolo.ejecucion?.fecha_fin){
      ck(6); doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(...VD);
      doc.text('✓ Completado: '+fFechaCorta(protocolo.ejecucion.fecha_fin),M,y+4); y+=7;
    }
    y+=3;
  }

  // ── 7. COTIZACIÓN ─────────────────────────────────────────────
  if(cotizacion){
    ck(10); doc.setFillColor(...VD); doc.rect(M,y,CW,8,'F');
    doc.setFillColor(0,160,80); doc.rect(M,y,2,8,'F');
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
    doc.text('COTIZACIÓN: '+(cotizacion.cotizacion_id||'—'),M+4,y+5.5);
    const stC={enviada:AZL,aceptada:VD,rechazada:RJ,vencida:OR}[cotizacion.status]||GR;
    doc.setFillColor(...stC); doc.roundedRect(W-M-24,y+1.5,24,5,1,1,'F');
    doc.setFontSize(6); doc.text((cotizacion.status||'').toUpperCase(),W-M-12,y+5,{align:'center'});
    y+=11;

    cf2([
      ['EMPRESA',cotizacion.empresa],['FORMA PAGO',cotizacion.forma_pago],
      ['CONTACTO',cotizacion.nombre],['PLAZO',cotizacion.plazo_entrega],
      ['GARANTÍA',cotizacion.garantia],['OC',cotizacion.orden_compra],
    ]);
    y+=3;

    const items=(cotizacion.cotizacion_items||[]).sort((a,b)=>a.orden-b.orden);
    if(items.length){
      ck(8);
      const cw=[CW-55,10,20,10,15]; const cx=[M];
      for(let i=1;i<cw.length;i++) cx.push(cx[i-1]+cw[i-1]);
      doc.setFillColor(...AZ); doc.rect(M,y,CW,6,'F');
      ['DESCRIPCIÓN','CANT','V.UNIT','%','TOTAL'].forEach((h,i)=>{
        doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(...BL);
        doc.text(h,i===0?cx[i]+1:cx[i]+cw[i]-1,y+4.5,{align:i===0?'left':'right'});
      });
      y+=7;
      items.forEach((it,idx)=>{
        ck(6); if(idx%2===0){doc.setFillColor(...BG);doc.rect(M,y-0.5,CW,6,'F');}
        const vs=[it.descripcion||'—',String(it.cantidad||1),'$'+fNum(it.valor_unitario||0),(it.descuento_pct||0)+'%','$'+fNum(it.valor_total||0)];
        vs.forEach((v,i)=>{
          doc.setFontSize(i===4?8:7); doc.setFont('helvetica',i===4?'bold':'normal');
          if(i===4) doc.setTextColor(...VD); else doc.setTextColor(...NG);
          doc.text(i===0?wrap(doc,v,cw[0]-2)[0]:v,i===0?cx[i]+1:cx[i]+cw[i]-1,y+4.5,{align:i===0?'left':'right'});
        });
        y+=6;
      });
      y+=3;
      [['Subtotal',cotizacion.subtotal||0,false],['IVA',cotizacion.total_iva||0,false],['TOTAL A PAGAR',cotizacion.total_final||0,true]].forEach(([l,v,b])=>{
        ck(7); if(b){doc.setFillColor(...AZ);doc.rect(W-M-52,y-0.5,52,7,'F');}
        doc.setFontSize(b?8:7); doc.setFont('helvetica','bold');
        if(b) doc.setTextColor(...BL); else doc.setTextColor(...GR);
        doc.text(l+':',W-M-50,y+4.5);
        doc.text('$'+fNum(v),W-M-1,y+4.5,{align:'right'});
        y+=b?8:6;
      });
    }
    if(cotizacion.firma_cliente){
      ck(22); y+=3;
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(...VD);
      doc.text('✓ Firmada por el cliente',M,y); y+=4;
      try{doc.addImage(cotizacion.firma_cliente,'PNG',M,y,50,15);y+=19;}catch(e){}
    }
    y+=3;
  }

  // ── FIRMA SOLICITANTE ─────────────────────────────────────────
  if(orden.firma_url){
    ck(22); y+=2;
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(...AZ);
    doc.text('FIRMA DEL SOLICITANTE',M,y); y+=4;
    try{doc.addImage(orden.firma_url,'PNG',M,y,55,16);y+=20;}catch(e){}
  }

  // ── FOOTER ────────────────────────────────────────────────────
  const pages=doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setFillColor(...AZ); doc.rect(0,284,W,13,'F');
    doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(180,205,240);
    doc.text('INFRAESTRUCTURA-IT · Sistema de Órdenes de Servicio v2.0 · Bogotá, Colombia',M,291);
    doc.text('Página '+i+' / '+pages,W-M,291,{align:'right'});
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
  y=40;

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
