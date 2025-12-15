import { ChatMessage, GenerateItineraryRequest, Itinerary } from "../models/types";
import { config } from "../config/config";

export async function chatWithLLM(
  messages: ChatMessage[]
): Promise<string> {
  if (config.llm.provider === "mock") {
    const lastUser = messages.filter(m => m.role === "user").slice(-1)[0];
    return `这是模拟的大模型回答。我理解到你的需求是：${lastUser?.content ?? ""}。\n\n` +
      `在接入真实模型后，这里会给出更详细、个性化的答复。`;
  }
  return "LLM 接口未配置，请在后端配置中完成接入。";
}

function buildPromptForItinerary(req: GenerateItineraryRequest): string {
  const pref = req.userPreference;
  return [
    `现在你是一名专业的旅游规划师，帮用户设计旅游攻略。`,
    `目的地：${req.destination}`,
    `行程天数：${req.days} 天`,
    req.startDate ? `出发时间：${req.startDate}` : "",
    req.departureCity ? `出发城市：${req.departureCity}` : "",
    req.theme ? `旅行主题：${req.theme}` : "",
    pref
      ? `用户偏好：预算=${pref.budgetLevel ?? "中等"}, 行程节奏=${pref.travelStyle ?? "适中"}, 交通偏好=${pref.transportPreference ?? "公共交通"}, 食物偏好=${pref.foodPreference ?? "不限"}, 兴趣=${pref.interests?.join("、") ?? "综合"}`
      : "",
    req.rawRequirement ? `用户自然语言描述：${req.rawRequirement}` : "",
    "",
    "请以结构化方式规划每日行程，并特别注意：",
    "1. 每天安排 3-5 个主要活动（景点 / 用餐 / 休息）。",
    "2. 给出简要交通建议（步行/公交/打车等）。",
    "3. 兼顾节奏和体验，标出每天的总结和注意事项。",
    "4. 使用适合 JSON 序列化的结构化表达（不要包含无法解析的格式）。"
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateItineraryByLLM(
  req: GenerateItineraryRequest
): Promise<Itinerary> {
  if (config.llm.provider === "mock") {
    const daysDetail = Array.from({ length: req.days }, (_, i) => ({
      day: i + 1,
      summary: `第 ${i + 1} 天：轻松游览${req.destination}代表性景点`,
      items: [
        {
          timeRange: "09:00 - 11:30",
          title: "城市地标打卡",
          description: `前往${req.destination}的核心地标区域，感受城市氛围。`,
          transportAdvice: "如果住宿在市中心，可以步行或地铁前往。",
        },
        {
          timeRange: "12:00 - 13:30",
          title: "特色餐厅午餐",
          description: "品尝当地特色美食，根据用户预算选择合适档次餐厅。",
          foodAdvice: "建议提前在大众点评/美团查看评价并预约。",
        },
        {
          timeRange: "14:30 - 17:30",
          title: "博物馆或文化景点",
          description: `选择一处具有代表性的博物馆或文化景点，了解${req.destination}的历史与人文。`,
          transportAdvice: "地铁/公交前往，注意查好闭馆时间。",
        },
        {
          timeRange: "19:00 - 21:00",
          title: "夜景/商圈漫步",
          description: "前往热门商圈或观景地，感受夜色与城市活力。",
        }
      ]
    }));

    return {
      destination: req.destination,
      days: req.days,
      startDate: req.startDate,
      theme: req.theme,
      daysDetail,
      generalTips: [
        "建议提前查询天气情况，合理安排行李与着装。",
        "热门景点尽量提前在工作日前往，错峰出行。",
        "注意合理安排作息时间，避免过度疲劳。",
      ],
      transportSummary: "市内推荐优先使用地铁/公交，短途可结合打车/网约车；跨城建议高铁/飞机。",
      hotelSuggestions: [
        "优先选择地铁站附近、交通便利的住宿区域。",
        "根据预算选择连锁酒店、精品酒店或民宿。"
      ]
    };
  }

  const prompt = buildPromptForItinerary(req);
  // TODO: 在此处调用真实 LLM，并解析结果为 Itinerary 结构
  return generateItineraryByLLM({ ...req, userPreference: req.userPreference });
}