# 🌾 Kisan Sahayak - AI-Powered Agricultural Assistant

> *Empowering farmers with intelligent solutions through cutting-edge AI technology*

[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)

---

## 🚀 Quick Start Overview

Kisan Sahayak is a revolutionary agricultural assistant that combines AI agents, speech processing, and real-time data to help farmers make informed decisions. Our architecture consists of:

- **📱 Mobile App** - React Native frontend
- **🔧 Individual APIs Backend** - Core functionalities (Port 8000)
- **🤖 GCP Agents Backend** - AI-powered services (Port 8001)

---

## 📁 Project Structure

```
📦 google-agentic-ai/
├── 📱 MyApp/                    # React Native Mobile Application
├── 🔧 backend/                  # Individual APIs & Core Services
├── 🤖 gcp_agents_off_backend/   # GCP AI Agents & Intelligence Layer
└── 👤 vinayak/                  # Configuration & Credentials
```

---

## 🛠️ Prerequisites

Before diving in, ensure you have:

- **Node.js** (v16 or higher) 📦
- **Python** (v3.8 or higher) 🐍
- **Expo CLI** 📱
- **Google Cloud Platform Account** ☁️
- **Firebase Project** 🔥
- **Twilio Account** 📞
- **Bland AI Account** 🤖

---

## 🎯 Step-by-Step Setup Guide

### 📱 **STEP 1: Mobile App Setup**

Navigate to the mobile app directory and install dependencies:

```bash
cd MyApp
npm install
```

**Start the application:**
```bash
# For development with cache clearing
npx expo start --clear

# Alternative start command
npm start
```

---

### 🔧 **STEP 2: Individual APIs Backend (Port 8000)**

This backend handles core functionalities like speech processing, communications, and individual API services.

#### **Environment Setup:**

```bash
cd backend
```

**Create Virtual Environment:**
```bash
python -m venv myenv
myenv\Scripts\activate  # Windows
# source myenv/bin/activate  # macOS/Linux
```

**Install Dependencies:**
```bash
pip install -r requirements.txt
```

#### **Environment Variables (.env):**

Create a `.env` file in the `backend/` directory:

```env
# Bland AI Configuration
BLAND_API_KEY=your_bland_api_key_here
BLAND_PATHWAY_ID=your_bland_pathway_id
BLAND_PHONE_NUMBER=your_bland_phone_number
BLAND_API_URL=https://api.bland.ai

# Google Services
GOOGLE_API_KEY=your_google_api_key_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_API_KEY=your_twilio_api_key
TWILIO_API_SECRET=your_twilio_api_secret
```

#### **GCP Credentials:**

Place your `creds_gcp.json` file in the `backend/` directory with the following APIs enabled:
- ✅ Speech-to-Text API
- ✅ Text-to-Speech API
- ✅ Cloud Translation API (if needed)

#### **Start the Backend:**

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 🤖 **STEP 3: GCP Agents Backend (Port 8001)**

This backend powers the AI intelligence layer with Google Cloud Platform agents.

#### **Setup Directory Structure:**

```bash
cd gcp_agents_off_backend
mkdir creds
```

#### **Credentials Setup:**

Place the following files in `gcp_agents_off_backend/creds/`:
- `creds_gcp.json` - Google Cloud Platform service account
- `serviceAccountKey.json` - Firebase service account

#### **Environment Variables (.env):**

Create a `.env` file in the `gcp_agents_off_backend/` directory:

````markdown
# ⚡ Agentic Farm OS — Multimodal, Voice-First, Role‑Based AI Platform (built in 7 days)

> End-to-end agentic AI system: real-time voice agents, offline-first RAG, WhatsApp automation, safety guardrails, and a production mobile app — shipped fast, battle-tested, and scalable.

