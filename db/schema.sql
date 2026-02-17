-- CLEAN SLATE
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS strains CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS packages_status CASCADE;
DROP TYPE IF EXISTS inventory_location CASCADE;
DROP TYPE IF EXISTS unit CASCADE;

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE packages_status AS ENUM ('active','inactive','quarantine','damaged','expired','reserved');
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

CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    total_quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    cost_per_unit DECIMAL(10,2),
    supplier_name VARCHAR(255),
    status packages_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, batch_number)
);

-- Depends on Products + Companies
CREATE TABLE packages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    parent_lot_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
    location VARCHAR(255) DEFAULT 'backroom',
    status packages_status NOT NULL DEFAULT 'active',
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
    package_size DECIMAL(10,3),        
    unit VARCHAR(10) DEFAULT 'g', 
    cost_price DECIMAL(10,2),
    supplier_name VARCHAR(255),
    lot_number VARCHAR(100),
    state_uuid UUID UNIQUE,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (batch_id, location, lot_number)
);

-- Audit Trail
CREATE TABLE inventory_movements (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    packages_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    movement_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    cost_per_unit DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

