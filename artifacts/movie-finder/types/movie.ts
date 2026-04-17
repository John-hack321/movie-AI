export interface MovieResult {
  id: string;
  title: string;
  year?: string;
  genre?: string;
  description?: string;
  confidence: "high" | "medium" | "low";
  identifiedAt: number;
  sourceUrl?: string;
}