[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Vertex AI](https://img.shields.io/badge/Vertex%20AI-1A73E8?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)


## 🔥 Executive Summary

- Built a full agentic platform in 7 days: mobile app (React Native), two FastAPI backends, and GCP agent runner.
- Live voice agents with end-to-end context, speech-to-text and text-to-speech, streaming responses, and WhatsApp workflows.
- Safety-critical suicide-prevention flow with auto-detection triggers and live calling integration (Bland AI/Twilio-ready).
- Hybrid online/offline RAG with embeddings, intent detection, and graceful fallback — works in low-connectivity environments.
- Document builder with professional PDF generation (ReportLab), document templating, and WhatsApp delivery.
- Production-minded engineering: stateless services, CORS, typed models, health endpoints, test scripts, and docs.


## 🏗️ Monorepo Layout

```
google-agentic-ai/
├─ MyApp/                    # React Native mobile app (voice-first, multilingual)
├─ backend/                  # FastAPI core services & REST APIs (port 8000)
└─ gcp_agents_off_backend/   # GCP Agent Runner (Vertex AI + tools) (port 8001)
```


## 🧠 What makes it “Agentic”

- Role-based agents orchestrated via a multi-tool runner:
  - Voice Agent: Live STT → context-aware tools → TTS, streaming back to app.
  - Document Agent: Conversational data intake → pro PDFs → instant WhatsApp delivery.
  - Crop Doctor: Triage symptoms → RAG knowledge + rules → recommendations.
  - Marketplace Agent: Search, list, negotiate, and track orders.
  - Safety Sentinel: Suicide-risk detection → immediate escalation and helpline flows.
- Tools: Weather, market, soil, vector search, WhatsApp senders, document generation, and more.
- Provider-agnostic LLM design (Vertex AI today; can swap to OpenAI-compatible models with one adapter).


## � Mobile App (MyApp/) — React Native, Expo, Voice‑First

Highlights
- Live voice chat (multi-language), dictation, and TTS playback.
- 30+ screens: CropCycle, CropDoctor, Marketplace, Cattle, Weather, UPI, etc.
- Multilingual (8+ languages), onboarding tours, accessibility, and network fallback.
- Smart network manager with multiple backend fallbacks and offline cache.

Key files
- `App.jsx`, `index.jsx`, `i18n.js`
- `screens/` (VoiceChatInputScreen, LiveVoiceScreen, Featured, CropCycle, CropDoctor, Marketplace, UPI, …)
- `services/` (VoiceCommandAPI, CropCycleService, CropMarketplaceService, NetworkTestService, …)
- `VOICECHAT_ONBOARDING.md`, `FEATURED_ONBOARDING.md`, `MARKETPLACE_FEATURES.md`, `GOOGLE_MAPS_SETUP.md`


## 🔧 Core Backend (backend/, port 8000) — FastAPI super‑set

Feature map
- Speech-to-Text and Voice Command router.
- RAG chat (Gemini/Vertex), vector search, and offline hybrid routes.
- Document Builder + professional PDFs (ReportLab) with bilingual support.
- Marketplace, Rental, Crop Cycle, Weather, Soil Moisture, Waste Recycling.
- Free WhatsApp integration (UltraMsg/WAMR) + Twilio-ready flows.
- Suicide Prevention router with call orchestration.

Entrypoint
- `backend/main.py`: registers 14+ routers; CORS; `/` health with feature stats.

Routers (selection)
- `routers/voice_command.py` (voice intents), `routers/speech_to_text.py`
- `routers/chat_rag.py`, `routers/chat_rag_whatsapp.py`, `routers/hybrid_offline.py`
- `routers/document_builder.py`, `routers/document_generator.py`
- `routers/crop_marketplace.py`, `routers/rental.py`, `routers/crop_cycle.py`
- `routers/suicide_prevention.py`, `routers/weather.py`, `routers/soil_moisture.py`

Docs to read
- `COMPREHENSIVE_API_DOCUMENTATION.md` (189 routes across 14 modules)
- `PDF_GENERATION_COMPLETE.md` (templates, APIs, tests, performance)
- `FREE_WHATSAPP_SETUP.md` (providers, env, usage)
- `OFFLINE_IMPLEMENTATION_GUIDE.md` (hybrid online/offline with intent routing)
- `VOICE_COMMAND_TESTING_GUIDE.md` (end-to-end audio → action pipeline)


## 🤖 GCP Agents Backend (gcp_agents_off_backend/, port 8001)

Highlights
- Uses Google ADK Runner with a `root_agent` (multi-tool) — streams events, tracks tool calls.
- Endpoints: `/agent`, `/agent_with_audio`, `/audio_agent` (TTS integrated), `/health`.
- Built-in Speech-to-Text and Text-to-Speech services with language detection.
- Session store via `DatabaseSessionService` (SQLite by default; plug Postgres via `DATABASE_URL`).

Flow (agent_with_audio)
1) Accept prompt + metadata → create/reuse session → run agent streaming.
2) Capture tool invocations and tool responses.
3) If no tool returns audio, auto-generate TTS for final LLM message.
4) Return: invoked_tool, tool_result, text, audio (base64), language.

