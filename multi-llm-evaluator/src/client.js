import OpenAI from "openai";

if (!process.env.MESH_API_KEY) {
  console.error(
    "\nMissing MESH_API_KEY. Copy .env.example to .env and add your key.\n",
  );
  process.exit(1);
}

export const client = new OpenAI({
  apiKey: process.env.MESH_API_KEY,
  baseURL: "https://api.meshapi.ai/v1",
  timeout: 120_000,
  maxRetries: 0,
});
