import { Router } from "express";
import { Itinerary } from "../models/types";

const router = Router();

router.post("/export/text", (req, res) => {
  const itinerary = req.body as Itinerary;

  if (!itinerary) {
    return res.status(400).json({ error: "缺少行程数据" });
  }

  const lines: string[] = [];
  lines.push(`目的地：${itinerary.destination}`);
  lines.push(`行程天数：${itinerary.days} 天`);
  if (itinerary.startDate) lines.push(`出发日期：${itinerary.startDate}`);
  if (itinerary.theme) lines.push(`旅行主题：${itinerary.theme}`);
  lines.push("");

  for (const day of itinerary.daysDetail) {
    lines.push(`第 ${day.day} 天：${day.summary}`);
    for (const item of day.items) {
      lines.push(`  - 时间：${item.timeRange}`);
      lines.push(`    活动：${item.title}`);
      lines.push(`    说明：${item.description}`);
      if (item.transportAdvice) lines.push(`    交通建议：${item.transportAdvice}`);
      if (item.foodAdvice) lines.push(`    餐饮建议：${item.foodAdvice}`);
    }
    lines.push("");
  }

  if (itinerary.generalTips?.length) {
    lines.push("通用建议：");
    itinerary.generalTips.forEach((tip, idx) => {
      lines.push(`  ${idx + 1}. ${tip}`);
    });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(lines.join("\n"));
});

export default router;