Key files
- `gcp_agents_off_backend/main.py`
- `services/speech_to_text.py`, `services/text_to_speech.py`
- `AUDIO_INTEGRATION_README.md`, `test_audio_integration.py`, `test_agent_endpoint.py`


## 🗂️ Capabilities — End to End (nothing skipped)

Multimodal, Live Voice
- Vertex AI STT and TTS; multi-language; mobile playback via `expo-av`.
- Real-time voice chat UX, with transcription and auto-language detection.

Real-time Calling Agents
- Bland AI/Twilio–ready telephone agents; backend APIs to trigger calls.
- Use-cases: safety check-ins, appointment reminders, guided assistance.

Suicide Prevention (Doctor Assistant Safety Agent)
- Risk-detection triggers → emergency call via Bland AI.
- Helplines endpoint, direct call fallback, frontend UX with status indicators.
- Strong error-handling, sensitive-data protection, safe defaults.

WhatsApp Agents (End-to-End)
- Free providers (UltraMsg/WAMR) + mock + Twilio-ready service.
- Send text, documents (generated PDFs), media; simple APIs and tests.

Document Generation (Pro PDFs)
- ReportLab engine; bilingual; 8+ templates (loan, subsidy, insurance, KCC, etc.).
- Simple PDF server (port 8002) and full Document Builder API.
- Generated docs stored under `generated_documents/` with timestamped names.

Offline‑First RAG
- Hybrid router with online→offline→cache strategy.
- Intent detection, relevance scoring, multi-source retrieval.
- Works for market prices, weather patterns, crop recommendations, schemes.

Domain Modules at Scale
- Crop Marketplace: listings, orders, negotiation, analytics.
- Enhanced Rental: items, bookings, availability, reviews, categories.
- Crop Cycle: master data, tasks, analytics, AI recommendations.


## 🧰 Tech Stack

- Frontend: React Native (Expo), `expo-av`, `@react-native-voice/voice`, i18n, React Navigation.
- APIs: FastAPI, Pydantic, CORS, Uvicorn, ReportLab.
- AI/Agents: Google ADK Runner, Vertex AI (Gemini), vector search (Chroma/Firestore search).
- Messaging: WhatsApp (UltraMsg/WAMR) + Twilio-ready.
- Data: SQLite/Postgres (via `DATABASE_URL`), Firebase support.
- Tooling: Postman collections, test scripts, `.env`-driven config.


## 🧭 Architecture (high-level)

```
		 React Native (MyApp)
			 │  voice, UI
			 ▼
	 Core API (FastAPI, :8000)
   ┌────────────┼──────────────────────────┐
   │ Voice STT  │ RAG Chat / Hybrid Offline│ Document Builder / PDF │ WhatsApp │ Safety │ Domain (Weather/Market/Soil/Crop)
   └──────┬─────┴──────────────┬───────────┴─────────┬───────────────┴─────────┬────────┘
		│                     │                       │                       │
		▼                     ▼                       ▼                       ▼
	 GCP Agents Backend (:8001) — ADK Runner, tools, sessions, TTS
		│
		▼
	Vertex AI (STT/TTS/LLM), Firebase, OpenWeather, WhatsApp Providers
```


