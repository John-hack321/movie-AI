/**
 * Appwrite service — handles cloud database sync for movie history.
 *
 * All functions are safe to call even when Appwrite is not configured;
 * they simply no-op and fall back to local AsyncStorage.
 *
 * Configuration: set these env vars in your local .env or Expo's app.json:
 *   EXPO_PUBLIC_APPWRITE_PROJECT_ID
 *   EXPO_PUBLIC_APPWRITE_DATABASE_ID
 *   EXPO_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID
 *   EXPO_PUBLIC_APPWRITE_ENDPOINT  (optional, defaults to cloud.appwrite.io/v1)
 *
 * Appwrite collection schema (create these attributes in your Appwrite console):
 *   userId       — string, required
 *   movieId      — string, required
 *   title        — string, required
 *   year         — string, optional
 *   genre        — string, optional
 *   description  — string, optional
 *   confidence   — string (enum: high | medium | low), required
 *   sourceUrl    — string, optional
 *   identifiedAt — datetime, required
 */

import { Client, Databases, ID, Query } from "react-native-appwrite";

import {
  APPWRITE_DATABASE_ID,
  APPWRITE_ENDPOINT,
  APPWRITE_HISTORY_COLLECTION_ID,
  APPWRITE_PROJECT_ID,
} from "@/constants/appwrite";
import type { MovieResult } from "@/types/movie";

let client: Client | null = null;
let databases: Databases | null = null;

function getServices(): { databases: Databases } | null {
  if (!APPWRITE_PROJECT_ID) return null;
  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    databases = new Databases(client);
  }
  return { databases: databases! };
}

export function isAppwriteConfigured(): boolean {
  return Boolean(
    APPWRITE_PROJECT_ID &&
    APPWRITE_DATABASE_ID &&
    APPWRITE_HISTORY_COLLECTION_ID
  );
}

/**
 * Save a movie identification result to the user's Appwrite history collection.
 * Silently no-ops if Appwrite is not configured.
 */
export async function saveMovieToHistory(
  userId: string,
  movie: MovieResult
): Promise<void> {
  const services = getServices();
  if (!services || !isAppwriteConfigured()) return;
  try {
    await services.databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_HISTORY_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movieId: movie.id,
        title: movie.title,
        year: movie.year ?? "",
        genre: movie.genre ?? "",
        description: movie.description ?? "",
        confidence: movie.confidence,
        sourceUrl: movie.sourceUrl ?? "",
        identifiedAt: new Date(movie.identifiedAt).toISOString(),
      }
    );
  } catch (err) {
    console.warn("[Appwrite] Failed to save movie to history:", err);
  }
}

/**
 * Fetch a user's movie history from Appwrite.
 * Returns an empty array if Appwrite is not configured or the request fails.
 */
export async function fetchUserHistory(userId: string): Promise<MovieResult[]> {
  const services = getServices();
  if (!services || !isAppwriteConfigured()) return [];
  try {
    const res = await services.databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_HISTORY_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("identifiedAt"),
        Query.limit(50),
      ]
    );
    return res.documents.map((doc) => ({
      id: doc["movieId"] as string,
      title: doc["title"] as string,
      year: (doc["year"] as string) || undefined,
      genre: (doc["genre"] as string) || undefined,
      description: (doc["description"] as string) || undefined,
      confidence: doc["confidence"] as MovieResult["confidence"],
      identifiedAt: new Date(doc["identifiedAt"] as string).getTime(),
      sourceUrl: (doc["sourceUrl"] as string) || undefined,
    }));
  } catch (err) {
    console.warn("[Appwrite] Failed to fetch history:", err);
    return [];
  }
}
