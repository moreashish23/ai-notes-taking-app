// src/lib/ai/index.ts
// Hugging Face Inference API — OpenAI-compatible router (no SDK required)
// Model: meta-llama/Llama-3.1-8B-Instruct via Cerebras (free, fast, reliable)

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct:cerebras";

export interface AIResult {
  success: boolean;
  data?: string | string[];
  error?: string;
}

// ── Core fetch helper ────────────────────────────────────────────────────────

async function callHuggingFace(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY is not set in .env.local");

  let res: Response;
  try {
    res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });
  } catch (networkErr) {
    // fetch() itself threw — DNS failure, network down, etc.
    throw new Error("Network error: could not reach Hugging Face API");
  }

  // Always read body as text first — avoids the
  // "Unexpected token 'I', Internal Server Error is not valid JSON" crash
  const rawBody = await res.text();

  if (!res.ok) {
    // Give a meaningful message without trying to JSON.parse an HTML error page
    throw new Error(
      `Hugging Face API error ${res.status}: ${rawBody.slice(0, 200)}`
    );
  }

  // Only parse JSON once we know the response is a success
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    throw new Error(`Response is not valid JSON: ${rawBody.slice(0, 200)}`);
  }

  const text =
    (json as { choices?: { message?: { content?: string } }[] })
      ?.choices?.[0]?.message?.content ?? "";

  if (!text.trim()) throw new Error("Empty response from model");
  return text.trim();
}

// ── summarizeNote ────────────────────────────────────────────────────────────

export async function summarizeNote(content: string): Promise<AIResult> {
  if (!content || content.trim().length < 50) {
    return { success: false, error: "Content too short to summarize (min 50 chars)" };
  }

  try {
    const summary = await callHuggingFace(
      "You are an expert note summarizer. Create a concise 2-3 sentence summary capturing the key points. Return ONLY the summary, no extra text.",
      `Summarize this note:\n\n${content}`,
      200
    );
    return { success: true, data: summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate summary";
    return { success: false, error: message };
  }
}

// ── improveNote ──────────────────────────────────────────────────────────────

export async function improveNote(content: string): Promise<AIResult> {
  if (!content || content.trim().length < 10) {
    return { success: false, error: "Content too short to improve" };
  }

  try {
    const improved = await callHuggingFace(
      "You are an expert editor. Improve the text for clarity, grammar, and flow while preserving the original meaning. Return ONLY the improved text, no explanations, no preamble.",
      `Improve this text:\n\n${content}`,
      1500
    );
    return { success: true, data: improved };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to improve note";
    return { success: false, error: message };
  }
}

// ── generateTags ─────────────────────────────────────────────────────────────

export async function generateTags(title: string, content: string): Promise<AIResult> {
  if (!content && !title) {
    return { success: false, error: "No content to generate tags from" };
  }

  try {
    const raw = await callHuggingFace(
      'Generate 3-6 relevant lowercase tags for the note below. Return ONLY a valid JSON array of strings, nothing else. Example: ["productivity","work","goals"]',
      `Title: ${title}\n\nContent: ${content}`,
      100
    );

    // Extract JSON array even if model wraps it in extra text
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) throw new Error("Model did not return a valid JSON array");

    const tags: string[] = JSON.parse(match[0]);
    if (!Array.isArray(tags) || tags.length === 0) throw new Error("No tags returned");

    return { success: true, data: tags.slice(0, 6) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate tags";
    return { success: false, error: message };
  }
}