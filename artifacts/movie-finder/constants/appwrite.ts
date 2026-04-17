/**
 * Third-party service configuration.
 *
 * In your local environment, create a `.env` file in artifacts/movie-finder/
 * (or set these in your shell / CI) before running `pnpm dev`:
 *
 *   # Google OAuth (create at https://console.cloud.google.com/)
 *   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
 *   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com    (optional)
 *   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com (optional)
 *
 *   # Appwrite (create at https://cloud.appwrite.io/)
 *   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1   (or your self-hosted URL)
 *   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
 *   EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
 *   EXPO_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID=your-collection-id
 *
 * Server-side (in the api-server workflow env):
 *   OPENAI_API_KEY=sk-...
 */

export const APPWRITE_ENDPOINT =
  process.env["EXPO_PUBLIC_APPWRITE_ENDPOINT"] ?? "https://cloud.appwrite.io/v1";

export const APPWRITE_PROJECT_ID =
  process.env["EXPO_PUBLIC_APPWRITE_PROJECT_ID"] ?? "";

export const APPWRITE_DATABASE_ID =
  process.env["EXPO_PUBLIC_APPWRITE_DATABASE_ID"] ?? "";

export const APPWRITE_HISTORY_COLLECTION_ID =
  process.env["EXPO_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID"] ?? "";

export const GOOGLE_WEB_CLIENT_ID =
  process.env["EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"] ?? "";

export const GOOGLE_IOS_CLIENT_ID =
  process.env["EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"] ?? "";

export const GOOGLE_ANDROID_CLIENT_ID =
  process.env["EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"] ?? "";
