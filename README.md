# 🎬 AI Anime Generation System

Transform your novel text into beautiful 2D anime short films with AI.

## 📖 Overview

This system automatically converts novel text into animated short films with character consistency, scene transitions, and camera effects. Users can review and confirm characters and keyframes at each step to ensure story coherence and visual quality.

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Frontend (Next.js + shadcn/ui)│
│   - Novel input                  │
│   - Character confirmation       │
│   - Progress tracking            │
│   - Video preview                │
└───────────────┬─────────────────┘
                │ REST / WebSocket
┌───────────────┴─────────────────┐
│   Backend (FastAPI)              │
│   - Text parsing (Qiniu LLM)     │
│   - Pipeline orchestration       │
│   - Context management           │
│   - Status tracking              │
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

- Python 3.10+
- Node.js 18+
- Poetry (Python package manager)

### Backend Setup

```bash
cd backend

# Install dependencies
pip install poetry
poetry install

# Configure API keys
cp config.yaml.example config.yaml
# Edit config.yaml and add your Qiniu API key

# Run server
poetry run python -m app.main
```

Backend will run at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local if needed (default points to localhost:8000)

# Run development server
npm run dev
```

Frontend will run at `http://localhost:3000`

## 📋 Features

### Currently Implemented

- ✅ **Text Parsing**: LLM-powered novel analysis (Qiniu API)
- ✅ **Context Management**: JSON-based project state with history snapshots
- ✅ **Serial Pipeline**: Sequential task execution avoiding concurrency issues
- ✅ **Progress Tracking**: Real-time WebSocket updates
- ✅ **API Structure**: FastAPI backend with comprehensive endpoints
- ✅ **Frontend UI**: Next.js 15 with shadcn/ui components
- ✅ **Responsive Design**: Mobile-friendly interface

### Placeholders (Awaiting API Documentation)

The following services have placeholder implementations ready for integration:

- 🔲 **Image Generation**: Character and scene image generation
- 🔲 **Video Generation**: I2V (Image-to-Video) animation
- 🔲 **LoRA Training**: Character consistency training
- 🔲 **TTS**: Text-to-speech for dialogue

## 🔧 Configuration

### Backend (config.yaml)

```yaml
ai_services:
  llm:
    base_url: "https://openai.qiniu.com/v1"
    api_key: "YOUR_QINIU_API_KEY_HERE"
    model: "deepseek-v3"
  # Add other service configs as APIs become available
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 API Documentation

Once backend is running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Main Endpoints

- `POST /api/parse_text` - Parse novel into scenes/characters
- `POST /api/confirm_character` - Confirm character selection
- `POST /api/continue_generation` - Continue after confirmation
- `GET /api/task_status/{project_id}` - Get progress
- `WebSocket /api/ws/{project_id}` - Real-time updates

## 🎯 Workflow

1. **Input Novel** → User enters text on home page
2. **Parse Text** → LLM extracts characters and scenes
3. **Confirm Characters** → User reviews generated character options
4. **Generate Content** → System creates keyframes and videos
5. **Preview** → User watches final animated video

## 📁 Project Structure

```
ai-animate/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── agents/         # Pipeline orchestration
│   │   ├── api/            # REST endpoints
│   │   ├── core/           # Config & context manager
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # AI service clients
│   ├── context/            # Project contexts (generated)
│   └── config.yaml.example # Configuration template
│
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # UI components
│   └── lib/               # API client & utilities
│
└── README.md              # This file
```

## 🔌 Adding New AI Services

When API documentation becomes available:

1. Update service client in `backend/app/services/`
2. Add configuration to `config.yaml`
3. Update pipeline logic in `backend/app/agents/pipeline.py`
4. Test integration
5. Update documentation

## 🤝 Contributing

This is a private project. For questions or issues, contact the project team.

## 📄 License

Copyright © 2025 AI Animate Team. All rights reserved.

## 🙏 Acknowledgments

- **Qiniu AI**: LLM API for text parsing
- **Next.js**: React framework
- **FastAPI**: Python API framework
- **shadcn/ui**: Component library
- **Tailwind CSS**: Styling framework

---

**Status**: 🟢 Core framework implemented, ready for AI service integration

For detailed setup instructions, see:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
