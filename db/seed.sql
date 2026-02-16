-- ===============================
-- SEED DATA
-- ===============================

-- Companies
INSERT INTO companies (name, license_number)
VALUES 
('GreenBuds Inc', 'LIC-001'),
('CannaCo', 'LIC-002');

-- Brands
INSERT INTO brands (name, description, company_id)
VALUES
('PureLeaf', 'High-quality premium brand', 1),
('HerbalGold', 'Affordable and reliable', 1),
('CannaPro', 'Top-shelf extracts', 2),
('BudMasters', 'Organic cannabis products', 2);

-- Strains
INSERT INTO strains (name, company_id, type, description)
VALUES
('Blue Dream', 1, 'Hybrid', 'Popular balanced hybrid'),
('OG Kush', 1, 'Indica', 'Classic indica strain'),
('Sour Diesel', 2, 'Sativa', 'Energetic sativa'),
('Northern Lights', 2, 'Indica', 'Relaxing and mellow');

-- Categories
INSERT INTO categories (name, description, company_id)
VALUES
('Flower', 'Cannabis flower buds', 1),
('Concentrates', 'Extracts and oils', 1),
('Edibles', 'Infused food products', 2),
('Topicals', 'Creams and balms', 2);

-- Users (passwords are placeholders)
-- Users
INSERT INTO users (company_id, first_name, last_name, email, password_hash, role)
VALUES
  (1, 'Alice', 'Green', 'alice@greenleaf.com', '$2b$10$fmR5a7oJNK4DsW3Z2ww7L.eNgbKSGQp7bZN9jXqeZi3X4JRYcdmu6', 'admin'),
  (1, 'Bob', 'Smith', 'bob@greenleaf.com', '$2b$10$fmR5a7oJNK4DsW3Z2ww7L.eNgbKSGQp7bZN9jXqeZi3X4JRYcdmu6', 'manager'),
  (2, 'Charlie', 'Jones', 'charlie@sunshine.com', '$2b$10$fmR5a7oJNK4DsW3Z2ww7L.eNgbKSGQp7bZN9jXqeZi3X4JRYcdmu6', 'staff'),
  (2, 'Billy', 'Jean', 'billyjean@sunshine.com', '$2b$10$fmR5a7oJNK4DsW3Z2ww7L.eNgbKSGQp7bZN9jXqeZi3X4JRYcdmu6', 'staff');

-- Products
INSERT INTO products (company_id, brand_id, strain_id, category_id, name, description, unit, sku)
VALUES
(1, 1, 1, 1, 'Blue Dream 1g', 'Premium Blue Dream flower', 'g', 'BD-001'),
(1, 2, 2, 2, 'OG Kush Wax 0.5g', 'OG Kush concentrate', 'g', 'OGK-005'),
(2, 3, 3, 3, 'Sour Diesel Gummies 10mg', 'Sativa infused edibles', 'each', 'SD-010'),
(2, 4, 4, 4, 'Northern Lights Cream', 'Relaxing topical cream', 'ml', 'NL-050');

-- Inventory
INSERT INTO packages (product_id, company_id, parent_lot_id,  location, status, quantity, package_size, unit, cost_price, supplier_name, lot_number)
VALUES
(1, 1, NULL, 'backroom', 'active', 10, 1, 'g', 8.50, 'Supplier A', 'BD0901'),
(1, 1, NULL, 'front', 'active', 5, 1, 'g', 8.50, 'Supplier A', 'BD0902'),
(2, 1, NULL, 'backroom', 'active', 3, 0.5, 'g', 15.00, 'Supplier B', 'OGK0501'),
(3, 2, NULL, 'cooler', 'active', 20, 10, 'mg', 1.50, 'Supplier C', 'SD1001'),
(4, 2, NULL, 'front', 'active', 10, 35, 'ml', 12.00, 'Supplier D', 'NL0501');

-- Inventory Movements
INSERT INTO inventory_movements (packages_id, user_id, movement_type, quantity, cost_per_unit, notes)
VALUES
(1, 1, 'receive', 10, 8.50, 'Initial stock received'),
(2, 2, 'receive', 5, 8.50, 'Front display replenished'),
(3, 1, 'receive', 3, 15.00, 'OG Kush concentrate received'),
(4, 3, 'receive', 20, 1.50, 'Sour Diesel gummies received'),
(5, 4, 'receive', 10, 12.00, 'Northern Lights cream received');