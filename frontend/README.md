# AI Anime Frontend (Next.js)

This is a full-stack Next.js application for AI anime generation.

## 🏗️ Architecture

This project uses Next.js 15 with:
- **Frontend**: React components with shadcn/ui
- **Backend**: Next.js API Routes (in `app/api/`)
- **State Management**: Context Manager with file-based persistence
- **AI Integration**: Qiniu LLM API and placeholder services for image/video generation

## 📁 Directory Structure

```
frontend/
├── app/
│   ├── api/                    # Backend API Routes
│   │   ├── parse-text/        # Parse novel text
│   │   ├── confirm-character/ # Confirm character selection
│   │   ├── continue-generation/ # Continue pipeline
│   │   ├── task-status/       # Get task status
│   │   ├── context/           # Get project context
│   │   └── rollback/          # Rollback to previous version
│   ├── characters/            # Character confirmation page
│   ├── scenes/                # Scene tracking page
│   ├── preview/               # Video preview page
│   └── page.tsx               # Home page (novel input)
├── components/
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── services/              # AI service clients
│   │   ├── llm-client.ts     # Qiniu LLM client
│   │   ├── image-client.ts   # Image generation (placeholder)
│   │   ├── video-client.ts   # Video generation (placeholder)
│   │   └── tts-client.ts     # TTS (placeholder)
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   └── utils/                 # Utility functions
│       ├── context-manager.ts # Project state management
│       └── pipeline.ts        # Generation pipeline
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local and add your API keys
nano .env.local
```

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint
npm run lint
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

Create a `.env.local` file with:

```env
# Qiniu LLM Configuration (Required)
QINIU_LLM_BASE_URL=https://openai.qiniu.com/v1
QINIU_API_KEY=your_qiniu_api_key_here
QINIU_LLM_MODEL=deepseek-v3
QINIU_LLM_MAX_TOKENS=4096
QINIU_LLM_TIMEOUT=60000

# Image Generation (Optional - add when available)
IMAGE_GEN_BASE_URL=
IMAGE_GEN_API_KEY=

# Video Generation (Optional - add when available)
VIDEO_GEN_BASE_URL=
VIDEO_GEN_API_KEY=

# Text-to-Speech (Optional - add when available)
TTS_BASE_URL=
TTS_API_KEY=
```

## 📚 API Routes

### `POST /api/parse-text`

Parse novel text into structured scenes and characters.

**Request:**
```json
{
  "text": "Your novel text here..."
}
```

**Response:**
```json
{
  "project_id": "uuid",
  "status": "text_parsed",
  "characters": { ... },
  "scenes": [ ... ]
}
```

### `POST /api/confirm-character`

Confirm character image selection.

**Request:**
```json
{
  "project_id": "uuid",
  "character_name": "角色名",
  "selected_image_index": 0
}
```

### `POST /api/continue-generation?project_id=uuid`

Continue generation after character confirmation.

### `GET /api/task-status/[project_id]`

Get current task status and progress.

### `GET /api/context/[project_id]`

Get full project context.

### `POST /api/rollback`

Rollback to a previous version.

**Request:**
```json
{
  "project_id": "uuid",
  "version": 1
}
```

## 🧪 Testing

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Enter novel text in the input area
4. Click "开始生成" to parse the text
5. Review generated characters and scenes
6. (Note: Full pipeline requires additional AI service APIs)

## 🔌 Adding New AI Services

When new AI service APIs become available:

1. Update the service client in `lib/services/`
2. Add environment variables to `.env.local`
3. Update `lib/utils/pipeline.ts` to use the new service
4. Test the integration

## 📦 Dependencies

- **next**: 15.0.0 - React framework
- **react**: 18.3.0 - UI library
- **@radix-ui/***: UI primitives
- **tailwindcss**: Utility-first CSS
- **zustand**: State management (if needed)
- **typescript**: Type safety

## 🛠️ Development Notes

- All backend logic is in `app/api/` using Next.js API Routes
- Context is stored in `context/[project_id]/` directory
- History snapshots are saved in `context/[project_id]/history/`
- The pipeline runs sequentially to avoid concurrency issues

## User Workflow

1. **Home Page (`/`)** - Input novel text
2. **Characters Page (`/characters`)** - Review and confirm generated characters
3. **Scenes Page (`/scenes`)** - Monitor generation progress in real-time
4. **Preview Page (`/preview`)** - View final generated video

## 📄 License

Copyright © 2025 AI Animate Team. All rights reserved.
