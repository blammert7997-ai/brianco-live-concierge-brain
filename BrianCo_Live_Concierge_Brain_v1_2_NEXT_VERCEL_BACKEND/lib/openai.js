import OpenAI from "openai";

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
