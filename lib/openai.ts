/**
 * OpenAI service — invoke LLM via OpenAI API
 * Same pattern: prompt in → JSON out.
 */

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type InvokeLLMOptions = {
  prompt: string;
  systemPrompt?: string;
  responseFormat?: "json_object" | "text";
};

/**
 * Invoke LLM via OpenAI.
 * Returns parsed JSON when responseFormat is json_object.
 */
export async function invokeLLM<T = unknown>({
  prompt,
  systemPrompt = "You are a helpful assistant. Return valid JSON when asked.",
  responseFormat = "json_object",
}: InvokeLLMOptions): Promise<T> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: responseFormat },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No AI response");
  }

  if (responseFormat === "json_object") {
    return JSON.parse(content) as T;
  }

  return content as T;
}
