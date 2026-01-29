-- Clear existing data in correct order

TRUNCATE inventory_movements, inventory, products, users, companies, strains, brands, categories RESTART IDENTITY CASCADE;


-- COMPANIES
INSERT INTO companies (name, license_number) VALUES
('Green Relief Dispensary', 'C10-0000123-LIC'),
('High Times Warehouse', 'C11-0000456-LIC');


-- USERS (Password is 'password123' hashed)
INSERT INTO users (first_name, last_name, email, password_hash, company_id, role) VALUES
('Alice', 'Owner', 'alice@greenrelief.com', '$2b$10$YourHashedPasswordHere', 1, 'admin'),
('Bob', 'Staff', 'bob@hightimes.com', '$2b$10$YourHashedPasswordHere', 2, 'staff');


-- BRANDS / STRAINS / CATEGORIES (Global)
INSERT INTO brands (name, description) VALUES
('Korova', 'Premium cannabis brand known for quality concentrates'),
('Ember Valley', 'High-quality flower and extract products'),
('Mary''s Medicinal', 'Organic, small-batch cannabis products')
ON CONFLICT (name) DO NOTHING;


INSERT INTO strains (name, type, description) VALUES
('Blue Dream', 'Hybrid', 'Sweet citrus flavor, relaxing body effect, energizing mental effect'),
('Sour Diesel', 'Sativa', 'Pungent aroma, energizing and uplifting effects'),
('Northern Lights', 'Indica', 'Earthy aroma, deeply relaxing, great for sleep')
ON CONFLICT (name) DO NOTHING;


INSERT INTO categories (name, description) VALUES
('Flower', 'Cannabis flower products'),
('Concentrates', 'Extracted cannabis products like wax and diamonds'),
('Edibles', 'Cannabis-infused edibles like gummies and chocolates')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;


-- PRODUCTS

INSERT INTO products (company_id, brand_id, strain_id, category_id, name, unit) VALUES
(1, 1, 1, 1, 'Blue Dream 7g', 'g'),
(1, 1, 1, 2, 'Korova Diamonds', 'g'),
(2, 2, 2, 1, 'Sour Diesel 3.5g', 'g');

-- Inventory Items
INSERT INTO inventory (product_id, company_id, quantity, cost_price, location) VALUES
(1, 1, 20.000, 25.00, 'backroom'),
(2, 1, 5.000, 35.00, 'vault'),
(3, 2, 15.000, 15.00, 'backroom');


-- INVENTORY MOVEMENTS 

INSERT INTO inventory_movements (inventory_id, user_id, movement_type, quantity, notes) VALUES
(1, 1, 'restock', 20.000, 'Initial delivery'),
(3, 2, 'restock', 15.000, 'Initial delivery');