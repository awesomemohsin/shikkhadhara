# ShikkhaDhara (শিক্ষাধারা)

**ShikkhaDhara** is a premium, enterprise-grade, multi-tenant SaaS ERP platform designed specifically for Schools, Madrasas, and Colleges in Bangladesh. The platform enforces absolute database isolation, URL path-based tenant routing, and fine-grained role-based access controls (RBAC) to ensure security, scalability, and performance.

---

## 🚀 Key Architectural Features

### 1. Absolute Multi-Tenant Isolation
- **Tenant Resolution Layer**: Next.js Edge Middleware intercepts inbound path routing, maps subdomain slugs (e.g., `/dhaka-academy/dashboard`) to database tenant IDs, and rewrites URLs internally.
- **Tenant-Scoped Query Enforcer**: All database CRUD operations are proxied through a centralized database query driver that injects `{ tenantId }` filters automatically. Attempting queries without a valid tenant identifier triggers an immediate `Security Violation` crash.

### 2. Fine-Grained RBAC Hierarchy
- Supports customized profiles and dashboards for system **Owners**, Institutional **Administrators**, **Teachers**, **Staff**, **Students**, and **Guardians**.
- Strict tenant isolation guarantees that users cannot execute cross-tenant requests even if authenticated.

---

## 🛠️ Tech Stack & Services

- **Framework**: Next.js (App Router, Edge Middleware, Server Actions)
- **Database**: MongoDB Atlas via Mongoose
- **Styling**: Vanilla CSS with tailored design systems (vibrant color palettes, glassmorphism, responsive components)
- **State Management**: Zustand
- **Gateways**: 
  - Payment Gateways (SSLCommerz, bKash, Nagad)
  - SMS Gateways (automated guardian alert system)
  - Webhooks (real-time notification delivery)

---

## 📦 ERP Core Modules

1. **Academic Management**: Examinations, marksheet generators, auto-merit lists, and routine schedules.
2. **Attendance Management**: Daily logs with automated guardian SMS alerts for late arrivals/absences.
3. **Financials & Billing**: Automatic invoice receipts, mobile banking collection integration.
4. **Madrasa Specialty (Hifz Progress)**: Module toggling enabled via tenant feature flags for Madrasa-specific Quran progress tracking.
5. **Staff & Payroll**: Salaries, allowances, deductions, and payroll management.
6. **Operations**: Hostel lodging management and physical item inventory.
7. **Engagement**: Photo gallery, announcements, push notifications, and detailed system analytics reports.

---

## 🛠️ Development & Installation

### Prerequisities
- Node.js v18+
- MongoDB instance (local or Atlas)

### Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure your environment variables in `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shikkhadhara
   JWT_SECRET=your-secure-jwt-secret-key
   ```
3. Seed the base default data:
   ```bash
   npx tsx seed-online-db.ts
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
