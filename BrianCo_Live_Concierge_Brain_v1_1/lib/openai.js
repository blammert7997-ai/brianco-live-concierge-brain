import OpenAI from "openai";

export function openai() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
