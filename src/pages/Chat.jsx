import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  updateConversationMessage,
} from "../services/messageService";
import { generateConversationTitle } from "../services/conversationTitleService";
import {
  getLastCheckIn,
  getLastCheckInPromptDate,
  setLastCheckIn,
  setLastCheckInPromptDate,
} from "../services/checkinService";

const checkInOptions = [
  { label: "Calm", icon: "☀️" },
  { label: "Okay", icon: "🌿" },
  { label: "Stressed", icon: "🌧️" },
  { label: "Low", icon: "☁️" },
  { label: "Hopeful", icon: "🌱" },
];

const supportPillars = [
  "❤️ Emotional support",
  "🎯 Career guidance",
  "📚 Study motivation",
  "🧘 Wellness check-ins",
  "💬 Conversational AI support",
  "🎙️ Voice input and spoken replies",
];

function getPreferredVoice(voices) {
  const googleHindi = voices.find(
    (voice) =>
      /google/i.test(voice.name) &&
      (/(hindi|हिन्दी|हिंदी)/i.test(voice.name) ||
        voice.lang.toLowerCase().startsWith("hi")),
  );
  const heera = voices.find((voice) => /heera/i.test(voice.name));

  return googleHindi || heera || null;
}

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

function getLocalDayString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [recentConversationPrompt, setRecentConversationPrompt] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [latestReply, setLatestReply] = useState("");
  const [latestReplyMessageId, setLatestReplyMessageId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [speechVoices, setSpeechVoices] = useState([]);
  const [speechVoicesReady, setSpeechVoicesReady] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [isCheckInSubmitting, setIsCheckInSubmitting] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [conversationTitleDraft, setConversationTitleDraft] = useState("");
  const [retryingMessageId, setRetryingMessageId] = useState(null);
  const [messageActionStatus, setMessageActionStatus] = useState({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(
    () => !window.matchMedia("(max-width: 980px)").matches,
  );

  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const chatEndRef = useRef(null);
  const firstCheckInOptionRef = useRef(null);
  const messageInputRef = useRef(null);
  const speakingMessageIdRef = useRef(null);

  const SpeechRecognition = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition || null,
    [],
  );

  const supportsVoiceInput = Boolean(SpeechRecognition);
  const supportsVoiceOutput = "speechSynthesis" in window;
  const canSpeakReply = supportsVoiceOutput && speechVoicesReady;

  const stopSpeech = useCallback((messageId) => {
    const currentMessageId = speakingMessageIdRef.current;
    if (!currentMessageId || (messageId && messageId !== currentMessageId)) {
      return;
    }

    speakingMessageIdRef.current = null;
    setSpeakingMessageId(null);
    setMessageActionStatus((current) => ({
      ...current,
      [currentMessageId]: "",
    }));
    window.speechSynthesis.cancel();
  }, []);

  const speakReply = useCallback(
    (messageId, content) => {
      if (!supportsVoiceOutput || !messageId) {
        return;
      }
      if (!speechVoicesReady) {
        setMessageActionStatus((current) => ({
          ...current,
          [messageId]: "Speech voices are still loading",
        }));
        return;
      }
      speakingMessageIdRef.current = null;
      window.speechSynthesis.cancel();
      speakingMessageIdRef.current = messageId;
      setSpeakingMessageId(messageId);
      setMessageActionStatus((current) => ({
        ...current,
        [messageId]: "Playing reply",
      }));

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 1;
      utterance.pitch = 1;
      const selectedVoice =
        getPreferredVoice(speechVoices) ||
        getPreferredVoice(window.speechSynthesis.getVoices());
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        if (speakingMessageIdRef.current === messageId) {
          speakingMessageIdRef.current = null;
          setSpeakingMessageId(null);
          setMessageActionStatus((current) => ({
            ...current,
            [messageId]: "",
          }));
        }
      };
      utterance.onerror = (speechError) => {
        if (speakingMessageIdRef.current !== messageId) {
          return;
        }

        speakingMessageIdRef.current = null;
        setSpeakingMessageId(null);
        if (
          speechError.error === "canceled" ||
          speechError.error === "interrupted"
        ) {
          setMessageActionStatus((current) => ({
            ...current,
            [messageId]: "",
          }));
          return;
        }

        console.error("Could not play assistant reply:", speechError);
        setMessageActionStatus((current) => ({
          ...current,
          [messageId]: "Could not play voice reply",
        }));
      };

      window.speechSynthesis.speak(utterance);
    },
    [speechVoices, speechVoicesReady, supportsVoiceOutput],
  );

  useEffect(() => {
    if (!supportsVoiceOutput) {
      return undefined;
    }

    const updateVoices = (voicesChanged = false) => {
      const voices = window.speechSynthesis.getVoices();
      setSpeechVoices(voices);
      if (voices.length > 0 || voicesChanged) {
        setSpeechVoicesReady(true);
      }
    };

    updateVoices();
    const handleVoicesChanged = () => updateVoices(true);
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      handleVoicesChanged,
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged,
      );
    };
  }, [supportsVoiceOutput]);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    let isActive = true;
    const refreshDailyCheckIn = async () => {
      try {
        const [lastCheckIn, lastPromptDate] = await Promise.all([
          getLastCheckIn(user.uid),
          getLastCheckInPromptDate(user.uid),
        ]);
        if (isActive) {
          const lastShownDate = lastPromptDate || lastCheckIn;
          setShowDailyCheckIn(lastShownDate !== getLocalDayString());
        }
      } catch (checkInError) {
        console.error("Failed to load daily check-in:", checkInError);
        if (isActive) {
          setError(
            "Unable to load today's check-in. You can still chat as usual.",
          );
        }
      }
    };
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 0, 50);
    const midnightRefresh = window.setTimeout(
      refreshDailyCheckIn,
      nextDay.getTime() - now.getTime(),
    );
    void refreshDailyCheckIn();

    return () => {
      isActive = false;
      window.clearTimeout(midnightRefresh);
    };
  }, [user]);

  useEffect(() => {
    if (!showDailyCheckIn) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstCheckInOptionRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showDailyCheckIn]);

  const loadConversationList = async (uid) => {
    const fetched = await fetchConversations(uid);
    setConversations(fetched);
    return fetched;
  };

  const closeHistoryOnSmallScreen = () => {
    if (window.matchMedia("(max-width: 980px)").matches) {
      setIsHistoryOpen(false);
    }
  };

  const openConversation = async (conversation) => {
    closeHistoryOnSmallScreen();
    stopSpeech();
    setRecentConversationPrompt(null);
    setLatestReplyMessageId(null);
    setActiveConversation(conversation);
    setDraft("");
    setError("");

    const storedMessages = await fetchConversationMessages(
      user.uid,
      conversation.id,
    );
    setMessages(storedMessages);
    setMessageActionStatus({});
    return storedMessages;
  };

  const createNewChat = async () => {
    if (!user?.uid) {
      return null;
    }

    setIsLoading(true);
    setError("");
    setRecentConversationPrompt(null);
    setLatestReplyMessageId(null);
    stopSpeech();

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
      closeHistoryOnSmallScreen();
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
        const lastMessages = await openConversation(list[0]);
        if (lastMessages.some((message) => message.role === "user")) {
          setRecentConversationPrompt(list[0]);
        }
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

  const beginRenameConversation = (event, conversation) => {
    event.stopPropagation();
    setError("");
    setEditingConversationId(conversation.id);
    setConversationTitleDraft(conversation.title || "");
  };

  const cancelRenameConversation = (event) => {
    event?.stopPropagation();
    setEditingConversationId(null);
    setConversationTitleDraft("");
  };

  const saveConversationRename = async (event, conversation) => {
    event.preventDefault();
    event.stopPropagation();

    const title = conversationTitleDraft.trim();
    if (!title) {
      setError("Chat titles cannot be empty.");
      return;
    }
    if (title.length > 60) {
      setError("Chat titles must be 60 characters or fewer.");
      return;
    }

    try {
      await updateConversationTitle(user.uid, conversation.id, title);
      setConversations((current) =>
        current.map((item) =>
          item.id === conversation.id ? { ...item, title } : item,
        ),
      );
      setActiveConversation((current) =>
        current?.id === conversation.id ? { ...current, title } : current,
      );
      setEditingConversationId(null);
      setConversationTitleDraft("");
      setError("");
    } catch (renameError) {
      console.error("Failed to rename conversation:", renameError);
      setError("Unable to rename this chat. Please try again.");
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadInitialConversations();
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    const input = messageInputRef.current;
    if (!input) {
      return;
    }

    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 144)}px`;
  }, [draft]);

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
    if (!latestReply || !latestReplyMessageId || !supportsVoiceOutput) {
      return;
    }

    speakReply(latestReplyMessageId, latestReply);
  }, [latestReply, latestReplyMessageId, speakReply, supportsVoiceOutput]);

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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const startListening = () => {
    if (!supportsVoiceInput) {
      window.alert(
        "Voice input is not supported in this browser. Try Chrome or Edge, or type your message instead.",
      );
      return;
    }

    setVoiceError("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      transcriptRef.current = draft.trim();
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      const nextMessage = [transcriptRef.current, spokenText]
        .filter(Boolean)
        .join(" ")
        .trim();
      setDraft(nextMessage);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      if (event.error === "aborted") {
        setIsListening(false);
        return;
      }

      const errorMessages = {
        "not-allowed":
          "Microphone access or speech recognition was blocked. Check browser permissions, or type your message instead.",
        "service-not-allowed":
          "This browser does not allow its speech service here. Try Chrome or Edge on HTTPS, or type your message.",
        network:
          "The speech recognition service is unavailable. Check your connection, or type your message.",
        "no-speech": "No speech was detected. Try again, or type your message.",
      };
      setVoiceError(
        errorMessages[event.error] ||
          `Voice input error: ${event.error}. You can type your message instead.`,
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (recognitionError) {
      console.error("Could not start speech recognition:", recognitionError);
      setVoiceError(
        "Could not start voice input. Check browser microphone permissions, or type your message.",
      );
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const sendUserMessage = async (content) => {
    const trimmedMessage = content.trim();
    if (!trimmedMessage || isLoading) {
      return false;
    }

    setIsLoading(true);
    setError("");
    setVoiceError("");

    const userMessage = {
      id: `pending-user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setDraft("");

    try {
      setIsSaving(true);

      let currentConversation = activeConversation;
      if (!currentConversation) {
        currentConversation = await createConversation(user.uid);
        setActiveConversation(currentConversation);
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
        setActiveConversation((current) =>
          current?.id === activeId ? { ...current, title: newTitle } : current,
        );
        setConversations((current) =>
          current.map((item) =>
            item.id === activeId ? { ...item, title: newTitle } : item,
          ),
        );
        titleUpdated = true;
      }

      const assistantReply = await sendMessageWithMemory(
        user.uid,
        activeId,
        trimmedMessage,
      );
      const assistantMessageId = await saveConversationMessage(
        user.uid,
        activeId,
        {
          role: "assistant",
          content: assistantReply,
        },
      );
      const assistantMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: assistantReply,
      };
      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
      setLatestReply(assistantReply);
      setLatestReplyMessageId(assistantMessageId);

      try {
        const updatedList = await loadConversationList(user.uid);
        if (titleUpdated) {
          const updatedConversation = updatedList.find(
            (item) => item.id === activeId,
          );
          if (updatedConversation) {
            setActiveConversation(updatedConversation);
          }
        }
      } catch (refreshError) {
        console.error(
          "Failed to refresh conversations after sending:",
          refreshError,
        );
        setError(
          "Your message was sent, but the chat list could not be refreshed.",
        );
      }
      return true;
    } catch (caughtError) {
      console.error("Chat request failed:", caughtError);
      setLatestReply("");
      setLatestReplyMessageId(null);
      setError(
        "I’m having trouble replying right now. Please try again in a moment.",
      );
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 2,
          role: "assistant",
          persisted: false,
          content:
            "I’m having a little trouble responding right now, so please try again in a moment.",
        },
      ]);
      return false;
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    void sendUserMessage(draft);
  };

  const handleDailyCheckIn = async (mood) => {
    setIsCheckInSubmitting(true);
    const sent = await sendUserMessage(
      `I’d like to check in today. I’m feeling ${mood.toLowerCase()}.`,
    );

    if (sent) {
      try {
        await setLastCheckIn(user.uid, getLocalDayString());
        setShowDailyCheckIn(false);
      } catch (checkInError) {
        console.error("Failed to save daily check-in:", checkInError);
        setError(
          "Your message was sent, but we couldn't save today's check-in status.",
        );
      }
    }
    setIsCheckInSubmitting(false);
  };

  const dismissDailyCheckIn = async () => {
    setIsCheckInSubmitting(true);
    try {
      await setLastCheckInPromptDate(user.uid, getLocalDayString());
      setShowDailyCheckIn(false);
      setError("");
    } catch (dismissError) {
      console.error("Failed to dismiss daily check-in:", dismissError);
      setError(
        "Unable to save this for today. Please try closing the check-in again.",
      );
    } finally {
      setIsCheckInSubmitting(false);
    }
  };

  const handleCopyMessage = async (message) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable in this browser.");
      }
      await navigator.clipboard.writeText(message.content);
      setMessageActionStatus((current) => ({
        ...current,
        [message.id]: "Copied",
      }));
    } catch (copyError) {
      console.error("Failed to copy assistant message:", copyError);
      setMessageActionStatus((current) => ({
        ...current,
        [message.id]: "Copy unavailable",
      }));
    }
  };

  const handleRetryMessage = async (message) => {
    const messageIndex = messages.findIndex((item) => item.id === message.id);
    const previousUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((item) => item.role === "user");

    if (!previousUserMessage || !activeConversation?.id || isLoading) {
      return;
    }

    setRetryingMessageId(message.id);
    setIsLoading(true);
    setError("");
    try {
      const assistantReply = await sendMessageWithMemory(
        user.uid,
        activeConversation.id,
        previousUserMessage.content,
        { excludeLatestAssistant: true },
      );
      await updateConversationMessage(
        user.uid,
        activeConversation.id,
        message.id,
        { content: assistantReply },
      );
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? { ...item, content: assistantReply } : item,
        ),
      );
      setLatestReply(assistantReply);
      setLatestReplyMessageId(message.id);
      setMessageActionStatus((current) => ({
        ...current,
        [message.id]: "",
      }));
    } catch (retryError) {
      console.error("Failed to retry assistant response:", retryError);
      setError("Unable to retry Aikya's reply. Please try again.");
    } finally {
      setRetryingMessageId(null);
      setIsLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className={`app-shell ${isHistoryOpen ? "history-is-open" : ""}`}>
        {isHistoryOpen ? (
          <button
            type="button"
            className="history-backdrop"
            aria-label="Close chat history"
            onClick={() => setIsHistoryOpen(false)}
          />
        ) : null}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="sidebar-brand-mark">s</span>
            <span>
              <strong>Aikya – AI Companion</strong>
              <small>A calm space for a gentle conversation.</small>
            </span>
          </div>
          <div className="sidebar-header">
            <div>
              <h2>Chat history</h2>
              <p className="sidebar-subtitle">Pick up where you left off.</p>
            </div>
            <div className="sidebar-header-actions">
              <button
                type="button"
                className="new-chat-button"
                onClick={createNewChat}
              >
                New chat
              </button>
              <button
                type="button"
                className="history-close-button"
                aria-label="Hide chat history"
                onClick={() => setIsHistoryOpen(false)}
              >
                ×
              </button>
            </div>
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
                >
                  {editingConversationId === conversation.id ? (
                    <form
                      className="conversation-rename-form"
                      onSubmit={(event) =>
                        saveConversationRename(event, conversation)
                      }
                    >
                      <input
                        aria-label="Chat title"
                        autoFocus
                        disabled={isLoading}
                        maxLength={60}
                        value={conversationTitleDraft}
                        onChange={(event) =>
                          setConversationTitleDraft(event.target.value)
                        }
                        onClick={(event) => event.stopPropagation()}
                      />
                      <button
                        type="submit"
                        className="conversation-action"
                        disabled={isLoading}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="conversation-action"
                        onClick={cancelRenameConversation}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="conversation-open-button"
                        onClick={() => openConversation(conversation)}
                      >
                        <span className="conversation-title">
                          {conversation.title || "New Chat"}
                        </span>
                        <span className="conversation-meta">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      </button>
                      <div className="conversation-actions">
                        <button
                          type="button"
                          className="delete-button"
                          aria-label={`Rename ${conversation.title || "chat"}`}
                          title="Rename chat"
                          disabled={isLoading}
                          onClick={(event) =>
                            beginRenameConversation(event, conversation)
                          }
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          aria-label={`Delete ${conversation.title || "chat"}`}
                          title="Delete chat"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteConversation(conversation.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="sidebar-footer">
            <Link to="/journey" className="sidebar-journey-link">
              My Journey
            </Link>
            <button
              type="button"
              className="sidebar-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="app-panel chat-panel">
          <header className="top-bar">
            <button
              type="button"
              className="history-toggle-button"
              aria-expanded={isHistoryOpen}
              aria-label={
                isHistoryOpen ? "Hide chat history" : "Show chat history"
              }
              onClick={() => setIsHistoryOpen((isOpen) => !isOpen)}
            >
              <span aria-hidden="true">{isHistoryOpen ? "‹" : "›"}</span>
            </button>
            <div className="conversation-panel-header">
              <div className="active-conversation-heading">
                <h2>{activeConversation?.title || "New Chat"}</h2>
                {activeConversation?.updatedAt ? (
                  <p className="active-conversation-meta">
                    Updated {formatTime(activeConversation.updatedAt)}
                  </p>
                ) : null}
              </div>
            </div>
          </header>

          {recentConversationPrompt ? (
            <aside
              className="continue-conversation-prompt"
              aria-label="Continue your last conversation"
            >
              <div className="continue-conversation-copy">
                <span className="continue-conversation-eyebrow">
                  Welcome back
                </span>
                <strong>
                  Continue “
                  {recentConversationPrompt.title || "your last conversation"}
                  ”?
                </strong>
                <span className="continue-conversation-time">
                  Last active {formatTime(recentConversationPrompt.updatedAt)}
                </span>
              </div>
              <div className="continue-conversation-actions">
                <button
                  type="button"
                  className="continue-conversation-button"
                  onClick={() => openConversation(recentConversationPrompt)}
                >
                  Continue
                </button>
                <button
                  type="button"
                  className="continue-new-chat-button"
                  onClick={createNewChat}
                >
                  New chat
                </button>
              </div>
              <button
                type="button"
                className="continue-conversation-dismiss"
                aria-label="Dismiss continue conversation prompt"
                onClick={() => setRecentConversationPrompt(null)}
              >
                ×
              </button>
            </aside>
          ) : null}

          {showDailyCheckIn ? (
            <div
              className="check-in-overlay"
              onKeyDown={(event) => {
                if (event.key === "Escape" && !isCheckInSubmitting) {
                  void dismissDailyCheckIn();
                }
              }}
            >
              <section
                className="daily-check-in check-in-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="check-in-title"
                aria-describedby="check-in-description"
              >
                <button
                  type="button"
                  className="check-in-dismiss-icon"
                  aria-label="Dismiss today's check-in"
                  onClick={dismissDailyCheckIn}
                  disabled={isLoading || isCheckInSubmitting}
                >
                  ×
                </button>
                <div className="check-in-copy">
                  <span className="check-in-eyebrow">
                    A little space for you
                  </span>
                  <h3 id="check-in-title">How are you feeling today?</h3>
                  <p id="check-in-description">
                    A small check-in can help Aikya meet you where you are.
                  </p>
                </div>
                <div className="check-in-options">
                  {checkInOptions.map((option, index) => (
                    <button
                      key={option.label}
                      ref={index === 0 ? firstCheckInOptionRef : undefined}
                      type="button"
                      onClick={() => handleDailyCheckIn(option.label)}
                      disabled={isLoading || isCheckInSubmitting}
                    >
                      <span aria-hidden="true">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
                {error ? (
                  <p className="check-in-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="check-in-skip"
                  onClick={dismissDailyCheckIn}
                  disabled={isLoading || isCheckInSubmitting}
                >
                  Not now
                </button>
              </section>
            </div>
          ) : null}

          <div className="conversation-shell">
            <div className="message-list">
              {messages.map((message, index) => (
                <article
                  key={message.id}
                  className={`message-bubble ${message.role}`}
                >
                  <div className="bubble-avatar">
                    {message.role === "user" ? "You" : "Aikya"}
                  </div>
                  <div className="message-body">
                    <div className="bubble-content">{message.content}</div>
                    {message.role === "assistant" &&
                    message.persisted !== false ? (
                      <div className="assistant-message-actions">
                        <div className="message-action-buttons">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(message)}
                            aria-label="Copy Aikya's reply"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            className="message-speak-button"
                            onClick={() =>
                              speakReply(message.id, message.content)
                            }
                            aria-label="Play Aikya's reply aloud"
                            title="Play reply aloud"
                            disabled={!canSpeakReply}
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              focusable="false"
                            >
                              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                              <path d="M16 9a5 5 0 0 1 0 6" />
                              <path d="M18.5 6.5a9 9 0 0 1 0 11" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="message-speak-button message-stop-button"
                            onClick={() => stopSpeech(message.id)}
                            aria-label="Stop Aikya's spoken reply"
                            title="Stop speaking"
                            disabled={
                              !supportsVoiceOutput ||
                              speakingMessageId !== message.id
                            }
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              focusable="false"
                            >
                              <rect x="7" y="7" width="10" height="10" rx="1" />
                            </svg>
                          </button>
                          {index === messages.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => handleRetryMessage(message)}
                              disabled={
                                isLoading || retryingMessageId === message.id
                              }
                            >
                              {retryingMessageId === message.id
                                ? "Trying again…"
                                : "Retry"}
                            </button>
                          ) : null}
                        </div>
                        {messageActionStatus[message.id] ? (
                          <span className="message-action-status" role="status">
                            {messageActionStatus[message.id]}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}

              {isLoading && (
                <article className="message-bubble assistant typing">
                  <div className="bubble-avatar">Aikya</div>
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
                aria-label={
                  isListening
                    ? "Stop voice input"
                    : "Start voice input in Indian English"
                }
              >
                {isListening ? "Stop voice" : "Voice"}
              </button>
              {voiceError ? (
                <span className="status-text warning" role="status">
                  {voiceError}
                </span>
              ) : null}
            </div>

            <textarea
              ref={messageInputRef}
              id="message"
              className="message-input"
              placeholder="Share what’s on your mind..."
              value={draft}
              aria-label="Message to Aikya"
              disabled={isLoading || isSaving}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              rows={1}
            />

            <div className="composer-actions">
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
