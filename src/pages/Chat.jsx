import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { sendMessageWithMemory } from "../services/chatService";
import { fetchConversations } from "../services/conversationListService";
import {
  createConversation,
  updateConversationTitle,
  deleteConversation,
} from "../services/conversationService";
import {
  fetchConversationMessages,
  saveConversationMessage,
} from "../services/messageService";
import { generateConversationTitle } from "../services/conversationTitleService";
import { getLastCheckIn, setLastCheckIn } from "../services/checkinService";

const supportPillars = [
  "❤️ Emotional support",
  "🎯 Career guidance",
  "📚 Study motivation",
  "🧘 Wellness check-ins",
  "💬 Conversational AI support",
  "🎙️ Voice conversations (future feature)",
];

function formatTime(timestamp) {
  if (!timestamp) {
    return "";
  }

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");
  const [latestReply, setLatestReply] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const [showCheckInPrompt, setShowCheckInPrompt] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(true);

  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const transcriptRef = useRef("");
  const chatEndRef = useRef(null);

  const SpeechRecognition = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition || null,
    [],
  );

  const supportsVoiceInput = Boolean(SpeechRecognition);

  const getTodayString = () => new Date().toISOString().slice(0, 10);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    }
    if (hour < 18) {
      return "Good afternoon";
    }
    return "Good evening";
  };

  const speakReply = (replyText) => {
    if (!replyText || !("speechSynthesis" in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    const voices = synth.getVoices ? synth.getVoices() : [];
    const preferredVoice =
      selectedVoice ||
      voices.find((voice) =>
        (voice.name || "").toLowerCase().includes("zira"),
      ) ||
      voices.find(
        (voice) =>
          (voice.name || "").toLowerCase().includes("samantha") ||
          (voice.name || "").toLowerCase().includes("siri") ||
          (voice.name || "").toLowerCase().includes("ava") ||
          (voice.name || "").toLowerCase().includes("emma"),
      ) ||
      voices.find((voice) =>
        (voice.lang || "").toLowerCase().startsWith("en"),
      ) ||
      null;

    const utterance = new SpeechSynthesisUtterance(replyText);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.08;
    utterance.volume = 0.95;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    try {
      if (recognitionRef.current && listeningRef.current) {
        listeningRef.current = false;
        setIsListening(false);
        setVoiceStatus("");
        recognitionRef.current.stop();
      }

      synth.cancel();
      if (synth.paused) {
        synth.resume();
      }
      synth.speak(utterance);
    } catch (speakError) {
      console.error("Speech playback failed:", speakError);
    }
  };

  const handlePlayAssistantReply = (replyText) => {
    speakReply(replyText);
  };

  const initializeCheckIn = async () => {
    if (!user?.uid) {
      setShowCheckInPrompt(false);
      setCheckInLoading(false);
      return;
    }

    setCheckInLoading(true);
    try {
      const storedDate = await getLastCheckIn(user.uid);
      const today = getTodayString();
      setLastCheckInDate(storedDate);
      setShowCheckInPrompt(storedDate !== today);
    } catch (checkInError) {
      console.error("Failed to load check-in status:", checkInError);
      setShowCheckInPrompt(false);
    } finally {
      setCheckInLoading(false);
    }
  };

  const loadConversationList = async (uid) => {
    const fetched = await fetchConversations(uid);
    setConversations(fetched);
    return fetched;
  };

  const openConversation = async (conversation) => {
    setActiveConversation(conversation);
    setDraft("");
    setError("");

    const storedMessages = await fetchConversationMessages(
      user.uid,
      conversation.id,
    );
    setMessages(storedMessages);
  };

  const createNewChat = async () => {
    if (!user?.uid) {
      return null;
    }

    setIsLoading(true);
    setError("");

    try {
      const created = await createConversation(user.uid);
      const list = await loadConversationList(user.uid);
      const newConversation = {
        id: created.id,
        title: created.title,
        category: null,
      };
      setActiveConversation(newConversation);
      setMessages([]);
      setConversations(list);
      return newConversation;
    } catch (creationError) {
      console.error("Failed to create new chat:", creationError);
      setError("Unable to create a new chat. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationIdToDelete) => {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) {
      return;
    }

    if (!user?.uid) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await deleteConversation(user.uid, conversationIdToDelete);
      const list = await loadConversationList(user.uid);
      setConversations(list);

      if (activeConversation?.id === conversationIdToDelete) {
        if (list.length > 0) {
          await openConversation(list[0]);
        } else {
          await createNewChat();
        }
      }
    } catch (deleteError) {
      console.error("Failed to delete conversation:", deleteError);
      setError("Unable to delete the conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialConversations = async () => {
    if (!user?.uid) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const list = await loadConversationList(user.uid);
      if (list.length > 0) {
        await openConversation(list[0]);
      } else {
        await createNewChat();
      }
    } catch (loadError) {
      console.error("Failed to load conversations:", loadError);
      setError("Unable to load your chats. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadInitialConversations();
      initializeCheckIn();
    }
  }, [user]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        return;
      }

      const ziraVoice = voices.find((voice) =>
        (voice.name || "").toLowerCase().includes("zira"),
      );
      const englishFemaleVoice = voices.find((voice) => {
        const voiceName = (voice.name || "").toLowerCase();
        const voiceLang = (voice.lang || "").toLowerCase();
        return (
          voiceLang.startsWith("en") &&
          !voiceName.includes("child") &&
          (voiceName.includes("female") ||
            voiceName.includes("woman") ||
            voiceName.includes("soft") ||
            voiceName.includes("serene") ||
            voiceName.includes("gentle") ||
            voiceName.includes("calm") ||
            voiceName.includes("soul") ||
            voiceName.includes("bella") ||
            voiceName.includes("maya") ||
            voiceName.includes("olivia") ||
            voiceName.includes("ava") ||
            voiceName.includes("emma") ||
            voiceName.includes("clara") ||
            voiceName.includes("nina") ||
            voiceName.includes("samantha") ||
            voiceName.includes("victoria") ||
            voiceName.includes("serena"))
        );
      });

      const fallbackVoice =
        voices.find((voice) =>
          (voice.lang || "").toLowerCase().startsWith("en"),
        ) || voices[0];

      setSelectedVoice(ziraVoice || englishFemaleVoice || fallbackVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!latestReply || !("speechSynthesis" in window)) {
      return;
    }

    const timer = window.setTimeout(() => {
      speakReply(latestReply);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [latestReply]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const handleSpeakingEnded = () => {
      if (recognitionRef.current && !listeningRef.current) {
        listeningRef.current = true;
        setIsListening(true);
        setVoiceStatus("I’m listening — speak now.");
      }
    };

    window.speechSynthesis.onvoiceschanged = null;
    window.speechSynthesis.addEventListener?.("end", handleSpeakingEnded);

    return () => {
      window.speechSynthesis.removeEventListener?.("end", handleSpeakingEnded);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
      setError("Unable to log out. Please try again.");
    }
  };

  const stopListening = () => {
    listeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setVoiceStatus("");
  };

  const startListening = () => {
    if (!supportsVoiceInput) {
      setVoiceError(
        "Voice input is not supported in this browser. Try Chrome or Edge.",
      );
      return;
    }

    setVoiceError("");
    setVoiceStatus("I’m listening — speak now.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      transcriptRef.current = draft.trim();
      listeningRef.current = true;
      setIsListening(true);
      setVoiceError("");
      setVoiceStatus("I’m listening — speak now.");
    };

    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (!spokenText) {
        return;
      }

      const nextMessage = [transcriptRef.current, spokenText]
        .filter(Boolean)
        .join(" ")
        .trim();
      setDraft(nextMessage);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setVoiceError(
        event?.error
          ? `Voice input error: ${event.error}. Try speaking more clearly or switch to Chrome/Edge.`
          : "Voice input stopped unexpectedly. Try again or type your message.",
      );
      listeningRef.current = false;
      setIsListening(false);
      setVoiceStatus("");
    };

    recognition.onend = () => {
      if (listeningRef.current && recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        setIsListening(false);
        setVoiceStatus("");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const processOutgoingMessage = async (messageText) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    setVoiceError("");

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setDraft("");

    try {
      setIsSaving(true);

      let currentConversation = activeConversation;
      if (!currentConversation) {
        currentConversation = await createNewChat();
      }

      const activeId = currentConversation?.id;
      if (!activeId) {
        throw new Error("No active conversation available.");
      }

      await saveConversationMessage(user.uid, activeId, {
        role: "user",
        content: trimmedMessage,
      });

      let titleUpdated = false;
      if (
        !currentConversation.title ||
        currentConversation.title === "New Chat"
      ) {
        const newTitle = await generateConversationTitle(trimmedMessage);
        await updateConversationTitle(user.uid, activeId, newTitle);
        titleUpdated = true;
      }

      const assistantReply = await sendMessageWithMemory(
        user.uid,
        activeId,
        trimmedMessage,
      );

      setLatestReply(assistantReply);
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: assistantReply,
      };
      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
      await saveConversationMessage(user.uid, activeId, {
        role: "assistant",
        content: assistantReply,
      });

      if (titleUpdated) {
        const updatedList = await loadConversationList(user.uid);
        const updatedConversation = updatedList.find(
          (item) => item.id === activeId,
        );
        if (updatedConversation) {
          setActiveConversation(updatedConversation);
        }
      } else {
        await loadConversationList(user.uid);
      }
    } catch (caughtError) {
      console.error("Chat request failed:", caughtError);
      setLatestReply("");
      setError(
        "I’m having trouble replying right now. Please try again in a moment.",
      );
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 2,
          role: "assistant",
          content:
            "I’m having a little trouble responding right now, so please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await processOutgoingMessage(draft);
  };

  const handleCheckInOption = async (emotion) => {
    const today = getTodayString();
    setShowCheckInPrompt(false);
    setLastCheckInDate(today);

    try {
      await setLastCheckIn(user.uid, today);
    } catch (storeError) {
      console.error("Failed to save check-in:", storeError);
    }

    const messagesMap = {
      good: "Today was a good day. I want to reflect on it with Sakhi.",
      okay: "Today was just okay. I would like to share how I am feeling.",
      difficult: "Today was a difficult day. I want to talk about it.",
    };

    await processOutgoingMessage(messagesMap[emotion]);
  };

  return (
    <main className="page-shell">
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div>
              <h2>Your Chats</h2>
              <p className="sidebar-subtitle">
                Switch between conversations anytime.
              </p>
            </div>
            <button
              type="button"
              className="new-chat-button"
              onClick={createNewChat}
            >
              New Chat
            </button>
          </div>

          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div className="sidebar-empty">
                No chats yet. Start a new conversation.
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${conversation.id === activeConversation?.id ? "active" : ""}`}
                  onClick={() => openConversation(conversation)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      openConversation(conversation);
                    }
                  }}
                >
                  <div>
                    <div className="conversation-title">
                      {conversation.title || "New Chat"}
                    </div>
                    <div className="conversation-meta">
                      {formatTime(conversation.updatedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteConversation(conversation.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Explore</div>
            <Link to="/journey" className="sidebar-item-link">
              🌱 My Journey
            </Link>
            <div className="sidebar-item-text">Settings</div>
          </div>
        </aside>

        <section className="app-panel chat-panel">
          <header className="top-bar">
            <div className="title-group">
              <span className="title-dot" />
              <div>
                <h1>Sakhi – AI Companion</h1>
                <p className="subtitle">
                  A calm space for a gentle conversation.
                </p>
              </div>
            </div>

            <div className="top-actions">
              {user?.email ? (
                <span className="user-chip">{user.email}</span>
              ) : null}
              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </header>

          <div className="conversation-panel-header">
            <div>
              <h2>{activeConversation?.title || "New Chat"}</h2>
              {activeConversation?.updatedAt ? (
                <p className="conversation-meta">
                  Updated {formatTime(activeConversation.updatedAt)}
                </p>
              ) : null}
            </div>
          </div>

          {showCheckInPrompt ? (
            <div className="checkin-card">
              <div className="checkin-header">
                <span>
                  {getGreeting()} {user?.displayName?.split(" ")[0] || "there"}{" "}
                  🌸
                </span>
                <p>How are you feeling today?</p>
              </div>
              <div className="checkin-options">
                <button
                  type="button"
                  className="checkin-button"
                  onClick={() => handleCheckInOption("good")}
                  disabled={isLoading}
                >
                  😊 Good day
                </button>
                <button
                  type="button"
                  className="checkin-button"
                  onClick={() => handleCheckInOption("okay")}
                  disabled={isLoading}
                >
                  😐 Just okay
                </button>
                <button
                  type="button"
                  className="checkin-button"
                  onClick={() => handleCheckInOption("difficult")}
                  disabled={isLoading}
                >
                  😔 Difficult day
                </button>
              </div>
            </div>
          ) : null}

          <div className="conversation-shell">
            <div className="message-list">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`message-bubble ${message.role}`}
                >
                  <div className="bubble-avatar">
                    {message.role === "user" ? "You" : "Sakhi"}
                  </div>
                  <div className="bubble-content">
                    {message.content}
                    {message.role === "assistant" ? (
                      <button
                        type="button"
                        className="message-action-button"
                        onClick={() =>
                          handlePlayAssistantReply(message.content)
                        }
                      >
                        🔊 Hear
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}

              {isLoading && (
                <article className="message-bubble assistant typing">
                  <div className="bubble-avatar">Sakhi</div>
                  <div className="bubble-content">Thinking gently…</div>
                </article>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="composer">
            <div className="composer-tools">
              <button
                type="button"
                className={`voice-button ${isListening ? "is-active" : ""}`}
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
              >
                {isListening ? "Stop voice" : "Voice"}
              </button>
              {voiceError ? (
                <span className="status-text warning">{voiceError}</span>
              ) : voiceStatus ? (
                <span className="status-text listening">{voiceStatus}</span>
              ) : !supportsVoiceInput ? (
                <span className="status-text warning">
                  Voice works best in Chrome or Edge. If your browser doesn’t
                  support it yet, you can type your message instead.
                </span>
              ) : null}
            </div>

            <textarea
              id="message"
              className="message-input"
              placeholder="Share what’s on your mind..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              rows={4}
            />

            <div className="composer-actions">
              <span className="hint">
                You can now use voice to speak comfortably without typing—this
                is our main feature.
              </span>
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || isSaving || !draft.trim()}
              >
                {isLoading || isSaving ? "Sending…" : "Send"}
              </button>
            </div>
          </form>

          {error ? <div className="notice-banner">{error}</div> : null}
        </section>
      </div>
    </main>
  );
}

export default Chat;
