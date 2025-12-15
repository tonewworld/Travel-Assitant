import { Router } from "express";
import { ChatMessage } from "../models/types";
import { chatWithLLM } from "../services/llmService";

const router = Router();

const sessionStore: Record<string, ChatMessage[]> = {};

router.post("/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body as {
      sessionId?: string;
      message: string;
    };

    const sid = sessionId || "default-session";

    if (!sessionStore[sid]) {
      sessionStore[sid] = [
        {
          role: "system",
          content:
            "你是一个旅游规划助手，可以帮助用户规划行程、推荐景点、结合用户偏好生成旅游攻略。",
          timestamp: Date.now()
        }
      ];
    }

    sessionStore[sid].push({
      role: "user",
      content: message,
      timestamp: Date.now()
    });

    const replyContent = await chatWithLLM(sessionStore[sid]);

    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: replyContent,
      timestamp: Date.now()
    };

    sessionStore[sid].push(assistantMsg);

    res.json({
      sessionId: sid,
      messages: sessionStore[sid]
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "服务器错误" });
  }
});

export default router;