# 🏨 Hotel Management System + AI/RAG Module

A full-stack hotel management application built with **Spring Boot** (backend) and **React + Vite** (frontend). It supports JWT-based authentication and provides CRUD operations for Rooms, Customers, Bookings, and Spa services through a REST API — plus a working **Retrieval-Augmented Generation (RAG) chat assistant** backed by a dual-datasource architecture (MySQL + PostgreSQL/pgvector).

**🔗 Live Demo:** [hotel-management-frontend-ebon.vercel.app](https://hotel-management-frontend-ebon.vercel.app)
**🔗 Backend API:** [hotel-management-system-ai-rag-module-5.onrender.com](https://hotel-management-system-ai-rag-module-5.onrender.com)
**🔗 Swagger Docs:** [/swagger-ui/index.html](https://hotel-management-system-ai-rag-module-5.onrender.com/swagger-ui/index.html)

---

## 🗂 Project Structure

```
spring-hotel-rag/
├── backend/                  # Spring Boot backend
│   └── src/main/java/hotel/management/hotel/management/
│       ├── AuthController.java
│       ├── JwtUtil.java / JwtFilter.java
│       ├── Security.java
│       ├── Room.java / RoomService.java / RoomController.java
│       ├── Customer.java / CustomerService.java / CustomerController.java
│       ├── Booking.java / BookingService.java / BookingController.java
│       ├── Spa.java / SpaService.java / SpaController.java
│       │
│       ├── Database.java              # Dual datasource config (MySQL + Postgres)
│       ├── OllamaEmbeddingModel.java  # Embedding + generation client (HuggingFace API)
│       ├── VectorRespository.java     # pgvector reads/writes (ai_documents table)
│       ├── VectorService.java         # Service layer over VectorRespository
│       ├── TextChunker.java           # Sentence-aware chunking with overlap
│       ├── IngestionController.java   # /api/ingest/text — chunk + embed + store
│       ├── ChatController.java        # /api/chat/ask — RAG question answering
│       └── VectorTestController.java  # /api/ai-test/* — early pipeline test endpoints
│
└── frontend/                 # React + Vite frontend
    └── src/
        ├── App.jsx
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Rooms.jsx
        ├── Customers.jsx
        ├── Bookings.jsx
        ├── Spa.jsx
        └── Chat.jsx           # RAG chat UI
```

---

## ⚙️ Tech Stack

| Layer          | Technology                                                  |
|-----------------|--------------------------------------------------------------|
| Backend         | Java 17, Spring Boot 4.1, Spring Security                    |
| Auth            | JWT (jjwt 0.11.5)                                             |
| Hotel Database  | MySQL (Aiven) + Spring Data JPA / Hibernate                  |
| AI/RAG Store    | PostgreSQL + pgvector (Neon, serverless)                     |
| Embeddings      | HuggingFace Inference API — `sentence-transformers/all-MiniLM-L6-v2` (384-dim) |
| Generation      | HuggingFace Inference API — `meta-llama/Llama-3.1-8B-Instruct` |
| HTTP Client     | Spring RestTemplate                                           |
| Utils           | Jackson (ObjectMapper for response parsing)                  |
| API Docs        | Swagger / SpringDoc OpenAPI                                   |
| Frontend        | React 18, React Router v6, Vite, Tailwind CSS, shadcn/ui      |
| Animations      | Framer Motion                                                 |
| Deployment      | Render (backend), Vercel (frontend)                           |

> **Note:** This project originally used a locally-run Ollama server (`nomic-embed-text` + `qwen2.5-coder:1.5b`) for embeddings and generation. Since Render's free tier can't run Ollama, the AI layer was migrated to HuggingFace's hosted Inference API so the RAG pipeline works fully in production, not just in local development.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Java 17+
- Maven (or use the included `mvnw` wrapper — no separate install needed)
- MySQL 8+ (hotel data) — or a free hosted instance (e.g. Aiven, Clever Cloud)
- PostgreSQL 14+ with the `pgvector` extension (AI/RAG data) — or a free hosted instance (e.g. Neon)
- A free [HuggingFace](https://huggingface.co) account + API token (Settings → Access Tokens)
- Node.js 18+ and npm

---

### Backend Setup

1. **Create the MySQL database** (hotel data) — schema is auto-created via `spring.jpa.hibernate.ddl-auto=update`.

2. **Create the PostgreSQL database** (AI/RAG data) and enable pgvector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE ai_documents (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    content TEXT,
    embedding VECTOR(384),
    metadata JSONB
);
```

> The vector dimension is **384**, matching the `all-MiniLM-L6-v2` embedding model. (If you swap embedding models, update this dimension to match.)

3. **Set environment variables** (locally via IDE run config, or a `.env` — never commit these):

```
MYSQL_URL=jdbc:mysql://<host>:<port>/<db>
MYSQL_USER=<user>
MYSQL_PASSWORD=<password>

POSTGRES_URL=jdbc:postgresql://<host>:<port>/<db>?sslmode=require
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>

JWT_SECRET=<your-secret>
HF_API_KEY=<your-huggingface-token>
```

4. **Run the backend:**

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on **http://localhost:54321**

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173**

---

## 🔐 Authentication

Login is handled via a hardcoded admin account (development only — see [Known Limitations](#-known-limitations--suggested-improvements)):

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

**POST** `/api/auth/login` — returns a JWT token. All other endpoints (including `/api/ingest/**` and `/api/chat/**`) require the `Authorization: Bearer <token>` header.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint          | Description       | Auth Required |
|--------|-------------------|--------------------|----------------|
| POST   | `/api/auth/login` | Login & get token | No             |

### Rooms / Customers / Bookings / Spa
Standard CRUD (`GET`, `POST`, `PUT`, `DELETE`) under `/api/rooms`, `/api/customer`, `/api/booking`, `/api/spa`. All require a valid JWT.

### AI / RAG
| Method | Endpoint            | Description                                                        |
|--------|-----------------------|---------------------------------------------------------------------|
| POST   | `/api/ingest/text`  | Chunks the given text (sentence-aware, with overlap), embeds each chunk, and stores it in `ai_documents` |
| POST   | `/api/chat/ask`     | Embeds the question, retrieves the most similar stored chunks, and generates a grounded answer |

**Example — ingest:**
```json
POST /api/ingest/text
{
  "userId": 1,
  "content": "Check-in time is 2 PM. Check-out time is 11 AM. Pets are allowed with prior notice."
}
```

**Example — ask:**
```json
POST /api/chat/ask
{
  "userId": 1,
  "question": "What time is check-in?"
}
```

> **Swagger UI:** `https://hotel-management-system-ai-rag-module-5.onrender.com/swagger-ui/index.html`

---

## 🧠 AI / RAG Module — How It Works

1. **Ingestion** (`IngestionController` → `TextChunker` → `OllamaEmbeddingModel` → `VectorService`): incoming text is split into sentence-aware chunks (~500 chars, 100-char overlap so context isn't lost at boundaries), each chunk is embedded via HuggingFace's `all-MiniLM-L6-v2`, and stored in Postgres with pgvector.
2. **Retrieval + Generation** (`ChatController`): a user's question is embedded the same way, pgvector's cosine similarity (`<=>` operator) finds the top-3 most relevant stored chunks, those chunks are stitched into a prompt as context, and HuggingFace's `Llama-3.1-8B-Instruct` generates an answer **grounded in that retrieved context** — not the model's general knowledge.
3. **Chat UI** (`Chat.jsx`): a simple message-thread interface that calls `/api/chat/ask` and displays the conversation.

This is a genuinely working, end-to-end RAG pipeline — ingest → chunk → embed → store → retrieve → generate — deployed and testable via the live demo.

---

## 🌐 CORS

The backend allows requests from:
- `http://localhost:5173` (local dev)
- `https://hotel-management-frontend-ebon.vercel.app` (deployed frontend)

Update `Security.java` to add your own deployment URL if you fork this.

---

## 🚧 Known Limitations & Suggested Improvements

This is a **learning/portfolio project** — honest list of what's next:

- [ ] Move hardcoded `admin/admin123` login to a real database-backed `UserDetailsService`
- [ ] Add input validation (`@Valid`, `@NotNull`, etc.) on request DTOs
- [ ] Add proper centralized error handling (`@ControllerAdvice`) instead of per-endpoint try/catch
- [ ] Fix naming inconsistencies (`VectorRespository` → `VectorRepository`)
- [ ] Add pagination for list endpoints
- [ ] Write unit and integration tests
- [ ] Support file/PDF upload for ingestion (currently plain-text only)
- [ ] Tune the generation prompt for shorter, more direct answers
- [ ] Let the chat assistant query live hotel data (rooms/bookings), not just manually ingested text
- [ ] Payment gateway integration (Razorpay) with PDF receipt generation — planned next

---

## 📦 Build for Production

**Backend:**
```bash
cd backend
./mvnw clean package
java -jar target/hotel-management-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm run build
vercel --prod
```

---

## 📄 License

