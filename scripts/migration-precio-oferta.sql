-- Agrega columna precio_oferta a la tabla productos
-- Ejecutar en el editor SQL de Supabase

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS precio_oferta INTEGER;

-- precio_oferta = NULL significa "sin oferta"
-- precio_oferta = 19990 significa "precio rebajado a $19.990"
