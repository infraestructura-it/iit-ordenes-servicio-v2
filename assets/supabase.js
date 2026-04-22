// ════════════════════════════════════════════════════════════════
//  IIT Órdenes de Servicio v2 — assets/supabase.js
//  Conexión central + helpers para todas las vistas
// ════════════════════════════════════════════════════════════════

// ── CONFIG ────────────────────────────────────────────────────────
const SUPA_URL = 'https://szvtqdvfxqwhubpqqfhk.supabase.co';
const SUPA_KEY = 'sb_publishable_bZdHl96uaoS2nhHoPcE6pQ_YeFSyx30';

// ── CLIENTE SUPABASE ──────────────────────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPA_URL, SUPA_KEY);

// ════════════════════════════════════════════════════════════════
//  AUTH HELPERS
// ════════════════════════════════════════════════════════════════

const Auth = {

  // Iniciar sesión
  async login(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // Cerrar sesión
  async logout() {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    window.location.href = '/login.html';
  },

  // Obtener sesión actual
  async getSession() {
    const { data: { session } } = await db.auth.getSession();
    return session;
  },

  // Obtener usuario autenticado con su perfil
  async getUser() {
    const session = await Auth.getSession();
    if (!session) return null;

    const { data, error } = await db
      .from('usuarios')
      .select('*, clientes(*), tecnicos(*)')
      .eq('id', session.user.id)
      .single();

    if (error) return null;
    return data;
  },

  // Verificar sesión y redirigir si no existe
  async requireAuth(rolRequerido = null) {
    const session = await Auth.getSession();
    if (!session) {
      window.location.href = '/login.html';
      return null;
    }

    const user = await Auth.getUser();
    if (!user) {
      window.location.href = '/login.html';
      return null;
    }

    // Verificar rol si se especifica
    if (rolRequerido && user.rol !== rolRequerido && user.rol !== 'admin') {
      window.location.href = '/login.html';
      return null;
    }

    return user;
  },

  // Redirigir según rol
  redirectByRol(rol) {
    const rutas = {
      admin:   '/admin/dashboard.html',
      tecnico: '/tecnico/dashboard.html',
      cliente: '/cliente/dashboard.html'
    };
    window.location.href = rutas[rol] || '/login.html';
  }
};

// ════════════════════════════════════════════════════════════════
//  ÓRDENES HELPERS
// ════════════════════════════════════════════════════════════════

const Ordenes = {

  // Generar ID de orden
  generarId() {
    const d = new Date();
    const yy = d.getFullYear().toString().slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `IIT-${yy}${mm}${dd}-${rand}`;
  },

  // Crear orden nueva
  async crear(datos) {
    const { data, error } = await db
      .from('ordenes')
      .insert(datos)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Obtener todas (admin)
  async getAll(filtros = {}) {
    let query = db.from('ordenes')
      .select(`
        *,
        clientes(empresa, usuario_id, usuarios(nombre, email)),
        tecnicos(usuario_id, usuarios(nombre))
      `)
      .order('created_at', { ascending: false });

    if (filtros.status)     query = query.eq('status', filtros.status);
    if (filtros.prioridad)  query = query.eq('prioridad', filtros.prioridad);
    if (filtros.tecnico_id) query = query.eq('tecnico_id', filtros.tecnico_id);
    if (filtros.desde)      query = query.gte('created_at', filtros.desde);
    if (filtros.hasta)      query = query.lte('created_at', filtros.hasta);
    if (filtros.buscar)     query = query.or(
      `orden_id.ilike.%${filtros.buscar}%,nombre.ilike.%${filtros.buscar}%,empresa.ilike.%${filtros.buscar}%`
    );

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener una orden por ID
  async getById(id) {
    const { data, error } = await db
      .from('ordenes')
      .select(`
        *,
        clientes(empresa, codigo_acceso, usuarios(nombre, email, telefono)),
        tecnicos(especialidades, usuarios(nombre, email))
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Actualizar orden con historial
  async actualizar(id, cambios, usuarioId) {
    // Obtener datos actuales para historial
    const actual = await Ordenes.getById(id);

    // Registrar cambios en historial
    const historial = Object.entries(cambios)
      .filter(([campo, val]) => actual[campo] !== val)
      .map(([campo, val]) => ({
        orden_id:         id,
        campo_modificado: campo,
        valor_anterior:   String(actual[campo] ?? ''),
        valor_nuevo:      String(val ?? ''),
        usuario_id:       usuarioId
      }));

    if (historial.length > 0) {
      await db.from('historial_ordenes').insert(historial);
    }

    const { data, error } = await db
      .from('ordenes')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Asignar técnico
  async asignarTecnico(ordenId, tecnicoId, usuarioId) {
    return await Ordenes.actualizar(
      ordenId,
      { tecnico_id: tecnicoId, status: 'asignada' },
      usuarioId
    );
  },

  // Cambiar estado
  async cambiarStatus(ordenId, nuevoStatus, usuarioId) {
    return await Ordenes.actualizar(
      ordenId,
      { status: nuevoStatus },
      usuarioId
    );
  },

  // Obtener historial de una orden
  async getHistorial(ordenId) {
    const { data, error } = await db
      .from('historial_ordenes')
      .select('*, usuarios(nombre, rol)')
      .eq('orden_id', ordenId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Estadísticas para admin
  async getStats() {
    const { data, error } = await db
      .from('ordenes')
      .select('status, prioridad, created_at');
    if (error) throw error;

    const stats = {
      total:      data.length,
      borrador:   data.filter(o => o.status === 'borrador').length,
      pendiente:  data.filter(o => o.status === 'pendiente').length,
      asignada:   data.filter(o => o.status === 'asignada').length,
      en_proceso: data.filter(o => o.status === 'en_proceso').length,
      en_pausa:   data.filter(o => o.status === 'en_pausa').length,
      cerrada:    data.filter(o => o.status === 'cerrada').length,
      cancelada:  data.filter(o => o.status === 'cancelada').length,
      critica:    data.filter(o => o.prioridad === 'critica').length,
    };

    // Por mes (últimos 6 meses)
    const porMes = {};
    data.forEach(o => {
      const mes = o.created_at.slice(0, 7); // YYYY-MM
      porMes[mes] = (porMes[mes] || 0) + 1;
    });
    stats.porMes = porMes;

    return stats;
  }
};

// ════════════════════════════════════════════════════════════════
//  USUARIOS HELPERS
// ════════════════════════════════════════════════════════════════

const Usuarios = {

  // Listar todos (admin)
  async getAll() {
    const { data, error } = await db
      .from('usuarios')
      .select('*, clientes(*), tecnicos(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Listar técnicos activos
  async getTecnicos() {
    const { data, error } = await db
      .from('usuarios')
      .select('*, tecnicos(*)')
      .eq('rol', 'tecnico')
      .eq('activo', true);
    if (error) throw error;
    return data;
  },

  // Crear cliente con código de acceso
  async crearCliente(email, nombre, empresa, telefono) {
    // Generar código único
    const codigo = `IIT-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

    // Crear usuario en Auth (Supabase enviará email de confirmación)
    const { data: authData, error: authError } = await db.auth.admin.inviteUserByEmail(email);
    if (authError) throw authError;

    // Insertar perfil
    await db.from('usuarios').insert({
      id:     authData.user.id,
      email,
      nombre,
      rol:    'cliente',
      activo: true
    });

    // Insertar cliente
    const { data, error } = await db.from('clientes').insert({
      usuario_id:    authData.user.id,
      empresa,
      telefono,
      codigo_acceso: codigo
    }).select().single();

    if (error) throw error;
    return { ...data, codigo };
  },

  // Crear técnico
  async crearTecnico(email, nombre, especialidades) {
    const { data: authData, error: authError } = await db.auth.admin.inviteUserByEmail(email);
    if (authError) throw authError;

    await db.from('usuarios').insert({
      id:     authData.user.id,
      email,
      nombre,
      rol:    'tecnico',
      activo: true
    });

    const { data, error } = await db.from('tecnicos').insert({
      usuario_id:    authData.user.id,
      especialidades
    }).select().single();

    if (error) throw error;
    return data;
  },

  // Activar / desactivar usuario
  async toggleActivo(usuarioId, activo) {
    const { error } = await db
      .from('usuarios')
      .update({ activo })
      .eq('id', usuarioId);
    if (error) throw error;
  }
};

// ════════════════════════════════════════════════════════════════
//  NOTAS INTERNAS
// ════════════════════════════════════════════════════════════════

const Notas = {

  async getByOrden(ordenId) {
    const { data, error } = await db
      .from('notas_internas')
      .select('*, usuarios(nombre, rol)')
      .eq('orden_id', ordenId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async crear(ordenId, usuarioId, nota, visibleCliente = false) {
    const { data, error } = await db
      .from('notas_internas')
      .insert({ orden_id: ordenId, usuario_id: usuarioId, nota, visible_cliente: visibleCliente })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ════════════════════════════════════════════════════════════════
//  PROTOCOLOS HELPERS
// ════════════════════════════════════════════════════════════════

const Protocolos = {

  // Listar plantillas
  async getAll() {
    const { data, error } = await db
      .from('protocolos')
      .select('*, protocolo_campos(*)')
      .order('nombre');
    if (error) throw error;
    return data;
  },

  // Obtener una plantilla con sus campos
  async getById(id) {
    const { data, error } = await db
      .from('protocolos')
      .select('*, protocolo_campos(*)')
      .eq('id', id)
      .order('orden', { foreignTable: 'protocolo_campos' })
      .single();
    if (error) throw error;
    return data;
  },

  // Crear plantilla
  async crear(nombre, equipoTipo, descripcion, campos, usuarioId) {
    const { data: proto, error } = await db
      .from('protocolos')
      .insert({ nombre, equipo_tipo: equipoTipo, descripcion, created_by: usuarioId })
      .select()
      .single();
    if (error) throw error;

    // Insertar campos
    const camposData = campos.map((c, i) => ({ ...c, protocolo_id: proto.id, orden: i + 1 }));
    await db.from('protocolo_campos').insert(camposData);

    return proto;
  },

  // Iniciar ejecución de protocolo en una orden
  async iniciarEjecucion(ordenId, protocoloId, tecnicoId) {
    const { data, error } = await db
      .from('protocolo_ejecucion')
      .insert({
        orden_id:     ordenId,
        protocolo_id: protocoloId,
        tecnico_id:   tecnicoId,
        status:       'en_progreso',
        fecha_inicio: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Guardar respuesta de un campo
  async guardarRespuesta(ejecucionId, campoId, valor) {
    const { data, error } = await db
      .from('protocolo_respuestas')
      .upsert({
        ejecucion_id: ejecucionId,
        campo_id:     campoId,
        ...valor
      }, { onConflict: 'ejecucion_id,campo_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Completar ejecución
  async completar(ejecucionId, firmaBase64) {
    const { error } = await db
      .from('protocolo_ejecucion')
      .update({
        status:        'completado',
        firma_tecnico: firmaBase64,
        fecha_fin:     new Date().toISOString()
      })
      .eq('id', ejecucionId);
    if (error) throw error;
  },

  // Obtener ejecución con respuestas
  async getEjecucion(ordenId) {
    const { data, error } = await db
      .from('protocolo_ejecucion')
      .select(`
        *,
        protocolos(nombre, equipo_tipo),
        protocolo_respuestas(*, protocolo_campos(etiqueta, tipo, unidad))
      `)
      .eq('orden_id', ordenId)
      .single();
    if (error) return null;
    return data;
  }
};

// ════════════════════════════════════════════════════════════════
//  NOTIFICACIONES
// ════════════════════════════════════════════════════════════════

const Notificaciones = {

  async getByUsuario(usuarioId) {
    const { data, error } = await db
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  },

  async marcarLeida(id) {
    await db.from('notificaciones').update({ leida: true }).eq('id', id);
  },

  async marcarTodasLeidas(usuarioId) {
    await db.from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', usuarioId);
  },

  async crear(usuarioId, ordenId, tipo, titulo, mensaje) {
    const { error } = await db.from('notificaciones').insert({
      usuario_id: usuarioId,
      orden_id:   ordenId,
      tipo,
      titulo,
      mensaje
    });
    if (error) throw error;
  },

  // Suscribirse a notificaciones en tiempo real
  suscribir(usuarioId, callback) {
    return db
      .channel(`notif-${usuarioId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notificaciones',
        filter: `usuario_id=eq.${usuarioId}`
      }, callback)
      .subscribe();
  }
};

// ════════════════════════════════════════════════════════════════
//  STORAGE HELPERS
// ════════════════════════════════════════════════════════════════

const Storage = {

  // Subir archivo (foto de protocolo, firma)
  async subir(archivo, ruta) {
    const { data, error } = await db.storage
      .from('iit-archivos')
      .upload(ruta, archivo, { upsert: true });
    if (error) throw error;
    return data;
  },

  // Obtener URL pública firmada
  async getUrl(ruta) {
    const { data } = await db.storage
      .from('iit-archivos')
      .createSignedUrl(ruta, 3600); // 1 hora
    return data?.signedUrl;
  },

  // Subir firma como base64
  async subirFirma(base64, ordenId, tipo = 'cliente') {
    const blob = await fetch(base64).then(r => r.blob());
    const ruta = `firmas/${ordenId}/${tipo}-${Date.now()}.png`;
    await Storage.subir(blob, ruta);
    return ruta;
  },

  // Subir foto de protocolo
  async subirFoto(archivo, ordenId, campoId) {
    const ext = archivo.name.split('.').pop();
    const ruta = `protocolos/${ordenId}/${campoId}-${Date.now()}.${ext}`;
    await Storage.subir(archivo, ruta);
    return ruta;
  }
};

// ════════════════════════════════════════════════════════════════
//  VALIDAR CÓDIGO DE ACCESO (sandbox)
// ════════════════════════════════════════════════════════════════

async function validarCodigoAcceso(codigo) {
  const { data, error } = await db
    .from('clientes')
    .select('*, usuarios(nombre, email)')
    .eq('codigo_acceso', codigo)
    .eq('codigo_usado', false)
    .single();

  if (error || !data) return null;
  return data;
}

// ════════════════════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════════════════════

const STATUS_LABEL = {
  borrador:   'Borrador',
  pendiente:  'Pendiente',
  asignada:   'Asignada',
  en_proceso: 'En Proceso',
  en_pausa:   'En Pausa',
  cerrada:    'Cerrada',
  cancelada:  'Cancelada'
};

const STATUS_COLOR = {
  borrador:   '#4a6070',
  pendiente:  '#ffb700',
  asignada:   '#0077ff',
  en_proceso: '#00d4ff',
  en_pausa:   '#ff8c00',
  cerrada:    '#00e5a0',
  cancelada:  '#ff4560'
};

const PRIORIDAD_COLOR = {
  baja:    '#00e5a0',
  media:   '#ffb700',
  alta:    '#ff4560',
  critica: '#ff4560'
};

function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatFechaCorta(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}
