// Appwrite configuration
// These values will be set once you provide your Appwrite credentials

export const APPWRITE_ENDPOINT = process.env["EXPO_PUBLIC_APPWRITE_ENDPOINT"] ?? "https://cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = process.env["EXPO_PUBLIC_APPWRITE_PROJECT_ID"] ?? "";
export const APPWRITE_DATABASE_ID = process.env["EXPO_PUBLIC_APPWRITE_DATABASE_ID"] ?? "";
export const APPWRITE_HISTORY_COLLECTION_ID = process.env["EXPO_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID"] ?? "";

// Google OAuth Client IDs
export const GOOGLE_WEB_CLIENT_ID = process.env["EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"] ?? "";
export const GOOGLE_IOS_CLIENT_ID = process.env["EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"] ?? "";
export const GOOGLE_ANDROID_CLIENT_ID = process.env["EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"] ?? "";
