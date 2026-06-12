# CLAUDE.md — IIT Órdenes de Servicio v2

Contexto del proyecto para Claude (Code / chat). Leer completo antes de tocar código o SQL.

## Resumen

Sistema de tickets/órdenes de servicio de Infraestructura-IT (IIT) con 3 roles: **admin**, **tecnico**, **cliente**. Incluye protocolos de mantenimiento ejecutables, cotizaciones, inventario de componentes y módulo IA.

- **Deploy:** GitHub Pages → `https://infraestructura-it.github.io/iit-ordenes-servicio-v2/`
- **Repo:** `infraestructura-it/iit-ordenes-servicio-v2` (rama `main`)
- **Local:** `C:\Users\User01\OneDrive\2026-proyectos\iit-ordenes-servicio-v2\`
- **Último push de referencia:** 2026-05-03

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML/CSS/JS **vanilla** (sin frameworks, sin build) |
| Auth + DB + Storage | Supabase (`szvtqdvfxqwhubpqqfhk.supabase.co`) |
| Email | EmailJS |
| PDF | jsPDF (cliente) |
| Excel | SheetJS |
| IA | Claude API (módulos `admin/ia.html`, `admin/ia-protocolos.html`) |

La key en `assets/supabase.js` es la **publishable** (pública por diseño, seguridad vía RLS). La **secret key NUNCA va en el frontend ni en commits**.

## Estructura

```
index.html, login.html, orden.html, perfil.html   ← raíz pública
admin/      dashboard, orden, usuarios, protocolos, cotizaciones, componentes, ia, ia-protocolos
tecnico/    dashboard, orden, protocolo
cliente/    dashboard, orden, cotizaciones
assets/     supabase.js (cliente central + Auth helpers), auth.js, pdf.js, excel.js, theme.js
database/   schema-parte1-tablas.sql, schema-parte2-rls.sql,
            schema-cotizaciones.sql, schema-componentes.sql, schema-orden-anexos.sql
