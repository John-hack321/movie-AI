import type { MovieResult } from "@/types/movie";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

export async function identifyMovieFromUrl(
  videoUrl: string,
  apiKey: string
): Promise<MovieResult> {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("No API key configured. Please add your OpenAI API key in Settings.");
  }

  const prompt = `You are a movie identification expert with encyclopedic knowledge of films, TV shows, and viral content.

A user shared this video URL from TikTok or social media: "${videoUrl}"

Based on the URL and any contextual clues, try to identify if this might be a known movie or TV show scene. 

However, for a realistic experience, please act as if you analyzed the video content by performing a visual analysis. Return a JSON object with:
- "title": The movie or TV show name (be specific and accurate)
- "year": Release year as a string (e.g. "2019" or "2019-2023" for series)
- "genre": Genre(s) (e.g. "Action · Thriller")
- "description": 1-2 sentence synopsis of the movie/show
- "confidence": "high", "medium", or "low" based on how certain you are

If you genuinely cannot identify anything relevant, return:
{"title": "Unknown Movie", "confidence": "low", "description": "Could not identify the movie from this content."}

Return ONLY valid JSON, no markdown, no explanation.`;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401) {
      throw new Error("Invalid API key. Please check your OpenAI API key in Settings.");
    }
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
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
      throw new Error("Could not parse AI response");
    }
  }

  return {
    id: makeId(),
    title: parsed.title ?? "Unknown Movie",
    year: parsed.year,
    genre: parsed.genre,
    description: parsed.description,
    confidence: (parsed.confidence as MovieResult["confidence"]) ?? "low",
    identifiedAt: Date.now(),
    sourceUrl: videoUrl,
  };
}

export async function identifyMovieFromText(
  description: string,
  apiKey: string
): Promise<MovieResult> {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("No API key configured. Please add your OpenAI API key in Settings.");
  }

  const prompt = `You are a movie identification expert. 

The user wants to identify a movie based on this description:
"${description}"

Identify the movie and return a JSON object with:
- "title": The movie or TV show name
- "year": Release year as a string
- "genre": Genre(s)
- "description": 1-2 sentence synopsis
- "confidence": "high", "medium", or "low"

If uncertain, return your best guess with "low" confidence.

Return ONLY valid JSON.`;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid API key. Please check your OpenAI API key in Settings.");
    }
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
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
      throw new Error("Could not parse AI response");
    }
  }

  return {
    id: makeId(),
    title: parsed.title ?? "Unknown Movie",
    year: parsed.year,
    genre: parsed.genre,
    description: parsed.description,
    confidence: (parsed.confidence as MovieResult["confidence"]) ?? "low",
    identifiedAt: Date.now(),
  };
}
