import { sendOpenRouterRequest } from "../api";
import { buildMemoryExtractionMessages } from "./promptService";
import { parseJsonFromText } from "./memoryService";

export async function extractMemoryFromMessage(userMessage, existingMemory) {
  const messages = buildMemoryExtractionMessages(userMessage, existingMemory);
  const response = await sendOpenRouterRequest(messages, { cleanJson: true });
  const extracted = parseJsonFromText(response.reply);

  if (!extracted) {
    console.warn("Memory extraction returned invalid JSON:", response.reply);
    return {};
  }

  return extracted;
}
