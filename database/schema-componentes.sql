-- ══════════════════════════════════════════════════════════════
--  IIT — Tabla componentes (base de productos/insumos)
--  Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.componentes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        text UNIQUE,
  nombre        text NOT NULL,
  descripcion   text,
  categoria     text NOT NULL CHECK (categoria IN (
    'seguridad',
    'computador',
    'ups',
    'cableado_electrico',
    'cableado_estructurado',
    'solar',
    'otro'
  )),
  marca         text,
  modelo        text,
  referencia    text,
  unidad        text DEFAULT 'und',
  precio_compra numeric(12,2) DEFAULT 0,
  precio_venta  numeric(12,2) DEFAULT 0,
  stock         integer DEFAULT 0,
  stock_minimo  integer DEFAULT 0,
  ubicacion     text,
  imagen_url    text,
  activo        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.componentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "componentes_select" ON public.componentes FOR SELECT USING (true);
CREATE POLICY "componentes_insert" ON public.componentes FOR INSERT WITH CHECK (public.get_rol() = 'admin');
CREATE POLICY "componentes_update" ON public.componentes FOR UPDATE USING (public.get_rol() = 'admin');
CREATE POLICY "componentes_delete" ON public.componentes FOR DELETE USING (public.get_rol() = 'admin');

-- Índices
CREATE INDEX IF NOT EXISTS idx_componentes_categoria ON public.componentes(categoria);
CREATE INDEX IF NOT EXISTS idx_componentes_activo ON public.componentes(activo);
CREATE INDEX IF NOT EXISTS idx_componentes_codigo ON public.componentes(codigo);
