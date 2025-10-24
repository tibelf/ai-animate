# 🎬 AI Anime Generation System

Transform your novel text into beautiful 2D anime short films with AI.

## 📖 Overview

This system automatically converts novel text into animated short films with character consistency, scene transitions, and camera effects. Users can review and confirm characters and keyframes at each step to ensure story coherence and visual quality.

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Next.js Application            │
│   ├─ Frontend (React)            │
│   │  - Novel input               │
│   │  - Character confirmation    │
│   │  - Progress tracking         │
│   │  - Video preview             │
│   │                              │
│   └─ Backend (API Routes)        │
│      - Text parsing (Qiniu LLM)  │
│      - Pipeline orchestration    │
│      - Context management        │
│      - Status tracking           │
└───────────────┬─────────────────┘
                │ HTTP APIs
┌───────────────┴─────────────────┐
│   AI Services Layer              │
│   ├─ LLM (Qiniu) ✅              │
│   ├─ Image Generation 🔲         │
│   ├─ Video Generation 🔲         │
│   ├─ LoRA Training 🔲            │
│   └─ TTS 🔲                      │
└──────────────────────────────────┘
```

✅ = Implemented | 🔲 = Placeholder (awaiting API docs)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
cd frontend
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local and add your Qiniu API key

# Run development server
npm run dev
```

Application will run at `http://localhost:3000`

### Using the Start/Stop Scripts

For convenience, you can use the provided scripts:

```bash
# Start the application
./start.sh

# Stop the application
./stop.sh
```

## 📋 Features

### Currently Implemented

- ✅ **Text Parsing**: LLM-powered novel analysis (Qiniu API)
- ✅ **Context Management**: JSON-based project state with history snapshots
- ✅ **Serial Pipeline**: Sequential task execution avoiding concurrency issues
- ✅ **Progress Tracking**: Real-time status updates
- ✅ **API Routes**: Next.js API routes for all backend functionality
- ✅ **Frontend UI**: Next.js 15 with shadcn/ui components
- ✅ **Responsive Design**: Mobile-friendly interface

### Placeholders (Awaiting API Documentation)

The following services have placeholder implementations ready for integration:

- 🔲 **Image Generation**: Character and scene image generation
- 🔲 **Video Generation**: I2V (Image-to-Video) animation
- 🔲 **LoRA Training**: Character consistency training
- 🔲 **TTS**: Text-to-speech for dialogue

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# Qiniu LLM Configuration
QINIU_LLM_BASE_URL=https://openai.qiniu.com/v1
QINIU_API_KEY=your_qiniu_api_key_here
QINIU_LLM_MODEL=deepseek-v3
QINIU_LLM_MAX_TOKENS=4096
QINIU_LLM_TIMEOUT=60000

# Other AI services (add when available)
IMAGE_GEN_BASE_URL=
IMAGE_GEN_API_KEY=
# ... etc
```

## 📚 API Routes

### Main Endpoints

- `POST /api/parse-text` - Parse novel into scenes/characters
- `POST /api/confirm-character` - Confirm character selection
- `POST /api/continue-generation?project_id=xxx` - Continue after confirmation
- `GET /api/task-status/[project_id]` - Get progress
- `GET /api/context/[project_id]` - Get project context
- `POST /api/rollback` - Rollback to previous version

## 🎯 Workflow

1. **Input Novel** → User enters text on home page
2. **Parse Text** → LLM extracts characters and scenes
3. **Confirm Characters** → User reviews generated character options
4. **Generate Content** → System creates keyframes and videos
5. **Preview** → User watches final animated video

## 📁 Project Structure

```
ai-animate/
├── frontend/                  # Next.js application
│   ├── app/
│   │   ├── api/              # API Routes (backend)
│   │   │   ├── parse-text/
│   │   │   ├── confirm-character/
│   │   │   ├── continue-generation/
│   │   │   ├── task-status/
│   │   │   ├── context/
│   │   │   └── rollback/
│   │   ├── characters/       # Character confirmation page
│   │   ├── scenes/           # Scene tracking page
│   │   ├── preview/          # Video preview page
│   │   └── page.tsx          # Home page (novel input)
│   ├── components/           # UI components
│   ├── lib/
│   │   ├── services/         # AI service clients
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities (context manager, pipeline)
│   └── ...
├── context/                  # Project contexts (generated)
├── start.sh                  # Start script
├── stop.sh                   # Stop script
└── README.md                 # This file
```

## 🔌 Adding New AI Services

When API documentation becomes available:

1. Update service client in `frontend/lib/services/`
2. Add environment variables to `.env.local`
3. Update pipeline logic in `frontend/lib/utils/pipeline.ts`
4. Test integration
5. Update documentation

## 🤝 Contributing

This is a private project. For questions or issues, contact the project team.

## 📄 License

Copyright © 2025 AI Animate Team. All rights reserved.

## 🙏 Acknowledgments

- **Qiniu AI**: LLM API for text parsing
- **Next.js**: React framework with built-in API routes
- **shadcn/ui**: Component library
- **Tailwind CSS**: Styling framework

---

**Status**: 🟢 Core framework implemented, ready for AI service integration
