-- =========================
-- BRANDS
-- =========================
INSERT INTO brands (name, description) VALUES
('Korova', 'Premium cannabis brand known for quality concentrates'),
('Ember Valley', 'High-quality flower and extract products'),
('Mary''s Medicinal', 'Organic, small-batch cannabis products');

-- =========================
-- STRAINS
-- =========================
INSERT INTO strains (name, type, description) VALUES
('Blue Dream', 'Hybrid', 'Sweet citrus flavor, relaxing body effect, energizing mental effect'),
('Sour Diesel', 'Sativa', 'Pungent aroma, energizing and uplifting effects'),
('Northern Lights', 'Indica', 'Earthy aroma, deeply relaxing, great for sleep');

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name, description) VALUES
('Flower', 'Cannabis flower products'),
('Concentrates', 'Extracted cannabis products like wax and diamonds'),
('Edibles', 'Cannabis-infused edibles like gummies and chocolates');

-- =========================
-- PRODUCTS
-- =========================
INSERT INTO products (name, description, price, quantity_on_hand, unit, brand_id, strain_id, category_id) VALUES
('Blue Dream 7g', 'Hybrid flower', 49.99, 20, 'g', 1, 1, 1),
('Sour Diesel 3.5g', 'Sativa flower', 29.99, 15, 'g', 2, 2, 1),
('Northern Lights 14g', 'Indica flower', 89.99, 10, 'g', 3, 3, 1),
('Korova Diamonds', 'High-potency concentrate', 59.99, 5, 'g', 1, 1, 2),
('Ember Valley Wax', 'Extracted cannabis wax', 39.99, 8, 'g', 2, 2, 2),
('Mary''s Gummies 100mg', 'THC-infused gummies', 19.99, 50, 'pack', 3, NULL, 3);

-- =========================
-- USERS
-- =========================
INSERT INTO users (name, email) VALUES
('Alice Smith', 'alice@example.com'),
('Bob Johnson', 'bob@example.com'),
('Charlie Lee', 'charlie@example.com');

-- =========================
-- ORDERS
-- =========================
INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES
(1, 1, 2, 99.98),   -- Alice bought 2 Blue Dream 7g
(2, 2, 1, 29.99),   -- Bob bought 1 Sour Diesel 3.5g
(3, 6, 3, 59.97),   -- Charlie bought 3 packs of Mary''s Gummies
(1, 4, 1, 59.99);   -- Alice bought 1 Korova Diamonds