## 🧪 Try it locally (Windows PowerShell)

Prereqs
- Node.js ≥ 18, Python ≥ 3.8, Expo CLI, GCP creds.
- Ensure Google Cloud Speech and TTS APIs are enabled.

1) Mobile app
```powershell
cd .\MyApp
npm install
expo start --clear
```

2) Core backend (:8000)
```powershell
cd ..\backend
python -m venv myenv
./myenv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

3) GCP agents backend (:8001)
```powershell
cd ..\gcp_agents_off_backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

4) Optional PDF server (:8002)
```powershell
cd ..\backend
python simple_pdf_server.py
```


## 🔑 Configuration (env)

Backend (.env in `backend/`)
```
# Google
GOOGLE_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=./creds_gcp.json

# Bland/Twilio (if using calling flows)
BLAND_API_KEY=...
BLAND_PATHWAY_ID=...
BLAND_PHONE_NUMBER=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Free WhatsApp
FREE_WHATSAPP_API_KEY=...
FREE_WHATSAPP_PHONE_NUMBER=+91XXXXXXXXXX
```

GCP Agents (.env in `gcp_agents_off_backend/`)
```
GOOGLE_API_KEY=...
DATABASE_URL=sqlite:///./sql_app.db  # or Postgres URL
OPEN_WEATHER_API_KEY=...
OPEN_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```


## 🧩 Key APIs (selection)

Core backend (:8000)
- Voice: `POST /voice-command/`, `POST /transcribe/`
- RAG: `POST /chat-rag`, `GET /hybrid/status`
- Documents: `POST /api/v1/document-builder/document/generate-pdf/{session_id}`
- WhatsApp: `POST /whatsapp/send` (and free provider variants)
- Safety: `POST /suicide-prevention/emergency-call`, `GET /suicide-prevention/helplines`
- Domain: `/marketplace/*`, `/rental/*`, `/crop-cycle/*`, `/weather/*`, `/soil-moisture/*`

GCP agents (:8001)
- `POST /agent` — tool calling + text
- `POST /agent_with_audio` — tool calling + text + auto TTS
- `POST /audio_agent` — upload audio → STT → agent → TTS response

PDF server (:8002)
- `POST /generate-pdf`, `GET /download/{id}`, `GET /templates`


## � Demo scripts

- Backend tests: `backend/test_*.py` (RAG, WhatsApp, PDF, TTS, voice)
- GCP agent tests: `gcp_agents_off_backend/test_*.py`
- Postman collection: `backend/FarmerApp.postman_collection.json`


## ⚙️ Scalability & Reliability

- Stateless services behind a reverse proxy; horizontal scale with multiple Uvicorn workers.
- Provider-agnostic LLM abstraction; swap models without app changes.
- Hybrid online/offline mode with cache-first fallbacks and intent-based routing.
- Vector search (Chroma/Firestore); indexing jobs decoupled from request path.
- Observability-ready: health endpoints, structured logs, status metadata in responses.
- Safety: rate-limits (add at proxy), sanitized errors, secure env handling, PII minimization.


## �️ Safety & Compliance

- Suicide prevention flows with explicit escalation and secure handling.
- No secrets in code; `.env`-driven config; credentials scoped by service.
- Input validation via Pydantic; CORS-enabled controlled access.


## 🏁 Resume Highlights (Agentic AI, Backend, RN)

