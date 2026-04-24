-- ══════════════════════════════════════════════════════════════
--  IIT Órdenes de Servicio v2 — Módulo Cotizaciones
--  Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- Tabla principal de cotizaciones
create table if not exists public.cotizaciones (
  id              uuid primary key default gen_random_uuid(),
  cotizacion_id   text not null,        -- CIT-260422-0001
  cliente_id      uuid references public.clientes(id),
  orden_id        uuid references public.ordenes(id),  -- vinculada a una OS (opcional)
  creada_por      uuid references public.usuarios(id), -- admin
  asesor          text,
  
  -- Datos cliente
  nombre          text,
  empresa         text,
  nit             text,
  contacto        text,
  ciudad          text,
  telefono        text,
  email           text,
  direccion       text,
  orden_compra    text,
  
  -- Condiciones
  plazo_entrega   text default 'INMEDIATA',
  forma_pago      text default 'Anticipado',
  garantia        text default '1 Año materiales',
  validez_dias    int  default 30,
  
  -- Porcentajes adicionales
  pct_administracion numeric(5,2) default 0,
  pct_imprevistos    numeric(5,2) default 0,
  pct_utilidad       numeric(5,2) default 0,

  -- Estado
  status          text default 'borrador'
                  check (status in ('borrador','enviada','aceptada','rechazada','vencida')),

  -- Totales calculados (guardados para referencia rápida)
  subtotal        numeric(14,2) default 0,
  total_iva       numeric(14,2) default 0,
  total_final     numeric(14,2) default 0,

  observaciones   text,
  notas_internas  text,
  fecha_vence     date,
  fecha_aceptacion timestamp,
  firma_cliente   text,  -- base64 del canvas de firma

  created_at      timestamp with time zone default now(),
  updated_at      timestamp with time zone default now()
);

-- Items de la cotización
create table if not exists public.cotizacion_items (
  id              uuid primary key default gen_random_uuid(),
  cotizacion_id   uuid references public.cotizaciones(id) on delete cascade,
  orden           int default 1,
  referencia      text,
  descripcion     text not null,
  cantidad        numeric(10,2) default 1,
  valor_unitario  numeric(14,2) default 0,
  descuento_pct   numeric(5,2)  default 0,
  iva_pct         numeric(5,2)  default 19,
  valor_total     numeric(14,2) generated always as (
    cantidad * valor_unitario * (1 - descuento_pct/100) * (1 + iva_pct/100)
  ) stored,
  created_at      timestamp with time zone default now()
);

-- Historial de cambios de cotización
create table if not exists public.historial_cotizaciones (
  id              uuid primary key default gen_random_uuid(),
  cotizacion_id   uuid references public.cotizaciones(id) on delete cascade,
  usuario_id      uuid references public.usuarios(id),
  campo           text,
  valor_anterior  text,
  valor_nuevo     text,
  created_at      timestamp with time zone default now()
);

-- RLS
alter table public.cotizaciones         enable row level security;
alter table public.cotizacion_items     enable row level security;
alter table public.historial_cotizaciones enable row level security;

-- Políticas cotizaciones
create policy "cotizaciones_select" on public.cotizaciones for select using (true);
create policy "cotizaciones_insert" on public.cotizaciones for insert with check (auth.role() = 'authenticated');
create policy "cotizaciones_update" on public.cotizaciones for update using (auth.role() = 'authenticated');
create policy "cotizaciones_delete" on public.cotizaciones for delete using (public.get_rol() = 'admin');

-- Políticas items
create policy "items_select" on public.cotizacion_items for select using (true);
create policy "items_insert" on public.cotizacion_items for insert with check (auth.role() = 'authenticated');
create policy "items_update" on public.cotizacion_items for update using (auth.role() = 'authenticated');
create policy "items_delete" on public.cotizacion_items for delete using (auth.role() = 'authenticated');

-- Políticas historial
create policy "hist_cot_select" on public.historial_cotizaciones for select using (true);
create policy "hist_cot_insert" on public.historial_cotizaciones for insert with check (auth.role() = 'authenticated');

-- Función para actualizar updated_at
create or replace function public.update_cotizacion_timestamp()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger cotizacion_updated
  before update on public.cotizaciones
  for each row execute function public.update_cotizacion_timestamp();
