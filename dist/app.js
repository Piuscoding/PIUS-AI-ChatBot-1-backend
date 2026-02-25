import { config } from "dotenv";
config();
// GROQ key check
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
app.set("trust proxy", 1);
app.use(cors({
    origin: [
        "http://localhost:5173", // local development
        "http://localhost:3000", // optional
        "https://pius-ai-chatbot-1-frontend.onrender.com", // ← CHANGE THIS TO YOUR ACTUAL DEPLOYED FRONTEND URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
// remove it in production
app.use(morgan("dev"));
app.use("/api/v1", appRouter);
export default app;
//# sourceMappingURL=app.js.map