- Architected and shipped a production-grade agentic platform in 7 days.
- Real-time voice agents: STT→tools→TTS loop with streaming UX on mobile.
- Safety-grade flows for suicide prevention with emergency escalation.
- Offline-first RAG with intent detection and relevance scoring.
- WhatsApp automations for messaging and document delivery.
- Professional PDFs from conversational inputs (loan, insurance, KCC, ...).
- Scalable FastAPI microservices; provider-agnostic LLM tools; robust tests and docs.


## 🙌 Contributing

PRs welcome. Please accompany changes with tests and docs updates.


## 📄 License

MIT
````

## 📚 Feature Inventory (deep, implemented) 

1) Live Voice Chat (Multilingual)
- What: Real-time STT→tools→TTS loop with mobile playback.
- Where: `MyApp/screens/LiveVoiceScreen.jsx`, `backend/routers/voice_command.py`, `gcp_agents_off_backend/services/speech_to_text.py`, `.../services/text_to_speech.py`.
- Endpoints: `POST /voice-command/` (8000), `POST /audio_agent` and `/agent_with_audio` (8001).

2) Automatic Language Detection (Speech/Text)
- What: Detects language and picks correct voice for TTS.
- Where: `gcp_agents_off_backend/services/text_to_speech.py` (detect_language), frontend `expo-speech`.

3) Agent Runner with Tool Streaming
- What: Google ADK Runner streams tool calls and final responses.
- Where: `gcp_agents_off_backend/main.py` (`Runner`, `root_agent`, `/agent`, `/agent_with_audio`).

4) RAG Chat with Context
- What: Chat agents use embeddings/vector search, intent detection.
- Where: `backend/routers/chat_rag.py`, `backend/services/vector_database.py`, `backend/utils/firestore_vector_search.py`.

5) Hybrid Online/Offline Mode
- What: Online→offline→cache fallback with status metadata.
- Where: `backend/routers/hybrid_offline.py`, `OFFLINE_IMPLEMENTATION_GUIDE.md`, `frontend_api_manager.js`.

6) Professional PDF Generation
- What: ReportLab-based PDFs, bilingual, 8+ templates.
- Where: `backend/services/document_generator.py`, `backend/simple_pdf_server.py`, `PDF_GENERATION_COMPLETE.md`.
- Endpoints: `POST /generate-pdf` (8002), `GET /download/{id}`.

7) Document Builder Agent
- What: Conversational intake → structured PDF output.
- Where: `backend/routers/document_builder.py`, `backend/routers/document_generator.py`.

8) WhatsApp Automation (Free Providers)
- What: Send messages and documents via UltraMsg/WAMR.
- Where: `backend/services/whatsapp_free.py`, `FREE_WHATSAPP_SETUP.md`.

9) Twilio-Ready Messaging/Calling
- What: Pluggable Twilio config for SMS/voice.
- Where: `.env` keys in `backend/`, service stubs in WhatsApp/Twilio flows.

10) Suicide Prevention Safety Agent
- What: Risk triggers → helplines + Bland AI call.
- Where: `backend/routers/suicide_prevention.py`, `SUICIDE_PREVENTION_INTEGRATION.md`.
- Endpoints: `POST /suicide-prevention/emergency-call`, `GET /suicide-prevention/helplines`.

11) Voice Command Intent Router
- What: Converts audio to actions (weather, soil, cattle, chat…).
- Where: `backend/routers/voice_command.py`, `VOICE_COMMAND_TESTING_GUIDE.md`.

12) Crop Marketplace
- What: Listings, search, orders, analytics.
- Where: `backend/routers/crop_marketplace.py`, `COMPREHENSIVE_API_DOCUMENTATION.md`.
- Prefix: `/marketplace/*`.

13) Enhanced Rental System
- What: Equipment listing, bookings, reviews, analytics.
- Where: `backend/routers/rental.py`, `COMPREHENSIVE_API_DOCUMENTATION.md`.
- Prefix: `/rental/*`.

14) Crop Cycle Management
- What: Master data, cycles, tasks, recommendations, analytics.
- Where: `backend/routers/crop_cycle.py`.
- Prefix: `/crop-cycle/*`.

