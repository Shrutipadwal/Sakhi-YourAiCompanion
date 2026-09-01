import { sendOpenRouterRequest } from "../api";

export async function generateConversationTitle(userMessage) {
  const promptMessages = [
    {
      role: "system",
      content: `You are a friendly title generator.
Create a short title (2 to 5 words) that summarizes the main subject of this chat.
Return only the title text, with no punctuation or extra explanation.
If the content is sensitive or emotional, keep the title respectful and simple.
`,
    },
    {
      role: "user",
      content: `Latest user message:\n${userMessage}`,
    },
  ];

  const response = await sendOpenRouterRequest(promptMessages, {
    max_tokens: 30,
    temperature: 0.3,
  });

  const title = response.reply.trim().split("\n")[0].trim();
  return title || "New Chat";
}
