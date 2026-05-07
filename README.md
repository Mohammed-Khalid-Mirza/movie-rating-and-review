# Cinematic Movie Library & Admin Portal

A modern, full-stack movie discovery and management platform built with Spring Boot and Next.js.

## 🛠️ Tech Stack

### Backend
- **Language**: Java 25
- **Framework**: Spring Boot 4.0
- **Security**: Spring Security + JWT (JSON Web Tokens)
- **Database**: PostgreSQL (Persistence), H2 (Testing)
- **ORM**: Hibernate / Spring Data JPA

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Lucide/Hugeicons
- **State Management**: React Hooks + URL-based filtering

## 📦 Getting Started

### Prerequisites
- JDK 25+
- Node.js 20+
- PostgreSQL instance

### 1. Backend Setup
```bash
cd demo
# Configure database in src/main/resources/application.properties
./mvnw spring-boot:run
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔒 Security
The system uses JWT for stateless authentication. Admins have exclusive access to the dashboard and content management tools through the `@PreAuthorize` security layer.
