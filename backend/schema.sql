-- Zyro Store Database Schema

CREATE DATABASE IF NOT EXISTS zyro_store;
USE zyro_store;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255), -- Optional if using only Discord OAuth
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin Whitelist
CREATE TABLE IF NOT EXISTS admin_whitelist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(50) UNIQUE NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products (Cheats/Software)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans (Subscription types)
CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    name VARCHAR(100) NOT NULL,
    duration_days INT NOT NULL, -- 0 for lifetime
    price DECIMAL(10, 2),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- User Subscriptions/Products
CREATE TABLE IF NOT EXISTS user_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    license_key VARCHAR(100) UNIQUE NOT NULL,
    hwid VARCHAR(255) DEFAULT NULL,
    expires_at DATETIME, -- NULL for lifetime
    status ENUM('active', 'expired', 'banned') DEFAULT 'active',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Launcher Versions
CREATE TABLE IF NOT EXISTS launcher_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    download_url TEXT NOT NULL,
    changelog TEXT,
    is_stable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys (For Bot and Launcher)
CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    key_value VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data (Optional)
-- INSERT INTO products (name, description) VALUES ('FiveM External', 'High performance external cheat for FiveM');
-- INSERT INTO api_keys (name, key_value) VALUES ('discord_bot', 'CHANGE_ME_NOW_SECRET_KEY');
