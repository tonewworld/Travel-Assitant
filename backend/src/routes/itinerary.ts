import { Router } from "express";
import { GenerateItineraryRequest } from "../models/types";
import { generateItineraryByLLM } from "../services/llmService";

const router = Router();

router.post("/itinerary/generate", async (req, res) => {
  try {
    const body = req.body as GenerateItineraryRequest;

    if (!body.destination || !body.days) {
      return res.status(400).json({ error: "destination 和 days 为必填参数" });
    }

    const itinerary = await generateItineraryByLLM(body);
    res.json(itinerary);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "服务器错误" });
  }
});

export default router;