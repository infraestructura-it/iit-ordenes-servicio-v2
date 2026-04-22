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
