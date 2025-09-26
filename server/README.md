# Build Track Backend

**Generated**: 2025-07-15T16:43:40.452747Z

This is a TypeScript **Express + MongoDB** backend for the Build‑Track app.

## 📦 Requirements

- Node.js LTS
- MongoDB (local or Atlas)

## 🚀 Getting Started

```bash
# install dependencies
npm install

# copy env vars
cp .env.example .env
# edit .env to set MONGODB_URI, JWT_SECRET

# run in dev mode (nodemon + ts-node)
npm run dev
```

Backend will run on **http://localhost:5000** and expose:

| Route | Method | Description |
|-------|--------|-------------|
| /api/auth/register | POST | Register user |
| /api/auth/login | POST | Login user, returns JWT |
| /api/sites | GET/POST | List or create sites |
| /api/tasks | GET/POST | List or create tasks |
| /api/tasks/:id/status | PUT | Update task status |
| /api/tasks/:id/upload | POST | Upload images to a task |

## 🗂️ Folder Structure

```
src/
  controllers/  # route handlers
  models/       # Mongoose schemas
  routes/       # express routers
  middleware/   # auth, error handling
  config/       # db connection
  uploads/      # static file serving path
```

## 🛠 Build & Deploy

```bash
npm run build   # compile TS to JS into dist/
npm start       # run compiled JS
```

Deploy on **Render**, **Railway**, or **Vercel**:
- Set environment variables
- Add build command `npm run build`
- Start command `npm start`

## 🔐 Authentication

JWT is expected in `Authorization: Bearer <token>` header.

## 📤 File Uploads

Images are stored in `uploads/` and served at `/uploads/<filename>`.
For production, consider S3 or Cloudinary.
