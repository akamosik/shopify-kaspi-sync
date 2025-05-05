CREATE TABLE products (
    id SERIAL PRIMARY KEY,

    product_id TEXT NOT NULL, 
    variant_id TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL UNIQUE,
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


