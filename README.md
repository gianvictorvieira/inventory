# Inventory Production Planner

Web system to manage products, raw materials, product composition, and generate production suggestions prioritizing higher-value products.

## Stack

- Backend: Spring Boot API (Java 21, JPA)
- Frontend: React + Vite
- Database: PostgreSQL

## Requirements covered

- CRUD for products
- CRUD for raw materials
- CRUD for product/raw-material association
- Production suggestion endpoint and UI with value-priority strategy
- Responsive frontend layout

## Run locally

### 1) Database

```bash
docker compose up -d
```

### 2) Backend

```bash
cd backend
mvn spring-boot:run
```

API base: `http://localhost:8080/api`

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`

## Tests

```bash
cd backend
mvn test
```
