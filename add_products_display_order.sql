-- Add sortable display order column for products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Backfill existing rows with stable order (oldest first)
WITH ordered_products AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS new_order
    FROM public.products
)
UPDATE public.products p
SET display_order = op.new_order
FROM ordered_products op
WHERE p.id = op.id
  AND (p.display_order IS NULL OR p.display_order = 0);

CREATE INDEX IF NOT EXISTS idx_products_display_order