# Interview Practice Partner — MVP

## Purpose
An AI-backed Interview Practice Partner that conducts role-specific mock interviews with voice-first interactions and provides structured post-interview feedback.

## Minimal Viable Product (MVP) Features
1. Role types supported:
   - Engineer
   - Sales
   - Retail Associate
2. Interaction modes:
   - Voice input (primary)
   - Text input fallback
3. Interviewer behavior:
   - Role-specific question sets
   - Follow-up questions based on user's answers
4. Post-interview feedback:
   - Rubric-based scoring (communication, domain knowledge, structure)
   - Short actionable improvement items
5. Session management:
   - Start / Stop interview
   - Save session transcript and feedback to local storage (or DB)

## Tech stack (initial recommendation)
- Frontend: React (TypeScript) — for UI + WebRTC / Web Speech API integration
- Backend: FastAPI (Python) or Node.js (Express) — handles session logic, scoring, and storage
- Voice processing:
  - Browser: Web Speech API for browser-based capture & speech-to-text
  - Optional server-side: Whisper / OpenAI speech models for higher fidelity
- AI: OpenAI-compatible completion API (or local LLM) for question selection, follow-ups, and feedback generation
- Storage: SQLite (MVP) or simple JSON files for saved sessions
- Dev tooling: Git, GitHub, venv (Python) / npm (Node), Docker (optional)

## Repo layout (MVP)
/interview-practice-agent
├─ README.md
├─ frontend/
│  ├─ README.md
│  └─ src/
├─ backend/
│  ├─ README.md
│  └─ app/
└─ .gitignore

## Quick start (developer)
1. Clone repo
2. Checkout `dev/mvp`
3. Start backend & frontend locally
4. Open app, select a role, start a voice mock interview

## Goals for first 30 hours
- Working voice mock interview loop (frontend + simple backend)
- Role-specific Q/A with follow-ups
- Post-interview rubric feedback generated and saved
