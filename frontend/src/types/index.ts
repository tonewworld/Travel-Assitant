export interface UserPreference {
  travelStyle?: "relax" | "tight" | "balanced";
  budgetLevel?: "low" | "medium" | "high";
  foodPreference?: string;
  interests?: string[];
  transportPreference?: "public" | "taxi" | "self-drive";
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ItineraryDayItem {
  timeRange: string;
  title: string;
  description: string;
  poiName?: string;
  address?: string;
  transportAdvice?: string;
  foodAdvice?: string;
}

export interface ItineraryDay {
  day: number;
  date?: string;
  summary: string;
  items: ItineraryDayItem[];
}

export interface Itinerary {
  destination: string;
  days: number;
  startDate?: string;
  theme?: string;
  daysDetail: ItineraryDay[];
  generalTips: string[];
  transportSummary?: string;
  hotelSuggestions?: string[];
  
}