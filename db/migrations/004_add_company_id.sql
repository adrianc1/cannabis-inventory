ALTER TABLE inventory
ADD COLUMN company_id INTEGER REFERENCES companies(id);