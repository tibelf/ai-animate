from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import Dict
from app.models.schemas import (
    ParseTextRequest,
    ParseTextResponse,
    ConfirmCharacterRequest,
    GenerateKeyframesRequest,
    GenerateVideoRequest,
    ConcatVideoRequest,
    TaskStatusResponse,
    ProjectContextResponse,
    RollbackRequest,
    ErrorResponse
)
from app.agents.pipeline import AnimePipeline
from app.core.context_manager import ContextManager


router = APIRouter(prefix="/api", tags=["anime-generation"])

active_pipelines: Dict[str, AnimePipeline] = {}


@router.post("/parse_text", response_model=ParseTextResponse)
async def parse_text(request: ParseTextRequest):
    try:
        pipeline = AnimePipeline()
        active_pipelines[pipeline.project_id] = pipeline
        
        result = await pipeline.run(request.text)
        context = pipeline.ctx.load()
        
        return ParseTextResponse(
            project_id=pipeline.project_id,
            status=context["status"],
            characters=context["characters"],
            scenes=context["scenes"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/confirm_character")
async def confirm_character(request: ConfirmCharacterRequest):
    try:
        if request.project_id not in active_pipelines:
            pipeline = AnimePipeline(project_id=request.project_id)
            active_pipelines[request.project_id] = pipeline
        else:
            pipeline = active_pipelines[request.project_id]
        
        context = pipeline.ctx.load()
        char_data = context["characters"].get(request.character_name)
        
        if not char_data:
            raise HTTPException(status_code=404, detail="Character not found")
        
        if "candidates" not in char_data:
            raise HTTPException(status_code=400, detail="No candidates available")
        
        selected_image = char_data["candidates"][request.selected_image_index]
        
        pipeline.ctx.update_character(
            request.character_name,
            "selected_image",
            selected_image
        )
        
        return {"status": "confirmed", "character": request.character_name}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/continue_generation")
async def continue_generation(project_id: str):
    try:
        if project_id not in active_pipelines:
            pipeline = AnimePipeline(project_id=project_id)
            active_pipelines[project_id] = pipeline
        else:
            pipeline = active_pipelines[project_id]
        
        result = await pipeline.continue_after_character_confirmation()
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/task_status/{project_id}", response_model=TaskStatusResponse)
async def get_task_status(project_id: str):
    try:
        if project_id in active_pipelines:
            pipeline = active_pipelines[project_id]
            return TaskStatusResponse(**pipeline.progress.to_dict())
        else:
            ctx = ContextManager(project_id)
            context = ctx.load()
            
            return TaskStatusResponse(
                project_id=project_id,
                stage=context.get("status", "unknown"),
                progress=100 if context.get("status") == "completed" else 0,
                task="",
                error=context.get("error")
            )
    
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/context/{project_id}", response_model=ProjectContextResponse)
async def get_context(project_id: str):
    try:
        ctx = ContextManager(project_id)
        context = ctx.load()
        
        return ProjectContextResponse(
            project_id=project_id,
            context=context
        )
    
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rollback")
async def rollback(request: RollbackRequest):
    try:
        ctx = ContextManager(request.project_id)
        context = ctx.rollback(request.version)
        
        return {
            "status": "rolled_back",
            "version": context["meta"]["version"]
        }
    
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/ws/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await websocket.accept()
    
    try:
        while True:
            if project_id in active_pipelines:
                pipeline = active_pipelines[project_id]
                progress_data = pipeline.progress.to_dict()
            else:
                try:
                    ctx = ContextManager(project_id)
                    context = ctx.load()
                    progress_data = {
                        "project_id": project_id,
                        "stage": context.get("status", "unknown"),
                        "progress": 100 if context.get("status") == "completed" else 0,
                        "task": "",
                        "error": context.get("error")
                    }
                except FileNotFoundError:
                    progress_data = {
                        "project_id": project_id,
                        "stage": "not_found",
                        "progress": 0,
                        "task": "",
                        "error": "Project not found"
                    }
            
            await websocket.send_json(progress_data)
            
            import asyncio
            await asyncio.sleep(2)
    
    except WebSocketDisconnect:
        pass
