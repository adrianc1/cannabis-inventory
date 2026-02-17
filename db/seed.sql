-- =========================
-- COMPANIES
-- =========================
INSERT INTO companies (name, license_number)
VALUES
('Green Valley Farms', 'C11-0001234-LIC'),
('Smokey Mountain Cannabis', 'C11-0005678-LIC');

-- =========================
-- BRANDS
-- =========================
INSERT INTO brands (name, description, company_id)
VALUES
('Emerald Extracts', 'Premium cannabis extracts', 1),
('Golden State Flower', 'Indoor cultivated flower', 1);

-- =========================
-- STRAINS
-- =========================
INSERT INTO strains (name, company_id, type, description)
VALUES
('Blue Dream', 1, 'Hybrid', 'Balanced uplifting hybrid'),
('OG Kush', 1, 'Indica', 'Classic relaxing strain'),
('Sour Diesel', 1, 'Sativa', 'Energizing daytime strain');

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name, description, company_id)
VALUES
('Flower', 'Cannabis flower products', 1),
('Concentrate', 'Extracts and concentrates', 1),
('Edible', 'Infused edible products', 1);

-- =========================
-- USERS
-- =========================
INSERT INTO users
(company_id, first_name, last_name, email, password_hash, role)
VALUES
(1,'Alice','Admin','alice@gvf.com','$2b$10$.v93RcRcVwnMAQJmcK3SU.KxZeHxC2RS09w6cQBpxSXAZ7BsXctOa','admin'),
(1,'Mark','Manager','mark@gvf.com','$2b$10$.v93RcRcVwnMAQJmcK3SU.KxZeHxC2RS09w6cQBpxSXAZ7BsXctOa','manager'),
(2,'Sam','Staff','sam@gvf.com','$2b$10$.v93RcRcVwnMAQJmcK3SU.KxZeHxC2RS09w6cQBpxSXAZ7BsXctOa','staff');

-- =========================
-- PRODUCTS
-- =========================
INSERT INTO products
(company_id, brand_id, strain_id, category_id, name, description, unit, sku)
VALUES
(1, 2, 1, 1, 'Blue Dream 3.5g Flower', 'Indoor premium eighth', 'g', 'BD-3.5'),
(1, 2, 2, 1, 'OG Kush 1oz Flower', 'Top shelf ounce', 'g', 'OG-28'),
(1, 1, NULL, 2, 'Live Resin Cartridge', '1g vape cart', 'g', 'LR-1G');

-- =========================
-- BATCHES
-- =========================
INSERT INTO batches
(product_id, company_id, batch_number, total_quantity, unit, cost_per_unit, supplier_name)
VALUES
(1,1,'BD-BATCH-001', 1000.000,'g', 2.50,'Green Valley Grow'),
(2,1,'OG-BATCH-001', 2000.000,'g', 1.90,'Green Valley Grow'),
(3,1,'LR-BATCH-001', 500.000,'g', 6.00,'Emerald Extraction Lab');

-- =========================
-- PACKAGES
-- =========================

-- Blue Dream master package
INSERT INTO packages
(batch_id, product_id, company_id, quantity, package_size, unit,
 location, lot_number, supplier_name, cost_price)
VALUES
(1,1,1,1000.000,1000.000,'g','backroom','LOT-BD-001','Green Valley Grow',2.50);

-- Split packages (child lots)
INSERT INTO packages
(batch_id, product_id, company_id, parent_lot_id,
 quantity, package_size, unit, location, lot_number, cost_price)
VALUES
(1,1,1,1,500.000,3.5,'g','front','LOT-BD-001-A',2.50),
(1,1,1,1,500.000,3.5,'g','front','LOT-BD-001-B',2.50);

-- OG Kush package
INSERT INTO packages
(batch_id, product_id, company_id,
 quantity, package_size, unit, location, lot_number, cost_price)
VALUES
(2,2,1,2000.000,28,'g','backroom','LOT-OG-001',1.90);

-- Live Resin carts
INSERT INTO packages
(batch_id, product_id, company_id,
 quantity, package_size, unit, location, lot_number, cost_price)
VALUES
(3,3,1,500.000,1,'g','safe','LOT-LR-001',6.00);

-- =========================
-- INVENTORY MOVEMENTS
-- =========================
INSERT INTO inventory_movements
(packages_id, user_id, movement_type, quantity, cost_per_unit, notes)
VALUES
(1,1,'batch_created',1000.000,2.50,'Initial batch intake'),
(2,2,'split',500.000,2.50,'Split into retail packages'),
(3,2,'split',500.000,2.50,'Split into retail packages'),
(4,3,'transfer',2000.000,1.90,'Moved to storage'),
(5,1,'intake',500.000,6.00,'Received from extractor');