// ══════════════════════════════════════════════════════
//  IIT Órdenes de Servicio v2 — Sistema de Temas
//  Uso: <script src="../assets/theme.js"></script>
//       o <script src="assets/theme.js"></script>
// ══════════════════════════════════════════════════════

(function() {
  const STORAGE_KEY = 'iit-theme';

  // Aplicar tema guardado inmediatamente (antes del render)
  const temaGuardado = localStorage.getItem(STORAGE_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', temaGuardado);

  // Crear botón toggle y agregarlo al topbar cuando el DOM esté listo
  function inyectarToggle() {
    const topbar = document.querySelector('.topbar');
    if (!topbar || document.getElementById('themeToggle')) return;

    const btn = document.createElement('button');
    btn.id = 'themeToggle';
    btn.title = 'Cambiar tema';
    btn.setAttribute('aria-label', 'Cambiar tema claro/oscuro');
    actualizarBoton(btn, document.documentElement.getAttribute('data-theme'));

    btn.addEventListener('click', () => {
      const actual = document.documentElement.getAttribute('data-theme');
      const nuevo  = actual === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nuevo);
      localStorage.setItem(STORAGE_KEY, nuevo);
      actualizarBoton(btn, nuevo);
    });

    // Insertar antes del userInfo si existe, sino al final
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      topbar.insertBefore(btn, userInfo);
    } else {
      topbar.appendChild(btn);
    }
  }

  function actualizarBoton(btn, tema) {
    if (tema === 'light') {
      btn.innerHTML = '🌙';
      btn.title = 'Cambiar a modo oscuro';
    } else {
      btn.innerHTML = '☀️';
      btn.title = 'Cambiar a modo claro';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inyectarToggle);
  } else {
    inyectarToggle();
  }
})();
