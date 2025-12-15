import axios from "axios";
import { ChatMessage, Itinerary, UserPreference } from "../types";

const client = axios.create({
  baseURL: "/api"
});

export async function sendChat(
  message: string,
  sessionId?: string
): Promise<{ sessionId: string; messages: ChatMessage[] }> {
  const resp = await client.post("/chat", { message, sessionId });
  return resp.data;
}

export async function generateItinerary(params: {
  destination: string;
  days: number;
  startDate?: string;
  departureCity?: string;
  theme?: string;
  userPreference?: UserPreference;
  rawRequirement?: string;
}): Promise<Itinerary> {
  const resp = await client.post("/itinerary/generate", params);
  return resp.data;
}

export async function exportItineraryText(itinerary: Itinerary): Promise<string> {
  const resp = await client.post("/export/text", itinerary, {
    responseType: "text"
  });
  return resp.data;
}