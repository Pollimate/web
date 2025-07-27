# 🗳️ Pollimate Monorepo

Welcome to the **Pollimate** monorepo — a full-stack, early-stage polling platform built with a modern web stack and managed using [Turborepo](https://turbo.build/repo).

Repository: [github.com/pollimate/web](https://github.com/pollimate/web)  
Website: [pollimate.io](https://pollimate.io)

---

## 📦 Monorepo Structure

```text
/
├── apps/
│   ├── backend/        # Fastify API server
│   └── frontend/       # Next.js app with TailwindCSS and ShadCN
├── packages/
│   └── schemas/        # Shared Zod schemas
├── Dockerfile          # Backend Docker build
├── turbo.json          # Turborepo pipeline config
└── package.json        # Root scripts and shared config
```

This monorepo includes:

- `@pollimate/backend`: Fastify server with MongoDB
- `@pollimate/frontend`: Next.js frontend hosted via Vercel
- `@pollimate/schemas`: Shared Zod schema package for validation

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/pollimate/web.git
cd web
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Configure environment variables

Each app contains a `.env.example` file. Copy it to `.env` and provide the necessary values.

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Refer to each app’s `.env.example` for required variables.

### 4. Run the development environment

```bash
yarn dev
```

This runs both the frontend and backend using Turborepo's `dev` pipeline.

---

## 🐳 Backend with Docker

The root `Dockerfile` is used to build and run the backend service.

### Build the backend image

```bash
docker build -t pollimate-backend .
```

### Run the container

```bash
docker run -p 3500:3500 --env-file apps/backend/.env pollimate-backend
```

---

## ☁️ Deployment

- **Frontend** is hosted via [Vercel](https://vercel.com/)
- **Backend** is containerized and can be deployed to any platform supporting Docker

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👥 Contributors

- [Benjamin Lindberg](https://github.com/BenjaminLindberg) – `lindbergbenjamin2@gmail.com`
- [Ivar van den Bosch](https://github.com/IvarvandenBosch) – `ivvdbosch@gmail.com`
