export const COMPANION_SYSTEM_PROMPT = `
You are Sakhi, a calm, natural companion.
Speak like a trusted friend, not a chatbot.
Sometimes just acknowledge the user.
Sometimes offer a short thought.
Sometimes give one simple suggestion.
Sometimes ask a gentle question.
Avoid sounding like customer support, therapy, or a motivational speaker.
Use memories only when they clearly fit the current topic.
Keep most replies short unless the conversation needs more depth.
`;

function buildMemoryDescription(memory) {
  const lines = [];

  if (memory.name) {
    lines.push(`Name: ${memory.name}`);
  }
  if (memory.profession) {
    lines.push(`Profession: ${memory.profession}`);
  }
  if (memory.goals?.length) {
    lines.push(`Goals: ${memory.goals.join(", ")}`);
  }
  if (memory.hobbies?.length) {
    lines.push(`Hobbies: ${memory.hobbies.join(", ")}`);
  }
  if (memory.preferences?.length) {
    lines.push(`Preferences: ${memory.preferences.join(", ")}`);
  }
  if (memory.studyHabits?.length) {
    lines.push(`Study habits: ${memory.studyHabits.join(", ")}`);
  }
  if (memory.learningPreferences?.length) {
    lines.push(
      `Learning preferences: ${memory.learningPreferences.join(", ")}`,
    );
  }
  if (memory.personalChallenges?.length) {
    lines.push(`Personal challenges: ${memory.personalChallenges.join(", ")}`);
  }
  if (memory.motivationSources?.length) {
    lines.push(`Motivation sources: ${memory.motivationSources.join(", ")}`);
  }
  if (memory.lifestylePreferences?.length) {
    lines.push(
      `Lifestyle preferences: ${memory.lifestylePreferences.join(", ")}`,
    );
  }
  if (memory.importantPeople?.length) {
    lines.push(`Important People: ${memory.importantPeople.join(", ")}`);
  }
  if (memory.dreams?.length) {
    lines.push(`Dreams: ${memory.dreams.join(", ")}`);
  }

  if (lines.length === 0) {
    return "Sakhi does not have any long-term memory stored for this user yet.";
  }

  return [`Sakhi knows this about the user:`, ...lines].join("\n");
}

export function buildAssistantSystemPrompt() {
  return `
${COMPANION_SYSTEM_PROMPT.trim()}

Instructions:
- Treat long-term memory as a subtle context layer, not the main focus.
- Only mention stored details when they clearly help the current conversation.
- If the user asks about their own profile or preferences, answer from memory.
- Do not repeat memory randomly or make the user feel like they are reading back a list.
- If memory is not directly useful, keep it private and just use it to shape your tone.
- If you sense a concern under the words, acknowledge it and ask a gentle follow-up.
- Keep replies warm, direct, and conversational.
- Avoid lists, bullet points, or paragraphs that feel like a manual unless the user asks for structure.
`;
}

export function buildMemorySystemMessage(memory) {
  return `Long-term memory:
${buildMemoryDescription(memory)}

Use these details only when they help the current topic.
If the user asks about studying, use study habits and learning preferences.
If they ask about work or goals, use career goals and motivation sources.
If they mention family or relationships, use important people.
Do not repeat unrelated memory details.`.trim();
}

export function buildMemoryExtractionMessages(userMessage, existingMemory) {
  const memorySnapshot = {
    name: existingMemory.name ?? null,
    profession: existingMemory.profession ?? null,
    goals: existingMemory.goals ?? [],
    hobbies: existingMemory.hobbies ?? [],
    preferences: existingMemory.preferences ?? [],
    studyHabits: existingMemory.studyHabits ?? [],
    learningPreferences: existingMemory.learningPreferences ?? [],
    personalChallenges: existingMemory.personalChallenges ?? [],
    motivationSources: existingMemory.motivationSources ?? [],
    lifestylePreferences: existingMemory.lifestylePreferences ?? [],
    importantPeople: existingMemory.importantPeople ?? [],
    dreams: existingMemory.dreams ?? [],
  };

  return [
    {
      role: "system",
      content: `You are a memory extraction assistant.
Extract ONLY useful long-term personal information from the user's latest message.
Ignore greetings, temporary emotions, casual reactions, and momentary mood statements.
Do not save the current emotional state or short conversational details.
Capture stable user context that may help future conversations.
This includes career goals, dreams, learning preferences, study habits, personal challenges, motivation sources, lifestyle preferences, and important relationships.
Return ONLY valid JSON and nothing else.
Use this schema exactly:
{
  "name": null,
  "profession": null,
  "goals": [],
  "hobbies": [],
  "preferences": [],
  "studyHabits": [],
  "learningPreferences": [],
  "personalChallenges": [],
  "motivationSources": [],
  "lifestylePreferences": [],
  "importantPeople": [],
  "dreams": []
}
If the user does not share any useful long-term memory, return the schema with null values or empty arrays. Do not include additional keys or commentary.
`,
    },
    {
      role: "user",
      content: `Existing memory:\n${JSON.stringify(memorySnapshot, null, 2)}\n\nLatest user message:\n${userMessage}`,
    },
  ];
}
