/**
 * Movie identification service.
 *
 * All requests go to our own Express backend (/api/identify), which
 * holds the OpenAI API key server-side. The key is never exposed to the client.
 *
 * The backend requires OPENAI_API_KEY to be set in its environment.
 */

import type { MovieResult } from "@/types/movie";

const BASE_URL = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`
  : "";

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

async function callIdentifyApi(body: { url?: string; description?: string }): Promise<{
  title: string;
  year?: string;
  genre?: string;
  description?: string;
  confidence: string;
}> {
  const res = await fetch(`${BASE_URL}/api/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorMessage = `Server error ${res.status}`;
    try {
      const err = await res.json() as { error?: string };
      if (err.error) errorMessage = err.error;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Identify a movie from a shared video URL (e.g. a TikTok link).
 */
export async function identifyMovieFromUrl(videoUrl: string): Promise<MovieResult> {
  const data = await callIdentifyApi({ url: videoUrl });
  return {
    id: makeId(),
    title: data.title,
    year: data.year,
    genre: data.genre,
    description: data.description,
    confidence: (data.confidence as MovieResult["confidence"]) ?? "low",
    identifiedAt: Date.now(),
    sourceUrl: videoUrl,
  };
}

/**
 * Identify a movie from a text description of the scene.
 */
export async function identifyMovieFromText(description: string): Promise<MovieResult> {
  const data = await callIdentifyApi({ description });
  return {
    id: makeId(),
    title: data.title,
    year: data.year,
    genre: data.genre,
    description: data.description,
    confidence: (data.confidence as MovieResult["confidence"]) ?? "low",
    identifiedAt: Date.now(),
  };
}
