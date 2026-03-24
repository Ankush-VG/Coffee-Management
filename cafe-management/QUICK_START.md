# ☕ BrewHaven Cafe Management System — Quick Start Guide

A step-by-step guide to get the project running on your machine.

---

## Prerequisites

You need two things installed:

| Software | Download Link | Verify Command |
|----------|--------------|----------------|
| **Node.js** (v16+) | https://nodejs.org | `node -v` |
| **MySQL** (v8+) | https://dev.mysql.com/downloads/ | `mysql --version` |

> **macOS tip:** You can also install via Homebrew:
> ```
> brew install node
> brew install mysql
> brew services start mysql
> ```

---

## Step 1 — Set Up the Database

Open a terminal and run:

```bash
# Log into MySQL (use your MySQL root password if you set one)
mysql -u root -p
```

Once inside the MySQL prompt, run:

```sql
SOURCE /full/path/to/cafe-management/database.sql;
```

Replace `/full/path/to/` with the actual path on your machine. For example:

```sql
SOURCE /Users/ankush/Desktop/Coffee\ Management/cafe-management/database.sql;
```

Then exit MySQL:

```sql
EXIT;
```

**Alternative (one-liner):**

```bash
mysql -u root -p < database.sql
```

> **Troubleshooting:** If you get `Access denied`, try `mysql -u root` (without `-p`) if you never set a MySQL password.

---

## Step 2 — Configure Database Credentials

Open the file `backend/.env` in any text editor:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cafe_management
DB_PORT=3306
PORT=5000
SESSION_SECRET=cafe-management-secret-key-2024
```

**Change `DB_PASSWORD`** to your MySQL root password. If you don't have a password, leave it blank.

---

## Step 3 — Install Dependencies

```bash
cd backend
npm install
```

This installs Express, MySQL driver, bcrypt, and other packages.

---

## Step 4 — Start the Server

```bash
npm start
```

You should see:

```
☕ Cafe Management Server running on http://localhost:5000
```

---

## Step 5 — Open in Browser

Go to: **http://localhost:5000**

You'll see the BrewHaven landing page.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@cafe.com | admin123 |
| **Customer** | john@example.com | john123 |
| **Customer** | jane@example.com | jane123 |

Click **Admin Login** or **Customer Login** on the landing page — the demo credentials auto-fill.

---

## Pages

| URL | Description |
|-----|-------------|
| http://localhost:5000 | Landing page (login/signup) |
| http://localhost:5000/admin | Admin dashboard (menu management, orders, stats) |
| http://localhost:5000/customer | Customer page (browse menu, cart, place orders) |

---

## All Commands Summary

```bash
# 1. Set up database
mysql -u root -p < database.sql

# 2. Install dependencies
cd backend
npm install

# 3. Start server
npm start

# 4. Open browser
open http://localhost:5000
```

---

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| `mysql: command not found` | Install MySQL or add it to your PATH |
| `Access denied for user 'root'` | Check DB_PASSWORD in `backend/.env` matches your MySQL password |
| `ECONNREFUSED` on start | Make sure MySQL is running: `brew services start mysql` (macOS) or `sudo systemctl start mysql` (Linux) |
| `ER_NOT_SUPPORTED_AUTH_MODE` | Run in MySQL: `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password'; FLUSH PRIVILEGES;` |
| Port 5000 already in use | Change `PORT=5000` to another port in `backend/.env` |
| `Cannot find module` error | Run `npm install` in the `backend` folder |

---

## Stop the Server

Press `Ctrl + C` in the terminal where the server is running.

---

## Project Structure

```
cafe-management/
├── database.sql          # Database schema + sample data
├── QUICK_START.md        # This file
├── README.md             # Full documentation
├── backend/
│   ├── .env              # Database & server config
│   ├── package.json      # Dependencies
│   ├── app.js            # Server entry point
│   ├── config/db.js      # MySQL connection
│   ├── middleware/auth.js # Auth middleware
│   ├── models/           # Database queries
│   ├── controllers/      # Business logic
│   └── routes/           # API endpoints
└── frontend/
    ├── index.html        # Landing page
    ├── admin.html        # Admin dashboard
    ├── customer.html     # Customer ordering page
    ├── css/style.css     # All styles
    └── js/               # Frontend scripts
```
