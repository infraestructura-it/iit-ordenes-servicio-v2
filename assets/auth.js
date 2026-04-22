// ════════════════════════════════════════════════════════════════
//  IIT Órdenes de Servicio v2 — assets/auth.js
//  Protección de rutas + manejo de sesión activa
// ════════════════════════════════════════════════════════════════

// Usuario global en memoria
let _usuario = null;

// ── Inicializar sesión en cualquier página ────────────────────────
async function initAuth(rolRequerido = null) {
  const session = await Auth.getSession();

  if (!session) {
    window.location.href = '/iit-ordenes-servicio-v2/login.html';
    return null;
  }

  _usuario = await Auth.getUser();

  if (!_usuario || !_usuario.activo) {
    await db.auth.signOut();
    window.location.href = '/iit-ordenes-servicio-v2/login.html';
    return null;
  }

  // Verificar rol
  if (rolRequerido && _usuario.rol !== rolRequerido && _usuario.rol !== 'admin') {
    Auth.redirectByRol(_usuario.rol);
    return null;
  }

  // Renderizar info de usuario en topbar si existe
  renderUserInfo(_usuario);

  // Iniciar listener de notificaciones
  initNotificaciones(_usuario.id);

  return _usuario;
}

// ── Renderizar info del usuario en el topbar ──────────────────────
function renderUserInfo(user) {
  const el = document.getElementById('userInfo');
  if (!el) return;

  const rolLabel = { admin: 'Administrador', tecnico: 'Técnico', cliente: 'Cliente' };
  const rolColor = { admin: '#00d4ff', tecnico: '#0077ff', cliente: '#00e5a0' };

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="text-align:right;">
        <div style="font-size:13px;font-weight:600;color:var(--text);">${user.nombre}</div>
        <div style="font-size:10px;color:${rolColor[user.rol]};letter-spacing:1px;">
          ${rolLabel[user.rol] || user.rol}
        </div>
      </div>
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:linear-gradient(135deg,#0077ff,#00d4ff);
        display:flex;align-items:center;justify-content:center;
        font-weight:700;font-size:14px;color:#080b10;
        flex-shrink:0;
      ">${user.nombre.charAt(0).toUpperCase()}</div>
      <button onclick="Auth.logout()" style="
        background:none;border:1px solid var(--border);
        border-radius:6px;padding:6px 10px;
        color:var(--muted);cursor:pointer;font-size:11px;
        font-family:'DM Mono',monospace;letter-spacing:0.5px;
        transition:all 0.2s;
      " onmouseover="this.style.borderColor='var(--error)';this.style.color='var(--error)'"
         onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">
        SALIR
      </button>
    </div>
  `;
}

// ── Notificaciones en tiempo real ─────────────────────────────────
function initNotificaciones(usuarioId) {
  // Cargar conteo inicial
  actualizarConteoNotif(usuarioId);

  // Suscribir a nuevas notificaciones
  Notificaciones.suscribir(usuarioId, (payload) => {
    actualizarConteoNotif(usuarioId);
    mostrarToastNotif(payload.new);
  });
}

async function actualizarConteoNotif(usuarioId) {
  const notifs = await Notificaciones.getByUsuario(usuarioId);
  const noLeidas = notifs.filter(n => !n.leida).length;

  const badge = document.getElementById('notifBadge');
  if (!badge) return;

  badge.textContent = noLeidas;
  badge.style.display = noLeidas > 0 ? 'flex' : 'none';
}

function mostrarToastNotif(notif) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:var(--surface);border:1px solid var(--accent2);
    border-radius:10px;padding:14px 18px;max-width:320px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:slideIn 0.3s ease;font-family:'DM Mono',monospace;
  `;
  toast.innerHTML = `
    <div style="font-size:11px;color:var(--accent);letter-spacing:1px;margin-bottom:4px;">
      NUEVA NOTIFICACIÓN
    </div>
    <div style="font-size:13px;color:var(--text);font-weight:600;">${notif.titulo}</div>
    ${notif.mensaje ? `<div style="font-size:11px;color:var(--muted);margin-top:4px;">${notif.mensaje}</div>` : ''}
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// ── Obtener usuario en memoria ────────────────────────────────────
function getUsuarioActual() {
  return _usuario;
}
