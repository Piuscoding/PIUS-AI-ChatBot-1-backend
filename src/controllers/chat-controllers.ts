import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import OpenAI from "openai";
import { config } from "dotenv";

config(); // Load .env here as a safety net (idempotent – safe to call multiple times)

// ---------- NEW: sanity log ----------
console.log('🗝️  Groq key length:', process.env.GROQ_API_KEY?.length);
// Initialize Groq-compatible client directly
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY ?? "", // Fallback to empty string to avoid undefined
  baseURL: "https://api.groq.com/openai/v1", // Correct parameter name: baseURL (camelCase)
});

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ message: "Message is required and must be a string" });
  }

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
    }

    const messages = [
      ...user.chats.map((chat) => ({
        role: chat.role,
        content: chat.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Call Groq via OpenAI-compatible SDK
    const result = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Valid and current as of January 2026
      messages,
    });

    const groqReply = result.choices[0]?.message?.content ?? "No response from Groq.";

    // Save to database
    user.chats.push({ content: message, role: "user" });
    user.chats.push({ content: groqReply, role: "assistant" });
    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error: any) {
    console.error("Groq Error:", error);
    return res.status(500).json({
      message: "Failed to get response from Groq",
      error: error.message || "Unknown error",
    });
  }
};

// The rest of your controllers remain completely unchanged
export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    user.chats.remove({});

    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};