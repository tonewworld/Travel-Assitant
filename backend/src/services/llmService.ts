import axios from "axios";
import {
  ChatMessage,
  GenerateItineraryRequest,
  Itinerary,
  ItineraryDay,
  ItineraryDayItem
} from "../models/types";
import { config } from "../config/config";

/**
 * 将我们的 ChatMessage 转成 Moonshot/Kimi 的 messages 格式
 */
function toMoonshotMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" || m.role === "system" ? m.role : "user",
    content: m.content
  }));
}

/**
 * 通用的调用 Kimi 接口的函数
 */
async function callMoonshotChat(messages: { role: string; content: string }[]) {
  if (!config.llm.apiKey) {
    throw new Error("LLM_API_KEY 未配置，请在 backend/.env 中配置你的 Kimi API Key");
  }
  if (!config.llm.endpoint) {
    throw new Error("LLM_ENDPOINT 未配置，请在 backend/.env 中配置 Kimi 接口地址");
  }

  const resp = await axios.post(
    config.llm.endpoint,
    {
      model: config.llm.model,
      messages,
      temperature: 0.7
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.llm.apiKey}`
      },
      timeout: 30000
    }
  );

  const choice = resp.data.choices?.[0];
  const content = choice?.message?.content;
  if (!content) {
    throw new Error("大模型返回内容为空");
  }
  return content as string;
}

/**
 * 对话接口：多轮聊天
 */
export async function chatWithLLM(messages: ChatMessage[]): Promise<string> {
  // mock 模式：不调用真实接口
  if (config.llm.provider === "mock") {
    const lastUser = messages.filter((m) => m.role === "user").slice(-1)[0];
    return (
      `这是模拟的大模型回答。我理解到你的需求是：${lastUser?.content ?? ""}。\n\n` +
      `在接入真实模型后，这里会给出更详细、个性化的答复。`
    );
  }

  // 使用 Kimi 接口
  const moonshotMessages = toMoonshotMessages(messages);
  const reply = await callMoonshotChat(moonshotMessages);
  return reply;
}

/**
 * 构造“生成旅游攻略”的系统提示词
 */
function buildPromptForItinerary(req: GenerateItineraryRequest): string {
  const pref = req.userPreference;
  return [
    `你是一名专业的中文旅游规划师，擅长根据用户偏好定制行程。`,
    `请为用户生成结构化的旅游攻略 JSON。`,
    "",
    `【基础信息】`,
    `- 目的地：${req.destination}`,
    `- 行程天数：${req.days} 天`,
    req.startDate ? `- 出发时间：${req.startDate}` : "",
    req.departureCity ? `- 出发城市：${req.departureCity}` : "",
    req.theme ? `- 旅行主题：${req.theme}` : "",
    "",
    `【用户偏好】`,
    pref
      ? [
          `- 预算水平：${pref.budgetLevel ?? "中等"}`,
          `- 行程节奏：${pref.travelStyle ?? "适中"}`,
          `- 交通偏好：${pref.transportPreference ?? "公共交通优先"}`,
          `- 饮食偏好：${pref.foodPreference ?? "不限"}`,
          `- 兴趣方向：${pref.interests?.join("、") ?? "综合体验"}`
        ].join("\n")
      : "- 未提供详细偏好，可按大众游客偏好设计。",
    "",
    req.rawRequirement ? `【用户自然语言需求】\n${req.rawRequirement}` : "",
    "",
    `【输出要求】`,
    `1. 严格输出 JSON 格式，不要出现注释、额外说明、Markdown 代码块标记（如 \`\`\`json）。`,
    `2. JSON 的结构必须为：`,
    `{
  "destination": string,
  "days": number,
  "startDate": string | null,
  "theme": string | null,
  "daysDetail": [
    {
      "day": number,
      "date": string | null,
      "summary": string,
      "items": [
        {
          "timeRange": string,
          "title": string,
          "description": string,
          "poiName": string | null,
          "address": string | null,
          "transportAdvice": string | null,
          "foodAdvice": string | null
        }
      ]
    }
  ],
  "generalTips": string[],
  "transportSummary": string | null,
  "hotelSuggestions": string[] | null
}`,
    `3. 每一天安排 3-5 个主要活动（景点、用餐或休息）。`,
    `4. 注意行程节奏，不要过于紧张；老人与小孩要适当留出休息时间。`,
    `5. 尽量用中文输出。`
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * 安全解析大模型返回的 JSON 文本
 */
function safeParseItinerary(jsonText: string, fallback: Itinerary): Itinerary {
  try {
    // 有些模型会在外面包一层 ```json ```，简单去掉
    const cleaned = jsonText
      .trim()
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const obj = JSON.parse(cleaned);

    // 做一些简单的类型兜底
    const daysDetail: ItineraryDay[] = Array.isArray(obj.daysDetail)
      ? obj.daysDetail.map((d: any, idx: number) => ({
          day: typeof d.day === "number" ? d.day : idx + 1,
          date: typeof d.date === "string" ? d.date : undefined,
          summary: typeof d.summary === "string" ? d.summary : `第 ${idx + 1} 天`,
          items: Array.isArray(d.items)
            ? d.items.map((item: any): ItineraryDayItem => ({
                timeRange: String(item.timeRange ?? ""),
                title: String(item.title ?? ""),
                description: String(item.description ?? ""),
                poiName: item.poiName ? String(item.poiName) : undefined,
                address: item.address ? String(item.address) : undefined,
                transportAdvice: item.transportAdvice
                  ? String(item.transportAdvice)
                  : undefined,
                foodAdvice: item.foodAdvice ? String(item.foodAdvice) : undefined
              }))
            : []
        }))
      : fallback.daysDetail;

    const itinerary: Itinerary = {
      destination: String(obj.destination ?? fallback.destination),
      days: Number(obj.days ?? fallback.days),
      startDate:
        typeof obj.startDate === "string" ? obj.startDate : fallback.startDate,
      theme: typeof obj.theme === "string" ? obj.theme : fallback.theme,
      daysDetail,
      generalTips: Array.isArray(obj.generalTips)
        ? obj.generalTips.map((t: any) => String(t))
        : fallback.generalTips,
      transportSummary:
        typeof obj.transportSummary === "string"
          ? obj.transportSummary
          : fallback.transportSummary,
      hotelSuggestions: Array.isArray(obj.hotelSuggestions)
        ? obj.hotelSuggestions.map((h: any) => String(h))
        : fallback.hotelSuggestions
    };

    return itinerary;
  } catch (e) {
    console.error("解析大模型行程 JSON 失败，使用兜底 mock：", e);
    return fallback;
  }
}

/**
 * 用 Kimi 生成行程攻略
 */
export async function generateItineraryByLLM(
  req: GenerateItineraryRequest
): Promise<Itinerary> {
  // 兜底的 mock 行程（如果解析失败就用这个）
  const mockDaysDetail: ItineraryDay[] = Array.from(
    { length: req.days },
    (_, i) => ({
      day: i + 1,
      summary: `第 ${i + 1} 天：轻松游览${req.destination}代表性景点`,
      items: [
        {
          timeRange: "09:00 - 11:30",
          title: "城市地标打卡",
          description: `前往${req.destination}的核心地标区域，感受城市氛围。`,
          transportAdvice: "如果住宿在市中心，可以步行或地铁前往。"
        },
        {
          timeRange: "12:00 - 13:30",
          title: "特色餐厅午餐",
          description: "品尝当地特色美食，根据用户预算选择合适档次餐厅。",
          foodAdvice: "建议提前在大众点评 / 美团查看评价并预约。"
        },
        {
          timeRange: "14:30 - 17:30",
          title: "博物馆或文化景点",
          description: `选择一处具有代表性的博物馆或文化景点，了解${req.destination}的历史与人文。`,
          transportAdvice: "地铁 / 公交前往，注意查好闭馆时间。"
        },
        {
          timeRange: "19:00 - 21:00",
          title: "夜景 / 商圈漫步",
          description: "前往热门商圈或观景地，感受夜色与城市活力。"
        }
      ]
    })
  );

  const mockItinerary: Itinerary = {
    destination: req.destination,
    days: req.days,
    startDate: req.startDate,
    theme: req.theme,
    daysDetail: mockDaysDetail,
    generalTips: [
      "建议提前查询天气情况，合理安排行李与着装。",
      "热门景点尽量提前在工作日前往，错峰出行。",
      "注意合理安排作息时间，避免过度疲劳。"
    ],
    transportSummary:
      "市内推荐优先使用地铁 / 公交，短途可结合打车 / 网约车；跨城建议高铁 / 飞机。",
    hotelSuggestions: [
      "优先选择地铁站附近、交通便利的住宿区域。",
      "根据预算选择连锁酒店、精品酒店或民宿。"
    ]
  };

  // mock 模式：直接返回固定行程
  if (config.llm.provider === "mock") {
    return mockItinerary;
  }

  // 使用 Kimi 实际生成
  const systemPrompt = buildPromptForItinerary(req);
  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: "请根据以上要求，生成严格符合 JSON 结构的旅游攻略。"
    }
  ];

  try {
    const resultText = await callMoonshotChat(messages);
    const itinerary = safeParseItinerary(resultText, mockItinerary);
    return itinerary;
  } catch (e) {
    console.error("调用大模型生成行程失败，返回兜底 mock 行程：", e);
    return mockItinerary;
  }
}