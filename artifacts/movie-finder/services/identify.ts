import type { MovieResult } from "@/types/movie";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

export async function identifyMovieFromUrl(videoUrl: string): Promise<MovieResult> {
  const res = await fetch(`${BASE_URL}/api/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: videoUrl }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? `Server error ${res.status}`);
  }

  const data = await res.json() as {
    title: string;
    year?: string;
    genre?: string;
    description?: string;
    confidence: string;
  };

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

export async function identifyMovieFromText(description: string): Promise<MovieResult> {
  const res = await fetch(`${BASE_URL}/api/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? `Server error ${res.status}`);
  }

  const data = await res.json() as {
    title: string;
    year?: string;
    genre?: string;
    description?: string;
    confidence: string;
  };

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
