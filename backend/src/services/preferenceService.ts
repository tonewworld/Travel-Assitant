import { UserPreference } from "../models/types";

const preferenceStore: Record<string, UserPreference> = {};

export function getUserPreference(sessionId: string): UserPreference | undefined {
  return preferenceStore[sessionId];
}

export function updateUserPreference(
  sessionId: string,
  partial: Partial<UserPreference>
): UserPreference {
  const prev = preferenceStore[sessionId] || {};
  const next = { ...prev, ...partial };
  preferenceStore[sessionId] = next;
  return next;
}