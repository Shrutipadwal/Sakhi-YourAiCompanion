# 🌟 Sakhi - Your Personal AI Support Companion

## What is Sakhi?

Sakhi is an intelligent chatbot application that acts like a personal support companion. It listens to your problems, learns about you over time, and provides personalized advice and support. It's like having a friend who remembers everything about you and is available 24/7 to help.

**In simple terms:** You chat with an AI that remembers who you are, what matters to you, and gives you personalized help whenever you need it.

---

## 🎯 What Can Sakhi Help You With?

### Core Capabilities

1. **❤️ Emotional Support**
   - Talk about your feelings, worries, or bad days
   - Get understanding responses and helpful advice
   - Share your emotional struggles and receive compassionate guidance

2. **🎯 Career Guidance**
   - Get advice about job searches and career decisions
   - Discuss professional challenges
   - Receive help with resume tips and interview preparation

3. **📚 Study Motivation**
   - Stay motivated while studying
   - Get help organizing your learning
   - Receive encouragement during tough subjects

4. **🧘 Wellness Check-ins**
   - Talk about your physical health and fitness
   - Discuss mental wellbeing and stress management
   - Get tips for healthy living

5. **💬 Conversational Support**
   - Have natural, friendly conversations
   - Ask questions about anything
   - Get thoughtful, personalized responses

6. **🎙️ Voice Conversations** _(Coming Soon)_
   - Talk to Sakhi using voice instead of text
   - Have more natural conversations

### Smart Features That Make Sakhi Special

- **Remembers You** - Sakhi learns about your interests, goals, and personal details. Every conversation helps it understand you better
- **Auto-Saves Chats** - All your conversations are saved so you can come back to them anytime
- **Auto-Generated Titles** - The app automatically names your conversations so you can find them easily
- **Learns Your Preferences** - The AI gets better at helping you the more you chat
- **Secure Login** - Your account is protected using Google login or email/password
- **Mobile & Desktop Ready** - Works great on phones and computers
- **Real-time Sync** - Your chats are saved automatically to the cloud

---

## 🛠️ What Tools & Technology Did We Use?

### Frontend (What You See & Interact With)

- **React (v19.1.0)** - The library that builds the user interface. It makes the app interactive and fast
  - _Simple explanation:_ React is like Lego blocks for building websites. We use these blocks to create buttons, text boxes, and chat windows
- **Vite (v7.0.0)** - The build tool that runs the app during development and creates the final product
  - _Simple explanation:_ Vite is like a factory that takes our code and turns it into a working app. It's super fast!
- **React Router DOM (v7.18.1)** - Handles navigation between different pages (Login page, Chat page, etc.)
  - _Simple explanation:_ This is like a map that directs you to different pages based on what you click

- **@vitejs/plugin-react (v5.0.0)** - Makes React development faster by automatically updating changes you make
  - _Simple explanation:_ When you change your code, the app updates instantly without restarting

### Backend & Cloud Services (How Data is Stored & Processed)

- **Firebase (v12.16.0)** - A cloud service that stores user data and handles login
  - _Simple explanation:_ Think of Firebase as a secure vault in the cloud. It stores:
    - Your login credentials (email/password or Google account)
    - All your chat conversations
    - Your memory profile (things the AI learns about you)
  - It keeps everything encrypted and safe

- **OpenRouter API** - Connects us to powerful AI language models
  - _Simple explanation:_ OpenRouter is like a hub that lets us use different AI brains (like GPT, Claude, etc.) without building them ourselves
  - When you send a message, it goes through OpenRouter to the AI, which responds with thoughtful answers

### Development Tools

- **Node.js** - JavaScript runtime (allows us to run JavaScript on the computer)
- **npm** - Package manager that installs all the code libraries we need

### How Everything Works Together

```
You Type a Message
        ↓
React Interface (captures your message)
        ↓
Chat Service (adds memory context)
        ↓
OpenRouter API (sends to AI model)
        ↓
AI Responds with personalized answer
        ↓
Firebase (saves the conversation)
        ↓
You See the Response in React
```

## 📁 Project Structure - What Each File Does

Think of the project structure like a house:

