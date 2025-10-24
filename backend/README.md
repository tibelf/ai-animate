# AI Animate Backend

Backend API for AI Anime Generation System (Text-to-Anime Pipeline).

## Features

- ✅ FastAPI-based REST API
- ✅ WebSocket support for real-time progress updates
- ✅ Qiniu LLM integration for text parsing
- ✅ Modular architecture with pluggable AI services
- ✅ Context management with history snapshots
- ✅ Serial task execution pipeline

## Project Structure

```
backend/
├── app/
│   ├── agents/          # Pipeline and workflow orchestration
│   ├── api/             # API routes and endpoints
│   ├── core/            # Core utilities (config, context manager)
│   ├── models/          # Pydantic models and schemas
│   └── services/        # AI service clients (LLM, Image, Video, etc.)
├── context/             # Project contexts and history
├── assets/              # Generated assets (characters, LoRA)
├── frames/              # Scene keyframes
├── videos/              # Generated videos
├── audio/               # TTS audio files
├── logs/                # Application logs
├── config.yaml          # Configuration file
└── pyproject.toml       # Python dependencies
```

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install poetry
poetry install
```

### 2. Configure API Keys

Edit `config.yaml` and add your API keys:

```yaml
ai_services:
  llm:
    api_key: "YOUR_QINIU_API_KEY_HERE"
  # Add other API keys as they become available
```

### 3. Run the Server

```bash
poetry run python -m app.main
```

Or with uvicorn directly:

```bash
poetry run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Main Workflow

1. **POST /api/parse_text** - Parse novel text into scenes and characters
2. **POST /api/confirm_character** - Confirm character selection
3. **POST /api/continue_generation** - Continue generation after character confirmation
4. **GET /api/task_status/{project_id}** - Get current task status
5. **GET /api/context/{project_id}** - Get full project context
6. **POST /api/rollback** - Rollback to previous version
7. **WebSocket /api/ws/{project_id}** - Real-time progress updates

## Configuration

All AI service endpoints are configured in `config.yaml`. Currently implemented:

- ✅ **LLM (Qiniu)**: Text parsing and prompt generation
- 🔲 **Image Generation**: Placeholder - awaiting API documentation
- 🔲 **Video Generation**: Placeholder - awaiting API documentation  
- 🔲 **LoRA Training**: Placeholder - awaiting API documentation
- 🔲 **TTS**: Placeholder - awaiting API documentation

## Adding New AI Services

When API documentation is provided:

1. Update the service client in `app/services/`
2. Update configuration in `config.yaml`
3. Test the integration
4. Update this README

## Development

### Run Tests

```bash
poetry run pytest
```

### Code Formatting

```bash
poetry run black app/
poetry run ruff check app/
```

## License

Copyright © 2025 AI Animate Team
