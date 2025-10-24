from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ParseTextRequest(BaseModel):
    text: str = Field(..., description="Novel text to parse")


class ParseTextResponse(BaseModel):
    project_id: str
    status: str
    characters: Dict[str, Any]
    scenes: List[Dict[str, Any]]


class ConfirmCharacterRequest(BaseModel):
    project_id: str
    character_name: str
    selected_image_index: int = Field(..., ge=0, le=2)


class GenerateKeyframesRequest(BaseModel):
    project_id: str
    scene_id: Optional[str] = None


class GenerateVideoRequest(BaseModel):
    project_id: str
    scene_id: Optional[str] = None


class ConcatVideoRequest(BaseModel):
    project_id: str


class TaskStatusResponse(BaseModel):
    project_id: str
    stage: str
    progress: int = Field(..., ge=0, le=100)
    task: str
    error: Optional[str] = None


class ProjectContextResponse(BaseModel):
    project_id: str
    context: Dict[str, Any]


class RollbackRequest(BaseModel):
    project_id: str
    version: int


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
