-- CLEAN SLATE
DROP TABLE inventory_movements CASCADE;
DROP TABLE inventory CASCADE;
DROP TABLE products CASCADE;
DROP TABLE users CASCADE;
DROP TABLE brands CASCADE;
DROP TABLE strains CASCADE;
DROP TABLE categories CASCADE;
DROP TABLE companies CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS inventory_status CASCADE;
DROP TYPE IF EXISTS inventory_location CASCADE;
DROP TYPE IF EXISTS unit CASCADE;

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE inventory_status AS ENUM ('active','inactive','quarantine','damaged','expired','reserved');
CREATE TYPE inventory_location AS ENUM ('backroom', 'front', 'cooler', 'quarantine', 'safe');
CREATE TYPE unit AS ENUM ('mg','g','kg','oz','lb','ml','l','each');


CREATE TABLE companies (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE brands (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE strains (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) UNIQUE NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(50),
    description TEXT
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

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

-- Depends on Companies + Metadata
CREATE TABLE products (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    strain_id INTEGER REFERENCES strains(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit unit NOT NULL,
    sku VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (company_id, sku)
);

-- Depends on Products + Companies
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    location VARCHAR(255) DEFAULT 'backroom',
    status inventory_status NOT NULL DEFAULT 'active',
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2),
    supplier_name VARCHAR(255),
    lot_number VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, location, lot_number)
);

-- Audit Trail
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

