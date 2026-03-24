-- =============================================
-- Cafe Management System - Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS cafe_management;
USE cafe_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    description TEXT,
    available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);

-- =============================================
-- Sample Dummy Data
-- =============================================

-- Admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin User', 'admin@cafe.com', 'admin123', 'admin'),
('John Doe', 'john@example.com', 'john123', 'customer'),
('Jane Smith', 'jane@example.com', 'jane123', 'customer'),
('Mike Wilson', 'mike@example.com', 'mike123', 'customer');

-- Menu items
INSERT INTO menu_items (name, category, price, image_url, description) VALUES
('Espresso', 'Coffee', 3.50, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', 'Rich and bold single shot espresso'),
('Cappuccino', 'Coffee', 4.50, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 'Creamy cappuccino with steamed milk foam'),
('Latte', 'Coffee', 4.75, 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 'Smooth latte with velvety steamed milk'),
('Mocha', 'Coffee', 5.25, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 'Chocolate-infused espresso with whipped cream'),
('Americano', 'Coffee', 3.75, 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400', 'Classic americano with hot water and espresso'),
('Cold Brew', 'Coffee', 4.25, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 'Slow-steeped cold brew coffee served over ice'),
('Green Tea', 'Tea', 3.00, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400', 'Premium Japanese green tea'),
('Chai Latte', 'Tea', 4.50, 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400', 'Spiced chai with steamed milk'),
('Iced Tea', 'Tea', 3.25, 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400', 'Refreshing iced tea with lemon'),
('Croissant', 'Pastry', 3.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400', 'Freshly baked butter croissant'),
('Blueberry Muffin', 'Pastry', 3.75, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', 'Moist blueberry muffin with crumb topping'),
('Chocolate Cake', 'Dessert', 5.50, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'Decadent triple chocolate cake slice'),
('Cheesecake', 'Dessert', 6.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 'New York style creamy cheesecake'),
('Club Sandwich', 'Food', 7.50, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', 'Triple-decker club sandwich with fries'),
('Caesar Salad', 'Food', 6.50, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Fresh caesar salad with croutons and parmesan');

-- Sample orders (totals match items below)
INSERT INTO orders (user_id, total_amount, status) VALUES
(2, 14.25, 'completed'),
(3, 7.50, 'pending'),
(4, 18.25, 'completed'),
(2, 9.25, 'pending');

-- Sample order items
INSERT INTO order_items (order_id, item_id, quantity, price) VALUES
(1, 1, 2, 3.50),
(1, 10, 1, 3.50),
(1, 11, 1, 3.75),
(2, 2, 1, 4.50),
(2, 7, 1, 3.00),
(3, 4, 1, 5.25),
(3, 14, 1, 7.50),
(3, 12, 1, 5.50),
(4, 3, 1, 4.75),
(4, 8, 1, 4.50);
