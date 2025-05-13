CREATE TABLE app.products (
    id SERIAL PRIMARY KEY,

    sku TEXT NOT NULL UNIQUE,

    product_id TEXT NOT NULL, 
    variant_id TEXT NOT NULL,

    
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    attributes JSONB NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    images JSONB NOT NULL,

    synced_with_kaspi BOOLEAN DEFAULT FALSE, 
    last_synced TIMESTAMP,
    kaspi_upload_code TEXT, 
    delisted BOOLEAN DEFAULT FALSE
)

CREATE TABLE mappings.categories (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE mappings.attributes (
  code TEXT NOT NULL,
  category_code TEXT REFERENCES categories(code),
  type TEXT NOT NULL,
  multi_valued BOOLEAN NOT NULL,
  mandatory BOOLEAN NOT NULL,
  PRIMARY KEY (code, category_code)
);

CREATE TABLE mappings.attribute_values (
  attribute_code TEXT NOT NULL,
  category_code TEXT NOT NULL,
  value_code TEXT NOT NULL,
  value_name TEXT NOT NULL,
  PRIMARY KEY (attribute_code, category_code, value_code),
  FOREIGN KEY (attribute_code, category_code) 
    REFERENCES attributes(code, category_code)
);

