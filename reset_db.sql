-- CLEAN SLATE
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS strains CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- CREATE LEVEL 1 (Independent Tables)
CREATE TABLE companies (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE brands (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE strains (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50),
    description TEXT
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- CREATE LEVEL 2 (Depends on Companies)
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');

CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT NOW()
);

-- CREATE LEVEL 3 (Depends on Companies + Metadata)
CREATE TABLE products (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    strain_id INTEGER REFERENCES strains(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    sku VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (company_id, sku)
);

-- CREATE LEVEL 4 (Depends on Products + Companies)
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    location VARCHAR(255) DEFAULT 'backroom',
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2),
    supplier_name VARCHAR(255),
    lot_number VARCHAR(100),
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE (product_id, location, lot_number)
);

-- CREATE LEVEL 5 (Audit Trail)
CREATE TABLE inventory_movements (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    inventory_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    movement_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    cost_per_unit DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);