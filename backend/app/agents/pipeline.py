import uuid
from typing import Any, Dict
from app.core.context_manager import ContextManager
from app.services.llm_client import QiniuLLMClient
from app.services.image_client import ImageGenerationClient
from app.services.video_client import VideoGenerationClient
from app.services.lora_client import LoRATrainingClient
from app.services.tts_client import TTSClient


class ProjectProgress:
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.current_stage = "initializing"
        self.progress_percent = 0
        self.current_task = ""
        self.error = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "project_id": self.project_id,
            "stage": self.current_stage,
            "progress": self.progress_percent,
            "task": self.current_task,
            "error": self.error
        }


class AnimePipeline:
    def __init__(self, project_id: str = None):
        self.project_id = project_id or str(uuid.uuid4())
        self.ctx = ContextManager(self.project_id)
        
        self.llm_client = QiniuLLMClient()
        self.image_client = ImageGenerationClient()
        self.video_client = VideoGenerationClient()
        self.lora_client = LoRATrainingClient()
        self.tts_client = TTSClient()
        
        self.progress = ProjectProgress(self.project_id)
    
    async def run(self, novel_text: str) -> Dict[str, Any]:
        try:
            self.ctx.initialize(novel_text)
            
            await self._parse_text(novel_text)
            
            await self._generate_characters()
            
            return {
                "project_id": self.project_id,
                "status": "waiting_character_confirmation",
                "message": "Characters generated. Please confirm before proceeding."
            }
        
        except Exception as e:
            self.progress.error = str(e)
            self.ctx.update({"status": "failed", "error": str(e)})
            raise
    
    async def continue_after_character_confirmation(self) -> Dict[str, Any]:
        try:
            context = self.ctx.load()
            
            await self._train_loras(context)
            
            await self._generate_keyframes(context)
            
            await self._generate_videos(context)
            
            await self._concat_videos(context)
            
            self.ctx.update({"status": "completed"})
            self.progress.current_stage = "completed"
            self.progress.progress_percent = 100
            
            return {
                "project_id": self.project_id,
                "status": "completed",
                "final_video": context.get("final_video")
            }
        
        except Exception as e:
            self.progress.error = str(e)
            self.ctx.update({"status": "failed", "error": str(e)})
            raise
    
    async def _parse_text(self, novel_text: str):
        self.progress.current_stage = "parsing"
        self.progress.current_task = "Parsing novel text with LLM..."
        self.progress.progress_percent = 10
        
        result = await self.llm_client.parse_novel_to_scenes(novel_text)
        
        self.ctx.update({
            "status": "parsed",
            "characters": result["characters"],
            "scenes": result["scenes"]
        })
        
        self.progress.progress_percent = 20
    
    async def _generate_characters(self):
        self.progress.current_stage = "generating_characters"
        context = self.ctx.load()
        
        for char_name, char_data in context["characters"].items():
            self.progress.current_task = f"Generating character: {char_name}"
            
            prompt = await self.llm_client.generate_character_prompt(
                char_data["description"]
            )
            
            variants = await self.image_client.generate_character_variants(
                prompt=prompt,
                num_variants=3
            )
            
            self.ctx.update_character(char_name, "candidates", variants["candidates"])
            self.ctx.update_character(char_name, "prompt", prompt)
        
        self.progress.progress_percent = 30
    
    async def _train_loras(self, context: Dict[str, Any]):
        self.progress.current_stage = "training_loras"
        
        for char_name, char_data in context["characters"].items():
            if "selected_image" not in char_data:
                continue
            
            self.progress.current_task = f"Training LoRA for: {char_name}"
            
            training_images = [char_data["selected_image"]]
            
            result = await self.lora_client.train_lora(
                character_images=training_images,
                character_name=char_name
            )
            
            self.ctx.update_character(char_name, "lora_path", result["lora_path"])
        
        self.progress.progress_percent = 50
    
    async def _generate_keyframes(self, context: Dict[str, Any]):
        self.progress.current_stage = "generating_keyframes"
        
        prev_end_frame = None
        
        for i, scene in enumerate(context["scenes"]):
            self.progress.current_task = f"Generating keyframes for scene {i+1}/{len(context['scenes'])}"
            
            scene_prompt = await self.llm_client.generate_scene_prompt(
                scene["setting"],
                scene["characters"]
            )
            
            char_ref = None
            if scene["characters"]:
                char_name = scene["characters"][0]
                char_data = context["characters"].get(char_name, {})
                char_ref = char_data.get("lora_path") or char_data.get("selected_image")
            
            start_frame_result = await self.image_client.generate_image(
                prompt=scene_prompt + " (start)",
                character_ref=char_ref
            )
            
            end_frame_result = await self.image_client.generate_image(
                prompt=scene_prompt + " (end)",
                character_ref=prev_end_frame or char_ref
            )
            
            self.ctx.update_scene(scene["id"], "start_frame", start_frame_result["image_url"])
            self.ctx.update_scene(scene["id"], "end_frame", end_frame_result["image_url"])
            
            prev_end_frame = end_frame_result["image_url"]
        
        self.progress.progress_percent = 70
    
    async def _generate_videos(self, context: Dict[str, Any]):
        self.progress.current_stage = "generating_videos"
        
        for i, scene in enumerate(context["scenes"]):
            self.progress.current_task = f"Generating video for scene {i+1}/{len(context['scenes'])}"
            
            scene_data = self.ctx.get_scene(scene["id"])
            
            video_result = await self.video_client.generate_video(
                start_frame=scene_data["assets"]["start_frame"],
                end_frame=scene_data["assets"]["end_frame"],
                duration_seconds=scene["camera"]["duration_s"]
            )
            
            self.ctx.update_scene(scene["id"], "video_mp4", video_result["video_url"])
        
        self.progress.progress_percent = 90
    
    async def _concat_videos(self, context: Dict[str, Any]):
        self.progress.current_stage = "concatenating"
        self.progress.current_task = "Concatenating scene videos..."
        
        video_paths = []
        for scene in context["scenes"]:
            scene_data = self.ctx.get_scene(scene["id"])
            if "video_mp4" in scene_data.get("assets", {}):
                video_paths.append(scene_data["assets"]["video_mp4"])
        
        final_video_path = f"./videos/final/{self.project_id}_final.mp4"
        
        self.ctx.update({"final_video": final_video_path})
        
        self.progress.progress_percent = 95
