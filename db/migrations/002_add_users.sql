CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255 UNIQUE NOT NULL),
    role user_role DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT NOW()

)