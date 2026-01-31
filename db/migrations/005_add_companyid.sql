ALTER TABLE inventory_movements
ADD COLUMN company_id INTEGER REFERENCES companies(id);