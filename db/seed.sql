-- ============================
-- SEED DATA
-- ============================

-- COMPANY
INSERT INTO companies (name, license_number)
VALUES ('Green Valley Cannabis', 'C11-0001234-LIC');

-- BRANDS
INSERT INTO brands (name, description) VALUES
('HighLife Farms', 'Premium indoor flower'),
('Cloud Nine', 'Concentrates and vapes'),
('Evergreen', 'Value brand');

-- STRAINS
INSERT INTO strains (name, type, description) VALUES
('Blue Dream', 'Hybrid', 'Classic balanced hybrid'),
('Gelato', 'Hybrid', 'Sweet dessert strain'),
('OG Kush', 'Indica', 'Heavy relaxing effects');

-- CATEGORIES
INSERT INTO categories (name, description) VALUES
('Flower', 'Cannabis flower'),
('Vape', 'Cartridges and disposables'),
('Concentrate', 'Wax, shatter, live resin');

-- PRODUCTS
INSERT INTO products
(company_id, brand_id, strain_id, category_id, name, description, unit, sku)
VALUES
(1, 1, 1, 1, 'Blue Dream 3.5g', 'Premium indoor flower', '3.5g', 'BD35'),
(1, 1, 2, 1, 'Gelato 3.5g', 'Top shelf flower', '3.5g', 'GE35'),
(1, 2, 1, 2, 'Blue Dream Vape Cart', '1g cartridge', '1g', 'BDV1'),
(1, 3, 3, 1, 'OG Kush 7g', 'Smalls flower', '7g', 'OG7');

-- ADD USER
INSERT INTO users (first_name, last_name, email, password_hash, company_id, role)
VALUES ('Admin', 'User', 'admin@test.com', '$2b$10$mHQj1iK3zfe9AHxQLnRHB.vP3g16NlfaZV.tR/mZz6nVUHy.RFb2y', 1, 'admin');

-- INVENTORY
INSERT INTO inventory
(product_id, company_id, location, status, quantity, cost_price, supplier_name, lot_number)
VALUES
-- Active batches
(1, 1, 'backroom', 'active', 50, 8.00, 'HighLife Farms', 'LOT-BD-001'),
(2, 1, 'backroom', 'active', 40, 9.00, 'HighLife Farms', 'LOT-GE-002'),
(3, 1, 'backroom', 'active', 25, 12.00, 'Cloud Nine', 'LOT-VAPE-003'),
(4, 1, 'backroom', 'active', 30, 6.00, 'Evergreen', 'LOT-OG-004'),

-- Damaged batch
(1, 1, 'backroom', 'damaged', 5, 8.00, 'HighLife Farms', 'LOT-BD-005-DMG'),

-- Expired batch
(2, 1, 'backroom', 'expired', 3, 9.00, 'HighLife Farms', 'LOT-GE-006-EXP');

-- INVENTORY MOVEMENTS (initial receive)
INSERT INTO inventory_movements
(inventory_id, user_id, movement_type, quantity, cost_per_unit, notes)
VALUES
-- Active batches
(1, 1, 'receive', 50, 8.00, 'Initial stock'),
(2, 1, 'receive', 40, 9.00, 'Initial stock'),
(3, 1, 'receive', 25, 12.00, 'Initial stock'),
(4, 1, 'receive', 30, 6.00, 'Initial stock'),

-- Damaged batch
(5, 1, 'receive', 5, 8.00, 'Initial stock - damaged'),

-- Expired batch
(6, 1, 'receive', 3, 9.00, 'Initial stock - expired');