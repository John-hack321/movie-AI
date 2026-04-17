import { Router } from "express";

const router = Router();

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

router.post("/identify", async (req, res) => {
  const { url, description } = req.body as { url?: string; description?: string };

  if (!url && !description) {
    res.status(400).json({ error: "Either url or description is required" });
    return;
  }

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    req.log.error("OPENAI_API_KEY environment variable is not set");
    res.status(500).json({ error: "Movie identification service is not configured" });
    return;
  }

  let prompt: string;

  if (url) {
    prompt = `You are a world-class movie identification expert with encyclopedic knowledge of films, TV shows, and viral content from TikTok and social media.

A user shared this video URL: "${url}"

Analyze the URL structure, domain, and any embedded metadata. Many TikTok movie clips have descriptive slugs or captions that hint at the movie. Use every available clue.

Also consider: this is a "movie explainer" type TikTok — these videos typically recap or analyze popular movies. Common movies that go viral on TikTok include: popular blockbusters, cult classics, horror films, and Oscar contenders.

Return a JSON object with:
- "title": The movie or TV show name (be specific)
- "year": Release year as a string (e.g. "2019")
- "genre": Genre(s) (e.g. "Sci-Fi · Thriller")
- "description": 1-2 sentence synopsis
- "confidence": "high", "medium", or "low" based on certainty

If you cannot identify: {"title": "Unknown Movie", "confidence": "low", "description": "Could not identify the movie from this content."}

Return ONLY valid JSON, no markdown, no explanation.`;
  } else {
    prompt = `You are a world-class movie identification expert.

A user wants to identify a movie based on this description:
"${description}"

Identify the most likely movie or TV show. Return a JSON object with:
- "title": The movie or TV show name
- "year": Release year as a string
- "genre": Genre(s)
- "description": 1-2 sentence synopsis
- "confidence": "high", "medium", or "low"

Return ONLY valid JSON.`;
  }

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
      res.status(500).json({ error: "Failed to identify movie" });
      return;
    }

    const data = await openaiRes.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";

    let parsed: {
      title?: string;
      year?: string;
      genre?: string;
      description?: string;
      confidence?: string;
    };

    try {
      parsed = JSON.parse(content.trim());
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        req.log.error({ content }, "Could not parse OpenAI response");
        res.status(500).json({ error: "Could not parse identification result" });
        return;
      }
    }

    res.json({
      title: parsed.title ?? "Unknown Movie",
      year: parsed.year,
      genre: parsed.genre,
      description: parsed.description,
      confidence: parsed.confidence ?? "low",
    });
  } catch (err) {
    req.log.error({ err }, "Error calling OpenAI");
    res.status(500).json({ error: "Movie identification failed" });
  }
});

export default router;
