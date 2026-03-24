# ☕ BrewHaven - Cafe Management System

A complete full-stack Cafe Management System built with **Node.js**, **Express.js**, **MySQL**, and **Vanilla JavaScript**.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)

---

## 📁 Project Structure

```
cafe-management/
│
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js   # Login/Signup
│   │   ├── menuController.js   # Menu CRUD
│   │   └── orderController.js  # Order management
│   ├── routes/
│   │   ├── auth.js
│   │   ├── menu.js
│   │   └── orders.js
│   ├── models/
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   └── Order.js
│   ├── middleware/
│   │   └── auth.js             # Auth & Role checks
│   ├── app.js                  # Express entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
├── frontend/
│   ├── index.html              # Landing page
│   ├── admin.html              # Admin dashboard
│   ├── customer.html           # Customer ordering page
│   ├── css/
│   │   └── style.css           # All styles
│   ├── js/
│   │   ├── utils.js            # Shared utilities
│   │   ├── landing.js          # Landing page logic
│   │   ├── admin.js            # Admin dashboard logic
│   │   └── customer.js         # Customer page logic
│   └── assets/
│
├── database.sql                # SQL schema + sample data
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v5.7 or higher)
- A MySQL client (MySQL Workbench, phpMyAdmin, or CLI)

### 1. Clone / Setup

```bash
cd cafe-management
```

### 2. Setup MySQL Database

Open your MySQL client and run the SQL file:

```bash
# Using MySQL CLI:
mysql -u root -p < database.sql

# OR import database.sql via MySQL Workbench / phpMyAdmin
```

This creates the `cafe_management` database with all tables and sample data.

### 3. Configure Environment

Edit `backend/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cafe_management
DB_PORT=3306
PORT=5000
SESSION_SECRET=your-secret-key
```

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Start the Server

```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

### 6. Open in Browser

Navigate to: **http://localhost:5000**

---

## 🔑 Demo Credentials

| Role     | Email              | Password |
|----------|--------------------|----------|
| Admin    | admin@cafe.com     | admin123 |
| Customer | john@example.com   | john123  |
| Customer | jane@example.com   | jane123  |
| Customer | mike@example.com   | mike123  |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint          | Description     |
|--------|-------------------|-----------------|
| POST   | /api/auth/signup  | Register user   |
| POST   | /api/auth/login   | Login user      |
| POST   | /api/auth/logout  | Logout          |
| GET    | /api/auth/me      | Get current user|

### Menu Items
| Method | Endpoint             | Description        | Auth    |
|--------|----------------------|--------------------|---------|
| GET    | /api/menu            | Get all items      | Public  |
| GET    | /api/menu/search?q=  | Search items       | Public  |
| GET    | /api/menu/categories | Get categories     | Public  |
| GET    | /api/menu/:id        | Get item by ID     | Public  |
| POST   | /api/menu            | Create item        | Admin   |
| PUT    | /api/menu/:id        | Update item        | Admin   |
| DELETE | /api/menu/:id        | Delete item        | Admin   |

### Orders
| Method | Endpoint                | Description        | Auth     |
|--------|-------------------------|--------------------|----------|
| POST   | /api/orders             | Place order        | Customer |
| GET    | /api/orders             | Get orders         | Auth     |
| GET    | /api/orders/stats       | Get statistics     | Admin    |
| GET    | /api/orders/:id         | Get order details  | Auth     |
| PUT    | /api/orders/:id/status  | Update status      | Admin    |

---

## ✨ Features

### Admin Dashboard
- 📊 **Dashboard** — Overview stats (total orders, revenue, pending, menu items)
- 📋 **Menu Management** — Add, edit, delete menu items with image URLs
- 🛒 **Order Management** — View all orders, mark as completed/cancelled
- 🔍 **Search** — Filter menu items and orders

### Customer Page
- 🍽️ **Browse Menu** — View all items as beautiful cards
- 🔍 **Search & Filter** — Search by name, filter by category
- 🛒 **Shopping Cart** — Add/remove items, adjust quantities
- 📦 **Place Orders** — Checkout with cart items
- 📜 **Order History** — View past orders with status

### General
- 🔐 Session-based authentication
- 🍞 Toast notifications (success/error/warning)
- ⏳ Loading spinners
- 📱 Responsive design
- 🎨 Modern coffee-themed UI
- 🛡️ Form validation
- 📭 Empty state UI

---

## 🛠️ Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | HTML, CSS, Vanilla JS |
| Backend   | Node.js, Express.js |
| Database  | MySQL               |
| Auth      | Express Sessions    |
| Styling   | Custom CSS (Poppins font, coffee palette) |

---

## 📝 License

This project is for educational purposes.
