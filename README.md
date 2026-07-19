# 🏨 Hotel Management System + AI/RAG Module

A full-stack hotel management application built with **Spring Boot** (backend) and **React + Vite** (frontend). It supports JWT-based authentication and provides CRUD operations for Rooms, Customers, Bookings, and Spa services through a REST API.

This repo also now hosts an **experimental AI/RAG module** — a local Ollama-powered embedding + retrieval pipeline running alongside the hotel backend, using a second PostgreSQL (pgvector) datasource.

---

## 🗂 Project Structure

```
hotel-management-project/
├── hotel-management/        # Spring Boot backend
│   ├── src/main/java/...
│   │   ├── AuthController.java
│   │   ├── JwtUtil.java / JwtFilter.java
│   │   ├── Security.java
│   │   ├── Room.java / RoomService.java / Waiter.java (RoomController)
│   │   ├── Customer.java / CustomerService.java / CustomerController.java
│   │   ├── Booking.java / BookingService.java / BookingController.java
│   │   ├── Spa.java / Spaservice.java / SpaController.java
│   │   │
│   │   ├── Database.java              # Dual datasource config (MySQL + Postgres)
│   │   ├── OllamaEmbeddingModel.java  # Calls local Ollama for embeddings + text generation
│   │   ├── VectorRespository.java     # pgvector reads/writes (ai_documents table)
│   │   ├── VectorService.java         # Service layer over VectorRespository
│   │   ├── VectorTestController.java  # /api/ai-test/* endpoints
│   │   └── TZCheck.java               # Timezone debug utility
│   │
│   └── src/main/resources/application.properties
│
└── hotel-fronted/           # React + Vite frontend
    └── src/
        ├── App.jsx
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Rooms.jsx
        ├── Customers.jsx
        ├── Bookings.jsx
        └── Spa.jsx
```

---

## ⚙️ Tech Stack

