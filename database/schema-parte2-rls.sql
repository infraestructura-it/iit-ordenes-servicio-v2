-- ════════════════════════════════════════════════════════════
--  PARTE 2 — Ejecutar después de la Parte 1: RLS + Funciones
-- ════════════════════════════════════════════════════════════

-- ── Activar RLS ───────────────────────────────────────────────
alter table public.usuarios             enable row level security;
alter table public.clientes             enable row level security;
alter table public.tecnicos             enable row level security;
alter table public.ordenes              enable row level security;
alter table public.historial_ordenes    enable row level security;
alter table public.notas_internas       enable row level security;
alter table public.protocolos           enable row level security;
alter table public.protocolo_campos     enable row level security;
alter table public.protocolo_ejecucion  enable row level security;
alter table public.protocolo_respuestas enable row level security;
alter table public.notificaciones       enable row level security;

-- ── Funciones helper ──────────────────────────────────────────
create or replace function public.get_rol()
returns text
language sql
security definer
stable
as $$
  select u.rol
  from public.usuarios AS u
  where u.id = auth.uid()
  limit 1;
$$;

create or replace function public.get_cliente_id()
returns uuid
language sql
security definer
stable
as $$
  select c.id
  from public.clientes AS c
  where c.usuario_id = auth.uid()
  limit 1;
$$;

create or replace function public.get_tecnico_id()
returns uuid
language sql
security definer
stable
as $$
  select t.id
  from public.tecnicos AS t
  where t.usuario_id = auth.uid()
  limit 1;
$$;

-- ── Trigger updated_at ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_usuarios_updated
  before update on public.usuarios
  for each row execute function public.set_updated_at();

create trigger trg_ordenes_updated
  before update on public.ordenes
  for each row execute function public.set_updated_at();

create trigger trg_protocolos_updated
  before update on public.protocolos
  for each row execute function public.set_updated_at();

-- ── Políticas: usuarios ───────────────────────────────────────
create policy "usuarios_select"
  on public.usuarios for select
  using (id = auth.uid() or public.get_rol() = 'admin');

create policy "usuarios_all_admin"
  on public.usuarios for all
  using (public.get_rol() = 'admin');

-- ── Políticas: clientes ───────────────────────────────────────
create policy "clientes_select"
  on public.clientes for select
  using (usuario_id = auth.uid() or public.get_rol() = 'admin');

create policy "clientes_all_admin"
  on public.clientes for all
  using (public.get_rol() = 'admin');

-- ── Políticas: técnicos ───────────────────────────────────────
create policy "tecnicos_select"
  on public.tecnicos for select
  using (usuario_id = auth.uid() or public.get_rol() = 'admin');

create policy "tecnicos_all_admin"
  on public.tecnicos for all
  using (public.get_rol() = 'admin');

-- ── Políticas: órdenes ────────────────────────────────────────
create policy "ordenes_admin"
  on public.ordenes for all
  using (public.get_rol() = 'admin');

create policy "ordenes_tecnico_select"
  on public.ordenes for select
  using (
    public.get_rol() = 'tecnico'
    and tecnico_id = public.get_tecnico_id()
  );

create policy "ordenes_tecnico_update"
  on public.ordenes for update
  using (
    public.get_rol() = 'tecnico'
    and tecnico_id = public.get_tecnico_id()
  );

create policy "ordenes_cliente_select"
  on public.ordenes for select
  using (
    public.get_rol() = 'cliente'
    and cliente_id = public.get_cliente_id()
  );

create policy "ordenes_cliente_insert"
  on public.ordenes for insert
  with check (public.get_rol() = 'cliente');

-- ── Políticas: historial ──────────────────────────────────────
create policy "historial_admin"
  on public.historial_ordenes for all
  using (public.get_rol() = 'admin');

create policy "historial_tecnico"
  on public.historial_ordenes for select
  using (
    public.get_rol() = 'tecnico'
    and orden_id in (
      select o.id from public.ordenes o
      where o.tecnico_id = public.get_tecnico_id()
    )
  );

create policy "historial_cliente"
  on public.historial_ordenes for select
  using (
    public.get_rol() = 'cliente'
    and orden_id in (
      select o.id from public.ordenes o
      where o.cliente_id = public.get_cliente_id()
    )
  );

-- ── Políticas: notas internas ─────────────────────────────────
create policy "notas_admin"
  on public.notas_internas for all
  using (public.get_rol() = 'admin');

create policy "notas_tecnico"
  on public.notas_internas for all
  using (
    public.get_rol() = 'tecnico'
    and orden_id in (
      select o.id from public.ordenes o
      where o.tecnico_id = public.get_tecnico_id()
    )
  );

create policy "notas_cliente"
  on public.notas_internas for select
  using (
    public.get_rol() = 'cliente'
    and visible_cliente = true
    and orden_id in (
      select o.id from public.ordenes o
      where o.cliente_id = public.get_cliente_id()
    )
  );

-- ── Políticas: protocolos ─────────────────────────────────────
create policy "protocolos_select"
  on public.protocolos for select
  using (activo = true or public.get_rol() = 'admin');

create policy "protocolos_admin"
  on public.protocolos for all
  using (public.get_rol() = 'admin');

create policy "protocolo_campos_select"
  on public.protocolo_campos for select
  using (true);

create policy "protocolo_campos_admin"
  on public.protocolo_campos for all
  using (public.get_rol() = 'admin');

-- ── Políticas: ejecución ──────────────────────────────────────
create policy "ejecucion_admin"
  on public.protocolo_ejecucion for all
  using (public.get_rol() = 'admin');

create policy "ejecucion_tecnico"
  on public.protocolo_ejecucion for all
  using (
    public.get_rol() = 'tecnico'
    and tecnico_id = public.get_tecnico_id()
  );

create policy "ejecucion_cliente"
  on public.protocolo_ejecucion for select
  using (
    public.get_rol() = 'cliente'
    and orden_id in (
      select o.id from public.ordenes o
      where o.cliente_id = public.get_cliente_id()
    )
  );

-- ── Políticas: respuestas ─────────────────────────────────────
create policy "respuestas_admin"
  on public.protocolo_respuestas for all
  using (public.get_rol() = 'admin');

create policy "respuestas_tecnico"
  on public.protocolo_respuestas for all
  using (
    public.get_rol() = 'tecnico'
    and ejecucion_id in (
      select pe.id from public.protocolo_ejecucion pe
      where pe.tecnico_id = public.get_tecnico_id()
    )
  );

create policy "respuestas_cliente"
  on public.protocolo_respuestas for select
  using (
    public.get_rol() = 'cliente'
    and ejecucion_id in (
      select pe.id from public.protocolo_ejecucion pe
      join public.ordenes o on o.id = pe.orden_id
      where o.cliente_id = public.get_cliente_id()
    )
  );

-- ── Políticas: notificaciones ─────────────────────────────────
create policy "notificaciones_select"
  on public.notificaciones for select
  using (usuario_id = auth.uid());

create policy "notificaciones_admin"
  on public.notificaciones for all
  using (public.get_rol() = 'admin');

create policy "notificaciones_update"
  on public.notificaciones for update
  using (usuario_id = auth.uid());

-- ── Storage bucket ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('iit-archivos', 'iit-archivos', false)
on conflict (id) do nothing;

create policy "storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'iit-archivos' and auth.role() = 'authenticated');

create policy "storage_select"
  on storage.objects for select
  using (bucket_id = 'iit-archivos' and auth.role() = 'authenticated');

create policy "storage_delete"
  on storage.objects for delete
  using (bucket_id = 'iit-archivos' and public.get_rol() = 'admin');
