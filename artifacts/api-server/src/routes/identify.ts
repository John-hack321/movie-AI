/**
 * POST /api/identify
 *
 * Identifies a movie from a video URL or text description using Google Gemini.
 * The GEMINI_API_KEY environment variable must be set on the server.
 *
 * Get your free API key at: https://aistudio.google.com/app/apikey
 *
 * Body (one of the two is required):
 *   { url: string }           — video URL shared from TikTok or social media
 *   { description: string }   — text description of the movie scene
 *
 * Response:
 *   { title, year?, genre?, description?, confidence }
 */

import { Router } from "express";

const router = Router();

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string; code?: number };
};

type ParsedMovieResult = {
  title?: string;
  year?: string;
  genre?: string;
  description?: string;
  confidence?: string;
};

function parseJsonSafely(content: string): ParsedMovieResult | null {
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  }
}

router.post("/identify", async (req, res) => {
  const { url, description } = req.body as { url?: string; description?: string };

  if (!url && !description) {
    res.status(400).json({ error: "Either url or description is required" });
    return;
  }

  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    req.log.error("GEMINI_API_KEY environment variable is not set");
    res
      .status(500)
      .json({ error: "Movie identification service is not configured on the server" });
    return;
  }

  const prompt = url
    ? `You are a world-class movie identification expert with encyclopedic knowledge of films, TV shows, and viral social media content.

A user shared this video URL: "${url}"

Analyze the URL structure, domain, path segments, and any embedded metadata or slugs. TikTok movie explainer clips often contain movie names or scene keywords in the URL path, captions, or creator handles. Use all available clues from the URL itself.

Return a JSON object with these exact keys:
- "title": The movie or TV show name (be specific and accurate)
- "year": Release year as a string (e.g. "2019", or "2019–2023" for a series)
- "genre": Genre(s) joined with " · " (e.g. "Sci-Fi · Thriller")
- "description": 1–2 sentence synopsis of the movie/show
- "confidence": One of "high", "medium", or "low" — your certainty of the match

If you cannot identify anything: {"title": "Unknown Movie", "confidence": "low", "description": "Could not identify the movie from this content."}

Return ONLY valid JSON. No markdown fences, no explanation outside the JSON.`
    : `You are a world-class movie identification expert.

A user wants to identify a movie based on this description:
"${description}"

Identify the most likely movie or TV show. Return a JSON object with these exact keys:
- "title": The movie or TV show name
- "year": Release year as a string
- "genre": Genre(s) joined with " · "
- "description": 1–2 sentence synopsis
- "confidence": One of "high", "medium", or "low"

Return ONLY valid JSON. No markdown fences, no explanation.`;

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      }),
    });

    const data = (await geminiRes.json()) as GeminiResponse;

    if (!geminiRes.ok) {
      const errMsg = data.error?.message ?? "Gemini API error";
      req.log.error({ status: geminiRes.status, error: errMsg }, "Gemini API error");
      if (geminiRes.status === 400 && data.error?.message?.includes("API key")) {
        res.status(500).json({ error: "Invalid Gemini API key on server" });
      } else {
        res.status(500).json({ error: "Failed to contact identification service" });
      }
      return;
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!content) {
      req.log.error({ data }, "Empty response from Gemini");
      res.status(500).json({ error: "No response from identification service" });
      return;
    }

    const parsed = parseJsonSafely(content);
    if (!parsed) {
      req.log.error({ content }, "Could not parse Gemini response as JSON");
      res.status(500).json({ error: "Could not parse identification result" });
      return;
    }

    const confidence = ["high", "medium", "low"].includes(parsed.confidence ?? "")
      ? parsed.confidence
      : "low";

    res.json({
      title: parsed.title ?? "Unknown Movie",
      year: parsed.year ?? undefined,
      genre: parsed.genre ?? undefined,
      description: parsed.description ?? undefined,
      confidence,
    });
  } catch (err) {
    req.log.error({ err }, "Error calling Gemini");
    res.status(500).json({ error: "Movie identification failed. Please try again." });
  }
});

export default router;
