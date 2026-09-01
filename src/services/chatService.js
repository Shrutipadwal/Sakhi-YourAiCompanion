import {
  getMemoryProfile,
  mergeMemoryProfiles,
  saveMemoryProfile,
  isMemoryProfileEqual,
} from "./memoryService";
import {
  buildAssistantSystemPrompt,
  buildMemorySystemMessage,
} from "./promptService";
import { extractMemoryFromMessage } from "./memoryExtractionService";
import { sendOpenRouterRequest } from "../api";
import { fetchRecentConversationMessages } from "./messageService";

export async function sendMessageWithMemory(
  uid,
  conversationId,
  latestUserMessage,
) {
  const memoryProfile = await getMemoryProfile(uid);
  console.log("Memory loaded", memoryProfile);

  const systemPrompt = buildAssistantSystemPrompt();
  const memoryMessage = buildMemorySystemMessage(memoryProfile);
  const recentHistory = await fetchRecentConversationMessages(
    uid,
    conversationId,
    6,
  );

  console.log(
    "Loaded recent history messages:",
    recentHistory.length,
    recentHistory,
  );

  const lastHistoryMessage = recentHistory[recentHistory.length - 1];
  const latestUserIncluded =
    lastHistoryMessage?.role === "user" &&
    lastHistoryMessage?.content === latestUserMessage;

  const assistantRequestMessages = [
    { role: "system", content: systemPrompt },
    { role: "system", content: memoryMessage },
    ...recentHistory.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    ...(latestUserIncluded
      ? []
      : [
          {
            role: "user",
            content: latestUserMessage,
          },
        ]),
  ];

  console.log("OpenRouter request messages:", assistantRequestMessages);

  const assistantResponse = await sendOpenRouterRequest(
    assistantRequestMessages,
  );
  const assistantReply = assistantResponse.reply;
  console.log("Assistant response received");

  let extractedMemory = {};
  try {
    extractedMemory = await extractMemoryFromMessage(
      latestUserMessage,
      memoryProfile,
    );
    console.log("Memory extracted", extractedMemory);
  } catch (error) {
    console.error("Memory extraction failed:", error);
  }

  const mergedMemory = mergeMemoryProfiles(memoryProfile, extractedMemory);

  if (!isMemoryProfileEqual(memoryProfile, mergedMemory)) {
    await saveMemoryProfile(uid, mergedMemory);
    console.log("Firestore updated", mergedMemory);
  } else {
    console.log("No memory changes detected");
  }

  return assistantReply;
}
