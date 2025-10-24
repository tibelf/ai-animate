import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.core.config import settings


class ContextManager:
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.context_dir = Path(settings.storage.context_dir)
        self.context_file = self.context_dir / f"{project_id}.json"
        self.history_dir = self.context_dir / "history" / project_id
        
        self.context_dir.mkdir(parents=True, exist_ok=True)
        self.history_dir.mkdir(parents=True, exist_ok=True)
    
    def initialize(self, novel_text: str) -> Dict[str, Any]:
        context = {
            "meta": {
                "project_id": self.project_id,
                "version": 1,
                "created_at": datetime.utcnow().isoformat(),
                "novel_text": novel_text
            },
            "status": "parsing",
            "style": settings.project.default_style,
            "characters": {},
            "scenes": []
        }
        
        self._save_context(context)
        return context
    
    def load(self) -> Dict[str, Any]:
        if not self.context_file.exists():
            raise FileNotFoundError(f"Context file not found for project: {self.project_id}")
        
        with open(self.context_file, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def update(self, updates: Dict[str, Any], create_snapshot: bool = True) -> Dict[str, Any]:
        if create_snapshot:
            self._create_snapshot()
        
        context = self.load()
        context["meta"]["version"] += 1
        context["meta"]["updated_at"] = datetime.utcnow().isoformat()
        
        for key, value in updates.items():
            if key in context:
                if isinstance(context[key], dict) and isinstance(value, dict):
                    context[key].update(value)
                else:
                    context[key] = value
            else:
                context[key] = value
        
        self._save_context(context)
        return context
    
    def update_character(self, character_name: str, field: str, value: Any) -> Dict[str, Any]:
        context = self.load()
        
        if character_name not in context["characters"]:
            context["characters"][character_name] = {}
        
        context["characters"][character_name][field] = value
        context["meta"]["version"] += 1
        context["meta"]["updated_at"] = datetime.utcnow().isoformat()
        
        self._save_context(context)
        return context
    
    def update_scene(self, scene_id: str, field: str, value: Any) -> Dict[str, Any]:
        context = self.load()
        
        for scene in context["scenes"]:
            if scene["id"] == scene_id:
                if field == "status" or field == "error":
                    scene[field] = value
                elif field in scene.get("assets", {}):
                    if "assets" not in scene:
                        scene["assets"] = {}
                    scene["assets"][field] = value
                else:
                    scene[field] = value
                break
        
        context["meta"]["version"] += 1
        context["meta"]["updated_at"] = datetime.utcnow().isoformat()
        
        self._save_context(context)
        return context
    
    def get_character(self, character_name: str) -> Optional[Dict[str, Any]]:
        context = self.load()
        return context["characters"].get(character_name)
    
    def get_scene(self, scene_id: str) -> Optional[Dict[str, Any]]:
        context = self.load()
        for scene in context["scenes"]:
            if scene["id"] == scene_id:
                return scene
        return None
    
    def rollback(self, version: int) -> Dict[str, Any]:
        snapshot_file = self.history_dir / f"v{version}.json"
        if not snapshot_file.exists():
            raise FileNotFoundError(f"Snapshot version {version} not found")
        
        shutil.copy(snapshot_file, self.context_file)
        return self.load()
    
    def _save_context(self, context: Dict[str, Any]):
        with open(self.context_file, "w", encoding="utf-8") as f:
            json.dump(context, f, indent=2, ensure_ascii=False)
    
    def _create_snapshot(self):
        if not self.context_file.exists():
            return
        
        context = self.load()
        version = context["meta"]["version"]
        snapshot_file = self.history_dir / f"v{version}.json"
        
        shutil.copy(self.context_file, snapshot_file)