| Layer         | Technology                                        |
|---------------|----------------------------------------------------|
| Backend       | Java 17, Spring Boot, Spring Security              |
| Auth          | JWT (jjwt 0.11.5)                                  |
| Hotel Database| MySQL + Spring Data JPA / Hibernate                |
| AI/RAG Store  | PostgreSQL + pgvector                              |
| Local LLM     | Ollama (`nomic-embed-text` for embeddings, `qwen2.5-coder:1.5b` for generation) |
| HTTP Client   | Spring WebFlux / RestTemplate (Ollama calls)       |
| Utils         | Lombok, Jackson                                    |
| API Docs      | Swagger / SpringDoc OpenAPI                        |
| Frontend      | React 18, React Router v6, Vite                    |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8+ (hotel data)
- PostgreSQL 14+ with the `pgvector` extension (AI/RAG data)
- [Ollama](https://ollama.com) running locally, with `nomic-embed-text` and `qwen2.5-coder:1.5b` pulled
- Node.js 18+ and npm

---

### Backend Setup

1. **Create the MySQL database** (hotel data):

```sql
CREATE DATABASE student_db;
```

2. **Create the PostgreSQL database** (AI/RAG data) and enable pgvector:

```sql
CREATE DATABASE hotel_ai;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE ai_documents (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    content TEXT,
    embedding VECTOR(768),
    metadata JSONB
);
```

> Adjust the `VECTOR(768)` dimension to match whatever embedding model you use — `nomic-embed-text` outputs 768-dim vectors.

3. **Configure both datasources** in `hotel-management/src/main/resources/application.properties`:

```properties
# Hotel data (MySQL)
spring.datasource.mysql.jdbc-url=jdbc:mysql://localhost:3306/student_db
spring.datasource.mysql.username=root
spring.datasource.mysql.password=YOUR_PASSWORD

# AI/RAG data (Postgres + pgvector)
spring.datasource.postgres.jdbc-url=jdbc:postgresql://localhost:5432/hotel_ai
spring.datasource.postgres.username=postgres
spring.datasource.postgres.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update

# Ollama
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.embedding.options.model=nomic-embed-text
```

> ⚠️ **Security note:** Never commit real credentials to version control. This repo is public — move these to environment variables or a `.env`-style config before pushing further changes, and rotate any credentials that have already been committed.

4. **Pull the Ollama models and start Ollama:**

```bash
ollama pull nomic-embed-text
ollama pull qwen2.5-coder:1.5b
ollama serve
```

5. **Run the backend:**

```bash
cd hotel-management
./mvnw spring-boot:run
```

The backend will start on **http://localhost:8080**

---

### Frontend Setup

```bash
cd hotel-fronted
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## 🔐 Authentication

Login is handled via a hardcoded admin account (for development purposes):

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

**POST** `/api/auth/login` — returns a JWT token.

All other hotel API endpoints require the `Authorization: Bearer <token>` header. The `/api/ai-test/**` endpoints are currently open (no auth required) — see [Known Limitations](#-known-limitations--suggested-improvements).

---

## 📡 API Endpoints

### Auth
| Method | Endpoint          | Description       | Auth Required |
|--------|-------------------|-------------------|---------------|
| POST   | `/api/auth/login` | Login & get token | No            |

### Rooms
| Method | Endpoint          | Description     |
|--------|-------------------|------------------|
| GET    | `/api/rooms`      | List all rooms  |
| POST   | `/api/rooms`      | Add a room      |
| PUT    | `/api/rooms`      | Update a room   |
| DELETE | `/api/rooms/{id}` | Delete a room   |

### Customers
| Method | Endpoint             | Description         |
|--------|-----------------------|---------------------|
| GET    | `/api/customer`      | List all customers  |
| POST   | `/api/customer`      | Add a customer      |
| PUT    | `/api/customer`      | Update a customer   |
| DELETE | `/api/customer/{id}` | Delete a customer   |

### Bookings
| Method | Endpoint            | Description        |
|--------|----------------------|--------------------|
| GET    | `/api/booking`      | List all bookings  |
| POST   | `/api/booking`      | Create a booking   |
| DELETE | `/api/booking/{id}` | Cancel a booking   |

### Spa Services
| Method | Endpoint        | Description            |
|--------|-----------------|-------------------------|
| GET    | `/api/spa`      | List all spa services  |
| POST   | `/api/spa`      | Add a spa service      |
| PUT    | `/api/spa`      | Update a spa service   |
| DELETE | `/api/spa/{id}` | Delete a spa service   |

### AI / RAG (Experimental — not yet integrated into hotel workflows)
| Method | Endpoint                          | Description                                                |
|--------|------------------------------------|--------------------------------------------------------------|
| GET    | `/api/ai-test/save`               | Embeds a hardcoded test string and stores it in `ai_documents` |
| GET    | `/api/ai-test/search`             | Embeds a test query and returns the top similar stored docs   |
| GET    | `/api/ai-test/chat?question=...`  | Embeds the question, retrieves similar context, generates an answer via Ollama |

> **Swagger UI** is available at: `http://localhost:8080/swagger-ui/index.html`

---

## 🧱 Data Models

### Room
```json
{
  "roomNumber": "101",
  "roomType": "Deluxe",
  "price": 2500.00,
  "available": true
}
```

### Customer
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "9876543210",
  "address": "Chennai, India",
  "adharNo": "1234-5678-9012"
}
```

### Booking
```json
{
  "checkinDate": "2026-07-01",
  "checkoutDate": "2026-07-05",
  "checkinTime": "14:00",
  "checkoutTime": "11:00",
  "totalprice": 10000.00,
  "customer": { "id": 1 },
  "room": { "id": 2 }
}
```

### Spa Service
```json
{
  "serviceName": "Full Body Massage",
  "price": 1500.00,
  "duration": 60,
  "available": true
}
```

### AI Document (`ai_documents` table, Postgres)
```json
{
  "user_id": 11,
  "content": "HELLO WORLD",
  "embedding": "[768-dim vector]",
  "metadata": { "source": "test.pdf" }
}
```

---

## 🌐 CORS

The backend allows requests from:
- `http://localhost:5173` (local dev)
- `https://peaceful-pixie-f3e81b.netlify.app` (deployed frontend)

Update `Security.java` to add your own deployment URL.

---

## 🧠 AI / RAG Module — How It Works

1. `OllamaEmbeddingModel` sends text to a local Ollama server (`/api/embed`) using `nomic-embed-text` and gets back a float vector.
2. `VectorRespository` stores that vector in Postgres (`ai_documents`, using pgvector's `vector` column type) or searches for similar vectors using cosine distance (`<=>`).
3. `VectorService` is a thin wrapper over the repository.
4. `VectorTestController` exposes `/api/ai-test/save`, `/search`, and `/chat` to test the pipeline end-to-end — embed → store → retrieve → generate (via `qwen2.5-coder:1.5b` on Ollama's `/api/generate`).

This is currently a standalone test module — it doesn't yet ingest real documents (chunking/upload) or plug into a chat UI. It's the foundation for a Spring Boot + Ollama + pgvector RAG system being built out separately from the hotel CRUD features.

---

## 🚧 Known Limitations & Suggested Improvements

This project is a **learning/portfolio project** — here are areas to improve before production use:

- [ ] Move all credentials (`admin/admin123`, MySQL/Postgres passwords, JWT secret) to environment variables — several are currently committed in `application.properties`
- [ ] Add real user management with a database-backed `UserDetailsService`
- [ ] Add input validation (`@Valid`, `@NotNull`, etc.)
- [ ] Add proper error handling with `@ControllerAdvice`
- [ ] Fix typos in class names (`Waiter` → `RoomController`, `Respository` → `Repository`)
- [ ] Add pagination for list endpoints
- [ ] Write unit and integration tests
- [ ] Secure `/api/ai-test/**` endpoints (currently open to all)
- [ ] Build out document ingestion/chunking for the RAG pipeline (currently only a hardcoded test string is embedded)
- [ ] Decide whether the AI/RAG module stays merged into this repo long-term or gets split into its own project

---

## 📦 Build for Production

**Backend:**
```bash
cd hotel-management
./mvnw clean package
java -jar target/hotel-management-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd hotel-fronted
npm run build
```

---

## 📄 License

This project is for educational purposes. Feel free to fork and improve it.
