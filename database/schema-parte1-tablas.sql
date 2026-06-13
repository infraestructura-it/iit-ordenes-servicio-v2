-- ════════════════════════════════════════════════════════════
--  PARTE 1 — Ejecutar primero: Extensiones + Tablas
-- ════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

create table if not exists public.usuarios (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  nombre      text not null,
  rol         text not null check (rol in ('admin','tecnico','cliente')),
  activo      boolean default true,
  avatar_url  text,
  telefono    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists public.clientes (
  id              uuid default uuid_generate_v4() primary key,
  usuario_id      uuid references public.usuarios(id) on delete cascade,
  empresa         text not null,
  nit             text,
  direccion       text,
  ciudad          text,
  telefono        text,
  codigo_acceso   text unique not null,
  codigo_usado    boolean default false,
  created_at      timestamptz default now()
);

create table if not exists public.tecnicos (
  id              uuid default uuid_generate_v4() primary key,
  usuario_id      uuid references public.usuarios(id) on delete cascade,
  especialidades  text[] default '{}',
  disponible      boolean default true,
  created_at      timestamptz default now()
);

create table if not exists public.ordenes (
  id              uuid default uuid_generate_v4() primary key,
  orden_id        text unique not null,
  cliente_id      uuid references public.clientes(id),
  tecnico_id      uuid references public.tecnicos(id),
  nombre          text,
  empresa         text,
  telefono        text,
  correo          text,
  cargo           text,
  ciudad          text,
  departamento    text,
  direccion       text,
  referencia      text,
  persona_recibe  text,
  tipo_servicio   text,
  area            text,
  sintoma         text,
  prioridad       text check (prioridad in ('baja','media','alta','critica')),
  fecha_requerida date,
  hora_preferida  time,
  duracion        text,
  ventana         text,
  acceso          text,
  equipos         text[],
  marca           text,
  serie           text,
  obs_equipos     text,
  antecedentes    text,
  archivos        text,
  contrato        text,
  centro_costo    text,
  notas           text,
  firma_url       text,
  status          text default 'borrador' check (
                    status in ('borrador','pendiente','asignada',
                               'en_proceso','en_pausa','cerrada','cancelada')
                  ),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.historial_ordenes (
  id                uuid default uuid_generate_v4() primary key,
  orden_id          uuid references public.ordenes(id) on delete cascade,
  campo_modificado  text not null,
  valor_anterior    text,
  valor_nuevo       text,
  usuario_id        uuid references public.usuarios(id),
  created_at        timestamptz default now()
);

create table if not exists public.notas_internas (
  id              uuid default uuid_generate_v4() primary key,
  orden_id        uuid references public.ordenes(id) on delete cascade,
  usuario_id      uuid references public.usuarios(id),
  nota            text not null,
  visible_cliente boolean default false,
  created_at      timestamptz default now()
);

create table if not exists public.protocolos (
  id            uuid default uuid_generate_v4() primary key,
  nombre        text not null,
  equipo_tipo   text not null,
  descripcion   text,
  activo        boolean default true,
  created_by    uuid references public.usuarios(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.protocolo_campos (
  id            uuid default uuid_generate_v4() primary key,
  protocolo_id  uuid references public.protocolos(id) on delete cascade,
  orden         integer not null,
  etiqueta      text not null,
  tipo          text not null check (
                  tipo in ('texto','numero','si_no','lista',
                           'rango','fecha_hora','foto','firma')
                ),
  unidad        text,
  opciones      text[],
  rango_min     numeric,
  rango_max     numeric,
  requerido     boolean default false,
  activo        boolean default true
);

create table if not exists public.protocolo_ejecucion (
  id            uuid default uuid_generate_v4() primary key,
  orden_id      uuid references public.ordenes(id) on delete cascade,
  protocolo_id  uuid references public.protocolos(id),
  tecnico_id    uuid references public.tecnicos(id),
  status        text default 'pendiente' check (
                  status in ('pendiente','en_progreso','completado')
                ),
  firma_tecnico text,
  fecha_inicio  timestamptz,
  fecha_fin     timestamptz,
  created_at    timestamptz default now()
);

create table if not exists public.protocolo_respuestas (
  id              uuid default uuid_generate_v4() primary key,
  ejecucion_id    uuid references public.protocolo_ejecucion(id) on delete cascade,
  campo_id        uuid references public.protocolo_campos(id),
  valor_texto     text,
  valor_numero    numeric,
  valor_boolean   boolean,
  valor_opcion    text,
  valor_fecha     timestamptz,
  archivo_url     text,
  created_at      timestamptz default now()
);

create table if not exists public.notificaciones (
  id          uuid default uuid_generate_v4() primary key,
  usuario_id  uuid references public.usuarios(id) on delete cascade,
  orden_id    uuid references public.ordenes(id) on delete cascade,
  tipo        text not null check (
                tipo in ('nueva_orden','asignacion','cambio_estado',
                         'nota','protocolo_completado')
              ),
  titulo      text not null,
  mensaje     text,
  leida       boolean default false,
  created_at  timestamptz default now()
);

-- ════════════════════════════════════════════════════════════
-- Constraints y hardening agregados 2026-06-12 (issues #1 y #5)
-- ════════════════════════════════════════════════════════════
alter table public.protocolo_ejecucion
  add constraint uq_ejecucion_orden_protocolo unique (orden_id, protocolo_id);
alter table public.tecnicos add constraint uq_tecnicos_usuario unique (usuario_id);
alter table public.clientes add constraint uq_clientes_usuario unique (usuario_id);
alter function public.get_rol() set search_path = public;
alter function public.get_cliente_id() set search_path = public;
alter function public.get_tecnico_id() set search_path = public;

-- ════════════════════════════════════════════════════════════
-- Issue #8: Inventario de equipos por cliente (2026-06-12)
-- ════════════════════════════════════════════════════════════
create table if not exists public.equipos_cliente (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references public.clientes(id) on delete cascade,
  componente_id   uuid references public.componentes(id),
  tipo_equipo     text not null,
  marca           text,
  modelo          text,
  numero_serie    text,
  ubicacion       text,
  factura_url     text,
  fecha_instalacion date,
  estado          text not null default 'activo' check (
                    estado in ('activo','en_reparacion','retirado','garantia')
                  ),
  notas           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_equipos_cliente_cliente on public.equipos_cliente(cliente_id);
create index if not exists idx_equipos_cliente_componente on public.equipos_cliente(componente_id);

alter table public.equipos_cliente enable row level security;

create policy "equipos_cliente_select" on public.equipos_cliente
  for select using (
    public.get_rol() = 'admin'
    or (public.get_rol() = 'cliente' and cliente_id = public.get_cliente_id())
    or (public.get_rol() = 'tecnico' and exists (
          select 1 from public.ordenes o
          where o.equipo_id = equipos_cliente.id
            and o.tecnico_id = public.get_tecnico_id()
        ))
  );

create policy "equipos_cliente_insert" on public.equipos_cliente
  for insert with check (public.get_rol() = 'admin');

create policy "equipos_cliente_update" on public.equipos_cliente
  for update using (public.get_rol() = 'admin');

create policy "equipos_cliente_delete" on public.equipos_cliente
  for delete using (public.get_rol() = 'admin');

-- ordenes.equipo_id: vincula una orden a un equipo del inventario (opcional)
alter table public.ordenes
  add column if not exists equipo_id uuid references public.equipos_cliente(id);

create index if not exists idx_ordenes_equipo on public.ordenes(equipo_id);
