 # 🏨 Hotel Management System

A full-stack hotel management application built with **Spring Boot** (backend) and **React + Vite** (frontend). It supports JWT-based authentication and provides CRUD operations for Rooms, Customers, Bookings, and Spa services through a REST API.

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
│   │   └── Spa.java / Spaservice.java / SpaController.java
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

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Backend   | Java 17, Spring Boot 4.1, Spring Security    |
| Auth      | JWT (jjwt 0.11.5)                            |
| Database  | MySQL + Spring Data JPA / Hibernate          |
| API Docs  | Swagger / SpringDoc OpenAPI                  |
| Frontend  | React 18, React Router v6, Vite              |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8+
- Node.js 18+ and npm

---

### Backend Setup

1. **Create the MySQL database:**

```sql
CREATE DATABASE student_db;
```

2. **Configure your credentials** in `hotel-management/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/student_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

> ⚠️ **Security note:** Never commit real credentials to version control. Use environment variables or a `.env` file in production.

3. **Run the backend:**

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

All other API endpoints require the `Authorization: Bearer <token>` header.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint          | Description       | Auth Required |
|--------|-------------------|-------------------|---------------|
| POST   | `/api/auth/login` | Login & get token | No            |

### Rooms
| Method | Endpoint        | Description     |
|--------|-----------------|-----------------|
| GET    | `/api/rooms`    | List all rooms  |
| POST   | `/api/rooms`    | Add a room      |
| PUT    | `/api/rooms`    | Update a room   |
| DELETE | `/api/rooms/{id}` | Delete a room |

### Customers
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | `/api/customer`       | List all customers  |
| POST   | `/api/customer`       | Add a customer      |
| PUT    | `/api/customer`       | Update a customer   |
| DELETE | `/api/customer/{id}`  | Delete a customer   |

### Bookings
| Method | Endpoint            | Description       |
|--------|---------------------|-------------------|
| GET    | `/api/booking`      | List all bookings |
| POST   | `/api/booking`      | Create a booking  |
| DELETE | `/api/booking/{id}` | Cancel a booking  |

### Spa Services
| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| GET    | `/api/spa`      | List all spa services |
| POST   | `/api/spa`      | Add a spa service    |
| PUT    | `/api/spa`      | Update a spa service |
| DELETE | `/api/spa/{id}` | Delete a spa service |

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

---

## 🌐 CORS

The backend allows requests from:
- `http://localhost:5173` (local dev)
- `https://peaceful-pixie-f3e81b.netlify.app` (deployed frontend)

Update `Security.java` to add your own deployment URL.

---

## 🚧 Known Limitations & Suggested Improvements

This project is a **learning/portfolio project** — here are areas to improve before production use:

- [ ] Move credentials (`admin/admin123`, DB password, JWT secret) to environment variables
- [ ] Add real user management with a database-backed `UserDetailsService`
- [ ] Add input validation (`@Valid`, `@NotNull`, etc.)
- [ ] Add proper error handling with `@ControllerAdvice`
- [ ] Fix typos in class names (`Waiter` → `RoomController`, `Respository` → `Repository`)
- [ ] Add pagination for list endpoints
- [ ] Write unit and integration tests

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
