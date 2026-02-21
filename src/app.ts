import { config } from "dotenv";
config();

// src/index.ts  (right after the dotenv line)
const GROQ_KEY = process.env.GROQ_API_KEY;
if (!GROQ_KEY) {
  console.error('❌  GROQ_API_KEY is missing from .env – the server cannot start.');
  process.exit(1);
}
if (!GROQ_KEY.startsWith('gsk_')) {
  console.warn('⚠️  GROQ_API_KEY does not start with "gsk_". Double‑check that you pasted the correct key.');
}

import express from "express";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// middlewares
app.set("trust proxy", 1);   // ← added (helps Render / proxies detect HTTPS correctly)



// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins: string[] = [
//         "http://localhost:5173",
//       ];

//       const clientUrl = process.env.CLIENT_URL?.trim();
//       if (clientUrl && clientUrl.length > 0) {
//         allowedOrigins.push(clientUrl);
//       }

//       // Allow requests with no origin (Postman, curl, mobile apps, etc.)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// remove it in production
app.use(morgan("dev"));

app.use("/api/v1", appRouter);

export default app;