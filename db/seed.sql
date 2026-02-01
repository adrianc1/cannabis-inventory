-- 1. Insert a Company (Needed for User and Product FKs)
INSERT INTO companies (name, license_number) 
VALUES ('Green Relief Co', 'C-12345-LIC');

-- 2. Insert Metadata (Brands, Strains, Categories)
INSERT INTO brands (name, description) VALUES ('Humboldt Farms', 'Organic outdoor flower');
INSERT INTO strains (name, type) VALUES ('OG Kush', 'Hybrid');
INSERT INTO categories (name) VALUES ('Flower');


-- 3. Insert a Product
INSERT INTO products (company_id, brand_id, strain_id, category_id, name, sku, unit)
VALUES (1, 1, 1, 1, 'OG Kush 3.5g Pre-pack', 'OGK-35-FLW', 'grams');

-- 4. Set Initial Inventory
INSERT INTO inventory (product_id, company_id, location, quantity, cost_price, lot_number)
VALUES (1, 1, 'Vault A', 500.000, 15.00, 'LOT-999-ABC');

-- 5. Log the Initial Movement (Audit Trail)
INSERT INTO inventory_movements (inventory_id, user_id, movement_type, quantity, notes)
VALUES (1, 1, 'INVENTORY_START', 500.000, 'Initial stock entry');