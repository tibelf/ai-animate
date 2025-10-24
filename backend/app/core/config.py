import yaml
from pathlib import Path
from typing import Any, Dict
from pydantic import BaseModel
from pydantic_settings import BaseSettings


class AIServiceConfig(BaseModel):
    base_url: str
    api_key: str
    timeout: int = 60
    model: str | None = None
    max_tokens: int | None = None


class AIServicesConfig(BaseModel):
    llm: AIServiceConfig
    image_generation: AIServiceConfig
    video_generation: AIServiceConfig
    lora_training: AIServiceConfig
    tts: AIServiceConfig


class ServerConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True


class StorageConfig(BaseModel):
    context_dir: str = "./context"
    assets_dir: str = "./assets"
    frames_dir: str = "./frames"
    videos_dir: str = "./videos"
    audio_dir: str = "./audio"
    logs_dir: str = "./logs"


class ProjectConfig(BaseModel):
    default_style: Dict[str, Any] = {
        "model": "SDXL_Niji6",
        "seed": 777312
    }


class Settings(BaseSettings):
    ai_services: AIServicesConfig
    server: ServerConfig
    storage: StorageConfig
    project: ProjectConfig

    @classmethod
    def load_from_yaml(cls, config_path: str = "config.yaml") -> "Settings":
        config_file = Path(config_path)
        if not config_file.exists():
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
        
        with open(config_file, "r", encoding="utf-8") as f:
            config_data = yaml.safe_load(f)
        
        return cls(**config_data)


settings = Settings.load_from_yaml()