```

**Regla:** todo cambio de schema en Supabase debe reflejarse en `database/*.sql` en el mismo commit. Los SQL del repo son la fuente de verdad del estado de la DB.

## Base de datos — tablas y relaciones

```
auth.users ─1:1→ usuarios (id, rol: admin|tecnico|cliente)
usuarios ─1:1→ clientes (codigo_acceso único)
usuarios ─1:1→ tecnicos (especialidades[])

ordenes (orden_id texto único, ej: OS-IIT-IIT-260427-9770)
  ├─ cliente_id → clientes
  ├─ tecnico_id → tecnicos
  ├─ status: borrador|pendiente|asignada|en_proceso|en_pausa|cerrada|cancelada
  ├─ historial_ordenes (auditoría campo a campo)
  ├─ notas_internas (visible_cliente boolean)
  └─ orden_anexos (tipo: protocolo|cotizacion) ← tabla puente

protocolos ─1:N→ protocolo_campos (tipo: texto|numero|si_no|lista|rango|fecha_hora|foto|firma)
protocolo_ejecucion (orden_id + protocolo_id + tecnico_id, status: pendiente|en_progreso|completado)
  └─ protocolo_respuestas (⚠️ columnas tipadas: valor_texto, valor_numero,
       valor_boolean, valor_opcion, valor_fecha, archivo_url — NO existe columna `valor`)

cotizaciones (cotizacion_id ej: CIT-260424-2965, status: borrador|enviada|aceptada|rechazada|vencida)
  └─ cotizacion_items (valor_total es GENERATED — nunca insertarlo/actualizarlo)

componentes (categoria: seguridad|computador|ups|cableado_electrico|cableado_estructurado|solar|otro)
notificaciones (tipo: nueva_orden|asignacion|cambio_estado|nota|protocolo_completado)
Storage: bucket privado `iit-archivos`
```

### Funciones RLS (security definer)

- `get_rol()` → rol del usuario autenticado
- `get_cliente_id()` / `get_tecnico_id()` → id de la fila en clientes/tecnicos vía `usuario_id = auth.uid()`

### Patrón de consultas entre tablas (Supabase JS)

```js
// Orden con cliente, técnico y anexos en una sola query
const { data } = await db.from('ordenes')
  .select(`*,
    clientes ( empresa, nit, usuarios ( nombre, email ) ),
    tecnicos ( especialidades, usuarios ( nombre ) ),
    orden_anexos ( tipo, protocolos ( nombre ), cotizaciones ( cotizacion_id, total_final ) )`)
  .eq('id', ordenUuid).single();

// Respuestas de un protocolo con definición de campo
const { data } = await db.from('protocolo_respuestas')
  .select(`*, protocolo_campos ( etiqueta, tipo, unidad, orden )`)
  .eq('ejecucion_id', ejecucionUuid);
```

## Convenciones de código

- **Prefijos `STATUS_LABEL`:** `pdf.js` declara variables globales que colisionan con scripts de página. Cada vista usa su prefijo: `CL_` (cliente/dashboard), `CLO_` (cliente/orden), `TC_` (tecnico/dashboard), `TO_` (tecnico/orden). **Nunca declarar `STATUS_LABEL` sin prefijo en HTML nuevos.**
- Rutas absolutas con base `/iit-ordenes-servicio-v2/` (GitHub Pages project site).
- JS embebido en cada HTML (single-file por vista); helpers compartidos solo en `assets/`.
- Commits en español, formato `tipo: descripción` (`feat:`, `fix:`, `docs:`, `sql:`).
- Identidad visual IIT: fondo `#080b10`, cian `#00d4ff`, verde `#10b981`, púrpura `#7c3aed`; tipografías Syne + Space Mono. Soporte dark/light vía `theme.js`.

## ⚠️ Issues abiertos (sesión 2026-05-03)

1. **RLS `protocolo_ejecucion` para técnico:** la política `ejecucion_tecnico` existe pero `get_tecnico_id()` retorna `null` desde el contexto auth del técnico, bloqueando lectura/guardado de sus propias ejecuciones. Workaround actual: traer todos los registros visibles y filtrar en JS (sin `.eq()`). **Hipótesis a verificar:** registros duplicados en `tecnicos` para un mismo `usuario_id` (el `limit 1` puede devolver el id equivocado) o `usuario_id` null en la fila del técnico.
2. **`protocolo_respuestas` con columnas tipadas:** el código debe mapear cada `tipo` de campo a su columna (`si_no`→`valor_boolean`, `lista`→`valor_opcion`, `rango`/`numero`→`valor_numero`, `fecha_hora`→`valor_fecha`, `foto`/`firma`→`archivo_url`, resto→`valor_texto`). Evaluar migración a columna única `valor jsonb`.
3. **Políticas laxas pendientes de endurecer:** `cotizaciones_select`, `items_select`, `anexos_select` y `hist_cot_select` usan `using (true)` — cualquier usuario autenticado (y anónimo en select) ve todo. Restringir por rol/cliente cuando se estabilice el flujo.
4. **PDFs de prueba commiteados** en `admin/` y `tecnico/` (`OS-IIT-*.pdf`, `COT-*.pdf`) — limpiar del repo y agregar `*.pdf` a `.gitignore`.
5. **Duplicados de técnicos** detectados previamente causando dashboards vacíos — agregar constraint `unique(usuario_id)` en `tecnicos` y `clientes` tras depurar datos.

## Flujo de trabajo

1. Cambios SQL → ejecutar en Supabase SQL Editor **y** actualizar `database/*.sql`.
2. Cambios frontend → editar local, probar, luego:
   ```powershell
   git add .
   git commit -m "fix: descripción"
   git push
   ```
3. GitHub Pages publica `main` automáticamente (~1 min).
4. Diagnóstico RLS: probar la query como admin primero; si funciona como admin pero no como técnico/cliente, es política o función helper, no el código.
