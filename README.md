# Aikya

Aikya is an AI companion for supportive, personalized conversations. It can remember useful details shared in chat and use them as context in future replies.

**Live demo:** https://sakhi-youraicompanion.netlify.app/

## Features

- **Google sign-in:** Firebase Authentication protects the chat from signed-out visitors.
- **AI conversations:** Chat with Aikya for emotional support, study motivation, career guidance, wellness check-ins, or general conversation.
- **Voice input:** Speak a message using browser speech recognition in Indian English (`en-IN`) where supported.
- **Spoken replies:** Aikya prefers a Google Hindi voice when available, then Microsoft Heera, and otherwise uses the device's default voice. Voice selection is not shown in the chat interface.
- **Conversation history:** Create chats, switch between saved conversations, and delete conversations.
- **Resume recent chat:** When returning, continue the most recently updated conversation or start a new chat from a dismissible prompt.
- **Chat titles:** Aikya creates a title from the first message in a new chat; users can rename chats from the sidebar.
- **Daily check-ins:** Share a quick mood check-in once per local day to start a supportive conversation.
- **Reply actions:** Copy Aikya's replies, play or stop spoken playback, or retry the latest reply.
- **Personalized memory:** Aikya can extract longer-term details, such as goals, interests, study habits, preferences, and important people. It stores these in the user's Firestore profile and uses them as relevant context in later chats.

Voice features depend on browser and device support and may work differently between them. Voice input uses the browser's Web Speech API; some browsers may not provide speech recognition, or may require microphone permission and an internet connection. Spoken replies use voices provided by the browser or operating system. Aikya prefers Google Hindi, uses Microsoft Heera if Google Hindi is unavailable, and uses the device default if neither voice is available. If voice input is unavailable, users can type messages.

- **My Journey:** View your personal growth profile at `/journey` from the chat history sidebar. This page is available to signed-in users.

## Tech Stack

- React 19 and Vite 7
- React Router for page routing
- Firebase Authentication and Cloud Firestore
- OpenRouter for AI responses and memory extraction
- Browser Web Speech APIs for voice input and spoken replies

## Run Locally

### Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Firebase project with Google sign-in enabled and Cloud Firestore set up
- An OpenRouter API key

### Setup

1. Clone the repository and enter the project directory:

   ```bash
   git clone <repository-url>
   cd sakhi
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add your configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

   `VITE_OPENROUTER_MODEL` is optional; the default is `gpt-4o-mini`. `VITE_FIREBASE_MEASUREMENT_ID` is also optional and is not used by the current app functionality.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open the local URL printed by Vite, usually `http://localhost:5173`.

### Other Commands

```bash
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
```

## How It Works

1. Sign in with Google.
2. Start a conversation by typing or using voice input.
3. Aikya sends the message, recent conversation history, and saved memory context to OpenRouter.
4. The reply and conversation messages are saved to the signed-in user's Firestore data.
5. Aikya asks the AI to extract useful long-term details from the latest user message and updates the memory profile when it finds new information.

Memory extraction is best-effort: it depends on the AI response and may not identify every detail. It is designed for stable personal context, not temporary moods.

## Project Structure

```text
src/
  components/   Authentication and route protection
  contexts/     Shared authentication state
  pages/        Landing, chat, and personal growth screens
  services/     Chat, conversation, message, prompt, and memory logic
  api.js        OpenRouter request handling
  firebase.js   Firebase Authentication and Firestore setup
  App.jsx       Application routes
```

## Configuration and Security

- Configure Firebase Authentication to allow Google sign-in, and configure Firestore security rules so each user can access only their own data.
- Do not commit `.env` or real credentials.
- Variables prefixed with `VITE_` are included in the browser app and are visible to users. In particular, the OpenRouter key is not secret when used directly from this frontend. For a public production deployment, route AI requests through a trusted backend that keeps the key private.
- The app's data protection depends on your Firebase security rules and project configuration; the client code alone does not guarantee that stored data is private.

## Current Routes

- `/` and `/login`: landing page and Google sign-in
- `/chat`: signed-in chat experience
- `/journey`: signed-in personal growth profile
- `/signup`: redirects to `/login`

Unknown routes redirect to the landing page.