15) Weather Intelligence
- What: Weather insights + agent tooling.
- Where: `backend/routers/weather.py`, `gcp_agents_off_backend/config/.env` OpenWeather usage.

16) Soil Moisture & Environmental Data
- What: Soil data endpoints + intent mapping.
- Where: `backend/routers/soil_moisture.py`.

17) Waste Recycling Module
- What: Knowledge and guidance for recycling.
- Where: `backend/routers/waste_recycling.py`.

18) Marketplace + Payments (UPI UX)
- What: UPI screens and flows in app.
- Where: `MyApp/UPI/*`, `MyApp/screens/*Payment*`.

19) Multilingual App (8+ languages)
- What: i18n, language selector, onboarding content in multiple languages.
- Where: `MyApp/languages_json/`, `MyApp/i18n.js`, `LanguageSelector.jsx`.

20) Voice UX: Mic Overlay, Playback, Mute
- What: Smooth voice interactions and controls.
- Where: `MyApp/components/MicOverlay.jsx`, `MyApp/screens/LiveVoiceScreen.jsx`.

21) Network Fallback & Diagnostics
- What: Multiple backend URLs, offline cache, connectivity tests.
- Where: `MyApp/utils/NetworkConfig.js`, `MyApp/services/NetworkTestService.js`.

22) Firebase Integration (Ready)
- What: Firebase admin client wiring and session support.
- Where: `backend/services/firebase.py`, GCP creds pattern.

23) Agent Session Store
- What: Durable sessions with DB; SQLite/Postgres.
- Where: `gcp_agents_off_backend/main.py` (DatabaseSessionService), `sql_app.db`.

24) Vector Search Options
- What: Chroma DB and Firestore vector search.
- Where: `backend/chroma_db/`, `backend/utils/firestore_vector_search.py`.

25) Testing Assets & Scripts
- What: Dozens of test scripts for WhatsApp, PDF, voice, agents.
- Where: `backend/test_*.py`, `gcp_agents_off_backend/test_*.py`, Postman collection.

26) Swagger/OpenAPI Docs
- What: FastAPI auto docs for both backends.
- Where: `http://localhost:8000/docs`, `http://localhost:8001/docs`.

27) CORS and Security Hygiene
- What: CORS set to allow app development; env-based secrets.
- Where: `backend/main.py`, `gcp_agents_off_backend/main.py`, `.env` patterns.

28) Bilingual PDFs and Indian Fonts
- What: Hindi/English supported in generated documents.
- Where: `PDF_GENERATION_COMPLETE.md`, `backend/services/document_generator.py`.

29) Marketplace Analytics & Trends
- What: Trending crops, orders insights.
- Where: `COMPREHENSIVE_API_DOCUMENTATION.md` (analytics endpoints).

30) Guided Onboarding & Tours
- What: Step-by-step tours across major screens.
- Where: `MyApp/VOICECHAT_ONBOARDING.md`, `FEATURED_ONBOARDING.md`, `CROPDOCTOR_ONBOARDING.md`.

31) Camera, Maps, and Location
- What: Camera for docs/crops; Maps for visualization; GPS for local services.
- Where: `expo-camera`, `react-native-maps`, `expo-location` wired in `MyApp/`.

32) Goal-Oriented “Role” Agents
- What: Role-based agent design (Voice, Doc, Doctor, Marketplace, Safety).
- Where: `gcp_agents_off_backend` runner; `backend/routers/*` by domain.

33) Provider-Agnostic LLM Abstraction
- What: Vertex today; swap to OpenAI-compatible with one adapter.
- Where: Tooling via Google ADK; clean agent runner interface.

34) Production Runbooks + Troubleshooting
- What: Port conflicts, venv rebuild, node cache clear.
- Where: this README, backend docs, MyApp README.

35) Windows-First Dev Commands
- What: PowerShell commands throughout for easy local dev.
- Where: “Try it locally” sections and scripts.
