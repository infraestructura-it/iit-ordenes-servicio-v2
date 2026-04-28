-- ══════════════════════════════════════════════════════════════
--  IIT — Tabla orden_anexos
--  Vincula protocolos y cotizaciones a una orden
--  Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.orden_anexos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id      uuid REFERENCES public.ordenes(id) ON DELETE CASCADE,
  tipo          text NOT NULL CHECK (tipo IN ('protocolo','cotizacion')),
  protocolo_id  uuid REFERENCES public.protocolos(id) ON DELETE SET NULL,
  cotizacion_id uuid REFERENCES public.cotizaciones(id) ON DELETE SET NULL,
  creado_por    uuid REFERENCES public.usuarios(id),
  notas         text,
  created_at    timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.orden_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anexos_select" ON public.orden_anexos FOR SELECT USING (true);
CREATE POLICY "anexos_insert" ON public.orden_anexos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "anexos_delete" ON public.orden_anexos FOR DELETE USING (public.get_rol() = 'admin');
