const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Use a specific free OpenRouter chat model by default.
// Override with VITE_OPENROUTER_MODEL if a different valid model is needed.
export const DEFAULT_MODEL =
  import.meta.env.VITE_OPENROUTER_MODEL || "gpt-4o-mini";

function estimateTokenCountForText(text) {
  if (!text || typeof text !== "string") {
    return 0;
  }
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount * 1.35));
}

function estimateTokenCountForMessages(messages) {
  return messages.reduce((sum, message) => {
    const content = `${message.role} ${message.content || ""}`;
    return sum + estimateTokenCountForText(content);
  }, 0);
}

const COMPANION_SYSTEM_PROMPT = `
You are a gentle, emotionally supportive friend-like companion for someone who feels emotionally exhausted.
Keep replies calm, warm, natural, and emotionally aware.
Use plain text only.
Do not use hashtags, markdown headings, bullet points, bold formatting, or lists.
Do not give one-line answers unless the user asks something extremely small.
Do not give very long answers either.
Aim for medium-length replies, usually around 3 to 6 sentences.
Sound caring, human, and easy to listen to, like a kind friend who stays present.
If the user shares pain, heartbreak, stress, loneliness, or confusion, respond with empathy first.
After empathy, gently offer 1 or 2 simple suggestions or reflections.
End naturally with a soft follow-up such as asking what happened, what hurt them most, or whether they want to talk more.
Do not sound robotic, clinical, preachy, or overly formal.
Do not rush to fix everything immediately. Make the user feel heard first.
`;

function cleanAssistantReply(text) {
  return text
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Sends a single user message to OpenRouter with fetch().
 * The key is loaded from the Vite environment file.
 */
export async function sendOpenRouterRequest(messages, options = {}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    const missingKeyError = {
      status: 0,
      message: "Missing VITE_OPENROUTER_API_KEY in the .env file.",
      responseText:
        "No API key was found. Add your key to the .env file and restart the dev server.",
    };

    console.error("OpenRouter configuration error:", missingKeyError);
    throw missingKeyError;
  }

  const requestBody = {
    model: DEFAULT_MODEL,
    messages,
    max_tokens: options.max_tokens ?? 220,
    temperature: options.temperature ?? 0.7,
  };

  const tokenEstimate = estimateTokenCountForMessages(messages);
  if (import.meta.env.DEV) {
    console.log(
      "OpenRouter request body:",
      JSON.stringify(requestBody, null, 2),
    );
    console.log("OpenRouter API key present:", Boolean(apiKey));
    console.log("OpenRouter model:", requestBody.model);
    console.log("OpenRouter token estimate:", tokenEstimate);
    console.log("OpenRouter request details:", {
      model: requestBody.model,
      messageCount: messages.length,
      approximateTokens: tokenEstimate,
    });
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-OpenRouter-Title": "OpenRouter Voice Test App",
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error("OpenRouter response parse error:", parseError, responseText);
    throw {
      status: response.status,
      message: "Failed to parse OpenRouter JSON response.",
      responseText,
    };
  }

  if (!response.ok) {
    const apiError = {
      status: response.status,
      message:
        data?.error?.message ||
        data?.message ||
        `Request failed with status ${response.status}.`,
      errorObject: data?.error ?? data,
      responseText,
    };

    console.error("OpenRouter API error:", apiError);
    throw apiError;
  }

  if (!Array.isArray(data?.choices) || data.choices.length === 0) {
    const responseError = {
      status: response.status,
      message: "The API response did not include choices[0].message.content.",
      responseData: data,
      responseText,
    };
    console.error("OpenRouter missing choices error:", responseError);
    throw responseError;
  }

  const assistantContent = data?.choices?.[0]?.message?.content;
  const replyText =
    typeof assistantContent === "string" ? assistantContent.trim() : "";

  if (!replyText) {
    const emptyReplyError = {
      status: response.status,
      message:
        "The API returned a successful response, but no assistant message content was found.",
      responseData: data,
      responseText,
    };

    console.error("OpenRouter empty response error:", emptyReplyError);
    throw emptyReplyError;
  }

  const reply = cleanAssistantReply(replyText);

  if (import.meta.env.DEV) {
    console.log("OpenRouter full JSON response:", data);
  }

  return { reply };
}
