# 🌿 Cannabis Inventory Management App

A multi-tenant cannabis inventory management system built with Node.js, Express, and PostgreSQL.
The application allows operators to manage products, packages, and inventory movements while maintaining a transparent ledger of all stock activity.

This project focuses on real-world inventory workflows inspired by regulated cannabis operations.

##  Overview
This application provides cannabis operators with tools to:
-  Manage products and inventory across multiple tenants
- Track package lifecycle events (receiving, splitting, adjustments)
- Maintain an auditable inventory ledger
- Organize catalog data such as strains, brands, and categories
- Authenticate users securely with account-based access

The goal of this project is to simulate production-grade inventory systems used in regulated environments.

## Tech Stack

### Backend 
- Node.js
- Express.js
- Passport.js (authentication & session management)

### Database
- PostgreSQL
- SQL-based schema design and migrations

### Frontend
- EJS (server-side rendering)
- Tailwind CSS for styling

### Architecture
- Multi-tenant application design
- Modular Express routing
- Server-rendered MVC-style structure

##  Features

### Authentication & Multi-Tenancy
- User signup and login
- Tenant-scoped data isolation
- Session-based authentication using Passport

### Inventory Management

- Create and manage:
  - Products
  - Categories
  - Strains
  - Brands

- Track inventory quantities per package

 ### Package Operations

- Receive packages into inventory
- Split packages into multiple child packages
- Perform inventory adjustments

### Inventory Ledger

- Automatic logging of inventory actions
- Historical tracking of quantity changes
- Audit-friendly transaction history
