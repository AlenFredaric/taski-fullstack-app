# Ticket Booking Platform

<div align="center">

# Ticket Booking Platform • Wallet Management System

A modern **Full Stack Ticket Booking Platform** featuring secure **JWT Authentication**, a built-in **Wallet System**, intelligent **Seat Reservation Engine**, and a comprehensive **Admin Dashboard**.

Built as part of a Full Stack Technical Assessment using modern JavaScript technologies.

<br>

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?logo=tailwindcss&logoColor=white)

</div>

---

# Overview

Ticket Booking Platform is a full-stack event booking application where users can securely reserve seats, pay using their wallet balance, and manage bookings while administrators oversee events, bookings, payments, and refunds.

The application demonstrates modern software engineering practices including:

- Full Stack Architecture
- RESTful APIs
- JWT Authentication
- Wallet-Based Payments
- Atomic Booking Transactions
- Reservation Timeout Handling
- Concurrency Protection
- Idempotent API Design
- Responsive Admin Dashboard
- Modular Project Structure

---

# Features

## Authentication

- User Registration
- User Login
- Admin Login
- JWT Authentication
- Protected Routes
- Role-Based Authorization

---

## Wallet System

- Add Money
- Wallet Balance
- Wallet Debit
- Wallet Credit (Refund)
- Complete Transaction History

---

## Event Booking

- Browse Events
- View Available Seats
- Reserve Seats
- Automatic 5 Minute Reservation
- Book Seats
- Booking Confirmation

---

## Booking Management

- Booking History
- Booking Status
- Ticket Details
- Booking Cancellation
- Wallet Refunds

---

## Admin Dashboard

- Dashboard Overview
- Event Management
- Seat Management
- Booking Monitoring
- Transaction Monitoring
- Refund Management
- Activity Monitoring

---

# Technical Highlights

- JWT Authentication
- MongoDB Database
- RESTful API
- Atomic Database Operations
- Reservation Expiry Logic
- Duplicate Booking Prevention
- Wallet Transaction Ledger
- Activity Logging
- Modular MVC Architecture

---

# Critical Requirements

✔ No Double Booking

✔ No Double Spending

✔ Reservation Expiry

✔ Retry Safe APIs (Idempotency)

✔ Atomic Booking + Payment

✔ Wallet Validation

✔ Booking Rollback

✔ Edge Case Handling

---

# Technology Stack

## Frontend

- React 19
- Vite
- Tailwind CSS
- JavaScript

## Backend

- Node.js
- Express.js
- JWT Authentication

## Database

- MongoDB
- Mongoose

---

# Project Structure

```text
taski-fullstack-app
│
├── backend
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── eventController.js
│   │   └── walletController.js
│   │
│   ├── middlewares
│   │   └── authMiddleware.js
│   │
│   ├── models
│   │   ├── Activity.js
│   │   ├── Booking.js
│   │   ├── Event.js
│   │   ├── Seat.js
│   │   ├── Transaction.js
│   │   └── User.js
│   │
│   ├── routes
│   │   ├── activityRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── eventRoutes.js
│   │   └── walletRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   └── test_concurrency.js
│
├── frontend
│   ├── public
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   ├── logo.png
│   │   └── logo.svg
│   │
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   │   ├── admin
│   │   │   ├── ActivityLogStreamView.jsx
│   │   │   ├── AdminDashboardView.jsx
│   │   │   ├── EventsListView.jsx
│   │   │   ├── LandingPageView.jsx
│   │   │   ├── PurchasedTicketsView.jsx
│   │   │   ├── SeatSelectionGrid.jsx
│   │   │   ├── TransactionsView.jsx
│   │   │   ├── UserDashboardView.jsx
│   │   │   └── WalletView.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/taski-fullstack-app.git

cd taski-fullstack-app
```

---

## Backend Setup

```bash
cd backend

npm install

node server.js
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# Environment Variables

Backend

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

JWT_EXPIRE=7d
```

Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

---

# API Modules

### Authentication

- Register
- Login
- Admin Login

### Wallet

- Add Money
- Wallet Balance
- Transactions

### Events

- List Events
- Seat Availability

### Booking

- Reserve Seat
- Confirm Booking
- Cancel Booking

### Admin

- Manage Events
- Manage Seats
- Manage Bookings
- Refund Wallet
- Activity Logs

---

# Design Decisions

- MVC Architecture
- JWT Authentication
- MongoDB Collections
- Modular Route Structure
- Wallet-Based Payment System
- Activity Logging
- Reservation Expiry Service
- Atomic Booking Workflow
- RESTful API Design

---

# Assumptions

- One wallet per user.
- Wallet balance must be sufficient before booking.
- Reservations automatically expire after five minutes.
- Refunds are credited directly to the user's wallet.
- Every transaction is permanently stored.
- Admin has complete access to bookings and events.

---

# Future Improvements

- Email Notifications
- QR Code Tickets
- Redis Queue
- WebSocket Live Seat Updates
- Payment Gateway Integration
- Analytics Dashboard
- Mobile Application
- Docker Deployment

---

# Author

**Alen Fredaric Francis**

Full Stack Developer
