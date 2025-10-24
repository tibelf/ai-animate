import type { Character, Scene } from '../types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class QiniuLLMClient {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private timeout: number;

  constructor() {
    this.baseUrl = process.env.QINIU_LLM_BASE_URL || 'https://openai.qiniu.com/v1';
    this.apiKey = process.env.QINIU_API_KEY || '';
    this.model = process.env.QINIU_LLM_MODEL || 'deepseek-v3';
    this.maxTokens = parseInt(process.env.QINIU_LLM_MAX_TOKENS || '4096');
    this.timeout = parseInt(process.env.QINIU_LLM_TIMEOUT || '60000');
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ChatCompletionResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const payload = {
      model: options?.model || this.model,
      messages,
      max_tokens: options?.maxTokens || this.maxTokens,
      temperature: options?.temperature ?? 0.7,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async parseNovelToScenes(novelText: string): Promise<{
    characters: Record<string, Character>;
    scenes: Scene[];
  }> {
    const systemPrompt = `你是一个专业的动漫剧本分析师。请将输入的小说文本解析为结构化的动漫场景脚本。

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
}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请分析以下小说文本：\n\n${novelText}` },
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 4096,
    });

    const content = response.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to extract JSON from LLM response');
    }
  }

  async generateCharacterPrompt(characterDescription: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的AI绘画提示词生成专家。请将角色描述转换为详细的动漫风格绘画提示词（英文）。',
      },
      {
        role: 'user',
        content: `角色描述：${characterDescription}\n\n请生成适合SDXL/Niji模型的提示词，包含：画风（anime style）、角色特征、服装、表情等。只输出提示词，不要其他说明。`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 512,
    });

    return response.choices[0].message.content.trim();
  }

  async generateScenePrompt(sceneSetting: string, characters: string[]): Promise<string> {
    const charactersStr = characters.join('、');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的AI绘画提示词生成专家。请将场景描述转换为详细的动漫风格绘画提示词（英文）。',
      },
      {
        role: 'user',
        content: `场景设定：${sceneSetting}\n出现角色：${charactersStr}\n\n请生成适合SDXL/Niji模型的场景提示词，包含：画风（anime style）、场景元素、光影、氛围等。只输出提示词，不要其他说明。`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 512,
    });

    return response.choices[0].message.content.trim();
  }
}
