-- Ejecutar en Supabase Studio > SQL Editor
-- Crea la tabla de ofertas del carrito y carga los datos iniciales del Excel.

CREATE TABLE IF NOT EXISTS cart_offers (
  id         BIGSERIAL PRIMARY KEY,
  umbral_minimo INTEGER NOT NULL,        -- total mínimo del carrito para desbloquear
  producto_slug TEXT    NOT NULL,        -- slug del producto en la tabla productos
  precio_oferta INTEGER NOT NULL,        -- precio rebajado
  activo     BOOLEAN NOT NULL DEFAULT true,
  orden      INTEGER NOT NULL DEFAULT 0  -- orden de aparición en el sidebar
);

-- Lectura pública (no se necesita auth para ver las ofertas)
ALTER TABLE cart_offers ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cart_offers' AND policyname = 'Public read'
  ) THEN
    CREATE POLICY "Public read" ON cart_offers FOR SELECT USING (true);
  END IF;
END $$;

-- ── Datos iniciales ────────────────────────────────────────────────────────────
-- IMPORTANTE: verifica que los slugs coincidan con los de tu tabla productos.
-- Puedes consultarlos con: SELECT nombre, slug FROM productos ORDER BY nombre;

INSERT INTO cart_offers (umbral_minimo, producto_slug, precio_oferta, activo, orden) VALUES
  (20000, 'porta-documento', 1990, true, 1),
  (20000, 'estuche',         1000, true, 2),
  (36000, 'tabaquera',       1000, true, 3),
  (36000, 'manta',           1000, true, 4),
  (50000, 'billetera',       1000, true, 5),
  (50000, 'banano-simple',   1000, true, 6)
ON CONFLICT DO NOTHING;