- **src/** = The main rooms (components, logic, data)
- **pages/** = Different screens you see
- **components/** = Reusable building blocks
- **services/** = Behind-the-scenes helpers
- **contexts/** = Shared information for all pages

```
sakhi/  ← The entire project folder
│
├── src/  ← Source code (everything that runs)
│   │
│   ├── components/  ← Reusable building blocks
│   │   ├── GoogleAuth.jsx
│   │   │   └── Handles login with Google
│   │   │
│   │   ├── Login.jsx
│   │   │   └── Shows the login screen
│   │   │
│   │   ├── SignUp.jsx
│   │   │   └── Shows the sign-up screen
│   │   │
│   │   └── RequireAuth.jsx
│   │       └── A security guard that protects the chat page
│   │           (Only logged-in users can access it)
│   │
│   ├── contexts/  ← Shared information available everywhere
│   │   └── AuthContext.jsx
│   │       └── Tells all pages whether you're logged in or not
│   │
│   ├── pages/  ← Different screens/pages
│   │   ├── Landing.jsx
│   │   │   └── Home page with login/signup
│   │   │
│   │   └── Chat.jsx
│   │       └── Main chat screen where you talk to the AI
│   │
│   ├── services/  ← Helper functions that do important work
│   │   │
│   │   ├── chatService.js
│   │   │   └── Takes your message, adds memory context, and sends to AI
│   │   │       Then displays the response
│   │   │
│   │   ├── conversationService.js
│   │   │   └── Creates, updates, and deletes conversations
│   │   │       Like creating new folders for different chats
│   │   │
│   │   ├── conversationListService.js
│   │   │   └── Gets all your previous conversations
│   │   │       Shows your chat history
│   │   │
│   │   ├── messageService.js
│   │   │   └── Saves individual messages to the database
│   │   │       and retrieves them when you open a conversation
│   │   │
│   │   ├── conversationTitleService.js
│   │   │   └── Uses AI to give automatic titles to conversations
│   │   │       Like naming a chat "Career Advice" based on what you talked about
│   │   │
│   │   ├── memoryService.js
│   │   │   └── Manages your memory profile
│   │   │       Stores things like your goals, interests, and preferences
│   │   │
│   │   ├── memoryExtractionService.js
│   │   │   └── Reads your messages and extracts important info
│   │   │       Example: If you say "I want to be a software engineer",
│   │   │       it extracts "Goal: Software Engineer"
│   │   │
│   │   ├── promptService.js
│   │   │   └── Creates personalized system messages for the AI
│   │   │       Tells the AI about your personality, goals, and history
│   │   │
│   │   └── api.js
│   │       └── Talks to the OpenRouter API
│   │           Sends your message to the AI and gets responses
│   │
│   ├── App.jsx
│   │   └── Main app file that sets up routing
│   │       Decides which page to show based on the URL
│   │
│   ├── firebase.js
│   │   └── Connects to Firebase
│   │       Like opening the database door so we can store/read data
│   │
│   ├── main.jsx
│   │   └── Starts the React app
│   │       The entry point (like starting a video from the beginning)
│   │
│   └── index.css
│       └── Styling and colors for the entire app
│
├── index.html  ← The main HTML page (the container for React)
├── vite.config.js  ← Configuration for the build tool (Vite)
├── package.json  ← List of all dependencies and scripts
└── README.md  ← This file!
```

### Service Files Explained in Detail

#### chatService.js - The Brain of the App

**What it does:** When you send a message, this file:

1. Gets your memory profile (things the AI knows about you)
2. Builds a system prompt that tells the AI how to act
3. Gets the last few messages for context
4. Sends everything to OpenRouter API
5. Receives the AI's response
6. Updates your memory based on what you said
7. Saves the messages to Firebase

#### memoryService.js - The Memory Keeper

**What it stores about you:**

- Your goals and ambitions
- Your interests and hobbies
- Your preferences
- Personal information you've shared
- Your emotional state patterns
- Career information

#### conversationService.js - Conversation Manager

**What it does:**

- Creates a new chat folder when you start
- Stores the conversation title
- Tracks when you created/last used it
- Allows you to delete old conversations
- Updates conversation info

#### messageService.js - Message Storage

**What it does:**

- Saves each message to the database
- Remembers if it's from you (user) or the AI (assistant)
- Adds timestamps to track when messages were sent
- Retrieves messages in the right order when you open a chat

---

## 🚀 Getting Started - Step by Step Guide

### Before You Start - What You'll Need

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - This allows you to run JavaScript on your computer
   - Check if you have it: Open terminal/command prompt and type `node --version`

2. **A Code Editor**
   - Visual Studio Code (recommended) - [Download here](https://code.visualstudio.com/)
   - This is where you'll write and edit code

3. **Firebase Account** (Free)
   - Go to [firebase.google.com](https://firebase.google.com/)
   - Click "Get Started"
   - Create a new project
   - You'll get credentials (API keys, project ID, etc.)

4. **OpenRouter API Key** (Free to sign up)
   - Go to [openrouter.ai](https://openrouter.ai/)
   - Sign up for an account
   - Get your API key from settings

### Step-by-Step Installation

#### Step 1: Get the Project

**Option A: If you have Git installed**

```bash
git clone <repository-url>
cd sakhi
```

**Option B: If you don't have Git**

- Download the project folder manually
- Extract it
- Open a terminal in that folder

#### Step 2: Install All Dependencies

In the project folder, open terminal and type:

```bash
npm install
```

**What this does:** Downloads all the libraries the project needs (React, Firebase, etc.)
**Wait time:** 2-5 minutes depending on your internet

#### Step 3: Set Up Environment Variables

Create a new file called `.env` in the root folder (same level as package.json)

**Important:** This file contains your API keys. NEVER share it or push it to GitHub!

Add these lines to `.env` (replace with your actual values):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# OpenRouter API Key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**How to find these values:**

- Go to Firebase Console → Project Settings → Copy each value
- Go to OpenRouter dashboard → Settings → Copy your API key

#### Step 4: Run the App

In your terminal, type:

```bash
npm run dev
```

**What this does:**

- Starts a development server
- Usually shows: `Local: http://localhost:5173`
- Opens the app in your browser (or you can manually go to that URL)

**Your app is now running!** ✨

---

## 📦 NPM Scripts - Commands to Know

These are shortcuts to run different commands. Type them in your terminal:

### `npm run dev`

- **What it does:** Starts the development server
- **Use when:** You're developing and want to see changes immediately
- **How to stop:** Press `Ctrl + C` in the terminal

### `npm run build`

- **What it does:** Creates a production version (optimized and smaller file size)
- **Use when:** You want to deploy the app to the internet
- **Result:** Creates a `dist/` folder with the built app

### `npm run preview`

- **What it does:** Shows how the production build looks
- **Use when:** You want to test the built version before uploading
- **Good for:** Checking if everything works in production mode

---

## 🔐 How Authentication Works - Simple Explanation

Think of authentication like checking into a hotel:

1. **You Arrive** (User visits landing page)
2. **Front Desk Check** (Two options):
   - Option A: Show Google Account (Google OAuth)
   - Option B: Show email and password (Firebase Email/Password)
3. **They Verify You** (Firebase checks your credentials)
4. **You Get a Key Card** (You get an auth token - proves you're logged in)
5. **You Can Now Access** (Can access the chat page)

### The Three Authentication Stages

**Stage 1: Landing/Login Page**

- Unauthenticated users see the landing page
- They can login with Google or email/password
- Uses Firebase Authentication

**Stage 2: RequireAuth Protection**

- Certain pages (like Chat) are protected
- RequireAuth component checks: "Are you logged in?"
- If YES → Shows the page
- If NO → Redirects to login page

**Stage 3: Inside the App**

- AuthContext tells all components who the current user is
- Every message knows which user sent it
- Every conversation belongs to a specific user

---

## 💾 How Your Data is Stored - Database Structure

Imagine Firebase like a filing cabinet in the cloud:

```
Cloud Storage (Firebase)
│
└── users/  (Main folder)
    │
    └── {userId}  (Folder for each user - creates automatically with first login)
        │
        ├── memories/  (Folder storing info about the user)
        │   └── profile/  (Stored as a single document)
        │       ├── goals: ["Be a software engineer", "Learn React"]
        │       ├── interests: ["Technology", "Gaming"]
        │       ├── preferences: {theme: "dark", language: "English"}
        │       └── personalInfo: {name: "John", age: 25}
        │
        └── conversations/  (Folder storing all chats)
            │
            ├── {conversationId1}/  (First conversation)
            │   ├── title: "Career Advice Discussion"
            │   ├── createdAt: "2024-01-15"
            │   ├── updatedAt: "2024-01-16"
            │   └── messages/  (All messages in this conversation)
            │       ├── {messageId1}/
            │       │   ├── content: "I want to change careers"
            │       │   ├── role: "user"
            │       │   └── timestamp: "2024-01-15 10:30 AM"
            │       └── {messageId2}/
            │           ├── content: "That's a great goal! Let's discuss..."
            │           ├── role: "assistant"
            │           └── timestamp: "2024-01-15 10:31 AM"
            │
            └── {conversationId2}/  (Second conversation)
                ├── title: "Study Tips for Exams"
                ├── createdAt: "2024-01-16"
                ├── updatedAt: "2024-01-16"
                └── messages/  (All messages in this conversation)
                    ├── {...}
                    └── {...}
```

**Key Points:**

- Each user gets their own private folder
- Each conversation has its own subfolder
- Each message is stored with metadata (who sent it, when, etc.)
- Your data is encrypted and secure
- Only you and the AI can see your conversations

---

## 🎯 How to Use Sakhi - Complete Walkthrough

### First Time Using the App

**Step 1: Sign Up**

- Go to the landing page
- Click "Sign Up" or "Login with Google"
- Choose your method:
  - **Google**: Click the Google button (quick and easy!)
  - **Email/Password**: Enter email and password
- Firebase creates your account

**Step 2: Get Your Memory Profile Created**

- You're automatically directed to the Chat page
- Your personal memory profile is created (empty at first)
- It will fill up as you chat

**Step 3: Start Your First Chat**

- Type a message in the input field
- Hit Enter or click Send
- The AI responds with personalized help
- The AI also extracts info from your message and stores it

### Example: How Memory Works

**What You Tell Sakhi:**

```
"I'm a software engineer looking for my next opportunity in React development"
```

**What Sakhi Learns & Stores:**

- Career: Software Engineer
- Skills: React
- Goal: Looking for new job opportunity

**Next Conversation:**

```
You: "I'm stressed about interviews"
Sakhi: "I understand! As a software engineer,
interviews can be stressful. Would you like
tips specifically for technical interviews or behavior questions?"
```

Notice how Sakhi remembered you're a software engineer? That's the memory system working!

### Managing Your Conversations

#### Creating a New Conversation

- Simply start typing a new message
- The system automatically creates a new chat
- Or clear the current chat to start fresh

#### Viewing Previous Conversations

- Look at the sidebar (left side)
- All your previous chats are listed
- Click on any to open it
- Your entire conversation history appears

#### Deleting a Conversation

- Find the conversation in the sidebar
- Click the delete icon (trash/X button)
- Confirmation: "Are you sure?"
- Click confirm to permanently delete

#### Viewing Conversation Info

- Every conversation shows:
  - **Title**: Auto-generated based on content
  - **Created Date**: When you started it
  - **Last Updated**: When you last chatted
  - **Message Count**: How many messages in this conversation

---

## 🧠 How Sakhi's Brain Works - The Process Explained

When you send a message, here's exactly what happens:

```
YOU TYPE: "I'm worried about my career change"

          ↓

STEP 1: RECEIVE MESSAGE
- React captures your message
- Stores it temporarily

          ↓

STEP 2: PREPARE CONTEXT
- Memory Service retrieves your profile
  * Gets your career info
  * Gets your goals
  * Gets your interests
- Message Service gets your last 5 messages
  * Gives AI context of conversation
- Prompt Service builds a system message
  * Tells AI who you are
  * How to respond based on your profile

          ↓

STEP 3: SEND TO AI
- Chat Service sends to OpenRouter API:
  * Your message
  * Your memory profile
  * Recent conversation history
  * System prompt (tells AI how to behave)

          ↓

STEP 4: AI THINKS
- OpenRouter connects to language model
- AI analyzes everything:
  * Your message content
  * Your personality (from memory)
  * Context of conversation
- AI generates response

          ↓

STEP 5: EXTRACT MEMORY
- Memory Extraction Service reads your message
- Finds important info:
  * "worried about career change" = Emotion: Worried, About: Career
  * Extracts and stores this
- Updates your memory profile

          ↓

STEP 6: SAVE EVERYTHING
- Message Service saves:
  * Your message to database
  * AI response to database
  * Timestamp of each
- Your chat is now backed up on Firebase

          ↓

YOU SEE: AI's personalized response in the chat!
```

---

## 🤖 Understanding AI Personalization

### How the AI Gets to Know You

**Day 1 - First Conversation:**

```
You: "Hi, I'm a student struggling with STEM subjects"
Sakhi learns: Student | Struggles with STEM
Memory: {students: true, struggles: [STEM]}
```

**Day 2 - Second Conversation:**

```
You: "I want to switch to computer science"
Sakhi learns: Interested in computer science
Memory: {students: true, struggles: [STEM], goals: [computer science]}
```

**Day 3 - Third Conversation:**

```
You: "I'm learning Python and it's hard"
Sakhi: "I see you're learning Python! Since you struggled with
STEM before but want to pursue computer science, let me give you
practical tips that might help overcome those learning blocks."
Memory: {students: true, struggles: [STEM], goals: [computer science],
learning: [Python]}
```

Notice the difference? Each time it knows you better!

### What Information the AI Remembers

Your **Personal Information:**

- Name, age, location (if you share)
- Occupation or student status
- Languages spoken

Your **Goals & Ambitions:**

- Career aspirations
- Learning goals
- Personal projects

Your **Interests & Hobbies:**

- What you enjoy doing
- Topics you're passionate about
- Communities you're part of

Your **Preferences:**

- How you like to communicate
- Topics you want to avoid
- Your learning style

Your **Emotional Patterns:**

- Common concerns
- Stress triggers
- What helps you feel better

---

## 🔧 Troubleshooting Common Issues

### Issue: "I can't login with Google"

**Solution:**

1. Check your internet connection
2. Make sure you're using a valid Google account
3. Clear browser cookies and try again
4. Check if Firebase is configured correctly in `.env`

### Issue: "Conversations aren't saving"

**Solution:**

1. Check if you're connected to the internet
2. Make sure your Firebase configuration is correct
3. Check if you're authenticated
4. Look at browser console (F12) for error messages

### Issue: "AI responses are generic/not personalized"

**Solution:**

1. Continue chatting - it needs more info to learn
2. Share more about yourself explicitly
3. Check if OpenRouter API key is valid
4. Your memory profile might be empty

### Issue: "App runs but nothing displays"

**Solution:**

1. Check if Vite server is running (look for `Local: http://localhost:5173`)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh browser (Ctrl+F5)
4. Check browser console for errors

### Issue: "Dependencies won't install"

**Solution:**

1. Delete `node_modules` folder
2. Delete `package-lock.json` file
3. Run `npm install` again
4. If still fails, try: `npm install --legacy-peer-deps`

---

## 📱 Features Breakdown - Deep Dive

### Conversation Management System

**Auto-Generated Titles**

- How it works: After your first message, AI reads the conversation
- Creates a title based on topic
- Examples:
  - "Career Transition Discussion"
  - "STEM Learning Help"
  - "Wellness Check-in"
  - "Job Interview Preparation"
- You can manually edit titles if you want

**Conversation Timestamps**

- **Created**: When you started the chat
- **Last Updated**: Last message time
- Helps you know which chats are recent

**Message Organization**

- Messages stored in chronological order (oldest first)
- Each message marked as "user" or "assistant"
- Timestamps show exact time
- Makes conversation easy to read

### Memory System Deep Dive

**Memory Profile Storage**

- Stored in Firestore under your user folder
- Updated after each conversation
- Grows smarter over time
- Never shared with other users

**Memory Extraction Process**

- Reads every message you send
- Identifies key information
- Compares with existing memory
- Adds new info without removing old
- Prevents duplicates

**Memory-Powered Personalization**

- AI gets your memory profile
- Includes it in system prompt
- AI references your preferences
- Gives more relevant responses

---

## 🚀 Advanced Topics (For Developers)

### How to Modify the System Prompt

**File:** `src/services/promptService.js`

**What's Inside:**

- `COMPANION_SYSTEM_PROMPT`: The personality/character of the AI
- `buildAssistantSystemPrompt()`: Creates the main system message
- `buildMemoryDescription()`: Converts memory data to text

**To change AI behavior:**
Edit `COMPANION_SYSTEM_PROMPT` to change how AI responds

### How to Add New Memory Fields

**File:** `src/services/memoryService.js`

**Process:**

1. Find `defaultMemoryProfile()` function
2. Add new field: `newField: []`
3. Update `mergeMemoryProfiles()` to handle new field
4. Update memory extraction in `memoryExtractionService.js`

### How to Modify Conversation Fields

**File:** `src/services/conversationService.js`

**Current fields:**

- title
- createdAt
- updatedAt

To add more, update the object when creating conversations.

---

## 📚 Learning Resources

### Understanding the Code

**Start with these files:**

1. `src/App.jsx` - See overall structure
2. `src/pages/Chat.jsx` - Main page logic
3. `src/contexts/AuthContext.jsx` - Auth flow
4. `src/services/chatService.js` - Core functionality

**Recommended Learning Order:**

1. Learn how React Router works (navigation)
2. Understand Firebase setup and auth
3. Study the Chat service flow
4. Explore memory extraction logic
5. Understand data persistence

### External Documentation

- **React Docs**: [react.dev](https://react.dev/)
- **Firebase Guide**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Vite Guide**: [vitejs.dev](https://vitejs.dev/)
- **OpenRouter API**: [openrouter.ai/docs](https://openrouter.ai/docs)

---

## 🔮 Future Enhancements Planned

### Phase 1 (Soon)

- ✅ Voice input/output support
- ✅ Multiple language support
- ✅ Custom AI personality templates

### Phase 2 (Medium-term)

- ✅ Conversation sharing (with privacy settings)
- ✅ Export conversations as PDF
- ✅ Advanced analytics dashboard
- ✅ Mobile app (iOS/Android native)

### Phase 3 (Long-term)

- ✅ Multi-user collaboration chats
- ✅ Scheduled check-ins/reminders
- ✅ Integration with calendar apps
- ✅ Support for external knowledge bases

---

## 🤝 How to Contribute

### Want to Help Improve Sakhi?

1. **Find an Issue**
   - Check GitHub Issues
   - Pick one you can fix
   - Comment that you'll work on it

2. **Create Your Fix**
   - Create a new branch: `git checkout -b fix/your-issue`
   - Make your changes
   - Test thoroughly
   - Commit: `git commit -m "Fix: description of fix"`

3. **Submit Pull Request**
   - Push to GitHub
   - Create a Pull Request
   - Describe your changes
   - Wait for review

### Development Best Practices

- Write clear comments
- Test new features
- Follow existing code style
- Keep components small
- Document new services

---

## 📞 Need Help?

### Finding Answers

1. **Check the FAQ** (section above)
2. **Search Issues** on GitHub
3. **Read error messages** carefully
4. **Check browser console** (F12)
5. **Ask in discussions**

### Contact & Support

- **Issues**: [GitHub Issues](link)
- **Discussions**: [GitHub Discussions](link)
- **Email**: support@sakhi.app
- **Twitter**: [@SakhiApp](link)

---

## 📜 License & Legal

### MIT License

Sakhi is open source under the MIT License.

**In simple terms:**

- You can use it for free
- You can modify it
- You must include the license
- No warranty provided

### Privacy Notice

- Your conversations are encrypted
- Only you can see them
- We don't sell your data
- Sakhi team only sees aggregated stats

---

## 🙏 Credits & Acknowledgments

**Built with:**

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Firebase](https://firebase.google.com/) - Backend
- [OpenRouter](https://openrouter.ai/) - AI API
- [React Router](https://reactrouter.com/) - Navigation

**Special Thanks:**

- All contributors who've helped
- Firebase community for documentation
- OpenRouter team for amazing API

---

## 📊 Project Statistics

- **Total Files**: 18+
- **Lines of Code**: ~2000+
- **Dependencies**: 4 main
- **Dev Dependencies**: 2
- **Supported Browsers**: Chrome, Firefox, Safari, Edge
- **Node Version Required**: v16+

---

## ⚡ Quick Reference Cheat Sheet

```
# Start Development
npm run dev

# Build for Production
npm run build

# Preview Production Build
npm run preview

# Install Dependencies
npm install

# Check Node Version
node --version

# View Firebase Data
→ Go to Firebase Console

# View API Usage
→ Go to OpenRouter Dashboard

# Check Logs
→ Open Browser DevTools (F12)
```

---

**Last Updated:** 2026-09-01
**Version:** 1.0.0
**Status:** Active Development
