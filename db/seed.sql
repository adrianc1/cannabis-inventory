-- Clear existing data in correct order

TRUNCATE inventory_movements, inventory, products, strains, brands, categories RESTART IDENTITY CASCADE;

-- =========================
-- BRANDS
-- =========================
INSERT INTO brands (name, description) VALUES
('Korova', 'Premium cannabis brand known for quality concentrates'),
('Ember Valley', 'High-quality flower and extract products'),
('Mary''s Medicinal', 'Organic, small-batch cannabis products')
ON CONFLICT (name) DO NOTHING;


-- =========================
-- STRAINS
-- =========================
INSERT INTO strains (name, type, description) VALUES
('Blue Dream', 'Hybrid', 'Sweet citrus flavor, relaxing body effect, energizing mental effect'),
('Sour Diesel', 'Sativa', 'Pungent aroma, energizing and uplifting effects'),
('Northern Lights', 'Indica', 'Earthy aroma, deeply relaxing, great for sleep')
ON CONFLICT (name) DO NOTHING;


-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name, description) VALUES
('Flower', 'Cannabis flower products'),
('Concentrates', 'Extracted cannabis products like wax and diamonds'),
('Edibles', 'Cannabis-infused edibles like gummies and chocolates')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;



-- =========================
-- PRODUCTS
-- =========================
INSERT INTO products (name, description, price, unit, brand_id, strain_id, category_id) VALUES
('Blue Dream 7g', 'Hybrid flower', 49.99, 'g', 1, 1, 1),
('Sour Diesel 3.5g', 'Sativa flower', 29.99, 'g', 2, 2, 1),
('Northern Lights 14g', 'Indica flower', 89.99, 'g', 3, 3, 1),
('Korova Diamonds', 'High-potency concentrate', 59.99, 'g', 1, 1, 2),
('Ember Valley Wax', 'Extracted cannabis wax', 39.99, 'g', 2, 2, 2),
('Mary''s Gummies 100mg', 'THC-infused gummies', 19.99, 'pack', 3, NULL, 3);

-- =========================
-- INVENTORY
-- =========================
INSERT INTO inventory (product_id, location, quantity, cost_price, supplier_name) VALUES
(1, 'backroom', 20, 25.00, 'Local Supplier'),
(2, 'backroom', 15, 15.00, 'Local Supplier'),
(3, 'backroom', 10, 45.00, 'Local Supplier'),
(4, 'backroom', 5, 35.00, 'Korova Inc.'),
(5, 'backroom', 8, 20.00, 'Ember Valley'),
(6, 'warehouse', 50, 10.00, 'Mary''s Medicinal');

INSERT INTO inventory_movements (inventory_id, movement_type, quantity, notes) VALUES
-- Initial stock
(1, 'restock', 20, 'Initial inventory'),
(2, 'restock', 15, 'Initial inventory'),
(3, 'restock', 10, 'Initial inventory'),
(4, 'restock', 5, 'Initial inventory'),
(5, 'restock', 8, 'Initial inventory'),
(6, 'restock', 50, 'Initial inventory'),
-- Some sales
(1, 'sale', -3, 'Customer purchase'),
(2, 'sale', -2, 'Customer purchase'),
(6, 'sale', -10, 'Bulk order'),
-- Adjustments/waste
(4, 'adjustment', -1, 'Damaged product'),
(5, 'waste', -1, 'Quality control failure');