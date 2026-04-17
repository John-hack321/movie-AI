/**
 * POST /api/identify
 *
 * Identifies a movie from a video URL or text description using OpenAI GPT-4o.
 * The OPENAI_API_KEY environment variable must be set on the server.
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

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

type OpenAIResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

type ParsedMovieResult = {
  title?: string;
  year?: string;
  genre?: string;
  description?: string;
  confidence?: string;
};

function parseJsonSafely(content: string): ParsedMovieResult | null {
  try {
    return JSON.parse(content.trim());
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
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

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    req.log.error("OPENAI_API_KEY environment variable is not set");
    res
      .status(500)
      .json({ error: "Movie identification service is not configured on the server" });
    return;
  }

  const prompt = url
    ? `You are a world-class movie identification expert with encyclopedic knowledge of films, TV shows, and viral content from TikTok and social media.

A user shared this video URL: "${url}"

Analyze the URL structure, domain, path segments, and any embedded metadata or slugs. TikTok movie explainer clips often contain movie names or scene keywords in their captions or creator handles. Use all available clues.

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
    const openaiRes = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      req.log.error({ status: openaiRes.status, body: errText }, "OpenAI API error");
      if (openaiRes.status === 401) {
        res.status(500).json({ error: "Invalid OpenAI API key on server" });
      } else {
        res.status(500).json({ error: "Failed to contact identification service" });
      }
      return;
    }

    const data = (await openaiRes.json()) as OpenAIResponse;
    const content = data.choices?.[0]?.message?.content ?? "";

    const parsed = parseJsonSafely(content);
    if (!parsed) {
      req.log.error({ content }, "Could not parse OpenAI response");
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
    req.log.error({ err }, "Error calling OpenAI");
    res.status(500).json({ error: "Movie identification failed. Please try again." });
  }
});

export default router;
