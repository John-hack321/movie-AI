import { Account, Client, Databases, ID, Query } from "react-native-appwrite";

import {
  APPWRITE_DATABASE_ID,
  APPWRITE_ENDPOINT,
  APPWRITE_HISTORY_COLLECTION_ID,
  APPWRITE_PROJECT_ID,
} from "@/constants/appwrite";
import type { MovieResult } from "@/types/movie";

let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

function getClient() {
  if (!APPWRITE_PROJECT_ID) return null;
  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    account = new Account(client);
    databases = new Databases(client);
  }
  return { client, account: account!, databases: databases! };
}

export function isAppwriteConfigured(): boolean {
  return Boolean(APPWRITE_PROJECT_ID && APPWRITE_DATABASE_ID && APPWRITE_HISTORY_COLLECTION_ID);
}

export async function createGoogleSession(idToken: string, accessToken: string) {
  const services = getClient();
  if (!services) throw new Error("Appwrite not configured");
  return services.account.createOAuth2Token("google" as never, idToken, accessToken);
}

export async function createEmailSession(idToken: string) {
  const services = getClient();
  if (!services) throw new Error("Appwrite not configured");
  return services.account.createJWT();
}

export async function getAppwriteAccount() {
  const services = getClient();
  if (!services) return null;
  try {
    return await services.account.get();
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const services = getClient();
  if (!services) return;
  try {
    await services.account.deleteSession("current");
  } catch {}
}

export async function saveMovieToHistory(userId: string, movie: MovieResult) {
  const services = getClient();
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
    console.warn("Failed to save to Appwrite:", err);
  }
}

export async function fetchUserHistory(userId: string): Promise<MovieResult[]> {
  const services = getClient();
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
      id: doc.movieId as string,
      title: doc.title as string,
      year: (doc.year as string) || undefined,
      genre: (doc.genre as string) || undefined,
      description: (doc.description as string) || undefined,
      confidence: doc.confidence as MovieResult["confidence"],
      identifiedAt: new Date(doc.identifiedAt as string).getTime(),
      sourceUrl: (doc.sourceUrl as string) || undefined,
    }));
  } catch (err) {
    console.warn("Failed to fetch from Appwrite:", err);
    return [];
  }
}
