CREATE DATABASE IF NOT EXISTS boutique_db;
USE boutique_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    balance DECIMAL(10,2) DEFAULT 100.00,
    api_key VARCHAR(64) DEFAULT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    stock INT DEFAULT 10
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data & CTF Flags
INSERT INTO users (username, email, password, role, balance, api_key) VALUES
('admin', 'admin@auraboutique.local', 'SuperAdminSecretPass2026!', 'admin', 9999.00, 'FLAG{hardcoded_admin_api_token_exposed}'),
('alice', 'alice@gmail.com', 'password123', 'customer', 250.00, 'usr_token_987123'),
('bob', 'bob@gmail.com', 'secr3tpass', 'customer', 50.00, 'usr_token_456789');

INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Silk Evening Gown', 'Handcrafted luxury Italian silk gown.', 299.99, 'dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 5),
('Leather Designer Jacket', 'Premium tailored black leather jacket.', 450.00, 'outerwear', 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500', 3),
('Cashmere Knit Sweater', 'Ultra-soft winter cashmere knit.', 120.00, 'knitwear', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500', 12);