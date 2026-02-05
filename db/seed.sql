-- ==========================
-- SEED DATA
-- ==========================

-- Companies
INSERT INTO companies (name, license_number)
VALUES 
  ('GreenLeaf Co', 'CA-12345'),
  ('Sunshine Farms', 'CA-67890');

-- Brands
INSERT INTO brands (name, description)
VALUES
  ('Aurora', 'Premium cannabis flower brand'),
  ('Zen Extracts', 'Concentrates and oils');

-- Strains
INSERT INTO strains (name, type, description)
VALUES
  ('Blue Dream', 'Sativa', 'Popular uplifting hybrid'),
  ('Granddaddy Purple', 'Indica', 'Relaxing purple indica'),
  ('OG Kush', 'Hybrid', 'Classic hybrid with strong aroma');

-- Categories
INSERT INTO categories (name, description)
VALUES
  ('Flower', 'Loose flower or pre-rolls'),
  ('Concentrate', 'Oils, wax, shatter'),
  ('Edible', 'Food and drink infused products'),
  ('Vape', 'Vape cartridges and pens');

-- Users
INSERT INTO users (company_id, first_name, last_name, email, password_hash, role)
VALUES
  (1, 'Alice', 'Green', 'alice@greenleaf.com', '$2b$10$vwxChUp5b5Zen4EpjraEpeFMnOGyhxe7d/a8QbCCf/1cVLn00IwDu', 'admin'),
  (1, 'Bob', 'Smith', 'bob@greenleaf.com', '$2b$10$vwxChUp5b5Zen4EpjraEpeFMnOGyhxe7d/a8QbCCf/1cVLn00IwDu', 'manager'),
  (2, 'Charlie', 'Jones', 'charlie@sunshine.com', '$2b$10$vwxChUp5b5Zen4EpjraEpeFMnOGyhxe7d/a8QbCCf/1cVLn00IwDu', 'staff');

-- Products
INSERT INTO products (company_id, brand_id, strain_id, category_id, name, description, unit, sku)
VALUES
  (1, 1, 1, 1, 'Blue Dream 1g Jar', 'Single gram jar of Blue Dream flower', 'g', 'BD-1G'),
  (1, 1, 2, 1, 'Granddaddy Purple 3.5g Jar', '3.5 grams of Granddaddy Purple', 'g', 'GDP-35G'),
  (1, 2, NULL, 2, 'Zen THC Oil 500mg', '500mg THC oil', 'mg', 'ZEN-500MG'),
  (2, 1, 3, 1, 'OG Kush 7g Jar', '7 grams of OG Kush', 'g', 'OGK-7G');

-- Inventory
INSERT INTO inventory (product_id, company_id, location, status, quantity, cost_price, supplier_name, lot_number)
VALUES
  (1, 1, 'backroom', 'active', 50.000, 5.00, 'GreenLeaf Supplier', 'LOT-BD1'),
  (2, 1, 'backroom', 'active', 20.000, 20.00, 'GreenLeaf Supplier', 'LOT-GDP35'),
  (3, 1, 'backroom', 'active', 10.000, 30.00, 'Zen Labs', 'LOT-ZEN500'),
  (4, 2, 'main', 'active', 15.000, 8.50, 'Sunshine Farms', 'LOT-OGK7');

-- Inventory Movements
INSERT INTO inventory_movements (inventory_id, user_id, movement_type, quantity, cost_per_unit, notes)
VALUES
  (1, 1, 'initial_stock', 50.000, 5.00, 'Initial stock for Blue Dream 1g jars'),
  (2, 2, 'initial_stock', 20.000, 20.00, 'Initial stock for GDP 3.5g jars'),
  (3, 1, 'initial_stock', 10.000, 30.00, 'Zen THC Oil initial stock'),
  (4, 3, 'initial_stock', 15.000, 8.50, 'OG Kush 7g jars for Sunshine Farms');