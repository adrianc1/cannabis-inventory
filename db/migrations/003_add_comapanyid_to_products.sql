ALTER TABLE products
ADD COLUMN company_id INTEGER REFERENCES companies(id);