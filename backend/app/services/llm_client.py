import httpx
from typing import Any, Dict, List, Optional
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings


class QiniuLLMClient:
    def __init__(self):
        self.config = settings.ai_services.llm
        self.base_url = self.config.base_url
        self.api_key = self.config.api_key
        self.model = self.config.model
        self.max_tokens = self.config.max_tokens
        self.timeout = self.config.timeout
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": model or self.model,
            "messages": messages,
            "max_tokens": max_tokens or self.max_tokens,
            "temperature": temperature,
            **kwargs
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
    
    async def parse_novel_to_scenes(self, novel_text: str) -> Dict[str, Any]:
        system_prompt = """你是一个专业的动漫剧本分析师。请将输入的小说文本解析为结构化的动漫场景脚本。

输出格式要求：
1. 提取所有出现的角色，包括名字和简短描述
2. 将故事拆分为多个场景，每个场景包括：
   - 场景ID（scene_01, scene_02等）
   - 场景设定（地点、时间、氛围）
   - 出现的角色列表
   - 镜头类型（push_in推进、pull_out拉远、pan平移、close_up特写、wide_shot远景等）
   - 时长（秒）
   - 角色对白（如有）

请以JSON格式输出，格式如下：
{
  "characters": {
    "角色名": {
      "description": "角色描述（外貌、性格等）"
    }
  },
  "scenes": [
    {
      "id": "scene_01",
      "setting": "场景描述",
      "characters": ["角色名"],
      "camera": {
        "type": "镜头类型",
        "duration_s": 6
      },
      "dialogue": {
        "角色名": "对白内容"
      }
    }
  ]
}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请分析以下小说文本：\n\n{novel_text}"}
        ]
        
        response = await self.chat_completion(
            messages=messages,
            temperature=0.3,
            max_tokens=4096
        )
        
        content = response["choices"][0]["message"]["content"]
        
        import json
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json.loads(json_match.group())
        else:
            raise ValueError("Failed to extract JSON from LLM response")
    
    async def generate_character_prompt(self, character_description: str) -> str:
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的AI绘画提示词生成专家。请将角色描述转换为详细的动漫风格绘画提示词（英文）。"
            },
            {
                "role": "user",
                "content": f"角色描述：{character_description}\n\n请生成适合SDXL/Niji模型的提示词，包含：画风（anime style）、角色特征、服装、表情等。只输出提示词，不要其他说明。"
            }
        ]
        
        response = await self.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=512
        )
        
        return response["choices"][0]["message"]["content"].strip()
    
    async def generate_scene_prompt(self, scene_setting: str, characters: List[str]) -> str:
        characters_str = "、".join(characters)
        
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的AI绘画提示词生成专家。请将场景描述转换为详细的动漫风格绘画提示词（英文）。"
            },
            {
                "role": "user",
                "content": f"场景设定：{scene_setting}\n出现角色：{characters_str}\n\n请生成适合SDXL/Niji模型的场景提示词，包含：画风（anime style）、场景元素、光影、氛围等。只输出提示词，不要其他说明。"
            }
        ]
        
        response = await self.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=512
        )
        
        return response["choices"][0]["message"]["content"].strip()
