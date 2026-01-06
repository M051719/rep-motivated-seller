-- SQL schema for FSBO Listing Website

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    owner_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    price INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    sqft INTEGER,
    lot_size INTEGER,
    year_built INTEGER,
    year_remodeled INTEGER,
    property_condition VARCHAR(255),
    financing VARCHAR(255),
    features TEXT,
    photos TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
