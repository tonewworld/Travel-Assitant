import axios from "axios";
import { config } from "../config/config";

export async function searchPOI(keyword: string, city?: string) {
  if (!config.amap.apiKey) {
    return {
      fromCache: true,
      message: "未配置 AMAP_API_KEY，返回示例数据。",
      pois: [
        { name: `示例景点：${keyword}`, address: city ? `${city}某区某路` : "示例地址" }
      ]
    };
  }

  const params = {
    key: config.amap.apiKey,
    keywords: keyword,
    city,
    offset: 5,
    page: 1
  };

  const resp = await axios.get(`${config.amap.baseUrl}/place/text`, { params });
  return resp.data;
}